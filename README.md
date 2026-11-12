# coffee-menu

A pixel-faithful, dependency-free **Item List** screen for a read-only Coffee Menu —
plain HTML, CSS and JavaScript (no frameworks, no build step), now rendered from
**[Eshobe CMS](https://github.com/hamidnoshady/eshobe-cms)**.

The screen is unchanged: breadcrumb bar, search + filter toolbar, table, drawer,
cart. What changed is where the rows come from. The item list is the site's
`products`; prices, dates and numbers come from the site's own currency and locale;
the empty state, sorting, the categories bar and the drawer behave exactly as before.

| Before | Now |
|--------|-----|
| 12 drinks in a JS array | `GET /api/products` through the CMS, cached server-side |
| `$2.50` | `formatPrice(price, site.store.currency, locale)` → `۲۵۰٬۰۰۰ تومان` |
| hardcoded category strings | the product's taxonomy path (`Coffee / Chocolate`) |
| fake ratings | approved `comments` of type `review` (average + count) |
| emoji tiles | the product photo when the catalogue has one, the emoji tile otherwise |

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup: breadcrumb bar, search + filter toolbar, table, drawer (unchanged) |
| `styles.css` | All styling; plus the rules that let a product photo fill a tile |
| `app.js` | Search, filters, sorting, drawer, cart — and the `/api/menu` boot |
| `server.mjs` | The theme server: screen, `/api/menu`, proxies, health, revalidation |
| `src/cms/` | CMS client, `/api/site`, and `products` → menu mapping |
| `src/lib/` | cache, money/date formatting helpers, media, shell, revalidation |
| `vendor/site-runtime/` | `@eshobe/site-runtime` (the theme contract), vendored |
| `eshobe.theme.json` | Theme manifest: build, env, design defaults, runtime settings |
| `scripts/mock-cms.mjs` | A fixture CMS for local development |
| `test/` | `node --test` suites, including the screen executed headlessly |

## Run

```bash
# Against the fixture CMS (no CMS needed) — http://localhost:3000
npm run dev:mock

# Against a real CMS
ESHOBE_CMS_URL=https://cms.example.com \
ESHOBE_API_KEY=eshobe_live_… \
ESHOBE_SITE_DOMAIN=acme.ir \
ESHOBE_REVALIDATE_SECRET=… \
npm start
```

Node 22+, no dependencies, nothing to install. `npm test` runs the suite with the
built-in test runner.

## Environment

| Variable | Source | Meaning |
|----------|--------|---------|
| `ESHOBE_CMS_URL` | platform | CMS origin. Requests keep the CMS's own `Host` when a key is set |
| `ESHOBE_API_KEY` | platform, secret | Site key — names the tenant, reads that site's content |
| `ESHOBE_SITE_ID` | platform | The site's CMS id |
| `ESHOBE_SITE_DOMAIN` | platform | Canonical customer host (used when no key is configured) |
| `ESHOBE_PUBLIC_ORIGIN` | platform | Origin this deployment is reachable at (preview ≠ production) |
| `ESHOBE_REVALIDATE_SECRET` | platform, secret | HMAC key for `POST /api/revalidate` |
| `ESHOBE_DEFAULT_LOCALE` | platform | Pins the served locale when the site serves it |
| `PORT` | platform | Defaults to `3000`, bound on `0.0.0.0` |
| `ESHOBE_CMS_TIMEOUT_MS` | optional | Upstream timeout, default `8000` |
| `ESHOBE_DEBUG` | optional | Logs an unavailable optional collection |

The tenant comes from the site key, or from `Host` when no key is set — never from a
query parameter or a body field. The key is never logged and never reaches the
browser.

## How the CMS becomes a menu

`GET /api/menu` (theme-owned, cached for 30s, last good answer kept for a day) maps
the site's catalogue onto the screen:

| Screen | CMS |
|--------|-----|
| Item name | `products.title` |
| Category + its bar | `products.terms` → the taxonomy path (`Coffee / Cappuccino`) |
| Price / Sell Price | `price` / `compareAtPrice`, integer **minor units** of `site.store.currency` |
| Status chip | `trackInventory` + `inventory` (untracked = always available) |
| Score & Rating | approved `comments` with `commentType: "review"` (latest 1000) |
| Description | `products.body` (Lexical, flattened to text) or `summary` |
| Thumbnail | `products.image` via `/api/media/file/*`, else the theme's emoji tile |
| Drawer date | `createdAt` through `formatDate` (Shamsi on `fa`) |

Details that are the contract, not a preference:

- **Money is never converted here.** A price is an integer count of the site's minor
  unit; the browser formats it with the `currency` block from `/api/menu` (code,
  minor digits, per-locale unit word). No `*10` for Toman/Rial exists in this repo.
- **Dates and numbers go through the runtime.** `formatDate` / `formatNumber` on the
  server, and the same rule in `app.js` for the amounts the cart multiplies — so a
  Persian site renders `۲۵۰٬۰۰۰ تومان`, `۱٬۲۸۴ reviews`, `۹ تیر ۱۴۰۵`.
- **Only published content renders.** A site key reads drafts, so the product read
  asks for `_status=published` and the review read for `status=approved`.
- **Media stays same-origin.** `product.image` is served through
  `/api/media/file/<file>` on this host; the proxy attaches the key and the bucket
  stays private.
- **Design tokens** (`theme`) are mapped onto the palette's own names (`--mint`,
  `--gold`, `--bg`, `--text`), so changing the brand colour in the CMS repaints the
  menu with no rebuild. With the manifest's `design` defaults nothing moves a pixel.
- **Runtime settings:** `menuTitle` (text) replaces the breadcrumb's «Menu» label.
- **Branding:** an uploaded `primaryLogo` replaces the default mark in the breadcrumb
  (rendered as `<img>`, never inlined).

## Routes

| Route | Owner | Notes |
|-------|-------|-------|
| `GET /` | theme | The screen; theme tokens and branding injected into the document |
| `GET /styles.css`, `/app.js` | theme | The original assets |
| `GET /api/menu` | theme | Products → item list (`no-store`; revalidation is the authority) |
| `GET /api/site` | CMS, proxied | Keyed, allowlisted (`proxiesApi: true`) |
| `GET /api/media/file/<file>` | CMS, proxied | Keyed, one path segment, no traversal |
| `GET /api/health[?live]` | theme | `?live` is process-only (the container check); otherwise tenant + contract |
| `POST /api/revalidate` | theme | HMAC over the raw body, then purge — answers in well under the 3s budget |
| `GET /robots.txt`, `/sitemap.xml` | theme | `Disallow: /` for a suspended site |

Everything else under `/api/*` is a 404: the CMS keeps that surface closed on customer
domains and this proxy must not reopen it. A suspended or archived site serves a
holding page (200, `noindex`), never content.

## Caching and revalidation

`/api/site` and the menu are held in memory: 30 seconds of freshness, last-good kept
for a day. The catalogue is read in one request (up to 200 products) because the
screen is one continuous list; the score is the average of up to 1000 approved
reviews, which is the same number a browser would show and one DB read. `POST /api/revalidate` verifies `x-eshobe-signature` (HMAC-SHA256 of the
exact raw body bytes — `x-eshobe-timestamp` is not signed in this v1 contract),
purges, and answers. A lost notice only costs at most the timer's 30 seconds, and a
CMS outage serves the previous menu instead of taking the storefront down.

## Deploy

```bash
docker build -t coffee-menu .
docker run --rm -p 3000:3000 -e ESHOBE_CMS_URL=… -e ESHOBE_API_KEY=… coffee-menu
```

`eshobe.theme.json` declares `buildPack: dockerfile`, `port: 3000` and
`healthCheckPath: /api/health`; the container's own check uses `/api/health?live` so
it never depends on the CMS. Register the repository as a Theme, sync the manifest,
deploy a preview, then publish.

## Not wired: checkout

The screen is a read-only menu: `افزودن به سبد خرید` and `ثبت سفارش` stay in the
browser (the cart is per page load, the order is a toast) exactly as before. Eshobe's
checkout needs buyer name/phone and one product per order, and this screen has no
form for that — wiring `POST /api/checkout` would mean adding fields the design does
not have. When that screen exists, the proxy allowlist in `src/cms/proxy.mjs` is the
one place to open, and `products.id` is already the id it expects.

## Tests

```bash
npm test
```

- `runtime.test.mjs` — money in minor units, Persian digits, Jalali dates, token validation
- `revalidate.test.mjs` — the HMAC covers the raw body only, and domain-prefixed paths
- `proxy.test.mjs` — the `/api/*` allowlist (no writes, no traversal)
- `menu.test.mjs` — products → items against the fixture CMS
- `screen.test.mjs` — `app.js` executed against a DOM stub: rows, prices, images, empty state
- `shell.test.mjs` — the document is unchanged when the site has nothing to inject

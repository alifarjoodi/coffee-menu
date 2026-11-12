/**
 * A stand-in Eshobe CMS for local development, shaped like THEME_API §4–§7.
 *
 * It is the twelve drinks the original screen shipped with, filed under the same
 * taxonomy, priced in Toman minor units and reviewed with `comments` — enough to
 * see the real rendering path (`/api/site` → keyed product read → `/api/menu`)
 * without a CMS in front of you. Never deployed; the theme only talks to
 * `ESHOBE_CMS_URL`.
 */

import http from 'node:http'

const SITE_DOMAIN = 'coffee.localhost'

const TAXONOMY = { id: 'tax-menu', key: 'menu', name: 'منوی کافه' }

const TERMS = [
  { id: 't-coffee', name: 'Coffee', slug: 'coffee', taxonomy: TAXONOMY.id, parent: null },
  { id: 't-chocolate', name: 'Chocolate', slug: 'chocolate', taxonomy: TAXONOMY.id, parent: 't-coffee' },
  { id: 't-cappuccino', name: 'Cappuccino', slug: 'cappuccino', taxonomy: TAXONOMY.id, parent: 't-coffee' },
  { id: 't-latte', name: 'Latte', slug: 'latte', taxonomy: TAXONOMY.id, parent: 't-coffee' },
  { id: 't-espresso', name: 'Espresso', slug: 'espresso', taxonomy: TAXONOMY.id, parent: 't-coffee' },
]

/** title, category term, rating, price (Toman), compare-at, stock, description. */
const DRINKS = [
  ['00000000-0000-4000-8000-000000000001', 'Choco Choco', 't-chocolate', 4.9, 250_000, 309_000, 1000, 'Double cocoa espresso with steamed milk and a dusting of dark chocolate curls. Our best seller for cold mornings.', '#CFE0F9I93'],
  ['00000000-0000-4000-8000-000000000002', 'Biscuit Cream', 't-cappuccino', 4.2, 150_000, 220_000, 0, 'Cappuccino folded with biscuit cream and a crunchy caramel crumb topping.', '#CFFE8427F1'],
  ['00000000-0000-4000-8000-000000000003', 'Sayzen Creme', 't-cappuccino', 4.7, 250_000, 310_000, 800, 'Signature house blend with vanilla creme and a soft cinnamon finish.', '#CFFE3F7SJ2'],
  ['00000000-0000-4000-8000-000000000004', 'Vanilla C Latte', 't-latte', 4.8, 250_000, 305_000, 772, 'Slow-pulled espresso, oat milk and Madagascar vanilla syrup over ice.', '#CFFE6535B4'],
  ['00000000-0000-4000-8000-000000000005', 'Banana Chiki', 't-espresso', 3.6, 150_000, 210_000, 750, 'Espresso shot with banana milk and a hint of nutmeg. Temporarily paused for the season.', '#CFFE2D4F71'],
  ['00000000-0000-4000-8000-000000000006', 'Burnt Leci Latte', 't-latte', 4.5, 250_000, 310_000, 640, 'Caramelised lychee syrup, espresso and milk with a burnt-sugar crust aroma.', '#CFFE7284J0'],
  ['00000000-0000-4000-8000-000000000007', 'Java Bali Latte', 't-latte', 4.4, 150_000, 240_000, 0, 'Single-origin Balinese beans with palm sugar and coconut milk.', '#CFFE4N9B5'],
  ['00000000-0000-4000-8000-000000000008', 'Sweet Sally', 't-espresso', 4.6, 250_000, 305_000, 999, 'Vanilla custard espresso, finished with demerara sugar and a pinch of sea salt.', '#CFEY2D047'],
  ['00000000-0000-4000-8000-000000000009', 'Hazelnut Cloud', 't-latte', 4.3, 250_000, 320_000, 420, 'Whipped hazelnut foam over a double shot, topped with toasted nut praline.', '#CFFE90KL3'],
  ['00000000-0000-4000-8000-000000000010', 'Mocha Delight', 't-chocolate', 4.7, 250_000, 315_000, 305, 'Espresso, cocoa and steamed milk with a soft marshmallow cap.', '#CFFE11MQ8'],
  ['00000000-0000-4000-8000-000000000011', 'Caramel Breeze', 't-latte', 4.1, 250_000, 310_000, 180, 'Salted caramel latte with a cool almond-milk finish. Runs out fast.', '#CFFE83PX2'],
  ['00000000-0000-4000-8000-000000000012', 'Espresso Bloom', 't-espresso', 3.9, 250_000, 300_000, 0, 'Bright floral espresso served with sparkling water. Restocking next month.', '#CFFE56RT7'],
]

const createdAtFor = (index) =>
  new Date(Date.UTC(2026, 5, 30 - index, 9, 0, 0)).toISOString()

const products = DRINKS.map(([id, title, term, , price, compareAtPrice, inventory, summary, sku], index) => ({
  id,
  _status: 'published',
  title,
  slug: String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  summary,
  sku,
  price,
  compareAtPrice,
  trackInventory: true,
  inventory,
  productType: 'simple',
  terms: [term],
  image: null,
  createdAt: createdAtFor(index),
  updatedAt: createdAtFor(index),
}))

/** Approved reviews whose average per product matches the score the screen shows. */
const reviews = []
for (const [id, title, , rating] of DRINKS) {
  const scores = [Math.max(0, rating - 0.2), rating, Math.min(5, rating + 0.1), Math.min(5, rating + 0.3)]
  scores.forEach((score, index) => {
    reviews.push({
      id: `${id}-review-${index}`,
      commentType: 'review',
      targetCollection: 'products',
      targetProduct: id,
      status: 'approved',
      rating: Math.round(score * 10) / 10,
      title: `Review ${index + 1} for ${title}`,
      submittedAt: createdAtFor(index),
    })
  })
}

export const site = {
  id: 'site-coffee',
  contractVersion: 1,
  slug: 'coffee',
  name: 'کافه میلک',
  domain: SITE_DOMAIN,
  status: 'active',
  type: 'store',
  availableLocales: ['fa', 'en'],
  defaultLocale: 'fa',
  blocks: ['content', 'productGrid', 'cta', 'gallery'],
  branding: {
    displayName: 'کافه میلک',
    displayNameFa: 'کافه میلک',
    primaryLogo: null,
    logo: null,
    compactLogo: null,
    homeLogo: null,
    favicon: null,
    socialImage: null,
  },
  media: { basePath: '/api/media/file', origin: `http://127.0.0.1:${process.env.MOCK_CMS_PORT ?? 4010}` },
  menus: { items: [], locations: [] },
  store: { currency: 'IRT', paymentProvider: 'bank' },
  theme: {
    primary: '#a9764b',
    accent: '#d9a441',
    background: '#faf5ef',
    foreground: '#3b2c22',
    radius: 'md',
    lineHeight: 1.5,
  },
  themeRuntime: { theme: { key: 'coffee-menu' }, package: { key: 'coffee-menu' }, settings: {}, bindings: {} },
}

const envelope = (docs) => ({
  docs,
  totalDocs: docs.length,
  limit: docs.length,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
})

const sendJson = (res, status, body) => {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  })
  res.end(payload)
}

const sendSvg = (res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#f4e7d4"/><g fill="none" stroke="#a9764b" stroke-width="10" stroke-linecap="round"><path d="M70 110h140v60a56 56 0 0 1-56 56h-28a56 56 0 0 1-56-56z"/><path d="M212 130h26a26 26 0 0 1 0 52h-26"/></g></svg>`
  res.writeHead(200, {
    'content-type': 'image/svg+xml',
    'content-length': Buffer.byteLength(svg),
    'cache-control': 'public, max-age=60',
  })
  res.end(svg)
}

/** `?where[_status][equals]=published` and friends are ignored: the fixtures are published. */
export function createMockCms() {
  return http.createServer((req, res) => {
    const { pathname } = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

    if (pathname === '/api/site') return sendJson(res, 200, site)
    if (pathname === '/api/products') return sendJson(res, 200, envelope(products))
    if (pathname === '/api/taxonomy-terms') return sendJson(res, 200, envelope(TERMS))
    if (pathname === '/api/comments') {
      return sendJson(res, 200, envelope(reviews))
    }
    if (pathname.startsWith('/api/media/file/')) return sendSvg(res)

    return sendJson(res, 404, { error: 'Not Found' })
  })
}

export function startMockCms(port = 4010) {
  const server = createMockCms()
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '0.0.0.0', () => resolve(server))
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.MOCK_CMS_PORT ?? 4010)
  startMockCms(port).then(() => console.log(`[mock-cms] listening on 0.0.0.0:${port}`))
}

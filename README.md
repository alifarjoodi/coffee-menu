# coffee-menu

A pixel-faithful, dependency-free **Item List** screen for a read-only Coffee Menu —
plain HTML, CSS and JavaScript (no frameworks, no build step).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup: breadcrumb bar, search + filter toolbar, table, result count, drawer |
| `styles.css` | All styling: design tokens, table, chips, popovers, drawer, responsive rules |
| `app.js` | Data + interactivity: search, filters, sorting, read-only details drawer |

## Run

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Features

- **12 menu items** rendered from a JS data array. Four visible columns: **Item Name** (with category),
  **Price & Sell Price**, **Status**, and **Score & Rating** (score out of 5, star bar and review count).
  Item ID, create date and stock stay in the data and appear in the details drawer.
- **Search** by item name, category, item ID or code — debounced, keyboard shortcut `⌘K` / `Ctrl+K` / `/`.
- **Toolbar order**: search on the left, then a right-aligned action pair — **`دسته بندی ها`** first and
  **`سبد خرید`** last, so the cart button sits at the far right edge.
- **Categories bar** (`دسته بندی ها`): floating horizontal category strip (`همه`, `Coffee / Chocolate`, `Coffee / Cappuccino`,
  `Coffee Latte`, `Coffee / Espresso`) that opens below the button and lines up with its right edge on click;
  on narrower screens it shifts just enough to stay inside the page column.
- **Sortable columns** — click Item Name, Price or Score & Rating to toggle ascending / descending.
- **Read-only user view** — menu items are frozen; no inline status editing, duplication, or modification controls.
- **Single continuous list** — all matching items are shown together without pagination.
- **Details drawer** — slides in from the right. The product **image sits at the top right** (with a little
  breathing room from the top edge) and the **name is glued to the top of the image**. The **price has no
  “قیمت” label and no box around it**: it sits a little lower and starts on the **same left edge as the
  item name**, so the two line up. The description follows underneath.
- **Add to cart** — the milky/coffee `افزودن به سبد خرید` button (and its quantity stepper) is **pinned to
  the bottom** of the drawer. Once clicked it turns into a stepper: **− · quantity · +**, in the same spot.
  The quantity is kept per item while the page is open, and stepping back to zero restores the add button.
- **Place order** — a `ثبت سفارش` button is pinned to the bottom right under the cart control (same order
  as before); it submits whatever is in the cart (toast for an empty cart, then clears the cart once the
  order is placed).
- **Empty state**, **toasts**, reduced-motion support, and keyboard/Escape handling.
- **Milk & light-coffee palette** — warm cream surfaces, latte-brown accents and golden rating stars.
- **Responsive** — rows collapse into stacked cards below 900px.

Everything is client-side and self-contained; no network requests, no fonts or images to load
(item thumbnails are emoji on soft gradients).

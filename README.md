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
- **Categories bar** (`دسته بندی ها`): floating horizontal category strip that opens to the left of the button on click (`همه`, `Coffee / Chocolate`, `Coffee / Cappuccino`, `Coffee Latte`, `Coffee / Espresso`).
- **Sortable columns** — click Item Name, Price or Score & Rating to toggle ascending / descending.
- **Read-only user view** — menu items are frozen; no inline status editing, duplication, or modification controls.
- **Single continuous list** — all matching items are shown together without pagination.
- **Details drawer** — slides in from the right. The product **image sits at the top right** (with a little
  breathing room from the top edge), the **name is beside it on the left, vertically centred on the image**,
  and the **price sits directly below the image**. The description follows underneath.
- **Add to cart** — a milky/coffee `افزودن به سبد خرید` button is pinned to the bottom of the drawer. Once
  clicked it turns into a quantity stepper: **− · quantity · +**, in the same spot. The quantity is kept
  per item while the page is open, and stepping back to zero restores the add button.
- **Empty state**, **toasts**, reduced-motion support, and keyboard/Escape handling.
- **Milk & light-coffee palette** — warm cream surfaces, latte-brown accents and golden rating stars.
- **Responsive** — rows collapse into stacked cards below 900px.

Everything is client-side and self-contained; no network requests, no fonts or images to load
(item thumbnails are emoji on soft gradients).

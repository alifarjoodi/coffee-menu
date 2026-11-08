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
- **Status filter** (`All Status`, `Available` in green, `Unavailable` in red) with live counts.
- **More Filters** popover: stock level (well stocked / low / out) plus quick sorts.
- **Sortable columns** — click Item Name, Price or Score & Rating to toggle ascending / descending.
- **Read-only user view** — menu items are frozen; no inline status editing, duplication, or modification controls.
- **Single continuous list** — all matching items are shown together without pagination.
- **Details drawer** — slides in from the right and shows the item's **image, name and description
  on top**, with the **price card below** them (the cup icon that used to sit next to the price is gone).
- **Empty state**, **toasts**, reduced-motion support, and keyboard/Escape handling.
- **Milk & light-coffee palette** — warm cream surfaces, latte-brown accents and golden rating stars.
- **Responsive** — rows collapse into stacked cards below 900px.

Everything is client-side and self-contained; no network requests, no fonts or images to load
(item thumbnails are emoji on soft gradients).

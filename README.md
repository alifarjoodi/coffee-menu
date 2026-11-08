# coffee-menu

A pixel-faithful, dependency-free rebuild of the **Item List** screen from a Coffee Menu
admin dashboard — plain HTML, CSS and JavaScript (no frameworks, no build step).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Markup: breadcrumb bar, search + filter toolbar, table, pagination, drawer |
| `styles.css` | All styling: design tokens, table, chips, popovers, drawer, responsive rules |
| `app.js` | Data + interactivity: search, filters, sorting, pagination, status changes, drawer |

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
- **Status filter** (`All Status`, `Published`, `Draft List`, `Inactive`, `Out of Stock`) with live counts.
- **Date range filter** over the create dates.
- **More Filters** popover: stock level (well stocked / low / out) plus quick sorts.
- **Sortable columns** — click Item Name, Price or Score & Rating to toggle ascending / descending.
- **Per-row status menu** — change status inline; chip, counts and toast update instantly.
- **Pagination** — 5 / 8 / 12 rows per page with a smart page list.
- **Details drawer** — slides in from the right with item meta, margin, description,
  status switcher, save and duplicate actions.
- **Empty state**, **toasts**, reduced-motion support, and keyboard/Escape handling.
- **Milk & light-coffee palette** — warm cream surfaces, latte-brown accents and golden rating stars.
- **Responsive** — rows collapse into stacked cards below 900px.

Everything is client-side and self-contained; no network requests, no fonts or images to load
(item thumbnails are emoji on soft gradients).

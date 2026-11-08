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

- **12 menu items** rendered from a JS data array (name, ID, create date, price, sell price, stock, status).
- **Search** by item name, category, item ID or code — debounced, keyboard shortcut `⌘K` / `Ctrl+K` / `/`.
- **Status filter** (`All Status`, `Published`, `Draft List`, `Inactive`, `Out of Stock`) with live counts.
- **Date range filter** over the create dates.
- **More Filters** popover: stock level (well stocked / low / out) plus quick sorts.
- **Sortable columns** — click any header to toggle ascending / descending.
- **Per-row status menu** — change status inline; chip, counts and toast update instantly.
- **Pagination** — 5 / 8 / 12 rows per page with a smart page list.
- **Details drawer** — slides in from the right with item meta, margin, description,
  status switcher, save and duplicate actions.
- **Empty state**, **toasts**, reduced-motion support, and keyboard/Escape handling.
- **Responsive** — the table collapses into stacked cards below 900px.

Everything is client-side and self-contained; no network requests, no fonts or images to load
(item thumbnails are emoji on soft gradients).

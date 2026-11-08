/* ============================================================
   Coffee Menu — Item List
   Vanilla JS: search · filters · sorting · status change ·
               details drawer
   ============================================================ */
(() => {
  "use strict";

  /* ── Data ─────────────────────────────────────────────── */
  const ITEMS = [
    { id: "itm_01", code: "#CFE0F9I93", name: "Choco Choco",      category: "Coffee / Chocolate", rating: 4.9, reviews: 1284, price: 2.50, sellPrice: 3.09, stock: 1000, status: "available", created: "2025-01-14", emoji: "🍫", tint: "#f4e7d4", desc: "Double cocoa espresso with steamed milk and a dusting of dark chocolate curls. Our best seller for cold mornings." },
    { id: "itm_02", code: "#CFFE8427F1", name: "Biscuit Cream",    category: "Coffee / Cappuccino", rating: 4.2, reviews: 356, price: 1.50, sellPrice: 2.20, stock: 918,  status: "unavailable",     created: "2025-06-04", emoji: "🍪", tint: "#f6ecd8", desc: "Cappuccino folded with biscuit cream and a crunchy caramel crumb topping." },
    { id: "itm_03", code: "#CFFE3F7SJ2", name: "Sayzen Creme",    category: "Coffee / Cappuccino", rating: 4.7, reviews: 892, price: 2.50, sellPrice: 3.10, stock: 800,  status: "available", created: "2025-02-09", emoji: "☕", tint: "#ede6dc", desc: "Signature house blend with vanilla creme and a soft cinnamon finish." },
    { id: "itm_04", code: "#CFFE6535B4", name: "Vanilla C Latte", category: "Coffee Latte", rating: 4.8, reviews: 1041,       price: 2.50, sellPrice: 3.05, stock: 772,  status: "available", created: "2025-02-21", emoji: "🥛", tint: "#f3efe4", desc: "Slow-pulled espresso, oat milk and Madagascar vanilla syrup over ice." },
    { id: "itm_05", code: "#CFFE2D4F71", name: "Banana Chiki",    category: "Coffee / Espresso", rating: 3.6, reviews: 214,  price: 1.50, sellPrice: 2.10, stock: 750,  status: "unavailable",  created: "2025-05-03", emoji: "🍌", tint: "#f8f0cf", desc: "Espresso shot with banana milk and a hint of nutmeg. Temporarily paused for the season." },
    { id: "itm_06", code: "#CFFE7284J0", name: "Burnt Leci Latte",category: "Coffee Latte", rating: 4.5, reviews: 476,       price: 2.50, sellPrice: 3.10, stock: 640,  status: "available", created: "2025-03-17", emoji: "🌰", tint: "#f0e4d8", desc: "Caramelised lychee syrup, espresso and milk with a burnt-sugar crust aroma." },
    { id: "itm_07", code: "#CFFE4N9B5",  name: "Java Bali Latte", category: "Coffee Latte", rating: 4.4, reviews: 631,       price: 1.50, sellPrice: 2.40, stock: 500,  status: "unavailable",       created: "2025-04-08", emoji: "🌿", tint: "#e4efe0", desc: "Single-origin Balinese beans with palm sugar and coconut milk." },
    { id: "itm_08", code: "#CFEY2D047",  name: "Sweet Sally",     category: "Coffee / Espresso", rating: 4.6, reviews: 738,  price: 2.50, sellPrice: 3.05, stock: 999,  status: "unavailable",       created: "2025-06-11", emoji: "🍮", tint: "#f7e8dc", desc: "Vanilla custard espresso, finished with demerara sugar and a pinch of sea salt." },
    { id: "itm_09", code: "#CFFE90KL3",  name: "Hazelnut Cloud",  category: "Coffee Latte", rating: 4.3, reviews: 289,       price: 2.50, sellPrice: 3.20, stock: 420,  status: "unavailable",     created: "2025-01-28", emoji: "🌰", tint: "#f1e6d6", desc: "Whipped hazelnut foam over a double shot, topped with toasted nut praline." },
    { id: "itm_10", code: "#CFFE11MQ8",  name: "Mocha Delight",   category: "Coffee / Chocolate", rating: 4.7, reviews: 812, price: 2.50, sellPrice: 3.15, stock: 305,  status: "available", created: "2025-03-02", emoji: "☕", tint: "#ece2d8", desc: "Espresso, cocoa and steamed milk with a soft marshmallow cap." },
    { id: "itm_11", code: "#CFFE83PX2",  name: "Caramel Breeze",  category: "Coffee Latte", rating: 4.1, reviews: 197,       price: 2.50, sellPrice: 3.10, stock: 180,  status: "available", created: "2025-05-19", emoji: "🍯", tint: "#f7eed8", desc: "Salted caramel latte with a cool almond-milk finish. Runs out fast." },
    { id: "itm_12", code: "#CFFE56RT7",  name: "Espresso Bloom",  category: "Coffee / Espresso", rating: 3.9, reviews: 143,  price: 2.50, sellPrice: 3.00, stock: 0,    status: "unavailable",  created: "2025-06-30", emoji: "🫘", tint: "#eae4dc", desc: "Bright floral espresso served with sparkling water. Restocking next month." }
  ];

  /* ── Status model ─────────────────────────────────────── */
  const STATUS = {
    available:   { label: "موجود",   cls: "available",   color: "#5c8a4e" },
    unavailable: { label: "ناموجود", cls: "unavailable", color: "#c26a55" }
  };

  const STOCK_FILTERS = {
    all:  { label: "All stock levels" },
    high: { label: "Well stocked",  test: n => n >= 500 },
    low:  { label: "Low stock (< 500)", test: n => n > 0 && n < 500 },
    out:  { label: "Out of stock", test: n => n === 0 }
  };

  const state = {
    q: "",
    status: "all",
    stock: "all",
    sortKey: null,
    sortDir: "asc",
    // working copy so status edits persist during the session
    items: ITEMS.map(item => ({ ...item }))
  };

  /* ── Helpers ──────────────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const money = n => `$${n.toFixed(2)}`;

  const fmtDate = iso => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      .replace(/ (\d{4})$/, ", $1");
  };

  const esc = str => String(str).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const icon = {
    check: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M3.4 8.4l3 3 6.2-6.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    caret: `<svg viewBox="0 0 16 16" width="13" height="13" fill="none"><path d="M4 6.2l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    arrow: `<svg viewBox="0 0 16 16" width="12" height="12" fill="none"><path d="M3.5 8h9M9 4.5L12.5 8 9 11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    close: `<svg viewBox="0 0 16 16" width="15" height="15" fill="none"><path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    search: `<svg viewBox="0 0 20 20" width="22" height="22" fill="none"><circle cx="9" cy="9" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="M13.2 13.2L17 17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
  };

  /* ── Filtering / sorting ──────────────────────────────── */
  function filtered() {
    const q = state.q.trim().toLowerCase();
    const stockRule = STOCK_FILTERS[state.stock];

    let list = state.items.filter(item => {
      if (q) {
        const hay = `${item.name} ${item.category} ${item.code} ${item.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (state.status !== "all" && item.status !== state.status) return false;
      if (stockRule.test && !stockRule.test(item.stock)) return false;
      return true;
    });

    const { sortKey, sortDir } = state;
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        let A = a[sortKey], B = b[sortKey];
        if (sortKey === "name") { A = A.toLowerCase(); B = B.toLowerCase(); }
        if (sortKey === "created") { A = Date.parse(A); B = Date.parse(B); }
        return A > B ? dir : A < B ? -dir : 0;
      });
    }
    return list;
  }

  /* ── Rating ───────────────────────────────────────────── */
  const pctOf = r => Math.max(0, Math.min(100, (r / 5) * 100)).toFixed(0) + "%";

  function ratingHTML(item) {
    const pct = pctOf(item.rating);
    return `
      <div class="rating" aria-label="Rated ${item.rating} out of 5 from ${item.reviews} reviews">
        <span class="rating__score">${item.rating.toFixed(1)}</span>
        <span class="stars" style="--pct:${pct}" aria-hidden="true">
          <span class="stars__base">★★★★★</span>
          <span class="stars__fill">★★★★★</span>
        </span>
        <span class="rating__count">${item.reviews.toLocaleString("en-US")} reviews</span>
      </div>`;
  }

  /* ── Row rendering ────────────────────────────────────── */
  function rowHTML(item) {
    const st = STATUS[item.status];
    return `
      <tr data-id="${item.id}" data-details="${item.id}" class="row" tabindex="0"
          aria-label="View details for ${esc(item.name)}">
        <td class="col-item">
          <div class="item">
            <span class="thumb" style="background:linear-gradient(160deg,#fff,${item.tint})" aria-hidden="true">${item.emoji}</span>
            <span class="item__text">
              <span class="item__name" title="${esc(item.name)}">${esc(item.name)}</span>
              <span class="item__cat">${esc(item.category)}</span>
            </span>
          </div>
        </td>
        <td class="col-price">
          <div class="price-now">${money(item.price)}</div>
          <div class="price-old">Sell Price <span>${money(item.sellPrice)}</span></div>
        </td>
        <td class="col-status">
          <div class="status-cell">
            <span class="chip chip--${st.cls}">${st.label}</span>
            <button class="status-btn" type="button" aria-haspopup="true" aria-expanded="false"
                    aria-label="Change status for ${esc(item.name)}" data-status-menu="${item.id}">${icon.caret}</button>
          </div>
        </td>
        <td class="col-rating">${ratingHTML(item)}</td>
      </tr>`;
  }

  function emptyHTML() {
    return `
      <tr><td colspan="4">
        <div class="empty">
          <div class="empty__icon">${icon.search}</div>
          <h3>No items match your filters</h3>
          <p>Try a different keyword, or reset the filters to see every item again.</p>
          <button type="button" id="resetFilters">Reset filters</button>
        </div>
      </td></tr>`;
  }

  function render() {
    const list = filtered();
    const total = list.length;
    $("#rows").innerHTML = total ? list.map(rowHTML).join("") : emptyHTML();
    $("#resultCount").innerHTML = total
      ? `Showing <b>${total}</b> ${total === 1 ? "item" : "items"}`
      : `No items found`;
    $("#topCount").textContent = total;

    // sort indicators
    document.querySelectorAll(".sort").forEach(btn => {
      const on = btn.dataset.sort === state.sortKey;
      btn.classList.toggle("is-sorted", on);
      btn.dataset.dir = on ? state.sortDir : "";
      const th = btn.closest("th");
      if (on) th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });

    // filter button feedback
    $("#statusFilterLabel").textContent = state.status === "all" ? "All Status" : STATUS[state.status].label;
    $("#statusFilter").classList.toggle("is-active", state.status !== "all");

    $("#moreFiltersDot").hidden = state.stock === "all";
    $("#moreFilters").classList.toggle("is-active", state.stock !== "all");
  }

  /* ── Popover engine ───────────────────────────────────── */
  const host = $("#popoverHost");
  let openPopover = null;
  let popAnchor = null;

  function closePopover() {
    if (openPopover) openPopover.remove();
    if (popAnchor) popAnchor.setAttribute("aria-expanded", "false");
    openPopover = null;
    popAnchor = null;
  }

  function showPopover(anchor, html, { align = "start", width } = {}) {
    const sameAnchor = popAnchor === anchor && openPopover;
    closePopover();
    if (sameAnchor) return null;

    const el = document.createElement("div");
    el.className = "popover";
    el.setAttribute("role", "menu");
    el.innerHTML = html;
    if (width) el.style.minWidth = width;
    host.appendChild(el);

    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth;
    let left = align === "end" ? r.right - w : r.left;
    left = Math.max(10, Math.min(left, window.innerWidth - w - 10));
    el.style.left = `${left + window.scrollX}px`;
    el.style.top = `${r.bottom + window.scrollY + 7}px`;

    anchor.setAttribute("aria-expanded", "true");
    openPopover = el;
    popAnchor = anchor;
    return el;
  }

  document.addEventListener("click", e => {
    if (openPopover && !openPopover.contains(e.target) && !(popAnchor && popAnchor.contains(e.target))) {
      closePopover();
    }
  });
  window.addEventListener("scroll", closePopover, true);
  window.addEventListener("resize", closePopover);

  /* ── Status menu ──────────────────────────────────────── */
  function statusMenuHTML(current, withCounts) {
    const counts = {};
    state.items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });

    return `
      <div class="popover__title">Change Status</div>
      ${Object.entries(STATUS).map(([key, s]) => `
        <button class="popover__opt" type="button" role="menuitemradio" data-set-status="${key}"
                aria-selected="${current === key}">
          <span class="dot" style="background:${s.color}"></span>
          ${s.label}
          ${withCounts ? `<span class="count">${counts[key] || 0}</span>` : `<span class="check">${icon.check}</span>`}
        </button>`).join("")}`;
  }

  function setStatus(id, key) {
    const item = state.items.find(i => i.id === id);
    if (!item || item.status === key) return;
    item.status = key;
    closePopover();
    render();
    toast(`${item.name} is now ${STATUS[key].label}`);
    if ($("#drawer").classList.contains("is-open") && $("#drawer").dataset.id === id) openDrawer(id);
  }

  /* ── Toolbar menus ────────────────────────────────────── */
  $("#statusFilter").addEventListener("click", e => {
    e.stopPropagation();
    const counts = {};
    state.items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });

    const html = `
      <div class="popover__title">Filter by status</div>
      <button class="popover__opt" type="button" data-filter-status="all" aria-selected="${state.status === "all"}">
        <span class="dot" style="background:#c8d2ce"></span> All Status
        <span class="count">${state.items.length}</span>
      </button>
      <div class="popover__sep"></div>
      ${Object.entries(STATUS).map(([key, s]) => `
        <button class="popover__opt" type="button" data-filter-status="${key}" aria-selected="${state.status === key}">
          <span class="dot" style="background:${s.color}"></span> ${s.label}
          <span class="count">${counts[key] || 0}</span>
        </button>`).join("")}`;

    const el = showPopover(e.currentTarget, html, { align: "end", width: "220px" });
    el?.querySelectorAll("[data-filter-status]").forEach(b => b.addEventListener("click", () => {
      state.status = b.dataset.filterStatus;
      closePopover();
      render();
    }));
  });

  $("#moreFilters").addEventListener("click", e => {
    e.stopPropagation();
    const html = `
      <div class="popover__title">Stock level</div>
      ${Object.entries(STOCK_FILTERS).map(([key, f]) => `
        <button class="popover__opt" type="button" data-filter-stock="${key}" aria-selected="${state.stock === key}">
          ${f.label}
          <span class="check">${icon.check}</span>
        </button>`).join("")}
      <div class="popover__sep"></div>
      <div class="popover__title">Sort</div>
      <button class="popover__opt" type="button" data-sort-quick="price" aria-selected="${state.sortKey === "price" && state.sortDir === "desc"}">
        Price: high → low <span class="check">${icon.check}</span>
      </button>`;

    const el = showPopover(e.currentTarget, html, { align: "end", width: "232px" });
    if (!el) return;
    el.querySelectorAll("[data-filter-stock]").forEach(b => b.addEventListener("click", () => {
      state.stock = b.dataset.filterStock;
      closePopover();
      render();
    }));
    el.querySelectorAll("[data-sort-quick]").forEach(b => b.addEventListener("click", () => {
      state.sortKey = b.dataset.sortQuick;
      state.sortDir = b.dataset.sortQuick === "price" ? "desc" : "asc";
      closePopover();
      render();
    }));
  });

  /* ── Table interactions ───────────────────────────────── */
  $("#rows").addEventListener("click", e => {
    const statusBtn = e.target.closest("[data-status-menu]");
    if (statusBtn) {
      e.stopPropagation();
      const id = statusBtn.dataset.statusMenu;
      const item = state.items.find(i => i.id === id);
      const el = showPopover(statusBtn, statusMenuHTML(item.status, false), { align: "start", width: "196px" });
      el?.querySelectorAll("[data-set-status]").forEach(b =>
        b.addEventListener("click", () => setStatus(id, b.dataset.setStatus)));
      return;
    }

    if (e.target.closest(".col-status")) return;

    const detailsBtn = e.target.closest("[data-details]");
    if (detailsBtn) openDrawer(detailsBtn.dataset.details);

    if (e.target.id === "resetFilters") resetFilters();
  });

  $("#rows").addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = e.target.closest("tr.row");
    if (!row || e.target.closest("button")) return;
    e.preventDefault();
    openDrawer(row.dataset.details);
  });

  document.querySelectorAll(".sort").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === "name" ? "asc" : "desc";
      }
      render();
    });
  });

  /* ── Search ───────────────────────────────────────────── */
  let searchTimer;
  $("#search").addEventListener("input", e => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchTimer = setTimeout(() => {
      state.q = v;
      render();
    }, 130);
  });

  function resetFilters() {
    Object.assign(state, { q: "", status: "all", stock: "all", sortKey: null });
    $("#search").value = "";
    render();
    toast("Filters reset");
  }

  /* ── Drawer ───────────────────────────────────────────── */
  const drawer = $("#drawer");
  const scrim = $("#scrim");
  const drawerInner = $("#drawerInner");

  function drawerHTML(item) {
    const st = STATUS[item.status];
    return `
      <div class="d-head">
        <div class="item">
          <span class="thumb" style="background:linear-gradient(160deg,#fff,${item.tint})" aria-hidden="true">${item.emoji}</span>
          <div>
            <div class="d-title">${esc(item.name)}</div>
            <div class="d-sub">${esc(item.category)} · ${esc(item.code)}</div>
          </div>
        </div>
        <button class="d-close" type="button" id="drawerClose" aria-label="Close details">${icon.close}</button>
      </div>

      <div class="d-section">
        <div class="d-section__title">Score &amp; rating</div>
        <div class="rating rating--lg">${ratingHTML(item).replace('class="rating', 'class="rating rating--lg')}</div>
      </div>

      <div class="d-section">
        <div class="d-section__title">Current status</div>
        <div class="status-cell"><span class="chip chip--${st.cls}">${st.label}</span></div>
      </div>

      <div class="d-section">
        <div class="d-section__title">Item details</div>
        <dl class="d-grid">
          <div><dt>Item ID</dt><dd class="mono">${esc(item.code)}</dd></div>
          <div><dt>Created</dt><dd>${fmtDate(item.created)}</dd></div>
          <div><dt>Price</dt><dd>${money(item.price)}</dd></div>
          <div><dt>Sell price</dt><dd>${money(item.sellPrice)}</dd></div>
          <div><dt>Stock</dt><dd>${item.stock.toLocaleString("en-US")} pcs</dd></div>
          <div><dt>Margin</dt><dd>${Math.round((1 - item.price / item.sellPrice) * 100)}%</dd></div>
        </dl>
      </div>

      <div class="d-section">
        <div class="d-section__title">Description</div>
        <p class="d-desc">${esc(item.desc)}</p>
      </div>

      <div class="d-section">
        <div class="d-section__title">Change status</div>
        <div class="d-status-list">
          ${Object.entries(STATUS).map(([key, s]) => `
            <button type="button" data-drawer-status="${key}" class="${key === item.status ? "is-on" : ""}">
              <span class="dot" style="background:${s.color}"></span>${s.label}
            </button>`).join("")}
        </div>
      </div>

      <div class="d-actions">
        <button class="btn btn--primary" type="button" id="drawerSave">Save changes</button>
        <button class="btn btn--ghost" type="button" id="drawerDuplicate">Duplicate</button>
      </div>`;
  }

  function openDrawer(id) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    closePopover();
    drawer.dataset.id = id;
    drawerInner.innerHTML = drawerHTML(item);

    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    document.body.style.overflow = "hidden";
    $("#drawerClose").focus({ preventScroll: true });

    $("#drawerClose").addEventListener("click", closeDrawer);
    drawerInner.querySelectorAll("[data-drawer-status]").forEach(b =>
      b.addEventListener("click", () => {
        item.status = b.dataset.drawerStatus;
        openDrawer(id);
        render();
      }));
    $("#drawerSave").addEventListener("click", () => {
      toast(`${item.name} saved`);
      closeDrawer();
    });
    $("#drawerDuplicate").addEventListener("click", () => {
      const copy = { ...item, id: `itm_${Date.now()}`, code: `#CF${Math.random().toString(36).slice(2, 8).toUpperCase()}`, status: "unavailable", name: `${item.name} Copy`, created: new Date().toISOString().slice(0, 10) };
      state.items.unshift(copy);
      render();
      toast(`Duplicated “${item.name}” as ${STATUS.unavailable.label}`);
      openDrawer(copy.id);
    });
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    document.body.style.overflow = "";
  }

  scrim.addEventListener("click", closeDrawer);

  /* ── Toasts ───────────────────────────────────────────── */
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${icon.check}<span>${esc(msg)}</span>`;
    $("#toasts").appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 220);
    }, 2400);
  }

  /* ── Keyboard ─────────────────────────────────────────── */
  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      $("#search").focus();
      $("#search").select();
    } else if (e.key === "/" && !typing) {
      e.preventDefault();
      $("#search").focus();
    } else if (e.key === "Escape") {
      if (drawer.classList.contains("is-open")) closeDrawer();
      closePopover();
      if (document.activeElement === $("#search")) $("#search").blur();
    }
  });

  /* ── Boot ─────────────────────────────────────────────── */
  render();
})();

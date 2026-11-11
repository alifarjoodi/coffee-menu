/* ============================================================
   Coffee Menu — Item List
   Vanilla JS: search · filters · sorting · details drawer
   ============================================================ */
(() => {
  "use strict";

  /* ── Data ─────────────────────────────────────────────── */
  const ITEMS = Object.freeze([
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
  ].map(item => Object.freeze(item)));

  /* ── Status model ─────────────────────────────────────── */
  const STATUS = Object.freeze({
    available:   Object.freeze({ label: "موجود",   cls: "available",   color: "#5c8a4e" }),
    unavailable: Object.freeze({ label: "ناموجود", cls: "unavailable", color: "#c26a55" })
  });

  const CATEGORIES = Object.freeze([
    { id: "all", label: "همه", dir: "rtl" },
    ...[...new Set(ITEMS.map(item => item.category))].map(cat => ({
      id: cat,
      label: cat,
      dir: "ltr"
    }))
  ]);

  const state = {
    q: "",
    category: "all",
    sortKey: null,
    sortDir: "asc"
  };

  /* ── Helpers ──────────────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const money = n => `$${n.toFixed(2)}`;

  const esc = str => String(str).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const icon = {
    check: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M3.4 8.4l3 3 6.2-6.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    close: `<svg viewBox="0 0 16 16" width="15" height="15" fill="none"><path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    search: `<svg viewBox="0 0 20 20" width="22" height="22" fill="none"><circle cx="9" cy="9" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="M13.2 13.2L17 17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
  };

  /* ── Filtering / sorting ──────────────────────────────── */
  function filtered() {
    const q = state.q.trim().toLowerCase();

    let list = ITEMS.filter(item => {
      if (state.category !== "all" && item.category !== state.category) return false;
      if (q) {
        const hay = `${item.name} ${item.category} ${item.code} ${item.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
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

    // sort indicators
    document.querySelectorAll(".sort").forEach(btn => {
      const on = btn.dataset.sort === state.sortKey;
      btn.classList.toggle("is-sorted", on);
      btn.dataset.dir = on ? state.sortDir : "";
      const th = btn.closest("th");
      if (on) th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });

    $("#moreFiltersDot").hidden = state.category === "all";
    $("#moreFilters").classList.toggle("is-active", state.category !== "all");
  }

  /* ── Popover engine ───────────────────────────────────── */
  const host = $("#popoverHost");
  let openPopover = null;
  let popAnchor = null;

  function closePopover({ restoreFocus = false } = {}) {
    const anchor = popAnchor;
    if (openPopover) openPopover.remove();
    if (anchor) anchor.setAttribute("aria-expanded", "false");
    openPopover = null;
    popAnchor = null;
    if (restoreFocus && anchor) anchor.focus({ preventScroll: true });
  }

  function showPopover(anchor, html, { align = "start", placement = "bottom", className = "", width } = {}) {
    const sameAnchor = popAnchor === anchor && openPopover;
    closePopover();
    if (sameAnchor) return null;

    const el = document.createElement("div");
    el.className = className ? `popover ${className}` : "popover";
    el.setAttribute("role", "menu");
    el.innerHTML = html;
    if (width) el.style.minWidth = width;
    host.appendChild(el);

    const r = anchor.getBoundingClientRect();
    const edgePad = 10;

    if (placement === "left") {
      const gap = 8;
      const availableLeft = r.left - gap - edgePad;
      if (availableLeft >= 140) {
        el.style.maxWidth = `${Math.floor(availableLeft)}px`;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const left = Math.max(edgePad, r.left - gap - w);
        const top = Math.max(edgePad, r.top + (r.height - h) / 2);
        el.style.left = `${left + window.scrollX}px`;
        el.style.top = `${top + window.scrollY}px`;
      } else {
        el.classList.add("popover--bar-below");
        el.style.maxWidth = `${Math.max(120, window.innerWidth - edgePad * 2)}px`;
        const w = el.offsetWidth;
        const left = Math.max(edgePad, Math.min(r.right - w, window.innerWidth - w - edgePad));
        el.style.left = `${left + window.scrollX}px`;
        el.style.top = `${r.bottom + window.scrollY + 7}px`;
      }
    } else {
      const w = el.offsetWidth;
      let left = align === "end" ? r.right - w : r.left;
      left = Math.max(edgePad, Math.min(left, window.innerWidth - w - edgePad));
      el.style.left = `${left + window.scrollX}px`;
      el.style.top = `${r.bottom + window.scrollY + 7}px`;
    }

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
  window.addEventListener("scroll", e => {
    if (openPopover && openPopover.contains(e.target)) return;
    closePopover();
  }, true);
  window.addEventListener("resize", () => closePopover());

  /* ── Toolbar menus ────────────────────────────────────── */
  $("#moreFilters").addEventListener("click", e => {
    e.stopPropagation();
    const html = CATEGORIES.map(c => {
      const active = state.category === c.id;
      return `<button class="bar__opt" type="button" role="menuitemradio" data-filter-category="${esc(c.id)}" dir="${c.dir}" aria-checked="${active}" aria-selected="${active}">${esc(c.label)}</button>`;
    }).join("");

    const el = showPopover(e.currentTarget, html, { placement: "left", className: "popover--bar" });
    if (!el) return;

    const opts = [...el.querySelectorAll("[data-filter-category]")];
    if (e.detail === 0) {
      const current = opts.find(b => b.getAttribute("aria-selected") === "true") || opts[0];
      if (current) current.focus({ preventScroll: true });
    }

    opts.forEach((b, idx) => {
      b.addEventListener("click", ev => {
        state.category = b.dataset.filterCategory;
        closePopover({ restoreFocus: ev.detail === 0 });
        render();
      });
      b.addEventListener("keydown", ev => {
        if (ev.key === "ArrowLeft") {
          ev.preventDefault();
          opts[(idx + 1) % opts.length].focus();
        } else if (ev.key === "ArrowRight") {
          ev.preventDefault();
          opts[(idx - 1 + opts.length) % opts.length].focus();
        } else if (ev.key === "Home") {
          ev.preventDefault();
          opts[0].focus();
        } else if (ev.key === "End") {
          ev.preventDefault();
          opts[opts.length - 1].focus();
        }
      });
    });
  });

  /* ── Table interactions ───────────────────────────────── */
  $("#rows").addEventListener("click", e => {
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
    Object.assign(state, { q: "", category: "all", sortKey: null });
    $("#search").value = "";
    render();
    toast("Filters reset");
  }

  /* ── Drawer ───────────────────────────────────────────── */
  const drawer = $("#drawer");
  const scrim = $("#scrim");
  const drawerInner = $("#drawerInner");

  /* ── Cart quantities (kept while the page is open) ────── */
  const cart = new Map(); // itemId -> quantity
  const cartQty = id => cart.get(id) || 0;

  const iconPlus = `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="M10 4.4v11.2M4.4 10h11.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`;
  const iconMinus = `<svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true"><path d="M4.4 10h11.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`;
  const iconBag = `<svg viewBox="0 0 20 20" width="17" height="17" fill="none" aria-hidden="true"><path d="M2.7 3.4h1.9l1.6 8.3h8.1l1.5-6.1H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.7" cy="15.3" r="1.25" fill="currentColor"/><circle cx="13.9" cy="15.3" r="1.25" fill="currentColor"/></svg>`;

  /* Bottom control: “افزودن به سبد خرید” — once clicked it turns into a
     stepper (minus · quantity · plus) sitting in the same spot. */
  function cartControlHTML(item) {
    const qty = cartQty(item.id);
    if (!qty) {
      return `
        <button class="d-add" type="button" data-cart-add="${item.id}">
          ${iconBag}<span>افزودن به سبد خرید</span>
        </button>`;
    }
    return `
      <div class="d-qty" role="group" aria-label="تعداد ${esc(item.name)}">
        <button class="d-qty__btn" type="button" data-cart-step="-1" aria-label="کاهش تعداد">${iconMinus}</button>
        <span class="d-qty__value" aria-live="polite">${qty}</span>
        <button class="d-qty__btn" type="button" data-cart-step="1" aria-label="افزایش تعداد">${iconPlus}</button>
      </div>`;
  }

  /* Drawer layout: product image on the top right (with a little breathing room
     from the top edge), the name glued to the top of the image, the price —
     without its “قیمت” label and without its box — sitting a little lower,
     lined up on the left edge with the item name, the description below it,
     and the «افزودن به سبد خرید» + «ثبت سفارش» stack glued to the bottom of
     the panel, in that order. */
  function drawerHTML(item) {
    return `
      <div class="d-head">
        <button class="d-close" type="button" id="drawerClose" aria-label="Close details">${icon.close}</button>
      </div>

      <div class="d-top">
        <div class="d-figure">
          <div class="d-thumb" style="background:linear-gradient(160deg,#fffdf8,${item.tint})" aria-hidden="true">${item.emoji}</div>
        </div>

        <div class="d-summary">
          <h2 class="d-name">${esc(item.name)}</h2>
          <span class="d-cat">${esc(item.category)}</span>
          <div class="d-price">
            <span class="d-price__value">${money(item.price)}</span>
          </div>
        </div>
      </div>

      <p class="d-desc">${esc(item.desc)}</p>

      <div class="d-cta">
        <div class="d-actions" id="cartActions">${cartControlHTML(item)}</div>
        <button class="d-submit" type="button" id="submitOrder">ثبت سفارش</button>
      </div>`;
  }

  /* Re-render only the bottom control, so the stepper appears/disappears in place. */
  function refreshCart({ focusSel = null } = {}) {
    const item = ITEMS.find(i => i.id === drawer.dataset.id);
    const wrap = $("#cartActions");
    if (!item || !wrap) return;

    wrap.innerHTML = cartControlHTML(item);
    wrap.classList.remove("is-swap");
    void wrap.offsetWidth; // restart the pop animation
    wrap.classList.add("is-swap");

    if (focusSel) {
      const target = wrap.querySelector(focusSel) || wrap.querySelector("button");
      if (target) target.focus({ preventScroll: true });
    }
  }

  function openDrawer(id) {
    const item = ITEMS.find(i => i.id === id);
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
  }

  /* «ثبت سفارش» — places the order with whatever is in the cart, then resets it. */
  function submitOrder() {
    const total = [...cart.values()].reduce((sum, n) => sum + n, 0);
    if (!total) {
      toast("سبد خرید خالی است");
      return;
    }
    cart.clear();
    refreshCart();
    toast(total === 1 ? "سفارش ثبت شد" : `سفارش با ${total} آیتم ثبت شد`);
  }

  /* Cart interactions inside the drawer (delegated: innerHTML is re-rendered). */
  drawerInner.addEventListener("click", e => {
    if (e.target.closest("#submitOrder")) {
      submitOrder();
      return;
    }

    const add = e.target.closest("[data-cart-add]");
    if (add) {
      cart.set(add.dataset.cartAdd, 1);
      refreshCart({ focusSel: "[data-cart-step='1']" });
      toast("به سبد خرید اضافه شد");
      return;
    }

    const stepBtn = e.target.closest("[data-cart-step]");
    if (!stepBtn) return;

    const id = drawer.dataset.id;
    const step = Number(stepBtn.dataset.cartStep);
    const next = Math.max(0, cartQty(id) + step);

    if (next === 0) cart.delete(id);
    else cart.set(id, next);

    refreshCart({ focusSel: step > 0 ? "[data-cart-step='1']" : "[data-cart-step='-1']" });
  });

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
      if (openPopover) closePopover({ restoreFocus: openPopover.contains(document.activeElement) });
      if (document.activeElement === $("#search")) $("#search").blur();
    }
  });

  /* ── Boot ─────────────────────────────────────────────── */
  render();
})();

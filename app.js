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

    $("#moreFiltersDot").hidden = state.category === "all" || !!$(`#${CAT_BAR_ID}`);
    $("#moreFilters").classList.toggle("is-active", state.category !== "all");
  }

  /* ── Popover engine ───────────────────────────────────── */
  const host = $("#popoverHost");
  let openPopover = null;
  let popAnchor = null;

  function closePopover({ restoreFocus = false, animate = true } = {}) {
    const anchor = popAnchor;
    const el = openPopover;
    openPopover = null;
    popAnchor = null;
    if (anchor) anchor.setAttribute("aria-expanded", "false");
    if (restoreFocus && anchor) anchor.focus({ preventScroll: true });
    if (!el) return;
    if (!animate) { el.remove(); return; }
    // Short exit animation, then take the panel out of the DOM.
    el.classList.add("is-closing");
    setTimeout(() => el.remove(), 150);
  }

  function showPopover(anchor, html, { align = "start", placement = "bottom", className = "", role = "menu", width, label = "" } = {}) {
    const sameAnchor = popAnchor === anchor && openPopover;
    closePopover({ animate: !sameAnchor });
    if (sameAnchor) return null;

    // Drop any panel still playing its exit animation, so a quick re-open never
    // leaves two of them stacked.
    host.querySelectorAll(".is-closing").forEach(n => n.remove());

    const el = document.createElement("div");
    el.className = className ? `popover ${className}` : "popover";
    el.setAttribute("role", role);
    if (label) el.setAttribute("aria-label", label);
    el.innerHTML = html;
    if (width) el.style.minWidth = width;
    // Measure at natural size first (CSS animates opacity/transform only, so the
    // offsetWidth here is final), then fit it into the viewport and place it.
    el.style.visibility = "hidden";
    host.appendChild(el);

    const r = anchor.getBoundingClientRect();
    const edgePad = 10;
    const gap = 8;

    if (placement === "inline") {
      /* Open a one-line bar under the button. The bar never stacks or wraps:
         everything stays on the same line, so instead of growing past the
         screen it is capped to the viewport and the line scrolls sideways.
         It hugs the button's right edge (the bar reads RTL) and the notch is
         pointed at the middle of the button. */
      const avail = window.innerWidth - edgePad * 2;
      el.style.maxWidth = `${Math.floor(avail)}px`;

      const w = Math.min(el.offsetWidth, avail);
      const h = el.offsetHeight;
      let left = Math.max(edgePad, Math.min(r.right - w, window.innerWidth - w - edgePad));
      el.style.left = `${Math.round(left + window.scrollX)}px`;

      const roomBelow = window.innerHeight - r.bottom - gap - edgePad;
      if (roomBelow >= h) {
        el.style.top = `${Math.round(r.bottom + gap + window.scrollY)}px`;
      } else {
        // Only when the bottom of the screen is cramped: same line, above.
        el.classList.add("popover--above");
        el.style.top = `${Math.round(Math.max(edgePad, r.top - gap - h) + window.scrollY)}px`;
      }
      el.style.setProperty("--caret-x",
        `${Math.round(Math.max(18, Math.min(r.left + r.width / 2 - left, w - 18)))}px`);
    } else {
      const w = el.offsetWidth;
      let left = align === "end" ? r.right - w : r.left;
      left = Math.max(edgePad, Math.min(left, window.innerWidth - w - edgePad));
      el.style.left = `${left + window.scrollX}px`;
      el.style.top = `${r.bottom + window.scrollY + 7}px`;
    }

    el.style.visibility = "";
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
  /* «دسته بندی ها» — the categories open *in place* on one straight line: the
     button itself disappears and the chip bar takes over that very spot in the
     toolbar, so the categories appear exactly where the button was instead of
     in a floating panel under it. A «×» chip (it reads RTL, so it sits at the
     right end where the button was) closes the bar and brings the button back.
     The line never wraps: on a narrow screen it scrolls sideways. */
  const CAT_BAR_ID = "catBar";

  const categoryChipHTML = () => CATEGORIES.map(c => {
    const active = state.category === c.id;
    return `<button class="cat__opt" type="button" data-filter-category="${esc(c.id)}" aria-pressed="${active}">
        <span class="cat__check" aria-hidden="true">${icon.check}</span>
        <span class="cat__label">${esc(c.label)}</span>
      </button>`;
  }).join("");

  function openCategoryBar() {
    const btn = $("#moreFilters");
    // An open bar is already showing the categories; a bar that is still on
    // its way out is dropped so the slot can be filled again cleanly.
    const existing = $(`#${CAT_BAR_ID}`);
    if (existing) {
      if (!existing.classList.contains("is-closing")) return;
      existing.remove();
    }

    const bar = document.createElement("div");
    bar.id = CAT_BAR_ID;
    bar.className = "catbar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "دسته بندی ها");
    bar.setAttribute("dir", "rtl");
    bar.innerHTML = `
      <div class="catbar__scrollwrap">
        <div class="catbar__list">${categoryChipHTML()}</div>
        <div class="catbar__scrollbar" aria-hidden="true"><div class="catbar__thumb"></div></div>
      </div>
      <button class="catbar__close" type="button" data-cat-close aria-label="بستن دسته بندی ها" title="بستن">
        ${icon.close}
      </button>`;

    // The button steps aside and the bar takes its slot in the toolbar.
    const from = btn.getBoundingClientRect();
    btn.hidden = true;
    btn.setAttribute("aria-expanded", "true");
    btn.after(bar);

    // FLIP: draw the bar at the button's old size for one frame, then let it
    // settle — the categories grow out of the button that just vanished. The
    // bar is right-aligned in the row exactly like the button, so their right
    // edges match and only a scale is needed.
    bar.dataset.btnW = String(Math.round(from.width));
    bar.dataset.btnH = String(Math.round(from.height));
    const to = bar.getBoundingClientRect();
    bar.style.transition = "none";
    bar.style.transformOrigin = "top right";
    bar.style.transform =
      `scale(${from.width / to.width}, ${from.height / to.height})`;
    bar.style.opacity = "0";
    void bar.offsetWidth;
    bar.style.transition = "";
    bar.style.transform = "";
    bar.style.opacity = "";
    requestAnimationFrame(() => bar.classList.add("is-ready"));

    const opts = [...bar.querySelectorAll("[data-filter-category]")];
    const closeBtn = bar.querySelector("[data-cat-close]");

    // Focus walks along the line, so keep the touched chip inside the bar.
    const focusOpt = el => {
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    };

    // The button has just gone away, so focus moves into the bar — onto the
    // current category, which is also scrolled into view.
    const current = opts.find(b => b.getAttribute("aria-pressed") === "true") || opts[0];
    if (current) {
      current.focus({ preventScroll: true });
      current.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    // On a phone (or when there are many categories) the line scrolls
    // sideways: while there is still something hidden on the left (the end
    // the line runs on towards in RTL), that end fades out so the extra
    // chips are discoverable — and a custom scroller sits below the chips,
    // but only when the line actually overflows.
    const list = bar.querySelector(".catbar__list");
    const scrollbar = bar.querySelector(".catbar__scrollbar");
    const thumb = bar.querySelector(".catbar__thumb");

    // RTL scrollLeft is negative in Chrome/Firefox (0 at the right edge,
    // growing more negative scrolling left) but positive in older Safari —
    // detect the sign once so the thumb math works in both.
    let rtlSign = -1;
    if (list.scrollWidth > list.clientWidth) {
      const prev = list.scrollLeft;
      list.scrollLeft = 1;
      if (list.scrollLeft === 1) rtlSign = 1;
      list.scrollLeft = prev;
    }
    const getProgress = () => {
      const max = list.scrollWidth - list.clientWidth;
      if (max <= 0) return 0;
      return Math.max(0, Math.min(1, Math.abs(list.scrollLeft) / max));
    };
    const setProgress = p => {
      const max = list.scrollWidth - list.clientWidth;
      if (max <= 0) return;
      list.scrollLeft = rtlSign * Math.max(0, Math.min(1, p)) * max;
    };

    const updateScrollbar = () => {
      const max = list.scrollWidth - list.clientWidth;
      const hasOverflow = max > 1;
      bar.classList.toggle("has-overflow", hasOverflow);
      bar.classList.toggle("has-more", hasOverflow && Math.abs(list.scrollLeft) < max - 1);
      if (!hasOverflow) return;
      const trackW = scrollbar.clientWidth;
      const thumbW = Math.max(28, Math.round((list.clientWidth / list.scrollWidth) * trackW));
      thumb.style.width = `${thumbW}px`;
      const maxOffset = Math.max(0, trackW - thumbW);
      // RTL: progress 0 pins the thumb to the right edge, 1 to the left.
      thumb.style.right = `${Math.round(getProgress() * maxOffset)}px`;
    };
    updateScrollbar();
    list.addEventListener("scroll", updateScrollbar, { passive: true });
    if ("ResizeObserver" in window) {
      bar._catbarRO = new ResizeObserver(() => updateScrollbar());
      bar._catbarRO.observe(list);
    }

    // Drag the thumb (or click the track) to scroll the line.
    let drag = null;
    thumb.addEventListener("pointerdown", e => {
      if (list.scrollWidth - list.clientWidth <= 0) return;
      e.preventDefault();
      thumb.setPointerCapture(e.pointerId);
      drag = { startX: e.clientX, startProgress: getProgress() };
      list.style.scrollBehavior = "auto";
      thumb.classList.add("is-dragging");
    });
    thumb.addEventListener("pointermove", e => {
      if (!drag) return;
      const maxOffset = Math.max(1, scrollbar.clientWidth - thumb.offsetWidth);
      // RTL: dragging left (dx < 0) moves towards the end → progress grows.
      setProgress(drag.startProgress - (e.clientX - drag.startX) / maxOffset);
    });
    const endDrag = e => {
      if (!drag) return;
      drag = null;
      list.style.scrollBehavior = "";
      thumb.classList.remove("is-dragging");
      try { thumb.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    };
    thumb.addEventListener("pointerup", endDrag);
    thumb.addEventListener("pointercancel", endDrag);
    scrollbar.addEventListener("pointerdown", e => {
      if (e.target === thumb) return;
      const rect = scrollbar.getBoundingClientRect();
      // RTL: right edge is progress 0, left edge is progress 1.
      setProgress(1 - (e.clientX - rect.left) / rect.width);
    });

    closeBtn.addEventListener("click", () => closeCategoryBar({ restoreFocus: true }));

    opts.forEach((b, idx) => {
      b.addEventListener("click", ev => {
        state.category = b.dataset.filterCategory;
        closeCategoryBar({ restoreFocus: ev.detail === 0 });
        render();
      });
      b.addEventListener("keydown", ev => {
        // One line, so the line is walked sideways — and in RTL «next» sits to
        // the left of «previous».
        if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") {
          ev.preventDefault();
          focusOpt(opts[(idx + 1) % opts.length]);
        } else if (ev.key === "ArrowRight" || ev.key === "ArrowUp") {
          ev.preventDefault();
          focusOpt(opts[(idx - 1 + opts.length) % opts.length]);
        } else if (ev.key === "Home") {
          ev.preventDefault();
          focusOpt(opts[0]);
        } else if (ev.key === "End") {
          ev.preventDefault();
          focusOpt(opts[opts.length - 1]);
        }
      });
    });
  }

  /* Closing hands the slot back to the button: the bar fades while it narrows
     to the button's width, then the button takes over — the toolbar glides
     rather than jumping. */
  function closeCategoryBar({ restoreFocus = false } = {}) {
    const bar = $(`#${CAT_BAR_ID}`);
    const btn = $("#moreFilters");
    if (!bar || bar.classList.contains("is-closing")) return;
    // If focus is somewhere inside the bar, it has to land back on the button
    // once the bar is gone — otherwise it would fall back to the page body.
    if (bar.contains(document.activeElement)) restoreFocus = true;

    bar.classList.remove("is-ready");
    bar.classList.add("is-closing");

    // The slot goes back to the button straight away (it fades in), while the
    // bar shrinks into it — a glide, not a jump.
    btn.hidden = false;
    btn.setAttribute("aria-expanded", "false");

    const box = bar.getBoundingClientRect();
    const w = Number(bar.dataset.btnW) || 42;
    const h = Number(bar.dataset.btnH) || 42;
    // …and collapse back into the button's corner of the row.
    bar.style.transformOrigin = "top right";
    bar.style.transform = `scale(${w / box.width}, ${h / box.height})`;
    bar.style.opacity = "0";

    if (restoreFocus) btn.focus({ preventScroll: true });
    setTimeout(() => {
      // Stop observing — the bar (and its list) is going away.
      if (bar._catbarRO) bar._catbarRO.disconnect();
      bar.remove();
      // The button is back for good now — repaint its badge/active state.
      render();
    }, 190);
  }

  $("#moreFilters").addEventListener("click", () => openCategoryBar());
  // A click anywhere outside the bar puts the button back.
  document.addEventListener("click", e => {
    if (!e.target.closest(`#${CAT_BAR_ID}`) && !e.target.closest("#moreFilters")) closeCategoryBar();
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
    closeCategoryBar();
    Object.assign(state, { q: "", category: "all", sortKey: null });
    $("#search").value = "";
    render();
    toast("Filters reset");
  }

  /* ── Drawer ───────────────────────────────────────────── */
  const drawer = $("#drawer");
  const scrim = $("#scrim");
  const drawerInner = $("#drawerInner");

  /* ── Cart offcanvas (slides in from the right) ────────── */
  const cartButton = $("#cartButton");
  const cartCountEl = $("#cartCount");
  const cartPanel = $("#cartOffcanvas");
  const cartScrim = $("#cartScrim");
  const cartInner = $("#cartInner");

  /* ── Cart quantities (kept while the page is open) ────── */
  const cart = new Map(); // itemId -> quantity
  const cartQty = id => cart.get(id) || 0;
  const cartTotalQty = () => [...cart.values()].reduce((sum, n) => sum + n, 0);

  function cartLines() {
    return [...cart.entries()]
      .map(([id, qty]) => ({ item: ITEMS.find(i => i.id === id), qty }))
      .filter(line => line.item);
  }

  /* Toolbar badge — total quantity, with a little bump on every change. */
  function updateCartBadge() {
    const n = cartTotalQty();
    cartCountEl.textContent = n > 99 ? "+99" : String(n);
    cartCountEl.hidden = n === 0;
    cartButton.setAttribute("aria-label", n ? `سبد خرید، ${n} آیتم` : "سبد خرید");
    if (n) {
      cartCountEl.classList.remove("is-bump");
      void cartCountEl.offsetWidth; // restart the bump animation
      cartCountEl.classList.add("is-bump");
    }
  }

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

  /* Drawer layout: a full-width product image, then the title and price below
     it, the description after them, and the «افزودن به سبد خرید» + «ثبت سفارش»
     stack glued to the bottom of the panel, in that order. */
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
        </div>
      </div>

      <div class="d-price">
        <span class="d-price__value">${money(item.price)}</span>
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
    closeCategoryBar();
    if (cartPanel.classList.contains("is-open")) closeCartPanel();
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
    const total = cartTotalQty();
    if (!total) {
      toast("سبد خرید خالی است");
      return;
    }
    cart.clear();
    refreshCart();
    updateCartBadge();
    if (cartPanel.classList.contains("is-open")) renderCartPanel();
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
      updateCartBadge();
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
    updateCartBadge();
  });

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    if (!cartPanel.classList.contains("is-open")) document.body.style.overflow = "";
  }

  scrim.addEventListener("click", closeDrawer);

  /* ── Cart offcanvas ───────────────────────────────────── */
  /* Shows everything purchased so far: one line per item with a compact
     stepper, the running total, and «ثبت سفارش» pinned to the bottom. */
  function cartLineHTML({ item, qty }) {
    return `
      <div class="oc-item">
        <span class="oc-item__thumb" style="background:linear-gradient(160deg,#fff,${item.tint})" aria-hidden="true">${item.emoji}</span>
        <span class="oc-item__info">
          <span class="oc-item__name" title="${esc(item.name)}">${esc(item.name)}</span>
          <span class="oc-item__meta" dir="ltr">${money(item.price)} × ${qty}</span>
        </span>
        <span class="oc-item__side">
          <span class="oc-item__total" dir="ltr">${money(item.price * qty)}</span>
          <span class="oc-qty" role="group" aria-label="تعداد ${esc(item.name)}">
            <button class="oc-qty__btn" type="button" data-oc-step="-1" data-id="${item.id}" aria-label="کاهش تعداد">${iconMinus}</button>
            <span class="oc-qty__value">${qty}</span>
            <button class="oc-qty__btn" type="button" data-oc-step="1" data-id="${item.id}" aria-label="افزایش تعداد">${iconPlus}</button>
          </span>
        </span>
      </div>`;
  }

  function cartPanelHTML() {
    const lines = cartLines();
    const head = `
      <div class="oc-head">
        <h2 class="oc-title">سبد خرید</h2>
        ${lines.length ? `<span class="oc-head__count">${cartTotalQty()} آیتم</span>` : ""}
        <button class="oc-close" type="button" data-cart-close aria-label="بستن سبد خرید">${icon.close}</button>
      </div>`;

    if (!lines.length) {
      return `${head}
        <div class="oc-body">
          <div class="oc-empty">
            <span class="oc-empty__icon" aria-hidden="true">${iconBag}</span>
            <h3>سبد خرید خالی است</h3>
            <p>روی هر آیتم کلیک کنید و با «افزودن به سبد خرید» آن را به اینجا اضافه کنید.</p>
          </div>
        </div>`;
    }

    const total = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
    return `${head}
      <div class="oc-body">${lines.map(cartLineHTML).join("")}</div>
      <footer class="oc-foot">
        <div class="oc-total">
          <span class="oc-total__label">مجموع</span>
          <span class="oc-total__value" dir="ltr">${money(total)}</span>
        </div>
        <button class="d-submit" type="button" id="cartSubmit">ثبت سفارش</button>
      </footer>`;
  }

  function renderCartPanel() {
    cartInner.innerHTML = cartPanelHTML();
  }

  function openCartPanel() {
    closePopover();
    closeCategoryBar();
    if (drawer.classList.contains("is-open")) closeDrawer();
    renderCartPanel();
    cartPanel.classList.add("is-open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartScrim.hidden = false;
    document.body.style.overflow = "hidden";
    cartButton.setAttribute("aria-expanded", "true");
    const closeBtn = cartInner.querySelector("[data-cart-close]");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeCartPanel({ restoreFocus = false } = {}) {
    if (!cartPanel.classList.contains("is-open")) return;
    cartPanel.classList.remove("is-open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartScrim.hidden = true;
    cartButton.setAttribute("aria-expanded", "false");
    if (!drawer.classList.contains("is-open")) document.body.style.overflow = "";
    if (restoreFocus) cartButton.focus({ preventScroll: true });
  }

  cartButton.addEventListener("click", () => {
    if (cartPanel.classList.contains("is-open")) closeCartPanel({ restoreFocus: true });
    else openCartPanel();
  });

  cartScrim.addEventListener("click", () => closeCartPanel({ restoreFocus: true }));

  /* Cart interactions inside the offcanvas (delegated: innerHTML is re-rendered). */
  cartInner.addEventListener("click", e => {
    if (e.target.closest("[data-cart-close]")) {
      closeCartPanel({ restoreFocus: true });
      return;
    }

    if (e.target.closest("#cartSubmit")) {
      submitOrder();
      return;
    }

    const stepBtn = e.target.closest("[data-oc-step]");
    if (!stepBtn) return;

    const id = stepBtn.dataset.id;
    const step = Number(stepBtn.dataset.ocStep);
    const next = Math.max(0, cartQty(id) + step);

    if (next === 0) cart.delete(id);
    else cart.set(id, next);

    updateCartBadge();
    renderCartPanel();

    /* Re-focus the same stepper button (or the close button once the line
       disappears), because the panel was just re-rendered. */
    const focusTarget = next > 0
      ? cartInner.querySelector(`[data-oc-step="${step}"][data-id="${id}"]`)
      : cartInner.querySelector("[data-cart-close]");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  });

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
      if ($(`#${CAT_BAR_ID}`)) closeCategoryBar({ restoreFocus: true });
      if (drawer.classList.contains("is-open")) closeDrawer();
      if (cartPanel.classList.contains("is-open")) closeCartPanel({ restoreFocus: true });
      if (openPopover) closePopover({ restoreFocus: openPopover.contains(document.activeElement) });
      if (document.activeElement === $("#search")) $("#search").blur();
    }
  });

  /* ── Boot ─────────────────────────────────────────────── */
  render();
  updateCartBadge();
})();

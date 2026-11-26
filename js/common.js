/* ------------------------------------------------------------------
   Shared by every page: helpers, header/menu, contact details,
   map, reveal animations and the car card.
------------------------------------------------------------------ */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const S = window.SITE;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Formatting ---------- */
  const trim0 = (s) => s.replace(/\.?0+$/, "");
  const priceShort = (n) => !n ? "Contact for price"
    : n >= 1e7 ? `৳ ${trim0((n / 1e7).toFixed(2))} Cr` : `৳ ${trim0((n / 1e5).toFixed(1))} Lac`;
  const priceFull = (n) => n ? `BDT ${n.toLocaleString("en-IN")}` : "Contact for price";
  const waMsg = (txt) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(txt)}`;
  const carUrl = (c) => `car.html?id=${encodeURIComponent(c.id)}`;
  const waCar = (c) => waMsg(`Hi ${S.name}, I'm interested in the ${c.year} ${c.name}. Is it available?`);

  /* ---------- Images ----------
     A gallery entry is either a slug (photo with 800/1600 versions)
     or a direct path (studio cut-outs, interiors). */
  const isSlug = (g) => !g.includes("/");
  const isCut = (g) => /cutouts\/|-exterior\.webp$/.test(g);
  function img(g, { alt = "", cls = "", sizes = "(max-width: 600px) 82vw, (max-width: 1100px) 34vw, 25vw", eager = false } = {}) {
    const classes = [cls, isCut(g) ? "is-cut" : ""].filter(Boolean).join(" ");
    const common = `${classes ? ` class="${classes}"` : ""} alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async"`;
    if (isSlug(g)) {
      const b = `assets/img/cars/web/${g}`;
      return `<img src="${b}-800.webp" srcset="${b}-800.webp 800w, ${b}-1600.webp 1600w" sizes="${sizes}"${common}>`;
    }
    return `<img src="${g}"${common}>`;
  }

  /* ---------- Car card (home rail + "suggested for you") ---------- */
  function carCard(c) {
    const g = c.gallery || [];
    // Hover swap only between full photos: a transparent cut-out would
    // fade in on top of the cover photo and show two cars at once.
    const cover = g.find((x) => !isCut(x)) || g[0];
    const hover = g.find((x) => x !== cover && !isCut(x));
    return `
      <article class="car">
        <a class="car__link" href="${carUrl(c)}" aria-label="${esc(`${c.year} ${c.name}, view details`)}">
          <div class="car__img">
            ${cover ? img(cover, { alt: `${c.year} ${c.name}` }) : ""}
            ${hover ? img(hover, { cls: "alt" }) : ""}
            <span class="badge">${c.status}</span>
            ${g.length > 1 ? `<span class="car__count">${g.length} photos</span>` : ""}
          </div>
          <div class="car__body">
            <p class="car__year">${c.year}</p>
            <h3>${esc(c.name)}</h3>
            <p class="car__specs">${esc(c.card || "")}</p>
          </div>
        </a>
        <div class="car__foot">
          <b>${priceShort(c.price)}</b>
          <a class="btn btn--sm btn--gold" target="_blank" rel="noopener" href="${waCar(c)}">Enquire</a>
        </div>
      </article>`;
  }

  /* ---------- Contact details ---------- */
  $$("[data-wa]").forEach((a) => { a.href = waMsg(`Hello ${S.name}, I'd like to know more about your cars.`); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-tel]").forEach((a) => { a.href = `tel:${S.phoneTel}`; if (!a.textContent.trim()) a.textContent = S.phoneDisplay; });
  $$("[data-fb]").forEach((a) => (a.href = S.facebook));
  $$("[data-address]").forEach((el) => (el.textContent = S.address));
  $$("[data-address-note]").forEach((el) => (el.textContent = S.addressNote || ""));
  $$("[data-email]").forEach((a) => { a.href = `mailto:${S.email}`; a.textContent = S.email; });
  $$("[data-hours]").forEach((el) => (el.textContent = S.hours));
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  $$("[data-map]").forEach((a) => (a.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.mapQuery)}`));
  const mapFrame = $("[data-map-embed]");
  if (mapFrame) { // load the map only when it scrolls near view
    new IntersectionObserver(([e], o) => {
      if (e.isIntersecting) { mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(S.mapQuery)}&z=16&output=embed`; o.disconnect(); }
    }, { rootMargin: "400px" }).observe(mapFrame);
  }
  $$("[data-wa-car]").forEach((a) => {
    a.href = waMsg(`Hi ${S.name}, I'm interested in the ${a.dataset.waCar}. Is it available?`);
    a.target = "_blank"; a.rel = "noopener";
  });

  /* ---------- Header + drawer ---------- */
  const nav = $("#nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-solid", scrollY > 40 || document.body.classList.contains("page-solid"));
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  const burger = $(".nav__burger"), drawer = $("#drawer");
  if (burger && drawer) {
    const setDrawer = (open) => {
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("drawer-open", open);
      if (open) drawer.hidden = false;
      else setTimeout(() => { if (!document.body.classList.contains("drawer-open")) drawer.hidden = true; }, 350);
    };
    burger.addEventListener("click", () => setDrawer(burger.getAttribute("aria-expanded") !== "true"));
    $$("a", drawer).forEach((a) => a.addEventListener("click", () => setDrawer(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });
  }

  /* ---------- Reveal + counters ---------- */
  function countUp(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = end.toLocaleString() + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = v.toLocaleString() + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
    const n = e.target.querySelector("[data-count]");
    if (n) countUp(n);
  }), { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  const observeReveals = (root = document) => $$(".reveal:not(.in)", root).forEach((el) => io.observe(el));
  observeReveals();

  window.MS = { $, $$, S, esc, reduceMotion, priceShort, priceFull, waMsg, waCar, carUrl, img, isCut, carCard, observeReveals };
})();

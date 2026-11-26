/* ------------------------------------------------------------------
   Product page: car.html?id=<car id>
------------------------------------------------------------------ */
(() => {
  "use strict";
  const { $, $$, S, esc, priceFull, priceShort, waMsg, waCar, img, isCut, carCard, observeReveals } = window.MS;
  const root = $("#car");
  const id = new URLSearchParams(location.search).get("id");
  const car = window.CARS.find((c) => c.id === id);

  if (!car) {
    root.innerHTML = `
      <div class="pd__missing">
        <h1>We couldn't find that car</h1>
        <p>It may have been sold already. Browse what's in the showroom now, or ask us to source one for you.</p>
        <div class="pd__ctas"><a class="btn btn--gold" href="./#inventory">Browse inventory</a><a class="btn btn--ghost" data-wa-x href="${waMsg(`Hello ${S.name}, I'm looking for a car.`)}" target="_blank" rel="noopener">Ask on WhatsApp</a></div>
      </div>`;
    return;
  }

  const title = `${car.year} ${car.name}`;
  document.title = `${title} | MS-CAR`;
  $('meta[name="description"]').setAttribute("content", `${title}, ${car.status.toLowerCase()}, ${priceShort(car.price)}. ${car.intro}`.slice(0, 300));
  $("#crumbName").textContent = car.name;

  const QUICK = { mileage: "Mileage", engine: "Engine", fuel: "Fuel", power: "Power", reg: "Registered", body: "Body" };
  const gallery = car.gallery || [];
  const negotiable = car.negotiable ? `<small>${esc(car.negotiableNote || "Negotiable")}</small>` : "";
  const features = Object.entries(car.features || {}).filter(([, list]) => list.length);

  root.innerHTML = `
    <div class="pd__top">
      <div class="gallery">
        <div class="gallery__main" tabindex="0" aria-label="Open photo viewer" role="button">
          <div class="gallery__stage"></div>
          ${gallery.length > 1 ? `
            <button class="gallery__nav gallery__nav--prev" type="button" aria-label="Previous photo">‹</button>
            <button class="gallery__nav gallery__nav--next" type="button" aria-label="Next photo">›</button>
            <span class="gallery__count"></span>` : ""}
          <span class="badge">${car.status}</span>
        </div>
        ${gallery.length > 1 ? `<div class="gallery__thumbs" role="tablist" aria-label="Photos">
          ${gallery.map((g, i) => `<button type="button" class="gallery__thumb${isCut(g) ? " is-cut-wrap" : ""}" role="tab" aria-label="Photo ${i + 1}" data-i="${i}">${img(g, { sizes: "160px" })}</button>`).join("")}
        </div>` : ""}
      </div>

      <aside class="pd__info">
        <p class="pd__meta">${car.year} · ${car.status}</p>
        <h1>${esc(car.name)}</h1>
        <p class="pd__price">${priceFull(car.price)} ${negotiable}</p>
        <dl class="pd__quick">
          ${Object.entries(car.quick || {}).map(([k, v]) => `<div><dt>${QUICK[k] || k}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>
        <div class="pd__ctas">
          <a class="btn btn--gold" href="${waCar(car)}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
          <a class="btn btn--ghost" href="tel:${S.phoneTel}">Call ${S.phoneDisplay}</a>
        </div>
        <div class="pd__actions">
          <a class="link" href="${waMsg(`Hi ${S.name}, I'd like to book a test drive of the ${title}.`)}" target="_blank" rel="noopener">Book a test drive →</a>
          <button class="link pd__share" type="button">Share this car</button>
        </div>
        <div class="pd__help">
          <h3>Need help making a choice?</h3>
          <p>Our sales team will help you choose the right car for your needs, budget and taste. ${esc(S.financing)}.</p>
          <a class="link" href="${waMsg(`Hello ${S.name}, I need help choosing a car.`)}" target="_blank" rel="noopener">Text us on WhatsApp →</a>
        </div>
      </aside>
    </div>

    <section class="pd__section reveal">
      <h2>Specification</h2>
      <dl class="spec">
        ${Object.entries(car.specs || {}).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
      </dl>
    </section>

    <section class="pd__section reveal">
      <h2>Description</h2>
      <p class="pd__intro">${esc(car.intro)}</p>
      ${(car.notes || []).length ? `<ul class="pd__notes">${car.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
      ${features.length ? `<div class="feat">${features.map(([group, list]) => `
        <div class="feat__group"><h3>${esc(group)}</h3><ul>${list.map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>`).join("")}</div>` : ""}
    </section>

    <section class="pd__section">
      <div class="section__head"><h2 class="reveal">Suggested for you</h2><a class="link" href="./#inventory">View all cars →</a></div>
      <div class="pd__related"></div>
    </section>`;

  /* ---------- Gallery ---------- */
  const stage = $(".gallery__stage", root), count = $(".gallery__count", root), thumbs = $$(".gallery__thumb", root);
  let at = 0;
  function show(i) {
    at = (i + gallery.length) % gallery.length;
    const g = gallery[at];
    stage.classList.toggle("is-cut-wrap", isCut(g));
    stage.innerHTML = img(g, { alt: `${title}, photo ${at + 1} of ${gallery.length}`, sizes: "(max-width: 1000px) 100vw, 62vw", eager: true });
    if (count) count.textContent = `${at + 1} / ${gallery.length}`;
    thumbs.forEach((t, k) => { t.classList.toggle("is-active", k === at); t.setAttribute("aria-selected", k === at); });
    if (lb.open) lbShow();
  }
  $(".gallery__nav--prev", root)?.addEventListener("click", (e) => { e.stopPropagation(); show(at - 1); });
  $(".gallery__nav--next", root)?.addEventListener("click", (e) => { e.stopPropagation(); show(at + 1); });
  thumbs.forEach((t) => t.addEventListener("click", () => show(+t.dataset.i)));

  // swipe on touch screens
  let x0 = null;
  stage.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") x0 = e.clientX; });
  stage.addEventListener("pointerup", (e) => {
    if (x0 === null) return; const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40 && gallery.length > 1) show(at + (dx < 0 ? 1 : -1));
  });

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $(".lightbox__img", lb), lbCount = $(".lightbox__count", lb);
  function lbShow() {
    const g = gallery[at];
    lbImg.classList.toggle("is-cut-wrap", isCut(g));
    lbImg.innerHTML = img(g, { alt: `${title}, photo ${at + 1}`, sizes: "100vw", eager: true });
    lbCount.textContent = `${at + 1} / ${gallery.length}`;
  }
  const openLb = () => { if (typeof lb.showModal !== "function") return; lbShow(); lb.showModal(); };
  const main = $(".gallery__main", root);
  main.addEventListener("click", openLb);
  main.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); } });
  $(".lightbox__close", lb).addEventListener("click", () => lb.close());
  $(".lightbox__nav--prev", lb).addEventListener("click", () => show(at - 1));
  $(".lightbox__nav--next", lb).addEventListener("click", () => show(at + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  [$(".lightbox__nav--prev", lb), $(".lightbox__nav--next", lb)].forEach((b) => (b.hidden = gallery.length < 2));
  addEventListener("keydown", (e) => {
    if (gallery.length < 2) return;
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });
  show(0);

  /* ---------- Share ---------- */
  const shareBtn = $(".pd__share", root);
  shareBtn.addEventListener("click", async () => {
    const data = { title: `${title} | MS-CAR`, text: `${title}: ${priceShort(car.price)}`, url: location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(location.href);
      shareBtn.textContent = "Link copied ✓";
    } catch (_) {
      shareBtn.textContent = "Copy the address bar link";
    }
    setTimeout(() => (shareBtn.textContent = "Share this car"), 2500);
  });

  /* ---------- Suggested ---------- */
  const others = window.CARS.filter((c) => c.id !== car.id)
    .map((c) => ({ c, score: (c.status === car.status ? 2 : 0) + (c.make === car.make ? 1 : 0) + Math.random() * 0.5 }))
    .sort((a, b) => b.score - a.score).slice(0, 3).map((o) => o.c);
  $(".pd__related", root).innerHTML = others.map(carCard).join("");

  observeReveals(root);
})();

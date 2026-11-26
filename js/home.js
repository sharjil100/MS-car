/* ------------------------------------------------------------------
   Home page: hero video, inventory rail, categories, brand marquee,
   interior reveal, spotlight reel, social grid.
------------------------------------------------------------------ */
(() => {
  "use strict";
  const { $, $$, S, reduceMotion, carCard } = window.MS;

  /* ================================================================
     HERO VIDEO: adaptive, buffer-proof
     1. The poster image paints immediately (slow Ken Burns zoom).
     2. A tier is chosen from screen shape/size + network quality.
        Save-Data or 2G -> poster only; the video is never fetched.
     3. The chosen file (1–3 MB) is downloaded COMPLETELY (stored in
        the Cache API for repeat visits) and only then played from
        memory. A loop playing from memory never buffers.
     4. If the download is too slow, the poster stays and the next
        tier down is tried, so a half-loaded video never shows.
  ================================================================ */
  const hero = $("#hero");
  const video = $(".hero__video", hero);
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};

  const available = (hero.dataset.tiers || "1080,720,480,mobile").split(",");
  function tiers() { return wanted().filter((t) => available.includes(t)); }
  function wanted() {
    if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "")) return [];
    const portrait = innerHeight > innerWidth * 1.05;
    if (portrait) return ["portrait", "480"];                // 720x1280 crop of the same convoy video
    const px = innerWidth * Math.min(devicePixelRatio || 1, 2);
    const slow = conn.effectiveType === "3g" || (conn.downlink && conn.downlink < 1.5);
    if (slow || px < 1100) return ["720", "480"];
    return ["1080", "720", "480"];
  }

  const ext = video.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4";
  // Bump this whenever the video files are re-encoded
  const CACHE = "ms-hero-v3";
  try {
    caches.keys().then((keys) => keys
      .filter((k) => k.startsWith("ms-hero-") && k !== CACHE)
      .forEach((k) => caches.delete(k))).catch(() => {});
  } catch (_) {}

  async function fetchWithTimeout(url, ms) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctl.signal });
      if (!res.ok) throw new Error(res.status);
      return await res.blob();
    } finally { clearTimeout(t); }
  }

  async function loadBlob(url, ms) {
    let cache = null;
    try { cache = await caches.open(CACHE); } catch (_) {}
    if (cache) {
      const hit = await cache.match(url).catch(() => null);
      if (hit) return hit.blob();
    }
    const blob = await fetchWithTimeout(url, ms);
    if (cache) cache.put(url, new Response(blob, { headers: { "Content-Type": blob.type } })).catch(() => {});
    return blob;
  }

  // If a device claims WebM support but can't actually decode the file,
  // switch once to the MP4 (H.264) version, which every phone can play.
  function onFailSwitchToMp4(v, mp4Url, play) {
    let switched = false;
    v.addEventListener("error", () => {
      if (switched) return; switched = true;
      v.src = mp4Url; play();
    });
  }

  function playFrom(src, mp4Url) {
    if (mp4Url) onFailSwitchToMp4(video, mp4Url, () => video.play().catch(() => {}));
    video.src = src;
    video.addEventListener("playing", () => hero.classList.add("has-video"), { once: true });
    const p = video.play();
    if (p) p.catch(() => {}); // autoplay refused: the poster remains
  }

  async function startHeroVideo() {
    const base = hero.dataset.videoBase;
    const list = tiers();
    if (!list.length) return; // poster-only mode
    if (location.protocol === "file:") return playFrom(`${base}-${list[0]}.${ext}`); // file:// cannot fetch()
    for (const tier of list) {
      const url = `${base}-${tier}.${ext}`;
      const budget = tier === list[0] ? 9000 : 12000; // generous for the best tier
      try { return playFrom(URL.createObjectURL(await loadBlob(url, budget)), `${base}-${tier}.mp4`); }
      catch (_) { /* too slow or missing: try the next tier */ }
    }
  }

  // Pause when off-screen or tab hidden (saves battery/CPU)
  let heroVisible = true;
  const syncPlayback = () => {
    if (!video.src) return;
    if (heroVisible && !document.hidden) video.play().catch(() => {});
    else video.pause();
  };
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; document.body.classList.toggle("in-hero", heroVisible); syncPlayback(); }, { threshold: 0.05 }).observe(hero);
  document.addEventListener("visibilitychange", syncPlayback);

  if (!reduceMotion) {
    const kick = () => startHeroVideo();
    if (document.readyState === "complete") setTimeout(kick, 100);
    else addEventListener("load", () => setTimeout(kick, 100), { once: true });
  }

  /* ================= Inventory rail ================= */
  const track = $("#cars");
  // quick-search state (set from the hero search bar)
  const search = { make: "", budget: "" };
  const BUDGETS = { "u1": [0, 1e7], "1-2.5": [1e7, 2.5e7], "o2.5": [2.5e7, Infinity] };
  const budgetOk = (c, b) => !b || (c.price > 0 && c.price >= BUDGETS[b][0] && c.price < BUDGETS[b][1]);
  const matches = (c, status, make, budget) =>
    (!status || status === "all" || c.status === status) && (!make || c.make === make) && budgetOk(c, budget);
  function renderCars(filter = "all") {
    const list = window.CARS.filter((c) => matches(c, filter, search.make, search.budget));
    const searching = search.make || search.budget;
    track.innerHTML = list.length ? list.map(carCard).join("")
      : `<p class="rail__empty">${searching ? "Nothing in the showroom matches that right now." : `No ${filter.toLowerCase()} cars listed right now.`} <a data-wa href="#">Ask us on WhatsApp</a>: we can source one for you.</p>`;
    $$("[data-wa]", track).forEach((a) => { a.href = window.MS.waMsg(`Hello ${S.name}, I'm looking for a ${[filter === "all" ? "" : filter.toLowerCase(), search.make].filter(Boolean).join(" ") || "luxury"} car.`); a.target = "_blank"; });
    track.scrollTo({ left: 0 });
    updateRailBtns();
  }
  $$(".chip").forEach((b) => b.addEventListener("click", () => {
    $$(".chip").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", x === b); });
    renderCars(b.dataset.filter);
  }));
  $$("[data-jump]").forEach((a) => a.addEventListener("click", () => {
    const chip = $(`.chip[data-filter="${a.dataset.jump}"]`);
    if (chip) chip.click();
  }));

  /* ================= Hero quick search + info strip ================= */
  const hs = $("#heroSearch"), note = $("#searchNote");
  const activeChip = () => $(".chip.is-active")?.dataset.filter || "all";
  function showNote() {
    const bits = [search.make, search.budget && $(`option[value="${search.budget}"]`, hs).textContent];
    note.hidden = !bits.some(Boolean);
    note.innerHTML = note.hidden ? "" : `Showing <b>${bits.filter(Boolean).map(window.MS.esc).join(" &middot; ")}</b> <button type="button">Clear &times;</button>`;
    $("button", note)?.addEventListener("click", () => {
      search.make = search.budget = ""; hs.reset(); updateCount(); showNote(); renderCars(activeChip());
    });
  }
  function updateCount() {
    const f = hs.elements, n = window.CARS.filter((c) => matches(c, f.condition.value, f.make.value, f.budget.value)).length;
    $(".hs__count", hs).textContent = n ? `Show ${n} car${n > 1 ? "s" : ""}` : "Ask us to source it";
  }
  if (hs) {
    const makes = [...new Set(window.CARS.map((c) => c.make))].sort();
    makes.forEach((m) => hs.elements.make.add(new Option(m, m)));
    hs.addEventListener("change", updateCount);
    updateCount();
    hs.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = hs.elements;
      search.make = f.make.value; search.budget = f.budget.value;
      const chip = $(`.chip[data-filter="${f.condition.value || "all"}"]`);
      chip.click();
      showNote();
      $("#inventory").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  $$("[data-stock-count]").forEach((el) => { el.textContent = window.CARS.length; });
  const feat = $("#heroFeat");
  if (feat) { // the highest-priced car in stock
    const c = [...window.CARS].sort((a, b) => b.price - a.price)[0];
    const photo = (c.gallery || []).find((g) => !window.MS.isCut(g));
    feat.href = window.MS.carUrl(c);
    $(".hstrip__thumb", feat).innerHTML = photo ? window.MS.img(photo, { alt: "", sizes: "74px" }) : "";
    $(".hstrip__txt", feat).innerHTML = `<small>Featured &middot; ${window.MS.priceShort(c.price)}</small><strong>${window.MS.esc(`${c.year} ${c.name}`)}</strong>`;
    feat.setAttribute("aria-label", `Featured: ${c.year} ${c.name}`);
  }
  const prev = $(".rail__btn--prev"), next = $(".rail__btn--next");
  const step = () => (track.firstElementChild?.offsetWidth || 300) + 20;
  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  function updateRailBtns() {
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  track.addEventListener("scroll", updateRailBtns, { passive: true });
  addEventListener("resize", updateRailBtns);
  renderCars();

  /* ================= Category counts ================= */
  $$("[data-status-count]").forEach((el) => {
    const n = window.CARS.filter((c) => c.status === el.dataset.statusCount).length;
    el.textContent = n ? `${n} ${n === 1 ? "car" : "cars"}` : "On order";
  });

  /* ================= Brands marquee ================= */
  const logo = (b, hidden) => `<span class="brand-logo" ${hidden ? 'aria-hidden="true"' : `role="img" aria-label="${b.name}"`}
    style="--w:${b.w}px;-webkit-mask-image:url('assets/img/brands/${b.slug}.svg');mask-image:url('assets/img/brands/${b.slug}.svg')" title="${b.name}"></span>`;
  // Second copy makes the loop seamless; hidden from screen readers
  $("#brands").innerHTML = window.BRANDS.map((b) => logo(b)).join("") + window.BRANDS.map((b) => logo(b, true)).join("");

  /* ================= Step inside: interior reveal =================
     The lens follows the pointer anywhere over the stage (tight smoothing,
     no autopilot). Inside the lens the interior photo shows through, cut to
     the car's silhouette. Touch: press and drag. */
  (() => {
    const section = $("#inside"), stage = $("#insideStage"), car = $("#insideCar");
    if (!section || !stage || !car) return;
    const inner = $(".inside__int", car), lens = $(".inside__lens", stage), label = $(".inside__label", stage);
    const layers = $$("img", inner);
    // Which interior photo to show depends on where the lens is over the car
    // (rear doors → rear seats, front door → cabin / door trim, windscreen → driver display, front → console)
    const zoneAt = (fx, fy) => fx < 0.30 ? 0 : fx < 0.47 ? (fy < 0.5 ? 1 : 2) : (fy < 0.36 ? 3 : 4);
    let zone = -1;
    const setZone = (z) => {
      if (z === zone) return; zone = z;
      layers.forEach((l, i) => l.classList.toggle("is-on", i === z));
      label.textContent = layers[z].dataset.zone;
    };
    setZone(0);
    // Fetch the interior photos only as the section approaches (keeps first load light)
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return;
      layers.forEach((l) => { l.src = l.dataset.src; });
      o.disconnect();
    }, { rootMargin: "700px 0px" }).observe(section);
    const radius = () => Math.max(70, Math.min(170, car.clientWidth * 0.17));
    const cur = { x: 0, y: 0, r: 0 }, tgt = { x: 0, y: 0, r: 0 };
    let raf = 0, fresh = true;

    function render() {
      raf = 0;
      const follow = reduceMotion ? 1 : 0.35, grow = reduceMotion ? 1 : 0.18;
      cur.x += (tgt.x - cur.x) * follow;
      cur.y += (tgt.y - cur.y) * follow;
      cur.r += (tgt.r - cur.r) * grow;
      if (Math.abs(tgt.r - cur.r) < 0.3) cur.r = tgt.r;
      const ox = car.offsetLeft, oy = car.offsetTop; // clip is car-relative, lens is stage-relative
      const clip = `circle(${cur.r.toFixed(1)}px at ${(cur.x - ox).toFixed(1)}px ${(cur.y - oy).toFixed(1)}px)`;
      inner.style.clipPath = inner.style.webkitClipPath = clip;
      // keep each photo's focal point under the lens, with a gentle pan as it moves
      const lx = cur.x - ox, ly = cur.y - oy, cw = car.clientWidth, ch = car.clientHeight;
      const iw = Math.max(cw * 0.62, cur.r * 4.6, 420);
      inner.style.setProperty("--iw", `${iw}px`);
      layers.forEach((l) => {
        const ih = iw / ((l.naturalWidth / l.naturalHeight) || 1.5);
        const px = lx - iw * +l.dataset.fx - (lx - cw / 2) * 0.18;
        const py = ly - ih * +l.dataset.fy - (ly - ch / 2) * 0.18;
        l.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      });
      lens.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      lens.style.setProperty("--d", `${cur.r * 2}px`);
      section.classList.toggle("is-active", cur.r > 2);
      const busy = Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.3 || cur.r !== tgt.r;
      if (busy) raf = requestAnimationFrame(render);
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(render); };
    const aim = (e) => {
      const r = stage.getBoundingClientRect();
      tgt.x = e.clientX - r.left; tgt.y = e.clientY - r.top;
      if (fresh) { cur.x = tgt.x; cur.y = tgt.y; fresh = false; } // open where the pointer is
      setZone(zoneAt((tgt.x - car.offsetLeft) / car.clientWidth, (tgt.y - car.offsetTop) / car.clientHeight));
      tgt.r = radius(); kick();
    };
    const close = () => { tgt.r = 0; fresh = true; kick(); };
    stage.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.buttons) aim(e); });
    stage.addEventListener("pointerdown", aim);
    stage.addEventListener("pointerleave", close);
    stage.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") close(); });
    stage.addEventListener("pointercancel", close);
  })();

  /* ================= Spotlight reel =================
     Downloaded only when the section nears the viewport, fully buffered
     into memory before it plays (same approach as the hero), paused when
     scrolled away. Sound is opt-in. */
  (() => {
    const sec = $("#spotlight");
    if (!sec) return;
    const v = $(".spot__video", sec), btn = $(".spot__sound", sec), bar = $(".spot__progress span", sec);
    const small = conn.saveData || /(^|-)2g$|3g/.test(conn.effectiveType || "") || (innerWidth < 600 && (devicePixelRatio || 1) <= 2);
    // MP4 (H.264 + AAC): this reel has sound, and WebM's Opus audio fails on some iPhones.
    // The MP4 is also the smaller file.
    const url = `${v.dataset.base}-${small ? "480" : "720"}.mp4`;
    let loaded = false, inView = false;
    // If the phone blocks autoplay (e.g. iPhone Low Power Mode), show a play button instead
    const tryPlay = () => {
      const p = v.play();
      if (p) p.then(() => sec.classList.remove("needs-tap")).catch(() => sec.classList.add("needs-tap"));
    };
    const sync = () => { if (!v.src) return; if (inView && !document.hidden) tryPlay(); else v.pause(); };
    onFailSwitchToMp4(v, url, tryPlay); // blob playback failed: stream the file directly
    async function load() {
      if (loaded) return; loaded = true;
      v.addEventListener("playing", () => sec.classList.add("has-video"), { once: true });
      try {
        if (location.protocol === "file:") throw 0;
        v.src = URL.createObjectURL(await loadBlob(url, 25000));
      } catch (_) { v.src = url; } // too slow: stream directly instead
      sync();
    }
    $(".spot__tap", sec).addEventListener("click", () => { load(); tryPlay(); });
    new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: "600px 0px" }).observe(sec);
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe($("#spotFrame"));
    document.addEventListener("visibilitychange", sync);
    v.addEventListener("timeupdate", () => { if (v.duration) bar.style.transform = `scaleX(${v.currentTime / v.duration})`; });
    btn.addEventListener("click", () => {
      v.muted = !v.muted;
      btn.setAttribute("aria-pressed", String(!v.muted));
      btn.setAttribute("aria-label", v.muted ? "Turn sound on" : "Turn sound off");
      if (!v.muted) { load(); tryPlay(); }
    });
  })();

  /* ================= Lights on =================
     Looping clip (headlights come on, the car drives off, fade to black).
     Fully buffered before it starts (no stalls), plays only while on screen,
     the headline appears when the headlights switch on, sound is opt-in. */
  (() => {
    const sec = $("#lights");
    if (!sec) return;
    const stage = $("#lightsStage", sec), v = $(".lights__video", sec);
    const sound = $(".lights__sound", sec), playBtn = $(".lights__play", sec);
    const small = conn.saveData || /(^|-)2g$|3g/.test(conn.effectiveType || "") || innerWidth < 600;
    const url = `${v.dataset.base}-${small ? "480" : "720"}.mp4`; // MP4: plays on every phone, incl. iPhone
    const LIT_AT = 1.0; // seconds: the headlights switch on
    let loaded = null, inView = false;

    $$("[data-wa-viewing]", sec).forEach((a) => {
      a.href = window.MS.waMsg(`Hello ${S.name}, I'd like to book a private evening viewing at your showroom.`);
      a.target = "_blank"; a.rel = "noopener";
    });

    const load = () => loaded || (loaded = (async () => {
      try {
        if (location.protocol === "file:") throw 0;
        v.src = URL.createObjectURL(await loadBlob(url, 20000));
      } catch (_) { v.src = url; }
    })());
    const tryPlay = () => {
      const p = v.play();
      if (p) p.then(() => sec.classList.remove("needs-tap")).catch(() => sec.classList.add("needs-tap"));
    };
    const start = async () => { await load(); tryPlay(); };

    v.addEventListener("timeupdate", () => { if (v.currentTime >= LIT_AT) sec.classList.add("is-lit"); });
    playBtn.addEventListener("click", start);
    sound.addEventListener("click", () => {
      v.muted = !v.muted;
      sound.setAttribute("aria-pressed", String(!v.muted));
      sound.setAttribute("aria-label", v.muted ? "Turn sound on" : "Turn sound off");
      if (!v.muted && v.paused) { v.currentTime = 0; start(); }
    });

    if (reduceMotion) { // no autoplay: show a lit still, play on request
      v.poster = "assets/video/night-lit.jpg";
      sec.classList.add("is-lit", "needs-tap");
      return;
    }
    // start downloading as the section approaches; play only while it is in view
    new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: "500px 0px" }).observe(sec);
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && !sec.classList.contains("needs-tap")) start();
      else if (!inView && !v.paused) v.pause();
    }, { threshold: 0.45 }).observe(stage);
  })();

  /* ================= Social grid ================= */
  $("#socialGrid").innerHTML = window.SOCIAL.map((p) => `
    <a class="post ${p.thumb ? "" : "ph"}" href="${p.url || S.facebook}" target="_blank" rel="noopener" aria-label="View post on Facebook">
      ${p.thumb ? `<img src="${p.thumb}" alt="${p.alt || ""}" loading="lazy" decoding="async">` : ""}
      ${p.video ? `<span class="post__play" aria-hidden="true">▶</span>` : ""}
    </a>`).join("");

  /* ================= Background images ================= */
  // Elements with data-img load that image if it exists, otherwise stay as styled placeholders
  $$("[data-img]").forEach((el) => {
    const im = new Image();
    im.onload = () => { el.style.backgroundImage = `url('${el.dataset.img}')`; el.classList.remove("ph"); el.classList.add("bg"); };
    im.src = el.dataset.img;
  });
})();

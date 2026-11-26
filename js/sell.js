/* ------------------------------------------------------------------
   Sell your car: validation, photo previews, WhatsApp hand-off.
   DEMO: there is no server yet, so a submission opens WhatsApp with
   the details pre-filled (photos are attached in the chat).
   For production, POST the FormData to a backend / email service.
------------------------------------------------------------------ */
(() => {
  "use strict";
  const { $, S, waMsg } = window.MS;
  const form = $("#sellFormEl"), err = $("#formError"), done = $("#formDone");
  const input = $("#photos"), previews = $("#previews");
  const MAX = 10;
  let files = [];

  $("#brandList").innerHTML = window.BRANDS.map((b) => `<option value="${b.name}">`).join("");

  /* ---------- Photo previews ---------- */
  function renderPreviews() {
    previews.innerHTML = "";
    files.forEach((f, i) => {
      const url = URL.createObjectURL(f);
      const el = document.createElement("div");
      el.className = "drop__thumb";
      el.innerHTML = `<img src="${url}" alt=""><button type="button" aria-label="Remove photo ${i + 1}">×</button>`;
      el.querySelector("img").onload = () => URL.revokeObjectURL(url);
      el.querySelector("button").addEventListener("click", () => { files.splice(i, 1); renderPreviews(); });
      previews.appendChild(el);
    });
  }
  input.addEventListener("change", () => {
    files = files.concat([...input.files].filter((f) => f.type.startsWith("image/"))).slice(0, MAX);
    input.value = "";
    renderPreviews();
  });
  const drop = $(".drop");
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("is-over")));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    files = files.concat([...e.dataTransfer.files].filter((f) => f.type.startsWith("image/"))).slice(0, MAX);
    renderPreviews();
  });

  /* ---------- Validation ---------- */
  const fields = [...form.querySelectorAll("input, textarea")].filter((f) => f.type !== "file");
  fields.forEach((f) => f.addEventListener("input", () => f.closest(".field, .check")?.classList.remove("is-invalid")));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = fields.filter((f) => !f.checkValidity());
    fields.forEach((f) => f.closest(".field, .check")?.classList.toggle("is-invalid", bad.includes(f)));
    if (bad.length) {
      err.hidden = false;
      err.textContent = bad.some((f) => f.name === "phone" && f.value)
        ? "Please enter a valid Bangladeshi mobile number (e.g. 01711363397)."
        : "Please fill in the highlighted fields.";
      bad[0].focus();
      return;
    }
    err.hidden = true;

    const d = Object.fromEntries(new FormData(form));
    const n = (v) => (v ? Number(v).toLocaleString("en-IN") : "");
    const lines = [
      `Hello ${S.name}, I'd like to sell my car.`,
      "",
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      `Car: ${d.year} ${d.brand} ${d.model}`,
      d.reg && `Registration year: ${d.reg}`,
      `Mileage: ${n(d.mileage)} km`,
      d.price && `Expected price: BDT ${n(d.price)}`,
      d.notes && `Notes: ${d.notes}`,
      files.length && `(I'll attach ${files.length} photo${files.length > 1 ? "s" : ""} in this chat.)`,
    ].filter(Boolean).join("\n");
    const url = waMsg(lines);
    $("#waRetry").href = url;
    window.open(url, "_blank", "noopener");

    form.hidden = true;
    done.hidden = false;
    done.focus();
  });
})();

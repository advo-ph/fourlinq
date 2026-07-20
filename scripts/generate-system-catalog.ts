/**
 * Generate the downloadable FourlinQ System Catalog PDF served from
 * /docs/fourlinq-system-catalog.pdf (seeded as the "System catalog" row in
 * cms_document, replaceable any time from /admin > Content > Documents).
 *
 * Every line of content comes from src/data/fourlinq-data.ts — the
 * brochure-verified source of truth. DIMENSION_CONSTRAINTS is intentionally
 * excluded: the data file flags it as unconfirmed industry defaults.
 *
 * Run: npx tsx scripts/generate-system-catalog.ts
 */
import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  BRAND,
  CONTACT,
  BRANCHES,
  ADVANTAGES,
  UPVC_PROFILE_FEATURES,
  PRODUCT_TYPES,
  MATERIALS,
  ALUMINIUM_FINISHES,
  PROFILE_SYSTEMS,
  FRAME_FINISHES,
} from "../src/data/fourlinq-data";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_PATH = path.join(ROOT, "public/docs/fourlinq-system-catalog.pdf");

/**
 * Inline a public/ image as a data URI so the PDF renders it without a
 * server. Images are downscaled + recompressed via sharp first (cached per
 * run), otherwise the embedded originals balloon the PDF past 6 MB.
 */
const imageCache = new Map<string, string>();
async function prepareImage(publicPath: string, maxWidth = 900): Promise<void> {
  if (imageCache.has(publicPath)) return;
  const file = path.join(ROOT, "public", publicPath.replace(/^\//, ""));
  const sharp = (await import("sharp")).default;
  const buf = await sharp(file)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: 72 })
    .toBuffer();
  imageCache.set(publicPath, `data:image/jpeg;base64,${buf.toString("base64")}`);
}
function img(publicPath: string): string {
  const data = imageCache.get(publicPath);
  if (!data) throw new Error(`Image not prepared: ${publicPath}`);
  return data;
}

// Same renders the live /products page ships — approved-accurate per type.
const PRODUCT_IMAGE: Record<string, string> = {
  "casement": "/images/wp-export/casement.webp",
  "sliding": "/images/wp-export/slidingwindow.webp",
  "special-shapes": "/images/wp-export/specialshapes.webp",
  "awning": "/images/wp-export/awning.webp",
  "slide-and-fold": "/images/wp-export/slideandfold.webp",
  "lift-and-slide": "/images/wp-export/liftandslide.webp",
};

const ACCENT = "#C8102E";
const INK = "#242424";
const INK_SECONDARY = "#444444";
const INK_MUTED = "#686868";
const RULE = "#e3ded7";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const upvc = MATERIALS.find((m) => m.id === "upvc")!;
const aluminium = MATERIALS.find((m) => m.id === "aluminium")!;
const woodFinish = FRAME_FINISHES.filter((f) => f.category === "wood-grain");
const solidFinish = FRAME_FINISHES.filter((f) => f.category === "solid");

const generatedOn = new Date().toLocaleDateString("en-PH", {
  year: "numeric",
  month: "long",
});

const buildHtml = () => `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@500&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Manrope", system-ui, sans-serif; color: ${INK}; font-size: 9.5pt; line-height: 1.55; }
  .page { page-break-after: always; padding: 18mm 16mm; min-height: 297mm; position: relative; }
  .page:last-child { page-break-after: auto; }
  .serif { font-family: "Fraunces", Georgia, serif; font-weight: 400; }
  .eyebrow { font-size: 7.5pt; letter-spacing: 0.18em; text-transform: uppercase; color: ${ACCENT}; font-weight: 700; margin-bottom: 4mm; }
  h2 { font-family: "Fraunces", Georgia, serif; font-weight: 400; font-size: 22pt; letter-spacing: -0.01em; line-height: 1.06; margin-bottom: 6mm; }
  .lead { color: ${INK_SECONDARY}; max-width: 130mm; margin-bottom: 8mm; }
  .rule { border: 0; border-top: 1px solid ${RULE}; margin: 6mm 0; }
  .footer { position: absolute; bottom: 10mm; left: 16mm; right: 16mm; display: flex; justify-content: space-between; font-size: 7pt; color: ${INK_MUTED}; border-top: 1px solid ${RULE}; padding-top: 3mm; }

  /* Cover */
  .cover { background: #171412; color: #fff; display: flex; flex-direction: column; justify-content: space-between; }
  .cover .mark { font-family: "Fraunces", Georgia, serif; font-size: 15pt; }
  .cover .mark span { color: ${ACCENT}; }
  .cover h1 { font-family: "Fraunces", Georgia, serif; font-weight: 300; font-size: 46pt; line-height: 1.02; letter-spacing: -0.015em; max-width: 150mm; }
  .cover .promise { font-family: "Fraunces", Georgia, serif; font-style: italic; font-size: 13pt; color: rgba(255,255,255,0.82); margin-top: 8mm; }
  .cover .meta { display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: rgba(255,255,255,0.6); border-top: 1px solid rgba(255,255,255,0.18); padding-top: 5mm; }
  .cover .warranty { color: #fff; font-weight: 600; }

  /* Grids */
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 8mm; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6mm 6mm; }
  .card { border-top: 2px solid ${INK}; padding-top: 3mm; }
  .card.accent { border-top-color: ${ACCENT}; }
  .card h3 { font-family: "Fraunces", Georgia, serif; font-weight: 500; font-size: 12pt; margin-bottom: 1.5mm; }
  .card .tag { font-family: "Fraunces", Georgia, serif; font-style: italic; color: ${INK_MUTED}; font-size: 9pt; margin-bottom: 2mm; }
  .card p { color: ${INK_SECONDARY}; font-size: 8.5pt; }
  .card .benefit { margin-top: 2mm; font-size: 8pt; color: ${INK}; font-weight: 600; }
  .card .benefit::before { content: "— "; color: ${ACCENT}; }
  .chip { display: inline-block; font-size: 6.5pt; letter-spacing: 0.14em; text-transform: uppercase; color: ${INK_MUTED}; font-weight: 700; margin-bottom: 1.5mm; }

  /* Numbered features */
  .feature { display: flex; gap: 4mm; padding: 3.5mm 0; border-bottom: 1px solid ${RULE}; }
  .feature .no { font-family: "Fraunces", Georgia, serif; color: ${ACCENT}; font-size: 13pt; min-width: 8mm; }
  .feature h4 { font-size: 10pt; font-weight: 700; margin-bottom: 0.5mm; }
  .feature .verbatim { color: ${INK_SECONDARY}; font-size: 8.5pt; }
  .feature .plain { color: ${INK_MUTED}; font-size: 8pt; margin-top: 0.5mm; }

  ul.plain { list-style: none; }
  ul.plain li { padding: 1.6mm 0; border-bottom: 1px solid ${RULE}; font-size: 9pt; color: ${INK_SECONDARY}; }
  ul.plain li::before { content: "— "; color: ${ACCENT}; font-weight: 700; }

  /* Finishes */
  .swatch { display: flex; gap: 3mm; align-items: flex-start; padding: 2.5mm 0; border-bottom: 1px solid ${RULE}; }
  .swatch .chipbox { width: 11mm; height: 11mm; border-radius: 1mm; border: 1px solid rgba(0,0,0,0.12); flex-shrink: 0; }
  .swatch h4 { font-size: 9.5pt; font-weight: 700; }
  .swatch .cat { font-size: 6.5pt; letter-spacing: 0.12em; text-transform: uppercase; color: ${INK_MUTED}; font-weight: 700; }
  .swatch p { font-size: 7.5pt; color: ${INK_MUTED}; margin-top: 0.5mm; }

  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 7pt; letter-spacing: 0.14em; text-transform: uppercase; color: ${INK_MUTED}; padding: 2mm 3mm 2mm 0; border-bottom: 1px solid ${INK}; }
  td { padding: 2.5mm 3mm 2.5mm 0; border-bottom: 1px solid ${RULE}; font-size: 9pt; vertical-align: top; }
  td.name { font-weight: 700; }
  td.muted { color: ${INK_MUTED}; }

  .contact-block h4 { font-family: "Fraunces", Georgia, serif; font-weight: 500; font-size: 11pt; margin-bottom: 1mm; }
  .contact-block p { color: ${INK_SECONDARY}; font-size: 8.5pt; }
</style>
</head>
<body>

<!-- ── Cover ─────────────────────────────────── -->
<section class="page cover" style="position: relative; overflow: hidden;">
  <img src="${img("/images/projects/real/residence-wood-grain-corner.webp")}"
       style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.42;" />
  <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(13,11,10,0.94), rgba(13,11,10,0.55) 55%, rgba(13,11,10,0.35));"></div>
  <!-- The real FourlinQ wordmark, mirroring src/components/shared/Logo.tsx:
       Times serif "Fourlin" + red Playfair Q over a baseline rule, with the
       "Windows & Doors" subtitle beneath. -->
  <div style="position:relative; align-self:flex-start; width:fit-content; text-align:center;">
    <div style="font-family:'Times New Roman','Times',serif; font-size:22pt; font-weight:400; line-height:1; color:#fff; padding-bottom:1.2mm; border-bottom:0.35pt solid #fff;">Fourlin<span style="font-family:'Playfair Display',serif; font-weight:500; color:#DC2626;">Q</span></div>
    <div style="font-family:'Times New Roman','Times',serif; font-size:11.5pt; letter-spacing:0.03em; color:#fff; margin-top:1.2mm;">Windows &amp; Doors</div>
  </div>
  <div style="position:relative;">
    <h1>System Catalog</h1>
    <p class="promise">“${esc(BRAND.promise)}”</p>
  </div>
  <div class="meta" style="position:relative;">
    <div>
      <p class="warranty">${esc(BRAND.warranty)}</p>
      <p>${esc(BRAND.heroQuote)}</p>
    </div>
    <div style="text-align:right;">
      <p>${esc(generatedOn)}</p>
      <p>fourlinq.ph &nbsp;·&nbsp; ${esc(CONTACT.email)}</p>
    </div>
  </div>
</section>

<!-- ── Advantages ────────────────────────────── -->
<section class="page">
  <p class="eyebrow">The FourlinQ advantages</p>
  <h2>Seven reasons the spec holds.</h2>
  <p class="lead">${esc(BRAND.promiseSupport)} Each claim below is carried by the profile itself: the material, the chambers, the seals.</p>
  <div class="grid2">
    ${ADVANTAGES.map((a) => `
      <div class="card accent">
        <h3>${esc(a.label)}</h3>
        <p>${esc(a.description)}</p>
      </div>`).join("")}
  </div>
  <div class="footer"><span>${esc(BRAND.name)} · System Catalog</span><span>Advantages</span></div>
</section>

<!-- ── Profile cut section ───────────────────── -->
<section class="page">
  <p class="eyebrow">uPVC profile cut section</p>
  <h2>What's inside the frame.</h2>
  <div style="display:grid; grid-template-columns: 3fr 2fr; gap: 8mm; align-items: start; margin-bottom: 5mm;">
    <p class="lead" style="margin-bottom:0;">Seven engineering features, numbered as on the profile diagram. The photographs show the actual multi-chamber profile: the white cut section and the Walnut wood-grain laminate.</p>
    <div style="display:flex; gap:3mm;">
      <img src="${img("/images/wp-export/White-Profile.jpg")}" style="width:50%; aspect-ratio:1; object-fit:cover; border:1px solid ${RULE};" />
      <img src="${img("/images/wp-export/Walnut-Profile.jpg")}" style="width:50%; aspect-ratio:1; object-fit:cover; border:1px solid ${RULE};" />
    </div>
  </div>
  ${UPVC_PROFILE_FEATURES.map((f) => `
    <div class="feature">
      <div class="no">${String(f.number).padStart(2, "0")}</div>
      <div>
        <h4>${esc(f.label)}</h4>
        <p class="verbatim">${esc(f.descriptionVerbatim)}</p>
        <p class="plain">${esc(f.benefitPlain)}</p>
      </div>
    </div>`).join("")}
  <div class="footer"><span>${esc(BRAND.name)} · System Catalog</span><span>Profile engineering</span></div>
</section>

<!-- ── Product types (paginated: 4 + 2, the photo cards are tall) ── -->
${[PRODUCT_TYPES.slice(0, 4), PRODUCT_TYPES.slice(4)].map((chunk, ci) => `
<section class="page">
  <p class="eyebrow">Window &amp; door systems</p>
  <h2>The product range${ci > 0 ? ", continued" : ""}.</h2>
  ${ci === 0 ? `<p class="lead">${esc(BRAND.heroQuote)}</p>` : ""}
  <div class="grid2">
    ${chunk.map((p) => `
      <div class="card">
        ${PRODUCT_IMAGE[p.id] ? `<img src="${img(PRODUCT_IMAGE[p.id])}" style="width:100%; aspect-ratio:16/10; object-fit:cover; margin-bottom:3mm;" />` : ""}
        <span class="chip">${esc(p.category === "both" ? "Window · Door" : p.category)}</span>
        <h3>${esc(p.label)}</h3>
        <p class="tag">${esc(p.tagline)}</p>
        <p>${esc(p.description)}</p>
        <p class="benefit">${esc(p.primaryBenefit)}</p>
      </div>`).join("")}
  </div>
  <div class="footer"><span>${esc(BRAND.name)} · System Catalog</span><span>Product range</span></div>
</section>`).join("")}

<!-- ── Materials + profile systems ───────────── -->
<section class="page">
  <p class="eyebrow">Materials</p>
  <h2>uPVC and aluminium.</h2>
  <div class="grid2" style="margin-bottom: 8mm;">
    <div>
      <h3 class="serif" style="font-size: 13pt; margin-bottom: 3mm;">${esc(upvc.label)}</h3>
      <ul class="plain">${upvc.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
    </div>
    <div>
      <h3 class="serif" style="font-size: 13pt; margin-bottom: 3mm;">${esc(aluminium.label)} <span class="chip" style="color:${ACCENT};">${esc(aluminium.badge ?? "")}</span></h3>
      <ul class="plain">${aluminium.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
    </div>
  </div>
  <p class="eyebrow" style="margin-top: 6mm;">Profile systems</p>
  <table>
    <tr><th>System</th><th>Material</th><th>Note</th></tr>
    ${PROFILE_SYSTEMS.map((s) => `
      <tr>
        <td class="name">${esc(s.name)}</td>
        <td>${esc(s.material === "upvc" ? "uPVC" : "Aluminium")}</td>
        <td class="muted">${esc(s.origin ?? s.note ?? "")}</td>
      </tr>`).join("")}
  </table>
  <div class="footer"><span>${esc(BRAND.name)} · System Catalog</span><span>Materials</span></div>
</section>

<!-- ── Finishes ──────────────────────────────── -->
<section class="page">
  <p class="eyebrow">Frame finishes</p>
  <h2>Twelve finishes, verified on profile.</h2>
  <p class="lead">Colour references from physical uPVC profile sample bars. Wood-grain finishes carry a laminated texture; solids are smooth.</p>
  <div class="grid2">
    <div>
      <span class="chip">Wood grain</span>
      ${woodFinish.map((f) => `
        <div class="swatch">
          ${f.textureImagePath
            ? `<img src="${img(f.textureImagePath)}" class="chipbox" style="object-fit:cover;" />`
            : `<div class="chipbox" style="background:${f.swatchHex};"></div>`}
          <div><h4>${esc(f.label)}</h4><p>${esc(f.description)}</p></div>
        </div>`).join("")}
    </div>
    <div>
      <span class="chip">Solid</span>
      ${solidFinish.map((f) => `
        <div class="swatch">
          <div class="chipbox" style="background:${f.swatchHex};"></div>
          <div><h4>${esc(f.label)}</h4><p>${esc(f.description)}</p></div>
        </div>`).join("")}
      <div style="margin-top: 6mm;">
        <span class="chip">Aluminium powder-coat</span>
        ${ALUMINIUM_FINISHES.map((f) => `
          <div class="swatch">
            <div class="chipbox" style="background:${f.hex};"></div>
            <div><h4>${esc(f.name)}</h4></div>
          </div>`).join("")}
      </div>
    </div>
  </div>
  <div class="footer"><span>${esc(BRAND.name)} · System Catalog</span><span>Finishes</span></div>
</section>

<!-- ── Warranty + contact ────────────────────── -->
<section class="page">
  <p class="eyebrow">Warranty</p>
  <h2>${esc(BRAND.warranty)}.</h2>
  <ul class="plain" style="max-width: 100mm; margin-bottom: 10mm;">
    ${BRAND.warrantyScope.map((w) => `<li>${esc(w)}</li>`).join("")}
  </ul>

  <p class="eyebrow">Showrooms &amp; branches</p>
  <div class="grid3" style="margin-bottom: 10mm;">
    ${BRANCHES.map((b) => `
      <div class="contact-block">
        <h4>${esc(b.label)}</h4>
        <p>${esc(b.address)}</p>
      </div>`).join("")}
  </div>

  <p class="eyebrow">Direct line</p>
  <div class="grid3">
    <div class="contact-block"><h4>Sales</h4><p>${esc(CONTACT.mobileSales)}</p></div>
    <div class="contact-block"><h4>Landline</h4><p>${esc(CONTACT.landline)}</p></div>
    <div class="contact-block"><h4>Engineering</h4><p>${esc(CONTACT.email)}</p></div>
  </div>

  <hr class="rule" style="margin-top: 12mm;" />
  <p style="font-size: 7.5pt; color: ${INK_MUTED}; max-width: 140mm;">
    All content in this catalog is verified against official ${esc(BRAND.name)} printed
    brochures and physical profile samples. Project-specific engineering data,
    section drawings, and dimensional limits are confirmed per project —
    email ${esc(CONTACT.email)} with your elevations.
  </p>
  <div class="footer"><span>${esc(BRAND.name)} · System Catalog</span><span>${esc(generatedOn)}</span></div>
</section>

</body>
</html>`;

async function main() {
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });

  // Downscale + cache every embedded image before the template renders.
  const neededImage = [
    "/images/projects/real/residence-wood-grain-corner.webp",
    "/images/wp-export/White-Profile.jpg",
    "/images/wp-export/Walnut-Profile.jpg",
    ...Object.values(PRODUCT_IMAGE),
    ...FRAME_FINISHES.filter((f) => f.textureImagePath).map((f) => f.textureImagePath!),
  ];
  for (const p of neededImage) await prepareImage(p, p.includes("projects/real") ? 1400 : 900);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(buildHtml(), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: OUT_PATH,
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
  await browser.close();
  const kb = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
  console.log(`Wrote ${OUT_PATH} (${kb} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

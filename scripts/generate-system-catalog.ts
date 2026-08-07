/**
 * Generate the FourlinQ replacement guide and complete window/door catalog.
 *
 * The public compatibility path remains /docs/fourlinq-system-catalog.pdf so
 * existing CMS rows and links keep working. A descriptive public filename and
 * a delivery copy under output/pdf are written from the same render.
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
  MATERIALS,
  ALUMINIUM_FINISHES,
  PROFILE_SYSTEMS,
  FRAME_FINISHES,
} from "../src/data/fourlinq-data";
import { products as PRODUCT_CATALOG, type Product } from "../src/data/products";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE_NAME = "fourlinq-window-door-replacement-guide-and-options.pdf";
const OUT_PATH = path.join(ROOT, "public/docs", FILE_NAME);
const LEGACY_PATH = path.join(ROOT, "public/docs/fourlinq-system-catalog.pdf");
const DELIVERY_PATH = path.join(ROOT, "output/pdf", FILE_NAME);

const imageCache = new Map<string, string>();
async function prepareImage(publicPath: string, maxWidth = 1400): Promise<void> {
  if (imageCache.has(publicPath)) return;
  const file = path.join(ROOT, "public", publicPath.replace(/^\//, ""));
  const sharp = (await import("sharp")).default;
  const buf = await sharp(file)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 80, chromaSubsampling: "4:4:4" })
    .toBuffer();
  imageCache.set(publicPath, `data:image/jpeg;base64,${buf.toString("base64")}`);
}

function img(publicPath: string): string {
  const data = imageCache.get(publicPath);
  if (!data) throw new Error(`Image not prepared: ${publicPath}`);
  return data;
}

const ACCENT = "#C8102E";
const INK = "#242424";
const INK_SECONDARY = "#444444";
const INK_MUTED = "#686868";
const CANVAS = "#F9F7F1";
const RULE = "#ded8cf";
const TOTAL_PAGE = 23;

const esc = (text: string) =>
  text
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const windowProduct = PRODUCT_CATALOG.filter((item) => item.category === "windows");
const doorProduct = PRODUCT_CATALOG.filter((item) => item.category === "doors");
const brochureProduct = [...windowProduct, ...doorProduct];
const expectedProduct = [
  "casement", "sliding", "special-shapes", "awning", "sliding-door",
  "slide-and-fold", "casement-door", "french-door", "large-panel-doors",
  "lift-and-slide", "90-series",
];
const upvc = MATERIALS.find((item) => item.id === "upvc")!;
const aluminium = MATERIALS.find((item) => item.id === "aluminium")!;
const woodFinish = FRAME_FINISHES.filter((item) => item.category === "wood-grain");
const solidFinish = FRAME_FINISHES.filter((item) => item.category === "solid");

const generatedOn = new Date().toLocaleDateString("en-PH", {
  year: "numeric",
  month: "long",
});

interface ProductGuide {
  bestFor: string;
  replacement: string;
  watch: string;
}

const productGuide: Record<string, ProductGuide> = {
  casement: {
    bestFor: "Bedrooms, living rooms, and locations where maximum ventilation is the priority.",
    replacement: "A side-hinged operation can suit an existing opening after survey. The old frame is not assumed reusable: corrosion, chipping, waterproofing, and substrate condition determine insert or full-frame scope.",
    watch: "The sash opens outward, so confirm clearance from walkways, screens, grills, plants, and roof projections.",
  },
  sliding: {
    bestFor: "Balconies, counters, corridors, and wide openings where no sash should project inward or outward.",
    replacement: "Useful when the existing opening already suits a horizontal track. The survey checks sill level, drainage, squareness, and available glass area.",
    watch: "Tracks must stay level and clear. Ask how each moving panel can be removed or cleaned safely.",
  },
  "special-shapes": {
    bestFor: "Arches, circles, triangles, raked heads, and feature glazing drawn to a specific architectural geometry.",
    replacement: "Usually measured and fabricated as a full custom unit. Existing templates, adjacent assemblies, flashing, and structural support must be verified on site.",
    watch: "Some shapes are fixed rather than operable. Ventilation and emergency-egress needs may require a paired operating unit.",
  },
  awning: {
    bestFor: "Kitchens, bathrooms, high-level openings, and rooms that need ventilation with some rain protection.",
    replacement: "A top-hinged operation can suit an existing opening or a larger fixed-glass composition after the old frame, substrate, exterior clearance, and water path are surveyed.",
    watch: "Confirm exterior opening clearance and safe access to the handle, hinges, stay arm, and insect screen.",
  },
  "sliding-door": {
    bestFor: "Daily access to a balcony, lanai, or garden where a swinging leaf would consume floor space.",
    replacement: "The existing threshold, drainage path, floor finish, and panel-removal route are checked before the old system is removed.",
    watch: "A low threshold improves access, but waterproofing and exterior drainage remain non-negotiable.",
  },
  "slide-and-fold": {
    bestFor: "Living and entertainment spaces that should open almost completely to a patio, lanai, or garden.",
    replacement: "Often changes the operating pattern and load distribution, so the head, jambs, sill, stacking zone, and structural support need a full survey.",
    watch: "Reserve clear space for the folded panel stack and confirm the direction it should collect.",
  },
  "casement-door": {
    bestFor: "Main or secondary entries that need a familiar hinged operation, weather seal, and multi-point locking.",
    replacement: "The survey confirms swing direction, finished floor levels, threshold detail, lock side, and whether the existing frame is fully removed.",
    watch: "Confirm inward or outward swing against furniture, steps, screens, and local egress requirements.",
  },
  "french-door": {
    bestFor: "Traditional elevations that need a centered opening without the floor-space demand of two swinging leaves.",
    replacement: "Typically replaces a wide door assembly as one coordinated frame. Panel alignment, center opening, track level, and drainage are set together.",
    watch: "Decorative grids change the sightline. Review the full elevation, not only a small finish sample.",
  },
  "large-panel-doors": {
    bestFor: "Wide living-room and lanai openings where uninterrupted glass and minimal framing matter most.",
    replacement: "Custom-specified after checking structural support, delivery access, handling space, threshold build-up, and the final drainage route.",
    watch: "Large glass is heavy. Panel size, safety glass, hardware, and installation method are confirmed per project.",
  },
  "lift-and-slide": {
    bestFor: "Large, heavy panels that need smooth daily movement and a compression seal when closed.",
    replacement: "The system is set as a complete frame-and-panel assembly. The finished opening must be level, plumb, square, supported, and weathered correctly.",
    watch: "Allow for the panel travel or pocket, handle clearance, service access, and a safe delivery route.",
  },
  "90-series": {
    bestFor: "Premium residential openings that call for a deeper profile and a project-specific leaf or panel arrangement.",
    replacement: "Custom-specified after the opening, preferred operation, layout, structural support, and threshold condition are surveyed.",
    watch: "Configuration and dimensional limits are project-specific; confirm them before finalizing adjacent finishes.",
  },
};

// The canonical product catalog still carries three legacy description mix-ups
// (casement says "rolling", special-shape borrows awning copy, and awning
// understates ventilation). Keep the brochure mechanically accurate without
// broadening this artifact task into a site-copy rewrite.
const productDescription: Record<string, string> = {
  casement:
    "A side-hinged window that opens outward like a door. The full sash can catch the breeze for broad ventilation, then closes against the frame for a secure weather seal.",
  sliding:
    "One or more window panels move horizontally along a track. Nothing projects into the room or outward from the facade, making the system practical where clearance is limited.",
  "special-shapes":
    "A made-to-measure window for arches, circles, triangles, trapezoids, raked heads, and other non-standard geometry. Shape units are often fixed and can be composed with operating windows.",
  awning:
    "A top-hinged window that opens outward from the bottom. The projecting sash supports ventilation while providing some protection from light rain, subject to wind and exposure.",
  "large-panel-doors":
    "A large-format glazed door direction for wide openings and restrained framing. Operation, panel arrangement, span, hardware, and threshold are custom-specified after survey and product-master confirmation.",
  "lift-and-slide":
    "A large-door direction built around a handle-operated lift-and-slide mechanism: the moving panel lifts away from its compression seal for travel, then reseats when closed. Final panel layout is project-specific.",
  "90-series":
    "A premium deep-profile door line for projects that need a more substantial frame. Leaf or panel layout, glazing, operation, hardware, and dimensional limits are confirmed in the approved project specification.",
};

const productTagline: Record<string, string> = {
  "90-series": "Premium deep-profile door line.",
};

const productSpecification: Record<string, string[]> = {
  "large-panel-doors": [
    "Large-format glazed opening",
    "Minimal-frame design direction",
    "Operation and panel layout confirmed per project",
    "Structure, delivery, threshold, and drainage planned together",
    "Consultation required",
  ],
  "lift-and-slide": [
    "Handle-operated lift mechanism",
    "Compression seal re-engages when closed",
    "Panel layout and movement confirmed per project",
    "Structure, delivery, threshold, and drainage planned together",
    "Consultation required",
  ],
  "90-series": [
    "Premium deep-profile door line",
    "Leaf or panel layout confirmed per project",
    "Glazing and operation confirmed per project",
    "Hardware and dimensional limits confirmed per project",
    "Consultation required",
  ],
};

function footer(page: number, label: string): string {
  return `<div class="footer"><span>${esc(BRAND.name)} · Replacement Guide + Options</span><span>${esc(label)} &nbsp; ${page}/${TOTAL_PAGE}</span></div>`;
}

// Exact vector reconstruction of src/components/shared/Logo.tsx. Keeping the
// 200x64 viewBox, full-width divider, type families, weights, and red Q here
// avoids relying on the small 300x104 raster reference in a print document.
function wordmark(): string {
  return `<svg class="wordmark" viewBox="0 0 200 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="FourlinQ Windows &amp; Doors">
    <line x1="3" y1="36" x2="197" y2="36" stroke="#ffffff" stroke-width="1" />
    <text x="100" y="32" text-anchor="middle" style="font-family:'Times New Roman','Times',serif;font-size:42px;font-weight:400;">
      <tspan fill="#ffffff">Fourlin</tspan><tspan fill="#DC2626" style="font-family:'Playfair Display',serif;font-weight:500;">Q</tspan>
    </text>
    <text x="100" y="56" fill="#ffffff" text-anchor="middle" style="font-family:'Times New Roman','Times',serif;font-size:23px;font-weight:400;letter-spacing:.03em;">Windows &amp; Doors</text>
  </svg>`;
}

function productPage(item: Product, page: number): string {
  const note = productGuide[item.id];
  const category = item.category === "windows" ? "Window option" : "Door option";
  const description = productDescription[item.id] ?? item.description;
  const tagline = productTagline[item.id] ?? item.shortDescription;
  const specification = productSpecification[item.id] ?? item.specs;
  return `
  <section class="page product-page">
    <p class="eyebrow">${esc(category)} · ${String(page - 8).padStart(2, "0")}</p>
    <div class="product-title">
      <div>
        <h2>${esc(item.name)}</h2>
        <p class="product-tag">${esc(tagline)}</p>
      </div>
      <span class="category-pill">${item.category === "windows" ? "Window" : "Door"}</span>
    </div>
    <div class="product-visual"><img class="product-hero" src="${img(item.image)}" /><span>System illustration · final configuration confirmed in quotation</span></div>
    <div class="product-grid">
      <div>
        <p class="section-label">How it works</p>
        <p class="body-lg">${esc(description)}</p>
        <div class="info-block">
          <p class="section-label">Best for</p>
          <p>${esc(note.bestFor)}</p>
        </div>
        <div class="info-block">
          <p class="section-label">Replacement approach</p>
          <p>${esc(note.replacement)}</p>
        </div>
      </div>
      <div>
        <p class="section-label">Feature direction · verify in quotation</p>
        <ul class="spec-list">${specification.map((text) => `<li>${esc(text)}</li>`).join("")}</ul>
        <p class="section-label" style="margin-top:5mm;">Glass directions to discuss</p>
        <div class="tag-list">${item.glassOptions.map((text) => `<span>${esc(text)}</span>`).join("")}</div>
        <div class="watch-block">
          <p class="section-label">Confirm at survey</p>
          <p>${esc(note.watch)}</p>
        </div>
      </div>
    </div>
    <p class="project-note">Dimensions, glass build-up, hardware, drainage, structural support, and code compliance are confirmed for the actual opening before fabrication.</p>
    ${footer(page, item.name)}
  </section>`;
}

const buildHtml = () => `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>FourlinQ Window and Door Replacement Guide and Options</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@500&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Manrope", Arial, sans-serif; color: ${INK}; font-size: 9.2pt; line-height: 1.5; }
  a { color: inherit; text-decoration: none; }
  .page { page-break-after: always; padding: 17mm 16mm 20mm; min-height: 297mm; position: relative; overflow: hidden; }
  .page:last-child { page-break-after: auto; }
  .serif { font-family: "Fraunces", Georgia, serif; font-weight: 400; }
  .eyebrow { font-size: 7.2pt; letter-spacing: 0.18em; text-transform: uppercase; color: ${ACCENT}; font-weight: 700; margin-bottom: 4mm; }
  h2 { font-family: "Fraunces", Georgia, serif; font-weight: 400; font-size: 26pt; letter-spacing: -0.015em; line-height: 1.03; margin-bottom: 5mm; }
  h3 { font-family: "Fraunces", Georgia, serif; font-weight: 500; font-size: 13pt; line-height: 1.15; }
  h4 { font-size: 9.5pt; font-weight: 700; }
  .lead { color: ${INK_SECONDARY}; font-size: 11pt; max-width: 145mm; margin-bottom: 8mm; line-height: 1.55; }
  .body-lg { color: ${INK_SECONDARY}; font-size: 9.5pt; line-height: 1.62; }
  .section-label { font-size: 7pt; letter-spacing: 0.14em; text-transform: uppercase; color: ${INK_MUTED}; font-weight: 700; margin-bottom: 1.8mm; }
  .rule { border: 0; border-top: 1px solid ${RULE}; margin: 6mm 0; }
  .footer { position: absolute; bottom: 9mm; left: 16mm; right: 16mm; display: flex; justify-content: space-between; font-size: 6.7pt; color: ${INK_MUTED}; border-top: 1px solid ${RULE}; padding-top: 2.5mm; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 8mm; }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
  .card { border-top: 2px solid ${INK}; padding-top: 3mm; }
  .card.accent { border-top-color: ${ACCENT}; }
  .card h3 { margin-bottom: 1.5mm; }
  .card p { color: ${INK_SECONDARY}; font-size: 8.4pt; }
  .number { font-family: "Fraunces", Georgia, serif; color: ${ACCENT}; font-size: 20pt; line-height: 1; }

  .cover { background: #161616; color: #fff; display: flex; flex-direction: column; justify-content: space-between; padding: 17mm 16mm; }
  .cover h1 { font-family: "Fraunces", Georgia, serif; font-weight: 300; font-size: 42pt; line-height: 0.98; letter-spacing: -0.02em; max-width: 160mm; }
  .cover .cover-sub { font-size: 11pt; line-height: 1.55; color: rgba(255,255,255,0.82); max-width: 116mm; margin-top: 7mm; }
  .cover .meta { display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: rgba(255,255,255,0.68); border-top: 1px solid rgba(255,255,255,0.22); padding-top: 5mm; }
  .wordmark { position:relative; align-self:flex-start; width:43mm; height:auto; overflow:visible; }

  .journey { display:grid; grid-template-columns:repeat(5,1fr); gap:3mm; margin:7mm 0 10mm; }
  .journey-item { border-top:2px solid ${ACCENT}; padding-top:3mm; }
  .journey-item h3 { font-size:11pt; margin:2mm 0 1mm; }
  .journey-item p { font-size:7.7pt; color:${INK_MUTED}; }
  .contents { display:grid; grid-template-columns:1fr 1fr; gap:0 10mm; border-top:1px solid ${RULE}; }
  .contents-row { display:flex; justify-content:space-between; gap:5mm; padding:2.4mm 0; border-bottom:1px solid ${RULE}; font-size:8.4pt; }
  .contents-row span:last-child { color:${ACCENT}; font-weight:700; }

  .signal-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6mm; }
  .signal-column { background:${CANVAS}; padding:5mm; min-height:150mm; }
  .signal-column:nth-child(3) { background:#241f1d; color:#fff; }
  .signal-column h3 { margin:2mm 0 5mm; }
  .signal-item { padding:3.5mm 0; border-top:1px solid ${RULE}; }
  .signal-column:nth-child(3) .signal-item { border-color:rgba(255,255,255,.18); }
  .signal-item h4 { margin-bottom:1mm; }
  .signal-item p { font-size:8pt; color:${INK_SECONDARY}; }
  .signal-column:nth-child(3) .signal-item p { color:rgba(255,255,255,.75); }
  .note { margin-top:6mm; padding:4mm 5mm; background:#f3ecec; border-left:3px solid ${ACCENT}; color:${INK_SECONDARY}; font-size:8.5pt; }

  .method-table { width:100%; border-collapse:collapse; margin-top:5mm; }
  .method-table th { text-align:left; font-size:6.8pt; letter-spacing:.13em; text-transform:uppercase; color:${INK_MUTED}; padding:2mm 3mm 2mm 0; border-bottom:1px solid ${INK}; }
  .method-table td { vertical-align:top; padding:4mm 4mm 4mm 0; border-bottom:1px solid ${RULE}; font-size:8.3pt; }
  .method-table td:first-child { width:31mm; font-weight:700; }
  .method-table td:nth-child(2) { width:46mm; }

  .check-grid { display:grid; grid-template-columns:1fr 1fr; gap:5mm 9mm; }
  .check { display:grid; grid-template-columns:9mm 1fr; gap:3mm; border-top:1px solid ${RULE}; padding-top:3mm; }
  .check .tick { width:7mm; height:7mm; border:1px solid ${ACCENT}; color:${ACCENT}; display:flex; align-items:center; justify-content:center; font-weight:700; }
  .check p { color:${INK_SECONDARY}; font-size:8.3pt; }
  .quote-strip { margin-top:7mm; display:grid; grid-template-columns:repeat(5,1fr); background:#242424; color:#fff; }
  .quote-strip div { padding:4mm; border-right:1px solid rgba(255,255,255,.14); }
  .quote-strip p:first-child { color:#fff; font-weight:700; font-size:8pt; margin-bottom:1mm; }
  .quote-strip p:last-child { color:rgba(255,255,255,.68); font-size:7pt; }

  .timeline { display:grid; grid-template-columns:repeat(4,1fr); gap:4mm; margin-top:7mm; }
  .timeline-item { background:${CANVAS}; padding:4mm; min-height:49mm; border-top:2px solid ${ACCENT}; }
  .timeline-item h3 { font-size:11pt; margin:2mm 0; }
  .timeline-item p { color:${INK_SECONDARY}; font-size:7.8pt; }
  .prep { display:grid; grid-template-columns:1fr 1fr 1fr; gap:5mm; margin-top:8mm; }
  .prep div { border-top:1px solid ${INK}; padding-top:3mm; }
  .prep p { color:${INK_SECONDARY}; font-size:8pt; margin-top:1mm; }

  .material { padding:5mm; background:${CANVAS}; }
  .material h3 { font-size:16pt; margin-bottom:3mm; }
  .plain { list-style:none; }
  .plain li { padding:1.7mm 0; border-bottom:1px solid ${RULE}; font-size:8.2pt; color:${INK_SECONDARY}; }
  .plain li::before { content:"· "; color:${ACCENT}; font-weight:700; }
  .decision-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; margin-top:7mm; }
  .decision-grid div { border-top:2px solid ${INK}; padding-top:3mm; }
  .decision-grid p { color:${INK_SECONDARY}; font-size:8pt; margin-top:1.5mm; }

  .index-grid { display:grid; grid-template-columns:1fr 1fr; gap:8mm; }
  .index-column h3 { margin-bottom:4mm; }
  .index-row { display:grid; grid-template-columns:25mm 1fr 8mm; gap:4mm; align-items:center; padding:2.2mm 0; border-top:1px solid ${RULE}; }
  .index-row img { width:25mm; height:17mm; object-fit:contain; background:#fff; }
  .index-row h4 { margin-bottom:.5mm; }
  .index-row p { color:${INK_MUTED}; font-size:7.2pt; line-height:1.35; }
  .index-row strong { color:${ACCENT}; font-size:8pt; text-align:right; }

  .product-title { display:flex; justify-content:space-between; align-items:flex-start; gap:10mm; }
  .product-title h2 { margin-bottom:2mm; }
  .product-tag { font-family:"Fraunces",Georgia,serif; font-style:italic; color:${INK_MUTED}; font-size:11pt; }
  .category-pill { font-size:6.8pt; letter-spacing:.14em; text-transform:uppercase; color:#fff; background:${ACCENT}; padding:2.2mm 3.2mm; margin-top:1mm; }
  .product-visual { position:relative; margin:6mm 0; background:#fff; }
  .product-hero { width:100%; height:81mm; object-fit:contain; display:block; background:#fff; }
  .product-visual span { position:absolute; right:3mm; bottom:2.5mm; color:${INK_MUTED}; background:rgba(255,255,255,.88); padding:1mm 1.5mm; font-size:5.8pt; letter-spacing:.05em; text-transform:uppercase; }
  .product-grid { display:grid; grid-template-columns:1.08fr .92fr; gap:9mm; }
  .info-block { border-top:1px solid ${RULE}; padding-top:3mm; margin-top:4mm; }
  .info-block p:last-child, .watch-block p:last-child { color:${INK_SECONDARY}; font-size:8.2pt; }
  .spec-list { list-style:none; }
  .spec-list li { padding:2mm 0; border-top:1px solid ${RULE}; font-size:8.1pt; color:${INK_SECONDARY}; }
  .spec-list li::before { content:"- "; color:${ACCENT}; }
  .tag-list { display:flex; flex-wrap:wrap; gap:2mm; }
  .tag-list span { border:1px solid ${RULE}; padding:1.6mm 2.2mm; font-size:7.1pt; color:${INK_SECONDARY}; }
  .watch-block { margin-top:5mm; padding:4mm; background:#f3ecec; border-left:2px solid ${ACCENT}; }
  .project-note { position:absolute; left:16mm; right:16mm; bottom:16mm; color:${INK_MUTED}; font-size:6.8pt; }

  .feature { display:flex; gap:4mm; padding:3mm 0; border-bottom:1px solid ${RULE}; }
  .feature .no { font-family:"Fraunces",Georgia,serif; color:${ACCENT}; font-size:13pt; min-width:8mm; }
  .feature h4 { margin-bottom:.5mm; }
  .feature p { color:${INK_SECONDARY}; font-size:7.8pt; }
  .profile-photo { display:flex; gap:3mm; }
  .profile-photo img { width:50%; height:43mm; object-fit:contain; background:#f5f3ef; border:1px solid ${RULE}; }

  .swatch-grid { display:grid; grid-template-columns:1fr 1fr; gap:0 8mm; }
  .swatch { display:flex; gap:3mm; align-items:center; padding:2.2mm 0; border-bottom:1px solid ${RULE}; }
  .swatch-chip { width:10mm; height:10mm; border:1px solid rgba(0,0,0,.12); flex-shrink:0; object-fit:cover; }
  .swatch h4 { font-size:8.6pt; }
  .swatch p { font-size:6.8pt; color:${INK_MUTED}; }

  .care-grid { display:grid; grid-template-columns:1fr 1fr; gap:5mm; }
  .care-card { padding:5mm; background:${CANVAS}; }
  .care-card h3 { margin-bottom:2mm; }
  .care-card p { color:${INK_SECONDARY}; font-size:8.2pt; }
  .care-card .avoid { margin-top:2mm; color:${ACCENT}; font-size:7.5pt; font-weight:600; }
  .warranty-band { display:grid; grid-template-columns:38mm 1fr; gap:6mm; align-items:center; margin-top:7mm; padding:6mm; background:${INK}; color:#fff; }
  .warranty-band .year { font-family:"Fraunces",Georgia,serif; color:#fff; font-size:35pt; line-height:.9; }
  .warranty-band p { color:rgba(255,255,255,.76); font-size:8pt; }
  .warranty-band strong { color:#fff; }

  .back { background:#181512; color:#fff; display:flex; flex-direction:column; justify-content:space-between; }
  .back h2 { color:#fff; font-size:34pt; max-width:145mm; }
  .back .lead { color:rgba(255,255,255,.76); max-width:120mm; }
  .contact-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; border-top:1px solid rgba(255,255,255,.2); padding-top:6mm; }
  .contact-grid h3 { color:#fff; font-size:11pt; margin-bottom:1.5mm; }
  .contact-grid p { color:rgba(255,255,255,.68); font-size:7.6pt; }
  .back .direct { font-family:"Fraunces",Georgia,serif; font-size:18pt; color:#fff; margin-top:2mm; }
  .back .fine { color:rgba(255,255,255,.5); font-size:6.5pt; max-width:155mm; border-top:1px solid rgba(255,255,255,.2); padding-top:4mm; }
</style>
</head>
<body>

<section class="page cover">
  <img src="${img("/images/projects/real/residence-wood-grain-corner.webp")}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.04) brightness(.84);opacity:.5;" />
  <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(12,12,12,.96),rgba(16,16,16,.64) 58%,rgba(18,18,18,.28));"></div>
  ${wordmark()}
  <div style="position:relative;">
    <p class="eyebrow" style="color:#fff;opacity:.78;">Homeowner edition</p>
    <h1>Window + Door<br/>Replacement Guide<br/><em style="color:#d9d1c8;">and Options</em></h1>
    <p class="cover-sub">How to evaluate an opening, choose the right replacement approach, prepare for installation, and compare every FourlinQ window and door system.</p>
  </div>
  <div class="meta" style="position:relative;">
    <div><strong style="color:#fff;">${esc(BRAND.warranty)}</strong><br/>Custom-made to project specifications</div>
    <div style="text-align:right;">${esc(generatedOn)}<br/><a href="https://fourlinq.ph">fourlinq.ph</a> · <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></div>
  </div>
</section>

<section class="page">
  <p class="eyebrow">Start here</p>
  <h2>A clearer replacement journey.</h2>
  <p class="lead">You do not need to diagnose the wall, choose the installation method, or take fabrication measurements alone. Use this guide to prepare the brief; FourlinQ verifies the opening before anything is ordered.</p>
  <div class="journey">
    ${[
      ["01", "Evaluate", "Decide what needs attention."],
      ["02", "Survey", "Check frame, wall, water, and access."],
      ["03", "Select", "Choose operation, material, glass, and finish."],
      ["04", "Install", "Protect, remove, set, seal, and test."],
      ["05", "Handover", "Inspect, learn, document, and maintain."],
    ].map(([no, title, text]) => `<div class="journey-item"><span class="number">${no}</span><h3>${title}</h3><p>${text}</p></div>`).join("")}
  </div>
  <p class="eyebrow">Inside this brochure</p>
  <div class="contents">
    ${[
      ["Is it time to replace?", "03"], ["Choose the replacement path", "04"],
      ["Plan the survey and quote", "05"], ["What installation looks like", "06"],
      ["Material, glass, and design decisions", "07"], ["All options at a glance", "08"],
      ["Window option pages", "09-12"], ["Door option pages", "13-19"],
      ["What is inside the frame", "20"], ["Finish options", "21"],
      ["Care and warranty", "22"], ["Showrooms and direct lines", "23"],
    ].map(([title, page]) => `<div class="contents-row"><span>${title}</span><span>${page}</span></div>`).join("")}
  </div>
  <div class="note"><strong>One opening, one verified scope.</strong> Final dimensions, replacement method, code requirements, structural work, waterproofing, and permits are confirmed during project review.</div>
  ${footer(2, "How to use this guide")}
</section>

<section class="page">
  <p class="eyebrow">01 · Evaluate</p>
  <h2>Is it really time to replace?</h2>
  <p class="lead">Some symptoms need cleaning or adjustment. Others point to a failed seal, unsafe operation, or hidden water damage. Start with the symptom, then let the site survey confirm the cause.</p>
  <div class="signal-grid">
    <div class="signal-column">
      <span class="number">01</span><h3>Maintain first</h3>
      <div class="signal-item"><h4>Surface dirt</h4><p>Clean glass, frames, gaskets, sills, and tracks with mild soap and water.</p></div>
      <div class="signal-item"><h4>Minor stiffness</h4><p>Debris, dried residue, or a loose adjustment can make hardware feel rough.</p></div>
      <div class="signal-item"><h4>Room-side condensation</h4><p>Often indicates indoor humidity meeting a cooler surface. Ventilation may help.</p></div>
      <div class="signal-item"><h4>Cosmetic wear</h4><p>Scratches, dirty seals, or worn accessories do not automatically mean replacement.</p></div>
    </div>
    <div class="signal-column">
      <span class="number">02</span><h3>Schedule an assessment</h3>
      <div class="signal-item"><h4>Hard to open or lock</h4><p>Sticking, dragging, dropped panels, or recurring lock misalignment can signal worn hardware or movement.</p></div>
      <div class="signal-item"><h4>Drafts or uneven comfort</h4><p>Check perimeter seals, glazing, drainage, and the wall connection before choosing a remedy.</p></div>
      <div class="signal-item"><h4>Fog between glass panes</h4><p>Moisture trapped inside an insulated glass unit points to a failed glass seal.</p></div>
      <div class="signal-item"><h4>Persistent leaks</h4><p>The source can be the unit, perimeter seal, flashing, wall, roof, or drainage path.</p></div>
    </div>
    <div class="signal-column">
      <span class="number" style="color:#fff;">03</span><h3>Act promptly</h3>
      <div class="signal-item"><h4>Broken or loose glass</h4><p>Keep people away, secure the area, and arrange professional removal.</p></div>
      <div class="signal-item"><h4>Unsafe operation</h4><p>A sash or panel that can fall, detach, or cannot serve its required exit needs immediate attention.</p></div>
      <div class="signal-item"><h4>Water damage</h4><p>Staining, swelling, rot, mold, or soft framing can indicate concealed damage that must be opened and repaired.</p></div>
      <div class="signal-item"><h4>Security failure</h4><p>A unit that will not close or lock should be secured and assessed immediately.</p></div>
    </div>
  </div>
  <div class="note">Do not cover a recurring leak with new trim or sealant until the water path is understood. Replacement succeeds only when the opening and surrounding wall are sound.</div>
  ${footer(3, "Evaluate")}
</section>

<section class="page">
  <p class="eyebrow">02 · Choose the scope</p>
  <h2>Three replacement paths.</h2>
  <p class="lead">The visible problem does not always reveal the correct scope. A FourlinQ survey checks the existing frame, rough opening, waterproofing, structure, trim, floor level, and drainage before recommending a method.</p>
  <table class="method-table">
    <tr><th>Method</th><th>What is removed</th><th>Best used when</th><th>Trade-offs to confirm</th></tr>
    <tr><td>Insert or pocket</td><td>Old sash or panel, operating hardware, and selected covers. The sound existing frame stays.</td><td>The frame is square, dry, structurally sound, compatible, and worth preserving.</td><td>Usually less disruption, but the new unit sits inside the old frame and can reduce visible glass. The old perimeter still matters.</td></tr>
    <tr><td>Full-frame</td><td>The complete old window or door frame, often including interior/exterior trim at the opening.</td><td>The frame is damaged, leaking, incompatible, out of square, or the project needs a new sill/flashing detail.</td><td>Allows inspection and repair to the rough opening. More finish work, protection, time, and access are usually required.</td></tr>
    <tr><td>Opening conversion</td><td>The unit plus the wall or structural work needed to change size, shape, sill height, or use.</td><td>Turning a window into a door, enlarging an opening, or creating a new architectural composition.</td><td>May require an architect/engineer, permits, structural support, weathering design, electrical relocation, and new interior/exterior finishes.</td></tr>
  </table>
  <div class="grid3" style="margin-top:8mm;">
    <div class="card accent"><h3>Keep</h3><p>Sound structure, dry wall, serviceable trim, and any finish that the selected method can preserve without hiding a defect.</p></div>
    <div class="card accent"><h3>Replace</h3><p>Failed glass, worn operating parts, damaged frame, compromised seals, and materials included in the approved scope.</p></div>
    <div class="card accent"><h3>Repair first</h3><p>Rot, cracks, substrate failure, blocked drainage, structural movement, and wall leaks outside the window or door system.</p></div>
  </div>
  <div class="note"><strong>Safety and code check.</strong> Bedrooms, upper floors, guards, fall prevention, safety glazing, threshold accessibility, and emergency exits can change what is allowed. The current opening is not proof that it meets current requirements.</div>
  ${footer(4, "Replacement paths")}
</section>

<section class="page">
  <p class="eyebrow">03 · Survey and quote</p>
  <h2>What the project team needs.</h2>
  <p class="lead">A few homeowner details speed up the first conversation. Fabrication dimensions still come from the formal site survey.</p>
  <div class="check-grid">
    ${[
      ["Photos inside and outside", "Include the whole opening, close-ups of damage, sill/threshold, head, jambs, and the wall above."],
      ["Approximate opening size", "Width and height are enough for the first brief. Do not order from homeowner measurements."],
      ["Room and use", "Bedroom, kitchen, bathroom, living room, balcony, lanai, entrance, or commercial frontage."],
      ["How it should operate", "What opens now, what feels difficult, desired ventilation, access, security, and cleaning needs."],
      ["Material and finish direction", "uPVC or aluminium, interior/exterior color, glass privacy, grids, screens, and hardware preferences."],
      ["Access and protection", "Floor level, parking, stairs, lifts, scaffolding, furniture, landscaping, pets, children, and work-hour limits."],
      ["Known water or structural history", "Prior leaks, repairs, cracks, mold, pest damage, movement, or concealed services near the opening."],
      ["Decision and schedule", "Who approves the design, target completion, site restrictions, and any permit or building-admin process."],
    ].map(([title, text]) => `<div class="check"><div class="tick">✓</div><div><h4>${title}</h4><p>${text}</p></div></div>`).join("")}
  </div>
  <p class="eyebrow" style="margin-top:8mm;">What shapes the quote</p>
  <div class="quote-strip">
    ${[
      ["Type + quantity", "Operation, count, configuration"],
      ["Size + glass", "Panel area, safety, privacy, coating"],
      ["Material + finish", "uPVC or aluminium, profile, color"],
      ["Installation", "Method, access, removal, protection"],
      ["Make-good work", "Trim, plaster, paint, tile, waterproofing"],
    ].map(([title, text]) => `<div><p>${title}</p><p>${text}</p></div>`).join("")}
  </div>
  <div class="note"><strong>Before approval, ask for:</strong> product and configuration, included glass/hardware/finish, replacement method, exclusions, make-good responsibility, disposal, schedule, payment milestones, warranty, and the process for hidden damage or variation work.</div>
  ${footer(5, "Survey and quote")}
</section>

<section class="page">
  <p class="eyebrow">04 · Installation</p>
  <h2>What a professional replacement looks like.</h2>
  <p class="lead">The exact sequence changes by method and site, but the logic stays consistent: protect, verify, remove carefully, repair the opening, set the new system, weather it, and test every function.</p>
  <div class="timeline">
    ${[
      ["01", "Protect", "Confirm access and scope. Cover floors and furniture. Establish a safe work zone."],
      ["02", "Verify", "Recheck unit, opening, orientation, finish, glass, hardware, and any site condition that changed."],
      ["03", "Remove", "Take out only what the approved method requires. Corroded metal can require controlled chipping back to sound substrate."],
      ["04", "Inspect", "Check the uncovered opening for water, rot, cracks, substrate failure, and structural concerns."],
      ["05", "Repair", "Resolve approved opening defects and prepare a clean, supported, level installation surface."],
      ["06", "Set + fasten", "Position the frame plumb, level, square, and true. Fasten and pack without distorting it."],
      ["07", "Seal + finish", "Complete drainage, perimeter weathering, insulation, trim, sealant, and approved make-good work."],
      ["08", "Test + hand over", "Operate, lock, drain, clean, inspect glass/finish, explain care, and document the punch list."],
    ].map(([no, title, text]) => `<div class="timeline-item"><span class="number">${no}</span><h3>${title}</h3><p>${text}</p></div>`).join("")}
  </div>
  <p class="eyebrow" style="margin-top:8mm;">Homeowner preparation</p>
  <div class="prep">
    <div><h4>Before the crew arrives</h4><p>Remove curtains, blinds, fragile decor, and nearby furniture. Confirm building access, parking, power, water, and work-hour rules.</p></div>
    <div><h4>Keep the area safe</h4><p>Plan for children and pets. Disarm affected sensors. Protect valuable landscaping and identify concealed utilities or alarms.</p></div>
    <div><h4>Before sign-off</h4><p>Open, close, lock, and inspect every unit. Review seals, trim, glass, cleanup, care, warranty documents, and any remaining punch-list item.</p></div>
  </div>
  <div class="note">Hidden damage can only be priced accurately after it is exposed. Agree in writing how work pauses, how the condition is documented, who approves a variation, and when installation resumes.</div>
  ${footer(6, "Installation")}
</section>

<section class="page">
  <p class="eyebrow">05 · Select</p>
  <h2>Material, glass, and design.</h2>
  <p class="lead">Choose the operating type first, then build the specification around the actual room, exposure, opening size, desired sightline, and maintenance expectations.</p>
  <div class="grid2">
    <div class="material"><p class="section-label">Frame material</p><h3>${esc(upvc.label)}</h3><ul class="plain">${upvc.highlights.slice(0,7).map((text) => `<li>${esc(text)}</li>`).join("")}</ul></div>
    <div class="material"><p class="section-label">Frame material</p><h3>${esc(aluminium.label)}</h3><ul class="plain">${aluminium.highlights.map((text) => `<li>${esc(text)}</li>`).join("")}</ul><p class="section-label" style="margin-top:5mm;">FourlinQ profile directions</p><ul class="plain">${PROFILE_SYSTEMS.filter((item) => item.material === "aluminium").map((item) => `<li>${esc(item.name)}${item.note ? ` · ${esc(item.note)}` : ""}</li>`).join("")}</ul></div>
  </div>
  <div class="decision-grid">
    <div><h3>Operation</h3><p>Airflow, exterior/interior clearance, panel weight, daily access, cleaning, insect screen, and emergency use.</p></div>
    <div><h3>Glass</h3><p>Clear view, privacy, solar control, safety, security, sound, panel size, and the frame's supported glass build-up.</p></div>
    <div><h3>Finish</h3><p>Interior/exterior palette, sheen, wood-grain direction, adjacent paint/tile, physical sample, and long-term care.</p></div>
    <div><h3>Hardware</h3><p>Handle reach, lock points, child safety, corrosion exposure, replacement access, and service requirements.</p></div>
    <div><h3>Weathering</h3><p>Gaskets, sill/threshold, drainage, flashing, perimeter seal, roof overhang, wind-driven rain, and facade exposure.</p></div>
    <div><h3>Codes + structure</h3><p>Safety glazing, guards, egress, fall prevention, accessibility, wind load, support, permits, and building rules.</p></div>
  </div>
  <div class="note">Glass labels in the option pages describe available design directions from the current catalog. Final availability, thickness, make-up, safety treatment, and performance are confirmed with the project specification.</div>
  ${footer(7, "Selection decisions")}
</section>

<section class="page">
  <p class="eyebrow">Complete product index</p>
  <h2>Every window. Every door.</h2>
  <p class="lead">Each system has its own page with how it works, where it fits, typical replacement considerations, features, and glass directions.</p>
  <div class="index-grid">
    <div class="index-column"><h3>Window option</h3>${windowProduct.map((item, index) => `<div class="index-row"><img src="${img(item.image)}"/><div><h4>${esc(item.name)}</h4><p>${esc(item.shortDescription)}</p></div><strong>${String(9 + index).padStart(2,"0")}</strong></div>`).join("")}</div>
    <div class="index-column"><h3>Door option</h3>${doorProduct.map((item, index) => `<div class="index-row"><img src="${img(item.image)}"/><div><h4>${esc(item.name)}</h4><p>${esc(productTagline[item.id] ?? item.shortDescription)}</p></div><strong>${String(13 + index).padStart(2,"0")}</strong></div>`).join("")}</div>
  </div>
  <div style="margin-top:8mm;display:grid;grid-template-columns:1fr 1fr;gap:8mm;align-items:center;">
    <img src="${img("/images/projects/real/sliding-doors-lanai.webp")}" style="width:100%;height:49mm;object-fit:cover;"/>
    <div><p class="section-label">Need help choosing?</p><h3 style="font-size:18pt;margin-bottom:3mm;">Begin with the opening, not the product name.</h3><p style="color:${INK_SECONDARY};">Bring photos, approximate sizes, room use, and the change you want. FourlinQ can narrow the range before the formal site survey.</p></div>
  </div>
  ${footer(8, "Product index")}
</section>

${brochureProduct.map((item, index) => productPage(item, 9 + index)).join("")}

<section class="page">
  <p class="eyebrow">System engineering</p>
  <h2>What is inside the uPVC frame.</h2>
  <div style="display:grid;grid-template-columns:1.25fr .75fr;gap:8mm;align-items:start;margin-bottom:4mm;">
    <p class="lead" style="margin:0;">Seven features from the FourlinQ brochure work together as one system: glass, profile, reinforcement, seals, glazing security, and controlled drainage.</p>
    <div class="profile-photo"><img src="${img("/images/wp-export/White-Profile.jpg")}"/><img src="${img("/images/wp-export/Walnut-Profile.jpg")}"/></div>
  </div>
  ${UPVC_PROFILE_FEATURES.map((item) => `<div class="feature"><div class="no">${String(item.number).padStart(2,"0")}</div><div><h4>${esc(item.label)}</h4><p>${esc(item.descriptionVerbatim)}</p></div></div>`).join("")}
  <p class="eyebrow" style="margin-top:6mm;">The FourlinQ advantages</p>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;">${ADVANTAGES.map((item) => `<div class="card accent"><h4>${esc(item.label)}</h4></div>`).join("")}</div>
  ${footer(20, "Profile engineering")}
</section>

<section class="page">
  <p class="eyebrow">Finish options</p>
  <h2>Twelve uPVC finishes.</h2>
  <p class="lead">Use this page to narrow the palette, then review a physical profile sample beside the actual wall, floor, metalwork, and daylight before approval.</p>
  <div class="swatch-grid">
    <div><p class="section-label">Wood grain</p>${woodFinish.map((item) => `<div class="swatch">${item.textureImagePath ? `<img class="swatch-chip" src="${img(item.textureImagePath)}"/>` : `<div class="swatch-chip" style="background:${item.swatchHex}"></div>`}<div><h4>${esc(item.label)}</h4><p>${esc(item.description)}</p></div></div>`).join("")}</div>
    <div><p class="section-label">Solid</p>${solidFinish.map((item) => `<div class="swatch"><div class="swatch-chip" style="background:${item.swatchHex}"></div><div><h4>${esc(item.label)}</h4><p>${esc(item.description)}</p></div></div>`).join("")}<p class="section-label" style="margin-top:6mm;">Aluminium powder-coat</p>${ALUMINIUM_FINISHES.map((item) => `<div class="swatch"><div class="swatch-chip" style="background:${item.hex}"></div><div><h4>${esc(item.name)}</h4></div></div>`).join("")}</div>
  </div>
  <div class="note">Printed and screen colors are approximations. Availability can vary by material, profile system, hardware, and project. Approve the supplied physical sample and written specification.</div>
  ${footer(21, "Finishes")}
</section>

<section class="page">
  <p class="eyebrow">Care + warranty</p>
  <h2>Keep the new system working well.</h2>
  <p class="lead">Simple care protects drainage, seals, finishes, glass, and hardware. Ask the installation team to demonstrate the exact cleaning and adjustment points before handover.</p>
  <div class="care-grid">
    <div class="care-card"><h3>Frames + gaskets</h3><p>Use clean water or mild detergent on a soft cloth. Rinse and dry. Wipe, do not pull, the weather seals.</p><p class="avoid">Avoid abrasive pads, strong solvents, bleach, paint thinner, and unapproved polish.</p></div>
    <div class="care-card"><h3>Sills + tracks</h3><p>Vacuum or brush out grit. Keep drainage openings clear. Wash with mild soap and water when needed.</p><p class="avoid">Do not fill drainage paths with sealant, paint, cement, or debris.</p></div>
    <div class="care-card"><h3>Glass</h3><p>Loosen dirt with water and mild soap, rinse, then dry from top to bottom with a clean soft cloth.</p><p class="avoid">Avoid blades, scrapers, abrasive applicators, and impact near glass edges.</p></div>
    <div class="care-card"><h3>Hardware</h3><p>Wipe handles, hinges, rollers, and locks with a soft damp cloth. Report rough movement before forcing it.</p><p class="avoid">Do not use household chemicals or lubricants unless FourlinQ approves them for the component.</p></div>
  </div>
  <div class="warranty-band">
    <div><div class="year">10</div><p style="color:#fff;text-transform:uppercase;letter-spacing:.12em;">Year limited warranty</p></div>
    <div><p><strong>Verified scope:</strong> corrosion resistance, long lasting performance, weather resistance, and sound insulation.</p><p style="margin-top:3mm;">Full terms, exclusions, registration, project-specific coverage, and installation responsibilities are supplied with the order. Keep the signed specification, warranty document, invoice, and handover record.</p></div>
  </div>
  <div class="note"><strong>After installation:</strong> operate and lock each unit, inspect seals and drainage, check glass and finish in normal light, record any punch-list item, and save the care and warranty documents.</div>
  ${footer(22, "Care and warranty")}
</section>

<section class="page back">
  ${wordmark()}
  <div>
    <p class="eyebrow" style="color:#fff;opacity:.68;">Your next step</p>
    <h2>Bring the opening.<br/>We will build the answer.</h2>
    <p class="lead">Send photos and approximate sizes, or bring your floor plan to a showroom. The project team will help define the system, survey scope, finish, glass, installation method, and quote.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm;margin:8mm 0 10mm;">
      <div><p class="section-label" style="color:rgba(255,255,255,.5);">Sales</p><p class="direct"><a href="tel:+639258488888">${esc(CONTACT.mobileSales)}</a></p></div>
      <div><p class="section-label" style="color:rgba(255,255,255,.5);">Assistance</p><p class="direct"><a href="tel:+639258965978">${esc(CONTACT.mobileAssist)}</a></p></div>
      <div><p class="section-label" style="color:rgba(255,255,255,.5);">Email</p><p class="direct" style="font-size:14pt;"><a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></p></div>
    </div>
    <div class="contact-grid">
      ${BRANCHES.map((item) => `<div><h3>${esc(item.label)}</h3><p>${esc(item.address)}</p></div>`).join("")}
    </div>
  </div>
  <div>
    <p class="fine">This brochure is a planning guide, not a fabrication drawing, engineering calculation, permit approval, or site-specific installation instruction. Product availability and specifications can change. Final configuration, dimensions, material, finish, glass, hardware, drainage, structural support, code compliance, installation scope, and warranty are governed by the approved FourlinQ quotation and project documents.</p>
    <div style="display:flex;justify-content:space-between;margin-top:4mm;color:rgba(255,255,255,.6);font-size:7pt;"><span><a href="https://fourlinq.ph">fourlinq.ph</a></span><span>${esc(generatedOn)} · 23/23</span></div>
  </div>
</section>

</body>
</html>`;

async function main() {
  const actualProduct = brochureProduct.map((item) => item.id);
  if (actualProduct.length !== expectedProduct.length || actualProduct.some((id, index) => id !== expectedProduct[index])) {
    throw new Error(`Brochure inventory changed. Expected ${expectedProduct.join(", ")}; received ${actualProduct.join(", ")}. Update pagination and approved copy before rendering.`);
  }
  for (const file of [OUT_PATH, LEGACY_PATH, DELIVERY_PATH]) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  const neededImage = [
    "/images/projects/real/residence-wood-grain-corner.webp",
    "/images/projects/real/sliding-doors-lanai.webp",
    "/images/wp-export/White-Profile.jpg",
    "/images/wp-export/Walnut-Profile.jpg",
    ...brochureProduct.map((item) => item.image),
    ...FRAME_FINISHES.filter((item) => item.textureImagePath).map((item) => item.textureImagePath!),
  ];
  for (const publicPath of new Set(neededImage)) {
    await prepareImage(publicPath, publicPath.includes("projects/real") ? 1600 : 1200);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(buildHtml(), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: OUT_PATH,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    tagged: true,
    outline: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
  await browser.close();

  fs.copyFileSync(OUT_PATH, LEGACY_PATH);
  fs.copyFileSync(OUT_PATH, DELIVERY_PATH);
  const kb = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
  console.log(`Wrote ${OUT_PATH} (${kb} KB)`);
  console.log(`Updated compatibility copy ${LEGACY_PATH}`);
  console.log(`Wrote delivery copy ${DELIVERY_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Render a PRODUCT TILE from a system GLB the repo owns.
 *
 * Why a browser and not a headless three.js render: the geometry, the finish
 * materials, the environment map and the camera framing all live in the React
 * viewer (src/components/3d/Window3D.tsx). Re-implementing that off-page would
 * mean a second, drifting definition of what a FourlinQ system looks like. So
 * this drives the real viewer at /design-tool and photographs it — the tile is
 * by construction the same object the customer rotates.
 *
 * Three things make the capture usable as a tile rather than a screenshot:
 *
 *   1. TRANSPARENCY — the viewer's WebGL context is created with `alpha: true`
 *      (Window3D.tsx:361), so the canvas itself has an empty background. That is
 *      NOT enough on its own: Playwright's element screenshot goes through the
 *      compositor, so the gradient on the canvas's PARENT (Window3D.tsx:348-355)
 *      and the page's own body background both show through and come back opaque.
 *      Every ancestor of the canvas is forced transparent before the shot, and
 *      `omitBackground` drops the browser's default white base.
 *
 *   2. NO CHROME — the "Live 3D · …" badge, the "Drag to rotate" hint and the
 *      open/close button are DOM, painted ABOVE the canvas and overlapping its
 *      box, so the compositor bakes them into an element screenshot. They are
 *      hidden before capture.
 *
 *   3. TRIM — the viewer frames the model with generous margin. sharp's `.trim()`
 *      against a fully-transparent reference crops back to the model's real
 *      bounds (contact shadow included), then a fixed margin is added back so the
 *      tile does not read as cropped.
 *
 * Usage:
 *   node scripts/render-product-tile.mjs --system louvre --out public/images/products/louvre.png
 *   node scripts/render-product-tile.mjs --system louvre --finish walnut --width 1200
 *
 * Requires the built site to be served, e.g. `npm run build && npx vite preview --port 4173`.
 */

import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const arg = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = arg.indexOf(`--${name}`);
  return i >= 0 && arg[i + 1] ? arg[i + 1] : fallback;
};

const BASE = flag("base", "http://localhost:4173");
const SYSTEM = flag("system", null);
const OUT = flag("out", null);
/* Label, not id: the finish buttons carry `title={f.label}` and no data
   attribute (Window3D.tsx:465-486), so the label is the only handle. An id is
   accepted too and de-slugified, because the ids are what src/data reads like. */
const FINISH = flag("finish", null);
const WIDTH = Number(flag("width", 1200));
/* Letterbox the trimmed model into a fixed aspect.

   16:9, not 4:3, and the difference is not cosmetic. /products renders the grid
   card as `aspect-video … object-cover` (src/pages/Products.tsx:342) — cover
   CROPS to fill, so a 4:3 render loses 225 of its 900 rows, 113 off the top and
   113 off the bottom. On a window that is exactly the head rail and the sill:
   the two details that say which system it is.

   The detail drawer is `aspect-[4/3] … object-contain` (:109), and contain
   letterboxes rather than crops, so it is safe at any ratio. 16:9 is therefore
   the one aspect that is lossless on both surfaces. */
const ASPECT = flag("aspect", "16:9");
/* Capture the mechanism open. For a louvre this is not cosmetic: closed, the
   blades read as a flat glazed panel and nothing on the tile says "louvre". */
const OPEN = arg.includes("--open");
/* Margin added back after trim, as a fraction of the trimmed long edge. Enough
   that the frame does not touch the tile edge; small enough that the object
   still dominates. */
const MARGIN_RATIO = 0.06;
/* Render large, downscale to WIDTH. Supersampling is what keeps the mullions
   and the louvre blade edges from aliasing into mush at tile size. */
const VIEWPORT = { width: 1600, height: 1800 };
const SCALE = 2;

if (!SYSTEM || !OUT) {
  console.error("usage: node scripts/render-product-tile.mjs --system <id> --out <file.png> [--finish <label|id>] [--width 1200] [--base http://localhost:4173]");
  process.exit(2);
}

/** "jet-black" -> "Jet Black"; leaves an already-spaced label alone. */
const finishLabel = (v) =>
  v.includes("-") ? v.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : v;

const main = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: SCALE });

  const consoleError = [];
  page.on("pageerror", (e) => consoleError.push(String(e).slice(0, 200)));

  await page.goto(`${BASE}/design-tool`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);

  /* The consent banner sits above the configurator; leaving it up makes every
     later click retry until it times out. */
  for (const label of [/^Accept$/i, /^Decline$/i]) {
    const b = page.getByRole("button", { name: label }).first();
    if (await b.count().catch(() => 0)) {
      await b.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
  }

  const toggle = page.getByRole("button", { name: /^3D$/i }).first();
  if (await toggle.count()) await toggle.click({ timeout: 5000 }).catch(() => {});
  await page.waitForSelector("canvas", { timeout: 60000 });
  await page.waitForTimeout(2500);

  /* Select the system off the viewer's own rail. It carries every entry in
     CATALOGUE_SYSTEM, including the ones the configurator's product-type picker
     has no card for (louvre among them). */
  const tab = page.locator(`[data-system-rail] button[data-system="${SYSTEM}"]`).first();
  if (!(await tab.count())) {
    const known = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-system-rail] button[data-system]")).map((b) =>
        b.getAttribute("data-system"),
      ),
    );
    console.error(`unknown system "${SYSTEM}". Known: ${known.join(", ")}`);
    await browser.close();
    process.exit(2);
  }
  await tab.click({ timeout: 8000 });
  await page.waitForTimeout(2200);

  if (FINISH) {
    /* Scoped by walking up from the rail to the ancestor that also holds the
       canvas: /design-tool has a SECOND finish control in its left-hand config
       panel, and a bare title match would click that one instead. */
    const picked = await page.evaluate((label) => {
      const rail = document.querySelector("[data-system-rail]");
      if (!rail) return "no rail";
      let root = rail;
      while (root && !root.querySelector("canvas")) root = root.parentElement;
      if (!root) return "no viewer root";
      const btn = Array.from(root.querySelectorAll("button[title]")).find(
        (b) => b.getAttribute("title").toLowerCase() === label.toLowerCase(),
      );
      if (!btn) {
        const have = Array.from(root.querySelectorAll("button[title]")).map((b) => b.title);
        return `no finish "${label}". Have: ${have.join(", ")}`;
      }
      btn.click();
      return "ok";
    }, finishLabel(FINISH));
    if (picked !== "ok") {
      console.error(picked);
      await browser.close();
      process.exit(2);
    }
    await page.waitForTimeout(1600);
  }

  if (OPEN) {
    const openBtn = page.locator("button[data-open-toggle]").first();
    if (!(await openBtn.count().catch(() => 0))) {
      console.error(`--open requested but "${SYSTEM}" has no open control (fixed glazing).`);
      await browser.close();
      process.exit(2);
    }
    await openBtn.click({ timeout: 8000 });
    /* The viewer does not play the clip — it scrubs action.time toward the
       system's `openTime` at 2.5 clip-seconds per real second (Window3D.tsx:
       197-208), so the longest system (a 4.0s openTime) settles in ~1.6s. Five
       seconds is a wide margin over that, not a guess at a clip length. */
    await page.waitForTimeout(5000);
  }

  /* Strip everything that is not the model: the overlay chrome that overlaps the
     canvas box, and every background behind it up the ancestor chain. */
  const stripped = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return null;
    let hidden = 0;
    let node = canvas;
    while (node && node !== document.body) {
      const parent = node.parentElement;
      if (!parent) break;
      /* Siblings of the canvas's wrapper are the badge, the drag hint and the
         open/close control — all painted above the canvas. */
      for (const sib of Array.from(parent.children)) {
        if (sib !== node) {
          sib.style.setProperty("visibility", "hidden", "important");
          hidden++;
        }
      }
      parent.style.setProperty("background", "transparent", "important");
      parent.style.setProperty("background-image", "none", "important");
      parent.style.setProperty("box-shadow", "none", "important");
      node = parent;
    }
    for (const el of [document.documentElement, document.body]) {
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("background-image", "none", "important");
    }
    const r = canvas.getBoundingClientRect();
    return { hidden, cssWidth: Math.round(r.width), cssHeight: Math.round(r.height) };
  });
  if (!stripped) {
    console.error("no canvas on the page");
    await browser.close();
    process.exit(1);
  }
  await page.waitForTimeout(600);

  const png = await page.locator("canvas").first().screenshot({
    omitBackground: true,
    timeout: 20000,
  });
  await browser.close();

  const rawMeta = await sharp(png).metadata();

  /* Trim against fully-transparent black, so the reference is the empty
     background rather than whatever colour happens to sit in a corner. */
  const trimmed = await sharp(png)
    .ensureAlpha()
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 6 })
    .toBuffer({ resolveWithObject: true });

  const tw = trimmed.info.width;
  const th = trimmed.info.height;
  if (!tw || !th || tw < 32 || th < 32) {
    console.error(`trim left ${tw}x${th} — the capture contains no model. Refusing to write.`);
    process.exit(1);
  }

  const pad = Math.round(Math.max(tw, th) * MARGIN_RATIO);
  const padded = { w: tw + pad * 2, h: th + pad * 2 };

  /* Letterbox to the requested aspect, centred, on transparency. */
  const [ax, ay] = ASPECT.split(":").map(Number);
  if (!ax || !ay) {
    console.error(`--aspect must look like 16:9, got "${ASPECT}"`);
    process.exit(2);
  }
  const target = { w: padded.w, h: padded.h };
  if (padded.w / padded.h < ax / ay) target.w = Math.round(padded.h * (ax / ay));
  else target.h = Math.round(padded.w * (ay / ax));

  /* Two passes on purpose. sharp runs resize BEFORE extend within a single
     pipeline no matter the chaining order, so a one-pass version silently
     resized the 506px-wide TRIMMED buffer (a no-op under withoutEnlargement)
     and then extended past the requested width — the file came out 2114px. */
  const boxed = await sharp(trimmed.data)
    .extend({
      top: pad + Math.floor((target.h - padded.h) / 2),
      bottom: pad + Math.ceil((target.h - padded.h) / 2),
      left: pad + Math.floor((target.w - padded.w) / 2),
      right: pad + Math.ceil((target.w - padded.w) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const finalBuf = await sharp(boxed)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  /* Prove the two things a tile has to be: actually transparent, and actually
     containing a model. Both measured off the written pixels, not assumed. */
  const out = await sharp(finalBuf);
  const meta = await out.metadata();
  const { data } = await sharp(finalBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let clear = 0;
  let solid = 0;
  const total = data.length / 4;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) clear++;
    else if (data[i] === 255) solid++;
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, finalBuf);

  console.log(`system      ${SYSTEM}${FINISH ? `  finish ${finishLabel(FINISH)}` : ""}`);
  console.log(`capture     ${rawMeta.width}x${rawMeta.height} (css ${stripped.cssWidth}x${stripped.cssHeight}, dpr ${SCALE}), ${stripped.hidden} chrome element hidden`);
  console.log(`trimmed     ${tw}x${th}  (+${pad}px margin, letterboxed to ${ASPECT} => ${target.w}x${target.h})`);
  console.log(`written     ${OUT}  ${meta.width}x${meta.height}  alpha=${meta.hasAlpha}  ${(finalBuf.length / 1024).toFixed(1)} KB`);
  console.log(`alpha       ${((clear / total) * 100).toFixed(1)}% fully transparent, ${((solid / total) * 100).toFixed(1)}% fully opaque, ${(((total - clear - solid) / total) * 100).toFixed(1)}% partial`);
  if (consoleError.length) console.log(`page error  ${consoleError.length}: ${consoleError[0]}`);

  if (!meta.hasAlpha || clear === 0) {
    console.error("FAIL: output has no transparent pixel — the background was composited in.");
    process.exit(1);
  }
  if (solid + (total - clear - solid) === 0) {
    console.error("FAIL: output is entirely transparent — no model captured.");
    process.exit(1);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

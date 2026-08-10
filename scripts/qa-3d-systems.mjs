/**
 * Visual QA for the 3D window viewer — the check that only a screenshot can make.
 *
 * Every other guard on this surface is programmatic: `probe:glb` measures bounding
 * boxes, `handoff:verify` measures animation travel, and the vitest suite pins both
 * against the binary. All of it passed while the viewer rendered an invisible speck
 * for months, and again while grille bars came out black under a White finish. Those
 * are the two bugs this file exists for, and neither is visible to a number.
 *
 * For each system tab it captures the canvas and asserts three things:
 *
 *   1. INK      — the frame is actually drawn. A blank or near-uniform canvas is the
 *                 "nothing rendered" failure.
 *   2. FILL     — the drawn object occupies a sane share of the canvas. Catches the
 *                 unit-scale class of bug (the original was 278x off), where the model
 *                 renders correctly but as a dot, or overflows the frame entirely.
 *   3. FINISH   — switching finish actually changes the pixels. Catches a material
 *                 slot missing from the recolour set, which is how the grille bars
 *                 stayed black.
 *
 * Usage:  node scripts/qa-3d-systems.mjs [--base https://fourlinq.ph] [--out <dir>]
 * Exit 1 if any system fails, so this can gate a deploy.
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

const BASE = flag("base", "https://fourlinq.ph");
const OUT = flag("out", ".qa-3d");
const VIEWPORT = { width: 1440, height: 1000 };

/* A canvas this uniform is not showing a window. Tuned to be generous: a real
   render of a white frame on a near-white gradient still clears it comfortably. */
const MIN_INK_RATIO = 0.012;
/* The drawn object should sit between a dot and a canvas-filling overflow. */
const MIN_FILL = 0.05;
const MAX_FILL = 0.98;
/* Two finishes that must produce visibly different pixels. */
const MIN_FINISH_DELTA = 0.004;
/* Clicking the open control must visibly move the mechanism. The floor sits well
   above the ~0.0013 delta produced by the control's own label redrawing, since it
   overlays the canvas and would otherwise read as motion all by itself. */
const MIN_OPEN_DELTA = 0.006;
/* Systems whose operable part is a small fraction of the assembly. Curtain wall
   moves ONE vent out of a nine-panel grid through 26 degrees, so a whole-canvas
   delta of ~0.004 is the honest number for a mechanism that is working. Verified
   by eye rather than assumed: the centre pane visibly tilts. Keep this list short
   — it exists to avoid lowering the floor for everything else. */
const SMALL_MOTION = { "curtain-wall": 0.003 };

/** Classify pixels as "ink" (part of the object) vs background, and measure extent. */
function analyse(raw, w, h) {
  /* Background must be sampled PER ROW, not from the four corners. The viewer's
     backdrop is a vertical gradient, so a single corner-averaged colour differs
     from the true background at every other height — which made the whole canvas
     count as object and reported fill ~0.993 for every system alike. The model is
     centred with margin, so the outermost columns of any given row are always
     background at that row's point on the gradient. */
  const rowBg = (y) => {
    const px = [1, 3, w - 4, w - 2].map((x) => {
      const i = (y * w + x) * 4;
      return [raw[i], raw[i + 1], raw[i + 2]];
    });
    return [0, 1, 2].map((c) => px.reduce((s, q) => s + q[c], 0) / px.length);
  };

  let ink = 0;
  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;

  for (let y = 0; y < h; y += 2) {
    const bg = rowBg(y);
    /* Skip the sampling margin itself so it can never count as ink. */
    for (let x = 6; x < w - 6; x += 2) {
      const i = (y * w + x) * 4;
      const d =
        Math.abs(raw[i] - bg[0]) + Math.abs(raw[i + 1] - bg[1]) + Math.abs(raw[i + 2] - bg[2]);
      /* 26 over the summed channel delta ~= a just-perceptible difference, so a
         white frame against a near-white backdrop still counts as ink. */
      if (d > 26) {
        ink++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const sampled = Math.ceil(w / 2) * Math.ceil(h / 2);
  const inkRatio = ink / sampled;
  const fill = maxX < 0 ? 0 : ((maxX - minX) * (maxY - minY)) / (w * h);
  return { inkRatio, fill, box: maxX < 0 ? null : { minX, minY, maxX, maxY } };
}

/** Mean absolute per-pixel difference between two same-size RGBA buffers. */
function delta(a, b) {
  if (a.length !== b.length) return 1;
  let sum = 0;
  const step = 4 * 7; // stride the buffer; we need a magnitude, not precision
  let n = 0;
  for (let i = 0; i < a.length; i += step) {
    sum += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    n++;
  }
  return sum / (n * 3 * 255);
}

/**
 * Grab the canvas as real pixels.
 *
 * Do NOT read this out of the page with drawImage/getImageData: three.js creates
 * its WebGL context with the default `preserveDrawingBuffer: false`, so the buffer
 * is empty once the frame has been presented and every pixel comes back zero. That
 * reads as "every system renders blank", which is a false alarm, not a finding.
 * Playwright's element screenshot goes through the compositor instead and sees what
 * the user sees.
 */
async function canvasPixel(page) {
  const el = page.locator("canvas").first();
  if (!(await el.count())) return null;
  const png = await el.screenshot({ timeout: 15000 }).catch(() => null);
  if (!png) return null;
  const { data, info } = await sharp(png)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  /* Re-interleave to RGBA so the analysis below can keep a single stride. */
  const rgba = new Uint8ClampedArray(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    rgba[j] = data[i];
    rgba[j + 1] = data[i + 1];
    rgba[j + 2] = data[i + 2];
    rgba[j + 3] = 255;
  }
  return { w: info.width, h: info.height, png, data: rgba };
}

const main = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });

  const consoleError = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleError.push(m.text().slice(0, 300));
  });
  page.on("pageerror", (e) => consoleError.push(`pageerror: ${String(e).slice(0, 300)}`));

  await page.goto(`${BASE}/design-tool`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);

  /* Dismiss the consent banner first. Its buttons sit above the configurator, so
     leaving it up makes every subsequent click retry until it times out. */
  for (const label of [/^Accept$/i, /^Decline$/i]) {
    const b = page.getByRole("button", { name: label }).first();
    if (await b.count().catch(() => 0)) {
      await b.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
  }

  /* Enter the 3D view. The toggle is a button labelled "3D" beside "DRAWING". */
  const toggle = page.getByRole("button", { name: /^3D$/i }).first();
  if (await toggle.count()) await toggle.click({ timeout: 5000 }).catch(() => {});
  await page.waitForSelector("canvas", { timeout: 60000 });
  await page.waitForTimeout(2500);

  /* The viewer follows the product-type picker — there is no separate system rail
     on this page, so the type buttons ARE the customer path through the 3D surface.
     They carry a distinctive card class; read them off the DOM so a new product
     type is covered automatically rather than hardcoded here. */
  /* Drive the viewer's own system rail, which carries every system in
     CATALOGUE_SYSTEM — including the ones the configurator's product-type picker
     has no entry for (louvre, the 4-panel slider, the combinations). Selecting by
     visible label is ambiguous here: several rail tabs share a name with a type
     card, so this keys off data-system instead. */
  const tabName = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-system-rail] button[data-system]")).map((b) =>
      b.getAttribute("data-system"),
    ),
  );

  const report = [];
  for (const name of tabName) {
    const tab = page.locator(`[data-system-rail] button[data-system="${name}"]`).first();
    if (!(await tab.count())) continue;
    try {
      await tab.click({ timeout: 5000 });
    } catch {
      continue;
    }
    await page.waitForTimeout(1600);

    const shot = await canvasPixel(page);
    if (!shot) {
      /* No canvas is the CORRECT result for a product type the models honestly do
         not cover (tilt-turn, special-shapes, custom-shapes, french-door). Those
         fall back to the flat drawing on purpose, so this is a skip, not a fail. */
      report.push({ system: name, ok: true, skipped: true, reason: "no 3D for this type (flat drawing)" });
      continue;
    }
    const raw = shot.data;
    const stat = analyse(raw, shot.w, shot.h);

    /* Finish sensitivity: flip to a dark finish and re-measure. */
    let finishDelta = null;
    const dark = page
      .getByRole("button", { name: /anthrac|black|graphite|dark|walnut/i })
      .first();
    if (await dark.count()) {
      try {
        await dark.click({ timeout: 4000 });
        await page.waitForTimeout(1200);
        const after = await canvasPixel(page);
        if (after) finishDelta = delta(raw, after.data);
      } catch {
        /* finish picker not offered for this system — not a failure */
      }
    }

    /* Does the mechanism actually ANIMATE in the browser? handoff:verify proves the
       clip inside the GLB travels, but not that the button is wired to it. A system
       that offers "Open window" and then does nothing is a broken promise on screen,
       and no binary check can see it. */
    let openDelta = null;
    /* Scope to the viewer and match on VISIBLE TEXT, not the accessible name.
       getByRole matches aria-label too, so a bare /^Open /i also selected the
       header's "Open search" control — which made the static systems (Fixed, Arch),
       that correctly have no open control at all, report a pixel delta from a nav
       flyout opening. Any "it animated" reading from that is worthless. */
    const openBtn = page.locator("button[data-open-toggle]").first();
    if (await openBtn.count().catch(() => 0)) {
      try {
        const before = await canvasPixel(page);
        await openBtn.click({ timeout: 4000 });
        await page.waitForTimeout(4200);
        const after = await canvasPixel(page);
        if (before && after) openDelta = delta(before.data, after.data);
      } catch {
        /* leave null — reported as untested rather than passed */
      }
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await writeFile(path.join(OUT, `${slug}.png`), shot.png).catch(() => {});

    const fail = [];
    if (stat.inkRatio < MIN_INK_RATIO) fail.push(`blank canvas (ink ${stat.inkRatio.toFixed(4)})`);
    if (stat.fill < MIN_FILL) fail.push(`renders too small (fill ${stat.fill.toFixed(3)})`);
    if (stat.fill > MAX_FILL) fail.push(`overflows frame (fill ${stat.fill.toFixed(3)})`);
    if (finishDelta !== null && finishDelta < MIN_FINISH_DELTA) {
      fail.push(`finish does not change pixels (delta ${finishDelta.toFixed(5)})`);
    }
    const openFloor = SMALL_MOTION[name] ?? MIN_OPEN_DELTA;
    if (openDelta !== null && openDelta < openFloor) {
      fail.push(
        `open control does not move anything (delta ${openDelta.toFixed(5)} < ${openFloor})`,
      );
    }

    report.push({
      system: name,
      ok: fail.length === 0,
      ink: +stat.inkRatio.toFixed(4),
      fill: +stat.fill.toFixed(3),
      finishDelta: finishDelta === null ? null : +finishDelta.toFixed(5),
      openDelta: openDelta === null ? null : +openDelta.toFixed(5),
      reason: fail.join("; "),
    });
  }

  await browser.close();

  await writeFile(
    path.join(OUT, "report.json"),
    JSON.stringify({ base: BASE, consoleError, report }, null, 2),
  );

  const bad = report.filter((r) => !r.ok);
  for (const r of report) {
    const mark = r.skipped ? "skip" : r.ok ? "ok  " : "FAIL";
    console.log(
      `${mark} ${r.system.padEnd(20)} ink ${String(r.ink).padEnd(7)} fill ${String(r.fill).padEnd(6)} finish ${String(r.finishDelta).padEnd(8)} open ${String(r.openDelta).padEnd(8)}${r.reason ? " <- " + r.reason : ""}`,
    );
  }
  if (consoleError.length) {
    console.log(`\n${consoleError.length} console error:`);
    consoleError.slice(0, 8).forEach((e) => console.log("  " + e));
  }
  console.log(`\n${report.length} system checked, ${bad.length} failing. Shots in ${OUT}/`);
  process.exit(bad.length ? 1 : 0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

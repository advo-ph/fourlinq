/**
 * Contact sheet of every system's opening animation.
 *
 * `qa-3d-systems.mjs` proves a mechanism moves by comparing the closed pose with
 * the open one. That is an endpoint test, and endpoints are exactly where a bad
 * mechanism looks fine: a leaf can pass straight through a frame at t=0.5 and
 * arrive somewhere perfectly sensible. This samples the transition itself so the
 * middle can be looked at.
 *
 * One PNG per system, four frames left to right — closed, two mid-swing, open.
 *
 *   node scripts/qa-3d-filmstrip.mjs [--base http://localhost:4173] [--out .qa-film]
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const arg = process.argv.slice(2);
const flag = (n, d) => {
  const i = arg.indexOf(`--${n}`);
  return i >= 0 && arg[i + 1] ? arg[i + 1] : d;
};
const BASE = flag("base", "http://localhost:4173");
const OUT = flag("out", ".qa-film");

/* The scrub runs ~0.8 s. A canvas screenshot itself costs 200-400 ms, so asking
   for a frame "at 260 ms" actually delivers one nearer 600 ms and the strip comes
   back looking like two endpoints twice. These gaps are deliberately tiny; the
   real elapsed time is measured and printed per system so the strip can be read
   honestly rather than assumed. */
const SAMPLE_MS = [0, 30, 90, 3200];
const FRAME_W = 300;

const main = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto(`${BASE}/design-tool`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(2500);
  for (const label of [/^Accept$/i, /^Decline$/i]) {
    const b = page.getByRole("button", { name: label }).first();
    if (await b.count().catch(() => 0)) {
      await b.click({ timeout: 3000 }).catch(() => {});
      break;
    }
  }
  const toggle = page.getByRole("button", { name: /^3D$/i }).first();
  if (await toggle.count()) await toggle.click({ timeout: 5000 }).catch(() => {});
  await page.waitForSelector("canvas", { timeout: 60000 });
  await page.waitForTimeout(2500);

  /* Hide the overlay chrome so the strip is the model only — the open/close
     button sits over the canvas and its label changes mid-capture, which would
     otherwise be the most obvious thing moving in the filmstrip. */
  await page.addStyleTag({
    content: `[data-open-toggle], [data-system-rail] { visibility: hidden !important; }
              .absolute.top-4, .absolute.bottom-4 { visibility: hidden !important; }`,
  });

  const system = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-system-rail] button[data-system]")).map((b) =>
      b.getAttribute("data-system"),
    ),
  );

  const made = [];
  for (const id of system) {
    await page.evaluate((s) => {
      const b = document.querySelector(`[data-system-rail] button[data-system="${s}"]`);
      b?.click();
    }, id);
    await page.waitForTimeout(2200);

    const open = page.locator("button[data-open-toggle]").first();
    if (!(await open.count().catch(() => 0))) continue; // static system, nothing to watch

    const frame = [];
    const at = [];
    frame.push(await page.locator("canvas").first().screenshot());
    const t0 = await page.evaluate(() => {
      document.querySelector("button[data-open-toggle]")?.click();
      return performance.now();
    });
    at.push(0);
    for (let i = 1; i < SAMPLE_MS.length; i++) {
      await page.waitForTimeout(Math.max(0, SAMPLE_MS[i] - SAMPLE_MS[i - 1]));
      frame.push(await page.locator("canvas").first().screenshot());
      at.push(Math.round(await page.evaluate((s) => performance.now() - s, t0)));
    }
    /* Put it back so the next system starts closed. */
    await page.evaluate(() => document.querySelector("button[data-open-toggle]")?.click());
    await page.waitForTimeout(900);

    const tile = await Promise.all(
      frame.map((f) => sharp(f).resize({ width: FRAME_W }).flatten({ background: "#ffffff" }).toBuffer()),
    );
    const meta = await sharp(tile[0]).metadata();
    const sheet = await sharp({
      create: {
        width: FRAME_W * tile.length,
        height: meta.height,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite(tile.map((input, i) => ({ input, left: i * FRAME_W, top: 0 })))
      .png()
      .toBuffer();

    await writeFile(path.join(OUT, `${id}.png`), sheet);
    made.push(id);
    console.log(`  ${id.padEnd(20)} frames at ${at.join(", ")} ms`);
  }

  await browser.close();
  console.log(`\n${made.length} filmstrip in ${OUT}/  (frames at ${SAMPLE_MS.join(", ")} ms)`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

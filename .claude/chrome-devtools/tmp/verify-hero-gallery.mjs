// Verify the three hero-gallery changes: scroll shrink/drop, scrim position, mobile 4:3.
import {
  getBrowser,
  getPage,
  disconnectBrowser,
  outputJSON,
} from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const URL = "http://localhost:8080/projects/las-pinas-residence";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: "mobile-390", width: 390, height: 844, isMobile: true, hasTouch: true },
];

const probe = () =>
  ({
    wrapper: (() => {
      const h1 = [...document.querySelectorAll("h1")].find(
        (e) => e.getBoundingClientRect().height > 0
      );
      if (!h1) return null;
      const sec = h1.closest("section");
      const wrap = sec?.parentElement;
      if (!wrap) return null;
      const cs = getComputedStyle(wrap);
      return { transform: cs.transform, rect: wrap.getBoundingClientRect().toJSON() };
    })(),
    panel: (() => {
      const h1 = [...document.querySelectorAll("h1")].find(
        (e) => e.getBoundingClientRect().height > 0
      );
      const p = h1?.closest("div.pointer-events-none")?.parentElement;
      if (!p) return null;
      const cs = getComputedStyle(p);
      const r = p.getBoundingClientRect();
      return {
        borderRadius: cs.borderTopLeftRadius,
        aspectRatio: cs.aspectRatio,
        width: Math.round(r.width),
        height: Math.round(r.height),
        orientation: r.width >= r.height ? "LANDSCAPE" : "PORTRAIT",
        ratioActual: +(r.width / r.height).toFixed(3),
      };
    })(),
    scrim: (() => {
      const h1 = [...document.querySelectorAll("h1")].find(
        (e) => e.getBoundingClientRect().height > 0
      );
      const s = h1?.closest("div.pointer-events-none");
      if (!s || !h1) return null;
      const sr = s.getBoundingClientRect();
      const hr = h1.getBoundingClientRect();
      return {
        scrimHeight: Math.round(sr.height),
        aboveTextPx: Math.round(hr.top - sr.top),
        aboveTextPct: +(((hr.top - sr.top) / sr.height) * 100).toFixed(1),
        gradient: getComputedStyle(s).backgroundImage.slice(0, 130),
      };
    })(),
  });

async function run(page, vp) {
  await page.setViewport({ ...vp, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2200);

  const atTop = await page.evaluate(probe);
  await page.screenshot({ path: `${SHOTS}/verify-${vp.name}-top.png` });

  // Scroll well past the 55% hold point of the gallery wrapper
  const wrapH = atTop.wrapper?.rect?.height ?? 700;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(wrapH * 0.75));
  await sleep(900);
  const atHold = await page.evaluate(probe);
  await page.screenshot({ path: `${SHOTS}/verify-${vp.name}-hold.png` });

  // Scroll further to confirm it HOLDS (does not keep shrinking)
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(wrapH * 0.95));
  await sleep(900);
  const atLater = await page.evaluate(probe);

  // Back to top to confirm reversal
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await sleep(900);
  const backTop = await page.evaluate(probe);

  return {
    viewport: vp.name,
    atTop_transform: atTop.wrapper?.transform,
    atHold_transform: atHold.wrapper?.transform,
    atLater_transform: atLater.wrapper?.transform,
    backTop_transform: backTop.wrapper?.transform,
    holdsSteady: atHold.wrapper?.transform === atLater.wrapper?.transform,
    reverses: backTop.wrapper?.transform === atTop.wrapper?.transform,
    panel_atTop: atTop.panel,
    panel_atHold: atHold.panel,
    scrim: atTop.scrim,
  };
}

const browser = await getBrowser();
const page = await getPage(browser);
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
const results = [];
for (const vp of VIEWPORTS) results.push(await run(page, vp));
outputJSON({ results, pageErrors: errs });
await disconnectBrowser(browser);

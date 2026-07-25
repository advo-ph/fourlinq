/**
 * verify-live-display-strip.mjs
 * Post-deploy display verification for ccb4582 / 1354b73 / 47bd59e on prod.
 *
 *   1. Home InspirationStrip mirrors live admin state: no hidden project
 *      linked, tile order agrees with merged.projectOrder, tile images come
 *      from merged.projectCoverImages.
 *   2. ChatBubble is present on desktop and survives a resize across the
 *      1024px breakpoint (the ccb4582 stuck-hidden regression).
 *   3. ScrollWindow renders and stays error-free at a mobile viewport.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots/live-display-strip";
const PROD = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const merged = await fetch(`${PROD}/api/project-images/merged?p=${Date.now()}`).then((r) => r.json());
const HIDDEN = new Set([...(merged.hiddenProjects || []), ...(merged.deletedProjects || [])]);
const ORDER = merged.projectOrder || [];
const COVERS = merged.projectCoverImages || {};

const out = {};
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--no-sandbox"],
});

// ── 1. Home strip mirrors admin state ────────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });

  await page.goto(PROD, { waitUntil: "networkidle2", timeout: 60000 });
  // The strip swaps to live data after the fresh merged fetch resolves.
  await sleep(4000);

  const strip = await page.evaluate(() => {
    // The strip is the horizontal track of project links on the home page.
    const links = [...document.querySelectorAll('a[href*="/projects/"]')];
    const seen = new Map();
    for (const a of links) {
      const slug = (a.getAttribute("href") || "").split("/projects/")[1]?.split(/[?#]/)[0].replace(/\/$/, "");
      if (!slug || seen.has(slug)) continue;
      const img = a.querySelector("img");
      seen.set(slug, img ? (img.currentSrc || img.src) : null);
    }
    return [...seen.entries()].map(([slug, src]) => ({ slug, src }));
  });

  await page.screenshot({ path: `${SHOTS}/home-strip.png` });

  const slugs = strip.map((s) => s.slug);
  const leaked = slugs.filter((s) => HIDDEN.has(s));

  // Order check: the strip's slugs, restricted to those the API ranks, must be
  // non-decreasing in rank. Compares relative order without assuming the strip
  // renders every project.
  const ranked = slugs.filter((s) => ORDER.includes(s)).map((s) => ORDER.indexOf(s));
  const orderOk = ranked.every((v, i) => i === 0 || ranked[i - 1] <= v);

  // Cover check: each tile's image basename should match the admin-derived
  // cover for that project (ignoring the ?v= cache-busting suffix).
  const base = (u) => (u ? decodeURIComponent(u).split("/").pop().split("?")[0] : null);
  const coverMismatches = strip
    .filter((t) => COVERS[t.slug] && t.src)
    .filter((t) => base(t.src) !== base(COVERS[t.slug]))
    .map((t) => ({ slug: t.slug, shown: base(t.src), expected: base(COVERS[t.slug]) }));

  out.homeStrip = {
    tiles: strip.length,
    hiddenLeaked: leaked,
    rankedTiles: ranked.length,
    orderMatchesAdmin: orderOk,
    coverMismatches: coverMismatches.slice(0, 5),
    coverMismatchCount: coverMismatches.length,
    jsErrors: errs.slice(0, 3),
  };

  // ── 2. ChatBubble across the breakpoint ────────────────────
  const bubbleAt = async () => page.evaluate(() => {
    const btns = [...document.querySelectorAll("button, [role=button]")];
    const b = btns.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 40 && r.right > window.innerWidth - 160 && r.bottom > window.innerHeight - 160;
    });
    if (!b) return { present: false };
    const st = getComputedStyle(b);
    return { present: true, opacity: +st.opacity, display: st.display, visibility: st.visibility };
  });

  const desktopBefore = await bubbleAt();
  await page.setViewport({ width: 480, height: 900 });  // cross below 1024
  await sleep(1200);
  await page.setViewport({ width: 1440, height: 900 }); // and back above
  await sleep(1500);
  const desktopAfter = await bubbleAt();
  await page.screenshot({ path: `${SHOTS}/chat-bubble-after-resize.png` });

  out.chatBubble = { desktopBefore, afterResizeRoundTrip: desktopAfter };
  await page.close();
}

// ── 3. ScrollWindow at a mobile viewport ─────────────────────
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });

  await page.goto(PROD, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2500);
  await page.evaluate(async () => {
    for (let y = 0; y < 3000; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
  });
  await sleep(1500);
  const frames = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img[src*="scroll-window"]')];
    return { frameImgs: imgs.length, brokenFrames: imgs.filter((i) => i.complete && i.naturalWidth === 0).length };
  });
  await page.screenshot({ path: `${SHOTS}/mobile-scrollwindow.png` });
  out.scrollWindowMobile = { ...frames, jsErrors: errs.slice(0, 4) };
  await page.close();
}

await browser.close();
fs.writeFileSync(`${SHOTS}/results.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

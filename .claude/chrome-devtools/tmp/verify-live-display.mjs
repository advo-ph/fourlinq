/**
 * verify-live-display.mjs
 * Post-deploy visual verification of the live display at fourlinq.ph.
 *
 * Covers the three shipped display changes plus the DB-backed covers:
 *   1. Home + Inspiration render, covers present (DB-derived, post sync-cms)
 *   2. Project detail hero gallery — photo AND rail recede together on scroll
 *      (rail must stay visible; no collapse-to-zero)
 *   3. Admin Project Images panel shows the derived cover
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots/live-display";
const PROD = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const results = {};

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--no-sandbox"],
});

async function newPage(w = 1440, h = 900) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
  p.__errs = errs;
  return p;
}

// ── 1. Home + Inspiration ────────────────────────────────────
for (const [name, url] of [["home", "/"], ["inspiration", "/inspiration"]]) {
  const page = await newPage();
  await page.goto(PROD + url, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2500);
  const stat = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    return {
      imgs: imgs.length,
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
      title: document.title,
    };
  });
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  results[name] = { ...stat, jsErrors: page.__errs.slice(0, 3) };
  await page.close();
}

// ── 2. Project detail: hero gallery recession ────────────────
{
  const page = await newPage();
  await page.goto(`${PROD}/projects/nuvali-laguna-residence`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2500);

  const measure = () => {
    // The desktop rail is the scrollable thumb column; the hero is the big photo.
    const rail = document.querySelector("section[aria-label] .no-scrollbar");
    const railBox = rail ? rail.getBoundingClientRect() : null;
    const thumbs = rail ? [...rail.querySelectorAll("button")] : [];
    const vis = thumbs.filter((b) => {
      const r = b.getBoundingClientRect();
      const o = parseFloat(getComputedStyle(b).opacity);
      return r.width > 4 && r.height > 4 && o > 0.05;
    }).length;
    return {
      railWidth: railBox ? Math.round(railBox.width) : null,
      thumbsTotal: thumbs.length,
      thumbsVisible: vis,
    };
  };

  const before = await page.evaluate(measure);
  await page.screenshot({ path: `${SHOTS}/detail-top.png` });

  // Scroll past the full recession range and re-measure.
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: "instant" }));
  await sleep(1600);
  const after = await page.evaluate(measure);
  await page.screenshot({ path: `${SHOTS}/detail-receded.png` });

  results.heroGallery = { before, after, jsErrors: page.__errs.slice(0, 3) };
  await page.close();
}

// ── 3. Admin: derived cover display ──────────────────────────
{
  const page = await newPage();
  await page.goto(`${PROD}/admin`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2000);
  try {
    await page.type('input[type="email"]', "dev@fourlinq.ph", { delay: 20 });
    await page.type('input[type="password"]', "advodeveloper2026", { delay: 20 });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => {}),
    ]);
    await sleep(3500);
    await page.screenshot({ path: `${SHOTS}/admin.png` });
    results.admin = {
      url: page.url(),
      loggedIn: !/login/i.test(page.url()) && !(await page.$('input[type="password"]')),
      jsErrors: page.__errs.slice(0, 3),
    };
  } catch (e) {
    results.admin = { error: String(e).slice(0, 200) };
  }
  await page.close();
}

await browser.close();
fs.writeFileSync(`${SHOTS}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

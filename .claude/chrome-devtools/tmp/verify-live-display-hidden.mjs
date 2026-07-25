/**
 * verify-live-display-hidden.mjs
 * Post-deploy display verification for a9bf63d (+ 4aa855c) on production.
 *
 *   1. Hidden projects (project_hidden overrides) must NOT be linked anywhere
 *      on the public /inspiration grid, nor on the home project strip.
 *   2. Their detail routes are the control: still reachable directly, since
 *      hiding scopes the listing, not the route.
 *   3. The restored cebu-f-residence-fortunado-3 image (4aa855c) must load.
 *   4. General display health: broken images, JS errors.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots/live-display-hidden";
const PROD = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const merged = await fetch(`${PROD}/api/project-images/merged?p=${Date.now()}`).then((r) => r.json());
const HIDDEN = merged.hiddenProjects || [];

const out = { hiddenPerApi: HIDDEN };
const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--no-sandbox"],
});

async function scan(path, label) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });

  await page.goto(PROD + path, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2000);
  // Drive lazy-loading so the whole grid is realised before scanning links.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
  });
  await sleep(1800);

  const data = await page.evaluate(() => {
    const slugs = [...document.querySelectorAll('a[href*="/projects/"]')]
      .map((a) => (a.getAttribute("href") || "").split("/projects/")[1])
      .filter(Boolean)
      .map((s) => s.split(/[?#]/)[0].replace(/\/$/, ""));
    const imgs = [...document.querySelectorAll("img")];
    return {
      slugs: [...new Set(slugs)],
      imgTotal: imgs.length,
      imgBroken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      imgSrcs: imgs.map((i) => i.currentSrc || i.src),
    };
  });

  await page.screenshot({ path: `${SHOTS}/${label}.png` });
  await page.close();
  return { ...data, jsErrors: errs.slice(0, 3) };
}

// ── 1 & 2. Public listings must exclude hidden projects ──────
for (const [label, path] of [["inspiration", "/inspiration"], ["home", "/"]]) {
  const r = await scan(path, label);
  const leaked = r.slugs.filter((s) => HIDDEN.includes(s));
  out[label] = {
    linkedProjects: r.slugs.length,
    hiddenLeaked: leaked,
    pass: leaked.length === 0,
    imgTotal: r.imgTotal,
    imgBroken: r.imgBroken,
    jsErrors: r.jsErrors,
  };
}

// ── 3. Control: a hidden project's own route still resolves ──
if (HIDDEN.length) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const resp = await page.goto(`${PROD}/projects/${HIDDEN[0]}`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(1500);
  out.hiddenRouteControl = { slug: HIDDEN[0], status: resp.status() };
  await page.screenshot({ path: `${SHOTS}/hidden-route.png` });
  await page.close();
}

// ── 4. Restored image from 4aa855c ───────────────────────────
{
  const page = await browser.newPage();
  const r = await page.goto(`${PROD}/images/projects-fb/cebu-f-residence-fortunado-3.jpg`, { timeout: 60000 });
  const buf = await r.buffer().catch(() => null);
  out.restoredImage = { status: r.status(), bytes: buf ? buf.length : null };
  await page.close();
}

await browser.close();
fs.writeFileSync(`${SHOTS}/results.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, (k, v) => (k === "imgSrcs" ? undefined : v), 2));

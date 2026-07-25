// Measure where the title-scrim gradient sits vs where the <h1> text actually is,
// on the project detail hero gallery. Desktop + mobile.
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

async function measure(page, vp) {
  await page.setViewport({ ...vp, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(1800);

  const data = await page.evaluate(() => {
    // The scrim is the pointer-events-none absolute div that wraps the h1.
    const h1s = [...document.querySelectorAll("h1")];
    const out = [];
    for (const h1 of h1s) {
      const scrim = h1.closest("div.pointer-events-none") || h1.parentElement;
      if (!scrim) continue;
      const panel = scrim.parentElement;
      const sr = scrim.getBoundingClientRect();
      const hr = h1.getBoundingClientRect();
      const pr = panel ? panel.getBoundingClientRect() : null;
      if (sr.width === 0 || sr.height === 0) continue; // hidden breakpoint
      const cs = getComputedStyle(scrim);
      out.push({
        panel: pr && { top: pr.top, bottom: pr.bottom, height: pr.height },
        scrim: { top: sr.top, bottom: sr.bottom, height: sr.height },
        text: { top: hr.top, bottom: hr.bottom, height: hr.height },
        // How much of the scrim's vertical extent is ABOVE the first line of text
        scrimAboveText: hr.top - sr.top,
        scrimBelowTextBottom: sr.bottom - hr.bottom,
        pctOfScrimAboveText: ((hr.top - sr.top) / sr.height) * 100,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        backgroundImage: cs.backgroundImage,
        fontSize: getComputedStyle(h1).fontSize,
        lineHeight: getComputedStyle(h1).lineHeight,
        text_content: h1.textContent,
      });
    }
    return out;
  });

  await page.screenshot({ path: `${SHOTS}/hero-scrim-${vp.name}.png` });

  // Cropped close-up of the bottom of the hero panel where the scrim lives
  const box = await page.evaluate(() => {
    const h1 = [...document.querySelectorAll("h1")].find(
      (e) => e.getBoundingClientRect().height > 0
    );
    if (!h1) return null;
    const scrim = h1.closest("div.pointer-events-none");
    if (!scrim) return null;
    const r = scrim.getBoundingClientRect();
    return { x: Math.max(0, r.left), y: Math.max(0, r.top - 40), width: r.width, height: r.height + 60 };
  });
  if (box) {
    await page.screenshot({ path: `${SHOTS}/hero-scrim-${vp.name}-crop.png`, clip: box });
  }

  return { viewport: vp.name, measurements: data };
}

const browser = await getBrowser();
const page = await getPage(browser);
const results = [];
for (const vp of VIEWPORTS) results.push(await measure(page, vp));
outputJSON(results);
await disconnectBrowser(browser);

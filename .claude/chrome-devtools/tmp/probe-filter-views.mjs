/**
 * probe-filter-views.mjs
 * Check each category filter on /inspiration to see which image renders for target projects.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const PROD = "https://fourlinq.ph";
const TARGETS = ["nuvali-laguna-residence-b", "fourlinq-turnover-2"];
const FILTERS = ["all", "windows", "doors", "interior", "exterior"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto(`${PROD}/inspiration`, { waitUntil: "networkidle0", timeout: 45000 });
  await sleep(4000); // wait for API fetch + re-render

  for (const filter of FILTERS) {
    // Click the filter button
    if (filter !== "all") {
      const clicked = await page.evaluate((filterLabel) => {
        const btns = [...document.querySelectorAll("button")];
        const btn = btns.find((b) => b.textContent?.trim().toLowerCase() === filterLabel.toLowerCase());
        if (btn) { btn.click(); return true; }
        return false;
      }, filter);
      if (!clicked) {
        console.log(`Filter "${filter}": button not found`);
        continue;
      }
      await sleep(800);
    }

    // Extract rendered image src for each target
    const results = await page.evaluate((targets) => {
      const out = {};
      for (const pid of targets) {
        const link = document.querySelector(`a[href*="${pid}"]`);
        if (!link) {
          out[pid] = { found: false };
          continue;
        }
        const img = link.querySelector("img");
        out[pid] = {
          found: true,
          src: img?.src ?? "",
          attrSrc: img?.getAttribute("src") ?? "",
          naturalWidth: img?.naturalWidth ?? 0,
        };
      }
      return out;
    }, TARGETS);

    console.log(`\nFilter: "${filter}"`);
    for (const [pid, data] of Object.entries(results)) {
      if (!data.found) {
        console.log(`  ${pid}: NOT IN VIEW (filtered out)`);
      } else {
        // Extract just the filename for clarity
        const filename = data.src.split("/").pop().split("?")[0];
        console.log(`  ${pid}: ${filename}`);
      }
    }
  }

  await browser.close();
}

run().catch((e) => { console.error(e); process.exit(1); });

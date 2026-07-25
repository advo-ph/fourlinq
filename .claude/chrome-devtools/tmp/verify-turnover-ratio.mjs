/**
 * verify-turnover-ratio.mjs
 * Scroll-and-find fourlinq-turnover-2 in admin, verify Ratio: 4:3 header.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const BASE = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const tmpDir = `/tmp/puppeteer-fresh-turnover-${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      "--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900",
      `--user-data-dir=${tmpDir}`, "--disable-cache",
    ],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // Login
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    await passInput.press("Enter");
    await sleep(3000);
  }

  // Click Project Images tab
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const tab = btns.find((b) => b.textContent?.toLowerCase().includes("project image"));
    if (tab) tab.click();
  });
  await sleep(3000);

  // Scroll down to find fourlinq-turnover-2
  let found = false;
  for (let scrollY = 0; scrollY <= 6000; scrollY += 800) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await sleep(500);
    found = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const card = btns.find((b) => b.textContent?.toLowerCase().includes("fourlinq-turnover-2"));
      if (card) { card.scrollIntoView(); card.click(); return true; }
      return false;
    });
    if (found) break;
  }

  console.log(`fourlinq-turnover-2 card found and clicked: ${found}`);
  if (!found) {
    console.log("FAIL: fourlinq-turnover-2 card not found after scrolling");
    await page.screenshot({ path: `${SHOTS}/live-item5b-turnover-notfound.png` });
    await browser.close();
    return;
  }

  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/live-item5b-turnover-ratio.png` });

  // Check ratio text
  const ratioText = await page.evaluate(() => {
    const allText = document.body.innerText;
    const match = allText.match(/Ratio:\s*[\d:]+/gi);
    return match ? match[0] : null;
  });

  console.log(`Ratio text: ${ratioText}`);
  if (ratioText && ratioText.includes("4:3")) {
    console.log("PASS: Admin shows Ratio: 4:3 for fourlinq-turnover-2");
  } else {
    console.log(`FAIL: Expected Ratio: 4:3, got: ${ratioText}`);
  }

  await browser.close();
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });

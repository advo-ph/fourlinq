/**
 * Verification screenshot v2: click "Project Images" tab, confirm header+button gone.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, "../screenshots");
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
  defaultViewport: { width: 1280, height: 900 },
});

const page = await browser.newPage();

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2", timeout: 20000 });
await sleep(1500);

// Login if needed
const loginInput = await page.$('input[type="email"]');
if (loginInput) {
  await loginInput.click({ clickCount: 3 });
  await loginInput.type("dev@fourlinq.ph");
  const passInput = await page.$('input[type="password"]');
  await passInput.click({ clickCount: 3 });
  await passInput.type("advodeveloper2026");
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
  await sleep(1500);
}

// Click the "Project Images" tab button
const tabs = await page.$$("button");
for (const tab of tabs) {
  const text = await tab.evaluate((el) => el.textContent?.trim());
  if (text && text.includes("Project Images")) {
    await tab.click();
    break;
  }
}
await sleep(3000);

// Screenshot
const screenshotPath = path.join(SCREENSHOT_DIR, "verify-project-images-panel.png");
await page.screenshot({ path: screenshotPath, fullPage: false, clip: { x: 0, y: 0, width: 1280, height: 800 } });

// Check DOM text
const bodyText = await page.evaluate(() => document.body.innerText);
const hasTitle = bodyText.includes("Manage the AI-selected images");
const hasButton = bodyText.includes("Apply exterior-first order");

console.log(`Screenshot: ${screenshotPath}`);
console.log(`"Manage the AI-selected images" present: ${hasTitle} (expected: false)`);
console.log(`"Apply exterior-first order" present: ${hasButton} (expected: false)`);
console.log((!hasTitle && !hasButton) ? "PASS" : "FAIL");

await browser.close();

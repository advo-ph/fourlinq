/**
 * Quick verification screenshot: confirm "Project Images" header and
 * "Apply exterior-first order" button are gone from the admin panel.
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

// Navigate to admin (may redirect to login)
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

// Navigate to project images tab
await page.goto(`${BASE}/admin?tab=images`, { waitUntil: "networkidle2", timeout: 20000 });
await sleep(3000);

// Screenshot the top of the panel
const screenshotPath = path.join(SCREENSHOT_DIR, "verify-header-removed.png");
await page.screenshot({
  path: screenshotPath,
  fullPage: false,
  clip: { x: 0, y: 0, width: 1280, height: 700 },
});

// Check for absence of target text
const bodyText = await page.evaluate(() => document.body.innerText);
const hasTitle = bodyText.includes("Manage the AI-selected images");
const hasButton = bodyText.includes("Apply exterior-first order");

console.log(`Screenshot saved: ${screenshotPath}`);
console.log(`"Manage the AI-selected images" text present: ${hasTitle} (expected: false)`);
console.log(`"Apply exterior-first order" button present: ${hasButton} (expected: false)`);

if (!hasTitle && !hasButton) {
  console.log("PASS: Both elements successfully removed from the panel.");
} else {
  console.log("FAIL: One or more elements still present!");
}

await browser.close();

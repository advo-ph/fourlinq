/**
 * probe-images-dom2.mjs — Step by step with screenshots at each step
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claire/chrome-devtools/screenshots";
const SHOTS2 = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const BASE  = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(SHOTS2, { recursive: true });

async function dumpButtons(page, label) {
  const info = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].slice(0, 30);
    return btns.map((b, i) => ({ i, text: b.textContent?.trim().slice(0,40), cls: b.className?.slice(0,40) }));
  });
  console.log(`\n-- Buttons at "${label}" --`);
  info.forEach(b => console.log(`  [${b.i}] "${b.text}" class="${b.cls}"`));
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,  // headed so we can see
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  console.log("Step 1: Navigate to admin...");
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS2}/probe2-01-initial.png` });
  console.log("  URL:", page.url());

  await dumpButtons(page, "initial load");

  // Login if needed
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    console.log("Step 2: Login...");
    await emailInput.click({ clickCount: 3 });
    await emailInput.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await sleep(4000);
    await page.screenshot({ path: `${SHOTS2}/probe2-02-after-login.png` });
    console.log("  URL after login:", page.url());
  }

  await dumpButtons(page, "after login");

  // Check ALL button text to find the right tab
  const allButtonTexts = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    return btns.map(b => b.textContent?.trim());
  });
  console.log("\nAll button texts:", JSON.stringify(allButtonTexts));

  // Check for nav items (links, divs, spans that look like tabs)
  const navInfo = await page.evaluate(() => {
    const clickables = [...document.querySelectorAll("nav *, [role='tab'], [role='navigation'] *")].slice(0, 30);
    return clickables.map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0,40), role: el.getAttribute('role') })).filter(el => el.text);
  });
  console.log("\nNav elements:", JSON.stringify(navInfo.slice(0, 20)));

  // Try clicking image-related tab
  const tabClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button, a, [role='tab']")];
    const tab = btns.find((t) => {
      const text = t.textContent?.toLowerCase().trim() ?? "";
      return text === "images" || text === "project images" || (text.includes("image") && text.length < 30);
    });
    if (tab) {
      console.log("[probe] Clicking tab:", tab.textContent?.trim());
      tab.click();
      return tab.textContent?.trim();
    }
    return null;
  });
  console.log("\nTab clicked:", tabClicked);
  await sleep(4000);
  await page.screenshot({ path: `${SHOTS2}/probe2-03-after-tab.png` });
  console.log("  URL after tab:", page.url());

  // Check what's on screen now
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log("\nBody text after tab click:", bodyText);

  await dumpButtons(page, "after tab click");

  // Try finding project cards
  const cards = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll("button, div[role='button'], a")];
    const cards = allEls.filter(el => {
      const text = el.textContent?.toLowerCase() ?? "";
      return text.includes("las pinas") || text.includes("residence");
    });
    return cards.slice(0, 5).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 60),
      cls: el.className?.slice(0, 60),
    }));
  });
  console.log("\nProject-related elements:", JSON.stringify(cards));

  await sleep(2000);
  await browser.close();
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});

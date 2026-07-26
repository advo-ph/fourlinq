// Verify smaller numbered circle markers on mobile ScrollWindow Part-2 (thermal step).
// WINDOW_PARTS order: [weather, thermal, sound]
// Step 0=intro, Step 1=weather, Step 2=thermal (pins!), Step 3=sound
// Need 2 upward swipes from intro to land on thermal.
import { createRequire } from "module";
const require = createRequire(
  "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js",
);
const puppeteer = require("puppeteer");

const BASE = "http://localhost:8080";
const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const watchdog = setTimeout(() => {
  console.error("WATCHDOG TIMEOUT");
  process.exit(2);
}, 90000);

async function swipe(client, { x = 195, fromY, toY, steps = 12, stepDelayMs = 16 }) {
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: fromY }] });
  const dy = (toY - fromY) / steps;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: Math.round(fromY + dy * i) }],
    });
    await sleep(stepDelayMs);
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const run = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    protocolTimeout: 30000,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  // Mobile viewport: iPhone 14 Pro dimensions
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  );

  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(1500);

  // Dismiss cookie banner if present
  try {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const txt = await btn.evaluate(el => el.textContent?.trim());
      if (txt === 'Accept') {
        await btn.click();
        await sleep(500);
        break;
      }
    }
  } catch (e) {
    console.log("Cookie banner:", e.message);
  }

  const client = await page.createCDPSession();

  // Scroll to bring the ScrollWindow section into engagement range.
  // The ScrollWindow section starts after the hero. Scroll down ~1 viewport worth.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.7));
  await sleep(500);
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.5));
  await sleep(800);

  console.log("Scroll state:", await page.evaluate(() => ({ scrollY: Math.round(window.scrollY), innerH: window.innerHeight })));

  // Swipe up 2 times: intro (step 0) → weather (step 1) → thermal (step 2)
  for (let swipeNum = 0; swipeNum < 2; swipeNum++) {
    await swipe(client, { x: 195, fromY: 650, toY: 200, steps: 15, stepDelayMs: 16 });
    await sleep(700);
    console.log(`Swipe ${swipeNum + 1} done`);
  }

  // Wait for thermal animation to settle — frames preload then thermalSettled triggers opacity transition
  console.log("Waiting for thermal animation + pins to settle...");
  await sleep(6000);

  // Screenshot
  const outPath = `${SHOTS}/markers-smaller.png`;
  await page.screenshot({ path: outPath, fullPage: false });
  console.log("Screenshot saved:", outPath);

  await browser.close();
  clearTimeout(watchdog);
  console.log("DONE");
};

run().catch((e) => {
  console.error(e);
  clearTimeout(watchdog);
  process.exit(1);
});

// Isolate which interaction phase produces "cancelable=false" console warnings.
import { createRequire } from "module";
const require = createRequire(
  "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js",
);
const puppeteer = require("puppeteer");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const watchdog = setTimeout(() => {
  console.log("WATCHDOG_TIMEOUT");
  process.exit(2);
}, 90000);

async function swipe(client, { x, fromY, toY, steps = 12, stepDelayMs = 16 }) {
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

const browser = await puppeteer.launch({
  headless: "new",
  protocolTimeout: 30000,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
let count = 0;
page.on("console", (m) => {
  if (m.text().includes("Ignored attempt to cancel")) count++;
});
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const client = await page.createCDPSession();
await page.goto("http://localhost:8090", { waitUntil: "networkidle2", timeout: 60000 });
await sleep(1200);

const secTop = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const inner = c.closest("div[class*='h-\\[100lvh\\]']");
  return inner.parentElement.getBoundingClientRect().top + window.scrollY;
});

const phases = [];
const mark = (name) => {
  phases.push({ name, warnings: count });
  count = 0;
};

// Phase 1: native swipe on hero at very top of page (no ScrollWindow involvement)
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(500);
await swipe(client, { x: 195, fromY: 700, toY: 540 });
await sleep(600);
mark("hero-swipe-at-top");

// Phase 2: native swipe while section partially visible (disengaged)
await page.evaluate((y) => window.scrollTo(0, y), secTop - 400);
await sleep(600);
await swipe(client, { x: 195, fromY: 700, toY: 540 });
await sleep(600);
mark("disengaged-swipe-over-section");

// Phase 3: engage
await page.evaluate((y) => window.scrollTo(0, y), secTop - 30);
await sleep(1200);
mark("engagement");

// Phase 4: captured card swipe
await swipe(client, { x: 195, fromY: 600, toY: 470 });
await sleep(900);
mark("captured-swipe");

// Phase 5: swipe back down (captured)
await swipe(client, { x: 195, fromY: 470, toY: 600 });
await sleep(900);
mark("captured-swipe-back");

// Phase 6: boundary exit glide (swipe down at step 0)
await swipe(client, { x: 195, fromY: 400, toY: 620 });
await sleep(900);
mark("boundary-exit-glide");

console.log(JSON.stringify(phases, null, 2));
clearTimeout(watchdog);
await browser.close();

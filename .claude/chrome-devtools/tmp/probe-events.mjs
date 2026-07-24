import { createRequire } from "module";
const require = createRequire("/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js");
const puppeteer = require("puppeteer");
const BASE = "http://localhost:8081";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
setTimeout(() => { console.log("WATCHDOG"); process.exit(2); }, 90000);

async function swipe(client, fromY, toY, steps = 8, delay = 12) {
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: fromY }] });
  const dy = (toY - fromY) / steps;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 195, y: Math.round(fromY + dy * i) }] });
    await sleep(delay);
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 30000, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => {
  window.__t = [];
  for (const t of ["touchstart", "touchmove", "touchend", "touchcancel"]) {
    window.addEventListener(t, (e) => window.__t.push(t[5] + (e.touches[0] ? Math.round(e.touches[0].clientY) : "")), { capture: true, passive: true });
  }
});
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const client = await page.createCDPSession();
await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await sleep(1200);
const trackTop = await page.evaluate(() => {
  const inner = document.querySelector("canvas").closest("div[class*='h-\\[100lvh\\]']");
  return inner.parentElement.getBoundingClientRect().top + window.scrollY;
});
await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
await sleep(400);
await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
await sleep(500);
// climb to step 2
for (let i = 0; i < 2; i++) { await swipe(client, 620, 500); await sleep(600); }
await page.evaluate(() => (window.__t.length = 0));
// down-1 then down-2 at 120ms cadence
await swipe(client, 500, 620);
await sleep(120);
const t1 = await page.evaluate(() => window.__t.splice(0));
await swipe(client, 500, 620);
await sleep(600);
const t2 = await page.evaluate(() => window.__t.splice(0));
const ops = await page.evaluate(() => [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")].map((d) => +(+getComputedStyle(d).opacity).toFixed(2)));
console.log(JSON.stringify({ down1Events: t1, down2Events: t2, finalOps: ops }));
await browser.close();

// Bug 2 diagnostic probe: down-after-down at 120ms cadence
import { createRequire } from "module";
const require = createRequire(
  "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js",
);
const puppeteer = require("puppeteer");
const BASE = "http://localhost:8081";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const watchdog = setTimeout(() => {
  console.log("WATCHDOG");
  process.exit(2);
}, 120000);

async function swipe(client, fromY, toY, steps = 8, delay = 12) {
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: fromY }] });
  const dy = (toY - fromY) / steps;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 195, y: Math.round(fromY + dy * i) }],
    });
    await sleep(delay);
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const browser = await puppeteer.launch({
  headless: "new",
  protocolTimeout: 30000,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => {
  window.__dbg = [];
  window.__fq = [];
  window.addEventListener("fq-hide-header", (e) => window.__fq.push({ h: e.detail }));
});
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const client = await page.createCDPSession();
await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
await sleep(1200);

const trackTop = await page.evaluate(() => {
  const inner = document.querySelector("canvas").closest("div[class*='h-\\[100lvh\\]']");
  return inner.parentElement.getBoundingClientRect().top + window.scrollY;
});

const state = async (label) => {
  const s = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")];
    const ops = cards.map((d) => +(+getComputedStyle(d).opacity).toFixed(2));
    const active = ops.findIndex((o) => o > 0.5);
    return {
      ops,
      active,
      scrollY: Math.round(window.scrollY),
      dbg: (window.__dbg || []).splice(0),
      fq: (window.__fq || []).splice(0),
    };
  });
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(s, null, 2));
  return s;
};

// engage from above
await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
await sleep(400);
await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
await sleep(500);
await state("engaged");

// climb to step 2
for (let i = 0; i < 2; i++) {
  await swipe(client, 620, 500);
  await sleep(600);
}
await state("at-step-2");

// down-1: should go step 2→1
await swipe(client, 500, 620);
await sleep(120);  // 120ms window — tight enough to catch entry spring mid-flight
await state("down-1-at-120ms");

// down-2: the bug — should go step 1→0 but often stays at 1
await swipe(client, 500, 620);
await sleep(800);
await state("down-2-settled");

clearTimeout(watchdog);
await browser.close();

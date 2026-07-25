import { createRequire } from "module";
const require = createRequire("/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js");
const puppeteer = require("puppeteer");
const BASE = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function swipe(client, { x = 195, fromY, toY, steps = 12, stepDelayMs = 16 }) {
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: fromY }] });
  const dy = (toY - fromY) / steps;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: Math.round(fromY + dy * i) }] });
    await sleep(stepDelayMs);
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const run = async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const client = await page.createCDPSession();
    
    const events = [];
    await page.evaluateOnNewDocument(() => {
      window.__fq = [];
      window.addEventListener("fq-hide-header", (e) => window.__fq.push({ ev: "h", v: e.detail }));
    });
    
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1200);

    const geo = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const inner = canvas.closest("div[class*='h-\\[100lvh\\]']");
      const track = inner.parentElement;
      const tr = track.getBoundingClientRect();
      return { trackTop: tr.top + window.scrollY, trackH: tr.height, vh: window.innerHeight };
    });
    const { trackTop, trackH, vh } = geo;
    
    const cards = () => page.evaluate(() => 
      [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")].map((d) => +(+getComputedStyle(d).opacity).toFixed(2))
    );
    
    // Engage from above
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 500 }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(30);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(500);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
    await sleep(600);
    console.log("after engage:", await cards(), "scrollY:", await page.evaluate(() => window.scrollY));
    
    // Swipe up ×3 (to reach step 3)
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 640, toY: 550, steps: 12, stepDelayMs: 20 });
      await sleep(500);
      console.log(`after upswipe ${i+1}:`, await cards(), "scrollY:", await page.evaluate(() => window.scrollY));
    }
    
    // Now do the rapid swipes sequence exactly as the harness does
    // Back to step 0
    await swipe(client, { fromY: 500, toY: 620 }); // step 2 -> 1
    await sleep(120);
    console.log("after back1:", await cards(), "scrollY:", await page.evaluate(() => window.scrollY));
    await swipe(client, { fromY: 500, toY: 620 }); // 1 -> 0
    await sleep(400);
    console.log("back at step0:", await cards(), "engaged:", await page.evaluate(() => window.scrollY));
    
    // 3 rapid upward swipes
    for (let i = 0; i < 3; i++) {
      const pre = await page.evaluate(() => window.scrollY);
      await swipe(client, { fromY: 640, toY: 560, steps: 8, stepDelayMs: 12 });
      const post = await page.evaluate(() => window.scrollY);
      await sleep(160);
      const postSleep = await page.evaluate(() => window.scrollY);
      console.log(`rapid ${i+1}: preScrollY=${pre} postScrollY=${post} post160ms=${postSleep} cards:`, await cards());
    }
    
  } finally {
    await browser.close();
  }
};
run().catch(e => console.error(e));

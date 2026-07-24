// WebKit (real Safari engine) probe:
// A) Does pin-loop ENGAGEMENT fire? (observable: container style.touchAction,
//    fq events, FAB opacity)
// B) Do synthetic touch swipes switch cards? (tests JS gesture logic in WebKit)
import { createRequire } from "module";
const require = createRequire("/Users/princewagan/fourlinq/package.json");
const { webkit, devices } = require("playwright");

const BASE = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
setTimeout(() => {
  console.log(JSON.stringify({ FATAL: "WATCHDOG" }));
  process.exit(2);
}, 120000);

const browser = await webkit.launch({ headless: true });
const ctx = await browser.newContext({
  ...devices["iPhone 13"],
  hasTouch: true,
});
const page = await ctx.newPage();
await page.addInitScript(() => {
  window.__fq = [];
  window.addEventListener("fq-hide-header", (e) => window.__fq.push({ h: e.detail }));
});
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await sleep(1500);

const geo = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  const inner = canvas ? canvas.closest("div[class*='h-\\[100lvh\\]']") : null;
  if (!inner) return null;
  const track = inner.parentElement;
  const r = track.getBoundingClientRect();
  return {
    trackTop: r.top + window.scrollY,
    trackH: r.height,
    vh: window.innerHeight,
    innerH: inner.getBoundingClientRect().height,
  };
});
console.log("geo:", JSON.stringify(geo));

// ── Probe A: scroll into track, check engagement observables ──
await page.evaluate((y) => window.scrollTo(0, y), geo.trackTop + 300);
await sleep(800);
const probeA = await page.evaluate(() => {
  const canvas = document.querySelector("canvas");
  const inner = canvas.closest("div[class*='h-\\[100lvh\\]']");
  const track = inner.parentElement;
  const fab = document.querySelector("[data-chat-bubble]");
  const cards = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")];
  return {
    scrollY: window.scrollY,
    trackTopRel: +track.getBoundingClientRect().top.toFixed(1),
    innerTopRel: +inner.getBoundingClientRect().top.toFixed(1),
    touchAction: track.style.touchAction || "(empty)",
    fabOpacity: fab ? +(+getComputedStyle(fab).opacity).toFixed(2) : null,
    events: window.__fq.slice(),
    cardOps: cards.map((d) => +(+getComputedStyle(d).opacity).toFixed(2)),
  };
});
console.log("probeA-engagement:", JSON.stringify(probeA));

// ── Probe B: synthetic TouchEvent swipe up (tests JS logic path in WebKit) ──
const probeB = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const canvas = document.querySelector("canvas");
  const inner = canvas.closest("div[class*='h-\\[100lvh\\]']");
  const track = inner.parentElement;
  const target = document.elementFromPoint(195, 500) || inner;
  const mkTouch = (y) =>
    new Touch({ identifier: 1, target, clientX: 195, clientY: y, pageX: 195, pageY: y + window.scrollY });
  const fire = (type, y) => {
    const t = type === "touchend" ? [] : [mkTouch(y)];
    target.dispatchEvent(
      new TouchEvent(type, {
        touches: t,
        targetTouches: t,
        changedTouches: [mkTouch(y)],
        bubbles: true,
        cancelable: true,
      }),
    );
  };
  const results = { touchCtor: true };
  try {
    fire("touchstart", 600);
    for (let y = 585; y >= 480; y -= 15) {
      fire("touchmove", y);
      await sleep(16);
    }
    fire("touchend", 480);
  } catch (e) {
    results.err = String(e);
  }
  await sleep(900);
  const cards = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")];
  results.cardOpsAfterSwipe = cards.map((d) => +(+getComputedStyle(d).opacity).toFixed(2));
  results.scrollY = window.scrollY;
  return results;
});
console.log("probeB-syntheticSwipe:", JSON.stringify(probeB));

// ── Probe C: real Playwright touchscreen tap works at all? (sanity) ──
let tapOk = true;
try {
  await page.touchscreen.tap(195, 500);
} catch (e) {
  tapOk = String(e).slice(0, 100);
}
console.log("probeC-touchscreenTap:", JSON.stringify(tapOk));

await browser.close();

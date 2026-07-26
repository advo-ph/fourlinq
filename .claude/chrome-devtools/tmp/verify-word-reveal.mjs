// Verify WordReveal per-word cascade on /why-upvc.
// PASS criteria:
//   1. Midway through reveal range: opacities form a gradient (first words near 1,
//      later words noticeably lower, at least 3 distinct bands).
//   2. After scrolling past the paragraph's top-center end marker: all words near 1.
import { chromium } from 'playwright';

const PORT = 8082;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });

await p.goto(`http://localhost:${PORT}/why-upvc`, { waitUntil: 'networkidle', timeout: 90000 });

// ── Helper: sample opacity of all .word spans inside a container ────────────
async function sampleOpacities(containerSelector) {
  return p.evaluate((sel) => {
    const container = document.querySelector(sel);
    if (!container) return null;
    const spans = [...container.querySelectorAll('.word')];
    return spans.map(s => parseFloat(getComputedStyle(s).opacity));
  }, containerSelector);
}

// ── Find the first WordReveal paragraph (intro text) ────────────────────────
// WhyUpvc wraps intro copy in a <p> that contains .word spans
const firstRevealSel = 'main p:has(.word)';

// Get the bounding rect of that paragraph
const rect = await p.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, height: r.height };
}, firstRevealSel);

console.log('First WordReveal paragraph rect (initial):', rect);

if (!rect) {
  console.error('FAIL: Could not find a WordReveal paragraph (.word spans)');
  await b.close();
  process.exit(1);
}

// ── STEP 1: Scroll so element top is at ~60% from viewport top (within reveal range) ──
// Reveal range: start = element-top at viewport-bottom-20% = viewport*0.8
//               end   = element-top at viewport-center = viewport*0.5
// We want element-top between those → scroll to put it at 65% from top
const targetTopFraction = 0.65; // 65% down the viewport = between 80% (start) and 50% (end)
const currentScrollY = await p.evaluate(() => window.scrollY);
const viewportHeight = 900;
// element top = rect.top + currentScrollY (absolute y)
const elementAbsTop = rect.top + currentScrollY;
// We want: elementAbsTop - scrollY = targetTopFraction * viewportHeight
// => scrollY = elementAbsTop - targetTopFraction * viewportHeight
const scrollToMid = Math.max(0, elementAbsTop - targetTopFraction * viewportHeight);
console.log(`Scrolling to y=${Math.round(scrollToMid)} (mid-reveal, element top at ~65% viewport)`);

await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollToMid);
await p.waitForTimeout(600); // wait for scrub=1 smoothing (~1s of gsap scrub lag, but 600ms should show gradient)

const midOpacities = await sampleOpacities(firstRevealSel);
console.log('\n── MID-REVEAL opacities ──────────────────────────────');
console.log('Word opacities (first → last):', midOpacities?.map(o => o.toFixed(2)).join(', '));

// Analyse gradient
if (midOpacities && midOpacities.length >= 4) {
  const first = midOpacities.slice(0, 3);
  const last  = midOpacities.slice(-3);
  const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
  const lastAvg  = last.reduce((a, b) => a + b, 0) / last.length;
  // Distinct opacity bands: count unique values rounded to 1dp
  const bands = new Set(midOpacities.map(o => o.toFixed(1))).size;
  console.log(`First-3 avg opacity : ${firstAvg.toFixed(2)}`);
  console.log(`Last-3  avg opacity : ${lastAvg.toFixed(2)}`);
  console.log(`Distinct bands      : ${bands}`);
  const pass = firstAvg > lastAvg && bands >= 3;
  console.log(`Mid-reveal gradient : ${pass ? 'PASS ✓' : 'FAIL ✗'} (first > last and ≥3 bands)`);
} else {
  console.log('WARN: too few word spans to analyse gradient');
}

// ── STEP 2: Scroll so element top is well above viewport center (past end marker) ──
// end = "top center" → element top at 50% viewport height
// Go 20% further so element top is at 30% viewport height → fully revealed
const scrollToEnd = Math.max(0, elementAbsTop - 0.30 * viewportHeight);
console.log(`\nScrolling to y=${Math.round(scrollToEnd)} (past reveal end, element top at ~30% viewport)`);

await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollToEnd);
await p.waitForTimeout(600);

const endOpacities = await sampleOpacities(firstRevealSel);
console.log('\n── POST-REVEAL opacities ─────────────────────────────');
console.log('Word opacities (first → last):', endOpacities?.map(o => o.toFixed(2)).join(', '));

if (endOpacities) {
  const allNearOne = endOpacities.every(o => o >= 0.95);
  console.log(`All words near 1.0  : ${allNearOne ? 'PASS ✓' : 'FAIL ✗'}`);
}

await b.close();
console.log('\nDone.');

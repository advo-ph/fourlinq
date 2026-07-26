// Verify WordReveal on /brand page.
// PASS criteria:
//   1. Mid-reveal: certifications intro paragraph word opacities form a gradient
//      (first words higher than last, ≥3 distinct bands).
//   2. Post-reveal: all words near 1.0.
//   3. Warranty band: full text rendered (guards mixed-children→template-literal conversion).
import { chromium } from 'playwright';

const PORT = 8082;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });

await p.goto(`http://localhost:${PORT}/brand`, { waitUntil: 'networkidle', timeout: 90000 });

// ── Helper: sample opacity of all .word spans inside a container ──────────────
async function sampleOpacities(containerSelector) {
  return p.evaluate((sel) => {
    const container = document.querySelector(sel);
    if (!container) return null;
    const spans = [...container.querySelectorAll('.word')];
    return spans.map(s => parseFloat(getComputedStyle(s).opacity));
  }, containerSelector);
}

// ── PART 1: Certifications intro paragraph WordReveal gradient ────────────────
// The certifications intro is the third large paragraph on the page with .word spans.
// Select the paragraph containing "Every FourlinQ system" text.
const certRevealSel = 'main p:has(.word)'; // picks first WordReveal — use nth below

// Count all WordReveal paragraphs to find certifications intro (4th on page: 3 story + 1 warranty + cert)
const allWordRevealCount = await p.evaluate(() => {
  return document.querySelectorAll('main p:has(.word)').length;
});
console.log(`Total WordReveal <p> elements on /brand: ${allWordRevealCount}`);
// Expected: 6 (3 story + 1 warranty + 1 cert + 1 contact)

// Target the certifications intro: "Every FourlinQ system..."
// It's after the warranty band — find by text content match
const certSel = await p.evaluate(() => {
  const all = [...document.querySelectorAll('main p:has(.word)')];
  const match = all.find(el => el.textContent?.includes('Every FourlinQ'));
  if (!match) return null;
  // Give it a unique ID so we can reliably select it
  match.setAttribute('data-probe', 'cert-intro');
  return '[data-probe="cert-intro"]';
});
console.log(`Cert intro selector: ${certSel}`);

if (!certSel) {
  console.error('FAIL: Could not find certifications intro WordReveal paragraph');
  await b.close();
  process.exit(1);
}

const certRect = await p.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, height: r.height };
}, certSel);

console.log('Certifications intro rect (initial):', certRect);

const currentScrollY = await p.evaluate(() => window.scrollY);
const viewportHeight = 900;
const elementAbsTop = certRect.top + currentScrollY;

// Mid-reveal: element top at 65% viewport (between start=80% and end=50%)
const scrollToMid = Math.max(0, elementAbsTop - 0.65 * viewportHeight);
console.log(`\nScrolling to y=${Math.round(scrollToMid)} (mid-reveal, element top at ~65% viewport)`);
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollToMid);
await p.waitForTimeout(600);

const midOpacities = await sampleOpacities(certSel);
console.log('\n── MID-REVEAL opacities (cert intro) ──────────────────────────────');
console.log('Word opacities (first → last):', midOpacities?.map(o => o.toFixed(2)).join(', '));

if (midOpacities && midOpacities.length >= 4) {
  const first = midOpacities.slice(0, 3);
  const last  = midOpacities.slice(-3);
  const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
  const lastAvg  = last.reduce((a, b) => a + b, 0) / last.length;
  const bands = new Set(midOpacities.map(o => o.toFixed(1))).size;
  console.log(`First-3 avg opacity : ${firstAvg.toFixed(2)}`);
  console.log(`Last-3  avg opacity : ${lastAvg.toFixed(2)}`);
  console.log(`Distinct bands      : ${bands}`);
  const pass = firstAvg > lastAvg && bands >= 3;
  console.log(`Mid-reveal gradient : ${pass ? 'PASS ✓' : 'FAIL ✗'} (first > last and ≥3 bands)`);
} else {
  console.log(`WARN: only ${midOpacities?.length ?? 0} word spans found — too few to analyse`);
}

// Post-reveal: element top at 30% viewport (past "top center" end)
const scrollToEnd = Math.max(0, elementAbsTop - 0.30 * viewportHeight);
console.log(`\nScrolling to y=${Math.round(scrollToEnd)} (past reveal end, element top at ~30% viewport)`);
await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollToEnd);
await p.waitForTimeout(600);

const endOpacities = await sampleOpacities(certSel);
console.log('\n── POST-REVEAL opacities (cert intro) ──────────────────────────────');
console.log('Word opacities (first → last):', endOpacities?.map(o => o.toFixed(2)).join(', '));
if (endOpacities) {
  const allNearOne = endOpacities.every(o => o >= 0.95);
  console.log(`All words near 1.0  : ${allNearOne ? 'PASS ✓' : 'FAIL ✗'}`);
}

// ── PART 2: Warranty band full-text render check ──────────────────────────────
console.log('\n── WARRANTY BAND text content ───────────────────────────────────────');
const warrantyText = await p.evaluate(() => {
  const all = [...document.querySelectorAll('main p:has(.word)')];
  // Warranty band: dark section, text-white/65 — find by class fragment or position
  // It should contain BRAND.promise text. Let's find by checking section tone.
  // More robustly: find the <p> with class containing 'text-white/65'
  const el = all.find(el => el.className.includes('text-white'));
  return el ? el.textContent?.trim() : null;
});
console.log('Warranty band text:', warrantyText ? `"${warrantyText.slice(0, 100)}..."` : 'NOT FOUND');
const warrantyPass = warrantyText && warrantyText.length > 20;
console.log(`Warranty text renders : ${warrantyPass ? 'PASS ✓' : 'FAIL ✗'} (non-empty, length=${warrantyText?.length ?? 0})`);

await b.close();
console.log('\nDone.');

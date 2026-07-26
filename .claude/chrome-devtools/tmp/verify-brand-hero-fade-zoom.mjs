// Close-up seam inspection for the /brand hero dissolve.
// Captures @2x zoom clips of the transition and runs a per-row mean-luminance
// scan across the hero-bottom boundary. A seam shows up as a large row-to-row
// luminance jump; a clean dissolve ramps smoothly to 255 (pure white).
// Usage: node verify-brand-hero-fade-zoom.mjs [label]
import { chromium } from 'playwright';
import sharp from 'sharp';

const PORT = 8080;
const label = process.argv[2] ?? 'zoom';
const OUT = new URL('.', import.meta.url).pathname;

const b = await chromium.launch();

async function probe(viewport, name, zoomClips) {
  const p = await b.newPage({ viewport, deviceScaleFactor: 2 });
  // Pre-accept cookie consent + hide the chat bubble so fixed overlays don't
  // pollute the luminance row-scan.
  await p.addInitScript(() => localStorage.setItem('fourlinq_cookie_consent', 'accepted'));
  await p.goto(`http://localhost:${PORT}/brand`, { waitUntil: 'networkidle', timeout: 90000 });
  await p.addStyleTag({ content: '[data-cookie-banner],[data-chat-bubble]{display:none !important;}' });
  await p.waitForSelector('img[src*="brand-hero"]', { timeout: 30000 });
  await p.waitForTimeout(1800);

  const rect = await p.evaluate(() => {
    const img = document.querySelector('img[src*="brand-hero"]');
    const r = img.closest('div.relative').getBoundingClientRect();
    return { bottom: r.bottom + window.scrollY, height: r.height };
  });

  for (const clip of zoomClips(rect)) {
    const path = `${OUT}brand-hero-fade-${label}-${name}-${clip.tag}.png`;
    await p.screenshot({ path, clip: { x: clip.x, y: clip.y, width: clip.w, height: clip.h } });
    console.log(`[${name}] wrote ${clip.tag}: x=${clip.x} y=${Math.round(clip.y)} ${clip.w}x${clip.h}`);
  }

  // Row-luminance scan: full width, from 120px above hero bottom to 40px below.
  // The tall v2 hero puts this window past the fold on desktop; scroll it
  // fully into view first — Playwright clips are viewport-bound.
  const scanTop = rect.bottom - 120;
  const scroll = Math.max(0, scanTop + 160 - viewport.height + 20);
  await p.evaluate((s) => window.scrollTo(0, s), scroll);
  await p.waitForTimeout(500);
  const scanPath = `${OUT}brand-hero-fade-${label}-${name}-scan.png`;
  await p.screenshot({ path: scanPath, clip: { x: 0, y: scanTop - scroll, width: viewport.width, height: 160 } });
  const { data, info } = await sharp(scanPath).greyscale().raw().toBuffer({ resolveWithObject: true });
  const rows = [];
  for (let y = 0; y < info.height; y++) {
    let sum = 0;
    for (let x = 0; x < info.width; x++) sum += data[y * info.width + x];
    rows.push(sum / info.width);
  }
  // Report every 4th row (2 CSS px at @2x) and the max adjacent-row delta.
  let maxDelta = 0, maxAt = 0;
  for (let y = 1; y < rows.length; y++) {
    const d = Math.abs(rows[y] - rows[y - 1]);
    if (d > maxDelta) { maxDelta = d; maxAt = y; }
  }
  const summary = rows.filter((_, i) => i % 8 === 0).map(v => v.toFixed(0)).join(' ');
  console.log(`[${name}] row luminance (every 4 css px, top→bottom):\n  ${summary}`);
  console.log(`[${name}] boundary row (hero bottom) ≈ device row ${Math.round(120 * 2)}`);
  console.log(`[${name}] max adjacent-row delta: ${maxDelta.toFixed(2)} at device row ${maxAt} (${(maxAt / 2 - 120).toFixed(0)}px past hero bottom)`);
  console.log(`[${name}] seam check: ${maxDelta < 1.5 ? 'SMOOTH ✓' : 'POSSIBLE SEAM ✗'} (threshold 1.5)`);

  await p.close();
}

await probe({ width: 1440, height: 900 }, 'desktop', (rect) => [
  // Dark building right side — hardest area to dissolve.
  { tag: 'building', x: 620, y: rect.bottom - 220, w: 620, h: 300 },
  // Left side under the hero copy / gallery link.
  { tag: 'copyside', x: 0, y: rect.bottom - 220, w: 620, h: 300 },
]);
await probe({ width: 390, height: 844 }, 'mobile', (rect) => [
  { tag: 'edge', x: 0, y: Math.max(0, rect.bottom - 90), w: 390, h: 180 },
]);

await b.close();
console.log('Done.');

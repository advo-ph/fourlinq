// Screenshot the /brand hero → next-section transition region so the
// hero-photo→white-canvas dissolve can be inspected by eye.
// Usage: node verify-brand-hero-fade.mjs [label]
// Outputs: brand-hero-fade-{label}-desktop.png / -mobile.png (transition clip)
//          brand-hero-fade-{label}-desktop-full.png / -mobile-full.png (hero + context)
import { chromium } from 'playwright';

const PORT = 8080;
const label = process.argv[2] ?? 'probe';
const OUT = new URL('.', import.meta.url).pathname;

const b = await chromium.launch();

async function shoot(viewport, name) {
  const p = await b.newPage({ viewport });
  // Pre-accept cookie consent + hide the chat bubble so fixed overlays don't
  // pollute the transition-region screenshots.
  await p.addInitScript(() => localStorage.setItem('fourlinq_cookie_consent', 'accepted'));
  await p.goto(`http://localhost:${PORT}/brand`, { waitUntil: 'networkidle', timeout: 90000 });
  await p.addStyleTag({ content: '[data-cookie-banner],[data-chat-bubble]{display:none !important;}' });
  await p.waitForSelector('img[src*="brand-hero"]', { timeout: 30000 });
  // Let the hero copy Stagger animation and image decode settle.
  await p.waitForTimeout(1800);

  const rect = await p.evaluate(() => {
    const img = document.querySelector('img[src*="brand-hero"]');
    const box = img.closest('div.relative');
    const r = box.getBoundingClientRect();
    return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height, width: r.width };
  });
  console.log(`[${name}] hero box:`, rect);

  // Full-context shot first (page at scroll 0): hero from the top plus
  // whatever of the next section fits in the viewport.
  await p.screenshot({
    path: `${OUT}brand-hero-fade-${label}-${name}-full.png`,
    clip: { x: 0, y: 0, width: viewport.width, height: Math.min(rect.bottom + 300, viewport.height) },
  });

  // Transition clip: bottom half of the hero plus the first slice of the next
  // section. The tall v2 hero pushes this window past the fold on desktop, so
  // scroll it fully into view first — Playwright clips are viewport-bound.
  const above = Math.min(rect.height, viewport.width >= 1024 ? 320 : rect.height);
  const below = 160;
  const clipTopDoc = Math.max(0, rect.bottom - above);
  const scroll = Math.max(0, clipTopDoc + above + below - viewport.height + 20);
  await p.evaluate((s) => window.scrollTo(0, s), scroll);
  await p.waitForTimeout(500);
  await p.screenshot({
    path: `${OUT}brand-hero-fade-${label}-${name}.png`,
    clip: { x: 0, y: clipTopDoc - scroll, width: viewport.width, height: above + below },
  });

  await p.close();
}

await shoot({ width: 1440, height: 900 }, 'desktop');
await shoot({ width: 390, height: 844 }, 'mobile');

await b.close();
console.log('Done. Screenshots written to', OUT);

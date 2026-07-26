// One-off: capture the /brand hero copy zone at native scale so the enlarged
// WhyUpvc-sized headline can be checked against the window/door edges.
// Usage: node verify-brand-hero-copyzone.mjs [label]
import { chromium } from 'playwright';

const PORT = 8080;
const label = process.argv[2] ?? 'copyzone';
const OUT = new URL('.', import.meta.url).pathname;

const b = await chromium.launch();

async function shoot(viewport, name) {
  const p = await b.newPage({ viewport });
  await p.addInitScript(() => localStorage.setItem('fourlinq_cookie_consent', 'accepted'));
  await p.goto(`http://localhost:${PORT}/brand`, { waitUntil: 'networkidle', timeout: 90000 });
  await p.addStyleTag({ content: '[data-cookie-banner],[data-chat-bubble]{display:none !important;}' });
  await p.waitForSelector('img[src*="brand-hero"]', { timeout: 30000 });
  await p.waitForTimeout(1800);
  const copy = await p.evaluate(() => {
    const h1 = [...document.querySelectorAll('h1')].find(h => h.offsetParent);
    const r = h1.getBoundingClientRect();
    return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, right: r.right, width: r.width };
  });
  console.log(`[${name}] visible h1:`, copy);
  await p.screenshot({
    path: `${OUT}brand-hero-${label}-${name}.png`,
    clip: { x: 0, y: Math.max(0, copy.top - 60), width: viewport.width, height: Math.min(copy.bottom - copy.top + 320, viewport.height) },
  });
  await p.close();
}

await shoot({ width: 1440, height: 900 }, 'desktop-1440');
await shoot({ width: 1280, height: 800 }, 'desktop-1280');
await shoot({ width: 1024, height: 768 }, 'desktop-1024');

await b.close();
console.log('Done.');

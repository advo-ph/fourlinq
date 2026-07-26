// Sample the /brand mobile hero at several loop timestamps to judge whether
// the moving glazing ever undermines text legibility (scrim decision).
import { chromium } from 'playwright';

const PORT = 8080;
const OUT = '/Users/princewagan/fourlinq/.claude/chrome-devtools/tmp';
const times = [0.1, 1.5, 3.3, 5.0, 6.5];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.addInitScript(() => localStorage.setItem('fourlinq_cookie_consent', 'accepted'));
await p.goto(`http://localhost:${PORT}/brand`, { waitUntil: 'networkidle', timeout: 90000 });
await p.addStyleTag({ content: '[data-cookie-banner],[data-chat-bubble]{display:none !important;}' });
await p.waitForSelector('header video', { timeout: 30000 });
await p.waitForTimeout(800);

for (const t of times) {
  await p.evaluate((time) => {
    const v = document.querySelector('header video');
    v.pause();
    v.currentTime = time;
  }, t);
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/brand-hero-video-390-t${String(t).replace('.', '_')}.png` });
  console.log(`captured t=${t}s`);
}

await b.close();
console.log('Done.');

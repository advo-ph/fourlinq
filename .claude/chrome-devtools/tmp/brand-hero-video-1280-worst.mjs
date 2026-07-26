import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.addInitScript(() => localStorage.setItem('fourlinq_cookie_consent', 'accepted'));
await p.goto('http://localhost:8080/brand', { waitUntil: 'networkidle', timeout: 90000 });
await p.addStyleTag({ content: '[data-cookie-banner],[data-chat-bubble]{display:none !important;}' });
await p.waitForSelector('header video', { timeout: 30000 });
await p.waitForTimeout(800);
for (const t of [0.1, 6.5]) {
  await p.evaluate((time) => { const v = document.querySelector('header video'); v.pause(); v.currentTime = time; }, t);
  await p.waitForTimeout(500);
  await p.screenshot({ path: `/Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/brand-hero-video-1280-t${String(t).replace('.', '_')}.png` });
}
await b.close();

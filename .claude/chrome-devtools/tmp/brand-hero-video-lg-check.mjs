import { chromium } from 'playwright';
const b = await chromium.launch();
for (const vp of [{ w: 1100, h: 800 }, { w: 1280, h: 800 }]) {
  const p = await b.newPage({ viewport: { width: vp.w, height: vp.h } });
  await p.addInitScript(() => localStorage.setItem('fourlinq_cookie_consent', 'accepted'));
  await p.goto('http://localhost:8080/brand', { waitUntil: 'networkidle', timeout: 90000 });
  await p.addStyleTag({ content: '[data-cookie-banner],[data-chat-bubble]{display:none !important;}' });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const h1 = document.querySelector('header h1');
    const rect = h1.getBoundingClientRect();
    return { right: Math.round(rect.right), fontSize: getComputedStyle(h1).fontSize };
  });
  console.log(`${vp.w}px: h1 font ${r.fontSize}, right edge ${r.right}px (${Math.round((r.right / vp.w) * 100)}%)`);
  await p.screenshot({ path: `/Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/brand-hero-video-${vp.w}-hero.png` });
  await p.close();
}
await b.close();

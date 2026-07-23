import { getBrowser, disconnectBrowser, outputJSON } from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js';

const browser = await getBrowser();
const pages = await browser.pages();
const page = pages.find(p => p.url().includes('facebook.com')) || pages[pages.length-1];
const result = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
    .map(i => ({src: (i.src||''), w: i.naturalWidth, h: i.naturalHeight}))
    .filter(i => i.w > 400);
  const loginWall = !!document.querySelector('form[action*="login"], [data-testid="royal_login_form"]');
  return {url: location.href, loginWall, imgCount: imgs.length, imgs: imgs.slice(0,5).map(i=>({...i, src:i.src.slice(0,160)})), bodySnippet: document.body.innerText.slice(0,200)};
});
outputJSON(result);
await disconnectBrowser();

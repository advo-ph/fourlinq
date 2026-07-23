import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const START = process.argv[2];
const MAX_PHOTOS = 40;

const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1440, height: 900 } });
const page = (await browser.pages())[0];
await page.goto(START, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));

// Dismiss login popup if present (X close button), then Escape as fallback
const closed = await page.evaluate(() => {
  const candidates = Array.from(document.querySelectorAll('[aria-label="Close"], [aria-label="close"], div[role="button"][aria-label*="lose"]'));
  if (candidates.length) { candidates[0].click(); return candidates.map(c => c.getAttribute('aria-label')); }
  return [];
});
console.log('CLOSED:' + JSON.stringify(closed));
await new Promise(r => setTimeout(r, 1500));

// List candidate nav buttons for diagnostics
const navs = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[aria-label]')).map(e => e.getAttribute('aria-label'))
    .filter(l => /next|prev|photo|close/i.test(l))
);
console.log('NAVS:' + JSON.stringify(navs));

const seen = new Map();
const firstFbid = new URL(page.url()).searchParams.get('fbid');
for (let step = 0; step < MAX_PHOTOS; step++) {
  await new Promise(r => setTimeout(r, 2200));
  const cur = await page.evaluate(() => {
    const u = new URL(location.href);
    const fbid = u.searchParams.get('fbid');
    let best = null;
    for (const i of document.querySelectorAll('img')) {
      if (i.naturalWidth >= 500 && (!best || i.naturalWidth * i.naturalHeight > best.naturalWidth * best.naturalHeight)) best = i;
    }
    return { fbid, src: best ? best.src : null, w: best ? best.naturalWidth : 0, h: best ? best.naturalHeight : 0 };
  });
  if (cur.fbid && cur.src) {
    if (seen.has(cur.fbid) && seen.size > 1 && cur.fbid === firstFbid) { console.log('LOOPED'); break; }
    if (!seen.has(cur.fbid)) { seen.set(cur.fbid, cur); console.log('PHOTO:' + JSON.stringify(cur)); }
  }
  // click next arrow
  const advanced = await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Next photo"], [aria-label="next photo"], [data-name="media-viewer-nav-container"] [role="button"]:last-child');
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (!advanced) {
    await page.keyboard.press('Escape');
    await page.keyboard.press('ArrowRight');
  }
}
console.log('RESULT:' + JSON.stringify({ count: seen.size, fbids: [...seen.keys()] }));
await browser.close();

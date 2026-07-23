import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import fs from 'fs';

const START = 'https://www.facebook.com/photo/?fbid=122184650018767526';
const OUT = process.argv[2] || '/tmp/fb-walk.json';
const DIRECTION = process.argv[3] || 'forward'; // forward | backward
const MAX_STEPS = parseInt(process.argv[4] || '250', 10);

const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1440, height: 900 } });
const page = (await browser.pages())[0];
await page.goto(START, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
await page.evaluate(() => {
  const c = document.querySelector('[aria-label="Close"]');
  if (c) c.click();
});
await new Promise(r => setTimeout(r, 1200));

const label = DIRECTION === 'forward' ? 'Next photo' : 'Previous photo';
const photos = [];
const seen = new Set();
let stagnant = 0;
for (let step = 0; step < MAX_STEPS && stagnant < 6; step++) {
  await new Promise(r => setTimeout(r, 1800));
  const cur = await page.evaluate(() => {
    const u = new URL(location.href);
    const fbid = u.searchParams.get('fbid');
    let best = null;
    for (const i of document.querySelectorAll('img')) {
      if (i.naturalWidth >= 500 && (!best || i.naturalWidth * i.naturalHeight > best.naturalWidth * best.naturalHeight)) best = i;
    }
    // post date from sidebar: look for a link with aria-label or text like "April 23" / "November 18, 2025"
    let dateLabel = null;
    const txt = document.body.innerText;
    const m = txt.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(, \d{4})?\b/);
    if (m) dateLabel = m[0];
    return { fbid, src: best ? best.src : null, w: best ? best.naturalWidth : 0, h: best ? best.naturalHeight : 0, dateLabel };
  });
  if (cur.fbid && cur.src && !seen.has(cur.fbid)) {
    seen.add(cur.fbid);
    photos.push(cur);
    console.log(`[${photos.length}] ${cur.fbid} ${cur.w}x${cur.h} ${cur.dateLabel || '?'}`);
    stagnant = 0;
  } else {
    stagnant++;
  }
  const ok = await page.evaluate((lbl) => {
    const btn = document.querySelector(`[aria-label="${lbl}"]`);
    if (btn) { btn.click(); return true; }
    return false;
  }, label);
  if (!ok) stagnant++;
}
fs.writeFileSync(OUT, JSON.stringify({ direction: DIRECTION, photos }, null, 2));
console.log('WROTE:' + OUT + ' count=' + photos.length);
await browser.close();

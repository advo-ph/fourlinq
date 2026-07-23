// Walk the FULL FourlinQofficial photo stream (logged-out theater) in both
// directions from a start fbid, capturing fbid + largest img src per photo.
import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import fs from 'fs';

const START_FBID = process.argv[2] || '122184650018767526';
const OUT = process.argv[3] || '/tmp/fb-walk-full.json';
const MAX_STEPS = parseInt(process.argv[4] || '400', 10);

const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1440, height: 900 } });
const page = (await browser.pages())[0];

const photos = [];
const seen = new Set();

async function walk(direction) {
  await page.goto(`https://www.facebook.com/photo/?fbid=${START_FBID}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  await page.evaluate(() => {
    const c = document.querySelector('[aria-label="Close"]');
    if (c) c.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  const label = direction === 'forward' ? 'Next photo' : 'Previous photo';
  let stagnant = 0;
  for (let step = 0; step < MAX_STEPS && stagnant < 8; step++) {
    await new Promise(r => setTimeout(r, 1500));
    const cur = await page.evaluate(() => {
      const u = new URL(location.href);
      const fbid = u.searchParams.get('fbid');
      let best = null;
      for (const i of document.querySelectorAll('img')) {
        if (i.naturalWidth >= 500 && (!best || i.naturalWidth * i.naturalHeight > best.naturalWidth * best.naturalHeight)) best = i;
      }
      let dateLabel = null;
      const m = document.body.innerText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(, \d{4})?\b/);
      if (m) dateLabel = m[0];
      return { fbid, src: best ? best.src : null, w: best ? best.naturalWidth : 0, h: best ? best.naturalHeight : 0, dateLabel };
    });
    if (cur.fbid && cur.src && !seen.has(cur.fbid)) {
      seen.add(cur.fbid);
      photos.push(cur);
      console.log(`[${photos.length}] ${direction} ${cur.fbid} ${cur.w}x${cur.h} ${cur.dateLabel || '?'}`);
      stagnant = 0;
      if (photos.length % 20 === 0) fs.writeFileSync(OUT, JSON.stringify({ photos }, null, 1));
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
}

await walk('backward'); // newer posts first
await walk('forward');  // then older posts
fs.writeFileSync(OUT, JSON.stringify({ photos }, null, 2));
console.log('WROTE:' + OUT + ' count=' + photos.length);
await browser.close();

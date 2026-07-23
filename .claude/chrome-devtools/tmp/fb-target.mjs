import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import fs from 'fs';

// anchors: [label, anchorFbid]
const ANCHORS = [
  ['post18-nov18', '122165946392767526'],
  ['post20-nov12', '122165187776767526'],
  ['post22-sep30', '122159098238767526'],
  ['post23-sep16', '122156730224767526'],
  ['post24-aug26', '122153237228767526'],
  ['post26-aug13', '122150952590767526'],
  ['post35-jun18', '122141164928767526'],
  ['post38-jun16', '122140475168767526'],
];

const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1440, height: 900 } });
const page = (await browser.pages())[0];

async function snap() {
  return await page.evaluate(() => {
    const u = new URL(location.href);
    const fbid = u.searchParams.get('fbid');
    let best = null;
    for (const i of document.querySelectorAll('img')) {
      if (i.naturalWidth >= 500 && (!best || i.naturalWidth * i.naturalHeight > best.naturalWidth * best.naturalHeight)) best = i;
    }
    const m = document.body.innerText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(, \d{4})?\b/);
    return { fbid, src: best ? best.src : null, w: best ? best.naturalWidth : 0, h: best ? best.naturalHeight : 0, dateLabel: m ? m[0] : null };
  });
}
async function closePopup() {
  await page.evaluate(() => { const c = document.querySelector('[aria-label="Close"]'); if (c) c.click(); });
}
async function nav(label) {
  return await page.evaluate((lbl) => { const b = document.querySelector(`[aria-label="${lbl}"]`); if (b) { b.click(); return true; } return false; }, label);
}

const all = {};
for (const [tag, anchor] of ANCHORS) {
  const collected = new Map();
  let anchorDate = null;
  for (const dir of ['Next photo', 'Previous photo']) {
    await page.goto(`https://www.facebook.com/photo/?fbid=${anchor}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 2500));
    await closePopup();
    await new Promise(r => setTimeout(r, 1000));
    let offDate = 0, stagnant = 0;
    for (let step = 0; step < 40 && offDate < 2 && stagnant < 5; step++) {
      await new Promise(r => setTimeout(r, 1700));
      const cur = await snap();
      if (!cur.fbid || !cur.src) { stagnant++; continue; }
      if (anchorDate === null && cur.fbid === anchor) anchorDate = cur.dateLabel;
      if (anchorDate && cur.dateLabel && cur.dateLabel !== anchorDate) { offDate++; }
      else if (cur.fbid) {
        if (collected.has(cur.fbid)) stagnant++;
        else { collected.set(cur.fbid, cur); stagnant = 0; }
        offDate = 0;
      }
      if (!(await nav(dir))) stagnant++;
    }
  }
  all[tag] = { anchor, anchorDate, photos: [...collected.values()] };
  console.log(`DONE ${tag}: ${collected.size} photos (date=${anchorDate})`);
  fs.writeFileSync('/tmp/fb-target.json', JSON.stringify(all, null, 2));
}
await browser.close();
console.log('ALLDONE');

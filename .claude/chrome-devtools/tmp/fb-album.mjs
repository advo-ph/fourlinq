import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const START = process.argv[2] || 'https://www.facebook.com/photo/?fbid=122184650018767526&set=pcb.122184650504767526';
const MAX_PHOTOS = 30;

const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1440, height: 900 } });
const page = (await browser.pages())[0];
await page.goto(START, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));

const state = await page.evaluate(() => ({
  url: location.href,
  hasLoginForm: !!document.querySelector('form[action*="login"], [data-testid="royal_login_form"], #login_popup_cta_form'),
  bigImgs: Array.from(document.querySelectorAll('img')).filter(i => i.naturalWidth > 500).map(i => ({ src: i.src.slice(0, 100), w: i.naturalWidth, h: i.naturalHeight })),
  text: document.body.innerText.slice(0, 150).replace(/\n/g, ' | ')
}));
console.log('STATE:' + JSON.stringify(state));

if (state.hasLoginForm && state.bigImgs.length === 0) {
  console.log('RESULT:' + JSON.stringify({ needLogin: true }));
  await browser.close();
  process.exit(0);
}

// Walk the album: collect current theater image, press ArrowRight for next
const seen = new Map();
let stagnant = 0;
for (let step = 0; step < MAX_PHOTOS && stagnant < 3; step++) {
  await new Promise(r => setTimeout(r, 2500));
  const cur = await page.evaluate(() => {
    const u = new URL(location.href);
    const fbid = u.searchParams.get('fbid');
    // theater image = biggest visible img
    let best = null;
    for (const i of document.querySelectorAll('img')) {
      if (i.naturalWidth >= 500 && (!best || i.naturalWidth * i.naturalHeight > best.naturalWidth * best.naturalHeight)) best = i;
    }
    return { fbid, src: best ? best.src : null, w: best ? best.naturalWidth : 0, h: best ? best.naturalHeight : 0 };
  });
  if (cur.fbid && cur.src && !seen.has(cur.fbid)) {
    seen.set(cur.fbid, cur);
    console.log('PHOTO:' + JSON.stringify(cur));
    stagnant = 0;
  } else {
    stagnant++;
  }
  await page.keyboard.press('ArrowRight');
}
console.log('RESULT:' + JSON.stringify({ needLogin: false, count: seen.size }));
await browser.close();

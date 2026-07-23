// Probe a FB page logged-out: collect photo fbid links from the timeline/photos tab.
import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const URL = process.argv[2];
const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1440, height: 900 } });
const page = (await browser.pages())[0];
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));
await page.evaluate(() => {
  const c = document.querySelector('[aria-label="Close"]');
  if (c) c.click();
});
await new Promise(r => setTimeout(r, 1500));
const found = new Set();
for (let i = 0; i < 12; i++) {
  const links = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll('a[href*="fbid="], a[href*="/photos/"]')) out.push(a.href);
    document.title && out.push('TITLE:' + document.title);
    return out;
  });
  links.forEach(l => found.add(l));
  await page.evaluate(() => window.scrollBy(0, 1200));
  await new Promise(r => setTimeout(r, 1200));
}
console.log([...found].join('\n'));
await browser.close();

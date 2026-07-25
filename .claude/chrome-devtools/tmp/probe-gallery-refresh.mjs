import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1512, height: 1000 } });
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

await p.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 60000 });
// The strip is the section containing the headline.
const h = p.locator('h3', { hasText: 'Built to your satisfaction' });
await h.waitFor({ timeout: 30000 });
const section = p.locator('section').filter({ has: h });
await p.waitForTimeout(2500); // let the merged/CMS fetches land + re-render

const tiles = section.locator('a[href^="/projects/"]');
const n = await tiles.count();
const hrefs = await tiles.evaluateAll(as => as.slice(0, 5).map(a => a.getAttribute('href')));
const srcs  = await section.locator('a[href^="/projects/"] img')
  .evaluateAll(is => is.slice(0, 3).map(i => i.getAttribute('src')));

console.log('tiles rendered   :', n);
console.log('first 5 hrefs    :', hrefs);
console.log('first 3 img srcs :', srcs);
console.log('radius on tile   :', await tiles.first().evaluate(e => getComputedStyle(e).borderRadius));
console.log('console errors   :', errs.length ? errs.slice(0,5) : 'none');

// mobile: heading visible, hero hidden
const m = await b.newPage({ viewport: { width: 390, height: 900 } });
await m.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 60000 });
const mh = m.locator('h3', { hasText: 'Built to your satisfaction' });
await mh.waitFor({ timeout: 30000 });
console.log('\n[mobile 390px]');
console.log('heading visible  :', await mh.isVisible());
console.log('subtitle visible :', await m.locator('p', { hasText: 'FourlinQ installations' }).isVisible());
const heroImgs = m.locator('img[alt*="Curved-glass modern residence"]');
console.log('feature hero vis :', await heroImgs.count() ? await heroImgs.first().isVisible() : 'n/a');
await b.close();

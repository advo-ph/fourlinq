import { chromium } from 'playwright';
import fs from 'fs';

const prod = JSON.parse(fs.readFileSync('/tmp/merged.json', 'utf8'));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });

let routeHits = 0;
await p.route('**/api/project-images/merged**', async r => {
  routeHits++;
  await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(prod) });
});
await p.route('**/uploads/cms/**', async r => {
  const u = new URL(r.request().url());
  const res = await fetch('https://fourlinq.ph' + u.pathname);
  const buf = Buffer.from(await res.arrayBuffer());
  await r.fulfill({ status: res.status, contentType: res.headers.get('content-type') || 'image/png', body: buf });
});

await p.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 90000 });
const h = p.locator('h3', { hasText: 'Built to your satisfaction' });
await h.waitFor({ timeout: 30000 });
await p.waitForTimeout(4000);

console.log('merged route intercepted :', routeHits, 'time(s)');

const section = p.locator('section').filter({ has: h });
const tiles = section.locator('a[href^="/projects/"]');
console.log('tiles rendered           :', await tiles.count(), '(prod payload => expect 55)');

const srcs = await section.locator('a[href^="/projects/"] img').evaluateAll(is =>
  is.map(i => i.getAttribute('src')));
const up = srcs.filter(s => s && s.includes('/uploads/cms/'));
console.log('tiles w/ CMS upload cover:', up.length);
console.log('  → -thumb               :', up.filter(s => s.includes('-thumb.')).length);
console.log('  → FULL-RES (bad)       :', up.filter(s => !s.includes('-thumb.')).length);
up.slice(0, 4).forEach(s => console.log('     ', s));

// gallery-only byte total, measured from the rendered srcs
let gal = 0, miss = 0;
for (const s of srcs) {
  if (!s) continue;
  const path = s.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  try {
    const r2 = await fetch('https://fourlinq.ph' + path, { method: 'HEAD' });
    if (r2.ok) gal += Number(r2.headers.get('content-length') || 0); else miss++;
  } catch { miss++; }
}
console.log('\ngallery image payload    : %d KB across %d tiles (%d unresolved)', Math.round(gal/1024), srcs.length, miss);
await b.close();

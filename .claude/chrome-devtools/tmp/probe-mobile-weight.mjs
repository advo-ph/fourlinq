import { chromium } from 'playwright';
import fs from 'fs';
const prod = JSON.parse(fs.readFileSync('/tmp/merged.json','utf8'));

async function run(label, viewport, dsf) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport, deviceScaleFactor: dsf });
  let bytes = 0; const seen = new Set(); let heroes = 0;
  await p.route('**/api/project-images/merged**', r =>
    r.fulfill({ status:200, contentType:'application/json', body: JSON.stringify(prod) }));
  await p.route('**/uploads/cms/**', async r => {
    const u = new URL(r.request().url());
    const res = await fetch('https://fourlinq.ph'+u.pathname);
    const buf = Buffer.from(await res.arrayBuffer());
    await r.fulfill({ status: res.status, contentType: 'image/png', body: buf });
  });
  p.on('request', req => {
    const u = req.url().replace(/^https?:\/\/[^/]+/,'').split('?')[0];
    if (/\.(jpg|jpeg|png|webp)$/i.test(u) && !seen.has(u)) {
      seen.add(u);
      if (/home-feature-\d\.jpg$/.test(u)) heroes++;
    }
  });
  await p.goto('http://localhost:8080/', { waitUntil:'networkidle', timeout:90000 });
  await p.locator('h3',{hasText:'Built to your satisfaction'}).waitFor({timeout:30000});
  await p.waitForTimeout(3500);
  // resolve true sizes from prod
  for (const u of seen) {
    try { const r = await fetch('https://fourlinq.ph'+u,{method:'HEAD'});
      if (r.ok) bytes += Number(r.headers.get('content-length')||0); } catch {}
  }
  console.log(`[${label}] images=${seen.size}  featureHeroes=${heroes}  totalImageBytes=${Math.round(bytes/1024)} KB`);
  await b.close();
}
await run('mobile 390x844 dpr3', {width:390,height:844}, 3);
await run('desktop 1512x1000',   {width:1512,height:1000}, 2);

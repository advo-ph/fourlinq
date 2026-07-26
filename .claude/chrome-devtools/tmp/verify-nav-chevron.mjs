import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 90000 });

const triggers = ['Systems', 'Our Projects', "What's New"];
let fails = 0;
for (const label of triggers) {
  const btn = p.locator('ul button[aria-haspopup="true"]', { hasText: label }).first();
  const hasChevron = await btn.locator('svg.lucide-chevron-down').count();
  console.log(`${hasChevron ? 'PASS' : 'FAIL'}  "${label}" has chevron`);
  if (!hasChevron) fails++;
}

// Rotation on open: click Systems, chevron should be rotate-180
const sys = p.locator('ul button[aria-haspopup="true"]', { hasText: 'Systems' }).first();
await sys.click();
await p.waitForTimeout(400);
const openTransform = await sys.locator('svg.lucide-chevron-down').evaluate(el => getComputedStyle(el).transform);
const rotated = openTransform.includes('matrix(-1'); // rotate(180deg) → matrix(-1, 0, 0, -1, ...)
console.log(`${rotated ? 'PASS' : 'FAIL'}  chevron flips when panel open — ${openTransform}`);
if (!rotated) fails++;

// Plain links (e.g. Why uPVC) must NOT get a chevron
const plain = p.locator('ul a', { hasText: 'Why uPVC' }).first();
const plainChevron = await plain.locator('svg.lucide-chevron-down').count();
console.log(`${plainChevron === 0 ? 'PASS' : 'FAIL'}  plain links have no chevron`);
if (plainChevron !== 0) fails++;

await b.close();
console.log(fails === 0 ? 'ALL CHECKS PASSED' : `${fails} FAILED`);
process.exit(fails ? 1 : 0);

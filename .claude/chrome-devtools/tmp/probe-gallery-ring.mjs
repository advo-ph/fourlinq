// Probe: is the active-thumbnail accent marker in ProjectHeroGallery actually visible?
// Reads computed outline/box-shadow on the thumb <button> and crops a screenshot of
// the top-left corner of the pinned thumb so the stroke can be eyeballed.
import { chromium } from 'playwright';

const SLUG = process.argv[2] ?? 'fourlinq-turnover-3';
const TAG = process.argv[3] ?? 'after';
const URL = `http://localhost:8080/projects/${SLUG}`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(800);

// Desktop rail only — the mobile strip renders the same buttons but is display:none.
const rail = p.locator('section.lg\\:flex');
const thumbs = rail.locator('button[aria-label^="Show photo"]');
console.log('desktop thumbs:', await thumbs.count());

async function inspect(idx) {
  return thumbs.nth(idx).evaluate((node) => {
    const cs = getComputedStyle(node);
    const r = node.getBoundingClientRect();
    return {
      pressed: node.getAttribute('aria-pressed'),
      outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} @ ${cs.outlineOffset}`,
      boxShadow: cs.boxShadow,
      opacity: cs.opacity,
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    };
  });
}

async function shot(idx, name) {
  const { box } = await inspect(idx);
  await p.screenshot({
    path: `.claude/chrome-devtools/tmp/gallery-ring-${TAG}-${name}.png`,
    clip: { x: box.x - 4, y: box.y - 4, width: box.w + 8, height: Math.min(box.h + 8, 90) },
  });
}

console.log('\ndefault pinned #0 :', JSON.stringify(await inspect(0)));
console.log('inactive     #3 :', JSON.stringify(await inspect(3)));
await shot(0, 'default-pinned0');

// Click a different thumb, then move the pointer well clear so hover does not
// mask which thumb is actually pinned.
await thumbs.nth(5).click();
await p.mouse.move(300, 700);
await p.waitForTimeout(500);
console.log('\nafter click #5  :', JSON.stringify(await inspect(5)));
console.log('now inactive #0 :', JSON.stringify(await inspect(0)));
await shot(5, 'clicked5');

// Whole rail, for a broad look
await p.screenshot({ path: `.claude/chrome-devtools/tmp/gallery-ring-${TAG}-rail.png`, clip: { x: 1090, y: 60, width: 350, height: 560 } });
console.log(`\nscreenshots -> .claude/chrome-devtools/tmp/gallery-ring-${TAG}-*.png`);
await b.close();

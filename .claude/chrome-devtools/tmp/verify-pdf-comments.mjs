/**
 * Verifies the 2026-07 client-comment fixes:
 *  1. overscroll-behavior-y: none on html/body (scrolling refresh on mobile)
 *  2. EditorialSplit / Warranty numerals are brand red, not grey
 *  3. WhyUpvc "profiles we build with" heading sits BESIDE the list on desktop
 *  4. Chat panel has symmetric margins on a phone viewport
 *  5. HeroCarousel does NOT freeze after a tap on touch devices
 */
import { chromium } from 'playwright';

const RED = 'rgb(200, 16, 46)';
const b = await chromium.launch();
let failures = 0;
const check = (label, ok, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
  if (!ok) failures++;
};

// ── Desktop checks ──────────────────────────────────────────────
const d = await b.newPage({ viewport: { width: 1440, height: 900 } });

await d.goto('http://localhost:8080/brand', { waitUntil: 'networkidle', timeout: 90000 });
const overscroll = await d.evaluate(() => ({
  html: getComputedStyle(document.documentElement).overscrollBehaviorY,
  body: getComputedStyle(document.body).overscrollBehaviorY,
}));
check('overscroll-behavior-y none (html/body)',
  overscroll.html === 'none' && overscroll.body === 'none', JSON.stringify(overscroll));

const brandNumeral = await d.evaluate(() => {
  const el = [...document.querySelectorAll('span')].find(s => s.textContent.trim() === '01');
  return el ? getComputedStyle(el).color : 'not found';
});
check('Brand page "01" numeral is red', brandNumeral === RED, brandNumeral);

await d.goto('http://localhost:8080/warranty', { waitUntil: 'networkidle', timeout: 90000 });
const warrantyNumeral = await d.evaluate(() => {
  const el = [...document.querySelectorAll('p')].find(p => p.textContent.trim() === '01');
  return el ? getComputedStyle(el).color : 'not found';
});
check('Warranty page "01" numeral is red', warrantyNumeral === RED, warrantyNumeral);

await d.goto('http://localhost:8080/why-upvc', { waitUntil: 'networkidle', timeout: 90000 });
const profiles = await d.evaluate(() => {
  const h2 = [...document.querySelectorAll('h2')].find(h => h.textContent.includes('profiles we build with'));
  if (!h2) return null;
  const list = h2.parentElement.querySelector('ul');
  if (!list) return null;
  const hr = h2.getBoundingClientRect();
  const lr = list.getBoundingClientRect();
  return { headingRight: hr.right, listLeft: lr.left, listRight: lr.right, vw: window.innerWidth };
});
check('WhyUpvc profiles list sits beside heading',
  profiles && profiles.listLeft > profiles.headingRight, JSON.stringify(profiles));
check('WhyUpvc profiles list reaches right margin',
  profiles && profiles.vw - profiles.listRight < 120,
  profiles ? `gap ${Math.round(profiles.vw - profiles.listRight)}px` : 'n/a');
await d.close();

// ── Phone checks (390×844, touch, no hover) ─────────────────────
const m = await b.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true, isMobile: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  reducedMotion: 'reduce', // forces the HeroCarousel fallback instead of video
});
const p = await m.newPage();
await p.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 90000 });

// Chat panel margins
const bubble = p.locator('button[aria-label*="LinQ" i], button[aria-label*="chat" i]').first();
if (await bubble.count()) {
  await bubble.tap();
  await p.waitForTimeout(500);
  const rect = await p.evaluate(() => {
    const el = document.getElementById('linq-dialog');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(window.innerWidth - r.right) };
  });
  check('Chat panel margins symmetric on phone',
    rect && Math.abs(rect.left - rect.right) <= 1, JSON.stringify(rect));
  await p.keyboard.press('Escape');
} else {
  check('Chat panel margins symmetric on phone', false, 'chat bubble not found');
}

// HeroCarousel: tap must NOT freeze auto-advance
const carousel = p.locator('section[aria-roledescription="carousel"]');
if (await carousel.count()) {
  const activeDot = () => p.evaluate(() => {
    const dots = [...document.querySelectorAll('section[aria-roledescription="carousel"] button[aria-label^="Go to slide"]')];
    return dots.findIndex(dd => dd.getAttribute('aria-current') === 'true');
  });
  const before = await activeDot();
  await carousel.tap({ position: { x: 195, y: 300 } }); // fires mouseenter on iOS-like touch
  await p.waitForTimeout(6800); // > 6000ms auto-advance interval
  const after = await activeDot();
  check('Hero carousel still advances after a tap', after !== before, `slide ${before} → ${after}`);
} else {
  console.log('SKIP  Hero carousel not rendered (video hero active despite reduced motion)');
}

await b.close();
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

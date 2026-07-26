// Verify the desktop nav hover underline: grows from a button's center,
// slides+resizes between buttons, and shrinks back to center on list exit.
// Also confirms hover no longer opens the mega-panel (click-only contract).
import { chromium } from 'playwright';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 90000 });

const line = p.locator('nav[data-main-nav] ul span[aria-hidden="true"]').last();
const lineBox = () => line.evaluate(el => ({
  left: el.offsetLeft, width: el.offsetWidth,
  transition: getComputedStyle(el).transitionProperty,
  bg: getComputedStyle(el).backgroundColor,
}));

const systems = p.locator('nav[data-main-nav] ul button', { hasText: 'Systems' }).first();
const links = p.locator('nav[data-main-nav] ul.relative > li > :is(a,button)');
console.log('nav items found          :', await links.count());

// 1. resting state
console.log('resting line             :', await lineBox());

// 2. hover Systems -> line should expand to ~button width
const sysBox = await systems.boundingBox();
await systems.hover();
await p.waitForTimeout(60);
const mid = await lineBox();
await p.waitForTimeout(300);
const grown = await lineBox();
console.log('mid-tween width          :', mid.width, '(should be between 0 and full)');
console.log('after hover Systems      :', grown, '| button width =', Math.round(sysBox.width));

// 3. hover no longer opens the panel
const panelVisible = await p.evaluate(() => {
  const panels = document.querySelectorAll('nav[data-main-nav] li > div.fixed');
  return [...panels].some(el => getComputedStyle(el).visibility === 'visible');
});
console.log('panel opened by hover?   :', panelVisible, '(expect false)');

// 4. slide to a sibling -> line should move + resize, staying visible throughout
const second = links.nth(2);
const secondBox = await second.boundingBox();
await second.hover();
await p.waitForTimeout(60);
const sliding = await lineBox();
await p.waitForTimeout(300);
const slid = await lineBox();
console.log('mid-slide                :', sliding, '(width should stay > 0)');
console.log('after slide to item 3    :', slid, '| target width =', Math.round(secondBox.width));

// 5. leave the list -> shrink to 0 at current center
await p.mouse.move(720, 500);
await p.waitForTimeout(300);
const gone = await lineBox();
console.log('after leaving nav        :', gone, '(width should be 0)');

// 6. click still opens + closes the panel
await systems.click();
await p.waitForTimeout(350);
const openAfterClick = await p.evaluate(() =>
  [...document.querySelectorAll('nav[data-main-nav] li > div.fixed')]
    .some(el => getComputedStyle(el).visibility === 'visible'));
await systems.click();
await p.waitForTimeout(350);
const closedAfterClick = await p.evaluate(() =>
  [...document.querySelectorAll('nav[data-main-nav] li > div.fixed')]
    .some(el => getComputedStyle(el).visibility === 'visible'));
console.log('click opens panel?       :', openAfterClick, '(expect true)');
console.log('second click closes?     :', !closedAfterClick, '(expect true)');

// 7. open-state solid line vs translucent hover line
const hoverStyle = await line.evaluate(el => ({
  opacity: getComputedStyle(el).opacity,
  duration: getComputedStyle(el).transitionDuration,
}));
console.log('hover line style         :', hoverStyle, '(expect opacity 0.5, 0.15s)');
await systems.click();
await p.waitForTimeout(300);
const openLine = await systems.locator('span[aria-hidden="true"]').evaluate(el => ({
  transform: getComputedStyle(el).transform,
  opacity: getComputedStyle(el).opacity,
  duration: getComputedStyle(el).transitionDuration,
}));
console.log('open trigger solid line  :', openLine, '(expect scale 1 / opacity 1)');
await p.mouse.move(720, 500);
await p.waitForTimeout(300);
const solidPersists = await systems.locator('span[aria-hidden="true"]').evaluate(
  el => getComputedStyle(el).transform);
const hoverGone = await line.evaluate(el => el.offsetWidth);
console.log('mouse left nav: solid    :', solidPersists, '(expect matrix scale 1)');
console.log('mouse left nav: hover    :', hoverGone, '(expect 0 — only solid stays)');

await b.close();

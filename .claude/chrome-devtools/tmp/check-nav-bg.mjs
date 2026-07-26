import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 90000 });
const nav = p.locator('nav[data-main-nav]');
const style = () => nav.evaluate(el => ({
  bg: getComputedStyle(el).backgroundColor,
  blur: getComputedStyle(el).backdropFilter,
}));
console.log('hero (closed)  :', await style());
await p.locator('nav[data-main-nav] ul button', { hasText: 'Systems' }).first().click();
await p.waitForTimeout(350);
console.log('panel open     :', await style(), '(expect rgb(255,255,255), blur none)');
await p.keyboard.press('Escape');
await p.mouse.move(720, 500);
await p.waitForTimeout(400);
await p.evaluate(() => window.scrollTo(0, 400));
await p.waitForTimeout(400);
console.log('scrolled closed:', await style(), '(expect rgba .8 + blur)');
await b.close();

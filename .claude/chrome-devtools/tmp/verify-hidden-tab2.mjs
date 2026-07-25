import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const SCREENSHOTS = '/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });

// Login
await page.goto('http://localhost:8080/admin', { waitUntil: 'networkidle0' });
const emailInput = await page.$('input[type="email"]');
if (emailInput) {
  await emailInput.type('dev@fourlinq.ph');
  const pwInput = await page.$('input[type="password"]');
  if (pwInput) await pwInput.type('advodeveloper2026');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
}
await new Promise(r => setTimeout(r, 1500));

// Navigate to Project Images
const navClicked = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('a, button'));
  const target = all.find(el => el.textContent && el.textContent.trim() === 'Project Images');
  if (target) { target.click(); return true; }
  return false;
});
if (!navClicked) await page.goto('http://localhost:8080/admin?tab=project-images', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3000));

// Open first project
const projectOpened = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('button.group'));
  if (cards.length > 0) { cards[0].click(); return cards[0].textContent; }
  return false;
});
console.log('Opened project:', String(projectOpened).slice(0, 50));
await new Promise(r => setTimeout(r, 3000));

// Click Hidden tab
const hiddenTabText = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const hidden = buttons.find(b => b.textContent && b.textContent.trim().startsWith('Hidden'));
  if (hidden) { hidden.click(); return hidden.textContent && hidden.textContent.trim(); }
  return null;
});
console.log('Hidden tab:', hiddenTabText);
await new Promise(r => setTimeout(r, 1000));

// Get right-panel inner text specifically
const rightPanelText = await page.evaluate(() => {
  // Find the sticky right panel by checking for Project Order in Gallery heading
  const allH3 = Array.from(document.querySelectorAll('h3'));
  for (const h3 of allH3) {
    if (h3.textContent && h3.textContent.includes('Project Order')) {
      // Go up to the parent container div
      let el = h3.parentElement;
      for (let i = 0; i < 5; i++) {
        if (el) el = el.parentElement;
      }
      return el ? el.innerText : null;
    }
  }
  return null;
});
console.log('Right panel text (Hidden tab):\n', rightPanelText ? rightPanelText.slice(0, 500) : '(not found)');

// Screenshot zoomed into the right panel
await page.screenshot({ path: `${SCREENSHOTS}/hidden-tab-zoomed-hidden.png`, clip: { x: 1100, y: 0, width: 500, height: 900 } });
console.log('Zoomed screenshot saved');

// Now click All tab and get the same panel text
await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const allBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'All');
  if (allBtn) allBtn.click();
});
await new Promise(r => setTimeout(r, 800));

const rightPanelAllText = await page.evaluate(() => {
  const allH3 = Array.from(document.querySelectorAll('h3'));
  for (const h3 of allH3) {
    if (h3.textContent && h3.textContent.includes('Project Order')) {
      let el = h3.parentElement;
      for (let i = 0; i < 5; i++) {
        if (el) el = el.parentElement;
      }
      return el ? el.innerText : null;
    }
  }
  return null;
});
console.log('\nRight panel text (All tab), first 600 chars:\n', rightPanelAllText ? rightPanelAllText.slice(0, 600) : '(not found)');

const cRInAll = rightPanelAllText && (rightPanelAllText.includes('Cebu R. Residence') || rightPanelAllText.includes('cebu-r-residences'));
console.log('\n"Cebu R. Residence" in All tab:', cRInAll ? 'VISIBLE (BUG!)' : 'NOT VISIBLE (CORRECT)');

await page.screenshot({ path: `${SCREENSHOTS}/hidden-tab-zoomed-all.png`, clip: { x: 1100, y: 0, width: 500, height: 900 } });
console.log('Zoomed All tab screenshot saved');

await browser.close();
console.log('DONE');

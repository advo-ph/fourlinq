/**
 * verify-hidden-tab.mjs
 * Verify Hidden tab feature in ProjectImagesPanel right panel.
 * Pre-req: project_hidden override for cebu-r-residences already inserted (ID 1465).
 */
import puppeteer from '/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const SCREENSHOTS = '/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });

console.log('Step 1: Login...');
await page.goto('http://localhost:8080/admin', { waitUntil: 'networkidle0' });

// Fill in login form
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

console.log('Step 2: Navigate to Project Images...');
const navClicked = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('a, button'));
  const target = all.find(el => el.textContent && el.textContent.trim() === 'Project Images');
  if (target) { target.click(); return true; }
  return false;
});
if (!navClicked) {
  await page.goto('http://localhost:8080/admin?tab=project-images', { waitUntil: 'networkidle0' });
}
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: `${SCREENSHOTS}/hidden-tab-step1-list.png` });
console.log('Screenshot: step1-list.png');

// Open first visible project card
console.log('Step 3: Open a project detail view...');
const projectOpened = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('button.group'));
  if (cards.length > 0) { cards[0].click(); return true; }
  return false;
});
console.log('Project card clicked:', projectOpened);
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: `${SCREENSHOTS}/hidden-tab-step2-detail.png` });
console.log('Screenshot: step2-detail.png');

// Inspect the right panel for tabs
const tabsInfo = await page.evaluate(() => {
  const panels = Array.from(document.querySelectorAll('div'));
  // Find the panel that has both "Project Order in Gallery" text and tab buttons
  for (const panel of panels) {
    if (panel.textContent && panel.textContent.includes('Project Order in Gallery')) {
      const buttons = Array.from(panel.querySelectorAll('button')).map(b => b.textContent && b.textContent.trim()).filter(Boolean);
      if (buttons.some(b => b === 'All')) {
        return { found: true, buttons: buttons.slice(0, 15) };
      }
    }
  }
  return { found: false, buttons: [] };
});
console.log('Right panel tabs:', JSON.stringify(tabsInfo));

// Click the Hidden tab
console.log('Step 4: Click Hidden tab...');
const hiddenTabText = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const hidden = buttons.find(b => b.textContent && b.textContent.trim().startsWith('Hidden'));
  if (hidden) { hidden.click(); return hidden.textContent && hidden.textContent.trim(); }
  return null;
});
console.log('Hidden tab clicked, text:', hiddenTabText);
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: `${SCREENSHOTS}/hidden-tab-step3-hidden-tab.png` });
console.log('Screenshot: step3-hidden-tab.png');

// Check the right panel scrollable area content
const hiddenPanelContent = await page.evaluate(() => {
  const divs = Array.from(document.querySelectorAll('div'));
  for (const d of divs) {
    if (d.textContent && d.textContent.includes('Project Order in Gallery')) {
      return d.textContent;
    }
  }
  return '';
});
const showsCebuR = hiddenPanelContent.includes('Cebu R') || hiddenPanelContent.includes('cebu-r-residences') || hiddenPanelContent.toLowerCase().includes('cebu r residences');
console.log('Hidden tab shows cebu-r-residences:', showsCebuR, '(first 200 chars):', hiddenPanelContent.slice(0, 200));

// Click All tab and verify cebu-r-residences is NOT shown
console.log('Step 5: Click All tab and verify excluded...');
const allTabClicked = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const allBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'All');
  if (allBtn) { allBtn.click(); return 'All'; }
  return null;
});
console.log('All tab clicked:', allTabClicked);
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: `${SCREENSHOTS}/hidden-tab-step4-all-tab.png` });
console.log('Screenshot: step4-all-tab.png');

const allPanelContent = await page.evaluate(() => {
  const divs = Array.from(document.querySelectorAll('div'));
  for (const d of divs) {
    if (d.textContent && d.textContent.includes('Project Order in Gallery')) {
      return d.textContent;
    }
  }
  return '';
});
// projectDisplayName("cebu-r-residences") = "Cebu R. Residences" from staticProjects
const hiddenProjectInAll = allPanelContent.includes('Cebu R') && !allPanelContent.includes('Hidden');
console.log('Hidden project in All tab content (should be false):', hiddenProjectInAll);

console.log('\n=== VERIFICATION RESULTS ===');
console.log('Hidden tab exists:', hiddenTabText !== null ? 'PASS' : 'FAIL');
console.log('Hidden project visible in Hidden tab:', showsCebuR ? 'PASS' : 'FAIL');

await browser.close();
console.log('DONE');

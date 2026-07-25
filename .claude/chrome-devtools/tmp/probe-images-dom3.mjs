/**
 * probe-images-dom3.mjs — find las-pinas card and inspect project detail DOM
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const BASE  = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(SHOTS, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // Login
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await sleep(2000);
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await sleep(3000);
  }

  // Click Project Images tab
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const tab = btns.find((b) => b.textContent?.trim() === "Project Images");
    if (tab) tab.click();
  });
  await sleep(3000);

  // Scroll down to load more project cards and find las-pinas
  await page.evaluate(() => window.scrollTo(0, 2000));
  await sleep(1000);

  // Find las-pinas card
  const lasPinasInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button.group, button[class*='group']")];
    const card = btns.find(b => b.textContent?.includes("las-pinas") || b.textContent?.includes("Las Pinas"));
    if (!card) {
      // Try a broader search
      const allEls = [...document.querySelectorAll("*")];
      const found = allEls.find(el => el.textContent?.includes("las-pinas-residence") && el.tagName === "P");
      return {
        found: false,
        cardSearchLength: btns.length,
        boardText: found ? "Found via p element" : "Not found anywhere",
      };
    }
    const box = card.getBoundingClientRect();
    return {
      found: true,
      text: card.textContent?.trim().slice(0, 80),
      y: Math.round(box.y),
      x: Math.round(box.x),
    };
  });
  console.log("Las-pinas card search:", JSON.stringify(lasPinasInfo));

  // More scroll
  await page.evaluate(() => window.scrollTo(0, 5000));
  await sleep(1000);

  // Try to find the las-pinas card after scrolling
  const lasPinasInfoAfterScroll = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const card = btns.find(b => {
      const t = b.textContent?.toLowerCase() ?? "";
      return t.includes("las pinas") || t.includes("las-pinas");
    });
    if (card) {
      const box = card.getBoundingClientRect();
      return { found: true, text: card.textContent?.trim().slice(0,60), y: Math.round(box.y), x: Math.round(box.x) };
    }
    return { found: false };
  });
  console.log("After scroll, las-pinas:", JSON.stringify(lasPinasInfoAfterScroll));

  // Click the card using JavaScript
  const cardClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const card = btns.find(b => {
      const t = b.textContent?.toLowerCase() ?? "";
      return t.includes("las pinas") || t.includes("las-pinas");
    });
    if (card) {
      card.scrollIntoView();
      card.click();
      return { clicked: true, text: card.textContent?.trim().slice(0,60) };
    }
    // All project grid cards
    const allCards = btns.filter(b => b.className?.includes("group") && b.textContent?.length > 10);
    return { clicked: false, cardsFound: allCards.length, firstCard: allCards[0]?.textContent?.trim().slice(0,40) };
  });
  console.log("Card click attempt:", JSON.stringify(cardClicked));

  await sleep(4000);
  await page.screenshot({ path: `${SHOTS}/probe3-01-project-detail.png` });

  // Now dump what we have
  const pageText = await page.evaluate(() => document.body.innerText.slice(0, 800));
  console.log("\nPage body text after card click:", pageText);

  // Count grip handles
  const grips = await page.$$eval("button[aria-label='Drag to reorder']", gs => gs.length);
  console.log("\nDrag grip handles:", grips);

  // Look for the image reorder section
  const imageReorderSection = await page.evaluate(() => {
    const all = [...document.querySelectorAll("*")];
    const reorderEl = all.find(el =>
      el.nodeType === 1 &&
      el.textContent?.toLowerCase().includes("drag to reorder images within")
    );
    if (!reorderEl) return { found: false };
    const gripsInSection = [...reorderEl.querySelectorAll("button[aria-label='Drag to reorder']")];
    return {
      found: true,
      gripCount: gripsInSection.length,
      tagName: reorderEl.tagName,
      firstGripY: gripsInSection[0]?.getBoundingClientRect()?.y ?? null,
    };
  });
  console.log("\nImage reorder section:", JSON.stringify(imageReorderSection));

  // Check all buttons in the detail view
  const detailButtons = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].slice(0, 40);
    return btns.map((b,i) => ({ i, text: b.textContent?.trim().slice(0,40), cls: b.className?.slice(0,40) }));
  });
  console.log("\nAll buttons (detail view):");
  detailButtons.forEach(b => console.log(`  [${b.i}] "${b.text}"`));

  await browser.close();
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});

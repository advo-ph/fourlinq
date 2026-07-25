/**
 * probe-images-dom.mjs — diagnose DOM structure of ProjectImagesPanel
 * Quick probe: login, open images tab, open las-pinas, dump structure.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const BASE  = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

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

  // Open Images tab
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll("button")];
    const tab = tabs.find((t) => t.textContent?.toLowerCase().includes("image"));
    if (tab) tab.click();
  });
  await sleep(3000);

  // Find and click las-pinas
  await page.evaluate(() => {
    const allBtns = [...document.querySelectorAll("button")];
    const card = allBtns.find((b) => b.textContent?.toLowerCase().includes("las pinas"));
    if (card) card.click();
  });
  await sleep(4000);

  // Take screenshot
  await page.screenshot({ path: `${SHOTS}/probe-dom-01-project-open.png` });

  // Dump structure around grips
  const domInfo = await page.evaluate(() => {
    const grips = [...document.querySelectorAll("button[aria-label='Drag to reorder']")];
    const info = grips.map((g, i) => {
      const box = g.getBoundingClientRect();
      const parentDiv = g.closest("div.flex.items-stretch");
      const codeEl = parentDiv?.querySelector("code");
      const imgEl = parentDiv?.querySelector("img");
      // Check if this grip is inside the image-reorder section (left column)
      // vs the project-order section (right column / xl:flex)
      const rightPanel = g.closest(".xl\\:flex");
      const inProjectOrderPanel = !!rightPanel;

      // Try to find sibling section heading
      let sectionHint = "";
      let ancestor = g.parentElement;
      for (let d = 0; d < 10; d++) {
        if (!ancestor) break;
        const heading = ancestor.querySelector("p, h3");
        if (heading && heading.textContent?.toLowerCase().includes("drag")) {
          sectionHint = heading.textContent?.trim().slice(0, 60) ?? "";
          break;
        }
        ancestor = ancestor.parentElement;
      }

      return {
        index: i,
        y: Math.round(box.y),
        x: Math.round(box.x),
        code: codeEl?.textContent?.trim() ?? "",
        imgSrc: imgEl?.src?.split("/").pop()?.split("?")[0]?.slice(0,30) ?? "",
        inProjectOrderPanel,
        sectionHint: sectionHint.slice(0, 80),
      };
    });
    return info;
  });

  console.log("Grip handles found:", domInfo.length);
  console.log("\nFirst 15 grips:");
  domInfo.slice(0, 15).forEach((g) => {
    console.log(`  [${g.index}] x=${g.x} y=${g.y} projectOrder=${g.inProjectOrderPanel} code="${g.code}" img="${g.imgSrc}"`);
  });

  // Count image-section vs project-section grips
  const imageGrips = domInfo.filter(g => !g.inProjectOrderPanel);
  const projectGrips = domInfo.filter(g => g.inProjectOrderPanel);
  console.log(`\nImage section grips: ${imageGrips.length}`);
  console.log(`Project order panel grips: ${projectGrips.length}`);
  if (imageGrips.length > 0) {
    console.log("\nImage section grips (first 5):");
    imageGrips.slice(0, 5).forEach(g => {
      console.log(`  [${g.index}] y=${g.y} code="${g.code}" img="${g.imgSrc}"`);
    });
  }

  // Also check how the DnD section is structured
  const dndSectionInfo = await page.evaluate(() => {
    // Look for the "Drag to reorder images within this project" paragraph
    const paras = [...document.querySelectorAll("p")];
    const reorderPara = paras.find(p => p.textContent?.toLowerCase().includes("drag to reorder images within"));
    if (!reorderPara) return { found: false };

    const section = reorderPara.closest("div");
    const gripsInSection = section ? [...section.querySelectorAll("button[aria-label='Drag to reorder']")] : [];
    const codeEls = section ? [...section.querySelectorAll("code")] : [];

    return {
      found: true,
      gripCount: gripsInSection.length,
      sectionBoundingBox: section?.getBoundingClientRect() ?? null,
      firstGripY: gripsInSection[0]?.getBoundingClientRect()?.y ?? null,
      codes: codeEls.slice(0, 5).map(c => c.textContent?.trim()),
    };
  });
  console.log("\nDnD image section:", JSON.stringify(dndSectionInfo, null, 2));

  // Check toast mechanism
  const toastInfo = await page.evaluate(() => {
    // Look for any toast-related elements
    const fixed = [...document.querySelectorAll("[style*='fixed'], [class*='toast'], [class*='Toast'], [role='alert'], [role='status']")];
    return fixed.map(el => ({
      tag: el.tagName,
      classes: el.className?.slice(0, 80),
      text: el.textContent?.trim().slice(0, 60),
    })).filter(el => el.text);
  });
  console.log("\nToast-related elements:", JSON.stringify(toastInfo));

  // Navigate to URL that directly opens the project
  const currentUrl = page.url();
  console.log("\nCurrent URL:", currentUrl);

  await page.screenshot({ path: `${SHOTS}/probe-dom-02-full.png` });

  await browser.close();
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});

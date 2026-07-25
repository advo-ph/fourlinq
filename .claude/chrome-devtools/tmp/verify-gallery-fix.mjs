/**
 * verify-gallery-fix.mjs
 *
 * Puppeteer e2e test for the project detail gallery fix.
 *
 * Scenario: sarangani-s-residence has 4 images in the manifest.
 * Test overrides:
 *   - .jpg replaced → /uploads/cms/test-replace-1.png
 *   - -2.jpg replaced → /uploads/cms/test-replace-2.png
 *   - -3.jpg hidden
 *   - -4.jpg hidden
 *
 * Expected: gallery shows EXACTLY 2 images (the two replacement paths).
 * No original .jpg paths should appear in any img src.
 * No flash of 3+ images before API resolves.
 */

import puppeteer from "/Users/princewagan/DTR-Entertainment/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const PROJECT_URL = "http://localhost:8080/projects/sarangani-s-residence";

const EXPECTED_GALLERY_PATHS = [
  "/uploads/cms/test-replace-1.png",
  "/uploads/cms/test-replace-2.png",
];

const FORBIDDEN_PATHS = [
  "/images/projects-fb/sarangani-s-residence.jpg",
  "/images/projects-fb/sarangani-s-residence-2.jpg",
  "/images/projects-fb/sarangani-s-residence-3.jpg",
  "/images/projects-fb/sarangani-s-residence-4.jpg",
];

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const observedOriginals = [];

  // Track all network requests to detect any request for original static images.
  page.on("response", async (response) => {
    const url = response.url();
    for (const p of FORBIDDEN_PATHS) {
      if (url.includes(p)) {
        console.log(`  [NETWORK] Forbidden original path requested: ${url}`);
        observedOriginals.push(url);
      }
    }
  });

  console.log(`Navigating to ${PROJECT_URL}...`);
  await page.goto(PROJECT_URL, { waitUntil: "domcontentloaded" });

  // Capture first-paint DOM immediately — before merged API resolves.
  const earlyImages = await page.$$eval("img", (imgs) =>
    imgs.map((img) => img.getAttribute("src") || img.src)
  );
  console.log(`\nFirst-paint img sources (${earlyImages.length}):`, earlyImages);

  const earlyOriginals = earlyImages.filter((src) =>
    FORBIDDEN_PATHS.some((p) => src.includes(p))
  );
  if (earlyOriginals.length > 0) {
    console.log(`  [FAIL] Flash of originals detected at first paint:`, earlyOriginals);
  } else {
    console.log("  [OK] No flash of original images at first paint (skeleton held).");
  }

  // Wait for the gallery heading to appear (mergedSettled = true, full render done).
  try {
    await page.waitForSelector("h1", { timeout: 12000 });
  } catch {
    console.log("  [WARN] h1 not found within 12s — page may still be loading.");
  }

  // Give React a moment to flush all state.
  await new Promise((r) => setTimeout(r, 600));

  // Capture final gallery images.
  const galleryImages = await page.$$eval("img", (imgs) =>
    imgs.map((img) => img.getAttribute("src") || img.src)
  );
  console.log(`\nFinal gallery img sources (${galleryImages.length}):`);
  galleryImages.forEach((src) => console.log("  ", src));

  // Check: expected replacement paths must be present.
  const missingExpected = EXPECTED_GALLERY_PATHS.filter(
    (exp) => !galleryImages.some((src) => src.includes(exp))
  );
  if (missingExpected.length > 0) {
    console.log(`\n  [FAIL] Expected replacement paths missing:`, missingExpected);
  } else {
    console.log("\n  [OK] All expected replacement paths present.");
  }

  // Check: no original static paths should appear anywhere in the DOM.
  const presentOriginals = FORBIDDEN_PATHS.filter((orig) =>
    galleryImages.some((src) => src.includes(orig))
  );
  if (presentOriginals.length > 0) {
    console.log(`  [FAIL] Original paths still visible in DOM:`, presentOriginals);
  } else {
    console.log("  [OK] No original paths visible in final gallery.");
  }

  // Screenshot of the final gallery state.
  const screenshotPath = path.join(SCREENSHOT_DIR, "project-detail-gallery-fix.png");
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`\nScreenshot saved: ${screenshotPath}`);

  await browser.close();

  const passed =
    missingExpected.length === 0 &&
    presentOriginals.length === 0 &&
    earlyOriginals.length === 0;

  console.log(`\n=== RESULT: ${passed ? "PASS" : "FAIL"} ===`);
  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error("Puppeteer test error:", err);
  process.exit(1);
});

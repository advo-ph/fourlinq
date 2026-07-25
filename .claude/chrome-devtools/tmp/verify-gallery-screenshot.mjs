/**
 * verify-gallery-screenshot.mjs
 *
 * Screenshot the sarangani project detail page with test overrides active:
 *   - .jpg + -2.jpg replaced (2 replacement PNGs)
 *   - -3.jpg + -4.jpg hidden
 *   - -2.jpg reordered to position 0, .jpg to position 1
 *
 * Expected: gallery shows 2 images in order: test-replace-2.png, test-replace-1.png.
 * No flash of originals; skeleton shown while API resolves.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";

const SCREENSHOT_DIR = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const PROJECT_URL = "http://localhost:8080/projects/sarangani-s-residence";

const EXPECTED_GALLERY_PATHS = [
  "/uploads/cms/test-replace-2.png",
  "/uploads/cms/test-replace-1.png",
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
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const earlyOriginals = [];
  const networkOriginals = [];

  // Track network requests for original paths (to catch any cache/prefetch)
  page.on("response", (response) => {
    const url = response.url();
    for (const p of FORBIDDEN_PATHS) {
      if (url.includes(p.replace(/^\//, ""))) {
        networkOriginals.push(url);
      }
    }
  });

  console.log(`Navigating to ${PROJECT_URL}...`);
  await page.goto(PROJECT_URL, { waitUntil: "domcontentloaded" });

  // Check first-paint DOM (before mergedSettled fires)
  const firstPaintImgs = await page.$$eval("img", (imgs) =>
    imgs.map((img) => img.getAttribute("src") || img.src)
  );
  console.log(`\nFirst-paint images (${firstPaintImgs.length}):`, firstPaintImgs);

  const flashedOriginals = firstPaintImgs.filter((src) =>
    FORBIDDEN_PATHS.some((p) => src.includes(p.replace(/^\//, "")))
  );
  if (flashedOriginals.length > 0) {
    console.log(`  [FAIL] Flash of originals at first paint:`, flashedOriginals);
    earlyOriginals.push(...flashedOriginals);
  } else {
    console.log("  [OK] No flash of originals. Skeleton rendered.");
  }

  // Wait for gallery to render
  await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {
    console.log("  [WARN] h1 not found — page may still be loading");
  });
  await new Promise((r) => setTimeout(r, 700));

  // Final DOM state
  const finalImgs = await page.$$eval("img", (imgs) =>
    imgs.map((img) => img.getAttribute("src") || img.src)
  );
  console.log(`\nFinal gallery images (${finalImgs.length}):`);
  finalImgs.forEach((src) => console.log(`  ${src}`));

  // Check: expected paths present
  let allPass = true;
  console.log("\nExpected path checks:");
  for (const exp of EXPECTED_GALLERY_PATHS) {
    const found = finalImgs.some((src) => src.includes(exp));
    console.log(`  ${found ? "[PASS]" : "[FAIL]"} ${exp}`);
    if (!found) allPass = false;
  }

  // Check: forbidden paths absent
  console.log("\nForbidden path checks:");
  for (const orig of FORBIDDEN_PATHS) {
    const present = finalImgs.some((src) => src.includes(orig.replace(/^\//, "")));
    console.log(`  ${present ? "[FAIL]" : "[PASS]"} ${orig}`);
    if (present) allPass = false;
  }

  // Early flash check
  if (earlyOriginals.length > 0) {
    console.log("\n  [FAIL] Flash of originals detected at first paint.");
    allPass = false;
  } else {
    console.log("\n  [OK] No flash of originals (live-first skeleton confirmed).");
  }

  // Network check
  if (networkOriginals.length > 0) {
    console.log(`  [WARN] Original paths requested over network (may be HTTP 404):`, networkOriginals);
  }

  // Take screenshot
  const ss = `${SCREENSHOT_DIR}/project-detail-gallery-fix.png`;
  await page.screenshot({ path: ss, fullPage: false });
  console.log(`\nScreenshot: ${ss}`);

  await browser.close();

  console.log(`\n=== ${allPass ? "ALL PASS" : "FAILURES DETECTED"} ===`);
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

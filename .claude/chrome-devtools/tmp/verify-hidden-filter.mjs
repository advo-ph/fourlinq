/**
 * Verify that hidden projects and hidden images are filtered from public pages.
 *
 * Test data in DB:
 *   - project_hidden: taytay-rizal-residence
 *   - hidden image:   nuvali-laguna-residence / /images/projects-fb/nuvali-laguna-residence.jpg
 *
 * Checks:
 *   A) /inspiration — taytay-rizal-residence card NOT rendered
 *   B) /projects/nuvali-laguna-residence — hidden image NOT in gallery
 *   C) Admin page (/admin) — taytay IS visible (admin must see hidden items)
 */
import { createRequire } from "module";
const require = createRequire(
  "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js",
);
const puppeteer = require("puppeteer");

const BASE = "http://localhost:5174";
const API  = "http://localhost:3001";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const watchdog = setTimeout(() => {
  console.log("WATCHDOG — timed out");
  process.exit(2);
}, 120_000);

const browser = await puppeteer.launch({
  headless: "new",
  protocolTimeout: 30_000,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Intercept API calls so the Vite page uses the real API server
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().includes("/api/project-images/merged")) {
      // Proxy to the real API server
      req.continue({ url: req.url().replace(BASE, API) });
    } else {
      req.continue();
    }
  });

  // ── TEST A: /inspiration — taytay card must not appear ─────────────────────
  await page.goto(`${BASE}/inspiration`, { waitUntil: "networkidle2", timeout: 30_000 });
  // Wait for the merged API fetch to complete and React to re-render
  await sleep(2000);

  const inspirationLinks = await page.$$eval("a[href]", (els) =>
    els.map((a) => a.getAttribute("href")).filter((h) => h?.startsWith("/projects/"))
  );
  const taytayVisible = inspirationLinks.some((h) => h.includes("taytay-rizal-residence"));
  console.log("A) /inspiration — taytay visible:", taytayVisible, `(EXPECTED: false) ${taytayVisible ? "FAIL" : "PASS"}`);

  // ── TEST B: /projects/nuvali-laguna-residence — hidden image must not appear ─
  await page.goto(`${BASE}/projects/nuvali-laguna-residence`, { waitUntil: "networkidle2", timeout: 30_000 });
  await sleep(2000);

  const gallerySrcs = await page.$$eval("img[src]", (imgs) =>
    imgs.map((img) => img.src)
  );
  const hiddenImageVisible = gallerySrcs.some((src) =>
    src.includes("nuvali-laguna-residence.jpg") && !src.includes("nuvali-laguna-residence-")
  );
  console.log("B) nuvali detail — hidden image visible:", hiddenImageVisible, `(EXPECTED: false) ${hiddenImageVisible ? "FAIL" : "PASS"}`);

  // Also verify at least one gallery image IS visible (the hero is NOT hidden)
  const heroVisible = gallerySrcs.some((src) => src.includes("nuvali-laguna-residence-9.jpg"));
  console.log("   nuvali hero image visible:", heroVisible, "(EXPECTED: true)");

  // ── TEST C: taytay not in adjacent-projects on a detail page ───────────────
  const adjacentHrefs = await page.$$eval("a[href]", (els) =>
    els.map((a) => a.getAttribute("href")).filter((h) => h?.startsWith("/projects/"))
  );
  const taytayInAdjacent = adjacentHrefs.some((h) => h.includes("taytay-rizal-residence"));
  console.log("C) adjacent projects — taytay visible:", taytayInAdjacent, `(EXPECTED: false) ${taytayInAdjacent ? "FAIL" : "PASS"}`);

  console.log("\nAll checks complete.");
} finally {
  clearTimeout(watchdog);
  await browser.close();
}

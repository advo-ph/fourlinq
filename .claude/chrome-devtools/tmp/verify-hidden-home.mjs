/**
 * Verify home page InspirationStrip filters hidden projects.
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
  console.log("WATCHDOG");
  process.exit(2);
}, 60_000);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().includes("/api/")) {
      req.continue({ url: req.url().replace(BASE, API) });
    } else {
      req.continue();
    }
  });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 30_000 });
  await sleep(3000); // wait for merged API fetch + React re-render

  const homeProjectLinks = await page.$$eval("a[href]", (els) =>
    els.map((a) => a.getAttribute("href")).filter((h) => h?.startsWith("/projects/"))
  );
  const taytayInHome = homeProjectLinks.some((h) => h.includes("taytay-rizal-residence"));
  console.log("Home page InspirationStrip — taytay visible:", taytayInHome, `(EXPECTED: false) ${taytayInHome ? "FAIL" : "PASS"}`);
} finally {
  clearTimeout(watchdog);
  await browser.close();
}

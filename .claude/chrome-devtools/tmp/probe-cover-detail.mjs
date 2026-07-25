/**
 * probe-cover-detail.mjs
 *
 * Precise probe: scroll to each target project card on /inspiration and home,
 * capture both screenshot and full img src/srcset data. Also check whether
 * projects.ts p.image matches what's rendered (to isolate whether it's a static
 * baseline or a live API issue).
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const PROD = "https://fourlinq.ph";
const TARGET_PROJECTS = ["nuvali-laguna-residence-b", "fourlinq-turnover-2"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  // ── /inspiration full DOM analysis ──────────────────────────────────────────
  console.log("=== /inspiration page full analysis ===");
  const page = await browser.newPage();
  const networkRequests = [];

  page.on("response", async (resp) => {
    const url = resp.url();
    if (url.includes("/api/project-images/merged")) {
      networkRequests.push({ url, status: resp.status(), timing: Date.now() });
      try {
        const body = await resp.json();
        console.log(`  API /merged response status: ${resp.status()}`);
        console.log(`  projectCoverImages keys: ${Object.keys(body.projectCoverImages ?? {}).length}`);
        for (const pid of TARGET_PROJECTS) {
          const cover = body.projectCoverImages?.[pid];
          console.log(`    ${pid} cover in API response: ${cover ?? "ABSENT"}`);
        }
      } catch (e) {
        // body already consumed by browser
      }
    }
  });

  await page.goto(`${PROD}/inspiration`, { waitUntil: "networkidle0", timeout: 45000 });
  await sleep(5000); // extra time for React re-renders after API callback

  // Full state extraction: what is actually in the DOM
  const analysis = await page.evaluate((targetProjects) => {
    const results = {};

    for (const pid of targetProjects) {
      // Find all project card links
      const links = [...document.querySelectorAll(`a[href*="${pid}"]`)];
      if (links.length === 0) {
        results[pid] = { found: false };
        continue;
      }

      // Get card data for each matching link
      const cards = links.map((link) => {
        const imgs = [...link.querySelectorAll("img")];
        const rect = link.getBoundingClientRect();
        return {
          href: link.href,
          boundingRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          imgs: imgs.map((img) => {
            const r = img.getBoundingClientRect();
            return {
              src: img.src,
              currentSrc: img.currentSrc,
              attrSrc: img.getAttribute("src"),
              srcset: img.srcset,
              alt: img.alt,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              complete: img.complete,
              rect: { top: r.top, left: r.left, width: r.width, height: r.height },
            };
          }),
        };
      });

      results[pid] = { found: true, cards };
    }

    return results;
  }, TARGET_PROJECTS);

  console.log("\n  DOM analysis results:");
  for (const [pid, data] of Object.entries(analysis)) {
    console.log(`\n  Project: ${pid}`);
    if (!data.found) {
      console.log("    NOT FOUND in DOM");
      continue;
    }
    for (const card of data.cards) {
      console.log(`    Link: ${card.href}`);
      for (const img of card.imgs) {
        console.log(`    img.src: ${img.src}`);
        console.log(`    img.currentSrc: ${img.currentSrc}`);
        console.log(`    img.attrSrc: ${img.attrSrc}`);
        console.log(`    naturalWidth: ${img.naturalWidth} naturalHeight: ${img.naturalHeight} complete: ${img.complete}`);
      }
    }
  }

  // Screenshot each target card by scrolling to it
  for (const pid of TARGET_PROJECTS) {
    const data = analysis[pid];
    if (!data.found || !data.cards?.length) continue;

    const card = data.cards[0];
    if (!card.imgs?.length) continue;

    // Scroll to the card
    await page.evaluate((pid) => {
      const link = document.querySelector(`a[href*="${pid}"]`);
      if (link) link.scrollIntoView({ block: "center" });
    }, pid);
    await sleep(1500);

    const imgRect = card.imgs[0].rect;
    if (imgRect && imgRect.width > 0) {
      await page.screenshot({
        path: `${SHOTS}/cover-bug-inspiration-${pid}.png`,
        clip: {
          x: Math.max(0, imgRect.left - 10),
          y: Math.max(0, imgRect.top - 10),
          width: Math.min(imgRect.width + 20, 1440),
          height: Math.min(imgRect.height + 50, 900),
        },
      });
      console.log(`  Screenshot saved: cover-bug-inspiration-${pid}.png`);
    } else {
      // Scroll position may differ from viewport — use full viewport screenshot
      await page.screenshot({ path: `${SHOTS}/cover-bug-inspiration-${pid}.png` });
      console.log(`  Screenshot (full viewport) saved: cover-bug-inspiration-${pid}.png`);
    }
  }

  // Also check: does /inspiration call /api/project-images/merged at all?
  console.log(`\n  API calls detected: ${networkRequests.length}`);

  await page.close();

  // ── Home page InspirationStrip analysis ──────────────────────────────────────
  console.log("\n=== Home page InspirationStrip analysis ===");
  const homePage = await browser.newPage();
  const homeNetworkRequests = [];

  homePage.on("response", (resp) => {
    const url = resp.url();
    if (url.includes("/api/")) {
      homeNetworkRequests.push({ url, status: resp.status() });
    }
  });

  await homePage.goto(`${PROD}/`, { waitUntil: "networkidle0", timeout: 45000 });
  await sleep(5000);

  const homeAnalysis = await homePage.evaluate((targetProjects) => {
    const results = {};
    for (const pid of targetProjects) {
      const links = [...document.querySelectorAll(`a[href*="${pid}"]`)];
      if (links.length === 0) {
        results[pid] = { found: false };
        continue;
      }
      const cards = links.map((link) => {
        const imgs = [...link.querySelectorAll("img")];
        const rect = link.getBoundingClientRect();
        return {
          href: link.href,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          imgs: imgs.map((img) => {
            const r = img.getBoundingClientRect();
            return {
              src: img.src,
              currentSrc: img.currentSrc,
              attrSrc: img.getAttribute("src"),
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              complete: img.complete,
              rect: { top: r.top, width: r.width, height: r.height },
            };
          }),
        };
      });
      results[pid] = { found: true, cards };
    }
    return results;
  }, TARGET_PROJECTS);

  console.log("\n  Home DOM analysis:");
  for (const [pid, data] of Object.entries(homeAnalysis)) {
    console.log(`\n  Project: ${pid}`);
    if (!data.found) {
      console.log("    NOT FOUND in DOM");
      continue;
    }
    for (const card of data.cards) {
      console.log(`    href: ${card.href}`);
      for (const img of card.imgs) {
        console.log(`    img.src: ${img.src}`);
        console.log(`    img.currentSrc: ${img.currentSrc}`);
        console.log(`    naturalWidth: ${img.naturalWidth} complete: ${img.complete}`);
      }
    }
  }
  console.log(`  Home API calls: ${homeNetworkRequests.map((r) => `${r.url} → ${r.status}`).join(", ")}`);

  // Screenshot the InspirationStrip
  for (const pid of TARGET_PROJECTS) {
    const data = homeAnalysis[pid];
    if (!data.found || !data.cards?.length) continue;

    await homePage.evaluate((pid) => {
      const link = document.querySelector(`a[href*="${pid}"]`);
      if (link) link.scrollIntoView({ block: "center" });
    }, pid);
    await sleep(2000);

    await homePage.screenshot({
      path: `${SHOTS}/cover-bug-home-${pid}.png`,
    });
    console.log(`  Screenshot saved: cover-bug-home-${pid}.png`);
  }

  await browser.close();
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

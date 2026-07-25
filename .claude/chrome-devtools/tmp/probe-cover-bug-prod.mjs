/**
 * probe-cover-bug-prod.mjs
 *
 * Investigate why nuvali-laguna-residence-b and fourlinq-turnover-2 cards show
 * the wrong image on the live prod site.
 *
 * Run:
 *   NODE_PATH=/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules \
 *   node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/probe-cover-bug-prod.mjs
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

  const results = {};

  // ── 1. Probe API directly ─────────────────────────────────────────────────────
  console.log("=== 1. API probe: /api/project-images/merged ===");
  let mergedData = null;
  try {
    const resp = await fetch(`${PROD}/api/project-images/merged`);
    mergedData = await resp.json();
    const covers = mergedData.projectCoverImages ?? {};
    const hidden = mergedData.hiddenImages ?? {};
    for (const pid of TARGET_PROJECTS) {
      console.log(`  ${pid}: cover=${covers[pid] ?? "NONE"}, hidden=[${(hidden[pid] ?? []).join(", ")}]`);
    }
    results.apiCoverImages = covers;
    results.apiHiddenImages = hidden;
    results.apiHiddenProjects = mergedData.hiddenProjects ?? [];
    results.apiDeletedProjects = mergedData.deletedProjects ?? [];
    results.apiProjectRatios = mergedData.projectRatios ?? {};
    results.apiOverrideCount = mergedData.overrideCount;
  } catch (e) {
    console.error("  API fetch failed:", e.message);
    results.apiError = e.message;
  }

  // ── 2. Admin login (read-only, GETs only) ─────────────────────────────────────
  console.log("\n=== 2. Admin login (read-only) ===");
  const adminPage = await browser.newPage();
  const adminConsoleErrors = [];
  adminPage.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      adminConsoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  try {
    await adminPage.goto(`${PROD}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2000);

    const loginForm = await adminPage.$('input[type="email"]');
    if (loginForm) {
      await loginForm.click({ clickCount: 3 });
      await loginForm.type("dev@fourlinq.ph");
      const passInput = await adminPage.$('input[type="password"]');
      await passInput.click({ clickCount: 3 });
      await passInput.type("advodeveloper2026");
      const submitBtn = await adminPage.$('button[type="submit"]');
      await submitBtn.click();
      await sleep(4000);
      console.log("  Logged in");
    } else {
      console.log("  Already logged in / no form");
    }

    // Fetch overrides directly (admin endpoint — read-only GET)
    const overridesCookie = await adminPage.cookies()
      .then((cs) => cs.map((c) => `${c.name}=${c.value}`).join("; "));

    const adminResp = await adminPage.evaluate(async () => {
      const r = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
      if (!r.ok) return { error: `HTTP ${r.status}` };
      return r.json();
    });

    if (adminResp.error) {
      console.log("  Admin overrides fetch failed:", adminResp.error);
      results.adminOverridesError = adminResp.error;
    } else {
      const rows = adminResp.overrides ?? [];
      console.log(`  Total override rows: ${rows.length}`);

      // Find portfolio-interior-03 overrides
      const portfolioRows = rows.filter((r) => r.project_id === "portfolio-interior-03");
      console.log(`  portfolio-interior-03 overrides: ${portfolioRows.length}`);
      for (const row of portfolioRows) {
        console.log(`    ${JSON.stringify(row)}`);
      }
      results.portfolioInterior03Overrides = portfolioRows;

      // All project_ratio rows
      const ratioRows = rows.filter((r) => r.override_type === "project_ratio");
      console.log(`\n  project_ratio rows (${ratioRows.length} total):`);
      for (const row of ratioRows) {
        console.log(`    ${row.project_id} → ${row.value_text}`);
      }
      results.ratioRows = ratioRows;

      // image_order rows for our target projects
      const imageOrderRows = rows.filter((r) =>
        TARGET_PROJECTS.includes(r.project_id) && r.override_type === "image_order"
      );
      console.log(`\n  image_order rows for target projects: ${imageOrderRows.length}`);
      for (const row of imageOrderRows) {
        console.log(`    ${row.project_id}|${row.image_path} → pos=${row.value_int}`);
      }
      results.imageOrderRows = imageOrderRows;

      // hidden rows for our target projects
      const hiddenRows = rows.filter((r) =>
        TARGET_PROJECTS.includes(r.project_id) && r.override_type === "hidden"
      );
      console.log(`\n  hidden rows for target projects: ${hiddenRows.length}`);
      for (const row of hiddenRows) {
        console.log(`    ${row.project_id}|${row.image_path}`);
      }
      results.hiddenRows = hiddenRows;

      // All rows for target projects
      const targetRows = rows.filter((r) => TARGET_PROJECTS.includes(r.project_id));
      results.allTargetRows = targetRows;
      console.log(`\n  All rows for target projects: ${targetRows.length}`);
      for (const row of targetRows) {
        console.log(`    type=${row.override_type} project=${row.project_id} path=${row.image_path} val_text=${row.value_text} val_int=${row.value_int}`);
      }
    }
  } catch (e) {
    console.error("  Admin section error:", e.message);
    results.adminError = e.message;
  }

  // ── 3. Home page — InspirationStrip ──────────────────────────────────────────
  console.log("\n=== 3. Home page — InspirationStrip ===");
  const homePage = await browser.newPage();
  const homeConsoleErrors = [];
  const homeApiRequests = [];

  homePage.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      homeConsoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  homePage.on("response", (resp) => {
    if (resp.url().includes("/api/")) {
      homeApiRequests.push({ url: resp.url(), status: resp.status() });
    }
  });

  try {
    await homePage.goto(`${PROD}/`, { waitUntil: "networkidle2", timeout: 45000 });
    await sleep(5000); // wait for React hydration + API fetch

    // Extract img srcs for target projects from InspirationStrip
    const homeResults = await homePage.evaluate((targetProjects) => {
      const out = {};
      for (const pid of targetProjects) {
        const links = [...document.querySelectorAll(`a[href*="${pid}"]`)];
        if (links.length === 0) {
          out[pid] = { found: false, cards: [] };
          continue;
        }
        const cards = links.map((link) => {
          const imgs = [...link.querySelectorAll("img")];
          return {
            href: link.href,
            imgs: imgs.map((img) => ({
              src: img.src || img.currentSrc || img.getAttribute("src") || "",
              srcset: img.srcset || "",
              alt: img.alt || "",
              naturalWidth: img.naturalWidth,
            })),
          };
        });
        out[pid] = { found: true, cards };
      }
      return out;
    }, TARGET_PROJECTS);

    results.homeResults = homeResults;
    for (const [pid, data] of Object.entries(homeResults)) {
      console.log(`  ${pid}: found=${data.found}, cards=${data.cards?.length ?? 0}`);
      for (const card of data.cards ?? []) {
        for (const img of card.imgs ?? []) {
          console.log(`    src=${img.src.slice(-80)} naturalWidth=${img.naturalWidth}`);
        }
      }
    }
    results.homeConsoleErrors = homeConsoleErrors;
    results.homeApiRequests = homeApiRequests;
    console.log(`  API requests on home: ${homeApiRequests.map((r) => `${r.url} → ${r.status}`).join(", ")}`);
    console.log(`  Console errors on home: ${homeConsoleErrors.length}`);
    if (homeConsoleErrors.length > 0) {
      homeConsoleErrors.slice(0, 5).forEach((e) => console.log(`    ${e}`));
    }

    // Screenshot InspirationStrip area (scroll to it first)
    await homePage.evaluate(() => {
      const stripEl = document.querySelector("section");
      stripEl?.scrollIntoView();
    });
    await sleep(1000);
    await homePage.screenshot({
      path: `${SHOTS}/cover-bug-home-inspirationstrip.png`,
      fullPage: false,
    });
    console.log("  Screenshot saved: cover-bug-home-inspirationstrip.png");
  } catch (e) {
    console.error("  Home page error:", e.message);
    results.homeError = e.message;
  }

  // ── 4. /inspiration page ──────────────────────────────────────────────────────
  console.log("\n=== 4. /inspiration page ===");
  const inspirationPage = await browser.newPage();
  const inspirationConsoleErrors = [];
  const inspirationApiRequests = [];

  inspirationPage.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      inspirationConsoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  inspirationPage.on("response", (resp) => {
    if (resp.url().includes("/api/")) {
      inspirationApiRequests.push({ url: resp.url(), status: resp.status() });
    }
  });

  try {
    await inspirationPage.goto(`${PROD}/inspiration`, { waitUntil: "networkidle2", timeout: 45000 });
    await sleep(5000);

    const inspirationResults = await inspirationPage.evaluate((targetProjects) => {
      const out = {};
      for (const pid of targetProjects) {
        const links = [...document.querySelectorAll(`a[href*="${pid}"]`)];
        if (links.length === 0) {
          out[pid] = { found: false, cards: [] };
          continue;
        }
        const cards = links.map((link) => {
          const imgs = [...link.querySelectorAll("img")];
          return {
            href: link.href,
            imgs: imgs.map((img) => ({
              src: img.src || img.currentSrc || img.getAttribute("src") || "",
              srcset: img.srcset || "",
              alt: img.alt || "",
              naturalWidth: img.naturalWidth,
            })),
          };
        });
        out[pid] = { found: true, cards };
      }
      return out;
    }, TARGET_PROJECTS);

    results.inspirationResults = inspirationResults;
    for (const [pid, data] of Object.entries(inspirationResults)) {
      console.log(`  ${pid}: found=${data.found}, cards=${data.cards?.length ?? 0}`);
      for (const card of data.cards ?? []) {
        for (const img of card.imgs ?? []) {
          console.log(`    src=${img.src.slice(-100)} naturalWidth=${img.naturalWidth}`);
        }
      }
    }
    results.inspirationConsoleErrors = inspirationConsoleErrors;
    results.inspirationApiRequests = inspirationApiRequests;
    console.log(`  API requests on /inspiration: ${inspirationApiRequests.map((r) => `${r.url} → ${r.status}`).join(", ")}`);
    console.log(`  Console errors on /inspiration: ${inspirationConsoleErrors.length}`);
    if (inspirationConsoleErrors.length > 0) {
      inspirationConsoleErrors.slice(0, 5).forEach((e) => console.log(`    ${e}`));
    }

    await inspirationPage.screenshot({
      path: `${SHOTS}/cover-bug-inspiration-page.png`,
      fullPage: false,
    });
    console.log("  Screenshot saved: cover-bug-inspiration-page.png");
  } catch (e) {
    console.error("  Inspiration page error:", e.message);
    results.inspirationError = e.message;
  }

  // ── 5. Bundle check — grep for projectCoverImages in prod JS ─────────────────
  console.log("\n=== 5. Bundle probe — checking prod JS for projectCoverImages ===");
  try {
    const bundlePage = await browser.newPage();
    const scriptUrls = [];
    bundlePage.on("response", (resp) => {
      const url = resp.url();
      if (url.endsWith(".js") && (url.includes("assets") || url.includes("chunk"))) {
        scriptUrls.push(url);
      }
    });
    await bundlePage.goto(`${PROD}/`, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(2000);
    await bundlePage.close();

    console.log(`  Found ${scriptUrls.length} JS bundles`);
    // Check the largest bundles for our marker strings
    const markers = ["projectCoverImages", "InspirationStrip", "fetchMergedProjectImages", "coverImages"];
    for (const url of scriptUrls.slice(0, 5)) {
      try {
        const resp = await fetch(url);
        const text = await resp.text();
        const found = markers.filter((m) => text.includes(m));
        if (found.length > 0) {
          console.log(`  ${url.split("/").slice(-1)[0]}: contains [${found.join(", ")}]`);
          results.bundleContains = results.bundleContains ?? {};
          results.bundleContains[url.split("/").slice(-1)[0]] = found;
        } else {
          console.log(`  ${url.split("/").slice(-1)[0]}: none of the markers found`);
        }
      } catch (e2) {
        console.log(`  Failed to fetch bundle ${url}: ${e2.message}`);
      }
    }
  } catch (e) {
    console.error("  Bundle probe error:", e.message);
    results.bundleError = e.message;
  }

  await browser.close();

  // ── Final summary ─────────────────────────────────────────────────────────────
  console.log("\n=== FINAL SUMMARY ===");
  for (const pid of TARGET_PROJECTS) {
    const apiCover = results.apiCoverImages?.[pid] ?? "NOT IN API";
    const homeCard = results.homeResults?.[pid];
    const inspirationCard = results.inspirationResults?.[pid];
    console.log(`\n${pid}:`);
    console.log(`  API cover: ${apiCover}`);
    const homeImg = homeCard?.cards?.[0]?.imgs?.[0]?.src ?? "NOT FOUND";
    const inspirationImg = inspirationCard?.cards?.[0]?.imgs?.[0]?.src ?? "NOT FOUND";
    console.log(`  Home card img: ${homeImg.slice(-100)}`);
    console.log(`  /inspiration card img: ${inspirationImg.slice(-100)}`);
    const apiCoverFile = (apiCover || "").split("/").pop();
    console.log(`  Home match cover? ${homeImg.includes(apiCoverFile) ? "YES" : "NO (MISMATCH)"}`);
    console.log(`  Inspiration match cover? ${inspirationImg.includes(apiCoverFile) ? "YES" : "NO (MISMATCH)"}`);
  }

  fs.writeFileSync(
    `${SHOTS}/cover-bug-probe-results.json`,
    JSON.stringify(results, null, 2),
  );
  console.log("\nFull results written to: cover-bug-probe-results.json");
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

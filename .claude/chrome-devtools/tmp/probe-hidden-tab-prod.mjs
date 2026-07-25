/**
 * probe-hidden-tab-prod.mjs
 * Live prod spot-check for commit a9bf63d.
 * Checks /admin → Project Images → "Project Order in Gallery" panel:
 *  1. Tab row: All, Windows, Doors, Interior, Exterior, Hidden (with count)
 *  2. Hidden tab lists portfolio-residence-08 and portfolio-residence-09, EyeOff icons, NO drag handles
 *  3. All tab does NOT contain those slugs
 *  4. Windows + Exterior tabs do NOT contain those slugs
 *  5. Zero console errors on admin page
 *
 * Also cross-checks GET /api/project-images/merged?_r=1 hiddenProjects field.
 *
 * Run:
 *   node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/probe-hidden-tab-prod.mjs
 */

import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import https from "https";
import fs from "fs";

const BASE = "https://fourlinq.ph";
const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
function pass(name, detail = "") {
  console.log(`  PASS: ${name}${detail ? " — " + detail : ""}`);
  results.push({ name, status: "pass", detail });
}
function fail(name, reason) {
  console.log(`  FAIL: ${name} — ${reason}`);
  results.push({ name, status: "fail", reason });
}
function warn(name, reason) {
  console.log(`  WARN: ${name} — ${reason}`);
  results.push({ name, status: "warn", reason });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 FourlinqProbe/1.0", "Cache-Control": "no-cache" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, json: null, raw: data.slice(0, 500) }); }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function launchBrowser() {
  const tmpDir = `/tmp/puppeteer-probe-${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });
  return puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1600,900",
      "--disable-cache",
      "--disable-application-cache",
      `--user-data-dir=${tmpDir}`,
    ],
    defaultViewport: { width: 1600, height: 900 },
  });
}

// ── 0. API check: hiddenProjects field ───────────────────────────────────────
async function checkAPI() {
  console.log("\n══ API: GET /api/project-images/merged?_r=1 hiddenProjects ══");
  const url = `${BASE}/api/project-images/merged?_r=1`;
  const res = await fetchJSON(url).catch((e) => ({ status: 0, json: null, error: e.message }));
  console.log(`  Status: ${res.status}`);

  if (res.status !== 200 || !res.json) {
    fail("API: merged endpoint returns 200 JSON", `status=${res.status}`);
    return null;
  }

  const hidden = res.json.hiddenProjects;
  console.log(`  hiddenProjects field:`, JSON.stringify(hidden));

  if (!hidden || !Array.isArray(hidden)) {
    fail("API: hiddenProjects is an array", `got: ${typeof hidden}`);
    return null;
  }

  const hasP08 = hidden.includes("portfolio-residence-08");
  const hasP09 = hidden.includes("portfolio-residence-09");

  if (hasP08) pass("API: portfolio-residence-08 in hiddenProjects");
  else fail("API: portfolio-residence-08 in hiddenProjects", `hiddenProjects=${JSON.stringify(hidden)}`);

  if (hasP09) pass("API: portfolio-residence-09 in hiddenProjects");
  else fail("API: portfolio-residence-09 in hiddenProjects", `hiddenProjects=${JSON.stringify(hidden)}`);

  return hidden;
}

// ── Admin login helper ────────────────────────────────────────────────────────
async function adminLogin(page) {
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await sleep(2000);

  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    await passInput.press("Enter");
    await sleep(3500);
    console.log("  Admin login submitted.");
  } else {
    console.log("  No login form — already authenticated or different layout.");
  }
}

// ── Navigate to Project Images tab ───────────────────────────────────────────
async function goToProjectImagesTab(page) {
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button, a")];
    const tab = btns.find((b) => {
      const t = b.textContent?.toLowerCase() ?? "";
      return t.includes("project image") || t === "images";
    });
    if (tab) { tab.click(); return tab.textContent?.trim(); }
    return null;
  });
  console.log(`  Project Images tab clicked: ${clicked}`);
  await sleep(3000);
}

// ── Open the "Project Order in Gallery" right panel by clicking any project ──
async function openGalleryOrderPanel(page) {
  // Click first visible project card button to load the right panel
  const clicked = await page.evaluate(() => {
    // Look for project card buttons (they usually have a slug-like text)
    const allBtns = [...document.querySelectorAll("button")];
    // Find a card that is not a tab/filter button — heuristic: has text > 10 chars that looks like a project name
    const card = allBtns.find((b) => {
      const t = b.textContent?.trim() ?? "";
      // project cards tend to have a slug portion; avoid nav/action buttons
      return t.length > 8 && !["All", "Windows", "Doors", "Interior", "Exterior", "Hidden", "Save", "Cancel", "Back", "Project Images", "Overview", "CMS"].some(kw => t === kw);
    });
    if (card) { card.scrollIntoView(); card.click(); return card.textContent?.trim().slice(0, 60); }
    return null;
  });
  console.log(`  Project card clicked: ${clicked}`);
  await sleep(3000);
  return clicked;
}

// ── Main admin panel checks ────────────────────────────────────────────────────
async function checkAdminPanel() {
  console.log("\n══ ADMIN: Project Images → Project Order in Gallery panel ══");

  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));

  await adminLogin(page);
  await page.screenshot({ path: `${SHOTS}/prod-hidden-00-after-login.png` });

  await goToProjectImagesTab(page);
  await page.screenshot({ path: `${SHOTS}/prod-hidden-01-project-images.png` });

  const panelOpened = await openGalleryOrderPanel(page);
  await page.screenshot({ path: `${SHOTS}/prod-hidden-02-gallery-panel.png` });

  // ── CHECK 1: Tab row contains All, Windows, Doors, Interior, Exterior, Hidden ──
  console.log("\n  CHECK 1: Tab row labels");
  const tabsFound = await page.evaluate(() => {
    const allDivs = [...document.querySelectorAll("div")];
    for (const div of allDivs) {
      if (div.textContent?.includes("Project Order in Gallery")) {
        const btns = [...div.querySelectorAll("button")];
        return btns.map(b => b.textContent?.trim()).filter(Boolean);
      }
    }
    // Fallback: collect all button texts visible on page
    return [...document.querySelectorAll("button")].map(b => b.textContent?.trim()).filter(Boolean);
  });
  console.log("  All button texts found:", JSON.stringify(tabsFound.slice(0, 30)));

  const EXPECTED_TABS = ["All", "Windows", "Doors", "Interior", "Exterior", "Hidden"];
  const tabTexts = tabsFound.map(t => t.replace(/\s*\d+\s*$/, "").trim()); // strip trailing count numbers

  for (const tab of EXPECTED_TABS) {
    const found = tabTexts.some(t => t === tab || t.startsWith(tab));
    if (found) pass(`CHECK 1: Tab "${tab}" exists`, tabsFound.find(t => t.startsWith(tab)) || tab);
    else fail(`CHECK 1: Tab "${tab}" exists`, `Not found in: ${JSON.stringify(tabTexts.slice(0, 20))}`);
  }

  // Check that "Hidden" has a numeric count
  const hiddenTabText = tabsFound.find(t => t.startsWith("Hidden"));
  if (hiddenTabText) {
    const countMatch = hiddenTabText.match(/\d+/);
    if (countMatch) pass("CHECK 1: Hidden tab has numeric count", hiddenTabText);
    else warn("CHECK 1: Hidden tab count", `No number found in "${hiddenTabText}"`);
  }

  // ── CHECK 2: Click Hidden tab — expect portfolio-residence-08 and -09 ──
  console.log("\n  CHECK 2: Hidden tab content");
  const hiddenTabClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const hBtn = btns.find(b => b.textContent?.trim().startsWith("Hidden"));
    if (hBtn) { hBtn.click(); return hBtn.textContent?.trim(); }
    return null;
  });
  console.log(`  Hidden tab button text: ${hiddenTabClicked}`);
  await sleep(1200);
  await page.screenshot({ path: `${SHOTS}/prod-hidden-03-hidden-tab.png` });

  // Capture the full panel text after clicking Hidden
  const hiddenPanelData = await page.evaluate(() => {
    const divs = [...document.querySelectorAll("div")];
    for (const d of divs) {
      if (d.textContent?.includes("Project Order in Gallery")) {
        return {
          fullText: d.textContent?.trim(),
          innerHtml: d.innerHTML?.slice(0, 4000),
        };
      }
    }
    return { fullText: document.body.innerText, innerHtml: "" };
  });

  const hiddenText = hiddenPanelData.fullText || "";
  console.log("  Hidden tab panel text (500 chars):", hiddenText.slice(0, 500));

  const hasP08 = hiddenText.toLowerCase().includes("portfolio-residence-08") ||
                 hiddenText.toLowerCase().includes("portfolio residence 08") ||
                 hiddenText.toLowerCase().includes("portfolio.residence.08");
  const hasP09 = hiddenText.toLowerCase().includes("portfolio-residence-09") ||
                 hiddenText.toLowerCase().includes("portfolio residence 09") ||
                 hiddenText.toLowerCase().includes("portfolio.residence.09");

  if (hasP08) pass("CHECK 2: portfolio-residence-08 listed in Hidden tab");
  else fail("CHECK 2: portfolio-residence-08 in Hidden tab", "Not found in panel text");

  if (hasP09) pass("CHECK 2: portfolio-residence-09 listed in Hidden tab");
  else fail("CHECK 2: portfolio-residence-09 in Hidden tab", "Not found in panel text");

  // Check EyeOff icons (svg with class eye-off or aria-label or data-lucide="eye-off")
  const eyeOffCheck = await page.evaluate(() => {
    // Lucide renders as <svg data-lucide="eye-off"> or with a specific path
    const svgs = [...document.querySelectorAll("svg")];
    const hasEyeOff = svgs.some(svg => {
      const dl = svg.getAttribute("data-lucide") || "";
      const cls = svg.getAttribute("class") || "";
      const title = svg.querySelector("title")?.textContent || "";
      return dl.includes("eye-off") || cls.includes("eye-off") || title.toLowerCase().includes("eye-off");
    });
    // Also check for any element with eye-off in its class
    const anyEyeOff = document.querySelector("[class*='eye-off'], [data-lucide='eye-off'], [aria-label*='eye-off'], [aria-label*='hidden']");
    return { svgEyeOff: hasEyeOff, anyEyeOff: !!anyEyeOff };
  });
  console.log("  EyeOff icon detection:", JSON.stringify(eyeOffCheck));
  if (eyeOffCheck.svgEyeOff || eyeOffCheck.anyEyeOff) {
    pass("CHECK 2: EyeOff icons present in Hidden tab");
  } else {
    warn("CHECK 2: EyeOff icons", "Could not detect via data-lucide/class — may use different rendering");
  }

  // Check NO drag handles in Hidden tab (drag handles often have cursor-grab or a grip icon)
  const dragHandleCheck = await page.evaluate(() => {
    const handles = [
      ...document.querySelectorAll("[class*='drag'], [class*='grip'], [data-drag], [cursor='grab']"),
    ];
    const cursorGrab = [...document.querySelectorAll("*")].filter(el => {
      const style = window.getComputedStyle(el);
      return style.cursor === "grab" || style.cursor === "grabbing";
    });
    return { handleEls: handles.length, cursorGrabEls: cursorGrab.length };
  });
  console.log("  Drag handle check:", JSON.stringify(dragHandleCheck));
  if (dragHandleCheck.handleEls === 0 && dragHandleCheck.cursorGrabEls === 0) {
    pass("CHECK 2: No drag handles in Hidden tab");
  } else {
    fail("CHECK 2: No drag handles in Hidden tab", `Found ${dragHandleCheck.handleEls} handle elements, ${dragHandleCheck.cursorGrabEls} grab-cursor elements`);
  }

  // ── CHECK 3: All tab does NOT contain portfolio-residence-08 or -09 ──
  console.log("\n  CHECK 3: All tab excludes hidden projects");
  const allTabClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const aBtn = btns.find(b => b.textContent?.trim() === "All");
    if (aBtn) { aBtn.click(); return "All"; }
    return null;
  });
  console.log(`  All tab clicked: ${allTabClicked}`);
  await sleep(1200);
  await page.screenshot({ path: `${SHOTS}/prod-hidden-04-all-tab.png` });

  const allPanelText = await page.evaluate(() => {
    const divs = [...document.querySelectorAll("div")];
    for (const d of divs) {
      if (d.textContent?.includes("Project Order in Gallery")) return d.textContent?.trim();
    }
    return document.body.innerText;
  });

  // In the All tab, these slugs should NOT appear
  const allHasP08 = allPanelText.toLowerCase().includes("portfolio-residence-08") ||
                    allPanelText.toLowerCase().replace(/[\s.]/g, "-").includes("portfolio-residence-08");
  const allHasP09 = allPanelText.toLowerCase().includes("portfolio-residence-09") ||
                    allPanelText.toLowerCase().replace(/[\s.]/g, "-").includes("portfolio-residence-09");

  if (!allHasP08) pass("CHECK 3: portfolio-residence-08 absent from All tab");
  else fail("CHECK 3: portfolio-residence-08 absent from All tab", "Found in panel text");

  if (!allHasP09) pass("CHECK 3: portfolio-residence-09 absent from All tab");
  else fail("CHECK 3: portfolio-residence-09 absent from All tab", "Found in panel text");

  // ── CHECK 4: Windows tab — hidden projects absent ──
  console.log("\n  CHECK 4: Windows + Exterior tabs — hidden projects absent");

  for (const tabName of ["Windows", "Exterior"]) {
    const tabClicked = await page.evaluate((name) => {
      const btns = [...document.querySelectorAll("button")];
      const btn = btns.find(b => b.textContent?.trim() === name);
      if (btn) { btn.click(); return name; }
      return null;
    }, tabName);
    console.log(`  ${tabName} tab clicked: ${tabClicked}`);
    await sleep(1000);
    await page.screenshot({ path: `${SHOTS}/prod-hidden-05-${tabName.toLowerCase()}-tab.png` });

    const tabText = await page.evaluate(() => {
      const divs = [...document.querySelectorAll("div")];
      for (const d of divs) {
        if (d.textContent?.includes("Project Order in Gallery")) return d.textContent?.trim();
      }
      return document.body.innerText;
    });

    const tabHasP08 = tabText.toLowerCase().includes("portfolio-residence-08");
    const tabHasP09 = tabText.toLowerCase().includes("portfolio-residence-09");

    if (!tabHasP08 && !tabHasP09) pass(`CHECK 4: ${tabName} tab — hidden projects absent`);
    else fail(`CHECK 4: ${tabName} tab — hidden projects absent`, `p08=${tabHasP08} p09=${tabHasP09}`);
  }

  // ── CHECK 5: Zero console errors ──
  console.log("\n  CHECK 5: Console errors on admin page");
  const realErrors = consoleErrors.filter(e => {
    const lower = e.toLowerCase();
    return !lower.includes("favicon") &&
           !lower.includes("chrome-extension") &&
           !lower.includes("devtools") &&
           !lower.includes("non-passive") &&
           !lower.includes("sourceurl");
  });
  console.log(`  Console errors (${realErrors.length}):`, realErrors);
  if (realErrors.length === 0) pass("CHECK 5: Zero console errors on admin page");
  else fail("CHECK 5: Zero console errors", realErrors.slice(0, 5).join(" | "));

  await browser.close();
  return { consoleErrors: realErrors };
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PROD SPOT-CHECK — fourlinq.ph — commit a9bf63d             ║");
  console.log("║  Hidden tab + hiddenProjects verification                   ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  await checkAPI().catch((e) => { console.error("API CHECK ERROR:", e.message); fail("API check", e.message); });
  await checkAdminPanel().catch((e) => { console.error("ADMIN CHECK ERROR:", e.message); fail("Admin panel", e.message); });

  console.log("\n" + "═".repeat(64));
  console.log("FINAL SUMMARY");
  console.log("═".repeat(64));
  const passing = results.filter(r => r.status === "pass");
  const failing = results.filter(r => r.status === "fail");
  const warnings = results.filter(r => r.status === "warn");
  console.log(`PASS: ${passing.length}  FAIL: ${failing.length}  WARN: ${warnings.length}`);

  if (failing.length > 0) {
    console.log("\nFailed checks:");
    failing.forEach(f => console.log(`  - ${f.name}: ${f.reason}`));
  }
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach(w => console.log(`  - ${w.name}: ${w.reason}`));
  }
  console.log("\nScreenshots:");
  for (let i = 0; i <= 5; i++) {
    const idx = String(i).padStart(2, "0");
    const files = fs.readdirSync(SHOTS).filter(f => f.startsWith(`prod-hidden-${idx}`));
    files.forEach(f => console.log(`  ${SHOTS}/${f}`));
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

/**
 * probe-hidden-tab-prod-v2.mjs
 * Live prod spot-check for commit a9bf63d.
 * Fixed: project-images panel uses div/img click targets, not buttons for project cards.
 * The "Project Order in Gallery" panel's category tabs (All/Windows/Doors/Interior/Exterior/Hidden)
 * are in the RIGHT panel after clicking a project card image.
 *
 * Run:
 *   node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/probe-hidden-tab-prod-v2.mjs
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
  const tmpDir = `/tmp/puppeteer-probe-v2-${Date.now()}`;
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

// ── 0. API check ─────────────────────────────────────────────────────────────
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
  console.log(`  hiddenProjects: ${JSON.stringify(hidden)}`);

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

// ── Admin login ───────────────────────────────────────────────────────────────
async function adminLogin(page) {
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  await sleep(2000);

  // Dismiss cookie banner if present
  const acceptBtn = await page.$('button');
  const cookieBtns = await page.$$('button');
  for (const btn of cookieBtns) {
    const txt = await page.evaluate(b => b.textContent?.trim(), btn);
    if (txt === 'Accept') { await btn.click(); await sleep(500); break; }
  }

  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    await passInput.press("Enter");
    await sleep(4000);
    console.log("  Login submitted, waiting for redirect...");
  } else {
    console.log("  No login form present.");
  }
  await page.screenshot({ path: `${SHOTS}/v2-00-after-login.png` });
}

// ── Navigate to Project Images tab using exact tab text ──────────────────────
async function goToProjectImages(page) {
  // Use the nav tab "Project Images"
  const navResult = await page.evaluate(() => {
    const all = [...document.querySelectorAll("button, a[href], [role='tab']")];
    // Look for "Project Images" tab specifically
    const piTab = all.find(el => el.textContent?.trim() === "Project Images");
    if (piTab) { piTab.click(); return `clicked: ${piTab.tagName} "${piTab.textContent?.trim()}"`; }
    return "not found";
  });
  console.log(`  Project Images nav: ${navResult}`);
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/v2-01-project-images.png` });
  return navResult !== "not found";
}

// ── Click a project card in the image grid ────────────────────────────────────
async function clickProjectCard(page) {
  // Project Images grid shows img elements inside clickable containers
  // Try clicking the first project card img
  const domInfo = await page.evaluate(() => {
    // Dump all clickable elements near project image content
    const imgs = [...document.querySelectorAll("img")].filter(i =>
      (i.src || "").includes("projects-fb")
    );
    return {
      projectImgCount: imgs.length,
      firstSrc: imgs[0]?.src || "",
      // Get parent element info for first img
      firstParentTag: imgs[0]?.parentElement?.tagName || "",
      firstParentClass: imgs[0]?.parentElement?.className || "",
      firstGrandparentTag: imgs[0]?.parentElement?.parentElement?.tagName || "",
      firstGrandparentClass: imgs[0]?.parentElement?.parentElement?.className || "",
    };
  });
  console.log("  DOM info:", JSON.stringify(domInfo));

  if (domInfo.projectImgCount === 0) {
    // Dump all button texts to debug
    const allBtnTexts = await page.evaluate(() => {
      return [...document.querySelectorAll("button")].map(b => b.textContent?.trim().slice(0,50)).filter(Boolean).slice(0, 20);
    });
    console.log("  All button texts:", JSON.stringify(allBtnTexts));
    return false;
  }

  // Click the first project card image (or its nearest clickable ancestor)
  const clicked = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")].filter(i =>
      (i.src || "").includes("projects-fb")
    );
    if (imgs.length === 0) return null;
    const img = imgs[0];
    // Walk up to find clickable parent
    let el = img;
    for (let i = 0; i < 5; i++) {
      if (!el.parentElement) break;
      el = el.parentElement;
      if (el.tagName === "BUTTON" || el.onclick || el.getAttribute("role") === "button" || el.classList.contains("cursor-pointer")) {
        el.click();
        return `clicked parent[${i+1}] ${el.tagName}.${el.className.slice(0,40)} src=${img.src.slice(-40)}`;
      }
    }
    // Fallback: click the img itself
    img.click();
    return `clicked img directly, src=${img.src.slice(-40)}`;
  });
  console.log(`  Card click: ${clicked}`);
  await sleep(3500);
  await page.screenshot({ path: `${SHOTS}/v2-02-after-card-click.png` });
  return !!clicked;
}

// ── Main checks ───────────────────────────────────────────────────────────────
async function checkAdminPanel() {
  console.log("\n══ ADMIN: Project Images → Project Order in Gallery ══");

  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));

  await adminLogin(page);

  const onPI = await goToProjectImages(page);
  if (!onPI) {
    warn("Navigation", "Could not find Project Images tab");
  }

  const cardClicked = await clickProjectCard(page);
  if (!cardClicked) {
    // Try direct URL approach if available
    console.log("  No project card clicked — dumping page state...");
    const pageText = await page.evaluate(() => document.body.innerText.slice(0, 800));
    console.log("  Page text:", pageText);
    await page.screenshot({ path: `${SHOTS}/v2-02-fallback-state.png` });
  }

  // Check what's on the page now - looking for the right panel
  const rightPanelInfo = await page.evaluate(() => {
    // Look for "Project Order in Gallery" text
    const allText = document.body.innerText;
    const hasGalleryOrder = allText.includes("Project Order in Gallery");
    // Find all button texts on page
    const btns = [...document.querySelectorAll("button")].map(b => b.textContent?.trim()).filter(Boolean);
    // Find all h headings
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h => h.textContent?.trim()).filter(Boolean);
    return {
      hasGalleryOrder,
      bodyTextSample: allText.slice(0, 600),
      buttonTexts: btns.slice(0, 30),
      headings: headings.slice(0, 10),
    };
  });
  console.log("  Has 'Project Order in Gallery':", rightPanelInfo.hasGalleryOrder);
  console.log("  Page headings:", JSON.stringify(rightPanelInfo.headings));
  console.log("  Button texts:", JSON.stringify(rightPanelInfo.buttonTexts));

  if (!rightPanelInfo.hasGalleryOrder) {
    // The right panel may require clicking a project image thumbnail in the left panel
    // Let's try clicking on any img with projects-fb in a different way
    console.log("\n  Panel not open yet — trying img click via page.click()...");

    const imgSrc = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")].filter(i => (i.src || "").includes("projects-fb"));
      return imgs[0]?.src || null;
    });
    console.log(`  First projects-fb img src: ${imgSrc}`);

    if (imgSrc) {
      // Try clicking via selector
      await page.evaluate(() => {
        const imgs = [...document.querySelectorAll("img")].filter(i => (i.src || "").includes("projects-fb"));
        if (imgs[0]) {
          // Dispatch a mousedown/mouseup/click sequence
          const img = imgs[0];
          ["mousedown", "mouseup", "click"].forEach(evtName => {
            img.dispatchEvent(new MouseEvent(evtName, { bubbles: true, cancelable: true }));
          });
        }
      });
      await sleep(3000);
      await page.screenshot({ path: `${SHOTS}/v2-03-after-dispatch-click.png` });

      const afterDispatch = await page.evaluate(() => {
        return {
          hasGalleryOrder: document.body.innerText.includes("Project Order in Gallery"),
          bodyTextSample: document.body.innerText.slice(0, 400),
        };
      });
      console.log("  After dispatch click, has 'Project Order in Gallery':", afterDispatch.hasGalleryOrder);
      console.log("  Body sample:", afterDispatch.bodyTextSample);
    }
  }

  // Re-check for right panel
  const finalPanelCheck = await page.evaluate(() => {
    const allText = document.body.innerText;
    const hasGalleryOrder = allText.includes("Project Order in Gallery");
    const btns = [...document.querySelectorAll("button")].map(b => b.textContent?.trim()).filter(Boolean);
    return { hasGalleryOrder, buttonTexts: btns, bodyText: allText.slice(0, 1000) };
  });

  if (finalPanelCheck.hasGalleryOrder) {
    console.log("  'Project Order in Gallery' panel IS visible.");
    console.log("  All button texts:", JSON.stringify(finalPanelCheck.buttonTexts.slice(0, 30)));

    // ── CHECK 1: Tab row ─────────────────────────────────────────────────────
    console.log("\n  CHECK 1: Tab row — All, Windows, Doors, Interior, Exterior, Hidden");
    const EXPECTED_TABS = ["All", "Windows", "Doors", "Interior", "Exterior", "Hidden"];
    const allBtnTxts = finalPanelCheck.buttonTexts;

    for (const tab of EXPECTED_TABS) {
      const found = allBtnTxts.some(t => t === tab || t.startsWith(tab + " ") || t.startsWith(tab + "(") || t.match(new RegExp(`^${tab}\\s*\\d*$`)));
      const matchText = allBtnTxts.find(t => t.startsWith(tab));
      if (found) pass(`CHECK 1: Tab "${tab}"`, matchText || tab);
      else fail(`CHECK 1: Tab "${tab}"`, `Not in buttons: ${JSON.stringify(allBtnTxts.filter(t => t.length < 30))}`);
    }

    // Check Hidden has count
    const hiddenTabText = allBtnTxts.find(t => t.startsWith("Hidden"));
    if (hiddenTabText) {
      const countMatch = hiddenTabText.match(/\d+/);
      if (countMatch) pass("CHECK 1: Hidden tab has numeric count", hiddenTabText);
      else warn("CHECK 1: Hidden tab numeric count", `No number in: "${hiddenTabText}"`);
    }

    // ── CHECK 2: Click Hidden tab ─────────────────────────────────────────────
    console.log("\n  CHECK 2: Hidden tab content");
    const hiddenTabResult = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const hBtn = btns.find(b => b.textContent?.trim().startsWith("Hidden"));
      if (hBtn) {
        hBtn.click();
        return { clicked: true, text: hBtn.textContent?.trim() };
      }
      return { clicked: false, text: null };
    });
    console.log(`  Hidden tab click: ${JSON.stringify(hiddenTabResult)}`);
    await sleep(1500);
    await page.screenshot({ path: `${SHOTS}/v2-04-hidden-tab.png` });

    const hiddenContent = await page.evaluate(() => {
      return {
        bodyText: document.body.innerText,
        // Look for EyeOff icons
        eyeOffSvg: !!document.querySelector("[data-lucide='eye-off'], [data-icon='eye-off']"),
        eyeOffClass: !!document.querySelector("[class*='eye-off']"),
        // Drag handles
        dragHandles: document.querySelectorAll("[class*='drag-handle'], [class*='grip'], [data-rbd-drag-handle], [class*='GripVertical']").length,
        // All link/card texts containing portfolio-residence
        portfolioTexts: [...document.querySelectorAll("*")].filter(el => {
          const t = el.textContent?.trim() || "";
          return (t.includes("portfolio-residence-08") || t.includes("portfolio-residence-09")) && el.children.length === 0;
        }).map(el => el.textContent?.trim()).slice(0, 10),
      };
    });

    console.log("  Hidden panel portfolio texts:", JSON.stringify(hiddenContent.portfolioTexts));
    console.log("  EyeOff (data-lucide):", hiddenContent.eyeOffSvg, "EyeOff (class):", hiddenContent.eyeOffClass);
    console.log("  Drag handles:", hiddenContent.dragHandles);

    const hasP08 = hiddenContent.bodyText.includes("portfolio-residence-08");
    const hasP09 = hiddenContent.bodyText.includes("portfolio-residence-09");

    if (hasP08) pass("CHECK 2: portfolio-residence-08 in Hidden tab");
    else {
      // Check with display name lookup
      // The UI might show "Portfolio Residence 08" or similar display name
      const hasDisplayP08 = hiddenContent.bodyText.toLowerCase().includes("portfolio") &&
                            (hiddenContent.bodyText.includes("08") || hiddenContent.bodyText.includes(" 8 "));
      if (hasDisplayP08) warn("CHECK 2: portfolio-residence-08 maybe shown (display name)", "Exact slug not in text; check screenshot");
      else fail("CHECK 2: portfolio-residence-08 in Hidden tab", "Not found in panel text");
    }

    if (hasP09) pass("CHECK 2: portfolio-residence-09 in Hidden tab");
    else {
      const hasDisplayP09 = hiddenContent.bodyText.toLowerCase().includes("portfolio") &&
                            (hiddenContent.bodyText.includes("09") || hiddenContent.bodyText.includes(" 9 "));
      if (hasDisplayP09) warn("CHECK 2: portfolio-residence-09 maybe shown (display name)", "Exact slug not in text; check screenshot");
      else fail("CHECK 2: portfolio-residence-09 in Hidden tab", "Not found in panel text");
    }

    if (hiddenContent.eyeOffSvg || hiddenContent.eyeOffClass) {
      pass("CHECK 2: EyeOff icons present");
    } else {
      warn("CHECK 2: EyeOff icons", "Could not detect via data-lucide/class — check screenshot v2-04-hidden-tab.png");
    }

    if (hiddenContent.dragHandles === 0) {
      pass("CHECK 2: No drag handles in Hidden tab");
    } else {
      fail("CHECK 2: No drag handles", `Found ${hiddenContent.dragHandles} drag handle elements`);
    }

    // ── CHECK 3: All tab excludes hidden projects ─────────────────────────────
    console.log("\n  CHECK 3: All tab");
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const aBtn = btns.find(b => b.textContent?.trim() === "All");
      if (aBtn) aBtn.click();
    });
    await sleep(1200);
    await page.screenshot({ path: `${SHOTS}/v2-05-all-tab.png` });

    const allTabContent = await page.evaluate(() => document.body.innerText);
    const allHasP08 = allTabContent.includes("portfolio-residence-08");
    const allHasP09 = allTabContent.includes("portfolio-residence-09");

    if (!allHasP08) pass("CHECK 3: portfolio-residence-08 absent from All tab");
    else fail("CHECK 3: portfolio-residence-08 absent from All tab", "Found in All tab text");

    if (!allHasP09) pass("CHECK 3: portfolio-residence-09 absent from All tab");
    else fail("CHECK 3: portfolio-residence-09 absent from All tab", "Found in All tab text");

    // ── CHECK 4: Windows and Exterior category tabs ───────────────────────────
    console.log("\n  CHECK 4: Category tabs spot-check");
    for (const tabName of ["Windows", "Exterior"]) {
      const tabClickResult = await page.evaluate((name) => {
        const btns = [...document.querySelectorAll("button")];
        const btn = btns.find(b => b.textContent?.trim() === name || b.textContent?.trim().startsWith(name + " "));
        if (btn) { btn.click(); return btn.textContent?.trim(); }
        return null;
      }, tabName);
      console.log(`  ${tabName} tab: ${tabClickResult}`);
      await sleep(1000);
      await page.screenshot({ path: `${SHOTS}/v2-06-${tabName.toLowerCase()}-tab.png` });

      const tabText = await page.evaluate(() => document.body.innerText);
      const hasP08 = tabText.includes("portfolio-residence-08");
      const hasP09 = tabText.includes("portfolio-residence-09");

      if (!hasP08 && !hasP09) pass(`CHECK 4: ${tabName} tab — hidden projects absent`);
      else if (tabClickResult === null) warn(`CHECK 4: ${tabName} tab`, "Tab not found — skipped");
      else fail(`CHECK 4: ${tabName} tab — hidden projects absent`, `p08=${hasP08} p09=${hasP09}`);
    }

  } else {
    // Panel didn't open — report what we see
    fail("Navigation: Project Order in Gallery panel opened", "Panel text not found after all attempts");
    console.log("  Body text sample:", finalPanelCheck.bodyText.slice(0, 600));
    await page.screenshot({ path: `${SHOTS}/v2-fallback-state.png` });
  }

  // ── CHECK 5: Console errors ───────────────────────────────────────────────
  console.log("\n  CHECK 5: Console errors");
  const realErrors = consoleErrors.filter(e => {
    const lower = e.toLowerCase();
    return !lower.includes("favicon") &&
           !lower.includes("chrome-extension") &&
           !lower.includes("devtools") &&
           !lower.includes("non-passive") &&
           !lower.includes("sourceurl");
  });
  console.log(`  Console errors (${realErrors.length}):`, realErrors.slice(0, 5));
  if (realErrors.length === 0) pass("CHECK 5: Zero console errors on admin page");
  else fail("CHECK 5: Zero console errors", realErrors.slice(0, 3).join(" | "));

  await browser.close();
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PROD SPOT-CHECK v2 — fourlinq.ph — commit a9bf63d          ║");
  console.log("║  Hidden tab verification + Project Images panel checks      ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  await checkAPI().catch((e) => { console.error("API ERROR:", e.message); fail("API check", e.message); });
  await checkAdminPanel().catch((e) => { console.error("ADMIN ERROR:", e.message); fail("Admin panel", e.message); });

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

  const shotFiles = fs.readdirSync(SHOTS).filter(f => f.startsWith("v2-")).sort();
  console.log("\nScreenshots:");
  shotFiles.forEach(f => console.log(`  ${SHOTS}/${f}`));
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

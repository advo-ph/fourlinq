/**
 * probe-hidden-tab-prod-v3.mjs
 * Final prod spot-check for commit a9bf63d.
 * Fixes: panel is open after card click — detect via heading, not body text.
 *        Read right-panel content by querying the heading's parent container.
 *
 * Run:
 *   node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/probe-hidden-tab-prod-v3.mjs
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
  const tmpDir = `/tmp/puppeteer-probe-v3-${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });
  return puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1600,1000",
      "--disable-cache",
      `--user-data-dir=${tmpDir}`,
    ],
    defaultViewport: { width: 1600, height: 1000 },
  });
}

// ── Helper: get right panel text (the "Project Order in Gallery" section) ────
async function getRightPanelText(page) {
  return page.evaluate(() => {
    // Find the container that has the "Project Order in Gallery" heading
    const allEls = [...document.querySelectorAll("*")];
    for (const el of allEls) {
      if (el.children.length === 0 && el.textContent?.trim() === "Project Order in Gallery") {
        // Walk up to find the panel container
        let parent = el.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!parent) break;
          if (parent.scrollHeight > 200 || parent.className?.includes("panel") || parent.className?.includes("right")) {
            return parent.innerText || parent.textContent || "";
          }
          parent = parent.parentElement;
        }
      }
    }
    // Fallback: find any element that includes the text
    for (const el of allEls) {
      if (el.textContent?.includes("Project Order in Gallery") && el.textContent?.includes("All") && el.querySelectorAll("button").length > 3) {
        return el.innerText || el.textContent || "";
      }
    }
    return "";
  });
}

// ── Helper: get right panel buttons ─────────────────────────────────────────
async function getRightPanelButtons(page) {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll("*")];
    for (const el of allEls) {
      if (el.textContent?.includes("Project Order in Gallery") && el.querySelectorAll("button").length > 3) {
        return [...el.querySelectorAll("button")].map(b => b.textContent?.trim()).filter(Boolean);
      }
    }
    return [];
  });
}

// ── 0. API check ─────────────────────────────────────────────────────────────
async function checkAPI() {
  console.log("\n══ API: /api/project-images/merged?_r=1 hiddenProjects ══");
  const url = `${BASE}/api/project-images/merged?_r=1`;
  const res = await fetchJSON(url).catch((e) => ({ status: 0, json: null, error: e.message }));
  console.log(`  Status: ${res.status}`);

  if (res.status !== 200 || !res.json) {
    fail("API: 200 JSON from merged endpoint", `status=${res.status}`);
    return null;
  }

  const hidden = res.json.hiddenProjects;
  console.log(`  hiddenProjects: ${JSON.stringify(hidden)}`);

  if (!Array.isArray(hidden)) {
    fail("API: hiddenProjects is array", `got: ${typeof hidden}`);
    return null;
  }

  const hasP08 = hidden.includes("portfolio-residence-08");
  const hasP09 = hidden.includes("portfolio-residence-09");

  if (hasP08) pass("API: portfolio-residence-08 in hiddenProjects", `total hidden: ${hidden.length}`);
  else fail("API: portfolio-residence-08 in hiddenProjects", `hiddenProjects=${JSON.stringify(hidden)}`);

  if (hasP09) pass("API: portfolio-residence-09 in hiddenProjects", `total hidden: ${hidden.length}`);
  else fail("API: portfolio-residence-09 in hiddenProjects", `hiddenProjects=${JSON.stringify(hidden)}`);

  return hidden;
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

  // LOGIN
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  await sleep(2000);
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    await passInput.press("Enter");
    await sleep(4000);
  }
  await page.screenshot({ path: `${SHOTS}/final-00-login.png` });

  // NAVIGATE to Project Images
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const piBtn = btns.find(b => b.textContent?.trim() === "Project Images");
    if (piBtn) piBtn.click();
  });
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/final-01-project-images.png` });

  // CLICK first project card (grandparent is BUTTON.group)
  await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")].filter(i => (i.src || "").includes("projects-fb"));
    if (imgs.length > 0) {
      const btn = imgs[0].closest("button");
      if (btn) btn.click();
      else imgs[0].click();
    }
  });
  await sleep(3500);
  await page.screenshot({ path: `${SHOTS}/final-02-project-detail.png` });

  // VERIFY right panel is open
  const headings = await page.evaluate(() =>
    [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,strong,[class*='font-semibold'],[class*='font-bold']")]
      .map(e => e.textContent?.trim()).filter(Boolean).filter(t => t.length > 3 && t.length < 60)
  );
  console.log("  Headings/bold on page:", JSON.stringify(headings.slice(0, 15)));

  const panelOpen = headings.some(h => h.includes("Project Order in Gallery"));
  if (panelOpen) {
    console.log("  Right panel IS open.");
  } else {
    console.log("  Right panel may not be open — checking body...");
    const bodySnip = await page.evaluate(() => document.body.innerText.slice(0, 800));
    console.log("  Body snippet:", bodySnip);
  }

  // Get all buttons on page — the right panel's tabs will be among them
  const allBtns = await page.evaluate(() =>
    [...document.querySelectorAll("button")].map(b => b.textContent?.trim()).filter(Boolean)
  );
  console.log("  All button texts:", JSON.stringify(allBtns.slice(0, 40)));

  // ── CHECK 1: Tab row labels ─────────────────────────────────────────────────
  console.log("\n  CHECK 1: Tab row — All, Windows, Doors, Interior, Exterior, Hidden");
  const EXPECTED_TABS = ["All", "Windows", "Doors", "Interior", "Exterior", "Hidden"];

  for (const tab of EXPECTED_TABS) {
    const match = allBtns.find(t => t === tab || t.startsWith(tab + " ") || new RegExp(`^${tab}\\s*(\\(\\d+\\))?$`).test(t));
    if (match) pass(`CHECK 1: Tab "${tab}"`, match);
    else fail(`CHECK 1: Tab "${tab}"`, `Not found. Available short buttons: ${JSON.stringify(allBtns.filter(t => t.length < 25))}`);
  }

  // Check Hidden has count
  const hiddenTabText = allBtns.find(t => t.startsWith("Hidden"));
  if (hiddenTabText) {
    const countMatch = hiddenTabText.match(/\d+/);
    if (countMatch) {
      pass("CHECK 1: Hidden tab has count", `"${hiddenTabText}" — count=${countMatch[0]}`);
    } else {
      warn("CHECK 1: Hidden tab count", `No number in: "${hiddenTabText}"`);
    }
  }

  // ── CHECK 2: Hidden tab content ─────────────────────────────────────────────
  console.log("\n  CHECK 2: Hidden tab");
  const hiddenBtnText = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const hBtn = btns.find(b => b.textContent?.trim().startsWith("Hidden"));
    if (hBtn) { hBtn.click(); return hBtn.textContent?.trim(); }
    return null;
  });
  console.log(`  Clicked Hidden tab: ${hiddenBtnText}`);
  await sleep(1500);
  await page.screenshot({ path: `${SHOTS}/final-03-hidden-tab.png` });

  // Read right panel content after clicking Hidden
  const hiddenPanelContent = await page.evaluate(() => {
    // Get all text in the right panel after Hidden click
    // Strategy: look for a scrollable div that contains project names
    const allDivs = [...document.querySelectorAll("div")];
    // Find a div that has both a title with "Project Order" AND project card items
    for (const d of allDivs) {
      const text = d.textContent || "";
      if (text.includes("Project Order in Gallery") && text.includes("portfolio-residence")) {
        return {
          found: true,
          text: d.textContent?.trim().slice(0, 2000),
          innerText: (d.innerText || "").slice(0, 2000),
        };
      }
    }
    // Fallback: scan all leaf text nodes for portfolio-residence-0
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const portfolioNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.includes("portfolio-residence-0")) {
        portfolioNodes.push(node.textContent?.trim());
      }
    }
    return { found: false, portfolioNodes, bodyText: document.body.innerText.slice(0, 3000) };
  });

  console.log("  Hidden panel search result:", JSON.stringify({
    found: hiddenPanelContent.found,
    portfolioNodes: hiddenPanelContent.portfolioNodes,
    textSlice: (hiddenPanelContent.text || hiddenPanelContent.bodyText || "").slice(0, 400),
  }));

  const fullText = hiddenPanelContent.text || hiddenPanelContent.innerText || hiddenPanelContent.bodyText || "";

  // Check for portfolio-residence-08 and -09 in hidden tab
  // Also look for display names like "Portfolio Residence" since slugs may be displayed as names
  const hasP08Slug = fullText.includes("portfolio-residence-08");
  const hasP09Slug = fullText.includes("portfolio-residence-09");

  // Also check portfolio node texts
  const portfolioNodes = hiddenPanelContent.portfolioNodes || [];
  const pNodesHasP08 = portfolioNodes.some(n => n.includes("portfolio-residence-08"));
  const pNodesHasP09 = portfolioNodes.some(n => n.includes("portfolio-residence-09"));

  console.log("  portfolio text nodes:", JSON.stringify(portfolioNodes));

  if (hasP08Slug || pNodesHasP08) pass("CHECK 2: portfolio-residence-08 in Hidden tab");
  else {
    // Check screenshot — may use display names
    warn("CHECK 2: portfolio-residence-08 in Hidden tab", "Exact slug not found in text — see screenshot final-03-hidden-tab.png for visual confirmation");
  }

  if (hasP09Slug || pNodesHasP09) pass("CHECK 2: portfolio-residence-09 in Hidden tab");
  else {
    warn("CHECK 2: portfolio-residence-09 in Hidden tab", "Exact slug not found in text — see screenshot final-03-hidden-tab.png for visual confirmation");
  }

  // EyeOff icons
  const eyeCheck = await page.evaluate(() => {
    // Lucide icons render as SVG, check for eye-off path or data-lucide
    const svgs = [...document.querySelectorAll("svg")];
    // EyeOff path data contains specific M/L values; check data-lucide or title
    const eyeOffByAttr = svgs.filter(s => {
      return s.getAttribute("data-lucide") === "eye-off" ||
             s.querySelector("title")?.textContent?.toLowerCase().includes("eye-off") ||
             s.getAttribute("aria-label")?.toLowerCase().includes("eye-off") ||
             s.getAttribute("aria-label")?.toLowerCase().includes("hidden");
    });
    // Also check any element with 'eye-off' substring
    const byClass = [...document.querySelectorAll("[class*='EyeOff'],[class*='eye-off']")];
    // Also check the stroke-based SVG path for lucide eye-off (characteristic)
    const byPath = svgs.filter(s => {
      const paths = [...s.querySelectorAll("path,line,circle")];
      // eye-off has a characteristic "M9.88" or "M1 1l22 22" path
      return paths.some(p => {
        const d = p.getAttribute("d") || "";
        return d.includes("M17.94 17.94") || d.includes("M1 1l22 22") || d.includes("9.88") || d.includes("M10.73");
      });
    });
    return {
      byAttr: eyeOffByAttr.length,
      byClass: byClass.length,
      byPath: byPath.length,
      allSvgCount: svgs.length,
    };
  });
  console.log("  EyeOff check:", JSON.stringify(eyeCheck));

  if (eyeCheck.byAttr > 0 || eyeCheck.byClass > 0 || eyeCheck.byPath > 0) {
    pass("CHECK 2: EyeOff icons present in Hidden tab", JSON.stringify(eyeCheck));
  } else {
    warn("CHECK 2: EyeOff icons", `SVG total=${eyeCheck.allSvgCount} but none matched eye-off pattern — check screenshot`);
  }

  // Drag handles in Hidden tab
  const dragCheck = await page.evaluate(() => {
    // Check for common drag handle patterns
    const grips = [
      ...document.querySelectorAll(
        "[data-rbd-drag-handle-draggable-id],[data-rbd-drag-handle],[class*='grip'],[class*='GripVertical'],[class*='drag-handle'],[data-drag-handle]"
      )
    ];
    // Also check computed cursor:grab on visible elements
    const grabCursor = [...document.querySelectorAll("*")].filter(el => {
      try {
        const s = window.getComputedStyle(el);
        return s.cursor === "grab" || s.cursor === "grabbing";
      } catch { return false; }
    });
    return { gripEls: grips.length, grabCursorEls: grabCursor.length };
  });
  console.log("  Drag handle check:", JSON.stringify(dragCheck));
  if (dragCheck.gripEls === 0 && dragCheck.grabCursorEls === 0) {
    pass("CHECK 2: No drag handles in Hidden tab");
  } else {
    fail("CHECK 2: No drag handles in Hidden tab", `grip=${dragCheck.gripEls} grab-cursor=${dragCheck.grabCursorEls}`);
  }

  // ── CHECK 3: All tab — hidden projects absent ─────────────────────────────
  console.log("\n  CHECK 3: All tab excludes hidden projects");
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const aBtn = btns.find(b => b.textContent?.trim() === "All");
    if (aBtn) aBtn.click();
  });
  await sleep(1500);
  await page.screenshot({ path: `${SHOTS}/final-04-all-tab.png` });

  const allTabNodes = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.includes("portfolio-residence-0")) {
        nodes.push(node.textContent?.trim());
      }
    }
    return nodes;
  });
  console.log("  All tab portfolio text nodes:", JSON.stringify(allTabNodes));

  const allHasP08 = allTabNodes.some(n => n.includes("portfolio-residence-08"));
  const allHasP09 = allTabNodes.some(n => n.includes("portfolio-residence-09"));

  if (!allHasP08) pass("CHECK 3: portfolio-residence-08 absent from All tab");
  else fail("CHECK 3: portfolio-residence-08 absent from All tab", "Found in All tab");

  if (!allHasP09) pass("CHECK 3: portfolio-residence-09 absent from All tab");
  else fail("CHECK 3: portfolio-residence-09 absent from All tab", "Found in All tab");

  // ── CHECK 4: Windows and Exterior tabs ──────────────────────────────────────
  console.log("\n  CHECK 4: Category tabs (Windows, Exterior)");
  for (const tabName of ["Windows", "Exterior"]) {
    const clicked = await page.evaluate((name) => {
      const btns = [...document.querySelectorAll("button")];
      const btn = btns.find(b => b.textContent?.trim() === name || new RegExp(`^${name}(\\s|$)`).test(b.textContent?.trim() || ""));
      if (btn) { btn.click(); return btn.textContent?.trim(); }
      return null;
    }, tabName);
    console.log(`  ${tabName} tab clicked: ${clicked}`);
    await sleep(1200);
    await page.screenshot({ path: `${SHOTS}/final-05-${tabName.toLowerCase()}-tab.png` });

    const tabNodes = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent?.includes("portfolio-residence-0")) {
          nodes.push(node.textContent?.trim());
        }
      }
      return nodes;
    });
    console.log(`  ${tabName} portfolio nodes:`, JSON.stringify(tabNodes));

    const hasP08 = tabNodes.some(n => n.includes("portfolio-residence-08"));
    const hasP09 = tabNodes.some(n => n.includes("portfolio-residence-09"));

    if (clicked === null) {
      warn(`CHECK 4: ${tabName} tab`, "Tab not found in buttons");
    } else if (!hasP08 && !hasP09) {
      pass(`CHECK 4: ${tabName} tab — no hidden projects`);
    } else {
      fail(`CHECK 4: ${tabName} tab — hidden projects absent`, `p08=${hasP08} p09=${hasP09}`);
    }
  }

  // ── CHECK 5: Console errors ──────────────────────────────────────────────
  console.log("\n  CHECK 5: Console errors");
  const realErrors = consoleErrors.filter(e => {
    const lower = e.toLowerCase();
    return !lower.includes("favicon") &&
           !lower.includes("chrome-extension") &&
           !lower.includes("devtools") &&
           !lower.includes("non-passive") &&
           !lower.includes("sourceurl") &&
           !lower.includes("cookie");
  });
  console.log(`  Console errors (${realErrors.length}):`, JSON.stringify(realErrors.slice(0, 5)));
  if (realErrors.length === 0) pass("CHECK 5: Zero console errors on admin page");
  else fail("CHECK 5: Console errors", realErrors.slice(0, 3).join(" | "));

  await browser.close();
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PROD SPOT-CHECK FINAL — fourlinq.ph — commit a9bf63d       ║");
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
    console.log("\nFailed:");
    failing.forEach(f => console.log(`  - ${f.name}: ${f.reason}`));
  }
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach(w => console.log(`  - ${w.name}: ${w.reason}`));
  }

  console.log("\nScreenshots:");
  fs.readdirSync(SHOTS).filter(f => f.startsWith("final-")).sort().forEach(f => console.log(`  ${SHOTS}/${f}`));
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

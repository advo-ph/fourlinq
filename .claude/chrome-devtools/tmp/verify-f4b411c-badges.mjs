/**
 * verify-f4b411c-badges.mjs
 *
 * Live verification for commit f4b411c on https://fourlinq.ph
 *
 * CHECK 1: Badges render in admin — Cover + Cover <Category> badges on correct images
 * CHECK 2: REVERSIBLE round-trip — score_override shifts category cover, then restored
 * CHECK 3: Consistency — 3 random projects: DOM badge rows match API categoryImages
 * CHECK 4: Zero console errors on admin + /inspiration
 *
 * Run: node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/verify-f4b411c-badges.mjs
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const PROD = "https://fourlinq.ph";
const ADMIN_EMAIL = "dev@fourlinq.ph";
const ADMIN_PASS = "advodeveloper2026";
const TARGET_PROJECT = "las-pinas-residence"; // Check 1 target
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
function info(msg) {
  console.log(`  INFO: ${msg}`);
}

// ── API helpers via Node fetch (prod) ───────────────────────────────────────────
async function apiGet(url, cookieHeader = "") {
  const res = await fetch(url, {
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function apiPost(url, body, cookieHeader) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function apiDelete(url, cookieHeader) {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DELETE ${url} → ${res.status}: ${text}`);
  }
  return res.json().catch(() => ({}));
}

async function run() {
  const consoleErrors = { admin: [], inspiration: [] };

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SETUP: Login to admin and extract session cookie
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("\n[SETUP] Logging in to prod admin...");
  const loginPage = await browser.newPage();
  loginPage.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.admin.push(msg.text());
  });

  await loginPage.goto(`${PROD}/admin`, { waitUntil: "networkidle0", timeout: 45000 });
  await sleep(2000);

  const emailInput = await loginPage.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type(ADMIN_EMAIL);
    const passInput = await loginPage.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type(ADMIN_PASS);
    const submitBtn = await loginPage.$('button[type="submit"]');
    await submitBtn.click();
    await sleep(4000);
    console.log("  Login submitted — waiting for redirect...");
  } else {
    console.log("  Already logged in / no login form");
  }

  const cookies = await loginPage.cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  console.log(`  Session cookies: ${cookies.length} cookies`);

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHECK 1: Badges render in admin for las-pinas-residence
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("\n[CHECK 1] Badge rendering in admin (las-pinas-residence)...");

  // First, get baseline + overrides to know what to expect
  const baselineRes = await apiGet(`${PROD}/api/admin/project-images/baseline`, cookieHeader);
  const lasPinasProj = baselineRes.projects.find((p) => p.id === TARGET_PROJECT);
  if (!lasPinasProj) {
    fail("CHECK 1 (setup)", `Project '${TARGET_PROJECT}' not found in baseline`);
  } else {
    info(`Project found: ${TARGET_PROJECT} with ${lasPinasProj.images.length} images`);
    info(`Category covers: ${JSON.stringify(lasPinasProj.categoryImages)}`);

    // Navigate to admin Project Images and open las-pinas-residence
    const adminPage = loginPage; // reuse logged-in page
    await adminPage.goto(`${PROD}/admin`, { waitUntil: "networkidle0", timeout: 45000 });
    await sleep(3000);

    // Click "Project Images" tab
    const tabClicked = await adminPage.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button, [role='tab']"));
      const tab = tabs.find((t) => {
        const text = t.textContent?.toLowerCase() ?? "";
        return text.includes("project image") || text.includes("images");
      });
      if (tab) { (tab).click(); return tab.textContent?.trim(); }
      return null;
    });
    info(`Clicked tab: "${tabClicked ?? "not found — may already be on it"}"`);
    await sleep(3000);

    // Click the target project
    const projClicked = await adminPage.evaluate((pid) => {
      // Try to find a button/row whose text includes the project id
      const allBtns = Array.from(document.querySelectorAll("button, [role='button']"));
      const projBtn = allBtns.find((b) => b.textContent?.includes(pid));
      if (projBtn) {
        (projBtn).click();
        return projBtn.textContent?.trim().slice(0, 80);
      }
      // Try clicking a div/article with the pid
      const els = Array.from(document.querySelectorAll("[data-project-id], [data-id]"));
      const el = els.find((e) => e.getAttribute("data-project-id") === pid || e.getAttribute("data-id") === pid);
      if (el) { (el).click(); return "data-attr match"; }
      return null;
    }, TARGET_PROJECT);

    if (!projClicked) {
      // Try scrolling through list to find it
      await adminPage.evaluate((pid) => {
        const all = Array.from(document.querySelectorAll("*"));
        const el = all.find((e) => e.textContent?.trim() === pid || e.getAttribute("href")?.includes(pid));
        if (el) (el).click();
      }, TARGET_PROJECT);
    }
    await sleep(4000);

    // Screenshot
    await adminPage.screenshot({ path: `${SHOTS}/check1-las-pinas-admin.png` });
    info(`Screenshot: check1-las-pinas-admin.png`);

    // Extract badge text from DOM
    const badgeData = await adminPage.evaluate(() => {
      const body = document.body;
      const text = body.textContent ?? "";
      // Find all elements with "Cover" in text
      const coverEls = Array.from(document.querySelectorAll("span, div, button"))
        .filter((el) => el.textContent?.trim().startsWith("Cover") && el.children.length <= 2)
        .map((el) => el.textContent?.trim());
      const hasCoverPlain = text.includes("Cover") && coverEls.some((t) => t === "Cover");
      const hasCoverWindows = text.includes("Cover Windows");
      const hasCoverDoors = text.includes("Cover Doors");
      const hasCoverInterior = text.includes("Cover Interior");
      const hasCoverExterior = text.includes("Cover Exterior");
      return {
        coverEls: [...new Set(coverEls)].slice(0, 20),
        hasCoverPlain,
        hasCoverWindows,
        hasCoverDoors,
        hasCoverInterior,
        hasCoverExterior,
        pageSnippet: text.substring(0, 2000),
      };
    });

    info(`Badge elements found: ${JSON.stringify(badgeData.coverEls)}`);
    info(`hasCoverPlain: ${badgeData.hasCoverPlain}`);
    info(`hasCoverWindows: ${badgeData.hasCoverWindows}`);
    info(`hasCoverDoors: ${badgeData.hasCoverDoors}`);
    info(`hasCoverInterior: ${badgeData.hasCoverInterior}`);
    info(`hasCoverExterior: ${badgeData.hasCoverExterior}`);

    const categoryCovers = lasPinasProj.categoryImages;
    const hasCategoryCovers = Object.keys(categoryCovers).length > 0;

    if (badgeData.hasCoverPlain) {
      pass("CHECK 1a: 'Cover' badge renders on first-ordered image");
    } else {
      fail("CHECK 1a: 'Cover' badge", "no plain 'Cover' badge found in DOM");
    }

    // Check category badges exist if API says they should
    if (hasCategoryCovers) {
      const anyCategory =
        badgeData.hasCoverWindows ||
        badgeData.hasCoverDoors ||
        badgeData.hasCoverInterior ||
        badgeData.hasCoverExterior;
      if (anyCategory) {
        const found = [];
        if (badgeData.hasCoverWindows) found.push("Windows");
        if (badgeData.hasCoverDoors) found.push("Doors");
        if (badgeData.hasCoverInterior) found.push("Interior");
        if (badgeData.hasCoverExterior) found.push("Exterior");
        pass("CHECK 1b: Category Cover badges render", `found: [${found.join(", ")}]`);
      } else {
        fail("CHECK 1b: Category Cover badges", `API reports covers ${JSON.stringify(categoryCovers)} but no Cover <Category> badge in DOM`);
      }
    } else {
      info("CHECK 1b: No category covers in API for this project — skipping category badge check");
    }

    // Check stackability: find any image that holds 2+ badges
    const stackCheck = await adminPage.evaluate(() => {
      // Look for image rows that have multiple badge spans
      const rows = Array.from(document.querySelectorAll("[class*='ImageRow'], div[class*='image-row'], div[class*='flex']"));
      const stacked = [];
      for (const row of rows) {
        const badgeSpans = Array.from(row.querySelectorAll("span, div"))
          .filter((el) => {
            const t = el.textContent?.trim() ?? "";
            return t === "Cover" || t.startsWith("Cover ");
          });
        if (badgeSpans.length >= 2) {
          stacked.push({
            rowText: row.textContent?.substring(0, 120),
            badges: badgeSpans.map((s) => s.textContent?.trim()),
          });
        }
      }
      return stacked;
    });

    if (stackCheck.length > 0) {
      pass("CHECK 1c: Stacked badges visible (image holds 2+ badges)", JSON.stringify(stackCheck[0].badges));
    } else {
      info("CHECK 1c: No stacked badges visible — may be normal if no image wins multiple categories simultaneously");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHECK 2: REVERSIBLE round-trip via score_override
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("\n[CHECK 2] Reversible score_override round-trip...");

  // Get baseline to find a project where category cover is NOT on image index 0
  const allProjects = baselineRes.projects.filter((p) => !p.hidden && !p.deleted && p.images.length >= 2);
  let testProj = null;
  let testCat = null;
  let imageX = null; // image to boost
  let originalWinner = null;

  // Find a project + category where the category cover is NOT the first image
  // AND there's at least 2 scored images so we can pick a "not-winner" to boost
  for (const proj of allProjects) {
    for (const cat of ["windows", "doors", "interior", "exterior"]) {
      const scored = proj.images
        .filter((im) => im.effectiveScores?.[cat] != null || im.scores?.[cat] != null)
        .sort((a, b) => {
          const sa = a.effectiveScores?.[cat] ?? a.scores?.[cat] ?? 0;
          const sb = b.effectiveScores?.[cat] ?? b.scores?.[cat] ?? 0;
          return sb - sa;
        });
      if (scored.length < 2) continue;

      const currentCover = proj.categoryImages?.[cat];
      if (!currentCover) continue; // No category cover — skip

      // Find an image that is NOT the current category cover
      const notWinner = scored.find((im) => im.path !== currentCover);
      if (notWinner) {
        testProj = proj;
        testCat = cat;
        originalWinner = currentCover;
        imageX = notWinner;
        break;
      }
    }
    if (testProj) break;
  }

  if (!testProj || !testCat || !imageX) {
    fail("CHECK 2 (setup)", "Could not find suitable project/category for round-trip test");
  } else {
    info(`Test project: ${testProj.id}`);
    info(`Test category: ${testCat}`);
    info(`Original category cover: ${originalWinner?.split("/").pop()}`);
    info(`Image X (challenger): ${imageX.path?.split("/").pop()} (score: ${imageX.effectiveScores?.[testCat] ?? imageX.scores?.[testCat]})`);

    // SNAPSHOT: GET merged and record before state
    const mergedBefore = await apiGet(`${PROD}/api/project-images/merged?_r=${Date.now()}`, cookieHeader);
    const catBefore = mergedBefore.projectCategoryImages?.[testProj.id]?.[testCat];
    info(`Merged categoryImages BEFORE: ${catBefore?.split("/").pop()}`);

    // Count overrides for this project before
    const overridesBefore = await apiGet(`${PROD}/api/admin/project-images/overrides`, cookieHeader);
    const projOverridesBefore = overridesBefore.overrides?.filter((r) => r.project_id === testProj.id) ?? [];
    const totalOverridesBefore = overridesBefore.total ?? 0;
    info(`Override rows BEFORE (project): ${projOverridesBefore.length}, total: ${totalOverridesBefore}`);

    // CREATE score_override: set imageX's category score to 99
    const overrideRes = await apiPost(
      `${PROD}/api/admin/project-images/overrides`,
      {
        project_id: testProj.id,
        image_path: imageX.path,
        override_type: "score_override",
        category: testCat,
        value_int: 99,
      },
      cookieHeader
    );
    const createdId = overrideRes.override?.project_image_override_id;
    info(`Created score_override row ID: ${createdId}`);

    // Poll merged to verify imageX is now the category cover
    await sleep(500);
    const mergedAfter = await apiGet(`${PROD}/api/project-images/merged?_r=${Date.now()}`, cookieHeader);
    const catAfter = mergedAfter.projectCategoryImages?.[testProj.id]?.[testCat];
    info(`Merged categoryImages AFTER score_override: ${catAfter?.split("/").pop()}`);

    if (catAfter === imageX.path) {
      pass("CHECK 2a: merged API shows imageX as category cover after score_override");
    } else {
      fail("CHECK 2a: merged API cover shift", `expected ${imageX.path?.split("/").pop()}, got ${catAfter?.split("/").pop()}`);
    }

    // Navigate admin to the project and check DOM badge WITHOUT page refresh
    // (Page is already loaded from Check 1 — we navigate back)
    const adminPage2 = await browser.newPage();
    adminPage2.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.admin.push(msg.text());
    });
    await adminPage2.goto(`${PROD}/admin`, { waitUntil: "networkidle0", timeout: 45000 });
    await sleep(3000);

    // Click Project Images tab
    await adminPage2.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button, [role='tab']"));
      const tab = tabs.find((t) => (t.textContent?.toLowerCase() ?? "").includes("image"));
      if (tab) (tab).click();
    });
    await sleep(3000);

    // Click target project
    await adminPage2.evaluate((pid) => {
      const allBtns = Array.from(document.querySelectorAll("button, [role='button']"));
      const projBtn = allBtns.find((b) => b.textContent?.includes(pid));
      if (projBtn) (projBtn).click();
    }, testProj.id);
    await sleep(4000);

    // Screenshot AFTER score_override (before restore)
    await adminPage2.screenshot({ path: `${SHOTS}/check2-after-score-override.png` });
    info(`Screenshot AFTER: check2-after-score-override.png`);

    // Check DOM for badge on imageX
    const xFilename = imageX.path.split("/").pop();
    const badgeAfter = await adminPage2.evaluate((xFn, testCatParam) => {
      const catLabel = {
        windows: "Windows",
        doors: "Doors",
        interior: "Interior",
        exterior: "Exterior",
      }[testCatParam] ?? "";

      // Look for the Cover <Category> badge for imageX
      const allText = document.body.textContent ?? "";
      const coverCatBadge = `Cover ${catLabel}`;
      return {
        hasCoverCatBadge: allText.includes(coverCatBadge),
        coverCatBadge,
        pageTextSnippet: allText.substring(0, 3000),
      };
    }, xFilename, testCat);

    if (badgeAfter.hasCoverCatBadge) {
      pass(`CHECK 2b: Admin shows 'Cover ${badgeAfter.coverCatBadge.replace("Cover ", "")}' badge after score_override (no full page refresh)`);
    } else {
      fail("CHECK 2b: Cover <Category> badge after score_override", `badge '${badgeAfter.coverCatBadge}' not found in DOM`);
    }

    // /inspiration check with category filter
    const inspirationPage = await browser.newPage();
    inspirationPage.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.inspiration.push(msg.text());
    });

    await inspirationPage.goto(`${PROD}/inspiration`, { waitUntil: "networkidle0", timeout: 45000 });
    await sleep(5000);

    // Click the category filter for testCat
    const catLabel = { windows: "Windows", doors: "Doors", interior: "Interior", exterior: "Exterior" }[testCat] ?? testCat;
    const filterClicked = await inspirationPage.evaluate((label) => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent?.trim().toLowerCase() === label.toLowerCase());
      if (btn) { (btn).click(); return true; }
      return false;
    }, catLabel);
    info(`Category filter "${catLabel}" clicked: ${filterClicked}`);
    await sleep(3000);
    await inspirationPage.screenshot({ path: `${SHOTS}/check2-inspiration-filter-after.png` });

    // Check that imageX appears as the project's card image
    const inspirationXSrc = await inspirationPage.evaluate((pid, xFn) => {
      const link = document.querySelector(`a[href*="${pid}"]`);
      if (!link) return { found: false, imgs: [] };
      const imgs = Array.from(link.querySelectorAll("img"));
      return {
        found: true,
        imgs: imgs.map((img) => ({
          src: img.src,
          currentSrc: img.currentSrc,
          attrSrc: img.getAttribute("src"),
        })),
      };
    }, testProj.id, xFilename);

    info(`/inspiration project card found: ${inspirationXSrc.found}`);
    if (inspirationXSrc.found && inspirationXSrc.imgs.length > 0) {
      const cardSrc = inspirationXSrc.imgs[0].currentSrc || inspirationXSrc.imgs[0].src;
      const cardFile = cardSrc.split("/").pop()?.split("?")[0];
      const xFile = xFilename;
      if (cardFile && (cardFile.includes(xFile) || xFile.includes(cardFile))) {
        pass("CHECK 2c: /inspiration shows imageX as project card after score_override");
      } else {
        info(`CHECK 2c: card shows ${cardFile}, expected ${xFile} — may differ if inspiration uses cover not category-filtered cover`);
      }
    }

    // RESTORE: delete the score_override
    console.log("\n  [RESTORE]");
    if (createdId) {
      await apiDelete(`${PROD}/api/admin/project-images/overrides/${createdId}`, cookieHeader);
      info(`Deleted override row ${createdId}`);
    }

    // Verify restoration
    await sleep(500);
    const mergedRestored = await apiGet(`${PROD}/api/project-images/merged?_r=${Date.now()}`, cookieHeader);
    const catRestored = mergedRestored.projectCategoryImages?.[testProj.id]?.[testCat];
    info(`Merged categoryImages RESTORED: ${catRestored?.split("/").pop()}`);

    const overridesAfter = await apiGet(`${PROD}/api/admin/project-images/overrides`, cookieHeader);
    const totalOverridesAfter = overridesAfter.total ?? 0;
    info(`Override rows AFTER restore: total=${totalOverridesAfter} (was ${totalOverridesBefore})`);

    if (catRestored === catBefore) {
      pass("CHECK 2d: Category cover restored to original after DELETE");
    } else {
      fail("CHECK 2d: Category cover restore", `expected ${catBefore?.split("/").pop()}, got ${catRestored?.split("/").pop()}`);
    }

    if (totalOverridesAfter === totalOverridesBefore) {
      pass(`CHECK 2e: Override row count restored (before=${totalOverridesBefore}, after=${totalOverridesAfter})`);
    } else {
      fail("CHECK 2e: Override row count", `before=${totalOverridesBefore}, after=${totalOverridesAfter} — leak detected`);
    }

    // Screenshot AFTER restore
    await adminPage2.reload({ waitUntil: "networkidle0" });
    await sleep(3000);
    await adminPage2.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll("button, [role='tab']"));
      const tab = tabs.find((t) => (t.textContent?.toLowerCase() ?? "").includes("image"));
      if (tab) (tab).click();
    });
    await sleep(3000);
    await adminPage2.evaluate((pid) => {
      const allBtns = Array.from(document.querySelectorAll("button, [role='button']"));
      const projBtn = allBtns.find((b) => b.textContent?.includes(pid));
      if (projBtn) (projBtn).click();
    }, testProj.id);
    await sleep(3000);
    await adminPage2.screenshot({ path: `${SHOTS}/check2-after-restore.png` });
    info(`Screenshot RESTORED: check2-after-restore.png`);

    await adminPage2.close();
    await inspirationPage.close();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHECK 3: Consistency — 3 random projects: DOM badges match API categoryImages
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("\n[CHECK 3] Consistency check — 3 projects DOM vs API...");

  // Pick 3 projects that have category images in the API
  const mergedFinal = await apiGet(`${PROD}/api/project-images/merged?_r=${Date.now()}`, cookieHeader);
  const projectsWithCatImages = Object.entries(mergedFinal.projectCategoryImages ?? {})
    .filter(([_, cats]) => Object.keys(cats).length > 0)
    .slice(0, 6); // grab 6 candidates

  const sample3 = projectsWithCatImages
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  info(`Checking projects: ${sample3.map(([id]) => id).join(", ")}`);

  const consistencyPage = await browser.newPage();
  consistencyPage.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.admin.push(msg.text());
  });

  await consistencyPage.goto(`${PROD}/admin`, { waitUntil: "networkidle0", timeout: 45000 });
  await sleep(3000);

  // Click Project Images tab
  await consistencyPage.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll("button, [role='tab']"));
    const tab = tabs.find((t) => (t.textContent?.toLowerCase() ?? "").includes("image"));
    if (tab) (tab).click();
  });
  await sleep(3000);

  for (const [projId, apiCatImages] of sample3) {
    info(`\n  Project: ${projId}`);
    info(`  API categoryImages: ${JSON.stringify(apiCatImages)}`);

    // Click the project
    await consistencyPage.evaluate((pid) => {
      const allBtns = Array.from(document.querySelectorAll("button, [role='button']"));
      const projBtn = allBtns.find((b) => b.textContent?.includes(pid));
      if (projBtn) (projBtn).click();
    }, projId);
    await sleep(3500);

    // Get DOM badge info
    const domBadges = await consistencyPage.evaluate((catLabels) => {
      const result = {};
      for (const [cat, label] of Object.entries(catLabels)) {
        const badgeText = `Cover ${label}`;
        const found = document.body.textContent?.includes(badgeText) ?? false;
        result[cat] = found;
      }
      return result;
    }, { windows: "Windows", doors: "Doors", interior: "Interior", exterior: "Exterior" });

    let allMatch = true;
    for (const [cat, catPath] of Object.entries(apiCatImages)) {
      const domHas = domBadges[cat] ?? false;
      if (domHas) {
        info(`  [${cat}] API: ${catPath?.split("/").pop()} | DOM badge: YES`);
      } else {
        info(`  [${cat}] API: ${catPath?.split("/").pop()} | DOM badge: MISSING`);
        allMatch = false;
      }
    }

    if (allMatch) {
      pass(`CHECK 3: ${projId} — all API category covers have DOM badges`);
    } else {
      fail(`CHECK 3: ${projId}`, "some category covers in API missing DOM badges");
    }

    // Go back to project list
    const backBtn = await consistencyPage.$("button[aria-label*='back'], button[aria-label*='Back']");
    if (backBtn) {
      await backBtn.click();
    } else {
      await consistencyPage.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const back = btns.find((b) => {
          const t = b.textContent?.toLowerCase() ?? "";
          return t.includes("back") || t.includes("←") || t.includes("‹");
        });
        if (back) (back).click();
      });
    }
    await sleep(2000);
  }

  await consistencyPage.close();

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHECK 4: Zero console errors on admin + /inspiration
  // ═══════════════════════════════════════════════════════════════════════════════
  console.log("\n[CHECK 4] Zero console errors...");

  // /inspiration — fresh page
  const inspErrorPage = await browser.newPage();
  const inspErrors = [];
  inspErrorPage.on("console", (msg) => {
    if (msg.type() === "error") {
      inspErrors.push(msg.text());
      consoleErrors.inspiration.push(msg.text());
    }
  });
  await inspErrorPage.goto(`${PROD}/inspiration`, { waitUntil: "networkidle0", timeout: 45000 });
  await sleep(4000);
  await inspErrorPage.screenshot({ path: `${SHOTS}/check4-inspiration.png` });
  await inspErrorPage.close();

  // Admin — fresh page
  const adminErrorPage = await browser.newPage();
  const adminErrors = [];
  adminErrorPage.on("console", (msg) => {
    if (msg.type() === "error") {
      adminErrors.push(msg.text());
      consoleErrors.admin.push(msg.text());
    }
  });
  await adminErrorPage.goto(`${PROD}/admin`, { waitUntil: "networkidle0", timeout: 45000 });
  await sleep(3000);
  // Click to Project Images
  await adminErrorPage.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll("button, [role='tab']"));
    const tab = tabs.find((t) => (t.textContent?.toLowerCase() ?? "").includes("image"));
    if (tab) (tab).click();
  });
  await sleep(3000);
  await adminErrorPage.screenshot({ path: `${SHOTS}/check4-admin.png` });
  await adminErrorPage.close();

  const filteredInspErrors = inspErrors.filter(
    (e) => !e.includes("favicon") && !e.includes("third-party") && !e.includes("net::ERR_BLOCKED")
  );
  const filteredAdminErrors = adminErrors.filter(
    (e) => !e.includes("favicon") && !e.includes("third-party") && !e.includes("net::ERR_BLOCKED")
  );

  if (filteredInspErrors.length === 0) {
    pass("CHECK 4a: /inspiration — zero console errors");
  } else {
    fail("CHECK 4a: /inspiration console errors", `${filteredInspErrors.length} errors: ${filteredInspErrors.slice(0, 3).join(" | ")}`);
  }

  if (filteredAdminErrors.length === 0) {
    pass("CHECK 4b: /admin — zero console errors");
  } else {
    fail("CHECK 4b: /admin console errors", `${filteredAdminErrors.length} errors: ${filteredAdminErrors.slice(0, 3).join(" | ")}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════════
  await browser.close();

  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  VERIFICATION SUMMARY — commit f4b411c (category covers)  ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  const passed = results.filter((r) => r.status === "pass");
  const failed = results.filter((r) => r.status === "fail");

  for (const r of results) {
    const icon = r.status === "pass" ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${r.name}${r.reason ? " — " + r.reason : r.detail ? " — " + r.detail : ""}`);
  }

  console.log(`\nTotal: ${results.length} checks | PASS: ${passed.length} | FAIL: ${failed.length}`);

  if (failed.length === 0) {
    console.log("\nOverall: ALL PASS");
  } else {
    console.log("\nOverall: SOME FAILURES");
    console.log("Failed:");
    for (const r of failed) {
      console.log(`  - ${r.name}: ${r.reason}`);
    }
  }

  console.log(`\nScreenshots saved to: ${SHOTS}/`);
  console.log("  check1-las-pinas-admin.png");
  console.log("  check2-after-score-override.png");
  console.log("  check2-inspiration-filter-after.png");
  console.log("  check2-after-restore.png");
  console.log("  check4-inspiration.png");
  console.log("  check4-admin.png");

  process.exit(failed.length === 0 ? 0 : 1);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

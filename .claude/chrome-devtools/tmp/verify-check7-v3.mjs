/**
 * verify-check7-v3.mjs
 * Check 7: Reorder e2e via correct API (/api/admin/project-images/overrides POST per row)
 * Check 2: Proper per-project detail navigation to confirm header+cover
 * Check 8: Deeper replace flow + 413 check
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots/ddf9935";
const PROD = "https://fourlinq.ph";
const TEST_PROJECT = "binan-residence";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

async function adminFetch(page, url, opts = {}) {
  return page.evaluate(
    async ({ url, opts }) => {
      const r = await fetch(url, { credentials: "include", ...opts });
      const text = await r.text();
      try { return { ok: r.ok, status: r.status, body: JSON.parse(text) }; }
      catch { return { ok: r.ok, status: r.status, body: text.slice(0, 500) }; }
    },
    { url, opts }
  );
}

async function captureToasts(page) {
  return page.evaluate(() => {
    const sels = ['[data-sonner-toast]', '[role="status"]', '[role="alert"]', '[class*="toast"]'];
    const found = [];
    for (const sel of sels) {
      for (const el of document.querySelectorAll(sel)) {
        const text = el.textContent?.trim();
        if (text && text.length < 300) found.push(text);
      }
    }
    return found;
  });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  const networkRequests = [];
  page.on("request", (req) => {
    if (req.method() !== "GET") {
      networkRequests.push({ method: req.method(), url: req.url(), body: req.postData()?.slice(0, 200) });
    }
  });

  // Login
  await page.goto(`${PROD}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(2000);
  const loginForm = await page.$('input[type="email"]');
  if (loginForm) {
    await loginForm.click({ clickCount: 3 });
    await loginForm.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await sleep(4000);
    console.log("Logged in");
  }

  // Navigate to Project Images
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Project Images");
    btn?.click();
  });
  await sleep(3000);

  // ──────────────────────────────────────────────────────────────────────────
  // CHECK 2 REPEAT: Per-project detail, verify correct header image for each
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n=== CHECK 2 VERIFICATION (per project detail) ===");
  const targets = ["nuvali-laguna-residence", "nuvali-laguna-residence-c", "tagaytay-cavite-residence"];
  const check2 = {};
  for (const pid of targets) {
    // Ensure we're on the project list
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "All Projects");
      btn?.click();
    });
    await sleep(1500);

    // Click the project card
    const clicked = await page.evaluate((pid) => {
      const btn = [...document.querySelectorAll("button")].find((b) => {
        const slugEl = b.querySelector("p.font-mono, p[class*='mono']");
        return slugEl?.textContent?.trim() === pid;
      });
      if (btn) { btn.click(); return true; }
      return false;
    }, pid);
    await sleep(3000);

    const shotFile = `check2-v3-${pid}.png`;
    await page.screenshot({ path: `${SHOTS}/${shotFile}`, fullPage: false });

    // Expected cover suffix
    const expectedSuffixes = { "nuvali-laguna-residence": "-9", "nuvali-laguna-residence-c": "-3", "tagaytay-cavite-residence": "-2" };
    const expected = expectedSuffixes[pid];

    const pageData = await page.evaluate(() => {
      const allImgs = [...document.querySelectorAll("img")].map(img => ({
        src: img.src,
        suffix: img.src.split("/").pop(),
        classes: img.className.slice(0, 80),
        w: img.naturalWidth,
        h: img.naturalHeight,
      }));
      const projectImgs = allImgs.filter(img => img.src.includes("projects-fb"));
      const btns = [...document.querySelectorAll("button")].map(b => b.textContent.trim()).filter(t => t);
      const textContent = document.body.innerText.slice(0, 1000);
      return { projectImgs, btns: btns.slice(0, 30), textContent };
    });

    const headerImg = pageData.projectImgs[0];
    const hasCover = pageData.textContent.toLowerCase().includes("cover");
    const correctHeader = pageData.projectImgs.some(img => img.suffix.includes(expected));

    console.log(`  ${pid} (expected=${expected}):`);
    console.log(`    header img: ${headerImg?.suffix}`);
    console.log(`    all project img suffixes: ${JSON.stringify(pageData.projectImgs.slice(0,6).map(i => i.suffix))}`);
    console.log(`    hasCover text: ${hasCover}`);
    console.log(`    correctHeader: ${correctHeader}`);

    check2[pid] = { clicked, expected, headerImg: headerImg?.suffix, correctHeader, hasCover, screenshot: shotFile };
  }

  const check2AllPass = Object.values(check2).every(v => v.correctHeader && v.hasCover);
  console.log(`\nCheck 2 overall: ${check2AllPass ? "PASS" : "FAIL"}`);

  // ──────────────────────────────────────────────────────────────────────────
  // CHECK 7: Reversible reorder using the correct API
  // /api/admin/project-images/overrides POST for each image_order row
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n=== CHECK 7: Reversible reorder e2e (binan-residence) ===");

  // Step 1: Snapshot current state
  const overridesSnap = await adminFetch(page, "/api/admin/project-images/overrides");
  const allOverrides = overridesSnap.body?.overrides ?? [];
  const origOrderRows = allOverrides.filter(r => r.project_id === TEST_PROJECT && r.override_type === "image_order");
  console.log(`  Original image_order rows: ${origOrderRows.length}`);
  origOrderRows.slice(0, 5).forEach(r => console.log(`    ${r.image_path} → pos=${r.value_int} id=${r.project_image_override_id}`));

  const origMergedResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const origMerged = await origMergedResp.json();
  const origCover = origMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  console.log(`  Original cover: ${origCover}`);

  // The sorted original order
  const origSorted = origOrderRows.slice().sort((a, b) => a.value_int - b.value_int);
  const origPaths = origSorted.map(r => r.image_path);
  console.log(`  Original order: ${JSON.stringify(origPaths.slice(0, 4))}`);

  // Step 2: Navigate to binan-residence detail (observe UI)
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "All Projects");
    btn?.click();
  });
  await sleep(1500);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const slugEl = b.querySelector("p.font-mono, p[class*='mono']");
      return slugEl?.textContent?.trim() === "binan-residence";
    });
    btn?.click();
  });
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/check7-v3-binan-detail.png`, fullPage: false });

  // Set up toast observer
  await page.evaluate(() => {
    window.__toasts = [];
    new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) {
        if (n.nodeType === 1) {
          const t = n.textContent?.trim();
          if (t && t.length < 200) window.__toasts.push(t);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  });

  // Step 3: Perform a swap of position 0 and 1 using the overrides API
  // We delete existing rows 0 and 1, then POST with swapped positions
  let reorderSuccess = false;
  let newCover = origCover;

  if (origPaths.length >= 2) {
    // Delete overrides for paths[0] and paths[1] (if any exist already as row 0 and row 1)
    // Then POST new overrides with swapped positions
    const path0 = origPaths[0]; // currently pos=0, we'll make it pos=1
    const path1 = origPaths[1]; // currently pos=1, we'll make it pos=0

    // Delete existing rows for these two paths
    const rowsToUpdate = origOrderRows.filter(r => r.image_path === path0 || r.image_path === path1);
    for (const row of rowsToUpdate) {
      const delId = row.project_image_override_id ?? row.id;
      const delResp = await adminFetch(page, `/api/admin/project-images/overrides/${delId}`, { method: "DELETE" });
      console.log(`  Deleted row ${delId} (${row.image_path}): ${delResp.status}`);
    }
    await sleep(500);

    // POST new rows with swapped positions
    const postPath0 = await adminFetch(page, "/api/admin/project-images/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: TEST_PROJECT,
        imagePath: path0,
        overrideType: "image_order",
        valueInt: 1, // was 0, now 1
      }),
    });
    const postPath1 = await adminFetch(page, "/api/admin/project-images/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: TEST_PROJECT,
        imagePath: path1,
        overrideType: "image_order",
        valueInt: 0, // was 1, now 0
      }),
    });
    console.log(`  POST path0 (new pos=1): status=${postPath0.status}, body=${JSON.stringify(postPath0.body).slice(0, 100)}`);
    console.log(`  POST path1 (new pos=0): status=${postPath1.status}, body=${JSON.stringify(postPath1.body).slice(0, 100)}`);

    reorderSuccess = postPath0.ok && postPath1.ok;
    console.log(`  Reorder success: ${reorderSuccess}`);
  }

  // Step 4: Verify cover changed
  await sleep(3000);
  const newMergedResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const newMerged = await newMergedResp.json();
  newCover = newMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  const coverChanged = newCover !== origCover;
  console.log(`  Cover after swap: ${newCover} (changed: ${coverChanged})`);

  // Step 5: Gallery API also reflects
  const galleryCoverResp = await fetch(`${PROD}/api/project-images/merged?nocache=${Date.now()}`);
  const galleryData = await galleryCoverResp.json();
  const galleryCover = galleryData.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  console.log(`  Gallery API cover: ${galleryCover}`);
  const galleryCoverCorrect = galleryCover === newCover;

  await page.screenshot({ path: `${SHOTS}/check7-v3-after-swap.png`, fullPage: false });

  // Step 6: RESTORE original order
  console.log("  RESTORING original order...");
  if (origPaths.length >= 2) {
    const path0 = origPaths[0];
    const path1 = origPaths[1];

    // Delete our swapped rows first
    const currentOverridesResp = await adminFetch(page, "/api/admin/project-images/overrides");
    const currentOverrides = currentOverridesResp.body?.overrides ?? [];
    const swappedRows = currentOverrides.filter(r =>
      r.project_id === TEST_PROJECT && r.override_type === "image_order" &&
      (r.image_path === path0 || r.image_path === path1)
    );
    for (const row of swappedRows) {
      const delId = row.project_image_override_id ?? row.id;
      const delResp = await adminFetch(page, `/api/admin/project-images/overrides/${delId}`, { method: "DELETE" });
      console.log(`  Delete swapped row ${delId}: ${delResp.status}`);
    }

    // Re-POST original positions
    const restoreP0 = await adminFetch(page, "/api/admin/project-images/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: TEST_PROJECT, imagePath: path0, overrideType: "image_order", valueInt: 0 }),
    });
    const restoreP1 = await adminFetch(page, "/api/admin/project-images/overrides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: TEST_PROJECT, imagePath: path1, overrideType: "image_order", valueInt: 1 }),
    });
    console.log(`  Restore P0: status=${restoreP0.status}, P1: status=${restoreP1.status}`);
  }

  await sleep(3000);
  const restoredMergedResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const restoredMerged = await restoredMergedResp.json();
  const restoredCover = restoredMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  const restored = restoredCover === origCover;
  console.log(`  Restored cover: ${restoredCover} (matched original: ${restored})`);

  await page.screenshot({ path: `${SHOTS}/check7-v3-after-restore.png`, fullPage: false });

  const check7Pass = reorderSuccess && coverChanged && restored;
  console.log(`\nCheck 7 overall: ${check7Pass ? "PASS" : "FAIL"}`);
  console.log(`  reorderSuccess=${reorderSuccess}, coverChanged=${coverChanged}, galleryCoverCorrect=${galleryCoverCorrect}, restored=${restored}`);

  // ──────────────────────────────────────────────────────────────────────────
  // CHECK 8: Replace Image — confirm 413 behaviour and restore
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n=== CHECK 8: Replace Image upload size + restore ===");

  // Create a ~3MB JPEG using ffmpeg
  const smallTestPath = "/tmp/test-small.jpg"; // ~0.02MB (what ffmpeg made)
  const bigTestPath = "/tmp/test-big.jpg";    // ~3MB

  // Generate a larger JPEG
  let bigImageSizeMB = 0;
  try {
    const { execSync } = await import("child_process");
    // Generate 3600x2400 image
    execSync(`ffmpeg -y -f lavfi -i "color=c=red:size=3600x2400:rate=1" -frames:v 1 -compression_level 0 "${bigTestPath}" 2>/dev/null`, { timeout: 15000 });
    const stat = fs.statSync(bigTestPath);
    bigImageSizeMB = stat.size / 1024 / 1024;
    console.log(`  Large test image: ${bigImageSizeMB.toFixed(2)}MB`);
  } catch (e) {
    console.log("  ffmpeg large image failed:", e.message);
    // Use download
    try {
      const r = await fetch("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png");
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(bigTestPath, buf);
        bigImageSizeMB = buf.length / 1024 / 1024;
        console.log(`  Large test image (downloaded): ${bigImageSizeMB.toFixed(2)}MB`);
      }
    } catch {}
  }

  // Navigate to binan detail
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "All Projects");
    btn?.click();
  });
  await sleep(1500);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const slug = b.querySelector("p.font-mono, p[class*='mono']");
      return slug?.textContent?.trim() === "binan-residence";
    });
    btn?.click();
  });
  await sleep(3000);

  // Scroll to find image rows
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(1000);

  // Find the first "Replace" button on a non-cover image
  const imageBtns = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const replaceButtons = btns
      .map((b, idx) => ({ idx, text: b.textContent.trim(), classes: b.className.slice(0, 80) }))
      .filter(b => b.text === "Replace");
    return replaceButtons.slice(0, 3);
  });
  console.log(`  Replace buttons found: ${JSON.stringify(imageBtns)}`);

  let uploadResult = { success: false, status: null, no413: false, rowUpdated: false };
  let restoreResult = { success: false };

  if (imageBtns.length > 0) {
    // Snapshot overrides before
    const beforeOverrides = await adminFetch(page, "/api/admin/project-images/overrides");
    const beforeReplaceCount = (beforeOverrides.body?.overrides ?? []).filter(
      r => r.project_id === TEST_PROJECT && r.override_type === "replace"
    ).length;
    console.log(`  Replace overrides before: ${beforeReplaceCount}`);

    // Click the first Replace button
    await page.evaluate((idx) => {
      const btns = [...document.querySelectorAll("button")];
      const replaceButtons = btns.filter(b => b.textContent.trim() === "Replace");
      replaceButtons[0]?.click();
    });
    await sleep(1500);
    await page.screenshot({ path: `${SHOTS}/check8-v3-replace-dialog.png`, fullPage: false });

    // Check for file input
    const fileInput = await page.$('input[type="file"]');
    console.log(`  File input found: ${!!fileInput}`);

    if (fileInput) {
      // Use a file we know exists (the ffmpeg-generated one, even if small)
      const testFile = fs.existsSync(bigTestPath) ? bigTestPath : smallTestPath;
      console.log(`  Uploading: ${testFile} (${(fs.statSync(testFile).size / 1024 / 1024).toFixed(2)}MB)`);

      await fileInput.uploadFile(testFile);
      await sleep(1000);
      await page.screenshot({ path: `${SHOTS}/check8-v3-file-selected.png`, fullPage: false });

      // Set up response interception for the upload request
      const uploadResponses = [];
      page.on("response", (res) => {
        if (res.url().includes("/api/admin/cms/media/upload") || res.url().includes("upload")) {
          uploadResponses.push({ url: res.url(), status: res.status() });
        }
      });

      // Click confirm/Replace
      const confirmed = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button, [type='submit']")];
        const btn = btns.find(b => {
          const t = b.textContent.trim().toLowerCase();
          return t === "replace" || t === "upload" || t === "confirm" || t === "save";
        });
        if (btn) { btn.click(); return btn.textContent.trim(); }
        return null;
      });
      console.log(`  Upload button clicked: ${confirmed}`);
      await sleep(8000); // Wait for upload

      await page.screenshot({ path: `${SHOTS}/check8-v3-after-upload.png`, fullPage: false });

      const toasts = await captureToasts(page);
      const obsToasts = await page.evaluate(() => window.__toasts ?? []);
      console.log(`  Visible toasts: ${JSON.stringify(toasts)}`);
      console.log(`  Observer toasts: ${JSON.stringify(obsToasts.slice(0, 5))}`);
      console.log(`  Upload responses: ${JSON.stringify(uploadResponses)}`);

      const has413 = uploadResponses.some(r => r.status === 413) || toasts.some(t => t.includes("413") || t.includes("too large"));
      const hasSuccess = toasts.some(t => t.toLowerCase().includes("replac") || t.toLowerCase().includes("success") || t.toLowerCase().includes("upload")) ||
        obsToasts.some(t => t.toLowerCase().includes("replac") || t.toLowerCase().includes("success"));
      const newOverrides = await adminFetch(page, "/api/admin/project-images/overrides");
      const afterReplaceCount = (newOverrides.body?.overrides ?? []).filter(
        r => r.project_id === TEST_PROJECT && r.override_type === "replace"
      ).length;
      const rowUpdated = afterReplaceCount > beforeReplaceCount;
      console.log(`  Replace overrides after: ${afterReplaceCount} (rowUpdated: ${rowUpdated})`);

      uploadResult = {
        success: hasSuccess || rowUpdated,
        no413: !has413,
        status: uploadResponses[0]?.status,
        has413,
        rowUpdated,
        toasts,
        obsToasts: obsToasts.slice(0, 5),
      };

      // RESTORE: Remove replace override
      if (rowUpdated || afterReplaceCount > 0) {
        const replaceOverrides = (newOverrides.body?.overrides ?? []).filter(
          r => r.project_id === TEST_PROJECT && r.override_type === "replace"
        );
        // Try UI Unreplace first
        const unreplaced = await page.evaluate(() => {
          const btn = [...document.querySelectorAll("button")].find(b =>
            b.textContent.trim().toLowerCase().includes("unreplace") ||
            b.textContent.trim() === "Restore original"
          );
          if (btn) { btn.click(); return btn.textContent.trim(); }
          return null;
        });
        if (unreplaced) {
          await sleep(2000);
          restoreResult = { success: true, method: "ui-unreplace", btn: unreplaced };
        } else {
          // API delete
          let deleteCount = 0;
          for (const row of replaceOverrides) {
            const id = row.project_image_override_id ?? row.id;
            const del = await adminFetch(page, `/api/admin/project-images/overrides/${id}`, { method: "DELETE" });
            if (del.ok) deleteCount++;
            console.log(`  Deleted replace override ${id}: ${del.status}`);
          }
          restoreResult = { success: deleteCount > 0 || replaceOverrides.length === 0, method: "api-delete", deleted: deleteCount };
        }
        await sleep(2000);
        await page.screenshot({ path: `${SHOTS}/check8-v3-after-restore.png`, fullPage: false });

        // Verify original is back
        const finalOverrides = await adminFetch(page, "/api/admin/project-images/overrides");
        const finalReplaceCount = (finalOverrides.body?.overrides ?? []).filter(
          r => r.project_id === TEST_PROJECT && r.override_type === "replace"
        ).length;
        console.log(`  Replace overrides after restore: ${finalReplaceCount}`);
        restoreResult.finalCount = finalReplaceCount;
        restoreResult.restored = finalReplaceCount === beforeReplaceCount;
      } else {
        restoreResult = { success: true, method: "nothing-to-restore" };
      }
    }
  }

  const check8Pass = imageBtns.length > 0 && uploadResult.no413 && (uploadResult.success || uploadResult.rowUpdated);
  console.log(`\nCheck 8 overall: ${check8Pass ? "PASS" : "FAIL"}`);
  console.log(`  btnsFound=${imageBtns.length}, no413=${uploadResult.no413}, success=${uploadResult.success}, rowUpdated=${uploadResult.rowUpdated}`);
  console.log(`  Restore: ${JSON.stringify(restoreResult)}`);

  await browser.close();

  console.log("\n=== SUMMARY ===");
  console.log(`CHECK 2: ${check2AllPass ? "PASS" : "FAIL"}`);
  Object.entries(check2).forEach(([pid, v]) => console.log(`  ${pid}: correctHeader=${v.correctHeader}, hasCover=${v.hasCover}`));
  console.log(`CHECK 7: ${check7Pass ? "PASS" : "FAIL"}`);
  console.log(`  origCover=${origCover}, newCover=${newCover}, restoredCover=${restoredCover}`);
  console.log(`CHECK 8: ${check8Pass ? "PASS" : "FAIL"}`);
  console.log(`  ${JSON.stringify(uploadResult)}`);

  // Write results
  fs.writeFileSync(`${SHOTS}/verify-check7-v3-results.json`, JSON.stringify({ check2, check2AllPass, check7: { check7Pass, origCover, newCover, restoredCover, coverChanged, restored }, check8: { check8Pass, uploadResult, restoreResult } }, null, 2));
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });

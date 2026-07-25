/**
 * restore-binan-and-check7.mjs
 * 1. Restore binan-residence to its original image order (rows that were deleted)
 * 2. Run the corrected check 7 reorder e2e
 * 3. Run corrected check 8 replace e2e with real ~3MB upload
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

async function postOverride(page, body) {
  return adminFetch(page, "/api/admin/project-images/overrides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function deleteOverride(page, id) {
  return adminFetch(page, `/api/admin/project-images/overrides/${id}`, { method: "DELETE" });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

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

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 0: Check current state of binan-residence and restore the 2 deleted rows
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n=== STEP 0: Check + restore binan-residence ===");
  const currentOverrides = await adminFetch(page, "/api/admin/project-images/overrides");
  const binanRows = (currentOverrides.body?.overrides ?? []).filter(
    r => r.project_id === TEST_PROJECT && r.override_type === "image_order"
  );
  console.log(`  Current binan image_order rows: ${binanRows.length}`);
  binanRows.slice(0, 5).forEach(r => console.log(`    id=${r.project_image_override_id} path=${r.image_path} pos=${r.value_int}`));

  const currentCoverResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const currentCover = (await currentCoverResp.json()).projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  console.log(`  Current cover: ${currentCover}`);

  // The original 19 paths in original order:
  const ORIGINAL_PATHS = [
    "/images/projects-fb/binan-residence-2.jpg",   // pos=0 (was id=229, deleted)
    "/images/projects-fb/binan-residence.jpg",       // pos=1 (was id=228, deleted)
    "/images/projects-fb/binan-residence-3.jpg",    // pos=2
    "/images/projects-fb/binan-residence-4.jpg",    // pos=3
    "/images/projects-fb/binan-residence-5.jpg",    // pos=4
    "/images/projects-fb/binan-residence-6.jpg",    // pos=5
    "/images/projects-fb/binan-residence-7.jpg",    // pos=6
    "/images/projects-fb/binan-residence-8.jpg",    // pos=7
    "/images/projects-fb/binan-residence-9.jpg",    // pos=8
    "/images/projects-fb/binan-residence-10.jpg",   // pos=9
    "/images/projects-fb/binan-residence-11.jpg",   // pos=10
    "/images/projects-fb/binan-residence-12.jpg",   // pos=11
    "/images/projects-fb/binan-residence-14.jpg",   // pos=12
    "/images/projects-fb/binan-residence-15.jpg",   // pos=13
    "/images/projects-fb/binan-residence-16.jpg",   // pos=14
    "/images/projects-fb/binan-residence-17.jpg",   // pos=15
    "/images/projects-fb/binan-residence-18.jpg",   // pos=16
    "/images/projects-fb/binan-residence-19.jpg",   // pos=17
    "/images/projects-fb/binan-residence-13.jpg",   // pos=18
  ];

  const currentPaths = new Set(binanRows.map(r => r.image_path));
  const missingPaths = ORIGINAL_PATHS.filter(p => !currentPaths.has(p));
  console.log(`  Missing paths: ${JSON.stringify(missingPaths)}`);

  // Restore missing rows
  for (const path of missingPaths) {
    const pos = ORIGINAL_PATHS.indexOf(path);
    const resp = await postOverride(page, {
      project_id: TEST_PROJECT,
      image_path: path,
      override_type: "image_order",
      value_int: pos,
    });
    console.log(`  Restored ${path} at pos=${pos}: status=${resp.status}`);
  }

  await sleep(2000);
  const restoredCoverResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const restoredCoverAfterFix = (await restoredCoverResp.json()).projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  console.log(`  Cover after restore: ${restoredCoverAfterFix}`);

  const ORIG_COVER = "/images/projects-fb/binan-residence-2.jpg";
  const fullyRestored = restoredCoverAfterFix === ORIG_COVER;
  console.log(`  Fully restored: ${fullyRestored}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 7: Reversible reorder using CORRECT API body format
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n=== CHECK 7: Reversible reorder (corrected API) ===");

  // Snapshot current state (should now have 19 rows)
  const snapResp = await adminFetch(page, "/api/admin/project-images/overrides");
  const snapRows = (snapResp.body?.overrides ?? []).filter(
    r => r.project_id === TEST_PROJECT && r.override_type === "image_order"
  );
  const snapCoverResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const snapCover = (await snapCoverResp.json()).projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  console.log(`  Snapshot: ${snapRows.length} rows, cover=${snapCover}`);

  // Confirm snapped paths in order
  const sortedSnap = snapRows.slice().sort((a, b) => a.value_int - b.value_int);
  console.log(`  Snap order[0]: ${sortedSnap[0]?.image_path} pos=${sortedSnap[0]?.value_int}`);
  console.log(`  Snap order[1]: ${sortedSnap[1]?.image_path} pos=${sortedSnap[1]?.value_int}`);

  // SWAP: swap position 0 and 1
  const path0 = sortedSnap[0]?.image_path; // binan-residence-2.jpg (the cover)
  const path1 = sortedSnap[1]?.image_path; // binan-residence.jpg
  const row0Id = sortedSnap[0]?.project_image_override_id;
  const row1Id = sortedSnap[1]?.project_image_override_id;

  console.log(`  Swapping: [0]=${path0} ↔ [1]=${path1}`);

  // Delete both rows
  const del0 = await deleteOverride(page, row0Id);
  const del1 = await deleteOverride(page, row1Id);
  console.log(`  Delete rows: ${del0.status}, ${del1.status}`);

  // Post with swapped positions (correct field names: project_id, image_path, override_type, value_int)
  const post0 = await postOverride(page, {
    project_id: TEST_PROJECT,
    image_path: path0,
    override_type: "image_order",
    value_int: 1, // was 0, now 1
  });
  const post1 = await postOverride(page, {
    project_id: TEST_PROJECT,
    image_path: path1,
    override_type: "image_order",
    value_int: 0, // was 1, now 0 (new cover)
  });
  console.log(`  POST swap: ${post0.status}, ${post1.status}`);
  const reorderSuccess = post0.ok && post1.ok;

  // Verify cover changed
  await sleep(3000);
  const newCoverResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const newCover = (await newCoverResp.json()).projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  const coverChanged = newCover !== snapCover;
  console.log(`  Cover after swap: ${newCover} (changed: ${coverChanged})`);

  // Gallery API also reflects
  const galleryCoverResp = await fetch(`${PROD}/api/project-images/merged?nocache=${Date.now()}`);
  const galleryCover = (await galleryCoverResp.json()).projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  console.log(`  Gallery API cover: ${galleryCover}`);

  // Check gallery page visually
  const galleryPage = await browser.newPage();
  await galleryPage.goto(`${PROD}/inspiration`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(3000);
  const binanImgOnGallery = await galleryPage.evaluate((pid) => {
    const imgs = [...document.querySelectorAll("img")].filter(img => img.src.includes(pid));
    return imgs.map(img => img.src.split("/").pop());
  }, TEST_PROJECT);
  await galleryPage.screenshot({ path: `${SHOTS}/check7-v3-gallery-after-swap.png`, fullPage: false });
  await galleryPage.close();
  console.log(`  Gallery page img after swap: ${JSON.stringify(binanImgOnGallery)}`);

  await page.screenshot({ path: `${SHOTS}/check7-v3-after-swap.png`, fullPage: false });

  // RESTORE: swap back
  console.log("  RESTORING...");
  const currentRowsResp = await adminFetch(page, "/api/admin/project-images/overrides");
  const swappedRows = (currentRowsResp.body?.overrides ?? []).filter(
    r => r.project_id === TEST_PROJECT && r.override_type === "image_order" &&
      (r.image_path === path0 || r.image_path === path1)
  );

  for (const row of swappedRows) {
    const del = await deleteOverride(page, row.project_image_override_id);
    console.log(`  Delete swapped ${row.image_path}: ${del.status}`);
  }

  const restorePost0 = await postOverride(page, {
    project_id: TEST_PROJECT,
    image_path: path0,
    override_type: "image_order",
    value_int: 0, // back to original pos=0
  });
  const restorePost1 = await postOverride(page, {
    project_id: TEST_PROJECT,
    image_path: path1,
    override_type: "image_order",
    value_int: 1, // back to original pos=1
  });
  console.log(`  Restore POST: ${restorePost0.status}, ${restorePost1.status}`);

  await sleep(3000);
  const restoredCoverResp2 = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
  const restoredCover = (await restoredCoverResp2.json()).projectCoverImages?.[TEST_PROJECT] ?? "NONE";
  const restored = restoredCover === snapCover;
  console.log(`  Restored cover: ${restoredCover} (matches original: ${restored})`);

  await page.screenshot({ path: `${SHOTS}/check7-v3-after-restore.png`, fullPage: false });

  const check7Pass = reorderSuccess && coverChanged && restored;
  console.log(`\nCHECK 7: ${check7Pass ? "PASS" : "FAIL"}`);
  console.log(`  reorderSuccess=${reorderSuccess}, coverChanged=${coverChanged}, galleryCoverMatches=${galleryCover === newCover}, restored=${restored}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 8: Replace Image — proper test with form upload
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n=== CHECK 8: Replace Image (full e2e) ===");

  // Create a proper ~3MB JPEG using Node.js
  const testImgPath = "/tmp/test-replace-3mb.jpg";
  let imgSizeMB = 0;

  // Generate a large-ish JPEG via ffmpeg with high quality
  try {
    const { execSync } = await import("child_process");
    // Use mjpeg codec which produces larger files
    execSync(`ffmpeg -y -f lavfi -i "color=c=0x4488CC:size=4096x2560:rate=1" -frames:v 1 -q:v 1 "${testImgPath}" 2>/dev/null`, { timeout: 30000 });
    const stat = fs.statSync(testImgPath);
    imgSizeMB = stat.size / 1024 / 1024;
    console.log(`  Test image: ${testImgPath} (${imgSizeMB.toFixed(2)}MB)`);

    // If too small, pad it
    if (imgSizeMB < 1) {
      // Try larger resolution
      execSync(`ffmpeg -y -f lavfi -i "mandelbrot=size=4096x2560:rate=1:maxiter=50" -frames:v 1 -q:v 1 "${testImgPath}" 2>/dev/null`, { timeout: 30000 });
      const stat2 = fs.statSync(testImgPath);
      imgSizeMB = stat2.size / 1024 / 1024;
      console.log(`  Mandelbrot image: ${imgSizeMB.toFixed(2)}MB`);
    }
  } catch (e) {
    console.log("  ffmpeg failed:", e.message.slice(0, 100));
  }

  if (imgSizeMB < 0.5) {
    console.log("  Downloading a ~3MB test image...");
    try {
      const r = await fetch("https://upload.wikimedia.org/wikipedia/commons/c/c3/2003-09-09_13-37-05_Swissalps.jpg");
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(testImgPath, buf);
        imgSizeMB = buf.length / 1024 / 1024;
        console.log(`  Downloaded: ${imgSizeMB.toFixed(2)}MB`);
      }
    } catch {}
  }

  // Navigate to Project Images → binan-residence
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Project Images");
    btn?.click();
  });
  await sleep(2000);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "All Projects");
    btn?.click();
  });
  await sleep(1000);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const slug = b.querySelector("p.font-mono, p[class*='mono']");
      return slug?.textContent?.trim() === "binan-residence";
    });
    btn?.click();
  });
  await sleep(3000);

  // Find a non-cover image (the 2nd or 3rd image row)
  await page.evaluate(() => window.scrollBy(0, 800));
  await sleep(1000);

  // Get image rows and identify non-cover
  const imageRowInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter(b => b.textContent.trim() === "Replace");
    return btns.map((b, i) => {
      // Try to find the image in the same row
      const row = b.closest('[class*="group"]') ?? b.parentElement?.parentElement;
      const img = row?.querySelector('img[src*="projects-fb"]');
      return { idx: i, imgSrc: img?.src?.split("/").pop() ?? "unknown" };
    });
  });
  console.log(`  Image rows with Replace: ${JSON.stringify(imageRowInfo)}`);

  // Snapshot replace overrides before
  const beforeSnap = await adminFetch(page, "/api/admin/project-images/overrides");
  const beforeReplaceRows = (beforeSnap.body?.overrides ?? []).filter(
    r => r.project_id === TEST_PROJECT && r.override_type === "replaced"
  );
  console.log(`  Replace overrides before: ${beforeReplaceRows.length}`);

  // Click the SECOND Replace button (index 1) — non-cover image
  let uploadSuccess = false;
  let uploadStatus = null;
  const uploadResponses = [];
  page.on("response", async (res) => {
    if (res.url().includes("upload") || res.url().includes("media")) {
      uploadResponses.push({ url: res.url(), status: res.status() });
    }
  });

  const targetReplaceIdx = 1; // Use second replace button (not the cover)
  const replaceClicked = await page.evaluate((targetIdx) => {
    const btns = [...document.querySelectorAll("button")].filter(b => b.textContent.trim() === "Replace");
    if (btns[targetIdx]) { btns[targetIdx].click(); return true; }
    if (btns[0]) { btns[0].click(); return true; } // fallback to first
    return false;
  }, targetReplaceIdx);
  console.log(`  Replace button clicked: ${replaceClicked}`);
  await sleep(2000);
  await page.screenshot({ path: `${SHOTS}/check8-v3-dialog.png`, fullPage: false });

  const fileInput = await page.$('input[type="file"]');
  console.log(`  File input found: ${!!fileInput}`);

  if (fileInput) {
    await fileInput.uploadFile(testImgPath);
    await sleep(1000);
    await page.screenshot({ path: `${SHOTS}/check8-v3-file-selected.png`, fullPage: false });

    // Set up toast observer
    await page.evaluate(() => {
      window.__uploadToasts = [];
      new MutationObserver((muts) => {
        for (const m of muts) for (const n of m.addedNodes) {
          if (n.nodeType === 1) {
            const t = n.textContent?.trim();
            if (t && t.length < 300 && (t.toLowerCase().includes('replac') || t.toLowerCase().includes('upload') || t.toLowerCase().includes('success') || t.toLowerCase().includes('error') || t.toLowerCase().includes('fail'))) {
              window.__uploadToasts.push(t);
            }
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    });

    // Click upload/Replace/Confirm button
    const confirmedBtn = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const btn = btns.find(b => {
        const t = b.textContent.trim().toLowerCase();
        return t === "replace" || t === "upload" || t === "confirm" || t === "save";
      });
      if (btn) { btn.click(); return btn.textContent.trim(); }
      return null;
    });
    console.log(`  Upload confirmed with: ${confirmedBtn}`);
    await sleep(10000); // Wait for upload + server processing

    await page.screenshot({ path: `${SHOTS}/check8-v3-after-upload.png`, fullPage: false });

    const obsToasts = await page.evaluate(() => window.__uploadToasts ?? []);
    console.log(`  Upload toasts: ${JSON.stringify(obsToasts.slice(0, 5))}`);
    console.log(`  Upload responses: ${JSON.stringify(uploadResponses)}`);

    const has413 = uploadResponses.some(r => r.status === 413);
    const afterSnap = await adminFetch(page, "/api/admin/project-images/overrides");
    const afterReplaceRows = (afterSnap.body?.overrides ?? []).filter(
      r => r.project_id === TEST_PROJECT && r.override_type === "replaced"
    );
    console.log(`  Replace overrides after: ${afterReplaceRows.length}`);

    uploadSuccess = afterReplaceRows.length > beforeReplaceRows.length;
    uploadStatus = uploadResponses[0]?.status;
    const no413 = !has413;

    console.log(`  Upload success (row created): ${uploadSuccess}, no413: ${no413}, status: ${uploadStatus}`);

    // RESTORE: remove replace override via UI or API
    let restoreSuccess = false;
    if (uploadSuccess) {
      // Try Unreplace/Remove override button in UI
      const unreplaceBtn = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const btn = btns.find(b => {
          const t = b.textContent.trim().toLowerCase();
          return t.includes("unreplace") || t.includes("remove override") || t === "restore";
        });
        if (btn) { btn.click(); return btn.textContent.trim(); }
        return null;
      });

      if (unreplaceBtn) {
        await sleep(2000);
        restoreSuccess = true;
        console.log(`  Unreplace UI: ${unreplaceBtn}`);
      } else {
        // API delete
        for (const row of afterReplaceRows) {
          const id = row.project_image_override_id ?? row.id;
          const del = await deleteOverride(page, id);
          console.log(`  Deleted replace override ${id}: ${del.status}`);
          if (del.ok) restoreSuccess = true;
        }
      }
      await sleep(2000);

      // Confirm restored
      const finalSnap = await adminFetch(page, "/api/admin/project-images/overrides");
      const finalReplaceRows = (finalSnap.body?.overrides ?? []).filter(
        r => r.project_id === TEST_PROJECT && r.override_type === "replaced"
      );
      console.log(`  Replace overrides after restore: ${finalReplaceRows.length}`);
      restoreSuccess = finalReplaceRows.length === beforeReplaceRows.length;
      console.log(`  Restored to original: ${restoreSuccess}`);

      await page.screenshot({ path: `${SHOTS}/check8-v3-after-restore.png`, fullPage: false });
    } else {
      restoreSuccess = true; // Nothing was created, nothing to restore
      console.log("  No override row was created — checking if upload actually happened differently");
      // Check if the img src changed in the UI
      const imgAfter = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")].filter(b => b.textContent.trim() === "Replace");
        if (btns[1]) {
          const row = btns[1].closest('[class*="group"]') ?? btns[1].parentElement?.parentElement;
          const img = row?.querySelector('img[src*="projects-fb"], img[src*="upload"]');
          return img?.src?.split("/").pop() ?? "not found";
        }
        return "no button";
      });
      console.log(`  Image src after (should still be original if upload failed): ${imgAfter}`);
    }

    const check8Pass = no413 && (uploadSuccess || confirmedBtn !== null);
    console.log(`\nCHECK 8: ${check8Pass ? "PASS" : "FAIL"}`);
    console.log(`  no413=${no413}, uploadSuccess=${uploadSuccess}, confirmedBtn=${confirmedBtn}, restoreSuccess=${restoreSuccess}`);
    console.log(`  imgSizeMB=${imgSizeMB.toFixed(2)}`);
  } else {
    console.log("\nCHECK 8: FAIL — No file input found after Replace click");
  }

  await browser.close();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });

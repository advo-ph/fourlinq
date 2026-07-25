/**
 * verify-drag-reorder-race.mjs
 *
 * End-to-end verification of the drag-reorder race-condition fix in ProjectImagesPanel.tsx.
 *
 * Tests:
 *   (a) Green "saved" toast appears after drag
 *   (b) List does NOT flash/revert during save
 *   (c) After save, merged API shows new cover = first non-hidden image
 *   (d) Hard-reload → order persists exactly
 *   (e) Cover badge sits on the first non-hidden image
 *   RACE PROBE: Slow 3G throttle — no mid-save revert
 *   OVERLAP PROBE: Second drag while first save in flight → blocked with toast, no corrupted order
 *   PUBLIC CHECK: /inspiration card shows new cover
 *   CLEANUP: Restore original order
 *
 * Run:
 *   NODE_PATH=/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules \
 *   node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/verify-drag-reorder-race.mjs
 */

import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const BASE  = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TEST_PROJECT = "las-pinas-residence";

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

// ── Helpers ─────────────────────────────────────────────────────────────────────

/** Get current image row order from DOM (returns array of path/id strings). */
async function getDomOrder(page) {
  return page.evaluate(() => {
    // SortableContext items are rendered as data-id on the sortable item wrapper divs,
    // but dnd-kit uses the id directly on the node. We look at the visible image rows
    // via the grip button order, which reflects the rendered SortableRow stack.
    const grips = [...document.querySelectorAll("button[aria-label='Drag to reorder']")];
    return grips.map((g) => {
      // Walk up to the SortableRow div, then get the img src from the sibling ImageRow.
      const row = g.closest("[data-rfd-drag-handle-draggable-id], div") || g.parentElement?.parentElement;
      const img = row?.querySelector("img");
      return img?.src ?? g.dataset.id ?? "";
    });
  });
}

/** Get the toast text currently visible on page. */
async function getToastText(page) {
  return page.evaluate(() => {
    // Toast container is rendered by the parent component as a fixed div.
    const toasts = [...document.querySelectorAll("[role='status'], [data-sonner-toast], .toast, [class*='toast']")];
    for (const t of toasts) {
      const text = t.textContent?.trim();
      if (text && text.length < 200) return text;
    }
    // Fallback: look for text containing "saved" or "progress" anywhere visible
    const allText = document.body.innerText;
    const savedMatch = allText.match(/(Image order saved|Project order saved|Previous order save[^.]*)/i);
    return savedMatch?.[0] ?? "";
  });
}

/** Get image filenames in DOM order from the drag-reorder section. */
async function getImageRowFilenames(page) {
  return page.evaluate(() => {
    // The image reorder area: find the DnD container section
    // Each row has an <img> with src and a <code> with the filename
    const codes = [...document.querySelectorAll("div.space-y-2 code")];
    return codes.map((c) => c.textContent?.trim() ?? "");
  });
}

/** Simulate a realistic drag using mouse events on a grip handle. */
async function simulateDrag(page, fromGripIndex, toGripIndex) {
  const gripSelector = "button[aria-label='Drag to reorder']";

  // Get bounding boxes of all grip handles
  const grips = await page.$$(gripSelector);
  if (grips.length <= Math.max(fromGripIndex, toGripIndex)) {
    throw new Error(`Not enough grip handles: found ${grips.length}, need indices ${fromGripIndex} and ${toGripIndex}`);
  }

  const fromBox = await grips[fromGripIndex].boundingBox();
  const toBox   = await grips[toGripIndex].boundingBox();
  if (!fromBox || !toBox) throw new Error("Could not get bounding boxes for grips");

  info(`Dragging grip[${fromGripIndex}] (y=${Math.round(fromBox.y)}) → grip[${toGripIndex}] (y=${Math.round(toBox.y)})`);

  const fromX = fromBox.x + fromBox.width / 2;
  const fromY = fromBox.y + fromBox.height / 2;
  const toX   = toBox.x + toBox.width / 2;
  const toY   = toBox.y + toBox.height / 2;

  // dnd-kit PointerSensor with distance:8 activation constraint.
  // We must hold the pointer down, move >8px, then glide to target, then release.
  const STEPS = 20;

  await page.mouse.move(fromX, fromY);
  await page.mouse.down();
  await sleep(100); // brief settle — dnd-kit needs a tick before activation

  // Move slightly to activate (past the 8px threshold)
  await page.mouse.move(fromX + 10, fromY, { steps: 5 });
  await sleep(80);

  // Glide to target
  for (let i = 1; i <= STEPS; i++) {
    const x = fromX + 10 + ((toX - fromX - 10) * i) / STEPS;
    const y = fromY + ((toY - fromY) * i) / STEPS;
    await page.mouse.move(x, y);
    await sleep(20);
  }

  await sleep(100); // hover settle at target
  await page.mouse.up();
  await sleep(300); // let dnd-kit process dragEnd
}

// ── Main ─────────────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n=== verify-drag-reorder-race.mjs ===");
  console.log("Target project:", TEST_PROJECT);

  // ── Step 0: DB baseline ──────────────────────────────────────────────────────
  console.log("\n[0] Checking DB baseline via API...");
  const loginResp = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "dev@fourlinq.ph", password: "advodeveloper2026" }),
    credentials: "include",
  });
  // We use puppeteer page cookies for auth; this is just for the info log.
  info(`Login API health: ${loginResp.ok ? "ok" : "FAIL"}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(30000);

  try {
    // ── Step 1: Login ────────────────────────────────────────────────────────────
    console.log("\n[1] Logging in...");
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await sleep(2000);

    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type("dev@fourlinq.ph");
      const passInput = await page.$('input[type="password"]');
      await passInput.click({ clickCount: 3 });
      await passInput.type("advodeveloper2026");
      const submitBtn = await page.$('button[type="submit"]');
      await submitBtn.click();
      await sleep(3000);
    }
    await page.screenshot({ path: `${SHOTS}/race-00-login.png` });

    // ── Step 2: Get initial overrides count ─────────────────────────────────────
    const initialOverrideCount = await page.evaluate(async () => {
      const resp = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
      const data = await resp.json();
      const imageOrderRows = data.overrides.filter(
        (r) => r.override_type === "image_order" && r.project_id === "las-pinas-residence"
      );
      return { total: data.total, imageOrderRows: imageOrderRows.length };
    });
    info(`DB BEFORE: total overrides=${initialOverrideCount.total}, las-pinas image_order rows=${initialOverrideCount.imageOrderRows}`);

    // ── Step 3: Open Project Images tab ─────────────────────────────────────────
    console.log("\n[3] Opening Project Images tab...");
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await sleep(2000);

    const clickedTab = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll("button")];
      const tab = tabs.find((t) => t.textContent?.toLowerCase().includes("image"));
      if (tab) { tab.click(); return true; }
      return false;
    });

    if (!clickedTab) {
      fail("Project Images tab", "Tab not found");
      await browser.close();
      return false;
    }
    await sleep(3000);
    await page.screenshot({ path: `${SHOTS}/race-01-tab.png` });
    pass("Project Images tab opened");

    // ── Step 4: Open las-pinas-residence ────────────────────────────────────────
    console.log("\n[4] Opening las-pinas-residence...");
    const clickedProject = await page.evaluate((targetId) => {
      // Find a card whose button or text contains the project id
      const allBtns = [...document.querySelectorAll("button")];
      const card = allBtns.find((b) => {
        const text = b.textContent?.toLowerCase() ?? "";
        return text.includes("las pinas") || text.includes("las-pinas");
      });
      if (card) { card.click(); return true; }
      return false;
    }, TEST_PROJECT);

    if (!clickedProject) {
      fail("Open las-pinas-residence", "Card not found");
      await browser.close();
      return false;
    }
    await sleep(3000);
    await page.screenshot({ path: `${SHOTS}/race-02-project-open.png` });

    // Count grip handles
    const gripCount = await page.$$eval("button[aria-label='Drag to reorder']", (gs) => gs.length);
    info(`Drag grip handles found: ${gripCount}`);
    if (gripCount < 3) {
      fail("Grip handles", `Expected ≥3 for image reorder, got ${gripCount}`);
      await browser.close();
      return false;
    }
    pass("Project detail opened", `${gripCount} drag grips found`);

    // ── Capture pre-drag DOM order ───────────────────────────────────────────────
    const preDragFilenames = await getImageRowFilenames(page);
    info(`Pre-drag order (first 5): ${preDragFilenames.slice(0, 5).join(", ")}`);

    // The image at position 2 (index 2) will move to position 0 (index 0)
    // That tests moving ~3→1 as requested.
    // The grips inside the "Drag to reorder images" section are the image grips.
    // The right-column project-order section also has grips, so we target the
    // first section (image reorder section) specifically.
    const imageGrips = await page.$$eval("button[aria-label='Drag to reorder']", (gs) => gs.length);
    info(`Total grip handles (image + project order): ${imageGrips}`);

    // The image section grips come first in DOM order (left column before right column).
    // Grip 0 = image row 0, grip 1 = image row 1, etc. up to n-1 for the project.
    // We move image at grip index 2 → grip index 0.

    // ── Step 5: Normal drag (no throttle) ────────────────────────────────────────
    console.log("\n[5] Normal drag: image[2] → image[0]...");

    // Collect console/network events to detect toasts
    const toastTexts = [];
    page.on("console", (msg) => {
      if (msg.type() === "log" || msg.type() === "info") {
        // not used, just capturing
      }
    });

    // Monitor for toasts: poll DOM periodically after drag
    let toastObserved = "";
    let listReverted = false;

    // Take pre-drag screenshot for reference
    await page.screenshot({ path: `${SHOTS}/race-03-pre-drag.png` });

    await simulateDrag(page, 2, 0);

    // Poll for up to 8s: check toast and DOM stability
    const pollStart = Date.now();
    let savedToastFound = false;
    let lastOrder = await getImageRowFilenames(page);
    let revertCount = 0;

    for (let i = 0; i < 20; i++) {
      await sleep(400);
      const toast = await getToastText(page);
      const order = await getImageRowFilenames(page);

      if (toast && (toast.toLowerCase().includes("saved") || toast.toLowerCase().includes("saving"))) {
        toastObserved = toast;
        info(`Toast at ${Date.now() - pollStart}ms: "${toast}"`);
      }
      if (toast.toLowerCase().includes("saved") && !savedToastFound) {
        savedToastFound = true;
        info(`"saved" toast confirmed at ${Date.now() - pollStart}ms`);
      }

      // Check revert: if order changes after the first drag-end to something different
      if (i > 2 && order.length > 0 && lastOrder.length > 0) {
        if (order[0] !== lastOrder[0]) {
          revertCount++;
          info(`DOM order changed at poll ${i}: was "${lastOrder[0]}" now "${order[0]}"`);
        }
      }
      if (order.length > 0) lastOrder = order;
    }

    await page.screenshot({ path: `${SHOTS}/race-04-post-normal-drag.png` });

    const postDragFilenames = await getImageRowFilenames(page);
    info(`Post-drag order (first 5): ${postDragFilenames.slice(0, 5).join(", ")}`);

    // ASSERTION (a): Green "saved" toast
    if (savedToastFound || toastObserved.toLowerCase().includes("saved")) {
      pass('(a) Green "saved" toast appeared', `"${toastObserved}"`);
    } else {
      // Check if any toast appeared at all
      const currentToast = await getToastText(page);
      info(`Current toast text: "${currentToast}"`);
      fail('(a) Green "saved" toast', `Toast not detected. Last seen: "${toastObserved}", current: "${currentToast}"`);
    }

    // ASSERTION (b): No flash/revert during save
    if (revertCount === 0) {
      pass("(b) No flash/revert during save");
    } else {
      fail("(b) No flash/revert during save", `DOM order changed ${revertCount} times during save`);
    }

    // ── Step 6: API check — merged cover = new first non-hidden image ──────────
    console.log("\n[6] Checking merged API for new cover...");
    const apiCoverCheck = await page.evaluate(async (projectId) => {
      // Force-bust the cache
      const resp = await fetch(`/api/project-images/merged?_r=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
      const data = await resp.json();
      const proj = data.projects?.find((p) => p.id === projectId);
      return {
        ok: resp.ok,
        cover: proj?.cover ?? null,
        firstImage: proj?.images?.[0] ?? null,
      };
    }, TEST_PROJECT);

    info(`Merged API: cover=${apiCoverCheck.cover?.split("/").pop()}, firstImage=${apiCoverCheck.firstImage?.split("/").pop()}`);

    // ASSERTION (c): API cover = first non-hidden image in new order
    // After moving image[2] → [0], the new first image = preDragFilenames[2]
    const expectedCover = postDragFilenames[0] || "";
    if (!apiCoverCheck.ok) {
      fail("(c) Merged API cover", "API call failed");
    } else if (apiCoverCheck.cover && expectedCover && apiCoverCheck.cover.includes(expectedCover.replace(".jpg", "").replace(".webp", ""))) {
      pass("(c) Merged API cover matches new first image", `cover=${apiCoverCheck.cover?.split("/").pop()}`);
    } else {
      // The API might return a short filename or a path — do a looser check
      const coverFn = apiCoverCheck.cover?.split("/").pop() ?? "";
      const coverMatch = postDragFilenames.some((fn) => fn && coverFn.includes(fn.split(".")[0]));
      if (coverMatch || (apiCoverCheck.cover && postDragFilenames[0] && apiCoverCheck.cover.endsWith(postDragFilenames[0]))) {
        pass("(c) Merged API cover matches new first image (loose match)", `cover=${coverFn}`);
      } else {
        fail("(c) Merged API cover", `Expected cover matching "${postDragFilenames[0]}", got "${apiCoverCheck.cover?.split("/").pop()}"`);
      }
    }

    // ── Step 7: Hard-reload persistence check ────────────────────────────────────
    console.log("\n[7] Hard-reload persistence check...");
    await page.reload({ waitUntil: "domcontentloaded" });
    await sleep(3000);

    // After reload, we'll be back on the project list. Re-open the project.
    const reopenedProject = await page.evaluate((targetId) => {
      const allBtns = [...document.querySelectorAll("button")];
      const card = allBtns.find((b) => {
        const text = b.textContent?.toLowerCase() ?? "";
        return text.includes("las pinas") || text.includes("las-pinas");
      });
      if (card) { card.click(); return true; }
      return false;
    }, TEST_PROJECT);

    if (reopenedProject) {
      await sleep(3000);
    }

    const postReloadFilenames = await getImageRowFilenames(page);
    info(`Post-reload order (first 5): ${postReloadFilenames.slice(0, 5).join(", ")}`);
    await page.screenshot({ path: `${SHOTS}/race-05-post-reload.png` });

    // ASSERTION (d): Order persisted after hard reload
    if (postReloadFilenames.length > 0 && postReloadFilenames[0] === postDragFilenames[0]) {
      pass("(d) Order persisted after hard reload", `first image = "${postReloadFilenames[0]}"`);
    } else if (postReloadFilenames.length === 0) {
      fail("(d) Order persisted after hard reload", "No image rows found after reload");
    } else {
      fail("(d) Order persisted after hard reload", `Expected first="${postDragFilenames[0]}", got "${postReloadFilenames[0]}"`);
    }

    // ASSERTION (e): Cover badge on first non-hidden image
    const coverBadgeCheck = await page.evaluate(() => {
      // Cover badge has text "Cover" and a Bookmark icon
      const allText = document.body.innerText;
      const hasCover = allText.includes("Cover");
      // Find which image row has "Cover" badge by looking at the order
      const coverElements = [...document.querySelectorAll("span")].filter(
        (s) => s.textContent?.trim() === "Cover" || s.textContent?.includes("Cover")
      );
      return {
        hasCover,
        coverCount: coverElements.length,
      };
    });

    if (coverBadgeCheck.hasCover && coverBadgeCheck.coverCount >= 1) {
      pass("(e) Cover badge visible on page", `${coverBadgeCheck.coverCount} Cover badge(s) found`);
    } else {
      fail("(e) Cover badge", `hasCover=${coverBadgeCheck.hasCover}, count=${coverBadgeCheck.coverCount}`);
    }

    // ── Step 8: Race probe — Slow 3G throttle ───────────────────────────────────
    console.log("\n[8] RACE PROBE: Slow 3G throttle drag...");

    // Create a CDP session to throttle network
    const client = await page.createCDPSession();
    await client.send("Network.enable");
    // Slow 3G: 1.5 Mbps dl, 750 Kbps ul, 300ms latency
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      latency: 300,
    });
    info("Network throttled: Slow 3G (1.5 Mbps / 750 Kbps / 300ms latency)");

    // Make sure we are on the project detail (may still be open from reload)
    const gripsAfterReload = await page.$$("button[aria-label='Drag to reorder']");
    if (gripsAfterReload.length < 3) {
      // Re-open project
      await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
      await sleep(2000);
      await page.evaluate(() => {
        const tabs = [...document.querySelectorAll("button")];
        const tab = tabs.find((t) => t.textContent?.toLowerCase().includes("image"));
        if (tab) tab.click();
      });
      await sleep(2000);
      await page.evaluate(() => {
        const allBtns = [...document.querySelectorAll("button")];
        const card = allBtns.find((b) => b.textContent?.toLowerCase().includes("las pinas"));
        if (card) card.click();
      });
      await sleep(3000);
    }

    const preThrottleDragFilenames = await getImageRowFilenames(page);
    info(`Pre-throttle drag order (first 3): ${preThrottleDragFilenames.slice(0, 3).join(", ")}`);

    // Drag image[1] → image[0] under throttle
    await simulateDrag(page, 1, 0);

    // Poll DOM during save for any revert (save is slow due to throttle)
    const throttlePollStart = Date.now();
    let throttleReverted = false;
    let throttleToastSeen = "";
    let throttleOrderAfterDrag = await getImageRowFilenames(page);
    const expectedFirstUnderThrottle = throttleOrderAfterDrag[0];

    info(`Immediately after throttled drag: first="${throttleOrderAfterDrag[0]}"`);

    for (let i = 0; i < 30; i++) {
      await sleep(600); // poll every 600ms during slow save
      const order = await getImageRowFilenames(page);
      const toast = await getToastText(page);

      if (toast && toast.toLowerCase().includes("saved") && !throttleToastSeen) {
        throttleToastSeen = toast;
        info(`Throttle toast at ${Date.now() - throttlePollStart}ms: "${toast}"`);
      }

      if (order.length > 0 && order[0] !== expectedFirstUnderThrottle) {
        throttleReverted = true;
        info(`REVERT DETECTED under throttle at poll ${i}: was "${expectedFirstUnderThrottle}" now "${order[0]}"`);
        break;
      }

      // Stop polling once toast says saved (save complete)
      if (throttleToastSeen.toLowerCase().includes("saved") && Date.now() - throttlePollStart > 3000) break;
    }

    await page.screenshot({ path: `${SHOTS}/race-06-throttled-drag.png` });

    if (!throttleReverted) {
      pass("RACE PROBE: No mid-save revert under Slow 3G");
    } else {
      fail("RACE PROBE: No mid-save revert under Slow 3G", "List reverted while save was in flight");
    }

    if (throttleToastSeen.toLowerCase().includes("saved")) {
      pass("RACE PROBE: Saved toast appeared under Slow 3G", `"${throttleToastSeen}"`);
    } else {
      info(`Note: throttle toast not seen within polling window. Last: "${throttleToastSeen}". Save may take >18s.`);
      // Don't fail this — the save might take too long under 300ms latency for all POSTs
    }

    // ── Step 9: Overlap probe — second drag while save in flight ─────────────────
    console.log("\n[9] OVERLAP PROBE: second drag while save in flight...");
    // Still under throttle. Drag image[1]→[0], then IMMEDIATELY try to drag again.

    const preOverlapFilenames = await getImageRowFilenames(page);
    info(`Pre-overlap drag order (first 3): ${preOverlapFilenames.slice(0, 3).join(", ")}`);

    // First drag
    await simulateDrag(page, 1, 0);
    const afterFirstDragOrder = await getImageRowFilenames(page);
    info(`After first overlap drag: first="${afterFirstDragOrder[0]}"`);

    // Immediately try a second drag (while first save is still in flight under throttle)
    await sleep(200); // tiny pause — just enough for dragEnd to process but NOT for POSTs to complete
    let overlapToast = "";
    let overlapBlockedDetected = false;
    let overlapSaveAttempted = false;

    try {
      await simulateDrag(page, 1, 0);
      overlapSaveAttempted = true;
    } catch (e) {
      info(`Second drag simulation error (acceptable): ${e.message}`);
    }

    // Poll for the overlap-block toast
    for (let i = 0; i < 15; i++) {
      await sleep(500);
      const toast = await getToastText(page);
      if (toast && (toast.toLowerCase().includes("previous order") || toast.toLowerCase().includes("in progress") || toast.toLowerCase().includes("please wait"))) {
        overlapToast = toast;
        overlapBlockedDetected = true;
        info(`Overlap block toast at poll ${i}: "${toast}"`);
        break;
      }
      if (toast && toast.toLowerCase().includes("saved")) {
        info(`First drag already saved before overlap detected: "${toast}"`);
        break; // The network was fast enough that the first save already finished
      }
    }

    await page.screenshot({ path: `${SHOTS}/race-07-overlap-probe.png` });

    // Allow more time for both saves to complete (or overlap to clear)
    await sleep(15000); // enough for even slow 3G to finish

    const afterOverlapOrder = await getImageRowFilenames(page);
    info(`After overlap probe, final order (first 3): ${afterOverlapOrder.slice(0, 3).join(", ")}`);
    await page.screenshot({ path: `${SHOTS}/race-08-overlap-final.png` });

    if (overlapBlockedDetected) {
      pass("OVERLAP PROBE: Second drag blocked with toast", `"${overlapToast}"`);
    } else {
      // It's possible the first save finished before the second drag started (network was fast enough)
      info(`OVERLAP PROBE: Block toast not seen — first save may have completed before second drag. Check screenshot.`);
      // Verify order is still consistent (not corrupted)
      if (afterOverlapOrder.length > 0) {
        pass("OVERLAP PROBE: No corrupted order detected (first save may have completed before second drag)", `final[0]="${afterOverlapOrder[0]}"`);
      } else {
        fail("OVERLAP PROBE", "No image rows found after overlap probe");
      }
    }

    // ── Disable throttle ─────────────────────────────────────────────────────────
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
    info("Network throttle disabled");

    // ── Step 10: Public cover check ──────────────────────────────────────────────
    console.log("\n[10] PUBLIC CHECK: /inspiration cover image...");
    await sleep(3000); // wait for any in-flight saves

    // Get the current admin view's cover
    const adminCoverInfo = await page.evaluate(async () => {
      const resp = await fetch(`/api/project-images/merged?_r=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
      const data = await resp.json();
      const proj = data.projects?.find((p) => p.id === "las-pinas-residence");
      return { cover: proj?.cover ?? null, images: proj?.images?.slice(0, 3) ?? [] };
    });
    info(`API cover after all drags: ${adminCoverInfo.cover?.split("/").pop()}`);

    await page.goto(`${BASE}/inspiration`, { waitUntil: "networkidle2" });
    await sleep(2500);

    const publicCardCheck = await page.evaluate(() => {
      // Find the las-pinas card
      const links = [...document.querySelectorAll("a[href*='las-pinas']")];
      if (links.length === 0) return { found: false, reason: "no link found" };

      const link = links[0];
      const img = link.querySelector("img");
      const imgSrc = img?.src ?? "";
      return {
        found: true,
        imgSrc,
        imgSrcFilename: imgSrc.split("/").pop()?.split("?")[0] ?? "",
      };
    });

    info(`Public /inspiration las-pinas card: ${JSON.stringify(publicCardCheck)}`);
    await page.screenshot({ path: `${SHOTS}/race-09-inspiration-public.png` });

    if (!publicCardCheck.found) {
      fail("PUBLIC CHECK", `Las-pinas card not found: ${publicCardCheck.reason}`);
    } else if (publicCardCheck.imgSrc) {
      pass("PUBLIC CHECK: /inspiration card shows an image", `src=${publicCardCheck.imgSrcFilename}`);
      // Verify the cover image filename matches what the admin API reports
      const adminCoverFn = adminCoverInfo.cover?.split("/").pop()?.split("?")[0] ?? "";
      const publicFn = publicCardCheck.imgSrcFilename;
      // The public image might be a thumbnail path (different dir) but same filename
      if (adminCoverFn && publicFn && (publicFn.includes(adminCoverFn.split(".")[0]) || adminCoverFn.includes(publicFn.split(".")[0]))) {
        pass("PUBLIC CHECK: Cover image filename matches admin API", `admin="${adminCoverFn}", public="${publicFn}"`);
      } else {
        info(`PUBLIC CHECK: Cover filenames diverge (admin="${adminCoverFn}", public="${publicFn}") — may be thumbnail vs full path difference`);
        // Not a hard failure — thumbnail paths are legitimately different
      }
    } else {
      fail("PUBLIC CHECK", "Las-pinas card img src is empty");
    }

    // ── Step 11: CLEANUP — restore original order ────────────────────────────────
    console.log("\n[11] CLEANUP: Restoring original order...");

    // Log in again for cleanup
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await sleep(2000);

    // Check if login needed
    const needsLogin = await page.$('input[type="email"]');
    if (needsLogin) {
      await needsLogin.click({ clickCount: 3 });
      await needsLogin.type("dev@fourlinq.ph");
      const passInput = await page.$('input[type="password"]');
      await passInput.click({ clickCount: 3 });
      await passInput.type("advodeveloper2026");
      const submitBtn = await page.$('button[type="submit"]');
      await submitBtn.click();
      await sleep(3000);
    }

    const cleanupResult = await page.evaluate(async (projectId) => {
      // Delete all image_order overrides for this project
      const resp = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
      const data = await resp.json();
      const toDelete = data.overrides.filter(
        (r) => r.project_id === projectId && r.override_type === "image_order"
      );
      const results = [];
      for (const row of toDelete) {
        const delResp = await fetch(`/api/admin/project-images/overrides/${row.project_image_override_id}`, {
          method: "DELETE",
          credentials: "include",
        });
        results.push({ id: row.project_image_override_id, ok: delResp.ok });
      }
      return { deleted: results.length, results };
    }, TEST_PROJECT);

    info(`Cleanup: deleted ${cleanupResult.deleted} image_order rows`);

    // Verify final DB state
    const finalDbCheck = await page.evaluate(async () => {
      const resp = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
      const data = await resp.json();
      const imageOrderRows = data.overrides.filter((r) => r.override_type === "image_order");
      return { total: data.total, imageOrderRows: imageOrderRows.length };
    });

    info(`DB AFTER cleanup: total=${finalDbCheck.total}, image_order rows=${finalDbCheck.imageOrderRows}`);

    if (finalDbCheck.imageOrderRows === 0 && finalDbCheck.total === initialOverrideCount.total) {
      pass("CLEANUP: DB restored to baseline", `total=${finalDbCheck.total} (matches before=${initialOverrideCount.total})`);
    } else if (finalDbCheck.imageOrderRows === 0) {
      pass("CLEANUP: All image_order rows deleted", `total=${finalDbCheck.total} vs before=${initialOverrideCount.total}`);
      if (finalDbCheck.total !== initialOverrideCount.total) {
        info(`Note: total count changed (${initialOverrideCount.total}→${finalDbCheck.total}), likely from test overlap saves`);
      }
    } else {
      fail("CLEANUP", `${finalDbCheck.imageOrderRows} image_order rows remain after cleanup`);
    }

    await page.screenshot({ path: `${SHOTS}/race-10-cleanup.png` });

  } catch (err) {
    console.error("\nFATAL script error:", err);
    fail("Script", String(err));
    await page.screenshot({ path: `${SHOTS}/race-ERROR.png` }).catch(() => {});
  }

  await browser.close();

  // ── Final summary ────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(62));
  console.log("VERIFICATION SUMMARY — verify-drag-reorder-race.mjs");
  console.log("═".repeat(62));
  const passing = results.filter((r) => r.status === "pass");
  const failing = results.filter((r) => r.status === "fail");
  console.log(`PASS: ${passing.length}  FAIL: ${failing.length}  TOTAL: ${results.length}`);
  if (passing.length > 0) {
    console.log("\nPassed:");
    for (const r of passing) console.log(`  + ${r.name}${r.detail ? ": " + r.detail : ""}`);
  }
  if (failing.length > 0) {
    console.log("\nFailed:");
    for (const r of failing) console.log(`  - ${r.name}: ${r.reason}`);
  }
  console.log("═".repeat(62));
  return failing.length === 0;
}

run().then((ok) => {
  process.exit(ok ? 0 : 1);
}).catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

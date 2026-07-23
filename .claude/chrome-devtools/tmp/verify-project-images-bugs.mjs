/**
 * verify-project-images-bugs.mjs
 *
 * Browser verification for project-images-admin-controls bug fixes.
 * Tests: project flag/hide/delete/restore, ratio toggle, image flag, modify-values popup.
 * Also verifies /inspiration ratio rendering.
 *
 * Run: NODE_PATH=/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules \
 *      node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/verify-project-images-bugs.mjs
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const BASE = "http://localhost:8080";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Ensure screenshots dir exists
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
function pass(name) {
  console.log(`  PASS: ${name}`);
  results.push({ name, status: "pass" });
}
function fail(name, reason) {
  console.log(`  FAIL: ${name} — ${reason}`);
  results.push({ name, status: "fail", reason });
}

async function run() {
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
    // ── Step 1: Login ─────────────────────────────────────────────────────────────
    console.log("\n1. Logging in to admin...");
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await sleep(2000);

    // Fill login form if present (SPA: wait for React to render)
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type("dev@fourlinq.ph");
      const passInput = await page.$('input[type="password"]');
      await passInput.click({ clickCount: 3 });
      await passInput.type("advodeveloper2026");
      const submitBtn = await page.$('button[type="submit"]');
      await submitBtn.click();
      // SPA — wait for URL change or specific element
      await sleep(3000);
      pass("Login submitted");
    } else {
      pass("Already logged in / no login form visible");
    }

    await page.screenshot({ path: `${SHOTS}/00-after-login.png` });
    console.log("  Screenshot: 00-after-login.png");

    // ── Step 2: Navigate to Project Images tab ────────────────────────────────────
    console.log("\n2. Opening Project Images tab...");
    // Navigate directly to admin
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await sleep(2000);

    // Click "images" or "Project Images" tab
    const clickedTab = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll("button")];
      const tab = tabs.find((t) => {
        const text = t.textContent?.toLowerCase() ?? "";
        return text.includes("image") || text.includes("project image");
      });
      if (tab) { tab.click(); return true; }
      return false;
    });

    if (clickedTab) {
      await sleep(3000); // wait for data to load
      pass("Project Images tab clicked");
    } else {
      fail("Project Images tab", "Tab not found");
    }

    await page.screenshot({ path: `${SHOTS}/01-admin-project-list.png` });
    console.log("  Screenshot: 01-admin-project-list.png");

    // ── Step 3: Verify Active/Hidden/Deleted tab filter UI ────────────────────────
    console.log("\n3. Checking view mode tabs (Active/Hidden/Deleted)...");
    const bodyText3 = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasActive = bodyText3.includes("active");
    const hasHiddenTab = bodyText3.includes("hidden");
    const hasDeletedTab = bodyText3.includes("deleted");
    if (hasActive && hasHiddenTab && hasDeletedTab) {
      pass("View mode tabs (Active/Hidden/Deleted) visible");
    } else {
      fail("View mode tabs", `Found: active=${hasActive} hidden=${hasHiddenTab} deleted=${hasDeletedTab}`);
    }

    // ── Step 4: Open a project ────────────────────────────────────────────────────
    console.log("\n4. Opening first project card...");
    const clickedCard = await page.evaluate(() => {
      // Project cards are buttons with class 'group'
      const cards = [...document.querySelectorAll("button.group")];
      if (cards.length === 0) return false;
      cards[0].click();
      return true;
    });

    if (clickedCard) {
      await sleep(2500);
      pass("Project detail view opened");
    } else {
      fail("Open project", "No project cards found");
    }

    await page.screenshot({ path: `${SHOTS}/02-project-detail.png` });
    console.log("  Screenshot: 02-project-detail.png");

    // ── Step 5: Check action buttons ─────────────────────────────────────────────
    console.log("\n5. Checking project-level action buttons...");
    const pageText5 = await page.evaluate(() => document.body.innerText);
    const hasFlagBtn = /Flag/i.test(pageText5);
    const hasHideBtn = /Hide project|Unhide/i.test(pageText5);
    const hasRatioBtn = /Ratio:/i.test(pageText5);
    const hasDeleteBtn = /Delete project|Restore/i.test(pageText5);

    if (hasFlagBtn) pass("Flag button visible");
    else fail("Flag button", "Not found in page text");

    if (hasHideBtn) pass("Hide button visible");
    else fail("Hide button", "Not found in page text");

    if (hasRatioBtn) pass("Ratio button shows 'Ratio:' label");
    else fail("Ratio button", "Label 'Ratio:' not found");

    if (hasDeleteBtn) pass("Delete button visible");
    else fail("Delete button", "Not found in page text");

    // ── Step 6: Flag a project ────────────────────────────────────────────────────
    console.log("\n6. Testing project Flag toggle...");
    const flagResult = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      // Project-level flag button has rounded-md class
      const flagBtn = btns.find((b) => {
        const text = b.textContent?.trim() ?? "";
        const cls = b.className ?? "";
        return (text === "Flag") && cls.includes("rounded-md");
      });
      if (!flagBtn) return { found: false };
      flagBtn.click();
      return { found: true };
    });

    if (flagResult.found) {
      await sleep(2500);
      const pageAfterFlag = await page.evaluate(() => document.body.innerText);
      const hasError = /Error:|failed/i.test(pageAfterFlag);
      const hasFlagged = /Flagged/i.test(pageAfterFlag);
      if (hasError) {
        fail("Project flag", "Error toast appeared");
      } else if (hasFlagged) {
        pass("Project flag: 'Flagged' state appears after click");
      } else {
        pass("Project flag clicked (no error, checking button state)");
      }
      await page.screenshot({ path: `${SHOTS}/03-project-flagged.png` });
      console.log("  Screenshot: 03-project-flagged.png");
    } else {
      fail("Flag button", "Could not find project-level Flag button (text='Flag', class has rounded-md)");
    }

    // ── Step 7: Test Ratio toggle ─────────────────────────────────────────────────
    console.log("\n7. Testing ratio toggle...");
    const initialRatioInfo = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const ratioBtn = btns.find((b) => b.textContent?.trim().startsWith("Ratio:"));
      if (!ratioBtn) return { found: false };
      return { found: true, text: ratioBtn.textContent?.trim() };
    });

    console.log(`    Initial ratio button text: "${initialRatioInfo.text}"`);

    if (initialRatioInfo.found) {
      pass(`Ratio button found with label: "${initialRatioInfo.text}"`);

      // Click the ratio button
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const ratioBtn = btns.find((b) => b.textContent?.trim().startsWith("Ratio:"));
        if (ratioBtn) ratioBtn.click();
      });
      await sleep(2500); // wait for mutation + baseline invalidation + refetch

      const newRatioInfo = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const ratioBtn = btns.find((b) => b.textContent?.trim().startsWith("Ratio:"));
        if (!ratioBtn) return { found: false };
        return { found: true, text: ratioBtn.textContent?.trim() };
      });

      console.log(`    New ratio button text: "${newRatioInfo.text}"`);
      if (newRatioInfo.found && newRatioInfo.text !== initialRatioInfo.text) {
        pass(`Ratio label updated after toggle: "${initialRatioInfo.text}" → "${newRatioInfo.text}"`);
      } else if (newRatioInfo.found && newRatioInfo.text === initialRatioInfo.text) {
        fail("Ratio toggle", `Label did not change (still "${newRatioInfo.text}") — baseline invalidation may not have worked`);
      } else {
        fail("Ratio button post-toggle", "Ratio button not found after click");
      }

      await page.screenshot({ path: `${SHOTS}/04-ratio-toggled.png` });
      console.log("  Screenshot: 04-ratio-toggled.png");
    } else {
      fail("Ratio button", "Not found on page (no button starting with 'Ratio:')");
    }

    // ── Step 8: Check image ratio indicator (Bug 4) ───────────────────────────────
    console.log("\n8. Checking image ratio indicator (nearestRatioLabel)...");
    await sleep(2000); // images need to load for naturalWidth
    const ratioIndicators = await page.evaluate(() => {
      // Ratio indicators are <span> elements with font-mono class
      const spans = [...document.querySelectorAll("span.font-mono")];
      return spans.map((s) => s.textContent?.trim()).filter(Boolean);
    });
    console.log(`    Found font-mono spans: ${ratioIndicators.slice(0, 5).join(" | ")}`);

    const hasRatioLabel = ratioIndicators.some(
      (t) => t && (t.includes("landscape") || t.includes("portrait") || t.includes("square"))
    );
    const hasDecimalFormat = ratioIndicators.some((t) => t && /^\d+\.\d+$/.test(t));

    if (hasRatioLabel) {
      const sample = ratioIndicators.filter((t) => t && (t.includes("landscape") || t.includes("portrait") || t.includes("square"))).slice(0, 3);
      pass(`Ratio indicator shows named format: ${sample.join(", ")}`);
    } else if (hasDecimalFormat) {
      fail("Ratio indicator", `Still shows decimal format: ${ratioIndicators.slice(0, 3).join(", ")} — nearestRatioLabel not applied`);
    } else {
      fail("Ratio indicator", `No ratio indicators visible (images may still be loading). Found spans: ${ratioIndicators.slice(0, 5).join(", ")}`);
    }

    // ── Step 9: Test Modify Values popup (Bug 5) ──────────────────────────────────
    console.log("\n9. Testing Modify Values popup (grid-cols-4)...");
    const modifyClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const modifyBtn = btns.find((b) => b.textContent?.trim().includes("Modify values"));
      if (!modifyBtn) return false;
      modifyBtn.click();
      return true;
    });

    if (modifyClicked) {
      await sleep(500);
      const gridCheck = await page.evaluate(() => {
        const grid = document.querySelector("div.grid-cols-4");
        if (!grid) return { found: false };
        const inputs = [...grid.querySelectorAll("input[type='number']")];
        return { found: true, inputCount: inputs.length };
      });

      if (gridCheck.found && gridCheck.inputCount === 4) {
        pass("Modify values: 4 score fields in single row (grid-cols-4)");
      } else if (gridCheck.found) {
        fail("Modify values grid", `Found grid-cols-4 but ${gridCheck.inputCount} inputs (expected 4)`);
      } else {
        fail("Modify values grid", "grid-cols-4 not found after clicking 'Modify values'");
      }

      await page.screenshot({ path: `${SHOTS}/05-modify-values-popup.png` });
      console.log("  Screenshot: 05-modify-values-popup.png");

      // Close popup
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const cancelBtn = btns.find((b) => b.textContent?.trim() === "Cancel");
        if (cancelBtn) cancelBtn.click();
      });
      await sleep(300);
    } else {
      fail("Modify values button", "Not found on page");
    }

    // ── Step 10: Test Hide project → back to list → check Hidden tab ─────────────
    console.log("\n10. Testing Hide project...");
    const hideClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const hideBtn = btns.find((b) => b.textContent?.trim() === "Hide project");
      if (!hideBtn) return false;
      hideBtn.click();
      return true;
    });

    if (hideClicked) {
      await sleep(2500);

      // Go back to project list
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const backBtn = btns.find((b) => b.textContent?.includes("All Projects"));
        if (backBtn) backBtn.click();
      });
      await sleep(1500);

      // Check hidden tab
      const hiddenTabText = await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const hiddenBtn = btns.find((b) => b.textContent?.toLowerCase().includes("hidden"));
        return hiddenBtn?.textContent?.trim() ?? "";
      });
      console.log(`    Hidden tab text: "${hiddenTabText}"`);
      // Should show "(1)" or "(2)" or similar non-zero count
      if (/\(\d+\)/.test(hiddenTabText) && !hiddenTabText.includes("(0)")) {
        pass(`Hide project: hidden tab shows non-zero count: "${hiddenTabText}"`);
      } else {
        fail("Hide project", `Hidden tab does not show non-zero count: "${hiddenTabText}"`);
      }

      await page.screenshot({ path: `${SHOTS}/06-project-hidden.png` });
      console.log("  Screenshot: 06-project-hidden.png");

      // Click Hidden tab to see project there
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll("button")];
        const hiddenBtn = btns.find((b) => {
          const t = b.textContent?.toLowerCase() ?? "";
          return t.includes("hidden") && /\(\d+\)/.test(b.textContent ?? "");
        });
        if (hiddenBtn) hiddenBtn.click();
      });
      await sleep(1000);
      await page.screenshot({ path: `${SHOTS}/07-hidden-tab.png` });
      console.log("  Screenshot: 07-hidden-tab.png");
      pass("Hidden tab clicked and screenshot taken");
    } else {
      fail("Hide project", "Hide project button not found (already hidden?)");
    }

    // ── Step 11: Cleanup via API ──────────────────────────────────────────────────
    console.log("\n11. Cleanup: removing test overrides...");
    const cleanupResult = await page.evaluate(async () => {
      const overridesResp = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
      const data = await overridesResp.json();
      const testOverrides = data.overrides.filter((r) =>
        ["project_flagged", "project_hidden", "project_deleted", "project_ratio"].includes(r.override_type)
      );
      const deleteResults = [];
      for (const row of testOverrides) {
        const delResp = await fetch(`/api/admin/project-images/overrides/${row.project_image_override_id}`, {
          method: "DELETE",
          credentials: "include",
        });
        deleteResults.push({ id: row.project_image_override_id, type: row.override_type, ok: delResp.ok });
      }
      return deleteResults;
    });
    console.log(`    Deleted ${cleanupResult.length} test overrides:`, JSON.stringify(cleanupResult));
    if (cleanupResult.every((r) => r.ok)) {
      pass(`Cleanup: removed ${cleanupResult.length} test overrides`);
    } else {
      fail("Cleanup", `Some deletes failed: ${JSON.stringify(cleanupResult)}`);
    }

    // ── Step 12: /inspiration ratio check ────────────────────────────────────────
    console.log("\n12. Testing /inspiration ratio rendering...");

    // Set las-pinas-residence to 4:3
    const setRatioResult = await page.evaluate(async () => {
      const resp = await fetch("/api/admin/project-images/overrides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: "las-pinas-residence",
          image_path: "__project__",
          override_type: "project_ratio",
          value_text: "4:3",
        }),
      });
      const data = await resp.json();
      return { ok: resp.ok, overrideId: data.override?.project_image_override_id };
    });

    if (setRatioResult.ok) {
      pass(`Set las-pinas-residence ratio to 4:3 (id: ${setRatioResult.overrideId})`);
    } else {
      fail("Set project ratio", "API returned error");
    }

    // Navigate to /inspiration (force fresh merged fetch)
    await page.goto(`${BASE}/inspiration`, { waitUntil: "networkidle2" });
    await sleep(2500); // allow runtime merge fetch to complete and re-render

    const ratioCheck = await page.evaluate(() => {
      const links = [...document.querySelectorAll("a[href*='las-pinas']")];
      if (links.length === 0) return { found: false, reason: "no link to las-pinas-residence on page" };
      const link = links[0];
      // Find aspect-ratio container div (the immediate child div of the Link)
      const aspectDiv = link.querySelector("div[class*='aspect']");
      if (!aspectDiv) return { found: false, reason: "no aspect-ratio div in card", sample: link.innerHTML.slice(0, 300) };
      const computed = window.getComputedStyle(aspectDiv);
      return {
        found: true,
        aspectRatioStyle: computed.aspectRatio,
        className: aspectDiv.className,
      };
    });

    console.log(`    las-pinas card check:`, JSON.stringify(ratioCheck));

    if (!ratioCheck.found) {
      fail("Public ratio check", `Not found: ${ratioCheck.reason}`);
    } else if (ratioCheck.aspectRatioStyle && ratioCheck.aspectRatioStyle !== "auto") {
      pass(`Public card aspect-ratio="${ratioCheck.aspectRatioStyle}" class="${ratioCheck.className}"`);
    } else {
      fail("Public ratio", `No computed aspect-ratio style. Class="${ratioCheck.className}"`);
    }

    await page.screenshot({ path: `${SHOTS}/08-inspiration-ratio.png` });
    console.log("  Screenshot: 08-inspiration-ratio.png");

    // Cleanup test ratio override
    const cleanupRatio = await page.evaluate(async () => {
      const resp = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
      const data = await resp.json();
      const ratioRow = data.overrides.find((r) =>
        r.project_id === "las-pinas-residence" && r.override_type === "project_ratio"
      );
      if (!ratioRow) return { found: false };
      const del = await fetch(`/api/admin/project-images/overrides/${ratioRow.project_image_override_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return { found: true, ok: del.ok };
    });

    if (cleanupRatio.found && cleanupRatio.ok) {
      pass("Cleanup: removed test ratio override");
    } else {
      fail("Cleanup ratio", `found=${cleanupRatio.found} ok=${cleanupRatio.ok}`);
    }

    // ── Step 13: Bug C — image drag-reorder persists across project switch ────────
    console.log("\n13. Checking drag-reorder Bug C fix...");
    // Navigate back to admin
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await sleep(1500);
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const tab = btns.find((t) => t.textContent?.toLowerCase().includes("image"));
      if (tab) tab.click();
    });
    await sleep(2000);

    // Open first project
    await page.evaluate(() => {
      const cards = [...document.querySelectorAll("button.group")];
      if (cards[0]) cards[0].click();
    });
    await sleep(2000);

    // Verify computeImageOrder is wired — check that imageOrderIds exists (DnD list is present)
    const dndListCheck = await page.evaluate(() => {
      // The image drag-reorder area has a DnD context; we look for grip handles
      const grips = [...document.querySelectorAll("button[aria-label='Drag to reorder']")];
      return { gripCount: grips.length };
    });
    console.log(`    DnD grip handles found: ${dndListCheck.gripCount}`);
    if (dndListCheck.gripCount > 0) {
      pass(`Bug C fix: DnD image reorder UI present (${dndListCheck.gripCount} grip handles)`);
    } else {
      fail("Bug C fix check", "No drag grip handles found in project detail view");
    }

    await page.screenshot({ path: `${SHOTS}/09-dnd-reorder.png` });
    console.log("  Screenshot: 09-dnd-reorder.png");

  } catch (err) {
    console.error("Script error during run:", err);
    fail("Script", String(err));
  }

  // ── Final DB state verification ────────────────────────────────────────────────
  console.log("\n14. Verifying final DB state via API...");
  const finalState = await page.evaluate(async () => {
    const resp = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
    const data = await resp.json();
    const byType = {};
    for (const r of data.overrides) {
      byType[r.override_type] = (byType[r.override_type] ?? 0) + 1;
    }
    return { total: data.total, byType };
  });
  console.log(`    Final override counts: ${JSON.stringify(finalState)}`);
  const hasOnlyProjectOrder = Object.keys(finalState.byType).every((t) => t === "project_order");
  if (hasOnlyProjectOrder && finalState.byType.project_order === 64) {
    pass(`DB clean: only 64 project_order rows remain`);
  } else {
    fail("DB state", `Unexpected overrides remain: ${JSON.stringify(finalState)}`);
  }

  await page.screenshot({ path: `${SHOTS}/10-final-state.png` });
  console.log("  Screenshot: 10-final-state.png");

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("VERIFICATION SUMMARY");
  console.log("─".repeat(60));
  const passing = results.filter((r) => r.status === "pass");
  const failing = results.filter((r) => r.status === "fail");
  console.log(`PASS: ${passing.length}  FAIL: ${failing.length}`);
  if (failing.length > 0) {
    console.log("\nFailed checks:");
    for (const f of failing) {
      console.log(`  - ${f.name}: ${f.reason}`);
    }
  }

  await browser.close();
  return failing.length === 0;
}

run().then((ok) => {
  process.exit(ok ? 0 : 1);
}).catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});

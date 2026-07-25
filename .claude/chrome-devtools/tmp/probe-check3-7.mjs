/**
 * probe-check3-7.mjs
 * Deep dive on Check 3 (button labels) and Check 7 (reorder API endpoint).
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots/ddf9935";
const PROD = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  const networkLog = [];
  page.on("request", (req) => {
    if (req.method() !== "GET" || req.url().includes("/api/")) {
      networkLog.push({ method: req.method(), url: req.url() });
    }
  });
  page.on("response", (res) => {
    if (res.url().includes("/api/")) {
      networkLog.push({ status: res.status(), url: res.url() });
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
  }

  // Navigate to Project Images
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Project Images");
    btn?.click();
  });
  await sleep(3000);

  // Open nuvali-laguna-residence
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => {
      const slug = b.querySelector("p.font-mono, p[class*='mono']");
      return slug?.textContent?.trim() === "nuvali-laguna-residence";
    });
    btn?.click();
  });
  await sleep(4000);
  await page.screenshot({ path: `${SHOTS}/check3-nuvali-detail.png`, fullPage: false });

  // ── CHECK 3: Get exact button text in header action row ──────────────────────
  console.log("\n=== CHECK 3: Button order detail ===");
  const buttons = await page.evaluate(() => {
    return [...document.querySelectorAll("button")].map((b, idx) => ({
      idx,
      text: b.textContent.trim(),
      classes: b.className.slice(0, 120),
      disabled: b.disabled,
    }));
  });

  // Filter to just the header action row buttons (the short ones between nav and image rows)
  const actionRowBtns = buttons.filter(b =>
    b.text.length < 40 && b.text.length > 0 &&
    !["Refresh", "Logout", "Leads & Inquiries", "Chat Logs", "Content", "Project Images", "Team", "All Projects"].includes(b.text)
  );
  console.log("Action row + image row buttons:");
  actionRowBtns.slice(0, 20).forEach(b => console.log(`  [${b.idx}] "${b.text}" classes=${b.classes.slice(0, 60)}`));

  // Full page screenshot to see context
  await page.screenshot({ path: `${SHOTS}/check3-full.png`, fullPage: true });

  // Get body text around the action row
  const actionRowHTML = await page.evaluate(() => {
    // Find buttons with px-3 py-1.5 which is the header action button style
    const headerBtns = [...document.querySelectorAll("button[class*='px-3']")];
    const results = headerBtns.map(b => ({
      text: b.textContent.trim(),
      classes: b.className.slice(0, 100),
      parentClass: b.parentElement?.className?.slice(0, 80) ?? "",
    }));
    return results;
  });
  console.log("\nHeader action buttons (px-3 py-1.5):");
  actionRowHTML.forEach(b => console.log(`  "${b.text}" | parent: ${b.parentClass.slice(0, 60)}`));

  // ── CHECK 7: Find reorder API endpoint ──────────────────────────────────────
  console.log("\n=== CHECK 7: Finding reorder endpoint ===");

  // Scan JS bundles for reorder-related URLs
  const scriptUrls = [];
  const scriptPage = await browser.newPage();
  scriptPage.on("response", (res) => {
    if (res.url().endsWith(".js") && res.url().includes("assets")) {
      scriptUrls.push(res.url());
    }
  });
  await scriptPage.goto(`${PROD}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(2000);
  await scriptPage.close();

  console.log(`  Found ${scriptUrls.length} JS bundles`);

  // Search bundles for "reorder" keyword
  const reorderEndpoints = [];
  for (const url of scriptUrls) {
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      if (text.includes("reorder") || text.includes("order") || text.includes("image-order")) {
        const matches = text.match(/["'`]([^"'`]*(?:reorder|image-order|imageOrder)[^"'`]*)["'`]/g) ?? [];
        if (matches.length > 0) {
          console.log(`  Bundle ${url.split("/").pop()}:`);
          matches.slice(0, 10).forEach(m => console.log(`    ${m}`));
          reorderEndpoints.push(...matches);
        }
      }
    } catch {}
  }

  // Also check for the drag-and-drop save network request by performing a drag in the UI
  console.log("\n  Monitoring network for drag-reorder...");
  const capturedRequests = [];
  page.on("request", (req) => {
    if (req.method() === "POST" || req.method() === "PUT" || req.method() === "PATCH") {
      capturedRequests.push({ method: req.method(), url: req.url(), body: req.postData()?.slice(0, 500) });
    }
  });
  page.on("response", (res) => {
    if ((res.request().method() === "POST" || res.request().method() === "PUT") && res.url().includes("/api/")) {
      capturedRequests.push({ status: res.status(), url: res.url() });
    }
  });

  // Scroll down to first image row in nuvali detail
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(1000);

  // Find image rows with drag handles
  const dragInfo = await page.evaluate(() => {
    const dragHandles = [...document.querySelectorAll("[class*='cursor-grab']")];
    const imageRows = [...document.querySelectorAll("div[class*='group']")].filter(el => el.querySelector("img[src*='projects-fb']"));
    return {
      dragHandleCount: dragHandles.length,
      imageRowCount: imageRows.length,
      dragHandleClasses: dragHandles.slice(0, 3).map(d => d.className.slice(0, 80)),
      imageRowClasses: imageRows.slice(0, 3).map(r => r.className.slice(0, 80)),
    };
  });
  console.log("\n  Drag info:", JSON.stringify(dragInfo));

  // Attempt a simulated drag (using dragstart/dragover/drop events)
  const dragResult = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("div[class*='group']")].filter(el =>
      el.querySelector("img[src*='projects-fb']") && !el.closest('[class*="hidden"]')
    );
    if (rows.length < 2) return { ok: false, reason: `only ${rows.length} rows` };

    const from = rows[0];
    const to = rows[1];

    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();

    // Simulate drag events
    const dragstart = new DragEvent("dragstart", {
      bubbles: true, cancelable: true,
      dataTransfer: new DataTransfer(),
      clientX: fromRect.x + fromRect.width / 2,
      clientY: fromRect.y + fromRect.height / 2,
    });
    from.dispatchEvent(dragstart);

    const dragover = new DragEvent("dragover", {
      bubbles: true, cancelable: true,
      dataTransfer: new DataTransfer(),
      clientX: toRect.x + toRect.width / 2,
      clientY: toRect.y + toRect.height / 2,
    });
    to.dispatchEvent(dragover);

    const drop = new DragEvent("drop", {
      bubbles: true, cancelable: true,
      dataTransfer: new DataTransfer(),
      clientX: toRect.x + toRect.width / 2,
      clientY: toRect.y + toRect.height / 2,
    });
    to.dispatchEvent(drop);

    return { ok: true, fromClass: from.className.slice(0, 60), toClass: to.className.slice(0, 60) };
  });
  console.log("\n  Simulated drag:", JSON.stringify(dragResult));
  await sleep(2000);

  // Check captured requests
  console.log("\n  Captured POST/PUT requests:", JSON.stringify(capturedRequests));

  // Also try looking for onDragEnd handlers in the component — grep source files
  console.log("\n=== Checking source for reorder endpoint ===");
  try {
    const { execSync } = await import("child_process");
    const grepResult = execSync(
      `grep -r "reorder\\|image.order\\|imageOrder\\|image_order" /Users/princewagan/fourlinq/server --include="*.ts" --include="*.js" -l 2>/dev/null`,
      { timeout: 10000, encoding: "utf8" }
    );
    console.log("  Server files with reorder:", grepResult.trim());

    // Get the endpoint from routes
    const routeGrep = execSync(
      `grep -r "reorder\\|image_order\\|imageOrder" /Users/princewagan/fourlinq/server --include="*.ts" -n 2>/dev/null | head -30`,
      { timeout: 10000, encoding: "utf8" }
    );
    console.log("  Reorder routes:\n" + routeGrep);

    // Also check src
    const srcGrep = execSync(
      `grep -r "reorder\\|image_order\\|imageOrder" /Users/princewagan/fourlinq/src --include="*.ts" --include="*.tsx" -n 2>/dev/null | grep -i "fetch\\|api\\|post\\|put" | head -20`,
      { timeout: 10000, encoding: "utf8" }
    );
    console.log("  Reorder in src (API calls):\n" + srcGrep);
  } catch (e) {
    console.log("  Grep error:", e.message);
  }

  // Try the actual API calls that might exist
  console.log("\n=== Testing possible reorder API endpoints ===");
  const possibleEndpoints = [
    ["/api/admin/project-images/image-order", "POST", JSON.stringify({ projectId: "binan-residence", imageOrder: [] })],
    ["/api/admin/projects/binan-residence/reorder", "POST", JSON.stringify({ imageOrder: [] })],
    ["/api/admin/image-order", "POST", JSON.stringify({ projectId: "binan-residence", imageOrder: [] })],
    ["/api/admin/project-image-order", "POST", JSON.stringify({ projectId: "binan-residence" })],
    ["/api/admin/project-images/binan-residence/order", "POST", JSON.stringify({ imageOrder: [] })],
    ["/api/admin/project-images/overrides", "GET", null],
  ];

  const endpointResults = await page.evaluate(async (endpoints) => {
    const results = [];
    for (const [url, method, body] of endpoints) {
      try {
        const opts = { method, credentials: "include" };
        if (body) { opts.headers = { "Content-Type": "application/json" }; opts.body = body; }
        const r = await fetch(url, opts);
        const text = await r.text();
        results.push({ url, method, status: r.status, body: text.slice(0, 200) });
      } catch (e) {
        results.push({ url, method, error: e.message });
      }
    }
    return results;
  }, possibleEndpoints);

  console.log("Endpoint test results:");
  endpointResults.forEach(r => console.log(`  ${r.method} ${r.url}: status=${r.status ?? "ERR"}, body=${(r.body ?? r.error ?? "").slice(0, 150)}`));

  // Also check what the DND library sends on drop by looking at the component
  console.log("\n=== Source-level check for reorder API ===");
  try {
    const { execSync } = await import("child_process");
    // Find admin component files
    const adminFiles = execSync(
      `find /Users/princewagan/fourlinq/src -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs grep -l "reorder\\|imageOrder\\|image_order\\|onDragEnd" 2>/dev/null`,
      { timeout: 10000, encoding: "utf8" }
    );
    console.log("  Admin component files with reorder logic:", adminFiles.trim());

    // Get the actual API call
    const apiCallGrep = execSync(
      `grep -rn "fetch\\|axios\\|api" /Users/princewagan/fourlinq/src --include="*.tsx" --include="*.ts" 2>/dev/null | grep -i "order\\|reorder" | head -20`,
      { timeout: 10000, encoding: "utf8" }
    );
    console.log("  API calls for order:\n" + apiCallGrep);
  } catch {}

  await browser.close();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });

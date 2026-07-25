/**
 * verify-3d3197e.mjs
 *
 * Live verification for commit 3d3197e — projectGalleryImages rendering.
 * Checks 2-5 per task spec.
 *
 * Run:
 *   node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/verify-3d3197e.mjs
 */

import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";
import https from "https";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const BASE = "https://fourlinq.ph";
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

function fetchHead(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0 FourlinqVerify/3d3197e" } }, (res) => {
      resolve({ status: res.statusCode });
    });
    req.on("error", () => resolve({ status: 0 }));
    req.end();
  });
}

async function launchBrowser() {
  const tmpDir = `/tmp/puppeteer-verify-3d3197e-${Date.now()}`;
  fs.mkdirSync(tmpDir, { recursive: true });
  return puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1440,900",
      "--disable-cache",
      "--disable-application-cache",
      `--user-data-dir=${tmpDir}`,
    ],
    defaultViewport: { width: 1440, height: 900 },
  });
}

// ── CHECK 2: Sarangani project detail page — DOM + screenshot ────────────────
async function check2_saranganiDetailPage() {
  console.log("\n══ CHECK 2: Sarangani ProjectDetail page ══");

  const SARA_SLUG = "sarangani-s-residence";
  const EXPECTED_SRCS = [
    "/uploads/cms/20260725-347a9254ad.png",
    "/uploads/cms/20260725-d32199ea8e.png",
  ];
  const FORBIDDEN_PREFIX = `/images/projects-fb/${SARA_SLUG}`;

  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.setDefaultTimeout(40000);

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));

  // Collect all network requests to detect FB image flash
  const allNetworkURLs = [];
  page.on("request", (req) => {
    const u = req.url();
    if (u.includes(SARA_SLUG)) allNetworkURLs.push(u);
  });

  // Also poll DOM to catch stale flashes from first paint
  const flashedFBSrcs = [];
  let pollActive = true;

  const pollInterval = setInterval(async () => {
    if (!pollActive) return;
    try {
      const srcs = await page.evaluate((prefix) => {
        return [...document.querySelectorAll("img")]
          .map((i) => i.src || i.currentSrc || i.getAttribute("src") || "")
          .filter((s) => s.includes(prefix));
      }, SARA_SLUG);
      for (const s of srcs) {
        if (s.includes("/images/projects-fb/") && !flashedFBSrcs.includes(s)) {
          flashedFBSrcs.push(s);
        }
      }
    } catch (_) {}
  }, 150);

  // Try to find the sarangani detail URL
  // Typically /projects/sarangani-s-residence
  const detailUrl = `${BASE}/projects/${SARA_SLUG}`;
  console.log(`  Loading: ${detailUrl}`);

  let navOk = true;
  await page.goto(detailUrl, { waitUntil: "domcontentloaded", timeout: 40000 }).catch((e) => {
    console.log(`  Navigation warning: ${e.message}`);
    navOk = false;
  });

  // Wait for React hydration and data fetch
  await sleep(4000);

  // Stop polling
  pollActive = false;
  clearInterval(pollInterval);

  // 2a: No FB src ever flashed
  const realFBFlashes = flashedFBSrcs.filter((s) => s.includes(FORBIDDEN_PREFIX));
  if (realFBFlashes.length > 0) {
    fail("2a: No FB src flash (from first paint)", `Flash detected: ${realFBFlashes.join(", ")}`);
  } else {
    pass("2a: No FB sarangani src ever appeared in DOM (no stale flash)");
  }

  // Also check network requests for FB images
  const fbNetworkReqs = allNetworkURLs.filter((u) => u.includes("/images/projects-fb/"));
  if (fbNetworkReqs.length > 0) {
    warn("2b: FB sarangani network request detected", fbNetworkReqs.join(", "));
  } else {
    pass("2b: No FB sarangani network requests (browser never fetched original)");
  }

  // 2c: Final rendered gallery = exactly 2 images with CMS srcs
  const finalImgSrcs = await page.evaluate((slug) => {
    const imgs = [...document.querySelectorAll("img")];
    // Collect all img srcs that contain either 'projects-fb/sarangani' or 'uploads/cms'
    return imgs
      .map((i) => ({
        src: i.src || i.currentSrc || i.getAttribute("src") || "",
        alt: i.alt || "",
        cls: i.className || "",
        natural: `${i.naturalWidth}x${i.naturalHeight}`,
      }))
      .filter((d) => d.src && (d.src.includes(slug) || (d.src.includes("uploads/cms") && d.src.includes("20260725"))));
  }, SARA_SLUG);

  console.log(`\n  All sarangani/CMS img elements (${finalImgSrcs.length}):`);
  finalImgSrcs.forEach((d) => console.log(`    src=${d.src} natural=${d.natural} alt=${d.alt}`));

  // Check exactly the 2 CMS PNGs are rendered
  const cmsSrcs = finalImgSrcs.filter((d) => d.src.includes("/uploads/cms/20260725-347a9254ad") || d.src.includes("/uploads/cms/20260725-d32199ea8e"));
  const fbSrcs = finalImgSrcs.filter((d) => d.src.includes("/images/projects-fb/"));

  if (fbSrcs.length > 0) {
    fail("2c: Final gallery has NO FB srcs", `FB srcs found: ${fbSrcs.map((d) => d.src).join(", ")}`);
  } else {
    pass("2c: Final rendered gallery has no FB srcs");
  }

  // Count unique CMS gallery images
  const uniq = [...new Set(cmsSrcs.map((d) => d.src))];
  if (uniq.length === 2) {
    pass("2d: Final rendered gallery = exactly 2 CMS images", uniq.join(", "));
  } else if (uniq.length > 0) {
    fail("2d: Final rendered gallery count", `Expected 2 unique CMS srcs, got ${uniq.length}: ${uniq.join(", ")}`);
  } else {
    fail("2d: Final rendered gallery count", `No CMS gallery images found in DOM`);
  }

  // 2e: Both CMS images return HTTP 200
  console.log("\n  Checking HTTP 200 for both CMS images...");
  for (const src of EXPECTED_SRCS) {
    const url = `${BASE}${src}`;
    const r = await fetchHead(url);
    if (r.status === 200) {
      pass(`2e: HTTP 200 for ${src.split("/").pop()}`, url);
    } else {
      fail(`2e: HTTP 200 for ${src.split("/").pop()}`, `Got ${r.status} for ${url}`);
    }
  }

  // Screenshot
  const shotPath = `${SHOTS}/3d3197e-check2-sarangani-detail.png`;
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`\n  Screenshot: ${shotPath}`);

  // 2f: Console errors
  const realErrors = consoleErrors.filter((e) => {
    const l = e.toLowerCase();
    return !l.includes("favicon") && !l.includes("chrome-extension") && !l.includes("devtools");
  });
  if (realErrors.length === 0) {
    pass("2f: Zero console errors on sarangani detail");
  } else {
    fail("2f: Console errors on sarangani detail", realErrors.slice(0, 3).join(" | "));
  }

  await browser.close();
}

// ── CHECK 3: Spot-check 2 other projects ─────────────────────────────────────
async function check3_spotCheckProjects() {
  console.log("\n══ CHECK 3: Spot-check 2 other projects (las-pinas, nuvali-laguna) ══");

  // Fetch API to get expected gallery lists
  const apiData = await new Promise((resolve, reject) => {
    https.get(
      `${BASE}/api/project-images/merged?_r=2`,
      { headers: { "User-Agent": "Mozilla/5.0 FourlinqVerify/3d3197e", "Cache-Control": "no-cache" } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
        });
      }
    ).on("error", reject);
  });

  const galleryMap = apiData.projectGalleryImages || {};

  const SPOT_PROJECTS = [
    { slug: "las-pinas-residence", label: "Las Pinas Residence" },
    { slug: "nuvali-laguna-residence", label: "Nuvali Laguna Residence" },
  ];

  const browser = await launchBrowser();

  for (const { slug, label } of SPOT_PROJECTS) {
    console.log(`\n  --- ${label} (${slug}) ---`);
    const expectedGallery = galleryMap[slug] || [];
    console.log(`  API gallery (${expectedGallery.length} items): ${JSON.stringify(expectedGallery)}`);

    if (expectedGallery.length === 0) {
      warn(`3: ${label}`, "API returned empty gallery list");
      continue;
    }

    const page = await browser.newPage();
    page.setDefaultTimeout(40000);

    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));

    const detailUrl = `${BASE}/projects/${slug}`;
    console.log(`  Loading: ${detailUrl}`);
    await page.goto(detailUrl, { waitUntil: "domcontentloaded", timeout: 40000 }).catch((e) => {
      console.log(`  Nav error: ${e.message}`);
    });
    await sleep(4000);

    // Get all gallery img srcs
    const domImgs = await page.evaluate(() => {
      return [...document.querySelectorAll("img")].map((i) => ({
        src: i.src || i.currentSrc || i.getAttribute("src") || "",
        natural: `${i.naturalWidth}x${i.naturalHeight}`,
      })).filter((d) => d.src && !d.src.includes("favicon") && !d.src.includes("data:"));
    });

    // Extract paths relative to BASE
    const domPaths = domImgs.map((d) => {
      try {
        const u = new URL(d.src);
        return u.pathname;
      } catch (_) {
        return d.src;
      }
    });

    // Check order+membership: every expectedGallery path must appear in DOM
    let allFound = true;
    for (let i = 0; i < expectedGallery.length; i++) {
      const expected = expectedGallery[i];
      const present = domPaths.some((p) => p === expected || p.includes(expected.split("/").pop()));
      if (!present) {
        fail(`3: ${label} gallery[${i}] in DOM`, `Expected ${expected}, DOM has: ${domPaths.slice(0, 6).join(", ")}`);
        allFound = false;
      }
    }
    if (allFound) {
      pass(`3: ${label} — all ${expectedGallery.length} API gallery images found in DOM`);
    }

    // Spot-check gallery navigation: look for prev/next buttons or scroll
    const navBtns = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      return btns.filter((b) => {
        const t = (b.textContent || b.getAttribute("aria-label") || "").toLowerCase();
        return t.includes("next") || t.includes("prev") || t.includes("→") || t.includes("←") ||
               t === ">" || t === "<" || b.className?.includes("arrow") || b.className?.includes("nav");
      }).map((b) => b.textContent?.trim() || b.getAttribute("aria-label") || b.className?.slice(0, 60));
    });

    console.log(`  Gallery nav buttons: ${JSON.stringify(navBtns)}`);
    if (navBtns.length > 0 || expectedGallery.length === 1) {
      pass(`3: ${label} — gallery nav controls present or single-image (no nav needed)`);
    } else {
      warn(`3: ${label}`, `No obvious prev/next buttons found (may use scroll or swipe)`);
    }

    // Screenshot
    const shotPath = `${SHOTS}/3d3197e-check3-${slug}.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Screenshot: ${shotPath}`);

    const realErrors = consoleErrors.filter((e) => {
      const l = e.toLowerCase();
      return !l.includes("favicon") && !l.includes("chrome-extension");
    });
    if (realErrors.length === 0) {
      pass(`3: ${label} — zero console errors`);
    } else {
      fail(`3: ${label} — console errors`, realErrors.slice(0, 3).join(" | "));
    }

    await page.close();
  }

  await browser.close();
}

// ── CHECK 4: Gallery + mainpage sanity ───────────────────────────────────────
async function check4_galleryAndHome() {
  console.log("\n══ CHECK 4: /inspiration and home sanity ══");

  const browser = await launchBrowser();

  // 4a: /inspiration loads
  {
    const page = await browser.newPage();
    page.setDefaultTimeout(40000);
    const consoleErrors = [];
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));

    console.log(`  Loading ${BASE}/inspiration...`);
    await page.goto(`${BASE}/inspiration`, { waitUntil: "networkidle2", timeout: 40000 }).catch(() => {});
    await sleep(3000);

    // Check sarangani card shows replacement cover
    const SARA_SLUG = "sarangani-s-residence";
    const SARA_COVER = "/uploads/cms/20260725-347a9254ad.png";

    const saraSrcs = await page.evaluate((slug) => {
      return [...document.querySelectorAll("img")].map((i) => i.src || i.currentSrc || "").filter((s) => s && (s.includes(slug) || s.includes("347a9254ad") || s.includes("d32199ea8e")));
    }, SARA_SLUG);

    console.log(`  Sarangani card srcs on /inspiration: ${JSON.stringify(saraSrcs)}`);

    const saraHasCover = saraSrcs.some((s) => s.includes("347a9254ad"));
    const saraHasFB = saraSrcs.some((s) => s.includes("/images/projects-fb/sarangani"));

    if (saraHasFB) {
      fail("4a: Sarangani card uses replacement cover (not FB)", `FB src found: ${saraSrcs.filter(s => s.includes('/images/projects-fb/')).join(', ')}`);
    } else if (saraHasCover) {
      pass("4a: Sarangani card on /inspiration shows replacement cover", saraSrcs.find(s => s.includes("347a9254ad")));
    } else {
      warn("4a: Sarangani card", `Not found in viewport or off-screen. Srcs seen: ${saraSrcs.join(", ")}`);
    }

    const realErrors = consoleErrors.filter((e) => !e.toLowerCase().includes("favicon") && !e.toLowerCase().includes("chrome-extension"));
    if (realErrors.length === 0) {
      pass("4b: /inspiration zero console errors");
    } else {
      fail("4b: /inspiration console errors", realErrors.slice(0, 3).join(" | "));
    }

    const shotPath = `${SHOTS}/3d3197e-check4-inspiration.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Screenshot: ${shotPath}`);
    await page.close();
  }

  // 4b: home loads
  {
    const page = await browser.newPage();
    page.setDefaultTimeout(40000);
    const consoleErrors = [];
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));

    console.log(`  Loading ${BASE}/...`);
    await page.goto(`${BASE}/`, { waitUntil: "networkidle2", timeout: 40000 }).catch(() => {});
    await sleep(4000);

    // Check page rendered
    const title = await page.title().catch(() => "");
    console.log(`  Home title: ${title}`);
    if (title) {
      pass("4c: Home page loaded", `title="${title}"`);
    } else {
      fail("4c: Home page loaded", "No title found");
    }

    const realErrors = consoleErrors.filter((e) => !e.toLowerCase().includes("favicon") && !e.toLowerCase().includes("chrome-extension"));
    if (realErrors.length === 0) {
      pass("4d: Home zero console errors");
    } else {
      fail("4d: Home console errors", realErrors.slice(0, 3).join(" | "));
    }

    const shotPath = `${SHOTS}/3d3197e-check4-home.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Screenshot: ${shotPath}`);
    await page.close();
  }

  await browser.close();
}

// ── CHECK 5: Console errors on all pages ─────────────────────────────────────
async function check5_consoleErrors() {
  console.log("\n══ CHECK 5: Console errors — all key pages ══");

  const pages = [
    { url: `${BASE}/projects/sarangani-s-residence`, label: "sarangani detail" },
    { url: `${BASE}/projects/las-pinas-residence`, label: "las-pinas detail" },
    { url: `${BASE}/projects/nuvali-laguna-residence`, label: "nuvali detail" },
    { url: `${BASE}/inspiration`, label: "/inspiration" },
    { url: `${BASE}/`, label: "home" },
  ];

  const browser = await launchBrowser();

  for (const { url, label } of pages) {
    const page = await browser.newPage();
    page.setDefaultTimeout(40000);
    const errors = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(`PageError: ${err.message}`));

    await page.goto(url, { waitUntil: "networkidle2", timeout: 40000 }).catch((e) => {
      errors.push(`NavError: ${e.message}`);
    });
    await sleep(2000);

    const real = errors.filter((e) => {
      const l = e.toLowerCase();
      return !l.includes("favicon") && !l.includes("chrome-extension") && !l.includes("devtools") && !l.includes("preload");
    });

    if (real.length === 0) {
      pass(`5: Zero console errors — ${label}`);
    } else {
      fail(`5: Console errors — ${label}`, real.slice(0, 3).join(" | "));
      console.log(`    All errors (${real.length}):`)
      real.forEach((e) => console.log(`      - ${e.slice(0, 200)}`));
    }

    await page.close();
  }

  await browser.close();
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  LIVE VERIFICATION — fourlinq.ph — commit 3d3197e               ║");
  console.log("║  projectGalleryImages rendering in ProjectDetail                 ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");
  console.log(`  Date: ${new Date().toISOString()}`);
  console.log(`  Target: ${BASE}`);

  await check2_saranganiDetailPage().catch((e) => { console.error("CHECK2 ERROR:", e.message); fail("2: script error", e.message); });
  await check3_spotCheckProjects().catch((e) => { console.error("CHECK3 ERROR:", e.message); fail("3: script error", e.message); });
  await check4_galleryAndHome().catch((e) => { console.error("CHECK4 ERROR:", e.message); fail("4: script error", e.message); });
  await check5_consoleErrors().catch((e) => { console.error("CHECK5 ERROR:", e.message); fail("5: script error", e.message); });

  console.log("\n" + "═".repeat(66));
  console.log("FINAL SUMMARY");
  console.log("═".repeat(66));
  const passing = results.filter((r) => r.status === "pass");
  const failing = results.filter((r) => r.status === "fail");
  const warnings = results.filter((r) => r.status === "warn");
  console.log(`PASS: ${passing.length}  FAIL: ${failing.length}  WARN: ${warnings.length}`);
  if (failing.length > 0) {
    console.log("\nFailed checks:");
    failing.forEach((f) => console.log(`  - ${f.name}: ${f.reason}`));
  }
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(`  - ${w.name}: ${w.reason}`));
  }
  console.log("\nScreenshots saved to:", SHOTS);

  const outPath = `${SHOTS}/3d3197e-verify-results.json`;
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), commit: "3d3197e", results }, null, 2));
  console.log("Results JSON:", outPath);

  process.exit(failing.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

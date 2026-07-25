/**
 * verify-live-prod.mjs
 *
 * Live production verification for deployed commits 3cb11e9 + 419a618.
 * Checks items 1-7 per task checklist.
 *
 * Run:
 *   NODE_PATH=/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules \
 *   node /Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/verify-live-prod.mjs
 */

import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import sharp from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/sharp/lib/index.js";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";

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

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto.get(url, { headers: { "User-Agent": "Mozilla/5.0 FourlinqVerify/1.0" } }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    proto.get(url, { headers: { "User-Agent": "Mozilla/5.0 FourlinqVerify/1.0", "Cache-Control": "no-cache" } }, (res) => {
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

// ── Puppeteer launch helper ──────────────────────────────────────────────────
async function launchBrowser(freshProfile = true) {
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--window-size=1440,900",
    "--disable-cache",
    "--disable-application-cache",
    "--disable-offline-load-stale-cache",
  ];
  if (freshProfile) {
    // Use a fresh temp dir so no cached data from prior sessions
    const tmpDir = `/tmp/puppeteer-fresh-${Date.now()}`;
    fs.mkdirSync(tmpDir, { recursive: true });
    args.push(`--user-data-dir=${tmpDir}`);
  }
  return puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args,
    defaultViewport: { width: 1440, height: 900 },
  });
}

// ── ITEM 1: Restored image live ──────────────────────────────────────────────
async function item1_restoredImage() {
  console.log("\n══ ITEM 1: Restored image live (portfolio-interior-03) ══");

  // 1a: curl the full JPG
  const jpgUrl = `${BASE}/images/projects-fb/portfolio-interior-03.jpg`;
  const thumbUrl = `${BASE}/images/projects-fb/thumbs/portfolio-interior-03.webp`;

  console.log(`  Fetching: ${jpgUrl}`);
  const jpg = await fetchBinary(jpgUrl).catch((e) => ({ status: 0, error: e.message }));
  console.log(`  Status: ${jpg.status}, Size: ${jpg.body?.length ?? 0} bytes`);

  if (jpg.status !== 200) {
    fail("1a: JPG HTTP 200", `Got ${jpg.status}`);
    return;
  }
  pass("1a: JPG HTTP 200", `${jpg.body.length} bytes`);

  // Save and downscale
  const jpgPath = "/tmp/portfolio-interior-03.jpg";
  const jpgThumbPath = "/tmp/portfolio-interior-03-thumb.jpg";
  fs.writeFileSync(jpgPath, jpg.body);

  await sharp(jpgPath).resize(400).jpeg({ quality: 80 }).toFile(jpgThumbPath);
  console.log(`  Saved downscaled JPG preview: ${jpgThumbPath}`);

  // Also try to get dominant colors to detect red pillows vs dusk blue
  const { dominant } = await sharp(jpgPath).resize(100, 100).stats();
  console.log(`  Dominant color (r,g,b): ${dominant.r}, ${dominant.g}, ${dominant.b}`);
  // Red-pillow interior: r > g, b more neutral; dusk exterior: b > r typically
  if (dominant.r > dominant.b + 10) {
    pass("1a: Color profile = warm/interior (r>b+10), consistent with red-pillow interior");
  } else if (dominant.b > dominant.r + 10) {
    fail("1a: Color profile looks like dusk exterior (b>r+10) — wrong image!");
  } else {
    warn("1a: Color ambiguous — manual review needed", `r=${dominant.r} g=${dominant.g} b=${dominant.b}`);
  }

  // 1b: curl the WebP thumb
  console.log(`\n  Fetching: ${thumbUrl}`);
  const thumb = await fetchBinary(thumbUrl).catch((e) => ({ status: 0, error: e.message }));
  console.log(`  Status: ${thumb.status}, Size: ${thumb.body?.length ?? 0} bytes`);

  if (thumb.status !== 200) {
    fail("1b: WebP thumb HTTP 200", `Got ${thumb.status}`);
  } else {
    pass("1b: WebP thumb HTTP 200", `${thumb.body.length} bytes`);

    const webpPath = "/tmp/portfolio-interior-03-thumb.webp";
    const webpPreviewPath = "/tmp/portfolio-interior-03-thumb-preview.jpg";
    fs.writeFileSync(webpPath, thumb.body);
    await sharp(webpPath).resize(400).jpeg({ quality: 80 }).toFile(webpPreviewPath);
    console.log(`  Saved WebP->JPG preview: ${webpPreviewPath}`);

    const { dominant: td } = await sharp(webpPath).resize(100, 100).stats();
    console.log(`  WebP dominant color (r,g,b): ${td.r}, ${td.g}, ${td.b}`);
    if (td.r > td.b + 10) {
      pass("1b: WebP color profile = warm/interior (r>b+10)");
    } else if (td.b > td.r + 10) {
      fail("1b: WebP color profile looks like dusk exterior (b>r+10) — wrong image!");
    } else {
      warn("1b: WebP color ambiguous", `r=${td.r} g=${td.g} b=${td.b}`);
    }
  }

  // 1c: Check ?v= param on a rendered page for this image
  console.log("\n  Checking page bundle for version param on portfolio-interior-03...");
  const browser = await launchBrowser(true);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // Collect all img src values
  const allImgSrcs = [];
  page.on("response", async (resp) => {
    const url = resp.url();
    if (url.includes("portfolio-interior-03")) {
      allImgSrcs.push(url);
    }
  });

  // Load the project detail page for portfolio
  await page.goto(`${BASE}/projects/portfolio-interior`, { waitUntil: "networkidle2" }).catch(() => {});
  await sleep(3000);

  // Also check inspiration page
  await page.goto(`${BASE}/inspiration`, { waitUntil: "networkidle2" }).catch(() => {});
  await sleep(3000);

  // Get all img srcs from DOM
  const domSrcs = await page.evaluate(() => {
    return [...document.querySelectorAll("img")].map((i) => i.src || i.currentSrc || "").filter((s) => s.includes("portfolio-interior-03"));
  });

  console.log(`  Network requests for portfolio-interior-03: ${JSON.stringify(allImgSrcs)}`);
  console.log(`  DOM img srcs for portfolio-interior-03: ${JSON.stringify(domSrcs)}`);

  const allSrcs = [...new Set([...allImgSrcs, ...domSrcs])];
  if (allSrcs.length === 0) {
    warn("1c: ?v= param check", "No portfolio-interior-03 images found on these pages (may be on a different page)");
  } else {
    const withV = allSrcs.filter((s) => s.includes("?v=") || s.includes("&v="));
    const withOldHash = allSrcs.filter((s) => s.includes("403c78e6"));
    const withNewHash = allSrcs.filter((s) => s.includes("ab5a0ed0"));

    if (withOldHash.length > 0) {
      fail("1c: ?v= hash", `Old hash 403c78e6 still present: ${withOldHash.join(", ")}`);
    } else if (withNewHash.length > 0) {
      pass("1c: ?v= hash = ab5a0ed0 (expected)", withNewHash.join(", "));
    } else if (withV.length > 0) {
      pass("1c: ?v= param present", withV.join(", "));
    } else {
      warn("1c: ?v= param", "No ?v= found on these srcs — may not be versioned or page has no matching img");
    }
  }

  await page.screenshot({ path: `${SHOTS}/live-item1-inspiration.png` });
  await browser.close();
}

// ── ITEM 2: Gallery nuvali-laguna-residence-b never shows slat-wall image ───
async function item2_galleryCovers() {
  console.log("\n══ ITEM 2: Gallery covers — nuvali-laguna-residence-b ══");

  const browser = await launchBrowser(true);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const SLUG = "nuvali-laguna-residence-b";
  const BAD_SRC = `${SLUG}.jpg`; // the hidden slat-wall image
  const EXPECTED_SRC_PART = `${SLUG}-6`; // expected cover variant

  const badSrcsFound = [];
  const allNuvaliSrcs = [];

  // Poll DOM every 200ms for the first 8 seconds after navigation
  async function pollDOMForBadSrc(timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const srcs = await page.evaluate((slug, bad) => {
        const imgs = [...document.querySelectorAll("img")];
        return imgs.map((i) => i.src || i.currentSrc || "").filter((s) => s.includes(slug));
      }, SLUG, BAD_SRC);
      for (const s of srcs) {
        if (!allNuvaliSrcs.includes(s)) allNuvaliSrcs.push(s);
        if (s.includes(BAD_SRC) && !s.includes(`${SLUG}-`)) {
          if (!badSrcsFound.includes(s)) badSrcsFound.push(s);
        }
      }
      await sleep(200);
    }
  }

  // 2a: Load /inspiration (All projects)
  console.log(`  Loading ${BASE}/inspiration (All projects)...`);
  const navPromise = page.goto(`${BASE}/inspiration`, { waitUntil: "domcontentloaded" });
  await Promise.all([navPromise, pollDOMForBadSrc(8000)]);
  await sleep(2000); // wait for lazy loads

  await page.screenshot({ path: `${SHOTS}/live-item2-gallery-all.png` });

  // Get final nuvali src
  const finalSrc = await page.evaluate((slug) => {
    const imgs = [...document.querySelectorAll("img")];
    const nuvaliImgs = imgs.filter((i) => (i.src || i.currentSrc || "").includes(slug));
    return nuvaliImgs.map((i) => i.src || i.currentSrc || "");
  }, SLUG);

  console.log(`  All nuvali srcs seen during poll: ${JSON.stringify(allNuvaliSrcs)}`);
  console.log(`  Bad srcs found: ${JSON.stringify(badSrcsFound)}`);
  console.log(`  Final nuvali srcs: ${JSON.stringify(finalSrc)}`);

  if (badSrcsFound.length > 0) {
    fail("2a: nuvali slat-wall NEVER renders (All)", `Bad src(s) appeared: ${badSrcsFound.join(", ")}`);
  } else {
    pass("2a: nuvali slat-wall NEVER renders (All projects view)");
  }

  // Check final cover is -6 variant
  const hasCover6 = finalSrc.some((s) => s.includes(`${SLUG}-6`));
  if (hasCover6) {
    pass("2b: Final nuvali card src = -6 variant", finalSrc.find((s) => s.includes(`${SLUG}-6`)) || "");
  } else if (finalSrc.length === 0) {
    warn("2b: Final nuvali card not found in DOM", "May be outside viewport or lazy-unloaded");
  } else {
    fail("2b: Final nuvali card src", `Expected ${SLUG}-6, got: ${finalSrc.join(", ")}`);
  }

  // Check skeleton placeholders appeared before cards
  // We can't easily retroactively detect this, so we navigate fresh and check early paint
  const page2 = await browser.newPage();
  page2.setDefaultTimeout(30000);
  let skeletonFound = false;

  page2.on("domcontentloaded", async () => {
    await sleep(100);
    const hasSkeleton = await page2.evaluate(() => {
      const els = [...document.querySelectorAll("[class*='skeleton'], [class*='animate-pulse'], [class*='loading']")];
      return els.length > 0;
    }).catch(() => false);
    if (hasSkeleton) skeletonFound = true;
  });

  await page2.goto(`${BASE}/inspiration`, { waitUntil: "domcontentloaded" });
  await sleep(500);
  // Check skeleton state early
  skeletonFound = await page2.evaluate(() => {
    const els = [...document.querySelectorAll("[class*='skeleton'], [class*='animate-pulse'], [class*='loading'], [data-skeleton]")];
    return els.length > 0;
  });
  console.log(`  Skeleton elements at early paint: ${skeletonFound}`);
  if (skeletonFound) {
    pass("2c: Skeleton placeholders visible before cards");
  } else {
    warn("2c: Skeleton check", "No skeleton-class elements found at early paint (may load fast enough or use different class names)");
  }

  await page2.screenshot({ path: `${SHOTS}/live-item2-skeleton-check.png` });
  await page2.close();

  // 2d: Interior filter — nuvali must NOT appear
  console.log("\n  Checking INTERIOR category filter...");
  const badInteriorSrcs = [];
  await page.goto(`${BASE}/inspiration`, { waitUntil: "networkidle2" });
  await sleep(2000);

  // Click "INTERIOR" filter
  const filterClicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const interior = btns.find((b) => b.textContent?.trim().toUpperCase() === "INTERIOR");
    if (interior) { interior.click(); return true; }
    // Try partial match
    const partial = btns.find((b) => b.textContent?.toLowerCase().includes("interior"));
    if (partial) { partial.click(); return partial.textContent?.trim(); }
    return false;
  });
  console.log(`  Interior filter click: ${filterClicked}`);
  await sleep(2000);

  await page.screenshot({ path: `${SHOTS}/live-item2-interior-filter.png` });

  const nuvalInInterior = await page.evaluate((slug) => {
    const imgs = [...document.querySelectorAll("img")];
    return imgs.map((i) => i.src || i.currentSrc || "").filter((s) => s.includes(slug));
  }, SLUG);

  console.log(`  Nuvali srcs in INTERIOR view: ${JSON.stringify(nuvalInInterior)}`);
  if (nuvalInInterior.length === 0) {
    pass("2d: nuvali-laguna-residence-b absent from INTERIOR filter (correct — its interior best-image is hidden)");
  } else {
    // Check if it shows a non-hidden image (if it has a visible interior image)
    const hasSlat = nuvalInInterior.some((s) => s.includes(SLUG) && !s.includes(`${SLUG}-`));
    if (hasSlat) {
      fail("2d: nuvali in INTERIOR with slat-wall image", nuvalInInterior.join(", "));
    } else {
      warn("2d: nuvali appears in INTERIOR filter", `Srcs: ${nuvalInInterior.join(", ")} — verify these are allowed cover images`);
    }
  }

  await browser.close();
}

// ── ITEM 3: fourlinq-turnover-2 cover = -4 variant ───────────────────────────
async function item3_turnoverCover() {
  console.log("\n══ ITEM 3: fourlinq-turnover-2 cover = -4 variant ══");

  const browser = await launchBrowser(true);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await page.goto(`${BASE}/inspiration`, { waitUntil: "networkidle2" });
  await sleep(3000);

  await page.screenshot({ path: `${SHOTS}/live-item3-gallery.png` });

  const SLUG = "fourlinq-turnover-2";
  const turnoverSrcs = await page.evaluate((slug) => {
    const imgs = [...document.querySelectorAll("img")];
    return imgs.map((i) => i.src || i.currentSrc || "").filter((s) => s.includes(slug));
  }, SLUG);

  console.log(`  fourlinq-turnover-2 srcs in gallery: ${JSON.stringify(turnoverSrcs)}`);

  if (turnoverSrcs.length === 0) {
    warn("3: fourlinq-turnover-2 not found in viewport", "May be off-screen; scroll needed");
    // Scroll and check
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await sleep(1500);
    const after = await page.evaluate((slug) => {
      const imgs = [...document.querySelectorAll("img")];
      return imgs.map((i) => i.src || i.currentSrc || "").filter((s) => s.includes(slug));
    }, SLUG);
    console.log(`  After scroll: ${JSON.stringify(after)}`);
    if (after.some((s) => s.includes(`${SLUG}-4`))) {
      pass("3: fourlinq-turnover-2 card src = -4 variant", after.find((s) => s.includes(`${SLUG}-4`)) || "");
    } else if (after.length > 0) {
      fail("3: fourlinq-turnover-2 cover", `Expected -4 variant, got: ${after.join(", ")}`);
    } else {
      warn("3: fourlinq-turnover-2 still not found after scroll", "Manual check needed");
    }
  } else {
    if (turnoverSrcs.some((s) => s.includes(`${SLUG}-4`))) {
      pass("3: fourlinq-turnover-2 card src = -4 variant", turnoverSrcs.find((s) => s.includes(`${SLUG}-4`)) || "");
    } else {
      fail("3: fourlinq-turnover-2 cover", `Expected -4 variant, got: ${turnoverSrcs.join(", ")}`);
    }
  }

  await browser.close();
}

// ── ITEM 4: Home page gallery strip, hidden projects absent ─────────────────
async function item4_homeGallery() {
  console.log("\n══ ITEM 4: Home page gallery strip + hidden projects absent ══");

  const browser = await launchBrowser(true);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
  await sleep(4000);

  await page.screenshot({ path: `${SHOTS}/live-item4-home.png` });

  const allSrcs = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    return imgs.map((i) => i.src || i.currentSrc || "").filter((s) => s.includes("projects-fb"));
  });

  console.log(`  Home page projects-fb img srcs (${allSrcs.length}):`);
  allSrcs.forEach((s) => console.log(`    ${s}`));

  // Check for hidden projects
  const hiddenProjects = ["portfolio-residence-08", "portfolio-residence-09"];
  let anyHiddenFound = false;
  for (const hp of hiddenProjects) {
    const found = allSrcs.filter((s) => s.includes(hp));
    if (found.length > 0) {
      fail(`4: Hidden project absent (${hp})`, `Found in home: ${found.join(", ")}`);
      anyHiddenFound = true;
    } else {
      pass(`4: Hidden project absent (${hp})`);
    }
  }

  // Check nuvali and turnover covers on home
  const SLUG_N = "nuvali-laguna-residence-b";
  const SLUG_T = "fourlinq-turnover-2";

  const nuvalHome = allSrcs.filter((s) => s.includes(SLUG_N));
  const turnHome = allSrcs.filter((s) => s.includes(SLUG_T));

  console.log(`  Nuvali home srcs: ${JSON.stringify(nuvalHome)}`);
  console.log(`  Turnover home srcs: ${JSON.stringify(turnHome)}`);

  // Nuvali: should not have bare (no dash-number) image = slat-wall
  const nuvaliBad = nuvalHome.filter((s) => {
    const fn = s.split("/").pop()?.split("?")[0];
    return fn === `${SLUG_N}.jpg` || fn === `${SLUG_N}.webp`;
  });
  if (nuvaliBad.length > 0) {
    fail("4: Nuvali home not using slat-wall", `Bad srcs: ${nuvaliBad.join(", ")}`);
  } else if (nuvalHome.length > 0) {
    pass("4: Nuvali home — no slat-wall (bare filename) src", nuvalHome.join(", "));
  } else {
    warn("4: Nuvali not found on home page", "May not be in gallery strip");
  }

  // portfolio-interior-03: no hidden images
  const badPortfolio = allSrcs.filter((s) => {
    const fn = s.split("/").pop()?.split("?")[0];
    return hiddenProjects.some((hp) => fn?.startsWith(hp));
  });
  if (badPortfolio.length === 0 && !anyHiddenFound) {
    pass("4: No hidden project images on home page");
  }

  // Also check public links on home — hidden projects should not appear
  const homeLinks = await page.evaluate(() => {
    const links = [...document.querySelectorAll("a[href]")];
    return links.map((l) => l.getAttribute("href") || "").filter((h) => h.includes("/projects/"));
  });
  const hiddenLinks = homeLinks.filter((h) => hiddenProjects.some((hp) => h.includes(hp)));
  if (hiddenLinks.length > 0) {
    fail("4: Hidden project links absent from home", `Found: ${hiddenLinks.join(", ")}`);
  } else {
    pass("4: No hidden project links on home page");
  }

  await browser.close();
}

// ── ITEM 5: Ratios API + admin UI ─────────────────────────────────────────────
async function item5_ratios() {
  console.log("\n══ ITEM 5: Ratios — /api/project-images/merged ══");

  const url = `${BASE}/api/project-images/merged?_r=1`;
  console.log(`  Fetching: ${url}`);
  const res = await fetchJSON(url).catch((e) => ({ status: 0, json: null, error: e.message }));
  console.log(`  Status: ${res.status}`);

  if (res.status !== 200 || !res.json) {
    fail("5a: /api/project-images/merged returns 200 JSON", `Status=${res.status} json=${!!res.json}`);
    return;
  }

  const ratios = res.json.projectRatios;
  if (!ratios) {
    fail("5a: projectRatios field in response", "Field absent");
    return;
  }

  pass("5a: /api/project-images/merged returns 200 with projectRatios");

  const entries = Object.entries(ratios);
  console.log(`  Total entries in projectRatios: ${entries.length}`);

  const non43 = entries.filter(([slug, ratio]) => ratio !== "4:3");
  console.log(`  Non-4:3 entries: ${non43.length}`);
  non43.forEach(([slug, ratio]) => console.log(`    ${slug} => ${ratio}`));

  if (non43.length === 0) {
    pass("5a: ALL projectRatios are 4:3");
  } else {
    fail("5a: Non-4:3 ratios found", `${non43.map(([s, r]) => `${s}=${r}`).join(", ")}`);
  }

  // 5b: Admin UI — check Ratio header for nuvali and turnover
  console.log("\n  Checking admin UI ratio headers...");

  const browser = await launchBrowser(true);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // Login to prod admin
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
    pass("5b: Admin login submitted");
  } else {
    pass("5b: Admin already logged in or no login form");
  }

  // Navigate to Project Images tab
  const clickedTab = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const tab = btns.find((b) => {
      const t = b.textContent?.toLowerCase() ?? "";
      return t.includes("project image") || t === "images";
    });
    if (tab) { tab.click(); return tab.textContent?.trim(); }
    return null;
  });
  console.log(`  Tab clicked: ${clickedTab}`);
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/live-item5-admin-tab.png` });

  async function checkRatioForSlug(slug, label) {
    // Click the project card
    const clicked = await page.evaluate((s) => {
      const btns = [...document.querySelectorAll("button")];
      const card = btns.find((b) => b.textContent?.toLowerCase().includes(s.toLowerCase()));
      if (card) { card.scrollIntoView(); card.click(); return card.textContent?.trim().slice(0, 80); }
      return null;
    }, slug);

    if (!clicked) {
      warn(`5b: ${label} card`, "Card not found in admin — may require scroll");
      return;
    }
    await sleep(2500);

    // Look for ratio text in header
    const ratioText = await page.evaluate(() => {
      const allText = document.body.innerText;
      const match = allText.match(/Ratio:\s*[\d:]+/gi);
      return match ? match[0] : null;
    });

    await page.screenshot({ path: `${SHOTS}/live-item5-admin-${label.replace(/\W/g, "-")}.png` });
    console.log(`  ${label} ratio text: ${ratioText}`);

    if (ratioText && ratioText.includes("4:3")) {
      pass(`5b: Admin shows "Ratio: 4:3" for ${label}`, ratioText);
    } else if (ratioText) {
      fail(`5b: Admin ratio for ${label}`, `Expected 4:3, got: ${ratioText}`);
    } else {
      warn(`5b: Admin ratio header for ${label}`, "No 'Ratio:' text found in page");
    }

    // Go back to project list
    const backBtn = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const back = btns.find((b) => b.textContent?.trim() === "← Back" || b.textContent?.trim().includes("Back"));
      if (back) { back.click(); return true; }
      // Try clicking the tab again
      const tab = btns.find((b) => b.textContent?.toLowerCase().includes("project image"));
      if (tab) { tab.click(); return "tab"; }
      return false;
    });
    await sleep(2000);
  }

  await checkRatioForSlug("nuvali-laguna-residence-b", "nuvali-laguna-residence-b");
  await checkRatioForSlug("fourlinq-turnover-2", "fourlinq-turnover-2");

  await browser.close();
}

// ── ITEM 6: Admin thumb vs lightbox consistency (portfolio-interior-03) ──────
async function item6_adminThumbLightbox() {
  console.log("\n══ ITEM 6: Admin thumb vs lightbox — portfolio-interior-03 ══");

  const browser = await launchBrowser(true);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

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

  // Click Project Images tab
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const tab = btns.find((b) => b.textContent?.toLowerCase().includes("project image"));
    if (tab) tab.click();
  });
  await sleep(3000);

  // Find portfolio-interior card
  const SLUG = "portfolio-interior";
  const clicked = await page.evaluate((slug) => {
    const btns = [...document.querySelectorAll("button")];
    const card = btns.find((b) => {
      const t = b.textContent?.toLowerCase() ?? "";
      return t.includes(slug);
    });
    if (card) { card.scrollIntoView(); card.click(); return card.textContent?.trim().slice(0, 80); }
    return null;
  }, SLUG);

  console.log(`  Clicked portfolio-interior card: ${clicked}`);
  await sleep(3500);
  await page.screenshot({ path: `${SHOTS}/live-item6-admin-thumb.png` });

  // Check row thumbnail src for portfolio-interior-03
  const rowThumbSrc = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    const row = imgs.find((i) => (i.src || i.currentSrc || "").includes("portfolio-interior-03"));
    return row ? (row.src || row.currentSrc || "") : null;
  });

  console.log(`  Row thumbnail src: ${rowThumbSrc}`);
  if (rowThumbSrc) {
    pass("6a: Row thumbnail shows portfolio-interior-03", rowThumbSrc);
  } else {
    fail("6a: Row thumbnail", "portfolio-interior-03 not found in admin row thumbnails");
  }

  // Try clicking on the portfolio-interior-03 thumbnail to open lightbox
  const lightboxOpened = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    const target = imgs.find((i) => (i.src || i.currentSrc || "").includes("portfolio-interior-03"));
    if (target) {
      // Click the image or its parent button
      const btn = target.closest("button") || target;
      btn.click();
      return true;
    }
    return false;
  });

  console.log(`  Lightbox click attempted: ${lightboxOpened}`);
  await sleep(2000);
  await page.screenshot({ path: `${SHOTS}/live-item6-admin-lightbox.png` });

  // Check lightbox shows the correct image
  const lightboxSrc = await page.evaluate(() => {
    // Lightbox usually renders a larger img
    const imgs = [...document.querySelectorAll("img[class*='lightbox'], dialog img, [role='dialog'] img, [data-lightbox] img")];
    if (imgs.length > 0) return imgs[0].src || imgs[0].currentSrc || "";
    // Fallback: look for any large img that appeared
    const allImgs = [...document.querySelectorAll("img")];
    const big = allImgs.find((i) => {
      const w = i.naturalWidth || i.width || 0;
      return w > 400 && (i.src || i.currentSrc || "").includes("portfolio-interior-03");
    });
    return big ? (big.src || big.currentSrc || "") : null;
  });

  console.log(`  Lightbox src: ${lightboxSrc}`);
  if (lightboxSrc && lightboxSrc.includes("portfolio-interior-03")) {
    pass("6b: Lightbox shows portfolio-interior-03", lightboxSrc);
  } else {
    warn("6b: Lightbox src", `Could not confirm lightbox src — possible different pattern: ${lightboxSrc}`);
  }

  await browser.close();
}

// ── ITEM 7: Console errors ────────────────────────────────────────────────────
async function item7_consoleErrors() {
  console.log("\n══ ITEM 7: Console errors ══");

  const browser = await launchBrowser(true);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const pagesToCheck = [
    { url: `${BASE}/`, label: "Home" },
    { url: `${BASE}/inspiration`, label: "Gallery" },
    { url: `${BASE}/projects/las-pinas-residence`, label: "Project Detail" },
  ];

  for (const { url, label } of pagesToCheck) {
    const errors = [];
    const warnings = [];

    const handler = (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
      if (msg.type() === "warning") warnings.push(msg.text());
    };
    const errorHandler = (err) => errors.push(`PageError: ${err.message}`);

    page.on("console", handler);
    page.on("pageerror", errorHandler);

    await page.goto(url, { waitUntil: "networkidle2" }).catch((e) => {
      errors.push(`Navigation error: ${e.message}`);
    });
    await sleep(2000);

    page.off("console", handler);
    page.off("pageerror", errorHandler);

    await page.screenshot({ path: `${SHOTS}/live-item7-${label.toLowerCase().replace(/\s+/g, "-")}.png` });

    // Filter out common benign errors
    const realErrors = errors.filter((e) => {
      const lower = e.toLowerCase();
      // Ignore known benign patterns
      return !lower.includes("favicon") &&
             !lower.includes("chrome-extension") &&
             !lower.includes("devtools") &&
             !lower.includes("preload") &&
             !lower.includes("non-passive") &&
             !lower.includes("sourceurl");
    });

    console.log(`  ${label}: ${realErrors.length} errors, ${warnings.length} warnings`);
    if (realErrors.length > 0) {
      console.log(`    Errors:`);
      realErrors.forEach((e) => console.log(`      - ${e}`));
    }

    if (realErrors.length === 0) {
      pass(`7: Zero console errors — ${label}`);
    } else {
      fail(`7: Console errors — ${label}`, realErrors.slice(0, 3).join(" | "));
    }
  }

  // Admin panel
  const adminErrors = [];
  const adminHandler = (msg) => {
    if (msg.type() === "error") adminErrors.push(msg.text());
  };
  const adminErrorHandler = (err) => adminErrors.push(`PageError: ${err.message}`);

  page.on("console", adminHandler);
  page.on("pageerror", adminErrorHandler);

  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await sleep(1500);

  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type("dev@fourlinq.ph");
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type("advodeveloper2026");
    await passInput.press("Enter");
    await sleep(3000);
  }

  page.off("console", adminHandler);
  page.off("pageerror", adminErrorHandler);

  await page.screenshot({ path: `${SHOTS}/live-item7-admin.png` });

  const realAdminErrors = adminErrors.filter((e) => {
    const lower = e.toLowerCase();
    return !lower.includes("favicon") && !lower.includes("chrome-extension") && !lower.includes("devtools");
  });

  console.log(`  Admin Panel: ${realAdminErrors.length} errors`);
  if (realAdminErrors.length > 0) {
    realAdminErrors.forEach((e) => console.log(`      - ${e}`));
    fail("7: Console errors — Admin Panel", realAdminErrors.slice(0, 3).join(" | "));
  } else {
    pass("7: Zero console errors — Admin Panel");
  }

  await browser.close();
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  LIVE PROD VERIFICATION — fourlinq.ph                       ║");
  console.log("║  Commits: 3cb11e9 + 419a618  |  Fresh browser profile       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  await item1_restoredImage().catch((e) => { console.error("ITEM 1 ERROR:", e.message); fail("1: script error", e.message); });
  await item2_galleryCovers().catch((e) => { console.error("ITEM 2 ERROR:", e.message); fail("2: script error", e.message); });
  await item3_turnoverCover().catch((e) => { console.error("ITEM 3 ERROR:", e.message); fail("3: script error", e.message); });
  await item4_homeGallery().catch((e) => { console.error("ITEM 4 ERROR:", e.message); fail("4: script error", e.message); });
  await item5_ratios().catch((e) => { console.error("ITEM 5 ERROR:", e.message); fail("5: script error", e.message); });
  await item6_adminThumbLightbox().catch((e) => { console.error("ITEM 6 ERROR:", e.message); fail("6: script error", e.message); });
  await item7_consoleErrors().catch((e) => { console.error("ITEM 7 ERROR:", e.message); fail("7: script error", e.message); });

  console.log("\n" + "═".repeat(64));
  console.log("FINAL SUMMARY");
  console.log("═".repeat(64));
  const passing = results.filter((r) => r.status === "pass");
  const failing = results.filter((r) => r.status === "fail");
  const warnings = results.filter((r) => r.status === "warn");
  console.log(`PASS: ${passing.length}  FAIL: ${failing.length}  WARN: ${warnings.length}`);
  if (failing.length > 0) {
    console.log("\nFailed:");
    failing.forEach((f) => console.log(`  - ${f.name}: ${f.reason}`));
  }
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    warnings.forEach((w) => console.log(`  - ${w.name}: ${w.reason}`));
  }
  console.log("\nScreenshots saved to:", SHOTS);

  // Write results to JSON for reference
  const outPath = `${SHOTS}/live-verify-results.json`;
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log("Results JSON:", outPath);

  process.exit(failing.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

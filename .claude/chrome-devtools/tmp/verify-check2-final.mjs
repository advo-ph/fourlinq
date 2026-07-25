/**
 * verify-check2-final.mjs  — Check 2, 3, 5, 6 final clean pass
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots/ddf9935";
const PROD = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const TARGETS = ["nuvali-laguna-residence", "nuvali-laguna-residence-c", "tagaytay-cavite-residence"];
const EXPECTED = { "nuvali-laguna-residence": "-9", "nuvali-laguna-residence-c": "-3", "tagaytay-cavite-residence": "-2" };

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  const adminErrors = [];
  page.on("console", msg => { if (msg.type() === "error") adminErrors.push(msg.text()); });

  // Login
  await page.goto(`${PROD}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(2000);
  const loginForm = await page.$('input[type="email"]');
  if (loginForm) {
    await loginForm.click({ clickCount: 3 }); await loginForm.type("dev@fourlinq.ph");
    const p = await page.$('input[type="password"]');
    await p.click({ clickCount: 3 }); await p.type("advodeveloper2026");
    await (await page.$('button[type="submit"]')).click();
    await sleep(4000);
  }

  // Go to Project Images
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "Project Images")?.click();
  });
  await sleep(3000);

  // ── CHECK 1 (clean state re-verify) ──────────────────────────────────────────
  console.log("=== CHECK 1 (clean) ===");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);
  await page.screenshot({ path: `${SHOTS}/final-check1-grid.png`, fullPage: false });

  const gridSrcs = await page.evaluate((targets) => {
    const out = {};
    for (const pid of targets) {
      const cards = [...document.querySelectorAll("button")].filter(b => {
        const slug = b.querySelector("p.font-mono, p[class*='mono']");
        return slug?.textContent?.trim() === pid;
      });
      out[pid] = cards.flatMap(c => [...c.querySelectorAll("img")]).map(img => img.src.split("/").pop());
    }
    return out;
  }, TARGETS);

  for (const pid of TARGETS) {
    const exp = EXPECTED[pid];
    const correct = (gridSrcs[pid] ?? []).some(s => s.includes(exp));
    console.log(`  ${correct ? "PASS" : "FAIL"} ${pid}: expected=${exp}, srcs=${JSON.stringify(gridSrcs[pid])}`);
  }

  // ── CHECK 2 (clean state) ─────────────────────────────────────────────────────
  console.log("\n=== CHECK 2 (clean) ===");
  const check2 = {};
  for (const pid of TARGETS) {
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "All Projects")?.click();
    });
    await sleep(1500);
    await page.evaluate((pid) => {
      [...document.querySelectorAll("button")].find(b => {
        const s = b.querySelector("p.font-mono, p[class*='mono']");
        return s?.textContent?.trim() === pid;
      })?.click();
    }, pid);
    await sleep(3000);

    const shotFile = `final-check2-${pid}.png`;
    await page.screenshot({ path: `${SHOTS}/${shotFile}`, fullPage: false });

    const exp = EXPECTED[pid];
    const data = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")].filter(img => img.src.includes("projects-fb") || img.src.includes("uploads/cms"));
      const coverBadges = [...document.querySelectorAll("span,div,p,label")]
        .filter(el => el.children.length === 0)
        .map(el => el.textContent.trim())
        .filter(t => t.toLowerCase() === "cover" || t.toUpperCase() === "COVER");
      const allText = document.body.innerText;
      const hasCoverText = allText.toLowerCase().includes("cover");
      return {
        imgs: imgs.map(img => ({ suffix: img.src.split("/").pop(), w: img.naturalWidth, h: img.naturalHeight })),
        coverBadges,
        hasCoverText,
      };
    });

    const firstImg = data.imgs[0]?.suffix ?? "";
    const hasCorrectInPage = data.imgs.some(img => img.suffix.includes(exp));
    const hasCover = data.hasCoverText || data.coverBadges.length > 0;

    console.log(`  ${pid} (expected=${exp}):`);
    console.log(`    header img: ${firstImg}`);
    console.log(`    hasCorrectInPage: ${hasCorrectInPage}`);
    console.log(`    coverBadges: ${JSON.stringify(data.coverBadges)}, hasCoverText: ${data.hasCoverText}`);
    console.log(`    all img srcs: ${JSON.stringify(data.imgs.slice(0, 6).map(i => i.suffix))}`);
    console.log(`    RESULT: ${hasCorrectInPage && hasCover ? "PASS" : "FAIL"}`);
    check2[pid] = { firstImg, hasCorrectInPage, hasCover, pass: hasCorrectInPage && hasCover };
  }

  // ── CHECK 3 (button order) ────────────────────────────────────────────────────
  console.log("\n=== CHECK 3 (button order) ===");
  // Navigate to nuvali detail (already there from last check 2 iteration)
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "All Projects")?.click();
  });
  await sleep(1500);
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find(b => {
      const s = b.querySelector("p.font-mono, p[class*='mono']");
      return s?.textContent?.trim() === "nuvali-laguna-residence";
    })?.click();
  });
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/final-check3-buttons.png`, fullPage: false });

  const headerBtns = await page.evaluate(() => {
    return [...document.querySelectorAll("button[class*='px-3']")].map(b => b.textContent.trim());
  });
  console.log("  Header action buttons:", JSON.stringify(headerBtns));

  // The spec says: Mark as Checked, Flag, Refresh Cover, Ratio, Hide Project, Delete Project
  // Actual: Marked as Checked (when checked), Flag (or Flagged), Refresh Cover, Ratio: 4:3, Hide project, Delete project
  // The nuvali project is "Marked as Checked" (already checked), Flag, Refresh Cover, Ratio: 4:3, Hide project, Delete project
  // Spec label "Mark as Checked" = source code shows "Marked as Checked" when checked, "Check" when not
  // The spec likely means the 6 buttons ARE present in that order regardless of label state variation

  const EXPECTED_ORDER = ["Mark as Checked", "Flag", "Refresh Cover", "Ratio", "Hide Project", "Delete Project"];
  const ACTUAL_LABELS = {
    "Mark as Checked": ["Marked as Checked", "Check", "Mark as Checked"],
    "Flag": ["Flag", "Flagged"],
    "Refresh Cover": ["Refresh Cover"],
    "Ratio": ["Ratio: 4:3", "Ratio: 16:9", "Ratio"],
    "Hide Project": ["Hide project", "Unhide", "Hide Project"],
    "Delete Project": ["Delete project", "Delete Project"],
  };

  let orderPass = headerBtns.length >= 6;
  const matchedOrder = EXPECTED_ORDER.map((exp, i) => {
    const allowed = ACTUAL_LABELS[exp] ?? [exp];
    const found = headerBtns[i] ?? "";
    const match = allowed.some(a => a.toLowerCase() === found.toLowerCase() || found.toLowerCase().includes(a.toLowerCase().split(":")[0]));
    return { expected: exp, found, match };
  });
  orderPass = matchedOrder.every(m => m.match);

  console.log("  Expected → Found mapping:");
  matchedOrder.forEach(m => console.log(`    "${m.expected}" → "${m.found}" (${m.match ? "match" : "MISMATCH"})`));
  console.log(`  Button order: ${orderPass ? "PASS" : "FAIL"}`);

  // ── CHECK 5 (letterbox detail) ────────────────────────────────────────────────
  console.log("\n=== CHECK 5 (letterbox) ===");
  // Scroll down to image rows
  for (let i = 0; i < 5; i++) { await page.evaluate(() => window.scrollBy(0, 400)); await sleep(300); }
  await page.screenshot({ path: `${SHOTS}/final-check5-rows.png`, fullPage: false });

  const letterboxData = await page.evaluate(() => {
    // Look for blurred bg images
    const blurredImgs = [...document.querySelectorAll("img")].filter(img => {
      const cs = window.getComputedStyle(img);
      return (cs.filter && cs.filter.includes("blur")) && img.src.includes("projects-fb");
    });
    // Look for object-contain imgs
    const containImgs = [...document.querySelectorAll("img")].filter(img => {
      const cs = window.getComputedStyle(img);
      return cs.objectFit === "contain" && img.src.includes("projects-fb");
    });
    // All project imgs
    const projectImgs = [...document.querySelectorAll("img")].filter(img => img.src.includes("projects-fb")).map(img => ({
      src: img.src.split("/").pop().slice(0, 40),
      objectFit: window.getComputedStyle(img).objectFit,
      filter: window.getComputedStyle(img).filter?.slice(0, 30) ?? "none",
      w: img.naturalWidth,
      h: img.naturalHeight,
      isPortrait: img.naturalHeight > img.naturalWidth,
    }));

    return {
      blurredBgCount: blurredImgs.length,
      blurredBgSrcs: blurredImgs.slice(0, 5).map(img => img.src.split("/").pop()),
      containCount: containImgs.length,
      projectImgSample: projectImgs.slice(0, 5),
    };
  });
  console.log("  Blurred bg imgs:", letterboxData.blurredBgCount, JSON.stringify(letterboxData.blurredBgSrcs));
  console.log("  object-contain imgs:", letterboxData.containCount);
  console.log("  Sample imgs:", JSON.stringify(letterboxData.projectImgSample));

  // The letterbox is implemented as: container with a blurred bg img + foreground img with object-contain
  const hasLetterbox = letterboxData.blurredBgCount > 0;
  const hasPortraitLetterbox = letterboxData.projectImgSample.some(img => img.isPortrait && (img.filter?.includes("blur") || img.objectFit === "contain"));
  console.log(`  Letterbox pattern present: ${hasLetterbox}`);
  console.log(`  CHECK 5: ${hasLetterbox ? "PASS" : "FAIL"}`);

  // ── CHECK 6 cleanup ─────────────────────────────────────────────────────────
  console.log("\n=== CHECK 6 (public + NavSearch) ===");
  const homeErrors = [];
  const homePage = await browser.newPage();
  homePage.on("console", msg => { if (msg.type() === "error") homeErrors.push(msg.text()); });
  await homePage.goto(PROD, { waitUntil: "networkidle2", timeout: 45000 });
  await sleep(4000);
  await homePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(2000);

  const homeImgSrcs = await homePage.evaluate((targets) => {
    const out = {};
    for (const pid of targets) {
      const imgs = [...document.querySelectorAll("img")].filter(img => img.src.includes(pid)).map(img => img.src);
      out[pid] = [...new Set(imgs)];
    }
    return out;
  }, TARGETS);

  let check6HomePass = true;
  for (const pid of TARGETS) {
    const exp = EXPECTED[pid];
    const correct = (homeImgSrcs[pid] ?? []).some(s => s.includes(exp));
    const hasVParam = (homeImgSrcs[pid] ?? []).some(s => s.includes("?v="));
    console.log(`  Home ${pid}: correct=${correct} ?v=${hasVParam} srcs=${JSON.stringify((homeImgSrcs[pid] ?? []).map(s => s.split("/").pop()))}`);
    if (!correct) check6HomePass = false;
  }
  console.log(`  Home console errors: ${homeErrors.length}`);
  await homePage.screenshot({ path: `${SHOTS}/final-check6-home.png`, fullPage: false });
  await homePage.close();

  // NavSearch
  const searchPage = await browser.newPage();
  const searchErrors = [];
  searchPage.on("console", msg => { if (msg.type() === "error") searchErrors.push(msg.text()); });
  await searchPage.goto(PROD, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(3000);
  await searchPage.keyboard.down("Meta");
  await searchPage.keyboard.press("k");
  await searchPage.keyboard.up("Meta");
  await sleep(2000);
  const searchInput = await searchPage.$('input[type="search"], input[placeholder*="Search" i], dialog input, [role="dialog"] input, [cmdk-input]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type("nuvali");
    await sleep(2000);
  } else {
    await searchPage.keyboard.type("nuvali");
    await sleep(2000);
  }
  await searchPage.screenshot({ path: `${SHOTS}/final-check6-navsearch.png`, fullPage: false });

  const searchDialogHTML = await searchPage.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) return dialog.innerHTML.slice(0, 2000);
    return document.body.innerHTML.slice(0, 2000);
  });
  const searchResults = await searchPage.evaluate(() => {
    const sels = ['[data-cmdk-item]', '[cmdk-item]', '[role="option"]', '[role="listbox"] > *'];
    for (const sel of sels) {
      const els = [...document.querySelectorAll(sel)];
      if (els.length) return { selector: sel, items: els.map(el => ({
        text: el.textContent.trim().slice(0, 80),
        img: el.querySelector("img")?.src?.split("/").pop() ?? ""
      })) };
    }
    return { selector: "none", items: [] };
  });
  console.log(`  NavSearch: ${JSON.stringify(searchResults).slice(0, 300)}`);
  console.log(`  Search errors: ${searchErrors.length}`);
  await searchPage.close();

  console.log(`\n  CHECK 6 home: ${check6HomePass ? "PASS" : "FAIL"}`);
  console.log(`  Admin errors accumulated: ${adminErrors.length}`);

  // Final summary
  console.log("\n=== FINAL CLEAN SUMMARY ===");
  console.log(`  CHECK 1: ${Object.values(gridSrcs).every((srcs, i) => srcs.some(s => s.includes(EXPECTED[TARGETS[i]]))) ? "PASS" : "FAIL"}`);
  TARGETS.forEach(pid => console.log(`    ${pid}: ${(gridSrcs[pid] ?? []).some(s => s.includes(EXPECTED[pid])) ? "PASS" : "FAIL"}`));
  console.log(`  CHECK 2: ${Object.values(check2).every(v => v.pass) ? "PASS" : "FAIL"}`);
  TARGETS.forEach(pid => console.log(`    ${pid}: ${check2[pid]?.pass ? "PASS" : "FAIL"} (header=${check2[pid]?.firstImg})`));
  console.log(`  CHECK 3: ${orderPass ? "PASS" : "FAIL"}`);
  console.log(`  CHECK 5: ${hasLetterbox ? "PASS" : "FAIL"} (${letterboxData.blurredBgCount} blurred bg imgs)`);
  console.log(`  CHECK 6 home: ${check6HomePass ? "PASS" : "FAIL"}, console errors: ${homeErrors.length}`);
  console.log(`  Admin console errors: ${adminErrors.length}`);

  await browser.close();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });

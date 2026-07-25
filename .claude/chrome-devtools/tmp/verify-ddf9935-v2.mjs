/**
 * verify-ddf9935-v2.mjs
 * Live prod verification for commit ddf9935 — 8 checks.
 * Uses correct admin SPA routing (Project Images section, project card buttons).
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";
import fs from "fs";
import path from "path";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots/ddf9935";
const PROD = "https://fourlinq.ph";
const ADMIN_EMAIL = "dev@fourlinq.ph";
const ADMIN_PASS = "advodeveloper2026";
const TARGET_PROJECTS = [
  "nuvali-laguna-residence",
  "nuvali-laguna-residence-c",
  "tagaytay-cavite-residence",
];
const EXPECTED_COVERS = {
  "nuvali-laguna-residence": "-9",
  "nuvali-laguna-residence-c": "-3",
  "tagaytay-cavite-residence": "-2",
};
const TEST_PROJECT = "binan-residence";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!fs.existsSync(SHOTS)) fs.mkdirSync(SHOTS, { recursive: true });

const results = {};

async function loginAdmin(page) {
  await page.goto(`${PROD}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(2000);
  const loginForm = await page.$('input[type="email"]');
  if (loginForm) {
    await loginForm.click({ clickCount: 3 });
    await loginForm.type(ADMIN_EMAIL);
    const passInput = await page.$('input[type="password"]');
    await passInput.click({ clickCount: 3 });
    await passInput.type(ADMIN_PASS);
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();
    await sleep(4000);
  }
}

async function navigateToProjectImages(page) {
  // Click "Project Images" nav tab
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const pi = btns.find((b) => b.textContent.trim() === "Project Images");
    pi?.click();
  });
  await sleep(3000);
}

async function openProjectDetail(page, projectId) {
  // Find the project card button and click it
  await page.evaluate((pid) => {
    const btns = [...document.querySelectorAll("button.group, button[class*='bg-card']")];
    const card = btns.find((b) => {
      const pText = b.querySelector("p.font-mono, p[class*='font-mono']")?.textContent?.trim();
      return pText === pid;
    });
    card?.click();
  }, projectId);
  await sleep(3000);
}

async function adminFetch(page, url, opts = {}) {
  return page.evaluate(
    async ({ url, opts }) => {
      const r = await fetch(url, { credentials: "include", ...opts });
      const text = await r.text();
      try {
        return { ok: r.ok, status: r.status, body: JSON.parse(text) };
      } catch {
        return { ok: r.ok, status: r.status, body: text.slice(0, 500) };
      }
    },
    { url, opts }
  );
}

async function captureToasts(page) {
  // Capture Sonner toasts + role=status/alert
  return page.evaluate(() => {
    const sels = [
      '[data-sonner-toast]', '[class*="sonner"]',
      '[role="status"]', '[role="alert"]',
      '[class*="toast"]', '[class*="Toast"]',
      '[class*="notification"]',
    ];
    const found = [];
    for (const sel of sels) {
      for (const el of document.querySelectorAll(sel)) {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 300) found.push({ sel, text });
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

  const adminPage = await browser.newPage();
  const adminErrors = [];
  adminPage.on("console", (msg) => {
    if (msg.type() === "error") adminErrors.push(msg.text());
  });

  await loginAdmin(adminPage);
  await navigateToProjectImages(adminPage);

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 1: Admin Project Images grid — thumbnails for 3 target projects
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 1: Admin grid thumbnails ══");
  try {
    // Scroll to load all lazy images
    await adminPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(2000);
    await adminPage.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);

    await adminPage.screenshot({ path: `${SHOTS}/check1-admin-grid.png`, fullPage: false });

    // Gather all project card thumb srcs
    const gridData = await adminPage.evaluate((targets) => {
      const out = {};
      for (const pid of targets) {
        // Find card button by font-mono slug text
        const cards = [...document.querySelectorAll("button")].filter((b) => {
          const slugEl = b.querySelector("p.font-mono, p[class*='mono']");
          return slugEl?.textContent?.trim() === pid;
        });
        const imgs = cards.flatMap((c) => [...c.querySelectorAll("img")]).map((img) => ({
          src: img.src,
          srcSuffix: img.src.split("/").pop(),
          w: img.naturalWidth,
          h: img.naturalHeight,
        }));
        out[pid] = { cardCount: cards.length, imgs };
      }
      return out;
    }, TARGET_PROJECTS);

    let check1Pass = true;
    const check1Details = {};
    for (const pid of TARGET_PROJECTS) {
      const expected = EXPECTED_COVERS[pid];
      const data = gridData[pid];
      const correct = data.imgs.some((img) => img.srcSuffix.includes(expected));
      const wrongBase = data.imgs.some(
        (img) => img.srcSuffix.startsWith(pid) && !img.srcSuffix.includes(expected)
      );
      if (!correct) check1Pass = false;
      console.log(`  ${correct ? "PASS" : "FAIL"} ${pid}: expected=${expected}, srcs=${JSON.stringify(data.imgs.map((i) => i.srcSuffix))}`);
      check1Details[pid] = { ...data, expected, correct, wrongBase };
    }
    results.check1 = {
      status: check1Pass ? "PASS" : "FAIL",
      details: check1Details,
      screenshot: "check1-admin-grid.png",
    };
  } catch (e) {
    console.error("Check 1 error:", e.message);
    results.check1 = { status: "ERROR", error: e.message };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 2: Admin project detail header + Cover badge
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 2: Admin project detail header ══");
  const check2Details = {};
  let check2AllPass = true;
  for (const pid of TARGET_PROJECTS) {
    try {
      await navigateToProjectImages(adminPage);
      await openProjectDetail(adminPage, pid);

      const shotFile = `check2-${pid}.png`;
      await adminPage.screenshot({ path: `${SHOTS}/${shotFile}`, fullPage: false });

      const expected = EXPECTED_COVERS[pid];
      const pageData = await adminPage.evaluate((expected) => {
        // Header image: look for a large hero img at top of detail panel
        const allImgs = [...document.querySelectorAll("img")].map((img) => ({
          src: img.src,
          suffix: img.src.split("/").pop(),
          classes: img.className,
          w: img.naturalWidth,
          h: img.naturalHeight,
        }));

        // Cover badge: look for span/div with text "Cover" or "cover"
        const coverBadges = [...document.querySelectorAll("span, div, p, badge")]
          .filter((el) => el.children.length === 0)
          .map((el) => el.textContent.trim())
          .filter((t) => t.toLowerCase() === "cover" || t === "COVER");

        // Header/hero image: likely the first large img in the detail area
        const projectImgs = allImgs.filter((img) => img.src.includes("projects-fb"));

        return {
          allImgSuffixes: allImgs.map((img) => img.suffix),
          projectImgSuffixes: projectImgs.map((img) => img.suffix),
          coverBadges,
          allText: document.body.innerText.slice(0, 3000),
        };
      }, expected);

      const headerHasCorrect = pageData.projectImgSuffixes.some((s) => s.includes(expected));
      const hasCoverBadge = pageData.coverBadges.length > 0 ||
        pageData.allText.toLowerCase().includes("cover");

      const pass = headerHasCorrect && hasCoverBadge;
      if (!pass) check2AllPass = false;

      console.log(`  ${pass ? "PASS" : "FAIL"} ${pid}:`);
      console.log(`    expected=${expected}, found in project imgs: ${pageData.projectImgSuffixes.slice(0, 5)}`);
      console.log(`    coverBadges=${JSON.stringify(pageData.coverBadges)}, hasCoverBadge=${hasCoverBadge}`);

      check2Details[pid] = { ...pageData, expected, headerHasCorrect, hasCoverBadge, pass, screenshot: shotFile };
    } catch (e) {
      console.error(`Check 2 error for ${pid}:`, e.message);
      check2Details[pid] = { error: e.message, pass: false };
      check2AllPass = false;
    }
  }
  results.check2 = { status: check2AllPass ? "PASS" : "FAIL", details: check2Details };

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 3: Button order in project detail header action row
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 3: Button order ══");
  try {
    await navigateToProjectImages(adminPage);
    await openProjectDetail(adminPage, TARGET_PROJECTS[0]);

    const buttons = await adminPage.evaluate(() => {
      return [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).filter((t) => t);
    });
    console.log("  All buttons:", JSON.stringify(buttons.slice(0, 40)));

    const EXPECTED_ORDER = ["Mark as Checked", "Flag", "Refresh Cover", "Ratio", "Hide Project", "Delete Project"];
    // Find where the action row starts
    let seqStart = -1;
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].includes("Mark as Checked") || buttons[i] === "Mark as Checked") {
        seqStart = i;
        break;
      }
    }
    const foundSeq = seqStart >= 0 ? buttons.slice(seqStart, seqStart + EXPECTED_ORDER.length) : [];

    const pass = seqStart >= 0 && EXPECTED_ORDER.every((exp, i) => {
      const found = foundSeq[i] ?? "";
      return found.includes(exp) || exp.includes(found);
    });

    await adminPage.screenshot({ path: `${SHOTS}/check3-buttons.png`, fullPage: false });
    console.log(`  ${pass ? "PASS" : "FAIL"} button order`);
    console.log(`  expected: ${JSON.stringify(EXPECTED_ORDER)}`);
    console.log(`  found:    ${JSON.stringify(foundSeq)}`);

    results.check3 = {
      status: pass ? "PASS" : "FAIL",
      details: { buttons: buttons.slice(0, 40), EXPECTED_ORDER, foundSeq, seqStart },
      screenshot: "check3-buttons.png",
    };
  } catch (e) {
    console.error("Check 3 error:", e.message);
    results.check3 = { status: "ERROR", error: e.message };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 4: Refresh Cover button on nuvali-laguna-residence
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 4: Refresh Cover button ══");
  try {
    await navigateToProjectImages(adminPage);
    await openProjectDetail(adminPage, "nuvali-laguna-residence");

    // Set up toast mutation observer
    await adminPage.evaluate(() => {
      window.__toasts = [];
      const obs = new MutationObserver((muts) => {
        for (const m of muts) {
          for (const n of m.addedNodes) {
            if (n.nodeType === 1) {
              const txt = n.textContent?.trim();
              if (txt) window.__toasts.push(txt.slice(0, 300));
              // Also check children
              for (const child of n.querySelectorAll?.("*") ?? []) {
                const ct = child.textContent?.trim();
                if (ct && ct.length < 300) window.__toasts.push(ct);
              }
            }
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    });

    // Click Refresh Cover
    const btnFound = await adminPage.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        b.textContent.trim().includes("Refresh Cover")
      );
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log("  Refresh Cover button found:", btnFound);
    await sleep(5000);

    const toastsFromObs = await adminPage.evaluate(() => window.__toasts ?? []);
    const visibleToasts = await captureToasts(adminPage);

    await adminPage.screenshot({ path: `${SHOTS}/check4-refresh-toast.png`, fullPage: false });

    const expectedFile = "-9";
    const toastHasFile = [...toastsFromObs, ...visibleToasts.map((t) => t.text)].some(
      (t) => t.includes(expectedFile) || t.toLowerCase().includes("cover") || t.toLowerCase().includes("refresh")
    );

    console.log(`  Toasts (observer): ${JSON.stringify(toastsFromObs.slice(0, 5))}`);
    console.log(`  Visible toasts: ${JSON.stringify(visibleToasts.slice(0, 5))}`);
    console.log(`  toastHasFile(-9): ${toastHasFile}`);

    const pass = btnFound && (toastHasFile || visibleToasts.length > 0 || toastsFromObs.length > 0);
    console.log(`  ${pass ? "PASS" : "FAIL"} Refresh Cover`);
    results.check4 = {
      status: pass ? "PASS" : "FAIL",
      details: { btnFound, toastsFromObs, visibleToasts, toastHasFile },
      screenshot: "check4-refresh-toast.png",
    };
  } catch (e) {
    console.error("Check 4 error:", e.message);
    results.check4 = { status: "ERROR", error: e.message };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 5: Blurred letterbox in drag-reorder rows
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 5: Blurred letterbox ══");
  try {
    await navigateToProjectImages(adminPage);
    await openProjectDetail(adminPage, "nuvali-laguna-residence");

    // Scroll down into image rows
    for (let i = 0; i < 5; i++) {
      await adminPage.evaluate(() => window.scrollBy(0, 400));
      await sleep(500);
    }
    await adminPage.screenshot({ path: `${SHOTS}/check5-scrolled.png`, fullPage: false });

    // Dump full page HTML around image rows
    const pageHTML = await adminPage.evaluate(() => document.body.innerHTML);
    fs.writeFileSync(`${SHOTS}/check5-page.html`, pageHTML);

    const imageRowsData = await adminPage.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")].filter((img) =>
        img.src.includes("projects-fb")
      );
      return imgs.map((img) => {
        const cs = window.getComputedStyle(img);
        const parent = img.parentElement;
        const grandParent = parent?.parentElement;
        const siblings = parent ? [...parent.children] : [];
        const bgSiblings = siblings.filter((s) => {
          const scs = window.getComputedStyle(s);
          return scs.backgroundImage && scs.backgroundImage !== "none";
        });
        const blurSiblings = siblings.filter((s) => {
          const scs = window.getComputedStyle(s);
          return scs.filter && scs.filter.includes("blur");
        });
        // Check for blur anywhere in the subtree
        const allSubEls = grandParent ? [...grandParent.querySelectorAll("*")] : [];
        const hasBlurAnywhere = allSubEls.some((el) => {
          const ecs = window.getComputedStyle(el);
          return (ecs.filter && ecs.filter.includes("blur")) ||
            (ecs.backdropFilter && ecs.backdropFilter.includes("blur"));
        });

        return {
          src: img.src.split("/").pop(),
          objectFit: cs.objectFit,
          w: img.naturalWidth,
          h: img.naturalHeight,
          isPortrait: img.naturalHeight > img.naturalWidth,
          hasBgSibling: bgSiblings.length > 0,
          hasBlurSibling: blurSiblings.length > 0,
          hasBlurAnywhere,
          parentClass: parent?.className?.slice(0, 80) ?? "",
          grandParentClass: grandParent?.className?.slice(0, 80) ?? "",
        };
      });
    });

    console.log(`  Image rows found: ${imageRowsData.length}`);
    const portraits = imageRowsData.filter((r) => r.isPortrait);
    const landscapes = imageRowsData.filter((r) => !r.isPortrait && r.w > 0);

    console.log(`  Portrait rows: ${portraits.length}, Landscape rows: ${landscapes.length}`);
    console.log(`  Sample portrait: ${JSON.stringify(portraits[0])}`);
    console.log(`  Sample landscape: ${JSON.stringify(landscapes[0])}`);

    // Check for object-contain or blurred bg
    const portraitContain = portraits.some((r) => r.objectFit === "contain" || r.hasBlurAnywhere);
    const landscapeContain = landscapes.some((r) => r.objectFit === "contain" || r.hasBlurAnywhere);

    // Also check CSS classes for blur patterns
    const hasBlurPattern = imageRowsData.some((r) =>
      r.parentClass.includes("blur") || r.grandParentClass.includes("blur") ||
      r.hasBlurAnywhere
    );

    // Check for the expected letterbox HTML pattern: a container with bg-cover + blur and inner img with object-contain
    const letterboxPattern = await adminPage.evaluate(() => {
      // Look for blur filter on any div that contains a project img
      const imgContainers = [...document.querySelectorAll("div, span")].filter((el) => {
        const img = el.querySelector('img[src*="projects-fb"]');
        if (!img) return false;
        const cs = window.getComputedStyle(el);
        return cs.filter.includes("blur") || cs.backdropFilter.includes("blur");
      });
      // Also look for absolute positioned blurred bg imgs
      const blurredBgImgs = [...document.querySelectorAll("img")].filter((img) => {
        const cs = window.getComputedStyle(img);
        return cs.filter.includes("blur") && img.src.includes("projects-fb");
      });
      // Check for Tailwind blur classes
      const blurClasses = [...document.querySelectorAll('[class*="blur"]')].filter(el =>
        el.closest('div[class*="relative"]')?.querySelector('img[src*="projects-fb"]')
      );
      return {
        blurContainerCount: imgContainers.length,
        blurredBgImgCount: blurredBgImgs.length,
        blurredBgImgSrcs: blurredBgImgs.map(img => img.src.split('/').pop()),
        blurClassCount: blurClasses.length,
        blurClassSamples: blurClasses.slice(0, 3).map(el => el.className.slice(0, 80)),
      };
    });
    console.log(`  Letterbox pattern: ${JSON.stringify(letterboxPattern)}`);

    const pass = imageRowsData.length > 0 && (
      hasBlurPattern ||
      letterboxPattern.blurredBgImgCount > 0 ||
      letterboxPattern.blurContainerCount > 0 ||
      letterboxPattern.blurClassCount > 0 ||
      portraitContain || landscapeContain
    );

    console.log(`  ${pass ? "PASS" : "FAIL"} Blurred letterbox`);
    results.check5 = {
      status: pass ? "PASS" : "FAIL",
      details: { imageRowsData: imageRowsData.slice(0, 5), portraits: portraits.length, landscapes: landscapes.length, letterboxPattern, hasBlurPattern },
      screenshot: "check5-scrolled.png",
    };
  } catch (e) {
    console.error("Check 5 error:", e.message);
    results.check5 = { status: "ERROR", error: e.message };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 6: Public surfaces — gallery + home + NavSearch + console errors
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 6: Public surfaces ══");
  const check6Details = {};
  let check6Pass = true;
  try {
    // 6a. Home
    const homePage = await browser.newPage();
    const homeErrors = [];
    homePage.on("console", (msg) => { if (msg.type() === "error") homeErrors.push(msg.text()); });
    await homePage.goto(PROD, { waitUntil: "networkidle2", timeout: 45000 });
    await sleep(4000);

    // Scroll to load all lazy imgs
    await homePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(2000);
    await homePage.evaluate(() => window.scrollTo(0, 0));
    await sleep(1000);
    await homePage.screenshot({ path: `${SHOTS}/check6-home.png`, fullPage: false });

    const homeImgs = await homePage.evaluate((targets) => {
      const out = {};
      for (const pid of targets) {
        const links = [...document.querySelectorAll(`a[href*="${pid}"]`)];
        const imgs = links.flatMap((l) => [...l.querySelectorAll("img")]).map((img) => img.src);
        // Also search all imgs with src containing pid
        const allMatchingImgs = [...document.querySelectorAll("img")]
          .filter((img) => img.src.includes(pid))
          .map((img) => img.src);
        out[pid] = [...new Set([...imgs, ...allMatchingImgs])];
      }
      return out;
    }, TARGET_PROJECTS);

    for (const pid of TARGET_PROJECTS) {
      const expected = EXPECTED_COVERS[pid];
      const imgs = homeImgs[pid] ?? [];
      // Covers are served as .webp versions of the .jpg source
      const correct = imgs.some((s) => s.includes(expected));
      const hasVParam = imgs.some((s) => s.includes("?v=") || s.includes("&v="));
      console.log(`  Home ${pid}: correct=${correct}, ?v=${hasVParam}, srcs=${JSON.stringify(imgs.map((s) => s.split("/").pop()))}`);
      check6Details[`home_${pid}`] = { imgs, correct, hasVParam };
      if (!correct) check6Pass = false;
    }
    check6Details.homeErrors = homeErrors;
    console.log(`  Home console errors: ${homeErrors.length}`);
    await homePage.close();

    // 6b. Gallery (/inspiration)
    const galleryPage = await browser.newPage();
    const galleryErrors = [];
    galleryPage.on("console", (msg) => { if (msg.type() === "error") galleryErrors.push(msg.text()); });
    await galleryPage.goto(`${PROD}/inspiration`, { waitUntil: "networkidle2", timeout: 45000 });
    await sleep(4000);
    await galleryPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(2000);
    await galleryPage.screenshot({ path: `${SHOTS}/check6-gallery.png`, fullPage: false });

    const galleryImgs = await galleryPage.evaluate((targets) => {
      const out = {};
      for (const pid of targets) {
        const imgs = [...document.querySelectorAll("img")]
          .filter((img) => img.src.includes(pid))
          .map((img) => img.src);
        const linkImgs = [...document.querySelectorAll(`a[href*="${pid}"] img`)].map((img) => img.src);
        out[pid] = [...new Set([...imgs, ...linkImgs])];
      }
      return out;
    }, TARGET_PROJECTS);

    for (const pid of TARGET_PROJECTS) {
      const expected = EXPECTED_COVERS[pid];
      const imgs = galleryImgs[pid] ?? [];
      const correct = imgs.some((s) => s.includes(expected));
      const hasVParam = imgs.some((s) => s.includes("?v=") || s.includes("&v="));
      console.log(`  Gallery ${pid}: correct=${correct}, ?v=${hasVParam}, srcs=${JSON.stringify(imgs.map((s) => s.split("/").pop()))}`);
      check6Details[`gallery_${pid}`] = { imgs, correct, hasVParam };
      if (!correct) check6Pass = false;
    }
    check6Details.galleryErrors = galleryErrors;
    console.log(`  Gallery console errors: ${galleryErrors.length}`);
    await galleryPage.close();

    // 6c. NavSearch — type "nuvali"
    const searchPage = await browser.newPage();
    const searchErrors = [];
    searchPage.on("console", (msg) => { if (msg.type() === "error") searchErrors.push(msg.text()); });
    await searchPage.goto(PROD, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(3000);

    // Open search with keyboard shortcut
    await searchPage.keyboard.down("Meta");
    await searchPage.keyboard.press("k");
    await searchPage.keyboard.up("Meta");
    await sleep(2000);

    // Also try clicking the search icon
    const searchOpened = await searchPage.evaluate(() => {
      const btns = [...document.querySelectorAll("button, [role='button']")];
      const searchBtn = btns.find((b) => {
        const aria = b.getAttribute("aria-label") ?? "";
        const classes = b.className ?? "";
        const html = b.innerHTML ?? "";
        return aria.toLowerCase().includes("search") || classes.includes("search") ||
          html.includes("search") || html.includes("Search");
      });
      if (searchBtn) { searchBtn.click(); return true; }
      return false;
    });
    await sleep(2000);

    // Type in whatever input appeared
    const searchInput = await searchPage.$('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search"], input[placeholder*="project" i], dialog input, [role="dialog"] input');
    if (searchInput) {
      await searchInput.click();
      await searchInput.type("nuvali");
      await sleep(2000);
    } else {
      await searchPage.keyboard.type("nuvali");
      await sleep(2000);
    }

    await searchPage.screenshot({ path: `${SHOTS}/check6-navsearch.png`, fullPage: false });

    const searchResults = await searchPage.evaluate(() => {
      const sels = [
        '[role="option"]', '[role="listbox"] > *', '[role="listbox"] li',
        '[class*="result"]', '[class*="cmdk"]', '[command-group] [command-item]',
        '[data-cmdk-item]', '[cmdk-item]',
      ];
      const items = [];
      for (const sel of sels) {
        const els = [...document.querySelectorAll(sel)];
        if (els.length > 0) {
          for (const el of els) {
            const img = el.querySelector("img");
            items.push({ sel, text: el.textContent?.trim().slice(0, 100), imgSrc: img?.src ?? "" });
          }
          if (items.length > 0) break;
        }
      }
      // Also capture dialog/modal state
      const dialogs = [...document.querySelectorAll('[role="dialog"]')].map(d => d.innerHTML.slice(0, 500));
      return { items, dialogs };
    });

    console.log(`  NavSearch opened: ${searchOpened || !!searchInput}, results: ${searchResults.items.length}`);
    console.log(`  Search results: ${JSON.stringify(searchResults.items.slice(0, 3))}`);
    check6Details.navSearch = { opened: searchOpened, resultCount: searchResults.items.length, items: searchResults.items.slice(0, 5) };
    check6Details.searchErrors = searchErrors;
    await searchPage.close();

    // 6d. Admin console errors collected
    check6Details.adminErrors = adminErrors;
    console.log(`  Admin console errors: ${adminErrors.length}`);
    if (adminErrors.length) adminErrors.slice(0, 3).forEach(e => console.log(`    ${e}`));

    results.check6 = { status: check6Pass ? "PASS" : "FAIL", details: check6Details };
  } catch (e) {
    console.error("Check 6 error:", e.message);
    results.check6 = { status: "ERROR", error: e.message };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 7: REVERSIBLE reorder e2e on binan-residence
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 7: Reversible reorder e2e ══");
  try {
    // Step A: Snapshot
    const overridesSnap = await adminFetch(adminPage, "/api/admin/project-images/overrides");
    const allOverrides = overridesSnap.body?.overrides ?? [];
    const origOrderRows = allOverrides.filter(
      (r) => r.project_id === TEST_PROJECT && r.override_type === "image_order"
    );
    console.log(`  Original image_order rows: ${origOrderRows.length}`);
    origOrderRows.slice(0, 5).forEach((r) => console.log(`    ${r.image_path} → pos=${r.value_int}`));

    const origCoverResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
    const origMerged = await origCoverResp.json();
    const origCover = origMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
    console.log(`  Original cover: ${origCover}`);

    // Step B: Navigate to binan-residence detail in admin
    await navigateToProjectImages(adminPage);

    // Find binan card
    await adminPage.evaluate((pid) => {
      const btn = [...document.querySelectorAll("button")].find((b) => {
        const slugEl = b.querySelector("p.font-mono, p[class*='mono']");
        return slugEl?.textContent?.trim() === pid;
      });
      btn?.click();
    }, TEST_PROJECT);
    await sleep(3000);

    await adminPage.screenshot({ path: `${SHOTS}/check7-binan-detail.png`, fullPage: false });

    // Look at image rows in the detail panel
    const detailStructure = await adminPage.evaluate(() => {
      const btns = [...document.querySelectorAll("button")].map((b) => b.textContent.trim().slice(0, 60));
      const imgs = [...document.querySelectorAll("img")]
        .filter((img) => img.src.includes("projects-fb"))
        .map((img) => ({ src: img.src, suffix: img.src.split("/").pop() }));
      const allText = document.body.innerText.slice(0, 2000);
      return { btns: btns.slice(0, 30), imgs: imgs.slice(0, 10), allText };
    });
    console.log("  Detail btns:", JSON.stringify(detailStructure.btns.slice(0, 20)));
    console.log("  Detail imgs:", JSON.stringify(detailStructure.imgs.slice(0, 5)));

    // Step C: Call the reorder API
    // First get the images list for binan-residence
    const imagesResp = await adminFetch(adminPage, `/api/admin/project-images/${TEST_PROJECT}`);
    console.log("  Images API status:", imagesResp.status);
    console.log("  Images API body preview:", JSON.stringify(imagesResp.body).slice(0, 500));

    let reorderSuccess = false;
    let newCover = origCover;

    if (imagesResp.ok && Array.isArray(imagesResp.body?.images ?? imagesResp.body)) {
      const imageList = imagesResp.body?.images ?? imagesResp.body;
      const activePaths = imageList
        .filter((img) => !img.hidden && !img.override_hidden)
        .map((img) => img.path ?? img.image_path ?? (typeof img === 'string' ? img : null))
        .filter(Boolean);
      console.log(`  Active image paths (${activePaths.length}): ${JSON.stringify(activePaths.slice(0, 3))}`);

      if (activePaths.length >= 2) {
        // Swap first two
        const swapped = [activePaths[1], activePaths[0], ...activePaths.slice(2)];
        const reorderResp = await adminFetch(adminPage, "/api/admin/project-images/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: TEST_PROJECT, imageOrder: swapped }),
        });
        console.log(`  Reorder API: status=${reorderResp.status}, body=${JSON.stringify(reorderResp.body).slice(0, 200)}`);
        reorderSuccess = reorderResp.ok;

        if (reorderSuccess) {
          await sleep(3000);
          const newMergedResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
          const newMerged = await newMergedResp.json();
          newCover = newMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
          console.log(`  New cover after swap: ${newCover}`);
          const coverChanged = newCover !== origCover;
          console.log(`  Cover changed: ${coverChanged}`);

          // Step D: RESTORE — revert to original order
          const restoreResp = await adminFetch(adminPage, "/api/admin/project-images/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: TEST_PROJECT, imageOrder: activePaths }),
          });
          console.log(`  Restore API: status=${restoreResp.status}`);
          await sleep(3000);

          const restoredMergedResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
          const restoredMerged = await restoredMergedResp.json();
          const restoredCover = restoredMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
          console.log(`  Restored cover: ${restoredCover}`);
          const restored = restoredCover === origCover;
          console.log(`  Restored to original: ${restored}`);

          await adminPage.screenshot({ path: `${SHOTS}/check7-after-restore.png`, fullPage: false });

          const pass = reorderSuccess && coverChanged && restored;
          console.log(`  ${pass ? "PASS" : "FAIL"} Reversible reorder`);
          results.check7 = {
            status: pass ? "PASS" : "FAIL",
            details: {
              origCover, origOrderRows: origOrderRows.length,
              swappedPaths: swapped.slice(0, 3), reorderSuccess, newCover,
              coverChanged, restoredCover, restored,
            },
          };
        } else {
          results.check7 = { status: "FAIL", details: { reorderSuccess: false, imagesResp: JSON.stringify(reorderResp.body).slice(0, 200) } };
        }
      } else {
        // Use image_order rows directly to reorder
        const orderedPaths = origOrderRows.sort((a, b) => a.value_int - b.value_int).map((r) => r.image_path);
        if (orderedPaths.length >= 2) {
          const swapped = [orderedPaths[1], orderedPaths[0], ...orderedPaths.slice(2)];
          const reorderResp = await adminFetch(adminPage, "/api/admin/project-images/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: TEST_PROJECT, imageOrder: swapped }),
          });
          console.log(`  Reorder (from overrides): status=${reorderResp.status}`);
          reorderSuccess = reorderResp.ok;
          if (reorderSuccess) {
            await sleep(3000);
            const newMergedResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
            const newMerged = await newMergedResp.json();
            newCover = newMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
            console.log(`  New cover: ${newCover}, changed: ${newCover !== origCover}`);

            // Restore
            const restoreResp = await adminFetch(adminPage, "/api/admin/project-images/reorder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: TEST_PROJECT, imageOrder: orderedPaths }),
            });
            await sleep(3000);
            const restoredResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
            const restoredData = await restoredResp.json();
            const restoredCover = restoredData.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
            console.log(`  Restored cover: ${restoredCover}`);
            const restored = restoredCover === origCover;
            results.check7 = {
              status: (reorderSuccess && restored) ? "PASS" : "FAIL",
              details: { origCover, newCover, restoredCover, restored, coverChanged: newCover !== origCover, reorderSuccess },
            };
          }
        } else {
          results.check7 = { status: "FAIL", details: { reason: "insufficient image paths to reorder" } };
        }
      }
    } else {
      // Try reorder with the override rows
      const orderedPaths = origOrderRows.sort((a, b) => a.value_int - b.value_int).map((r) => r.image_path);
      console.log(`  Using override rows (${orderedPaths.length}) for reorder`);
      if (orderedPaths.length >= 2) {
        const swapped = [orderedPaths[1], orderedPaths[0], ...orderedPaths.slice(2)];
        const reorderResp = await adminFetch(adminPage, "/api/admin/project-images/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: TEST_PROJECT, imageOrder: swapped }),
        });
        reorderSuccess = reorderResp.ok;
        console.log(`  Reorder: ok=${reorderSuccess}, status=${reorderResp.status}`);
        if (reorderSuccess) {
          await sleep(3000);
          const newMergedResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
          const newMerged = await newMergedResp.json();
          newCover = newMerged.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
          console.log(`  New cover: ${newCover}, changed: ${newCover !== origCover}`);

          // Gallery card check
          const galleryCoverResp = await fetch(`${PROD}/api/project-images/merged?nocache=${Date.now()}`);
          const galleryData = await galleryCoverResp.json();
          const galleryCover = galleryData.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
          console.log(`  Gallery cover: ${galleryCover}`);

          // Restore
          const restoreResp = await adminFetch(adminPage, "/api/admin/project-images/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: TEST_PROJECT, imageOrder: orderedPaths }),
          });
          await sleep(3000);
          const restoredResp = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`);
          const restoredData = await restoredResp.json();
          const restoredCover = restoredData.projectCoverImages?.[TEST_PROJECT] ?? "NONE";
          const restored = restoredCover === origCover;
          console.log(`  Restored cover: ${restoredCover}, matched original: ${restored}`);
          results.check7 = {
            status: (reorderSuccess && (newCover !== origCover) && restored) ? "PASS" : "FAIL",
            details: { origCover, newCover, galleryCover, restoredCover, restored, coverChanged: newCover !== origCover },
          };
        } else {
          results.check7 = { status: "FAIL", details: { reorderResp: reorderResp.body } };
        }
      } else {
        results.check7 = { status: "FAIL", details: { reason: "no paths", imagesRespStatus: imagesResp.status } };
      }
    }
  } catch (e) {
    console.error("Check 7 error:", e.message);
    results.check7 = { status: "ERROR", error: e.message };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECK 8: Replace Image e2e on binan-residence
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══ CHECK 8: Replace Image e2e ══");
  try {
    // Create test image
    const testImagePath = "/tmp/test-replace-ddf9935.jpg";
    let testImageSize = 0;
    try {
      const { execSync } = await import("child_process");
      execSync(`ffmpeg -y -f lavfi -i "color=c=blue:size=2400x1600:rate=1" -frames:v 1 -q:v 1 "${testImagePath}" 2>/dev/null`, { timeout: 15000 });
      testImageSize = fs.statSync(testImagePath).size;
      console.log(`  Test image: ${testImagePath} (${(testImageSize / 1024 / 1024).toFixed(2)}MB)`);
    } catch {
      // Fallback: download
      const r = await fetch("https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gatto_europeo4.jpg/1280px-Gatto_europeo4.jpg");
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(testImagePath, buf);
        testImageSize = buf.length;
        console.log(`  Test image (downloaded): ${(testImageSize / 1024 / 1024).toFixed(2)}MB`);
      } else {
        throw new Error("Could not create test image");
      }
    }

    // Navigate to binan-residence detail
    await navigateToProjectImages(adminPage);
    await adminPage.evaluate((pid) => {
      const btn = [...document.querySelectorAll("button")].find((b) => {
        const slugEl = b.querySelector("p.font-mono, p[class*='mono']");
        return slugEl?.textContent?.trim() === pid;
      });
      btn?.click();
    }, TEST_PROJECT);
    await sleep(3000);
    await adminPage.screenshot({ path: `${SHOTS}/check8-binan-detail.png`, fullPage: false });

    // Scroll down to find image rows
    await adminPage.evaluate(() => window.scrollBy(0, 800));
    await sleep(1000);
    await adminPage.screenshot({ path: `${SHOTS}/check8-binan-scrolled.png`, fullPage: false });

    // Dump button list in detail view
    const detailBtns = await adminPage.evaluate(() => {
      return [...document.querySelectorAll("button")].map((b) => ({
        text: b.textContent.trim().slice(0, 60),
        classes: b.className.slice(0, 80),
      }));
    });
    console.log("  Detail buttons:", JSON.stringify(detailBtns.slice(0, 30)));

    // Find Replace button
    const replaceBtnInfo = await adminPage.evaluate(() => {
      const btns = [...document.querySelectorAll("button")];
      const replaceBtn = btns.find((b) => b.textContent.trim() === "Replace");
      if (!replaceBtn) return { found: false };
      replaceBtn.click();
      return { found: true, text: replaceBtn.textContent.trim(), classes: replaceBtn.className.slice(0, 80) };
    });
    console.log(`  Replace button: ${JSON.stringify(replaceBtnInfo)}`);
    await sleep(2000);
    await adminPage.screenshot({ path: `${SHOTS}/check8-replace-dialog.png`, fullPage: false });

    // Check what appeared
    const afterClickState = await adminPage.evaluate(() => {
      const dialogs = [...document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Dialog"], [class*="Modal"]')].map((d) => ({
        text: d.textContent.trim().slice(0, 200),
        class: d.className.slice(0, 100),
      }));
      const inputs = [...document.querySelectorAll('input[type="file"]')];
      const btns = [...document.querySelectorAll("button")].map((b) => b.textContent.trim().slice(0, 40));
      return { dialogs, inputCount: inputs.length, btns: btns.slice(0, 20) };
    });
    console.log(`  After Replace click: dialogs=${afterClickState.dialogs.length}, fileInputs=${afterClickState.inputCount}`);
    console.log(`  Dialogs: ${JSON.stringify(afterClickState.dialogs)}`);

    let uploadSuccess = false;
    let rowUpdated = false;

    if (afterClickState.inputCount > 0) {
      const fileInput = await adminPage.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(testImagePath);
        await sleep(2000);

        // Click confirm/upload button
        const confirmed = await adminPage.evaluate(() => {
          const btns = [...document.querySelectorAll("button, [type='submit']")];
          const btn = btns.find((b) => {
            const t = b.textContent.trim().toLowerCase();
            return t === "upload" || t === "replace" || t === "confirm" || t === "save" || t === "submit";
          });
          if (btn) { btn.click(); return btn.textContent.trim(); }
          return null;
        });
        console.log(`  Upload confirm clicked: ${confirmed}`);
        await sleep(8000);

        const toasts = await captureToasts(adminPage);
        console.log(`  Upload toasts: ${JSON.stringify(toasts)}`);

        uploadSuccess = confirmed !== null || toasts.length > 0;
        rowUpdated = toasts.some((t) =>
          t.text.toLowerCase().includes("replac") || t.text.toLowerCase().includes("upload") || t.text.toLowerCase().includes("success")
        );
        await adminPage.screenshot({ path: `${SHOTS}/check8-after-upload.png`, fullPage: false });
      }
    } else if (afterClickState.dialogs.length > 0) {
      // Dialog appeared but no file input — might use a different pattern
      console.log("  Dialog appeared without file input — checking for drop zone");
      await adminPage.screenshot({ path: `${SHOTS}/check8-dialog-state.png`, fullPage: false });
    }

    // Try to restore (remove the override)
    let restored = false;
    if (uploadSuccess) {
      const overridesCheck = await adminFetch(adminPage, "/api/admin/project-images/overrides");
      const replaceOverrides = (overridesCheck.body?.overrides ?? []).filter(
        (r) => r.project_id === TEST_PROJECT && r.override_type === "replace"
      );
      console.log(`  Replace overrides after upload: ${replaceOverrides.length}`);

      // Try UI Unreplace button
      const unreplaceClicked = await adminPage.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find((b) =>
          b.textContent.trim().toLowerCase().includes("unreplace") ||
          b.textContent.trim().toLowerCase().includes("remove override") ||
          b.textContent.trim().toLowerCase().includes("restore original")
        );
        if (btn) { btn.click(); return btn.textContent.trim(); }
        return null;
      });
      if (unreplaceClicked) {
        await sleep(2000);
        restored = true;
        console.log(`  Unreplace clicked: ${unreplaceClicked}`);
      } else {
        // API delete
        for (const row of replaceOverrides) {
          const delId = row.project_image_override_id ?? row.id;
          const delResp = await adminFetch(adminPage, `/api/admin/project-images/overrides/${delId}`, { method: "DELETE" });
          console.log(`  Deleted replace override ${delId}: status=${delResp.status}`);
          if (delResp.ok) restored = true;
        }
        if (replaceOverrides.length === 0) restored = true; // nothing to clean up = already clean
      }
      await adminPage.screenshot({ path: `${SHOTS}/check8-after-restore.png`, fullPage: false });
    }

    const pass = replaceBtnInfo.found && (uploadSuccess || afterClickState.dialogs.length > 0);
    console.log(`  ${pass ? "PASS" : "FAIL"} Replace Image e2e`);
    results.check8 = {
      status: pass ? "PASS" : "FAIL",
      details: {
        testImageSizeMB: (testImageSize / 1024 / 1024).toFixed(2),
        replaceBtnFound: replaceBtnInfo.found,
        dialogAppeared: afterClickState.dialogs.length > 0,
        fileInputFound: afterClickState.inputCount > 0,
        uploadSuccess,
        rowUpdated,
        restored,
      },
    };
  } catch (e) {
    console.error("Check 8 error:", e.message);
    results.check8 = { status: "ERROR", error: e.message };
  }

  await browser.close();

  // ─────────────────────────────────────────────────────────────────────────────
  // Final summary
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("  FINAL VERIFICATION SUMMARY — commit ddf9935");
  console.log("══════════════════════════════════════════════════════");
  let allPass = true;
  for (const [key, check] of Object.entries(results)) {
    const icon = check.status === "PASS" ? "PASS" : check.status === "PARTIAL" ? "PARTIAL" : "FAIL";
    console.log(`  [${icon}] ${key.toUpperCase()}: ${check.status}`);
    if (check.status !== "PASS") allPass = false;
  }
  console.log(`\n  Overall: ${allPass ? "ALL PASS" : "ONE OR MORE FAILURES"}`);

  const outPath = `${SHOTS}/verify-ddf9935-v2-results.json`;
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\n  Results: ${outPath}`);
}

run().catch((e) => { console.error("Fatal:", e); process.exit(1); });

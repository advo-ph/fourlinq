/**
 * probe-admin-routing.mjs
 * Find the correct admin URL/section for Project Images and project detail.
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
    console.log("Logged in, URL:", page.url());
  }

  // Click on "Project Images" nav button
  console.log("\n--- Clicking Project Images nav ---");
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const pi = btns.find(b => b.textContent.trim() === "Project Images");
    if (pi) { pi.click(); return true; }
    return false;
  });
  console.log("Clicked Project Images:", clicked);
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/probe-admin-project-images-tab.png`, fullPage: false });
  console.log("URL after click:", page.url());

  const tabStructure = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map(b => b.textContent.trim().slice(0, 60));
    const imgs = [...document.querySelectorAll("img")].map(img => ({
      src: img.src.split("/").slice(-3).join("/"),
      alt: img.alt.slice(0, 40),
      classes: img.className.slice(0, 100),
      width: img.naturalWidth,
      height: img.naturalHeight,
    })).filter(img => !img.src.includes("wp-export") && !img.src.includes("nav-") && !img.src.includes("real/"));
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map(h => h.textContent.trim()).slice(0, 10);
    const links = [...document.querySelectorAll("a[href]")].map(a => ({ href: a.href.replace(/https:\/\/[^/]+/, ""), text: a.textContent.trim().slice(0, 50) })).slice(0, 20);
    const bodySnippet = document.body.innerHTML.slice(0, 8000);
    return { btns: btns.slice(0, 40), imgs: imgs.slice(0, 20), headings, links, bodySnippet };
  });

  console.log("\nProject Images tab buttons:", JSON.stringify(tabStructure.btns));
  console.log("\nProject Images tab images:", JSON.stringify(tabStructure.imgs));
  console.log("\nProject Images tab headings:", JSON.stringify(tabStructure.headings));
  console.log("\nProject Images tab links:", JSON.stringify(tabStructure.links));
  console.log("\nBody snippet:", tabStructure.bodySnippet.slice(0, 6000));

  // Scroll down to see full content
  await page.evaluate(() => window.scrollBy(0, 400));
  await sleep(1000);
  await page.screenshot({ path: `${SHOTS}/probe-admin-project-images-scroll.png`, fullPage: false });

  const scrollStructure = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")].map(img => ({
      src: img.src.split("/").slice(-3).join("/"),
      alt: img.alt.slice(0, 40),
      classes: img.className.slice(0, 150),
      width: img.naturalWidth,
      height: img.naturalHeight,
      parentClass: img.parentElement?.className?.slice(0, 100) ?? "",
    })).filter(img => img.src.includes("projects") || img.src.includes("nuvali") || img.src.includes("binan") || img.src.includes("tagaytay"));
    const draggables = [...document.querySelectorAll('[draggable="true"], [data-rbd-draggable-id]')].map(d => ({
      tag: d.tagName,
      classes: d.className.slice(0, 100),
      text: d.textContent.trim().slice(0, 60),
    }));
    const btns = [...document.querySelectorAll("button")].map(b => b.textContent.trim().slice(0, 60)).filter(t => t);
    return { imgs, draggables, btns: btns.slice(0, 40) };
  });
  console.log("\nScrolled project images:", JSON.stringify(scrollStructure.imgs));
  console.log("\nScrolled draggables:", JSON.stringify(scrollStructure.draggables));
  console.log("\nScrolled buttons:", JSON.stringify(scrollStructure.btns));

  // Full page
  await page.screenshot({ path: `${SHOTS}/probe-admin-project-images-full.png`, fullPage: true });
  console.log("Full page screenshot saved");

  // Now try looking for a specific project — look for nuvali in any links or data attrs
  const nuvaliFinders = await page.evaluate(() => {
    const matches = [];
    // Look for text containing "nuvali"
    const allEls = [...document.querySelectorAll("*")];
    for (const el of allEls) {
      const text = el.textContent?.toLowerCase() ?? "";
      const href = el.getAttribute("href") ?? "";
      if ((text.includes("nuvali") || href.includes("nuvali")) && el.childElementCount < 3) {
        matches.push({
          tag: el.tagName,
          text: el.textContent.trim().slice(0, 80),
          classes: el.className?.slice(0, 80) ?? "",
          href: href,
        });
      }
    }
    return matches.slice(0, 20);
  });
  console.log("\nElements mentioning nuvali:", JSON.stringify(nuvaliFinders));

  // See if there's a search/filter for projects
  const searchInputs = await page.evaluate(() => {
    return [...document.querySelectorAll('input')].map(input => ({
      type: input.type,
      placeholder: input.placeholder,
      classes: input.className.slice(0, 60),
    }));
  });
  console.log("\nInputs on page:", JSON.stringify(searchInputs));

  // Try searching for nuvali in any input
  if (searchInputs.length > 0) {
    const searchInput = await page.$('input[type="text"], input[type="search"], input:not([type="hidden"])');
    if (searchInput) {
      await searchInput.type("nuvali");
      await sleep(2000);
      await page.screenshot({ path: `${SHOTS}/probe-admin-search-nuvali.png`, fullPage: false });
      console.log("Typed nuvali in search input");

      const searchResults = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll("img")].map(img => ({
          src: img.src.split("/").slice(-2).join("/"),
          alt: img.alt,
        })).filter(img => img.src.includes("nuvali") || img.src.includes("project"));
        const btns = [...document.querySelectorAll("button")].map(b => b.textContent.trim().slice(0, 60)).filter(t => t);
        const links = [...document.querySelectorAll("a[href]")].map(a => a.href.replace(/https:\/\/[^/]+/, "")).filter(h => h.includes("nuvali") || h.includes("project"));
        return { imgs, btns: btns.slice(0, 20), links };
      });
      console.log("Search results imgs:", JSON.stringify(searchResults.imgs));
      console.log("Search results btns:", JSON.stringify(searchResults.btns.slice(0, 15)));
      console.log("Search results links:", JSON.stringify(searchResults.links));
    }
  }

  // Try direct API calls to understand the admin API structure
  console.log("\n--- Probing admin API endpoints ---");
  const apiProbe = await page.evaluate(async () => {
    const results = {};

    // Try various admin endpoints
    const endpoints = [
      "/api/admin/project-images",
      "/api/admin/project-images/overrides",
      "/api/admin/projects",
      "/api/project-images/merged",
    ];

    for (const ep of endpoints) {
      try {
        const r = await fetch(ep, { credentials: "include" });
        const text = await r.text();
        let body;
        try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
        results[ep] = { status: r.status, ok: r.ok, bodyPreview: JSON.stringify(body).slice(0, 300) };
      } catch (e) {
        results[ep] = { error: e.message };
      }
    }
    return results;
  });
  console.log("API probe results:", JSON.stringify(apiProbe, null, 2));

  await browser.close();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });

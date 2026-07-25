/**
 * probe-admin-dom.mjs
 * Dump admin UI structure to understand selectors.
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
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
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

  // Screenshot admin main page
  await page.screenshot({ path: `${SHOTS}/probe-admin-main.png`, fullPage: false });
  console.log("Admin URL after login:", page.url());

  // Dump current page structure
  const pageStructure = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map(b => b.textContent.trim());
    const links = [...document.querySelectorAll("a[href]")].map(a => ({ href: a.href, text: a.textContent.trim().slice(0, 40) })).slice(0, 20);
    const headings = [...document.querySelectorAll("h1,h2,h3")].map(h => h.textContent.trim()).slice(0, 10);
    return { btns: btns.slice(0, 30), links: links.slice(0, 20), headings };
  });
  console.log("Buttons:", JSON.stringify(pageStructure.btns));
  console.log("Headings:", JSON.stringify(pageStructure.headings));
  console.log("Links:", JSON.stringify(pageStructure.links));

  // Try navigating to projects list
  await page.goto(`${PROD}/admin`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/probe-admin-home.png`, fullPage: true });
  console.log("\nAdmin home full screenshot saved");

  const homeStructure = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map(b => ({
      text: b.textContent.trim().slice(0, 60),
      classes: b.className.slice(0, 60),
    }));
    const imgs = [...document.querySelectorAll("img")].map(img => ({
      src: img.src.split("/").slice(-2).join("/"),
      alt: img.alt,
      classes: img.className.slice(0, 40),
    })).slice(0, 20);
    const links = [...document.querySelectorAll("a")].map(a => ({
      href: a.href.replace(/https?:\/\/[^/]+/, ""),
      text: a.textContent.trim().slice(0, 50),
    })).slice(0, 30);
    return { btns: btns.slice(0, 30), imgs: imgs.slice(0, 15), links };
  });
  console.log("\nHome buttons:", JSON.stringify(homeStructure.btns));
  console.log("\nHome images:", JSON.stringify(homeStructure.imgs));
  console.log("\nHome links:", JSON.stringify(homeStructure.links));

  // Go to /admin/projects
  await page.goto(`${PROD}/admin/projects`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(3000);
  await page.screenshot({ path: `${SHOTS}/probe-admin-projects.png`, fullPage: false });
  console.log("\nAdmin projects URL:", page.url());

  const projectsStructure = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map(b => b.textContent.trim().slice(0, 60));
    const imgs = [...document.querySelectorAll("img")].map(img => ({
      src: img.src.split("/").slice(-2).join("/"),
      alt: img.alt,
      classes: img.className.slice(0, 60),
      width: img.naturalWidth,
    })).slice(0, 10);
    const links = [...document.querySelectorAll("a[href*='project']")].map(a => ({
      href: a.href.replace(/https?:\/\/[^/]+/, ""),
      text: a.textContent.trim().slice(0, 50),
    })).slice(0, 20);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map(h => h.textContent.trim()).slice(0, 10);
    const body = document.body.innerHTML.slice(0, 3000);
    return { btns: btns.slice(0, 20), imgs, links, headings, bodySnippet: body };
  });
  console.log("\nProjects page buttons:", JSON.stringify(projectsStructure.btns));
  console.log("\nProjects page images:", JSON.stringify(projectsStructure.imgs));
  console.log("\nProjects page links:", JSON.stringify(projectsStructure.links));
  console.log("\nProjects page headings:", JSON.stringify(projectsStructure.headings));
  console.log("\nBody snippet:", projectsStructure.bodySnippet.slice(0, 2000));

  // Try the project detail page
  await page.goto(`${PROD}/admin/projects/nuvali-laguna-residence`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(4000);
  await page.screenshot({ path: `${SHOTS}/probe-admin-project-detail.png`, fullPage: false });
  console.log("\nProject detail URL:", page.url());

  const detailStructure = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].map(b => ({
      text: b.textContent.trim().slice(0, 60),
      classes: b.className.slice(0, 100),
    }));
    const imgs = [...document.querySelectorAll("img")].map(img => ({
      src: img.src.split("/").slice(-2).join("/"),
      alt: img.alt,
      classes: img.className.slice(0, 60),
      width: img.naturalWidth,
      height: img.naturalHeight,
    })).slice(0, 20);
    const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map(h => h.textContent.trim()).slice(0, 10);
    const spans = [...document.querySelectorAll("span, badge")].map(s => s.textContent.trim()).filter(t => t.length < 30).slice(0, 30);
    const bodySnippet = document.body.innerHTML.slice(0, 5000);
    return { btns: btns.slice(0, 40), imgs, headings, spans, bodySnippet };
  });

  console.log("\nDetail buttons:", JSON.stringify(detailStructure.btns));
  console.log("\nDetail images:", JSON.stringify(detailStructure.imgs));
  console.log("\nDetail headings:", JSON.stringify(detailStructure.headings));
  console.log("\nDetail spans:", JSON.stringify(detailStructure.spans));
  console.log("\nDetail body snippet:", detailStructure.bodySnippet.slice(0, 4000));

  // Scroll down to see more
  await page.evaluate(() => window.scrollBy(0, 600));
  await sleep(1000);
  await page.screenshot({ path: `${SHOTS}/probe-admin-project-detail-scroll.png`, fullPage: false });

  const scrolledStructure = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")].map(img => ({
      src: img.src.split("/").slice(-2).join("/"),
      alt: img.alt,
      classes: img.className.slice(0, 100),
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));
    const draggables = [...document.querySelectorAll('[draggable], [data-rbd-draggable-id], [class*="drag"]')].map(d => ({
      tag: d.tagName,
      classes: d.className.slice(0, 100),
      text: d.textContent.trim().slice(0, 60),
    }));
    return { imgs, draggables: draggables.slice(0, 10) };
  });
  console.log("\nScrolled images:", JSON.stringify(scrolledStructure.imgs));
  console.log("\nDraggable elements:", JSON.stringify(scrolledStructure.draggables));

  // Full page screenshot
  await page.screenshot({ path: `${SHOTS}/probe-admin-project-detail-full.png`, fullPage: true });
  console.log("Full page screenshot saved");

  console.log("\nAdmin console errors:", consoleErrors.length);
  consoleErrors.slice(0, 5).forEach(e => console.log(" ", e));

  await browser.close();
}

run().catch(e => { console.error("Fatal:", e); process.exit(1); });

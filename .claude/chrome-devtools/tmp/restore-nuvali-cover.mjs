/**
 * restore-nuvali-cover.mjs
 * Delete the accidentally-created replace override for nuvali-laguna-residence-9.jpg
 * (id=1438, created today during test runs), restoring the cover to -9.jpg.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";

const PROD = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();

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

  // Delete override id=1438 (nuvali replace override created by our tests)
  const delResp = await page.evaluate(async () => {
    const r = await fetch("/api/admin/project-images/overrides/1438", {
      method: "DELETE",
      credentials: "include",
    });
    return { status: r.status, ok: r.ok, body: await r.text() };
  });
  console.log(`Delete id=1438: status=${delResp.status}, ok=${delResp.ok}, body=${delResp.body.slice(0, 100)}`);

  await sleep(2000);

  // Verify cover restored
  const merged = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`).then(r => r.json());
  const nuvalidCover = merged.projectCoverImages?.["nuvali-laguna-residence"] ?? "NONE";
  console.log(`nuvali-laguna-residence cover: ${nuvalidCover}`);
  console.log(`Expected: /images/projects-fb/nuvali-laguna-residence-9.jpg`);
  console.log(`Match: ${nuvalidCover === "/images/projects-fb/nuvali-laguna-residence-9.jpg"}`);

  await browser.close();
}

run().catch(e => console.error("Fatal:", e));

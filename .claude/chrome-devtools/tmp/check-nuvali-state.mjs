/**
 * check-nuvali-state.mjs
 * Check what overrides exist for nuvali-laguna-residence to understand the cover state.
 * Also verify binan state is fully clean.
 */
import puppeteer from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";

const PROD = "https://fourlinq.ph";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  }

  const overrides = await page.evaluate(async () => {
    const r = await fetch("/api/admin/project-images/overrides", { credentials: "include" });
    const d = await r.json();
    return d.overrides ?? [];
  });

  const nuvalidRows = overrides.filter(r => r.project_id === "nuvali-laguna-residence");
  const binanRows = overrides.filter(r => r.project_id === "binan-residence");
  const check8UploadRows = overrides.filter(r => r.override_type === "replaced" && r.value_text?.includes("20260725"));

  console.log("=== nuvali-laguna-residence overrides ===");
  nuvalidRows.forEach(r => console.log(`  id=${r.project_image_override_id} type=${r.override_type} path=${r.image_path} value=${r.value_text ?? r.value_int}`));

  console.log("\n=== binan-residence overrides ===");
  binanRows.forEach(r => console.log(`  id=${r.project_image_override_id} type=${r.override_type} path=${r.image_path} value=${r.value_text ?? r.value_int}`));

  console.log(`\n=== All today's (20260725) replace overrides ===`);
  check8UploadRows.forEach(r => console.log(`  id=${r.project_image_override_id} project=${r.project_id} path=${r.image_path} value=${r.value_text}`));

  // Check merged API
  const merged = await fetch(`${PROD}/api/project-images/merged?r=${Date.now()}`).then(r => r.json());
  const covers = merged.projectCoverImages ?? {};
  console.log("\n=== API covers ===");
  ["nuvali-laguna-residence", "nuvali-laguna-residence-c", "tagaytay-cavite-residence", "binan-residence"].forEach(p => {
    console.log(`  ${p}: ${covers[p]}`);
  });

  // The nuvali cover showing a CMS upload means there's an existing replaced override
  // for nuvali-laguna-residence-9.jpg (the cover image). Check if it pre-existed before our test run.
  const nuvaliReplacedRows = nuvalidRows.filter(r => r.override_type === "replaced");
  console.log(`\nnuvali replaced rows: ${nuvaliReplacedRows.length}`);
  nuvaliReplacedRows.forEach(r => console.log(`  id=${r.project_image_override_id} path=${r.image_path} value=${r.value_text} created=${r.created_at}`));

  await browser.close();
}

run().catch(e => console.error("Fatal:", e));

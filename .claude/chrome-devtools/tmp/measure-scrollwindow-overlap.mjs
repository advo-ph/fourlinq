// Measure text-vs-image overlap for every mobile ScrollWindow step (0..3)
// at two viewports. Outputs JSON + per-step screenshots.
import {
  getBrowser,
  getPage,
  disconnectBrowser,
  outputJSON,
} from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEWPORTS = [
  { name: "390x844", width: 390, height: 844 },
  { name: "375x667", width: 375, height: 667 },
];

async function measureViewport(page, vp) {
  await page.setViewport({ ...vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:8080", { waitUntil: "networkidle2", timeout: 60000 });

  // Dismiss cookie banner if present.
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /accept/i.test(b.textContent));
    btn?.click();
  });
  await sleep(400);

  await page.waitForFunction(
    () => [...document.querySelectorAll("canvas")].some((c) => c.parentElement?.className.includes("aspect-square")),
    { timeout: 30000 },
  );

  // Engage the section at step 0.
  await page.evaluate(() => {
    const canvas = [...document.querySelectorAll("canvas")].find((c) =>
      c.parentElement?.className.includes("aspect-square"),
    );
    const container = canvas.parentElement.parentElement.parentElement;
    window.scrollTo(0, container.getBoundingClientRect().top + window.scrollY);
  });

  // Wait for frames to preload.
  await page.waitForFunction(
    () => {
      const c = [...document.querySelectorAll("canvas")].find((c) =>
        c.parentElement?.className.includes("aspect-square"),
      );
      return c && c.width > 1000;
    },
    { timeout: 60000, polling: 250 },
  );
  await sleep(800);

  const steps = [];
  for (let step = 0; step < 4; step++) {
    if (step > 0) {
      await page.evaluate(() => window.dispatchEvent(new WheelEvent("wheel", { deltaY: 120, cancelable: true })));
      await sleep(3200); // cooldown + text swap + segment animation settle
    }
    const m = await page.evaluate((stepIdx) => {
      const canvas = [...document.querySelectorAll("canvas")].find((c) =>
        c.parentElement?.className.includes("aspect-square"),
      );
      const box = canvas.parentElement;
      const boxR = box.getBoundingClientRect();
      const sticky = box.parentElement;
      // Mobile overlay = absolute inset-0 z-10 sibling holding the step divs.
      const overlay = [...sticky.children].find((el) => el.className.includes("z-10") && el.className.includes("inset-0"));
      const stepDiv = overlay?.children[stepIdx];
      const r = stepDiv?.getBoundingClientRect();
      // Union bottom of the step's actual content (last child bottom).
      const kids = stepDiv ? [...stepDiv.querySelectorAll(":scope > *")] : [];
      const contentBottom = kids.length ? Math.max(...kids.map((k) => k.getBoundingClientRect().bottom)) : null;
      return {
        imageTop: +boxR.top.toFixed(1),
        imageBottom: +boxR.bottom.toFixed(1),
        textTop: r ? +r.top.toFixed(1) : null,
        textBottom: contentBottom !== null ? +contentBottom.toFixed(1) : null,
        overlapPx: contentBottom !== null ? +Math.max(0, contentBottom - boxR.top).toFixed(1) : null,
        viewportH: window.innerHeight,
      };
    }, step);
    steps.push({ step, ...m });
    await page.screenshot({ path: `${SHOTS}/overlap-${vp.name}-step${step}.png` });
  }
  return steps;
}

async function run() {
  const browser = await getBrowser({ headless: true });
  const page = await getPage(browser);
  const results = {};
  for (const vp of VIEWPORTS) {
    results[vp.name] = await measureViewport(page, { width: vp.width, height: vp.height, name: vp.name });
  }
  outputJSON({ success: true, results });
  await disconnectBrowser();
}

run().catch((e) => {
  outputJSON({ success: false, error: e.message });
  process.exit(1);
});

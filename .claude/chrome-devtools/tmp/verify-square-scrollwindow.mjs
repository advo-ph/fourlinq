// Verify the mobile ScrollWindow media renders as a 1:1 square with the 16:9
// frame center-cropped via object-cover, and that Part-2 pins land on the image.
import {
  getBrowser,
  getPage,
  disconnectBrowser,
  outputJSON,
} from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js";

const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const browser = await getBrowser({ headless: true });
  const page = await getPage(browser);
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto("http://localhost:8080", { waitUntil: "networkidle2", timeout: 60000 });

  // Locate the ScrollWindow media box (the aspect-square div holding the canvas).
  await page.waitForFunction(
    () => [...document.querySelectorAll("canvas")].some((c) => c.parentElement?.className.includes("aspect-square")),
    { timeout: 30000 },
  );

  // Scroll the section's container to the top of the viewport → engages the mobile pin at step 0.
  await page.evaluate(() => {
    const canvas = [...document.querySelectorAll("canvas")].find((c) =>
      c.parentElement?.className.includes("aspect-square"),
    );
    const sticky = canvas.parentElement.parentElement; // sticky media wrapper
    const container = sticky.parentElement; // section container
    window.scrollTo(0, container.getBoundingClientRect().top + window.scrollY);
  });

  // Wait for all 186 frames to preload (canvas gets its natural size on first draw).
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

  const geometry = await page.evaluate(() => {
    const canvas = [...document.querySelectorAll("canvas")].find((c) =>
      c.parentElement?.className.includes("aspect-square"),
    );
    const box = canvas.parentElement;
    const boxR = box.getBoundingClientRect();
    const canR = canvas.getBoundingClientRect();
    const markerWrapper = [...box.children].find(
      (el) => el !== canvas && el.className.includes("aspect-[1920/1080]"),
    );
    const mwR = markerWrapper?.getBoundingClientRect();
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      mediaBox: { w: +boxR.width.toFixed(1), h: +boxR.height.toFixed(1) },
      boxIsSquare: Math.abs(boxR.width - boxR.height) < 1,
      canvasCss: { w: +canR.width.toFixed(1), h: +canR.height.toFixed(1) },
      canvasIntrinsic: { w: canvas.width, h: canvas.height },
      canvasObjectFit: getComputedStyle(canvas).objectFit,
      posterObjectFit: getComputedStyle(box.querySelector("img")).objectFit,
      markerWrapper: mwR
        ? { w: +mwR.width.toFixed(1), h: +mwR.height.toFixed(1), left: +mwR.left.toFixed(1) }
        : null,
      // wrapper should be 16:9 at box height, centered (left = (boxW - wrapW)/2, negative)
      wrapperMatchesCover: mwR
        ? Math.abs(mwR.width - (boxR.height * 1920) / 1080) < 2 &&
          Math.abs(mwR.left - (boxR.width - mwR.width) / 2 - boxR.left) < 2
        : false,
    };
  });

  await page.screenshot({ path: `${SHOTS}/mobile-scrollwindow-step0.png` });

  // Advance to step 2 (thermal part) via wheel events; pins fade in once settled.
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => window.dispatchEvent(new WheelEvent("wheel", { deltaY: 120, cancelable: true })));
    await sleep(700);
  }
  await sleep(4000); // frames 59→116 play at 30fps, then pins fade in (500ms)

  const pins = await page.evaluate(() => {
    const canvas = [...document.querySelectorAll("canvas")].find((c) =>
      c.parentElement?.className.includes("aspect-square"),
    );
    const box = canvas.parentElement;
    const boxR = box.getBoundingClientRect();
    const layer = [...box.querySelectorAll("div")].find((el) => el.className.includes("lg:hidden"));
    const spans = layer ? [...layer.querySelectorAll("span")] : [];
    return {
      pinLayerOpacity: layer ? getComputedStyle(layer).opacity : null,
      pinCount: spans.length,
      pinsInsideSquare: spans.map((s) => {
        const r = s.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        return {
          x: +cx.toFixed(1),
          y: +cy.toFixed(1),
          inside: cx >= boxR.left && cx <= boxR.right && cy >= boxR.top && cy <= boxR.bottom,
        };
      }),
    };
  });

  await page.screenshot({ path: `${SHOTS}/mobile-scrollwindow-step2-pins.png` });

  outputJSON({ success: true, geometry, pins });
  await disconnectBrowser();
}

run().catch((e) => {
  outputJSON({ success: false, error: e.message });
  process.exit(1);
});

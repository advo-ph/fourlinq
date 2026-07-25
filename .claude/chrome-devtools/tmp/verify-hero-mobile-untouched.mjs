/**
 * HAZARD guard: confirm the mobile (<lg) layout is untouched by the desktop
 * rail-collapse work — plain buttons, no per-thumb motion values, and a wrapper
 * whose layout height does NOT change with scroll (which would feed back into
 * scrollYProgress and cause jitter).
 */
import {
  getBrowser,
  getPage,
  disconnectBrowser,
} from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js";

const URL = "http://localhost:8080/projects/las-pinas-residence";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const browser = await getBrowser({ headless: true, skipChromeDebug: true });
  const page = await getPage(browser);
  const pageErrors = [];
  const consoleMsgs = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") consoleMsgs.push(m.text());
  });

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(2500);

  const probe = async () =>
    page.evaluate(() => {
      const section = [...document.querySelectorAll("section")].find((s) =>
        s.className.includes("lg:hidden")
      );
      if (!section) return { error: "mobile section not found" };
      const wrapper = section.parentElement;
      const strip = section.querySelector(".grid-cols-4");
      const btns = strip ? [...strip.querySelectorAll("button")] : [];
      return {
        scrollY: Math.round(window.scrollY),
        wrapperOffsetHeight: wrapper.offsetHeight,
        desktopSectionDisplay: getComputedStyle(
          [...document.querySelectorAll("section")].find((s) =>
            s.className.includes("h-[calc(100dvh-72px)]")
          )
        ).display,
        stripDisplay: strip ? getComputedStyle(strip).display : null,
        thumbCount: btns.length,
        thumbTags: [...new Set(btns.map((b) => b.tagName))],
        thumbInlineStyles: [...new Set(btns.map((b) => b.getAttribute("style") ?? "<none>"))],
        thumbOpacities: [...new Set(btns.map((b) => getComputedStyle(b).opacity))],
        thumbTransforms: [...new Set(btns.map((b) => getComputedStyle(b).transform))],
        thumbTabIndexes: [...new Set(btns.map((b) => b.tabIndex))],
      };
    });

  const at0 = await probe();
  const h = at0.wrapperOffsetHeight;

  const samples = [];
  for (const p of [0.15, 0.3, 0.6, 0.9]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), Math.round(72 + p * h));
    await sleep(700);
    const s = await probe();
    samples.push({ p, ...s });
  }

  const heights = [at0.wrapperOffsetHeight, ...samples.map((s) => s.wrapperOffsetHeight)];
  console.log(
    JSON.stringify(
      {
        at0,
        samples,
        wrapperHeightStable: new Set(heights).size === 1,
        heights,
        consoleMsgs,
        pageErrors,
      },
      null,
      2
    )
  );

  await disconnectBrowser();
};

main().catch(async (e) => {
  console.error("PROBE FAILED:", e);
  await disconnectBrowser().catch(() => {});
  process.exit(1);
});

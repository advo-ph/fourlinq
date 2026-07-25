/**
 * Verification probe for ProjectHeroGallery rail-collapse (Changes A/B/C).
 *
 * Checks at ~90% of the wrapper's scroll-through, 1440x900:
 *   - rail computed width  === 0px
 *   - section computed column-gap === 0px
 *   - left photo panel horizontally centred (|leftGap - rightGap| <= 2px)
 *
 * Also samples p=0 and p=0.15 so the cascade can be seen mid-flight.
 *
 * Notes: dev server at :8080 never reaches networkidle2 (HMR socket), so we use
 * domcontentloaded + an explicit settle.
 */
import {
  getBrowser,
  getPage,
  disconnectBrowser,
} from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js";

const URL = "http://localhost:8080/projects/las-pinas-residence";
const SAMPLES = process.env.SAMPLES
  ? process.env.SAMPLES.split(",").map(Number)
  : [0, 0.15, 0.9];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const readState = () =>
  // eslint-disable-next-line no-undef
  ({
    ...(() => {
      const section = [...document.querySelectorAll("section")].find((s) =>
        s.className.includes("h-[calc(100dvh-72px)]")
      );
      if (!section) return { error: "desktop section not found" };
      const wrapper = section.parentElement;
      const rail = section.lastElementChild;
      const panel = section.firstElementChild;
      const innerGrid = rail.firstElementChild;
      const thumbs = [...innerGrid.querySelectorAll("button")];

      const sCS = getComputedStyle(section);
      const rCS = getComputedStyle(rail);
      const pRect = panel.getBoundingClientRect();
      const layoutW = document.documentElement.clientWidth;

      return {
        scrollY: Math.round(window.scrollY),
        railWidth: rCS.width,
        railOffsetWidth: rail.offsetWidth,
        columnGap: sCS.columnGap,
        paddingLeft: sCS.paddingLeft,
        paddingRight: sCS.paddingRight,
        railAriaHidden: rail.getAttribute("aria-hidden"),
        panelLeftGap: +pRect.left.toFixed(2),
        panelRightGapInner: +(layoutW - pRect.right).toFixed(2),
        panelRightGapWindow: +(window.innerWidth - pRect.right).toFixed(2),
        panelWidth: +pRect.width.toFixed(2),
        layoutW,
        innerW: window.innerWidth,
        wrapperTransform: getComputedStyle(wrapper).transform,
        thumbs: thumbs.map((b) => {
          const cs = getComputedStyle(b);
          return {
            opacity: +(+cs.opacity).toFixed(3),
            transform: cs.transform,
            pointerEvents: cs.pointerEvents,
            tabIndex: b.tabIndex,
          };
        }),
      };
    })(),
  });

const main = async () => {
  const browser = await getBrowser({ headless: true, skipChromeDebug: true });
  const page = await getPage(browser);

  const consoleMsgs = [];
  const pageErrors = [];
  const failedReqs = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type()))
      consoleMsgs.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("requestfailed", (r) =>
    failedReqs.push(`${r.url()} :: ${r.failure()?.errorText}`)
  );

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(2500);

  // Measure the wrapper exactly the way framer-motion's scroll offsets do:
  // offsetTop chain + offsetHeight (layout values, unaffected by transforms).
  const geo = await page.evaluate(() => {
    const section = [...document.querySelectorAll("section")].find((s) =>
      s.className.includes("h-[calc(100dvh-72px)]")
    );
    if (!section) return { error: "desktop section not found" };
    const wrapper = section.parentElement;
    let el = wrapper;
    let top = 0;
    while (el) {
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return {
      top,
      height: wrapper.offsetHeight,
      docHeight: document.documentElement.scrollHeight,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

  if (geo.error) throw new Error(geo.error);

  const results = [];
  for (const p of SAMPLES) {
    const y = Math.round(geo.top + p * geo.height);
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(900);
    const state = await page.evaluate(readState);
    results.push({ p, requestedScrollY: y, ...state });
    await page.screenshot({
      path: `/Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/hero-rail-p${String(
        p
      ).replace(".", "_")}.png`,
    });
  }

  console.log(
    JSON.stringify(
      { geo, results, consoleMsgs, pageErrors, failedReqs },
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

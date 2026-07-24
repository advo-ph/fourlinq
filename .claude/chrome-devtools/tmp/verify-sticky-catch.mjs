// Verify v3 ScrollWindow: sticky pin catch (260lvh track), 4:3 media,
// faster fade/commit, no-debounce rapid swipes, exit glides, desktop regression.
import { createRequire } from "module";
const require = createRequire(
  "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js",
);
const puppeteer = require("puppeteer");

const BASE = "http://localhost:8081";
const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};
const watchdog = setTimeout(() => {
  console.log(JSON.stringify({ FATAL: "WATCHDOG_TIMEOUT", partial: results }, null, 2));
  process.exit(2);
}, 170000);

async function swipe(client, { x = 195, fromY, toY, steps = 12, stepDelayMs = 16 }) {
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: fromY }] });
  const dy = (toY - fromY) / steps;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: Math.round(fromY + dy * i) }],
    });
    await sleep(stepDelayMs);
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function swipeHold(client, { x = 195, fromY, toY, steps = 10, stepDelayMs = 16 }) {
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: fromY }] });
  const dy = (toY - fromY) / steps;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: Math.round(fromY + dy * i) }],
    });
    await sleep(stepDelayMs);
  }
  return async () =>
    client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const run = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    protocolTimeout: 30000,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
    await page.evaluateOnNewDocument(() => {
      window.__fq = [];
      window.addEventListener("fq-hide-header", (e) =>
        window.__fq.push({ ev: "header", detail: e.detail }),
      );
      window.addEventListener("fq-scrollwindow-inview", (e) =>
        window.__fq.push({ ev: "inview", detail: e.detail }),
      );
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const client = await page.createCDPSession();
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1200);

    const geo = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const inner = canvas.closest("div[class*='h-\\[100lvh\\]']");
      const track = inner.parentElement;
      const tr = track.getBoundingClientRect();
      const media = canvas.parentElement.getBoundingClientRect();
      return {
        trackTop: tr.top + window.scrollY,
        trackH: tr.height,
        vh: window.innerHeight,
        innerH: inner.getBoundingClientRect().height,
        mediaW: media.width,
        mediaH: media.height,
      };
    });
    const { trackTop, trackH, vh } = geo;
    results.geometry = {
      ...geo,
      trackHInVh: +(trackH / vh).toFixed(2),
      mediaAspect: +(geo.mediaW / geo.mediaH).toFixed(3),
      verdict:
        Math.abs(trackH / vh - 2.6) < 0.05 && Math.abs(geo.mediaW / geo.mediaH - 4 / 3) < 0.01
          ? "TRACK_AND_ASPECT_OK"
          : "CHECK",
    };

    const innerTopAt = async (y) => {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await sleep(250);
      return page.evaluate(() => {
        const inner = document.querySelector("canvas").closest("div[class*='h-\\[100lvh\\]']");
        const r = inner.getBoundingClientRect();
        return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1) };
      });
    };

    // ── Sticky pin: section visually fixed at several offsets inside the track ──
    const pins = [];
    for (const off of [100, 500, 900, 1200]) {
      pins.push({ off, ...(await innerTopAt(trackTop + off)) });
    }
    results.stickyPin = {
      pins,
      verdict: pins.every((p) => Math.abs(p.top) <= 1) ? "PINNED_THROUGHOUT_TRACK" : "CHECK",
    };

    // media flush to bottom while pinned
    const flush = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      const media = c.parentElement.getBoundingClientRect();
      return { mediaBottom: +media.bottom.toFixed(1), vh: window.innerHeight };
    });
    results.mediaFlush = {
      ...flush,
      verdict: Math.abs(flush.mediaBottom - flush.vh) <= 1 ? "FLUSH" : "CHECK",
    };

    const cardOpacities = () =>
      page.evaluate(() =>
        [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")].map(
          (d) => +(+getComputedStyle(d).opacity).toFixed(2),
        ),
      );
    const fabState = () =>
      page.evaluate(() => {
        const el = document.querySelector("[data-chat-bubble]");
        const cs = getComputedStyle(el);
        return { opacity: +(+cs.opacity).toFixed(2), pe: cs.pointerEvents };
      });

    // ── Engage from ABOVE: jump from well above into the track → step 0 ──
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(400);
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
    await sleep(500);
    const evAbove = await page.evaluate(() => window.__fq.slice());
    results.engageFromAbove = {
      cards: await cardOpacities(),
      events: evAbove,
      fab: await fabState(),
      verdict:
        (await cardOpacities())[0] === 1 &&
        evAbove.some((e) => e.ev === "header" && e.detail === true) &&
        (await fabState()).opacity === 0
          ? "ENGAGED_STEP0"
          : "CHECK",
    };

    // ── Faster fade: hold at dy=-100 → opacity ≈ 0.17, translateY -100 ──
    const release1 = await swipeHold(client, { fromY: 600, toY: 500 });
    const mid = await page.evaluate(() => {
      const d = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")][0];
      const cs = getComputedStyle(d);
      const ty = cs.transform.startsWith("matrix")
        ? +cs.transform.split(",").pop().replace(")", "").trim()
        : 0;
      return { opacity: +(+cs.opacity).toFixed(2), translateY: ty };
    });
    await release1();
    await sleep(700);
    results.fasterFade = {
      midGesture: mid,
      committedTo: await cardOpacities(),
      verdict: mid.translateY <= -95 && mid.opacity <= 0.25 ? "FADES_FAST" : "CHECK",
    };
    // (that -100px swipe should also have committed → step 1)

    // ── Commit at 50px slow (new 44px threshold, old was 60) ──
    await swipe(client, { fromY: 600, toY: 550, steps: 10, stepDelayMs: 50 }); // 50px, v=0.1
    await sleep(700);
    const after50 = await cardOpacities();
    results.commit50pxSlow = {
      cards: after50,
      verdict: after50[2] === 1 ? "COMMITS_AT_50PX" : "CHECK",
    };

    // ── No debounce: back to step 0, then 3 rapid swipes ~170ms apart ──
    await swipe(client, { fromY: 500, toY: 620 }); // step 2 -> 1
    await sleep(120);
    await swipe(client, { fromY: 500, toY: 620 }); // 1 -> 0
    await sleep(400);
    const back0 = await cardOpacities();
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 620, toY: 500, steps: 8, stepDelayMs: 12 });
      await sleep(160);
    }
    await sleep(700);
    const rapid = await cardOpacities();
    results.rapidSwipes = {
      startedFrom: back0,
      after3RapidUp: rapid,
      verdict: back0[0] === 1 && rapid[3] === 1 ? "NO_DEBOUNCE_ALL_LAND" : "CHECK",
    };

    await page.screenshot({ path: `${SHOTS}/sticky-catch-step3.png` });

    // ── Exit glide DOWN: swipe up at last step ──
    await page.evaluate(() => (window.__fq.length = 0));
    await swipe(client, { fromY: 600, toY: 470 });
    await sleep(1400);
    const exitDown = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    const exitDownTarget = trackTop + trackH - vh * 0.5;
    results.exitGlideDown = {
      scrollY: exitDown.y,
      target: +exitDownTarget.toFixed(0),
      events: exitDown.ev,
      fab: await fabState(),
      verdict:
        Math.abs(exitDown.y - exitDownTarget) <= 4 &&
        exitDown.ev.some((e) => e.ev === "header" && e.detail === false)
          ? "GLIDES_OUT_DOWN"
          : "CHECK",
    };

    // ── Engage from BELOW: come back up into the track → last step ──
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + trackH + 500);
    await sleep(400);
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + trackH - vh - 200);
    await sleep(500);
    const belowCards = await cardOpacities();
    results.engageFromBelow = {
      cards: belowCards,
      events: await page.evaluate(() => window.__fq.slice()),
      verdict: belowCards[3] === 1 ? "ENGAGED_LAST_STEP" : "CHECK",
    };

    // ── Exit glide UP: swipe down at step 0 ──
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 470, toY: 600 });
      await sleep(300);
    } // 3 -> 0
    await page.evaluate(() => (window.__fq.length = 0));
    const preExitUp = await page.evaluate(() => window.scrollY);
    await swipe(client, { fromY: 400, toY: 540 });
    await sleep(1400);
    const exitUp = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    results.exitGlideUp = {
      before: preExitUp,
      scrollY: exitUp.y,
      targetApprox: +(trackTop - vh * 0.5).toFixed(0),
      verdict:
        Math.abs(exitUp.y - (trackTop - vh * 0.5)) <= 4 ? "GLIDES_OUT_UP" : "CHECK",
    };

    // ── No hijack when fully above the track ──
    await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, trackTop - 900));
    await sleep(400);
    const b = await page.evaluate(() => window.scrollY);
    await swipe(client, { fromY: 700, toY: 540 });
    await sleep(600);
    const a = await page.evaluate(() => window.scrollY);
    results.nativeScrollOutside = {
      before: b,
      after: a,
      verdict: a > b + 40 ? "NATIVE" : "CHECK",
    };

    // ── Fling-through: fast programmatic pass — header must not stay hidden ──
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate(
      (t) => window.scrollTo(0, t),
      trackTop + trackH + 700,
    ); // single jump across whole track
    await sleep(600);
    const flingEv = await page.evaluate(() => window.__fq.slice());
    const lastHeader = [...flingEv].reverse().find((e) => e.ev === "header");
    results.flingThrough = {
      events: flingEv,
      verdict: !lastHeader || lastHeader.detail === false ? "NO_STUCK_HEADER" : "STUCK_HIDDEN",
    };

    results.consoleErrors = errors.slice(0, 6);

    // ── Desktop regression ──
    const dpage = await browser.newPage();
    await dpage.setViewport({ width: 1280, height: 900 });
    await dpage.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1000);
    const dinfo = await dpage.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const mediaR = canvas.parentElement.getBoundingClientRect();
      const lvh = document.querySelector("div[class*='h-\\[100lvh\\]']");
      // max-lg:h-[260lvh] must not apply at 1280px
      return {
        mediaAspect: +(mediaR.width / mediaR.height).toFixed(2),
        hasMobileLvh: !!lvh && getComputedStyle(lvh).position !== "static",
      };
    });
    const dfab = await dpage.evaluate(() => {
      const c = document.querySelector("canvas");
      const sec = c.closest("div")?.parentElement;
      window.scrollTo(0, 2000);
      return true;
    });
    await sleep(800);
    const dfabOp = await dpage.evaluate(
      () => +(+getComputedStyle(document.querySelector("[data-chat-bubble]")).opacity).toFixed(2),
    );
    await dpage.screenshot({ path: `${SHOTS}/sticky-catch-desktop.png` });
    results.desktop = {
      mediaAspect169expected: dinfo.mediaAspect,
      fabOpacity: dfabOp,
      verdict: Math.abs(dinfo.mediaAspect - 1.78) < 0.05 && dfabOp === 1 ? "UNCHANGED" : "CHECK",
    };

    console.log(JSON.stringify(results, null, 2));
  } finally {
    clearTimeout(watchdog);
    await browser.close();
  }
};

run().catch((e) => {
  console.log(JSON.stringify({ FATAL: String(e), partial: results }, null, 2));
  process.exit(1);
});

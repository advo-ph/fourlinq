// Verify v2 swipe-card ScrollWindow: layout (100lvh, bottom-flush media),
// engagement machine, finger-tracking card swipes, boundary pass-through,
// no-hijack when disengaged, chat FAB + header events, desktop regression.
// Direct puppeteer launch — no shared session file, hard watchdog.
import { createRequire } from "module";
const require = createRequire(
  "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js",
);
const puppeteer = require("puppeteer");

const BASE = "http://localhost:8090";
const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};

// Hard watchdog — this script can NEVER hang silently.
const watchdog = setTimeout(() => {
  console.log(JSON.stringify({ FATAL: "WATCHDOG_TIMEOUT", partial: results }, null, 2));
  process.exit(2);
}, 150000);

function log(s) {
  console.error(`[verify] ${s}`);
}

async function swipe(client, { x, fromY, toY, steps = 12, stepDelayMs = 16 }) {
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: fromY }],
  });
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

// Swipe that pauses mid-gesture so the caller can sample the DOM.
async function swipeHold(client, { x, fromY, toY, steps = 10, stepDelayMs = 16 }) {
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: fromY }],
  });
  const dy = (toY - fromY) / steps;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: Math.round(fromY + dy * i) }],
    });
    await sleep(stepDelayMs);
  }
  // finger held at toY — caller samples, then calls release
  return async () => {
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
}

const pageHelpers = () => {
  window.__fq = [];
  window.addEventListener("fq-hide-header", (e) =>
    window.__fq.push({ ev: "header", detail: e.detail, t: Date.now() }),
  );
  window.addEventListener("fq-scrollwindow-inview", (e) =>
    window.__fq.push({ ev: "inview", detail: e.detail, t: Date.now() }),
  );
};

async function run() {
  log("launching browser");
  const browser = await puppeteer.launch({
    headless: "new",
    protocolTimeout: 30000,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text().slice(0, 200));
    });
    await page.evaluateOnNewDocument(pageHelpers);
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const client = await page.createCDPSession();

    log("loading page (mobile)");
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1200);

    // ── Locate section + layout checks ──
    const layout = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return { error: "no canvas" };
      // containerRef div = section root: walk up to the element with h-[100lvh] child structure
      let sec = canvas.closest("div[class*='h-\\[100lvh\\]']");
      const inner = sec;
      sec = sec ? sec.parentElement : null; // outer container (containerRef)
      if (!sec || !inner) return { error: "no section" };
      const sr = sec.getBoundingClientRect();
      const ir = inner.getBoundingClientRect();
      const media = canvas.parentElement.getBoundingClientRect();
      const cards = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")].map((d) => {
        const r = d.getBoundingClientRect();
        const cs = getComputedStyle(d);
        return { top: r.top, opacity: +(+cs.opacity).toFixed(3), transform: cs.transform };
      });
      window.__sec = sec;
      return {
        sectionTop: sr.top + window.scrollY,
        sectionH: ir.height,
        viewportH: window.innerHeight,
        mediaBottomOffset: ir.bottom - media.bottom, // 0 = flush to section bottom
        cardCount: cards.length,
        cardTopWithinSection: cards[0] ? cards[0].top - ir.top : null,
      };
    });
    results.layout = {
      ...layout,
      verdict:
        layout.sectionH === layout.viewportH && Math.abs(layout.mediaBottomOffset) <= 1
          ? "FULLSCREEN_AND_FLUSH"
          : "CHECK",
    };
    log(`layout: ${JSON.stringify(results.layout)}`);
    const secTop = layout.sectionTop;

    // ── Probe A (Bug A): NOT engaged, section partially visible → swipe must scroll natively ──
    await page.evaluate((y) => window.scrollTo(0, y), secTop - 400);
    await sleep(600);
    const beforeA = await page.evaluate(() => window.scrollY);
    await swipe(client, { x: 195, fromY: 700, toY: 540 }); // starts ON the visible section area
    await sleep(600);
    const afterA = await page.evaluate(() => window.scrollY);
    const cardAfterA = await page.evaluate(() => {
      const d = document.querySelector("div[class*='pt-\\[4vh\\]']");
      const cs = getComputedStyle(d);
      return { opacity: +(+cs.opacity).toFixed(2), transform: cs.transform };
    });
    results.noHijackWhenDisengaged = {
      scrollBefore: beforeA,
      scrollAfter: afterA,
      scrolledNatively: afterA > beforeA + 40,
      card0: cardAfterA,
      verdict: afterA > beforeA + 40 && cardAfterA.opacity >= 0.99 ? "NATIVE_SCROLL" : "HIJACKED_OR_STUCK",
    };
    log(`probeA: ${JSON.stringify(results.noHijackWhenDisengaged)}`);

    // ── Engagement: settle within 48px zone → glide align + events ──
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate((y) => window.scrollTo(0, y), secTop - 600);
    await sleep(400);
    await page.evaluate((y) => window.scrollTo(0, y), secTop - 30); // inside zone, from above
    await sleep(1200); // settle 120ms + smooth glide
    const engage = await page.evaluate(() => ({
      scrollY: window.scrollY,
      events: window.__fq.slice(),
    }));
    const fab1 = await page.evaluate(() => {
      const el = document.querySelector("[data-chat-bubble]");
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { opacity: +(+cs.opacity).toFixed(2), pe: cs.pointerEvents };
    });
    const aligned = Math.abs(engage.scrollY - secTop) <= 2;
    const gotEngageEvents =
      engage.events.some((e) => e.ev === "header" && e.detail === true) &&
      engage.events.some((e) => e.ev === "inview" && e.detail?.inView === true);
    results.engagement = {
      scrollY: engage.scrollY,
      secTop,
      aligned,
      events: engage.events,
      fab: fab1,
      verdict: aligned && gotEngageEvents && fab1?.opacity === 0 ? "ENGAGED_OK" : "CHECK",
    };
    log(`engagement: ${JSON.stringify(results.engagement.verdict)} fab=${JSON.stringify(fab1)}`);

    // ── Finger tracking: swipe up, hold mid-gesture, sample card 0 ──
    const canvasHash = () =>
      page.evaluate(() => {
        const c = document.querySelector("canvas");
        const data = c.toDataURL("image/png");
        let h = 0;
        for (let i = 0; i < data.length; i += 97) h = (h * 31 + data.charCodeAt(i)) | 0;
        return `${data.length}:${h}`;
      });
    const hashStep0 = await canvasHash();

    const release = await swipeHold(client, { x: 195, fromY: 600, toY: 480 }); // dy = -120
    const midSample = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")];
      const cs = getComputedStyle(cards[0]);
      return { opacity: +(+cs.opacity).toFixed(2), transform: cs.transform };
    });
    const midScroll = await page.evaluate(() => window.scrollY);
    await release();
    await sleep(900); // commit + spring-in
    const afterCommit = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")];
      return cards.map((d) => {
        const cs = getComputedStyle(d);
        return +(+cs.opacity).toFixed(2);
      });
    });
    // parse translateY from matrix(a,b,c,d,tx,ty)
    const midY = midSample.transform.startsWith("matrix")
      ? +midSample.transform.split(",").pop().replace(")", "").trim()
      : 0;
    results.fingerTracking = {
      midGesture: { ...midSample, translateY: midY },
      pageScrollDuringCapture: midScroll - secTop,
      cardOpacitiesAfterCommit: afterCommit,
      verdict:
        midY < -60 &&
        midSample.opacity < 0.85 &&
        Math.abs(midScroll - secTop) <= 20 &&
        afterCommit[0] === 0 &&
        afterCommit[1] === 1
          ? "TRACKS_FINGER_AND_COMMITS"
          : "CHECK",
    };
    log(`fingerTracking: ${JSON.stringify(results.fingerTracking)}`);

    await sleep(1400); // let step-1 frame segment play
    const hashStep1 = await canvasHash();
    results.framePlayback = {
      hashStep0,
      hashStep1,
      changed: hashStep0 !== hashStep1,
      verdict: hashStep0 !== hashStep1 ? "FRAMES_ADVANCE" : "FRAMES_STATIC",
    };
    await page.screenshot({ path: `${SHOTS}/swipe-verify-step1.png` });

    // ── Swipe DOWN → back to previous card (step 0) ──
    await swipe(client, { x: 195, fromY: 480, toY: 600 }); // dy = +120
    await sleep(900);
    const afterBack = await page.evaluate(() =>
      [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")].map(
        (d) => +(+getComputedStyle(d).opacity).toFixed(2),
      ),
    );
    results.swipeBack = {
      cardOpacities: afterBack,
      verdict: afterBack[0] === 1 && afterBack[1] === 0 ? "BACK_TO_PREVIOUS" : "CHECK",
    };
    log(`swipeBack: ${JSON.stringify(results.swipeBack)}`);

    // ── First-step pass-through: swipe DOWN at step 0 → native scroll up ──
    await page.evaluate(() => (window.__fq.length = 0));
    const beforePT = await page.evaluate(() => window.scrollY);
    await swipe(client, { x: 195, fromY: 400, toY: 620 });
    await sleep(700);
    const afterPT = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    results.firstStepPassThrough = {
      scrollBefore: beforePT,
      scrollAfter: afterPT.y,
      scrolledUp: afterPT.y < beforePT - 40,
      dispatchedFalse: afterPT.ev.some((e) => e.ev === "header" && e.detail === false),
      verdict: afterPT.y < beforePT - 40 ? "EXITS_NATIVELY" : "CHECK",
    };
    log(`firstStepPassThrough: ${JSON.stringify(results.firstStepPassThrough)}`);

    // ── Re-engage from above, swipe through to last step, then pass-through down ──
    await page.evaluate((y) => window.scrollTo(0, y), secTop - 500);
    await sleep(500);
    await page.evaluate((y) => window.scrollTo(0, y), secTop - 25);
    await sleep(1100);
    for (let i = 0; i < 3; i++) {
      await swipe(client, { x: 195, fromY: 600, toY: 470 });
      await sleep(950);
    }
    const atLast = await page.evaluate(() =>
      [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")].map(
        (d) => +(+getComputedStyle(d).opacity).toFixed(2),
      ),
    );
    await page.evaluate(() => (window.__fq.length = 0));
    const beforeExit = await page.evaluate(() => window.scrollY);
    await swipe(client, { x: 195, fromY: 600, toY: 430 });
    await sleep(800);
    const afterExit = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    const fab2 = await page.evaluate(() => {
      const el = document.querySelector("[data-chat-bubble]");
      const cs = getComputedStyle(el);
      return +(+cs.opacity).toFixed(2);
    });
    results.lastStepExit = {
      cardOpacitiesAtLast: atLast,
      reachedLast: atLast[3] === 1,
      scrolledDown: afterExit.y > beforeExit + 40,
      dispatchedFalse: afterExit.ev.some((e) => e.ev === "header" && e.detail === false),
      fabOpacityAfterExit: fab2,
      verdict:
        atLast[3] === 1 && afterExit.y > beforeExit + 40 ? "EXITS_NATIVELY" : "CHECK",
    };
    log(`lastStepExit: ${JSON.stringify(results.lastStepExit)}`);
    results.mobileConsoleErrors = errors.slice(0, 8);

    // ── Desktop regression ──
    log("desktop pass");
    const dpage = await browser.newPage();
    dpage.setDefaultTimeout(30000);
    const derrors = [];
    dpage.on("pageerror", (e) => derrors.push(String(e).slice(0, 200)));
    await dpage.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await dpage.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(1000);
    const dinfo = await dpage.evaluate(() => {
      const mobileLayout = document.querySelector("div[class*='h-\\[100lvh\\]']");
      const sticky = [...document.querySelectorAll("div")].filter((d) =>
        typeof d.className === "string" && d.className.includes("sticky top-0"),
      );
      const canvas = document.querySelector("canvas");
      return {
        hasMobileLvhDiv: !!mobileLayout,
        stickyCount: sticky.length,
        hasCanvas: !!canvas,
      };
    });
    // scroll into the section, FAB must stay visible
    await dpage.evaluate(() => {
      const c = document.querySelector("canvas");
      const sec = c.closest("div[class*='sticky']")?.parentElement;
      if (sec) window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY + 600);
    });
    await sleep(900);
    const dfab = await dpage.evaluate(() => {
      const el = document.querySelector("[data-chat-bubble]");
      if (!el) return null;
      return +(+getComputedStyle(el).opacity).toFixed(2);
    });
    await dpage.screenshot({ path: `${SHOTS}/swipe-verify-desktop.png` });
    results.desktop = {
      ...dinfo,
      fabOpacityInSection: dfab,
      consoleErrors: derrors.slice(0, 5),
      verdict: !dinfo.hasMobileLvhDiv && dinfo.stickyCount >= 1 && dfab === 1 ? "UNCHANGED" : "CHECK",
    };
    log(`desktop: ${JSON.stringify(results.desktop)}`);

    console.log(JSON.stringify(results, null, 2));
  } finally {
    clearTimeout(watchdog);
    await browser.close();
  }
}

run().catch((e) => {
  console.log(JSON.stringify({ FATAL: String(e), partial: results }, null, 2));
  process.exit(1);
});

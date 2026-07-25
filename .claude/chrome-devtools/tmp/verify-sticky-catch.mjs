// Verify v5 ScrollWindow + edge-anchor boundary release:
// window-level touch events, touchAction:none while engaged, edge-anchored at
// boundary steps (EDGE_ANCHOR_INSET_PX=12), no exit glide — native momentum exits.
// sticky pin catch (260lvh track), 4:3 media, step-dependent anchor, faster fade/commit,
// no-debounce rapid swipes, boundary exit via native momentum, no-fade at boundary,
// desktop regression.
import { createRequire } from "module";
const require = createRequire(
  "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js",
);
const puppeteer = require("puppeteer");

const BASE = "http://localhost:8080";
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

// Disengage the scroll section by dispatching a wheel event, which triggers
// onPointerScroll → disengage(). The wheel event fires synchronously before the
// scroll it causes, so engagedRef is cleared before the scroll clamp fires.
async function wheelDisengage(page) {
  await page.evaluate(() => window.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, bubbles: true })));
  await sleep(50);
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

    // ── Sticky pin + clamp-to-anchor (v5 edge-anchor semantics) ──
    // At step 0, anchor = trackTop + 12 (EDGE_ANCHOR_INSET_PX). A programmatic
    // scroll forward (positive scrollY) while engaged fires onScroll which clamps
    // back to the step-0 edge anchor. Verify: (1) engaging pins the section,
    // (2) a forward-direction scroll stays visually pinned and gets clamped back.
    const anchorExpected = trackTop + 12; // step-0 edge anchor
    const pinEngage = await innerTopAt(trackTop + 100); // engages, jumps to step-0 anchor
    await sleep(300);
    const preClamp = await page.evaluate(() => window.scrollY);
    const pinForward = await innerTopAt(preClamp + 300); // forward scroll while engaged
    await sleep(400);
    const postClamp = await page.evaluate(() => window.scrollY);
    results.stickyPin = {
      pinOnEngage: pinEngage,
      pinDuringForwardDelta: pinForward,
      anchorExpected: +anchorExpected.toFixed(0),
      scrollAfterClamp: postClamp,
      verdict:
        Math.abs(pinEngage.top) <= 1 &&
        Math.abs(pinForward.top) <= 1 &&
        Math.abs(postClamp - anchorExpected) <= 4
          ? "PINNED_AND_CLAMPED"
          : "CHECK",
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

    // ── Engage from ABOVE: wheel-disengage first, then scroll out and back in ──
    // v5: touchAction:none while engaged means programmatic scrollTo is clamped by
    // onScroll. Use wheelDisengage() to clear engagedRef first, then scroll freely.
    await wheelDisengage(page);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(400);
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
    await sleep(600);
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

    // ── Anchor set: after engage from above (step 0), scrollY must equal
    // trackTop + EDGE_ANCHOR_INSET_PX (12) ±4px ──
    const anchorCheck = await page.evaluate((tTop) => {
      const expectedAnchor = tTop + 12; // EDGE_ANCHOR_INSET_PX for step 0
      return { scrollY: window.scrollY, expectedAnchor };
    }, trackTop);
    results.anchorSet = {
      scrollY: anchorCheck.scrollY,
      expectedAnchor: +anchorCheck.expectedAnchor.toFixed(0),
      verdict: Math.abs(anchorCheck.scrollY - anchorCheck.expectedAnchor) <= 4 ? "ANCHOR_SET" : "CHECK",
    };

    // ── Faster fade: hold at dy=-140 — v5: touch is captured 1:1 from finger Y,
    // 140px upward drag → translateY ≤ -95 and opacity ≤ 0.25 ──
    const release1 = await swipeHold(client, { fromY: 640, toY: 500 });
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
    // (that swipe should also have committed → step 1)

    // ── Commit at 60px slow — v5: 60px touch → 60px card displacement > 44px ──
    await swipe(client, { fromY: 600, toY: 540, steps: 10, stepDelayMs: 50 }); // 60px, slow
    await sleep(700);
    const after50 = await cardOpacities();
    results.commit50pxSlow = {
      cards: after50,
      verdict: after50[2] === 1 ? "COMMITS_AT_50PX" : "CHECK",
    };

    // ── No debounce: back to step 0, then 3 rapid 80px swipes.
    // v5: each swipe commits cleanly. rapid[2] or rapid[3] = 1 proves no swipe dropped.
    await swipe(client, { fromY: 500, toY: 620 }); // step 2 -> 1 (120px down)
    await sleep(120);
    await swipe(client, { fromY: 500, toY: 620 }); // 1 -> 0
    await sleep(400);
    const back0 = await cardOpacities();
    await page.evaluate(() => (window.__fq.length = 0));
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 640, toY: 560, steps: 8, stepDelayMs: 12 }); // 80px up
      await sleep(160);
    }
    await sleep(700);
    const rapid = await cardOpacities();
    const rapidEvts = await page.evaluate(() => window.__fq.slice());
    const rapidLanded = rapid[2] === 1 || rapid[3] === 1;
    results.rapidSwipes = {
      startedFrom: back0,
      after3RapidUp: rapid,
      events: rapidEvts,
      verdict: back0[0] === 1 && rapidLanded ? "NO_DEBOUNCE_ALL_LAND" : "CHECK",
    };

    await page.screenshot({ path: `${SHOTS}/sticky-catch-step3.png` });

    // ── Exit DOWN: self-contained — re-establish engagement, navigate to step 3,
    // then perform a 90px upward swipe. Boundary exit fires in onTouchEnd (snap card +
    // disengage, no scrollTo). After disengage, the clamp is off. We verify by
    // programmatic scroll past the pin-bottom edge: if the clamp were still active,
    // it would snap back to anchor; since it's off, the scroll lands.
    // Step 1: wheel-disengage + scroll out above the track.
    await wheelDisengage(page);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(400);
    // Step 2: scroll into the track to engage at step 0.
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
    await sleep(600);
    const exitDownEngageCheck = await page.evaluate(() => window.__fq.slice());
    const exitDownEngaged = exitDownEngageCheck.some((e) => e.ev === "header" && e.detail === true);
    // Step 3: swipe up ×3 to reach step 3.
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 640, toY: 550, steps: 12, stepDelayMs: 20 }); // 90px up
      await sleep(500);
    }
    const atStep3Cards = await cardOpacities();
    // Step 4: clear events, perform 90px upward swipe at step 3 → boundary exit.
    await page.evaluate(() => (window.__fq.length = 0));
    const anchorYBeforeExitDown = await page.evaluate(() => window.scrollY);
    await swipe(client, { fromY: 640, toY: 550, steps: 12, stepDelayMs: 20 }); // 90px up
    await sleep(300); // allow onTouchEnd boundary exit to fire
    // Step 5: verify clamp is off — scroll past pin-bottom edge.
    // If still clamped → lands at anchor; if free → lands at threshold+100.
    const exitDownThreshold = trackTop + trackH - vh;
    await page.evaluate((y) => window.scrollTo(0, y), exitDownThreshold + 100);
    await sleep(400);
    const exitDown = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    const exitDownFab = await fabState();
    results.exitGlideDown = {
      engaged: exitDownEngaged,
      atStep3: atStep3Cards[3] === 1,
      scrollY: exitDown.y,
      anchorWas: anchorYBeforeExitDown,
      threshold: +exitDownThreshold.toFixed(0),
      events: exitDown.ev,
      fab: exitDownFab,
      verdict:
        exitDownEngaged &&
        atStep3Cards[3] === 1 &&
        exitDown.y > exitDownThreshold &&
        exitDown.ev.some((e) => e.ev === "header" && e.detail === false) &&
        exitDownFab.opacity === 1
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

    // ── Exit UP: navigate back to step 0 (3 swipes down from step 3), then
    // perform a 90px downward swipe at step 0. Boundary exit fires in onTouchEnd.
    // After disengage, programmatic scroll above the track verifies clamp is off.
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 470, toY: 600 });
      await sleep(300);
    } // 3 -> 0
    const atStep0Cards = await cardOpacities();
    await page.evaluate(() => (window.__fq.length = 0));
    const preExitUp = await page.evaluate(() => window.scrollY);
    // 90px downward drag at step 0 → shouldCommit=true, dir="down", boundary exit fires.
    await swipe(client, { fromY: 550, toY: 640, steps: 12, stepDelayMs: 20 }); // 90px down
    await sleep(300); // allow onTouchEnd boundary exit
    // Verify clamp is off — scroll above the track.
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 100);
    await sleep(400);
    const exitUp = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    results.exitGlideUp = {
      atStep0: atStep0Cards[0] === 1,
      before: preExitUp,
      scrollY: exitUp.y,
      anchorWas: preExitUp,
      verdict:
        atStep0Cards[0] === 1 &&
        exitUp.y < preExitUp &&
        exitUp.ev.some((e) => e.ev === "header" && e.detail === false)
          ? "GLIDES_OUT_UP"
          : "CHECK",
    };

    // ── No-fade at boundary: at step 0 during a downward (exit-direction) drag,
    // the card uses RUBBER_BAND=0.3, so 60px drag → cardY ≈ 18px, opacity ≈ 0.85.
    // Verify opacity stays significantly above 0 (no full fade at boundary exit dir).
    // Threshold: >= 0.70 (rubber band at 60px with FADE_DISTANCE_PX=120 gives ~0.85).
    // Step 1: wheel-disengage, scroll out, scroll back in to step 0.
    await wheelDisengage(page);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(400);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
    await sleep(600);
    // Step 2: downward drag ~60px with finger held — sample opacity mid-drag.
    const releaseNoFade = await swipeHold(client, { fromY: 500, toY: 560, steps: 8, stepDelayMs: 20 });
    await sleep(50);
    const noFadeMid = await page.evaluate(() => {
      const d = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")][0];
      const cs = getComputedStyle(d);
      return { opacity: +(+cs.opacity).toFixed(2) };
    });
    await releaseNoFade();
    await sleep(500);
    results.noFadeAtBoundary = {
      midDragOpacity: noFadeMid.opacity,
      verdict: noFadeMid.opacity >= 0.70 ? "NO_FADE_AT_BOUNDARY" : "CHECK",
    };

    // ── No hijack when fully above the track ──
    await wheelDisengage(page);
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
    await wheelDisengage(page);
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate(
      (t) => window.scrollTo(0, t),
      trackTop + trackH + 700,
    );
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

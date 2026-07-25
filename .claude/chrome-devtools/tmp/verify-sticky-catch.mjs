// Verify v4 ScrollWindow + v4-amendment (instant boundary release at ±8px):
// scroll-delta input model (no touchmove, no preventDefault),
// sticky pin catch (260lvh track), 4:3 media, anchor-set, faster fade/commit,
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

    // ── Sticky pin + clamp-to-anchor (v4 semantics) ──
    // Free scrubbing inside the track is no longer neutral: at step 0 an upward
    // delta is an exit request (release + assist). So verify: (1) engaging pins
    // the section, (2) a positive-delta scroll (non-exit direction at step 0)
    // stays visually pinned and gets clamped back to the anchor.
    const anchorExpected = trackTop + (trackH - vh) / 2;
    const pinEngage = await innerTopAt(trackTop + 100); // engages, jumps to anchor
    await sleep(300);
    const preClamp = await page.evaluate(() => window.scrollY);
    const pinForward = await innerTopAt(preClamp + 300); // +delta at step 0: no release
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

    // ── Engage from ABOVE: jump from well above into the track → step 0 ──
    // The stray-momentum clamp in onScrollDelta prevents a bare programmatic
    // window.scrollTo from carrying the page out while the section is engaged.
    // Workaround: fire a zero-move gesture (touchStart→touchEnd immediately) which
    // sets burstLockRef=true for 150ms. During burst lock, scroll events are absorbed
    // (timer reset) instead of clamped, so the subsequent programmatic scroll to
    // trackTop−700 reaches the browser and the rAF loop sees isFullyOut()→disengage.
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 500 }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(30); // allow burstLock to be set (synchronous in onTouchEnd, but rAF may need a frame)
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(500); // allow rAF to detect isFullyOut → disengage
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

    // ── Anchor set: after engage, scrollY must equal mid-track anchor ±4px ──
    const anchorCheck = await page.evaluate((tTop, tH, vHeight) => {
      const expectedAnchor = tTop + (tH - vHeight) / 2;
      return { scrollY: window.scrollY, expectedAnchor };
    }, trackTop, trackH, vh);
    results.anchorSet = {
      scrollY: anchorCheck.scrollY,
      expectedAnchor: +anchorCheck.expectedAnchor.toFixed(0),
      verdict: Math.abs(anchorCheck.scrollY - anchorCheck.expectedAnchor) <= 4 ? "ANCHOR_SET" : "CHECK",
    };

    // ── Faster fade: hold at dy=-140 — v4 note: CDP touch→scroll scale ≈ 0.85,
    // so 140px touch swipe produces ~119px scroll delta, giving translateY ≤ -95 ──
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

    // ── Commit at 60px slow — v4 note: CDP scroll ≈ 0.85 scale, 60px touch → ~51px
    // scroll delta which exceeds the 44px COMMIT_DISTANCE_PX threshold ──
    await swipe(client, { fromY: 600, toY: 540, steps: 10, stepDelayMs: 50 }); // 60px, slow
    await sleep(700);
    const after50 = await cardOpacities();
    results.commit50pxSlow = {
      cards: after50,
      verdict: after50[2] === 1 ? "COMMITS_AT_50PX" : "CHECK",
    };

    // ── No debounce: back to step 0, then 3 rapid 80px swipes.
    // Amendment: with instant boundary exit (±8px epsilon), the 3rd swipe (from step 2)
    // exits the section immediately because reaching step 3 with upward gesture-delta > 8px
    // triggers live boundary release. The "no debounce" property is: all 3 swipes produced
    // observable effects (no swipe was silently dropped). Verdict: (a) started at step 0,
    // (b) swipes 1+2 committed to reach step 2 (card 2 visible), (c) swipe 3 caused exit
    // (header:false event fired). Step 3 card may or may not be showing depending on whether
    // it was committed before exit or exited from step 2 directly — check card 2 or card 3 = 1.
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
    // rapid[2] or rapid[3] = 1: at least 2 commits landed (no swipe silently dropped).
    // The 3rd swipe either commits to step 3 (if started from step 2) or triggers boundary
    // exit (if started from step 3). Either way, no swipe was silently dropped.
    const rapidLanded = rapid[2] === 1 || rapid[3] === 1;
    results.rapidSwipes = {
      startedFrom: back0,
      after3RapidUp: rapid,
      events: rapidEvts,
      verdict: back0[0] === 1 && rapidLanded ? "NO_DEBOUNCE_ALL_LAND" : "CHECK",
    };

    await page.screenshot({ path: `${SHOTS}/sticky-catch-step3.png` });

    // ── Exit glide DOWN: self-contained — re-establish engagement first, then
    // navigate to step 3 cleanly, then perform a deliberate finger-down drag exit.
    // This prevents inheriting stale state from the rapid-swipe test above.
    // Step 1: use a zero-move gesture to set burstLock=true, then scroll out.
    // Without burst lock, onScrollDelta clamps the programmatic scroll back to anchor
    // while the section is still engaged (stray-momentum guard). With burst lock active,
    // the scroll event is absorbed (not clamped) so the rAF sees isFullyOut()→disengage.
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 500 }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(30); // allow burstLock to be set
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(500); // allow rAF to detect isFullyOut → disengage + exitingRef to reset
    // Step 2: scroll into the track to engage at step 0.
    await page.evaluate(() => (window.__fq.length = 0));
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
    await sleep(600);
    // Assert engagement: anchor jump should have fired a header:true event.
    const exitDownEngageCheck = await page.evaluate(() => window.__fq.slice());
    const exitDownEngaged = exitDownEngageCheck.some((e) => e.ev === "header" && e.detail === true);
    // Step 3: swipe up ×3 with ~500ms settle to reach step 3 cleanly.
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 640, toY: 550, steps: 12, stepDelayMs: 20 }); // 90px up, slow
      await sleep(500);
    }
    // Confirm we are at step 3 (card index 3 fully opaque).
    const atStep3Cards = await cardOpacities();
    // Step 4: clear events, then perform a single slow finger-down drag UPWARD ~90px.
    // Amendment: BOUNDARY_EXIT_EPSILON_PX is now 8px — boundary exit fires within the
    // first few scroll events (much sooner than the old 44px threshold). The 90px drag
    // still reliably triggers the release; the assist timer is now 120ms (was 250ms).
    // After touchEnd, startExitAssist is called to push the page past the bottom pin.
    await page.evaluate(() => (window.__fq.length = 0));
    const anchorYBeforeExitDown = await page.evaluate(() => window.scrollY);
    await swipe(client, { fromY: 640, toY: 550, steps: 12, stepDelayMs: 20 }); // 90px up, slow
    // Wait: 120ms assist timer + smooth scroll (~1s) + buffer
    await sleep(1400);
    const exitDown = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    const exitDownThreshold = trackTop + trackH - vh;
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

    // ── Exit glide UP: navigate back to step 0 first (3 swipes down from step 3),
    // then perform a deliberate finger-down drag DOWNWARD ~90px at step 0.
    // Amendment: BOUNDARY_EXIT_EPSILON_PX is now 8px — boundary exit fires within the
    // first few scroll events of the drag (much sooner than the old 44px threshold).
    // With finger down, onScrollDelta will see delta < -BOUNDARY_EXIT_EPSILON_PX (8) and fire
    // the boundary exit (gestureStartStepRef === 0, fingerDownRef === true).
    // Card snaps to rest (opacity 1.0) before the release fires.
    for (let i = 0; i < 3; i++) {
      await swipe(client, { fromY: 470, toY: 600 });
      await sleep(300);
    } // 3 -> 0
    // Confirm at step 0 (card index 0 fully opaque).
    const atStep0Cards = await cardOpacities();
    await page.evaluate(() => (window.__fq.length = 0));
    const preExitUp = await page.evaluate(() => window.scrollY);
    // Slow downward drag of ~90px: scroll delta will be negative < -BOUNDARY_EXIT_EPSILON_PX (8)
    // triggering boundary exit while finger is down.
    await swipe(client, { fromY: 550, toY: 640, steps: 12, stepDelayMs: 20 }); // 90px down, slow
    // Wait: 120ms assist timer + smooth scroll (~1s) + buffer
    await sleep(1400);
    const exitUp = await page.evaluate(() => ({ y: window.scrollY, ev: window.__fq.slice() }));
    // v4: boundary exit releases native momentum — page should NOT clamp back to anchor.
    // Assert page moved upward (scrollY < anchor) and events fired.
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
    // the card opacity must remain 1.0 (no fade). With BOUNDARY_EXIT_EPSILON_PX=8px
    // the release fires almost instantly, but even in the sub-8px window the
    // isBoundaryExitDirection guard must prevent any card-drive. This probe uses
    // swipeHold to sample mid-drag opacity before release.
    // Step 1: re-engage at step 0 (from above).
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 195, y: 500 }] });
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await sleep(30);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop - 700);
    await sleep(500);
    await page.evaluate((y) => window.scrollTo(0, y), trackTop + 150);
    await sleep(600);
    // Step 2: downward drag ~60px with finger held — sample opacity mid-drag.
    const releaseNoFade = await swipeHold(client, { fromY: 500, toY: 560, steps: 8, stepDelayMs: 20 });
    await sleep(50); // one rAF after drag begins
    const noFadeMid = await page.evaluate(() => {
      const d = [...document.querySelectorAll("div[class*='pt-\\[4vh\\]']")][0];
      const cs = getComputedStyle(d);
      return { opacity: +(+cs.opacity).toFixed(2) };
    });
    await releaseNoFade();
    await sleep(500);
    results.noFadeAtBoundary = {
      midDragOpacity: noFadeMid.opacity,
      verdict: noFadeMid.opacity >= 0.99 ? "NO_FADE_AT_BOUNDARY" : "CHECK",
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

// Verify the ScrollWindow mobile rework: native sticky scrollytelling,
// proportional scroll-linked fades, per-step frame playback, chat FAB fade,
// and desktop layout unchanged.
import {
  getBrowser,
  getPage,
  disconnectBrowser,
  outputJSON,
} from "/Users/princewagan/.claude/skills/vc-chrome-devtools/scripts/lib/browser.js";

const BASE = "http://localhost:8090";
const SHOTS = "/Users/princewagan/fourlinq/.claude/chrome-devtools/screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {};

async function mobilePass(browser) {
  const page = await getPage(browser);
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForFunction(
    () => [...document.querySelectorAll("div")].some((d) => (d.getAttribute("style") || "").includes("dvh")),
    { timeout: 30000 },
  );
  await sleep(1000);

  // Locate the scroll track (outer container with inline dvh height).
  const track = await page.evaluate(() => {
    const el = [...document.querySelectorAll("div")].find((d) =>
      (d.getAttribute("style") || "").includes("dvh"),
    );
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height, inlineHeight: el.getAttribute("style") };
  });
  results.track = track;
  if (!track) return;

  // ---- 1. Teleport check: scrollTo N -> scrollY must stay N (no JS corrections) ----
  const jumps = [];
  for (let y = Math.max(0, track.top - 800); y <= track.top + track.height + 400; y += 173) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(120);
    const actual = await page.evaluate(() => window.scrollY);
    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const expected = Math.min(y, max);
    if (Math.abs(actual - expected) > 1) jumps.push({ set: y, expected, actual });
  }
  results.teleport = { jumps, verdict: jumps.length === 0 ? "NO_JUMPS" : "JUMPS_DETECTED" };

  // Helper: read step text opacities (motion.divs with pt-[4vh]).
  const readSteps = () =>
    page.evaluate(() => {
      const els = [...document.querySelectorAll("div")].filter((d) =>
        d.className.includes && d.className.includes("pt-[4vh]"),
      );
      return els.map((d) => {
        const cs = getComputedStyle(d);
        return { opacity: +(+cs.opacity).toFixed(3), transform: cs.transform };
      });
    });

  // ---- 2. Proportional fades: sample opacities across step0 -> step1 window ----
  const samples = [];
  const quarter = track.height / 4;
  for (let f = 0.02; f <= 0.5; f += 0.03) {
    const y = track.top + track.height * f - 0; // progress f of track
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(150);
    const steps = await readSteps();
    samples.push({ progress: +f.toFixed(2), step0: steps[0]?.opacity, step1: steps[1]?.opacity });
  }
  const intermediates = samples.filter(
    (s) =>
      (s.step0 > 0.05 && s.step0 < 0.95) || (s.step1 > 0.05 && s.step1 < 0.95),
  );
  results.fades = {
    samples,
    intermediateCount: intermediates.length,
    verdict: intermediates.length >= 3 ? "PROPORTIONAL" : "DISCRETE_OR_BROKEN",
  };

  // ---- 3. Frame playback: canvas content should differ per step midpoint ----
  const canvasHashes = [];
  for (const f of [0.125, 0.375, 0.625, 0.875]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), track.top + track.height * f);
    await sleep(900); // allow frame playback to advance
    const hash = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c) return null;
      const data = c.toDataURL("image/png");
      // cheap hash
      let h = 0;
      for (let i = 0; i < data.length; i += 97) h = (h * 31 + data.charCodeAt(i)) | 0;
      return `${data.length}:${h}`;
    });
    canvasHashes.push({ progress: f, hash });
  }
  const uniqueHashes = new Set(canvasHashes.map((c) => c.hash)).size;
  results.frames = {
    canvasHashes,
    uniqueHashes,
    verdict: uniqueHashes >= 3 ? "FRAMES_ADVANCE" : "FRAMES_STATIC",
  };

  // Screenshot mid step 1 (weather) for layout: text high, frames low.
  await page.evaluate((yy) => window.scrollTo(0, yy), track.top + track.height * 0.375);
  await sleep(800);
  await page.screenshot({ path: `${SHOTS}/sticky-verify-mobile-step1.png` });

  // ---- 4. Chat FAB fade ----
  const readFab = () =>
    page.evaluate(() => {
      const el = document.querySelector("[data-chat-bubble]");
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { opacity: +(+cs.opacity).toFixed(2), pointerEvents: cs.pointerEvents };
    });

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(700);
  const fabTop = await readFab();
  await page.evaluate((yy) => window.scrollTo(0, yy), track.top + track.height * 0.5);
  await sleep(700);
  const fabIn = await readFab();
  await page.evaluate((yy) => window.scrollTo(0, yy), track.top + track.height + 600);
  await sleep(700);
  const fabAfter = await readFab();
  results.chatFab = {
    atTop: fabTop,
    inSection: fabIn,
    afterSection: fabAfter,
    verdict:
      fabTop?.opacity === 1 && fabIn?.opacity === 0 && fabIn?.pointerEvents === "none" && fabAfter?.opacity === 1
        ? "FADES_CORRECTLY"
        : "UNEXPECTED",
  };

  // ---- Probe: scroll UP back into the section from below ----
  await page.evaluate((yy) => window.scrollTo(0, yy), track.top + track.height * 0.6);
  await sleep(600);
  const upSteps = await readSteps();
  const upFab = await readFab();
  results.reentryFromBelow = { steps: upSteps.map((s) => s.opacity), fab: upFab };

  // ---- Probe: rapid fling (large scroll jumps in quick succession) ----
  const flingErrors = [];
  for (const y of [0, track.top + 200, track.top + track.height, track.top + 500, 0]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(40);
  }
  await sleep(500);
  const settled = await page.evaluate(() => window.scrollY);
  if (Math.abs(settled - 0) > 1) flingErrors.push({ expected: 0, actual: settled });
  results.fling = { flingErrors, verdict: flingErrors.length === 0 ? "STABLE" : "DRIFTED" };

  // Console errors captured?
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function desktopPass(browser) {
  const page = await getPage(browser);
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(1000);

  const info = await page.evaluate(() => {
    // Track div must NOT have inline dvh height on desktop.
    const dvhEl = [...document.querySelectorAll("div")].find((d) =>
      (d.getAttribute("style") || "").includes("dvh"),
    );
    // Desktop text panels: min-height panels in flow.
    const panels = [...document.querySelectorAll("div")].filter((d) =>
      (d.getAttribute("style") || "").includes("66vh"),
    );
    const sticky = [...document.querySelectorAll("div")].filter((d) =>
      d.className.includes && d.className.includes("sticky top-0"),
    );
    return { hasDvhTrack: !!dvhEl, panelCount: panels.length, stickyCount: sticky.length };
  });

  // Scroll into section, check chat FAB stays visible on desktop.
  const secTop = await page.evaluate(() => {
    const sticky = [...document.querySelectorAll("div")].find((d) =>
      d.className.includes && d.className.includes("sticky top-0"),
    );
    const container = sticky?.parentElement;
    if (!container) return null;
    return container.getBoundingClientRect().top + window.scrollY;
  });
  if (secTop != null) {
    await page.evaluate((yy) => window.scrollTo(0, yy + 400), secTop);
    await sleep(900);
  }
  const fab = await page.evaluate(() => {
    const el = document.querySelector("[data-chat-bubble]");
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { opacity: +(+cs.opacity).toFixed(2), pointerEvents: cs.pointerEvents };
  });
  await page.screenshot({ path: `${SHOTS}/sticky-verify-desktop-section.png` });
  results.desktop = {
    ...info,
    fabInSection: fab,
    verdict: !info.hasDvhTrack && fab?.opacity === 1 ? "UNCHANGED" : "CHECK",
  };
}

async function run() {
  const browser = await getBrowser({ headless: true });
  const page = await getPage(browser);
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await mobilePass(browser);
  await desktopPass(browser);
  results.consoleErrors = consoleErrors.slice(0, 10);

  outputJSON(results);
  await disconnectBrowser(browser);
}

run().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});

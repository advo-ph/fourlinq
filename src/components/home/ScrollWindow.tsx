import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { useSegmentedFrames } from "@/hooks/useSegmentedFrames";
import {
  WINDOW_PARTS,
  WINDOW_MATERIALS,
  PART_ZERO,
  SECTION_EYEBROW,
  SECTION_TITLE,
  TOTAL_FRAMES,
  FRAME_PATH_TEMPLATE,
  FRAME_PAD_LENGTH,
  THERMAL_PART_ID,
  type MaterialId,
  type WindowPart,
  type WindowMaterial,
} from "@/data/scroll-window-phases";
import MaterialToggle from "./ThermalSystemToggle";
import PhaseCalloutLines from "./PhaseCalloutLines";
import PhaseCalloutMarkers from "./PhaseCalloutMarkers";

// ── fqdebug HUD helpers ────────────────────────────────────────────────────
// Temporary debug overlay, visible only when ?fqdebug is present in the URL.
// Remove after on-device confirmation (orchestrator closeout).
const FQ_DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("fqdebug");

function getOrCreateHud(): HTMLDivElement | null {
  if (!FQ_DEBUG) return null;
  let el = document.getElementById("fq-hud") as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = "fq-hud";
    el.style.cssText = [
      "position:fixed", "top:6px", "left:6px", "z-index:9999",
      "pointer-events:none", "font:10px/1.4 monospace", "color:#0f0",
      "background:rgba(0,0,0,0.72)", "padding:4px 6px", "border-radius:4px",
      "max-width:220px", "white-space:pre", "text-shadow:0 0 2px #000",
    ].join(";");
    document.body.appendChild(el);
  }
  return el;
}

function writeHud(lines: Record<string, string | number | boolean | null>) {
  const el = getOrCreateHud();
  if (!el) return;
  el.textContent = Object.entries(lines).map(([k, v]) => `${k}: ${v}`).join("\n");
}

const THERMAL_INDEX = WINDOW_PARTS.findIndex((p) => p.id === THERMAL_PART_ID);
const POSTER = FRAME_PATH_TEMPLATE.replace("{index}", "0001");
const ALU_IMAGE = WINDOW_MATERIALS.find((m) => m.id === "alu")?.image ?? "";

// ── Desktop scroll layout ──────────────────────────────────
const PART0_VH = 78;     // "Part 0" run-in panel — title + intro, top-aligned; sized so the gap to Part 1 matches the others
const PANEL_VH = 66;     // per-part scroll height (controls the gap between texts)
const TRAILING_VH = 40;  // keeps Part 3 pinned while it's centered
// A part activates once its text scrolls up to its activation line (fraction of
// the viewport). Part 1 activates just below the middle, so scrolling back up
// cleanly drops it to Part 0. Later parts activate earlier — nearer the bottom —
// so they highlight sooner as they come up. Larger fractions = line sits lower
// on screen = each part highlights a little earlier while scrolling down.
const ACTIVATION_MIDDLE = 0.62;
const ACTIVATION_EARLY = 0.72;
// Non-active parts (and everything during the Part-0 run-in) sit translucent.
const INACTIVE_OPACITY = 0.28;

// ── Mobile swipe steps ─────────────────────────────────────
// On mobile the section pins to the viewport and swipes step through the texts
// (Part 0 intro → each benefit) — no scroll-position mapping. Swipe up: current
// text fades up and out, the next fades in at the same position (and the
// highlight advances). Swipe down: fades down, the previous returns.
const STEP_COUNT = WINDOW_PARTS.length + 1; // intro + parts

// Swipe feel tuning — v3
const FADE_DISTANCE_PX = 120;   // cardOpacity = max(0, 1 - |dy| / 120)
const COMMIT_DISTANCE_PX = 44;  // displacement threshold for commit
const COMMIT_VELOCITY = 0.35;   // px/ms threshold for velocity commit
const EXIT_RELEASE_PX = 44;     // scroll delta to trigger boundary exit release

const ScrollWindow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mediaBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // ── Gesture refs (unconditional — Rules of Hooks) ──────────
  const engagedRef = useRef(false);        // true only while section is engaged in-view (sticky-pin)
  const exitingRef = useRef(false);        // true while a boundary-exit glide is in progress; suppresses re-engagement
  const fingerDownRef = useRef(false);     // true while a finger is on screen
  const anchorYRef = useRef(0);            // the scrollY the component clamps to while engaged
  const gestureBaseCardYRef = useRef(0);   // cardY.get() at the moment this gesture's first scroll event fires
  const gestureStartStepRef = useRef(0);   // stepRef.current captured at onTouchStart; guards boundary releases
  const deltaSamplesRef = useRef<Array<{ d: number; t: number }>>([]);  // last ≤4 {delta, timestamp} samples for velocity
  const burstLockRef = useRef(false);      // true after touchend; absorbs momentum-leak scroll events
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 150ms quiet-gap timer to clear burstLock
  const lastInSectionFlagRef = useRef<boolean | null>(null); // shared dedupe flag for fq-hide-header / fq-scrollwindow-inview dispatches
  const exitAssistRef = useRef<"up" | "down" | null>(null);  // direction of the last boundary release; drives post-release exit assist
  const exitAssistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 250ms post-release assist timer

  const [nearViewport, setNearViewport] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );
  const [activeIndex, setActiveIndex] = useState(-1); // desktop: scroll-driven
  const [step, setStep] = useState(0);                // mobile: touch-driven (0 = intro)
  const stepRef = useRef(0);
  const [material, setMaterial] = useState<MaterialId>("upvc");
  const [matFade, setMatFade] = useState(true);

  // ── Mobile swipe MotionValues (unconditional — Rules of Hooks) ─────────────
  const cardY = useMotionValue(0);
  const cardOpacity = useMotionValue(1);

  // Preload gate.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Layout mode — desktop keeps the scroll-driven flow, mobile gets swipe steps.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // ── Desktop: active part = the last part whose text has scrolled up to the
  // activation line. Before the first part reaches it (the Part-0 run-in) and
  // if you scroll back above it, activeIndex is -1 → the animation rests on
  // frame 1, no highlight.
  useEffect(() => {
    if (!isDesktop) return;
    let raf = 0;
    let headerHidden = false;
    const setHeader = (v: boolean) => {
      if (v === headerHidden) return;
      headerHidden = v;
      window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: v }));
    };
    const compute = () => {
      const vh = window.innerHeight;
      let next = -1;
      for (let i = 0; i < panelRefs.current.length; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const line = vh * (i === 0 ? ACTIVATION_MIDDLE : ACTIVATION_EARLY);
        if (r.top + r.height / 2 <= line) next = i;
      }
      setActiveIndex((prev) => (prev !== next ? next : prev));

      // Hide the site header while the section fully covers the viewport.
      const c = containerRef.current;
      if (c) {
        const cr = c.getBoundingClientRect();
        setHeader(cr.top <= 1 && cr.bottom >= vh - 1);
      }
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(compute); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      setHeader(false);
    };
  }, [isDesktop]);

  // ── Mobile: sticky-pin engagement via rAF geometry ────────────────────────
  // The outer container is a 260lvh scroll track; the inner layout div is CSS
  // sticky top-0 on mobile. This loop detects when the track is pinned (fully
  // straddling the viewport) and engages/disengages the touch capture accordingly.
  // Replaces the v2 scroll-settle state machine entirely.
  useEffect(() => {
    if (isDesktop) return;

    const el = containerRef.current;
    if (!el) return;

    // Dedupe dispatches — only emit when flag actually changes (shared ref with touch engine)
    const dispatchInSection = (flag: boolean) => {
      if (flag === lastInSectionFlagRef.current) return;
      lastInSectionFlagRef.current = flag;
      window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: flag }));
      window.dispatchEvent(new CustomEvent("fq-scrollwindow-inview", { detail: { inView: flag } }));
    };

    // Consecutive pinned-frame counter — requires 2 frames before engaging
    // to prevent fling-through from momentarily triggering engagement.
    let consecutivePinCount = 0;
    let raf = 0;
    let prevTop = el.getBoundingClientRect().top;

    // Track is "pinned" when the 260lvh outer container straddles the viewport:
    // top is scrolled past (negative) and bottom is still below viewport bottom.
    function isPinned(): boolean {
      const rect = el.getBoundingClientRect();
      return rect.top <= -2 && rect.bottom >= window.innerHeight + 2;
    }

    // Track is fully out when neither edge is within the viewport straddle.
    function isFullyOut(): boolean {
      const rect = el.getBoundingClientRect();
      return rect.top > 0 || rect.bottom < window.innerHeight;
    }

    function tick() {
      const rect = el.getBoundingClientRect();
      if (!engagedRef.current) {
        if (isFullyOut()) {
          // Track has left the viewport — clear any pending exit suppression
          // so that a re-entry from either direction re-engages cleanly.
          if (exitingRef.current) {
            exitingRef.current = false;
          }
          consecutivePinCount = 0;
          prevTop = rect.top;
        } else if (isPinned() && !exitingRef.current) {
          // Only count pinned frames if we are NOT in an exit glide.
          // exitingRef suppresses re-engagement during the smooth scroll out.
          consecutivePinCount++;
          if (consecutivePinCount >= 2) {
            // Engage: determine entry direction from last known prevTop
            engagedRef.current = true;
            const entryStep = prevTop > 0 ? 0 : STEP_COUNT - 1;
            setStep(entryStep);
            stepRef.current = entryStep;
            // Anchor: mid-track position so the page can scroll in both directions
            const trackRect = el.getBoundingClientRect();
            const trackTopAbs = trackRect.top + window.scrollY;
            anchorYRef.current = trackTopAbs + (trackRect.height - window.innerHeight) / 2;
            window.scrollTo(0, anchorYRef.current);
            cardY.set(0);
            cardOpacity.set(1);
            dispatchInSection(true);
          }
        } else {
          // Pinned but exitingRef is true, OR not pinned and not fully out:
          // hold the count and update prevTop so re-entry direction is correct.
          consecutivePinCount = 0;
          prevTop = rect.top;
        }
      } else {
        if (isFullyOut()) {
          engagedRef.current = false;
          exitingRef.current = false;
          dispatchInSection(false);
          consecutivePinCount = 0;
        }
      }

      // HUD: refresh pin state every rAF (cheap — direct DOM write)
      if (FQ_DEBUG) {
        const r = el.getBoundingClientRect();
        writeHud({
          eng: engagedRef.current,
          step: stepRef.current,
          gs: gestureStartStepRef.current,
          anchor: Math.round(anchorYRef.current),
          delta: Math.round(window.scrollY - anchorYRef.current),
          fgr: fingerDownRef.current,
          burst: burstLockRef.current,
          exit: exitingRef.current,
          pinTop: Math.round(r.top),
          pinBot: Math.round(r.bottom - window.innerHeight),
          evt: "raf",
        });
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    const onOrientationChange = () => {
      engagedRef.current = false;
      dispatchInSection(false);
      cardY.set(0);
      cardOpacity.set(1);
      setStep(0);
      stepRef.current = 0;
      consecutivePinCount = 0;
      prevTop = el.getBoundingClientRect().top;
    };

    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      cancelAnimationFrame(raf);
      engagedRef.current = false;
      dispatchInSection(false);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, [isDesktop, cardY, cardOpacity]);

  // ── Mobile: scroll-delta gesture engine (v4) ──────────────────────────────
  // Touch listeners are purely passive bookkeepers (no preventDefault, no touchmove).
  // A passive window scroll listener reads delta from the mid-track anchor and drives
  // cardY/cardOpacity directly. Clamp at touchend; boundary exits release native momentum.
  useEffect(() => {
    if (isDesktop) return;

    const el = containerRef.current;
    if (!el) return;

    // Dedupe dispatches — only emit when flag actually changes (shared ref with pin loop)
    const dispatchInSection = (flag: boolean) => {
      if (flag === lastInSectionFlagRef.current) return;
      lastInSectionFlagRef.current = flag;
      window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: flag }));
      window.dispatchEvent(new CustomEvent("fq-scrollwindow-inview", { detail: { inView: flag } }));
    };

    const springBack = () => {
      animate(cardY, 0, { type: "spring", stiffness: 380, damping: 32 });
      animate(cardOpacity, 1, { duration: 0.18 });
    };

    const commitCard = (direction: "up" | "down") => {
      const current = stepRef.current;
      const next = Math.max(0, Math.min(STEP_COUNT - 1, direction === "up" ? current + 1 : current - 1));
      // 1. Advance step synchronously — React binds the new card immediately
      stepRef.current = next;
      setStep(next);
      // 2. Set entry pose for incoming card (old card is inactive → opacity 0 via style binding)
      const entryY = direction === "up" ? 36 : -36;
      cardY.set(entryY);
      cardOpacity.set(0);
      // 3. Spring in
      animate(cardY, 0, { type: "spring", stiffness: 300, damping: 30, velocity: 0 });
      animate(cardOpacity, 1, { duration: 0.28 });
    };

    // ── Passive touch state tracker ────────────────────────────────────────────

    const onTouchStart = (_e: TouchEvent) => {
      cardY.stop();
      cardOpacity.stop();
      fingerDownRef.current = true;
      gestureBaseCardYRef.current = cardY.get();
      // Capture which step this gesture started at — used by onScrollDelta to guard
      // boundary releases so momentum-leak events (finger already up) cannot release.
      gestureStartStepRef.current = stepRef.current;
      deltaSamplesRef.current = [];
      burstLockRef.current = false;
      if (burstTimerRef.current !== null) {
        clearTimeout(burstTimerRef.current);
        burstTimerRef.current = null;
      }
      // Cancel any pending exit assist and clear direction on new touch
      exitAssistRef.current = null;
      if (exitAssistTimerRef.current !== null) {
        clearTimeout(exitAssistTimerRef.current);
        exitAssistTimerRef.current = null;
      }
      if (FQ_DEBUG) writeHud({ eng: engagedRef.current, step: stepRef.current, gs: gestureStartStepRef.current, anchor: Math.round(anchorYRef.current), delta: 0, fgr: true, burst: false, assist: null, evt: "ts" });
    };

    // ── Post-release exit assist ───────────────────────────────────────────────
    // After a boundary release, natural momentum may not carry a slow drag fully
    // out of the 260lvh track (the page stays sticky-frozen). This helper waits
    // 250ms for momentum to play, then checks if the page is STILL pinned. If so,
    // it fires a single smooth scroll to push past the pin edge in the recorded
    // exit direction. Re-engagement is guarded by engagedRef (cleared at release).
    const startExitAssist = () => {
      const dir = exitAssistRef.current;
      if (!dir) return;
      if (exitAssistTimerRef.current !== null) {
        clearTimeout(exitAssistTimerRef.current);
      }
      exitAssistTimerRef.current = setTimeout(() => {
        exitAssistTimerRef.current = null;
        const assistDir = exitAssistRef.current;
        exitAssistRef.current = null;
        if (!assistDir) return;
        // Guard: if somehow re-engaged, don't interfere
        if (engagedRef.current) return;
        // Check if page is still inside the pin range (sticky still active)
        const outer = containerRef.current;
        if (!outer) return;
        const rect = outer.getBoundingClientRect();
        const stillPinned = rect.top <= -2 && rect.bottom >= window.innerHeight + 2;
        if (!stillPinned) return; // momentum already carried the page out — do nothing
        // Compute absolute track position for a safe exit target
        const trackTopAbs = rect.top + window.scrollY;
        const trackHeight = rect.height;
        const vh = window.innerHeight;
        const target = assistDir === "down"
          ? trackTopAbs + trackHeight - vh * 0.5   // well past the bottom pin edge
          : trackTopAbs - vh * 0.5;                 // well past the top pin edge
        if (FQ_DEBUG) writeHud({ eng: engagedRef.current, step: stepRef.current, anchor: Math.round(anchorYRef.current), delta: Math.round(window.scrollY - anchorYRef.current), fgr: false, burst: false, assist: assistDir, evt: "assist-fire" });
        window.scrollTo({ top: target, behavior: "smooth" });
      }, 250);
    };

    const onTouchEnd = () => {
      fingerDownRef.current = false;
      if (!engagedRef.current) {
        // Boundary exit already fired from onScrollDelta (finger was down then) — finger just lifted.
        // Start the exit assist timer so a slow drag doesn't leave the page frozen.
        startExitAssist();
        if (FQ_DEBUG) writeHud({ eng: false, step: stepRef.current, gs: gestureStartStepRef.current, anchor: Math.round(anchorYRef.current), delta: Math.round(window.scrollY - anchorYRef.current), fgr: false, burst: false, assist: exitAssistRef.current, evt: "te-exit" });
        return;
      }
      const finalDelta = window.scrollY - anchorYRef.current;
      const samples = deltaSamplesRef.current;
      let v = 0;
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) v = (last.d - first.d) / dt;
      }
      const finalCardY = gestureBaseCardYRef.current - finalDelta;
      // Direction of this gesture: negative finalCardY = swipe up, positive = swipe down.
      const gestureDir: "up" | "down" = finalCardY < 0 ? "up" : "down";

      // ── onTouchEnd decision tree ──────────────────────────────────────────────
      // Evaluated in order; first matching branch wins.
      //
      // A. BOUNDARY FLICK EXIT (checked before normal commit/springback):
      //    Conditions: still engaged AND gesture started at a boundary step AND the
      //    drag direction points past that boundary AND velocity qualifies as a flick
      //    (|v| > COMMIT_VELOCITY) even though |finalCardY| ≤ COMMIT_DISTANCE_PX
      //    (a short-but-fast gesture that wouldn't normally commit a step).
      //    Also catches the dead-commit case: where commitCard would be called with a
      //    direction past the boundary (e.g. "up" at step STEP_COUNT-1) — commitCard
      //    clamps next via min/max into a no-op re-commit of the same step. Route that
      //    here instead so the user exits rather than being silently stuck.
      //    Result: release engagement, set exit direction, start assist, do NOT clamp.
      //
      // B. NORMAL COMMIT: |finalCardY| > COMMIT_DISTANCE_PX OR |v| > COMMIT_VELOCITY.
      //    commitCard() advances the step (clamped to 0..STEP_COUNT-1 by min/max).
      //    Then clamp scroll to anchor and set burstLock.
      //
      // C. SPRINGBACK: gesture too short and too slow to commit.
      //    Animate card back to rest. Then clamp scroll to anchor and set burstLock.
      //
      // Non-exit paths (B, C) always clamp + burstLock at the end.

      const isBoundaryFlick =
        gestureStartStepRef.current === STEP_COUNT - 1 && gestureDir === "up" && Math.abs(v) > COMMIT_VELOCITY ||
        gestureStartStepRef.current === 0 && gestureDir === "down" && Math.abs(v) > COMMIT_VELOCITY;

      // Dead-commit: would commit past boundary into clamped no-op
      const isDeadCommit =
        (Math.abs(finalCardY) > COMMIT_DISTANCE_PX || Math.abs(v) > COMMIT_VELOCITY) && (
          (gestureDir === "up" && stepRef.current === STEP_COUNT - 1) ||
          (gestureDir === "down" && stepRef.current === 0)
        );

      if (isBoundaryFlick || isDeadCommit) {
        // A. Boundary flick exit (finger is down → about to lift, assist fires via onTouchEnd path).
        // Direction: at step STEP_COUNT-1, swiping up exits downward (past bottom pin edge).
        //            at step 0, swiping down exits upward (past top pin edge).
        const boundaryExitDir: "up" | "down" =
          gestureStartStepRef.current === STEP_COUNT - 1 ? "down" : "up";
        engagedRef.current = false;
        exitingRef.current = true;
        exitAssistRef.current = boundaryExitDir;
        dispatchInSection(false);
        // Do NOT clamp — let native momentum carry the page out.
        // startExitAssist fires immediately because this IS onTouchEnd (finger already up).
        startExitAssist();
        if (FQ_DEBUG) writeHud({ eng: false, step: stepRef.current, gs: gestureStartStepRef.current, anchor: Math.round(anchorYRef.current), delta: Math.round(finalDelta), fgr: false, burst: false, assist: boundaryExitDir, evt: "te-flick-exit" });
        return;
      }

      const shouldCommit = Math.abs(finalCardY) > COMMIT_DISTANCE_PX || Math.abs(v) > COMMIT_VELOCITY;
      if (shouldCommit) {
        // B. Normal commit — commitCard clamps next via min/max so it is safe at any step
        commitCard(gestureDir);
      } else {
        // C. Springback
        springBack();
      }
      // Non-exit paths: always clamp + burstLock (invisible under sticky pin)
      window.scrollTo(0, anchorYRef.current);
      burstLockRef.current = true;
      burstTimerRef.current = setTimeout(() => { burstLockRef.current = false; }, 150);
      if (FQ_DEBUG) writeHud({ eng: engagedRef.current, step: stepRef.current, gs: gestureStartStepRef.current, anchor: Math.round(anchorYRef.current), delta: Math.round(finalDelta), fgr: false, burst: true, assist: null, evt: "te" });
    };

    // ── Passive window scroll listener — drives cardY while engaged ────────────
    // Sign convention: swipe up → scrollY increases → delta positive → cardY negative → commitCard("up")

    const onScrollDelta = () => {
      if (!engagedRef.current || exitingRef.current) return;
      const delta = window.scrollY - anchorYRef.current;
      if (delta === 0) return; // our own clamp fired → scroll event from scrollTo → ignore

      // Boundary release check (live — checked first, before any card update).
      // Guards: (1) finger must currently be down — momentum-leak events (finger up) must
      //         never trigger a release; they fall through to burst-absorption below.
      //         (2) this gesture must have STARTED at the boundary step — a rapid swipe
      //         that commits INTO step 0/3 cannot release via its own momentum tail,
      //         because gestureStartStepRef was set to the prior step at onTouchStart.
      if (
        fingerDownRef.current &&
        gestureStartStepRef.current === 0 &&
        stepRef.current === 0 &&
        delta < -EXIT_RELEASE_PX
      ) {
        engagedRef.current = false;
        exitingRef.current = true;
        exitAssistRef.current = "up";
        dispatchInSection(false);
        // onTouchEnd will call startExitAssist() when it fires (finger is down now).
        // The momentum-phase assist-start path is intentionally removed — releases only
        // happen finger-down, so onTouchEnd always follows this branch.
        if (FQ_DEBUG) writeHud({ eng: false, step: stepRef.current, gs: gestureStartStepRef.current, anchor: Math.round(anchorYRef.current), delta: Math.round(delta), fgr: fingerDownRef.current, burst: burstLockRef.current, exit: true, assist: "up", evt: "sc-exit-up" });
        return; // Do NOT clamp — let native momentum exit upward
      }
      if (
        fingerDownRef.current &&
        gestureStartStepRef.current === STEP_COUNT - 1 &&
        stepRef.current === STEP_COUNT - 1 &&
        delta > EXIT_RELEASE_PX
      ) {
        engagedRef.current = false;
        exitingRef.current = true;
        exitAssistRef.current = "down";
        dispatchInSection(false);
        // onTouchEnd will call startExitAssist() when it fires (finger is down now).
        // The momentum-phase assist-start path is intentionally removed — releases only
        // happen finger-down, so onTouchEnd always follows this branch.
        if (FQ_DEBUG) writeHud({ eng: false, step: stepRef.current, gs: gestureStartStepRef.current, anchor: Math.round(anchorYRef.current), delta: Math.round(delta), fgr: fingerDownRef.current, burst: burstLockRef.current, exit: true, assist: "down", evt: "sc-exit-dn" });
        return; // Do NOT clamp — let native momentum exit downward
      }

      if (fingerDownRef.current && !burstLockRef.current) {
        // Mid-gesture: drive card from scroll delta
        const liveCardY = gestureBaseCardYRef.current - delta;
        cardY.set(liveCardY);
        cardOpacity.set(Math.max(0, 1 - Math.abs(liveCardY) / FADE_DISTANCE_PX));
        deltaSamplesRef.current.push({ d: delta, t: performance.now() });
        if (deltaSamplesRef.current.length > 4) deltaSamplesRef.current.shift();
      } else if (fingerDownRef.current && burstLockRef.current) {
        // Finger down but burst lock active — absorb without driving cardY
      } else if (!fingerDownRef.current) {
        if (burstLockRef.current) {
          // Reset quiet-gap timer — absorb momentum-leak without clamping or driving cardY
          if (burstTimerRef.current !== null) clearTimeout(burstTimerRef.current);
          burstTimerRef.current = setTimeout(() => { burstLockRef.current = false; }, 150);
        } else {
          // Stray momentum (no finger, no burst lock, not exiting) — kill it
          window.scrollTo(0, anchorYRef.current);
        }
      }

      if (FQ_DEBUG) writeHud({ eng: engagedRef.current, step: stepRef.current, gs: gestureStartStepRef.current, anchor: Math.round(anchorYRef.current), delta: Math.round(delta), fgr: fingerDownRef.current, burst: burstLockRef.current, exit: exitingRef.current, assist: exitAssistRef.current, evt: "sc" });
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScrollDelta, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScrollDelta);
      if (burstTimerRef.current !== null) {
        clearTimeout(burstTimerRef.current);
        burstTimerRef.current = null;
      }
      if (exitAssistTimerRef.current !== null) {
        clearTimeout(exitAssistTimerRef.current);
        exitAssistTimerRef.current = null;
      }
      exitAssistRef.current = null;
      dispatchInSection(false);
    };
  }, [isDesktop, cardY, cardOpacity]);

  // Which part is highlighted — scroll-driven on desktop, touch-driven on mobile.
  const effectiveActive = isDesktop ? activeIndex : step - 1;

  const { images, progress, isLoaded } = useFramePreloader(
    TOTAL_FRAMES,
    FRAME_PATH_TEMPLATE,
    { enabled: nearViewport, padLength: FRAME_PAD_LENGTH },
  );

  const { displayedFrame, settled } = useSegmentedFrames({
    activeIndex: effectiveActive,
    parts: WINDOW_PARTS,
    enabled: isLoaded,
  });

  const thermalActive = effectiveActive === THERMAL_INDEX;
  const thermalSettled = thermalActive && settled;

  const activeMaterial = useMemo(
    () => WINDOW_MATERIALS.find((m) => m.id === material) ?? WINDOW_MATERIALS[0],
    [material],
  );

  const handleMaterial = useCallback((id: string) => {
    setMatFade(true);
    setMaterial(id as MaterialId);
  }, []);

  // Leaving Part 2 always snaps the selection back to uPVC.
  useEffect(() => {
    if (!thermalActive && material !== "upvc") {
      setMatFade(false);
      setMaterial("upvc");
    }
  }, [thermalActive, material]);

  // Draw the current frame (displayedFrame is 1-indexed; images[] is 0-indexed).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let img = images[displayedFrame - 1];
    if (!img || !img.naturalWidth) {
      for (let o = 1; o < images.length; o++) {
        const before = images[displayedFrame - 1 - o];
        if (before?.naturalWidth) { img = before; break; }
        const after = images[displayedFrame - 1 + o];
        if (after?.naturalWidth) { img = after; break; }
      }
    }
    if (!img || !img.naturalWidth) return;

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  }, [displayedFrame, images, isLoaded]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[color:var(--canvas)] max-lg:h-[260lvh]"
    >
      {/* FULL-WIDTH layout — sticky on desktop, static full-screen on mobile */}
      <div
        ref={stickyRef}
        className={cn(
          !isDesktop
            ? "sticky top-0 flex w-full h-[100lvh] overflow-hidden bg-[color:var(--canvas)] items-end"
            : "sticky top-0 flex h-screen w-full overflow-hidden bg-[color:var(--canvas)] lg:items-center lg:pb-0"
        )}
      >
        <div ref={mediaBoxRef} className="relative w-full aspect-[4/3] lg:aspect-[1920/1080]">
          {/* Instant poster */}
          <img
            src={POSTER}
            alt=""
            aria-hidden="true"
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover lg:object-contain transition-opacity duration-300",
              isLoaded ? "opacity-0" : "opacity-100",
            )}
          />
          {/* Animated frame canvas */}
          <canvas
            ref={canvasRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover lg:object-contain transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
          />
          {/* Aluminium still — cross-fades over the uPVC canvas frame when picked */}
          {nearViewport && (
            <img
              src={ALU_IMAGE}
              alt=""
              aria-hidden="true"
              decoding="async"
              className={cn(
                "pointer-events-none absolute inset-0 h-full w-full object-cover lg:object-contain",
                matFade ? "transition-opacity duration-500 ease-out" : "transition-none",
                thermalSettled && material === "alu" ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          {/* Part-2 numbered pins — the mobile stand-in for the connector lines.
              On mobile the square box center-crops the 16:9 image via object-cover.
              This wrapper replicates the painted image rectangle (16:9 at full height,
              centered) so pin anchor percentages map correctly onto the visible image
              rather than the larger square box. On desktop the wrapper equals the box
              (also 16:9), so marker positions are unchanged. */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-full aspect-[1920/1080] -translate-x-1/2">
            <PhaseCalloutMarkers callouts={activeMaterial.callouts} active={thermalSettled} />
          </div>
        </div>

        {/* Loading bar */}
        {!isLoaded && nearViewport && (
          <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center">
            <div className="h-[2px] w-48 overflow-hidden rounded-full bg-[color:var(--rule-soft)]">
              <div
                className="h-full bg-[color:var(--ink-muted)] transition-[width] duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Part-2 connector lines — pinned with the media, drawn behind the text */}
        {isDesktop && (
          <PhaseCalloutLines
            originRef={stickyRef}
            imageBoxRef={mediaBoxRef}
            itemRefs={itemRefs}
            callouts={activeMaterial.callouts}
            active={thermalSettled}
          />
        )}

        {/* MOBILE swipe-card text overlays — all stacked at the same position;
            the active card tracks the finger 1:1 via cardY/cardOpacity MotionValues. */}
        {!isDesktop && (
          <div className="pointer-events-none absolute inset-0 z-10">
            {/* Step 0 — section title + Part 0 intro */}
            <motion.div
              className="absolute inset-x-0 top-0 px-6 pt-[4vh] pointer-events-auto"
              aria-hidden={step !== 0}
              style={
                step === 0
                  ? { y: cardY, opacity: cardOpacity, willChange: "transform, opacity", pointerEvents: "auto" }
                  : { opacity: 0, pointerEvents: "none" }
              }
            >
              <p className="eyebrow mb-3 text-[color:var(--ink-muted)]">{SECTION_EYEBROW}</p>
              <h2 className="max-w-[13ch] font-serif text-h3 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
                {SECTION_TITLE}
              </h2>
              <div className="mt-8 max-w-[24rem]">
                <div className="mb-5 h-px w-full bg-[color:var(--rule-soft)]" />
                <p className="mb-6 text-body-sm leading-[1.6] text-[color:var(--ink-secondary)]">
                  {PART_ZERO.body}
                </p>
                <ul>
                  {PART_ZERO.materials.map((m) => (
                    <li
                      key={m.label}
                      className="border-t border-[color:var(--rule-soft)] py-3 text-body-sm leading-snug"
                    >
                      <span className="font-medium text-[color:var(--ink-primary)]">{m.label}</span>
                      <span className="text-[color:var(--ink-muted)]"> — {m.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            {/* Steps 1..N — one per part */}
            {WINDOW_PARTS.map((part, i) => (
              <motion.div
                key={part.id}
                className="absolute inset-x-0 top-0 px-6 pt-[4vh] pointer-events-auto"
                aria-hidden={step !== i + 1}
                style={
                  step === i + 1
                    ? { y: cardY, opacity: cardOpacity, willChange: "transform, opacity", pointerEvents: "auto" }
                    : { opacity: 0, pointerEvents: "none" }
                }
              >
                <div className="max-w-[24rem]">
                  <PartBody
                    part={part}
                    activeMaterial={activeMaterial}
                    material={material}
                    onMaterial={handleMaterial}
                    toggleEnabled={thermalSettled}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP normal-flow text — scrolls over the pinned media */}
      {isDesktop && (
        <div className="relative z-10 -mt-[100vh]">
          {/* Section title + Part 0 intro — top of the section, aligned to the
              same left margin as the benefit texts. Title stays solid; the Part 0
              copy dims once the first benefit takes over. */}
          <div className="flex items-start" style={{ minHeight: `${PART0_VH}vh` }}>
            <div className="mx-auto w-full max-w-[100rem] px-6 pt-[12vh] md:px-10 lg:px-16">
              <p className="eyebrow mb-3 text-[color:var(--ink-muted)]">{SECTION_EYEBROW}</p>
              <h2 className="max-w-[13ch] font-serif text-h3 leading-[1.05] tracking-tight text-[color:var(--ink-primary)] lg:text-h2">
                {SECTION_TITLE}
              </h2>
              <div
                className="mt-8 max-w-[24rem] transition-opacity duration-500 ease-out lg:max-w-[27rem]"
                style={{ opacity: activeIndex < 0 ? 1 : INACTIVE_OPACITY }}
              >
                <div className="mb-5 h-px w-full bg-[color:var(--rule-soft)]" />
                <p className="mb-6 text-body-sm leading-[1.6] text-[color:var(--ink-secondary)] lg:text-body">
                  {PART_ZERO.body}
                </p>
                <ul>
                  {PART_ZERO.materials.map((m) => (
                    <li
                      key={m.label}
                      className="border-t border-[color:var(--rule-soft)] py-3 text-body-sm leading-snug"
                    >
                      <span className="font-medium text-[color:var(--ink-primary)]">{m.label}</span>
                      <span className="text-[color:var(--ink-muted)]"> — {m.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {WINDOW_PARTS.map((part, i) => (
            <div
              key={part.id}
              ref={(el) => { panelRefs.current[i] = el; }}
              className="flex items-center"
              style={{ minHeight: `${PANEL_VH}vh` }}
            >
              <div className="mx-auto w-full max-w-[100rem] px-6 md:px-10 lg:px-16">
                <div
                  className="max-w-[24rem] transition-opacity duration-500 ease-out lg:max-w-[27rem]"
                  style={{ opacity: i === activeIndex ? 1 : INACTIVE_OPACITY }}
                >
                  <PartBody
                    part={part}
                    activeMaterial={activeMaterial}
                    material={material}
                    onMaterial={handleMaterial}
                    toggleEnabled={thermalSettled}
                    registerItem={(el, ci) => { itemRefs.current[ci] = el; }}
                  />
                </div>
              </div>
            </div>
          ))}
          {/* Trailing settle room so Part 3 stays pinned while centered */}
          <div aria-hidden="true" style={{ height: `${TRAILING_VH}vh` }} />
        </div>
      )}
    </div>
  );
};

// Shared part text body — used by the desktop flow panels and the mobile
// swipe-step overlay. `registerItem` wires the thermal callout rows to the
// desktop connector lines; the mobile overlay omits it (numbered pins instead).
interface PartBodyProps {
  part: WindowPart;
  activeMaterial: WindowMaterial;
  material: MaterialId;
  onMaterial: (id: string) => void;
  toggleEnabled: boolean;
  registerItem?: (el: HTMLElement | null, index: number) => void;
}

const PartBody = ({
  part,
  activeMaterial,
  material,
  onMaterial,
  toggleEnabled,
  registerItem,
}: PartBodyProps) => {
  const isThermal = part.id === THERMAL_PART_ID;
  return (
    <>
      <p className="eyebrow mb-3 text-[color:var(--ink-muted)]">{part.text.eyebrow}</p>
      <h3 className="mb-3 font-serif text-[1.6rem] leading-[1.1] tracking-tight text-[color:var(--ink-primary)] lg:text-h2">
        {part.text.headline}
      </h3>
      {part.text.lede && (
        <p className="mb-6 text-body-sm leading-[1.6] text-[color:var(--ink-secondary)] lg:text-body">
          {part.text.lede}
        </p>
      )}

      {part.text.bullets && (
        <ul>
          {part.text.bullets.map((b) => (
            <li
              key={b}
              className="border-t border-[color:var(--rule-soft)] py-3 text-body-sm leading-snug text-[color:var(--ink-secondary)]"
            >
              {b}
            </li>
          ))}
        </ul>
      )}

      {isThermal && (
        <>
          <ul>
            {activeMaterial.callouts.map((c, ci) => (
              <li
                key={c.label}
                ref={registerItem ? (el) => registerItem(el, ci) : undefined}
                className="flex items-start gap-2.5 border-t border-[color:var(--rule-soft)] py-3 text-body-sm leading-snug"
              >
                {/* Matches the numbered pin on the still — mobile only */}
                <span
                  className="mt-px flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[0.65rem] font-semibold leading-none text-white lg:hidden"
                  aria-hidden="true"
                >
                  {ci + 1}
                </span>
                <span className="min-w-0">
                  <span className="font-medium text-[color:var(--ink-primary)]">{c.label}</span>
                  <span className="text-[color:var(--ink-muted)]"> — {c.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-[color:var(--rule-soft)] pt-4">
            <MaterialToggle
              systems={WINDOW_MATERIALS}
              value={material}
              onChange={onMaterial}
              disabled={!toggleEnabled}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ScrollWindow;

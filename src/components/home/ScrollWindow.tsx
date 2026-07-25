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

// Swipe feel tuning — v5
const FADE_DISTANCE_PX = 120;   // cardOpacity = max(0, 1 - |cardY| / 120)
const COMMIT_DISTANCE_PX = 44;  // displacement threshold for commit
const COMMIT_VELOCITY = 0.35;   // px/ms threshold for velocity commit
const RUBBER_BAND = 0.3;        // drag resistance at boundary steps in the exit direction
const VELOCITY_STALE_MS = 80;   // pause longer than this before release → drag, not flick
const EDGE_ANCHOR_INSET_PX = 12; // boundary steps anchor this far inside the pin edge — keeps pin condition satisfied while sitting effectively at the edge
const POINTER_SCROLL_COOLDOWN_MS = 400; // wheel/keyboard scrolling suppresses engagement for this long

const ScrollWindow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mediaBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // ── Gesture refs (unconditional — Rules of Hooks) ──────────
  const engagedRef = useRef(false);        // true while the section is engaged (pinned + touch-captured)
  const anchorYRef = useRef(0);            // the scrollY the page is held at while engaged
  const touchActiveRef = useRef(false);    // a finger is currently on the screen (window-level)
  const lastTouchYRef = useRef(0);         // latest touch clientY — feeds mid-gesture capture on engage
  const gestureStartYRef = useRef(0);      // touch clientY at the current gesture's baseline
  const gestureBaseCardYRef = useRef(0);   // cardY at the current gesture's baseline
  const gestureBaseOpacityRef = useRef(1); // cardOpacity at the baseline — keeps the fade continuous when grabbing mid-animation
  const nativePanRef = useRef(false);      // this gesture is a browser-owned native scroll (non-cancelable moves) — clamp holds the page, exits defer to touchend
  const touchSamplesRef = useRef<Array<{ y: number; t: number }>>([]); // last ≤5 touchmove samples for flick velocity
  const pointerScrollUntilRef = useRef(0); // wheel/keyboard scroll seen until this timestamp — engagement suppressed (no touch = no way to swipe out)
  const lastInSectionFlagRef = useRef<boolean | null>(null); // shared dedupe flag for fq-hide-header / fq-scrollwindow-inview dispatches

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

  // ── Mobile: touch-driven swipe engine (v5) ────────────────────────────────
  // The outer container is a 260lvh scroll track; the inner layout div is CSS
  // sticky top-0 on mobile. A rAF loop detects when the track is pinned (fully
  // straddling the viewport) and engages/disengages the touch capture.
  //
  // The v4 engine derived gestures from window scroll deltas, which made swipes
  // dependent on iOS momentum/scroll-event timing (burst locks, clamp races) and
  // could freeze entirely when a drag started outside the section (its touchstart
  // never hit the section element, so the live gesture read as stray momentum and
  // was clamped away). v5 inverts the model:
  //
  //   • The card is driven 1:1 from finger positions via WINDOW-level touch
  //     listeners — never from scroll events. touchmove events dispatch to the
  //     element where the touch started, so only window sees every gesture.
  //   • Zero lockouts: every touchstart stops in-flight springs and rebases the
  //     gesture from the current card pose; commits are synchronous at release.
  //   • Mid-gesture capture: if a finger is already down when the pin loop
  //     engages (user swiped into the section without lifting), the baseline
  //     rebases to the live finger position and that same drag moves the card.
  //   • While engaged the page is held at a mid-track anchor: touch-action:none
  //     blocks native scroll for new gestures, and a passive scroll listener
  //     re-clamps any parasitic scroll (captured-gesture native scroll, momentum
  //     tails) — invisible while the sticky pin covers the viewport.
  //   • Boundary exits are a cancelable programmatic glide past the pin edge.
  //     Re-engagement is suppressed only while the glide handle is live, and any
  //     touchstart cancels it (re-engaging if still pinned) — no reachable state
  //     leaves the user on a frozen, unresponsive screen.
  useEffect(() => {
    if (isDesktop) return;

    const el = containerRef.current;
    if (!el) return;

    let lastEvt = "-"; // HUD only

    // Dedupe dispatches — only emit when flag actually changes
    const dispatchInSection = (flag: boolean) => {
      if (flag === lastInSectionFlagRef.current) return;
      lastInSectionFlagRef.current = flag;
      window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: flag }));
      window.dispatchEvent(new CustomEvent("fq-scrollwindow-inview", { detail: { inView: flag } }));
    };

    // Track is "pinned" when the 260lvh outer container straddles the viewport:
    // top is scrolled past (negative) and bottom is still below viewport bottom.
    const isPinned = () => {
      const rect = el.getBoundingClientRect();
      return rect.top <= -2 && rect.bottom >= window.innerHeight + 2;
    };

    // Track is fully out when neither edge is within the viewport straddle.
    const isFullyOut = () => {
      const rect = el.getBoundingClientRect();
      return rect.top > 0 || rect.bottom < window.innerHeight;
    };

    // Step-dependent anchor: boundary steps sit EDGE_ANCHOR_INSET_PX inside the
    // pin edge so the page is already at the edge — native momentum exits instantly.
    // Middle steps sit at mid-track for symmetric clamp room in both directions.
    const anchorForStep = (s: number): number => {
      const rect = el.getBoundingClientRect();
      const trackTopAbs = rect.top + window.scrollY;
      const trackHeight = rect.height;
      const innerHeight = window.innerHeight;
      if (s === 0) return trackTopAbs + EDGE_ANCHOR_INSET_PX;
      if (s === STEP_COUNT - 1) return trackTopAbs + trackHeight - innerHeight - EDGE_ANCHOR_INSET_PX;
      return trackTopAbs + (trackHeight - innerHeight) / 2;
    };

    const engage = (entryStep: number) => {
      engagedRef.current = true;
      stepRef.current = entryStep;
      setStep(entryStep);
      // Anchor: step-dependent — boundary steps sit at the edge, middle at mid-track.
      anchorYRef.current = anchorForStep(entryStep);
      window.scrollTo(0, anchorYRef.current);
      cardY.stop();
      cardOpacity.stop();
      cardY.set(0);
      cardOpacity.set(1);
      // Mid-gesture capture: rebase to the current finger position so a drag
      // that is already in progress immediately starts driving the card.
      gestureStartYRef.current = lastTouchYRef.current;
      gestureBaseCardYRef.current = 0;
      gestureBaseOpacityRef.current = 1;
      nativePanRef.current = false; // re-derived per move (non-cancelable ⇒ true)
      touchSamplesRef.current = [];
      el.style.touchAction = "none"; // new gestures: no native scroll while engaged
      dispatchInSection(true);
    };

    const disengage = () => {
      engagedRef.current = false;
      el.style.touchAction = "";
      // Never leave a half-faded, offset card behind (resize/URL-bar jumps can
      // disengage mid-drag and the section may still be partially on screen).
      cardY.stop();
      cardOpacity.stop();
      cardY.set(0);
      cardOpacity.set(1);
      dispatchInSection(false);
    };

    const springBack = () => {
      // Clamp to current step's anchor for consistency — anchor is already set
      // correctly, so this is just a safety re-assert.
      anchorYRef.current = anchorForStep(stepRef.current);
      window.scrollTo(0, anchorYRef.current);
      animate(cardY, 0, { type: "spring", stiffness: 380, damping: 32 });
      animate(cardOpacity, 1, { duration: 0.18 });
    };

    const commitCard = (direction: "up" | "down") => {
      const current = stepRef.current;
      const next = Math.max(0, Math.min(STEP_COUNT - 1, direction === "up" ? current + 1 : current - 1));
      // 1. Advance step synchronously — React binds the new card immediately
      stepRef.current = next;
      setStep(next);
      // 2. Re-anchor to the new step's position (edge anchor for boundary steps)
      anchorYRef.current = anchorForStep(next);
      window.scrollTo(0, anchorYRef.current);
      // 3. Set entry pose for incoming card (old card is inactive → opacity 0 via style binding)
      const entryY = direction === "up" ? 36 : -36;
      cardY.set(entryY);
      cardOpacity.set(0);
      // 4. Spring in — interruptible: the next touchstart stops and rebases
      animate(cardY, 0, { type: "spring", stiffness: 300, damping: 30, velocity: 0 });
      animate(cardOpacity, 1, { duration: 0.28 });
    };

    // ── Pin loop ──────────────────────────────────────────────────────────────
    // Consecutive pinned-frame counter — requires 2 frames before engaging
    // to prevent fling-through from momentarily triggering engagement.
    let consecutivePinCount = 0;
    let raf = 0;

    function tick() {
      if (!engagedRef.current) {
        if (
          isPinned() &&
          performance.now() > pointerScrollUntilRef.current
        ) {
          // Not during pointer scrolling — wheel/keyboard users have no touch
          // gestures to swipe out with, so engaging would trap them.
          consecutivePinCount++;
          if (consecutivePinCount >= 2) {
            consecutivePinCount = 0;
            // Entry direction from which pin edge is closer at engagement —
            // robust at any scroll speed (unlike sampling the last pre-pin
            // rect.top, which lands in a 2px dead zone on slow entries).
            const rect = el.getBoundingClientRect();
            const enteredFromTop = rect.top >= -(rect.height - window.innerHeight) / 2;
            engage(enteredFromTop ? 0 : STEP_COUNT - 1);
          }
        } else {
          consecutivePinCount = 0;
        }
      } else if (isFullyOut()) {
        // Shouldn't happen while clamped, but resize/URL-bar jumps can move the
        // page — never stay "engaged" while off screen.
        disengage();
        consecutivePinCount = 0;
      }

      // HUD: refresh state every rAF (cheap — direct DOM write)
      if (FQ_DEBUG) {
        const r = el.getBoundingClientRect();
        writeHud({
          eng: engagedRef.current,
          step: stepRef.current,
          cardY: Math.round(cardY.get()),
          touch: touchActiveRef.current,
          pan: nativePanRef.current,
          anchor: Math.round(anchorYRef.current),
          off: Math.round(window.scrollY - anchorYRef.current),
          pinTop: Math.round(r.top),
          pinBot: Math.round(r.bottom - window.innerHeight),
          evt: lastEvt,
        });
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    // ── Touch handlers (window-level — see header comment) ────────────────────

    const onTouchStart = (e: TouchEvent) => {
      if (touchActiveRef.current) return; // second finger — the first keeps the gesture
      const touch = e.touches[0];
      if (!touch) return;
      touchActiveRef.current = true;
      lastTouchYRef.current = touch.clientY;
      if (!engagedRef.current) return;
      // Zero-delay chaining: stop in-flight springs, rebase from the current pose.
      cardY.stop();
      cardOpacity.stop();
      gestureStartYRef.current = touch.clientY;
      gestureBaseCardYRef.current = cardY.get();
      gestureBaseOpacityRef.current = cardOpacity.get();
      nativePanRef.current = false;
      touchSamplesRef.current = [{ y: touch.clientY, t: e.timeStamp }];
      lastEvt = "ts";
    };

    // Fade continuous from the grab pose: for a fresh gesture (base y=0, base
    // opacity=1) this is exactly 1 - |y|/FADE_DISTANCE; grabbing a card mid-fade
    // continues from its frozen opacity instead of popping to the formula value.
    const fadeFrom = (yPos: number) =>
      Math.min(
        1,
        Math.max(
          0,
          gestureBaseOpacityRef.current -
            (Math.abs(yPos) - Math.abs(gestureBaseCardYRef.current)) / FADE_DISTANCE_PX,
        ),
      );

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const y = touch.clientY;
      lastTouchYRef.current = y;

      if (!engagedRef.current) return;
      // Mid-gesture captures may be an active native scroll (non-cancelable) —
      // the scroll clamp below holds the page for those; the card still follows.
      if (e.cancelable) e.preventDefault();
      else nativePanRef.current = true; // browser owns this gesture as a scroll

      const dy = y - gestureStartYRef.current;
      const samples = touchSamplesRef.current;
      samples.push({ y, t: e.timeStamp });
      if (samples.length > 5) samples.shift();

      const atFirst = stepRef.current === 0;
      const atLast = stepRef.current === STEP_COUNT - 1;
      const exitDrag = (atFirst && dy > 0) || (atLast && dy < 0);

      if (exitDrag) {
        // Exit-direction drag at a boundary step: rubber-band only. The page is
        // already edge-anchored (EDGE_ANCHOR_INSET_PX from the pin edge), so
        // lifting the finger lets native momentum carry the page out naturally —
        // no programmatic assist needed.
        const ry = gestureBaseCardYRef.current + dy * RUBBER_BAND;
        cardY.set(ry);
        cardOpacity.set(fadeFrom(ry));
      } else {
        const targetY = gestureBaseCardYRef.current + dy;
        cardY.set(targetY);
        cardOpacity.set(fadeFrom(targetY));
      }
      lastEvt = "tm";
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // A finger remains — hand the gesture to it.
        const touch = e.touches[0];
        lastTouchYRef.current = touch.clientY;
        if (engagedRef.current) {
          gestureStartYRef.current = touch.clientY;
          gestureBaseCardYRef.current = cardY.get();
          gestureBaseOpacityRef.current = cardOpacity.get();
          touchSamplesRef.current = [{ y: touch.clientY, t: e.timeStamp }];
        }
        return;
      }
      touchActiveRef.current = false;
      if (!engagedRef.current) return;

      const dy = lastTouchYRef.current - gestureStartYRef.current;
      const samples = touchSamplesRef.current;
      let v = 0; // px/ms; negative = upward flick
      if (samples.length >= 2) {
        const a = samples[0];
        const b = samples[samples.length - 1];
        // A pause before release means the drag is a position, not a flick.
        if (b.t > a.t && e.timeStamp - b.t < VELOCITY_STALE_MS) v = (b.y - a.y) / (b.t - a.t);
      }
      const flick = Math.abs(v) > COMMIT_VELOCITY;
      const shouldCommit = flick || Math.abs(dy) > COMMIT_DISTANCE_PX;
      // Flick direction wins over net displacement (drag down, flick up → up).
      const dir: "up" | "down" = flick ? (v < 0 ? "up" : "down") : dy < 0 ? "up" : "down";

      const atBoundaryExit =
        (dir === "up" && stepRef.current === STEP_COUNT - 1) ||
        (dir === "down" && stepRef.current === 0);

      if (atBoundaryExit && shouldCommit) {
        // Snap the card to rest, disengage, and let native momentum carry the
        // page out. The page is already edge-anchored (EDGE_ANCHOR_INSET_PX from
        // the pin edge) — no assist scroll needed; the finger's own gesture has
        // enough energy to cross the remaining 12px + continue naturally.
        // Suppress re-engagement for 400ms so the rAF loop doesn't re-engage while
        // the user's momentum is carrying the page the last 12px + beyond.
        cardY.stop();
        cardOpacity.stop();
        cardY.set(0);
        cardOpacity.set(1);
        engagedRef.current = false;
        el.style.touchAction = "";
        pointerScrollUntilRef.current = performance.now() + 400;
        dispatchInSection(false);
        lastEvt = dir === "up" ? "te-exit-dn" : "te-exit-up";
      } else if (!shouldCommit) {
        springBack();
        lastEvt = "te-spring";
      } else {
        commitCard(dir);
        lastEvt = "te-commit";
      }
    };

    // A canceled gesture (system UI stole the touch — notification shade, edge
    // gesture, incoming call) must never commit a step or fire an exit.
    const onTouchCancel = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // A finger remains — hand the gesture to it, same as touchend.
        const touch = e.touches[0];
        lastTouchYRef.current = touch.clientY;
        if (engagedRef.current) {
          gestureStartYRef.current = touch.clientY;
          gestureBaseCardYRef.current = cardY.get();
          gestureBaseOpacityRef.current = cardOpacity.get();
          touchSamplesRef.current = [{ y: touch.clientY, t: e.timeStamp }];
        }
        return;
      }
      touchActiveRef.current = false;
      if (engagedRef.current) springBack();
      lastEvt = "tc";
    };

    // Clamp to anchor while engaged (invisible under the sticky pin).
    // When disengaged (boundary exit fired), do NOT clamp — native momentum
    // carries the page out past the edge.
    const onScroll = () => {
      if (!engagedRef.current) return;
      if (Math.abs(window.scrollY - anchorYRef.current) > 0.5) {
        window.scrollTo(0, anchorYRef.current);
      }
    };

    // Wheel/keyboard scrolling (trackpad, mouse, PageDown — narrow windows,
    // iPad + keyboard, Android + mouse) has no touch gestures to swipe out with:
    // engaging would trap the page at the anchor with the header hidden. Any
    // pointer-scroll input disengages and suppresses engagement while it lasts;
    // the section then behaves as a plain sticky scroll-through. The event fires
    // before the scroll it causes, so the clamp is already off when scroll lands.
    const onPointerScroll = () => {
      pointerScrollUntilRef.current = performance.now() + POINTER_SCROLL_COOLDOWN_MS;
      if (engagedRef.current) disengage();
    };
    const SCROLL_KEYS = new Set([" ", "Spacebar", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]);
    const onKeyDown = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (SCROLL_KEYS.has(e.key)) onPointerScroll();
    };

    const onOrientationChange = () => {
      disengage();
      setStep(0);
      stepRef.current = 0;
      consecutivePinCount = 0;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onPointerScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onPointerScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("orientationchange", onOrientationChange);
      engagedRef.current = false;
      touchActiveRef.current = false;
      el.style.touchAction = "";
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
                  className="mt-px flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full bg-[color:var(--accent)] text-[0.5rem] font-semibold leading-none text-white lg:hidden"
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

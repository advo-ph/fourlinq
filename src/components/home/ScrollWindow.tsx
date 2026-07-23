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

const ScrollWindow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mediaBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // ── Gesture refs (unconditional — Rules of Hooks) ──────────
  const animatingRef = useRef(false);
  const engagedRef = useRef(false);        // true only while section is fully settled in-view
  const touchStartYRef = useRef(0);
  const touchLastYRef = useRef(0);
  const touchSamplesRef = useRef<Array<{ y: number; t: number }>>([]);
  const gestureDirectionRef = useRef<'up' | 'down' | null>(null);
  const gestureCapturedRef = useRef(false);

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

  // ── Mobile: scroll-settle engagement state machine ─────────────────────────
  // Replaces the v1 IntersectionObserver approach. Dispatches fq-hide-header
  // and fq-scrollwindow-inview based on scroll settle position, not IO threshold.
  // Also handles orientation change reset.
  useEffect(() => {
    if (isDesktop) return;

    const el = containerRef.current;
    if (!el) return;

    // Cache section height once on mount — not re-read on toolbar resize.
    const cachedHeight = el.getBoundingClientRect().height;

    let armedRef = true;
    let prevSectionTopRef = 0;
    let settleTimerRef: ReturnType<typeof setTimeout> | null = null;

    // Fix B2: dedupe dispatches — only emit when flag actually changes
    let lastDispatchFlag: boolean | null = null;
    const dispatchInSection = (flag: boolean) => {
      if (flag === lastDispatchFlag) return;
      lastDispatchFlag = flag;
      window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: flag }));
      window.dispatchEvent(new CustomEvent("fq-scrollwindow-inview", { detail: { inView: flag } }));
    };

    const onSettle = () => {
      const top = el.getBoundingClientRect().top;
      if (armedRef && Math.abs(top) <= 48) {
        // Fix B3: skip smooth-align glide when already aligned (avoids settle churn)
        if (Math.abs(top) >= 1) {
          window.scrollTo({ top: window.scrollY + top, behavior: "smooth" });
        }
        armedRef = false;
        engagedRef.current = true;          // Bug A fix: mark section as engaged
        el.style.touchAction = "none";      // Fix A1: deterministic capture — no race with browser
        // Approaching from above (top was positive before) → step 0; from below → last step
        setStep(prevSectionTopRef > 0 ? 0 : STEP_COUNT - 1);
        stepRef.current = prevSectionTopRef > 0 ? 0 : STEP_COUNT - 1;
        dispatchInSection(true);
        cardY.set(0);
        cardOpacity.set(1);
      } else {
        // Fix B1: loose bounds with epsilon — sub-pixel fractional top won't false-disengage
        const stillIn = top <= 56 && top + cachedHeight >= window.innerHeight - 56;
        if (!stillIn) {
          dispatchInSection(false);
        }
      }
    };

    const clearSettle = () => {
      if (settleTimerRef !== null) {
        clearTimeout(settleTimerRef);
        settleTimerRef = null;
      }
    };

    const scheduleSettle = () => {
      clearSettle();
      settleTimerRef = setTimeout(onSettle, 120);
    };

    const onScroll = () => {
      const top = el.getBoundingClientRect().top;
      prevSectionTopRef = top;
      // Re-arm when far from section so the next approach can engage
      if (Math.abs(top) > 80) {
        armedRef = true;
        engagedRef.current = false;         // Bug A fix: disengage when user scrolls away
        el.style.touchAction = "";          // Fix A2: restore native scroll on disengage
      }
      if ("onscrollend" in window) {
        // scheduleSettle acts as fallback; scrollend fires the settle directly
        scheduleSettle();
      } else {
        scheduleSettle();
      }
    };

    const onScrollEnd = () => {
      clearSettle();
      onSettle();
    };

    const onOrientationChange = () => {
      engagedRef.current = false;           // Bug A fix: disengage on rotation
      el.style.touchAction = "";            // Fix A3: restore native scroll on rotation
      dispatchInSection(false);
      cardY.set(0);
      cardOpacity.set(1);
      setStep(0);
      stepRef.current = 0;
      armedRef = true;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if ("onscrollend" in window) {
      window.addEventListener("scrollend", onScrollEnd);
    }
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      clearSettle();
      engagedRef.current = false;           // Bug A fix: disengage on unmount/isDesktop change
      el.style.touchAction = "";            // Fix A4: restore native scroll on cleanup
      window.removeEventListener("scroll", onScroll);
      if ("onscrollend" in window) {
        window.removeEventListener("scrollend", onScrollEnd);
      }
      window.removeEventListener("orientationchange", onOrientationChange);
      dispatchInSection(false);
    };
  }, [isDesktop, cardY, cardOpacity]);

  // ── Mobile: native touch gesture engine ────────────────────────────────────
  useEffect(() => {
    if (isDesktop) return;

    const el = containerRef.current;
    if (!el) return;

    // Fix B2: dedupe dispatches — only emit when flag actually changes
    let lastDispatchFlag: boolean | null = null;
    const dispatchInSection = (flag: boolean) => {
      if (flag === lastDispatchFlag) return;
      lastDispatchFlag = flag;
      window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: flag }));
      window.dispatchEvent(new CustomEvent("fq-scrollwindow-inview", { detail: { inView: flag } }));
    };

    const springBack = () => {
      animate(cardY, 0, { type: "spring", stiffness: 380, damping: 32 });
      animate(cardOpacity, 1, { duration: 0.18 });
    };

    const commitCard = (direction: "up" | "down") => {
      animatingRef.current = true;
      const exitY = direction === "up" ? -140 : 140;
      animate(cardY, exitY, { duration: 0.16, ease: "easeOut" });
      animate(cardOpacity, 0, {
        duration: 0.14,
        onComplete: () => {
          const current = stepRef.current;
          const next = Math.max(0, Math.min(STEP_COUNT - 1, direction === "up" ? current + 1 : current - 1));
          stepRef.current = next;
          setStep(next);
          // Entry pose for incoming card
          cardY.set(direction === "up" ? 36 : -36);
          cardOpacity.set(0);
          // Spring in
          animate(cardY, 0, {
            type: "spring",
            stiffness: 300,
            damping: 30,
            onComplete: () => {
              animatingRef.current = false;
            },
          });
          animate(cardOpacity, 1, { duration: 0.28 });
        },
      });
    };

    const onTouchStart = (e: TouchEvent) => {
      // Bug B fix: ALWAYS reset gesture refs for ref hygiene, even during animation.
      // onTouchMove already returns early while animatingRef is true, so a gesture that
      // starts mid-animation will correctly re-lock from the current finger position
      // once the animation finishes (dy is measured from this touchstart's clientY).
      if (e.touches.length > 1) {
        touchStartYRef.current = 0;
        touchLastYRef.current = 0;
        touchSamplesRef.current = [];
        gestureDirectionRef.current = null;
        gestureCapturedRef.current = false;
        return;
      }
      touchStartYRef.current = e.touches[0].clientY;
      touchLastYRef.current = e.touches[0].clientY;
      touchSamplesRef.current = [];
      gestureDirectionRef.current = null;
      gestureCapturedRef.current = false;
      if (animatingRef.current) {
        // During commit animation — refs are clean; let native events propagate
        return;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (animatingRef.current) {
        // During commit animation — do not prevent default; let native scroll happen
        return;
      }

      // Multi-touch: release capture if it was grabbed
      if (e.touches.length > 1) {
        if (gestureCapturedRef.current) {
          gestureCapturedRef.current = false;
          springBack();
        }
        return;
      }

      const currentY = e.touches[0].clientY;
      const dy = currentY - touchStartYRef.current;

      // Direction lock after 6px movement
      if (gestureDirectionRef.current === null && Math.abs(dy) > 6) {
        // Bug A fix: if section is not engaged (e.g. partially scrolled into view),
        // immediately lock the gesture as pass-through so native scroll is not hijacked.
        if (!engagedRef.current) {
          gestureDirectionRef.current = "down"; // any non-null value to prevent re-evaluation
          gestureCapturedRef.current = false;
          return;
        }
        if (dy < 0) {
          // Swipe up
          if (stepRef.current === STEP_COUNT - 1) {
            // Fix A3/A5: EXIT GLIDE — touch-action:none means native scroll won't fire;
            // instead we programmatically glide the page out of the section.
            // Guard: mark direction non-null so this fires at most once per gesture.
            gestureDirectionRef.current = "up";
            gestureCapturedRef.current = false;
            engagedRef.current = false;           // disengage
            el.style.touchAction = "";            // Fix A5: restore on boundary exit
            dispatchInSection(false);
            window.scrollBy({ top: window.innerHeight * 0.55, behavior: "smooth" });
          } else {
            gestureDirectionRef.current = "up";
            gestureCapturedRef.current = true;
          }
        } else {
          // Swipe down
          if (stepRef.current === 0) {
            // Fix A3/A5: EXIT GLIDE — symmetric for swipe-down at first step.
            gestureDirectionRef.current = "down";
            gestureCapturedRef.current = false;
            engagedRef.current = false;           // disengage
            el.style.touchAction = "";            // Fix A5: restore on boundary exit
            dispatchInSection(false);
            window.scrollBy({ top: -(window.innerHeight * 0.55), behavior: "smooth" });
          } else {
            gestureDirectionRef.current = "down";
            gestureCapturedRef.current = true;
          }
        }
      }

      if (!gestureCapturedRef.current) {
        return;
      }

      e.preventDefault();

      touchLastYRef.current = currentY;
      const currentDy = currentY - touchStartYRef.current;
      const now = Date.now();
      touchSamplesRef.current.push({ y: currentDy, t: now });
      if (touchSamplesRef.current.length > 3) {
        touchSamplesRef.current.shift();
      }

      cardY.set(currentDy);
      cardOpacity.set(Math.max(0, 1 - Math.abs(currentDy) / 260));
    };

    const onTouchEnd = () => {
      if (!gestureCapturedRef.current) return;

      const dy = touchLastYRef.current - touchStartYRef.current;
      const samples = touchSamplesRef.current;
      let v = 0;
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          v = (last.y - first.y) / dt;
        }
      }

      const shouldCommit = (Math.abs(dy) > 60 || Math.abs(v) > 0.5);
      if (shouldCommit) {
        commitCard(dy < 0 ? "up" : "down");
      } else {
        springBack();
      }
    };

    const onTouchCancel = () => {
      if (!gestureCapturedRef.current) return;
      springBack();
    };

    // touchstart must be passive — never preventDefault here
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    // touchmove must be non-passive so we can preventDefault to block native scroll
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      el.style.touchAction = "";            // Fix A6: restore on gesture engine teardown
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
      className="relative bg-[color:var(--canvas)]"
    >
      {/* FULL-WIDTH layout — sticky on desktop, static full-screen on mobile */}
      <div
        ref={stickyRef}
        className={cn(
          !isDesktop
            ? "flex w-full h-[100lvh] overflow-hidden bg-[color:var(--canvas)] items-end"
            : "sticky top-0 flex h-screen w-full overflow-hidden bg-[color:var(--canvas)] lg:items-center lg:pb-0"
        )}
      >
        <div ref={mediaBoxRef} className="relative w-full aspect-square lg:aspect-[1920/1080]">
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

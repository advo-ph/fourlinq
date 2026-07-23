import { useRef, useEffect, useState, useCallback, useMemo } from "react";
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
const SWIPE_THRESHOLD = 48;                 // min vertical travel (px) that counts as a swipe
const STEP_COOLDOWN_MS = 400;               // min gap between accepted steps
const ENGAGE_EPSILON = 2;                   // px tolerance for the pin line

const ScrollWindow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mediaBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const [nearViewport, setNearViewport] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );
  const [activeIndex, setActiveIndex] = useState(-1); // desktop: scroll-driven
  const [step, setStep] = useState(0);                // mobile: swipe-driven (0 = intro)
  const [engaged, setEngaged] = useState(false);      // mobile: section pinned + swipes captured
  const stepRef = useRef(0);
  const engagedRef = useRef(false);
  const [material, setMaterial] = useState<MaterialId>("upvc");
  const [matFade, setMatFade] = useState(true);

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

  // ── Mobile: pin the section when its top crosses the viewport top, then
  // capture swipes as discrete steps. Scrolling down into the section engages
  // at the intro; scrolling up into it from below engages at the last part.
  // A swipe past either end releases the pin and hands scrolling back.
  useEffect(() => {
    if (isDesktop) return;
    const container = containerRef.current;
    if (!container) return;

    let prevTop = container.getBoundingClientRect().top;
    let lastStepAt = 0;
    let wheelAcc = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchActive = false;
    let ignoreGesture = false; // swallow the gesture that caused engagement

    const setEngagedBoth = (v: boolean) => {
      engagedRef.current = v;
      setEngaged(v);
    };
    const setStepBoth = (s: number) => {
      stepRef.current = s;
      setStep(s);
    };

    const snap = () => {
      const top = container.getBoundingClientRect().top;
      if (Math.abs(top) > 1) window.scrollBy(0, top);
    };

    const exit = (dir: 1 | -1) => {
      setEngagedBoth(false);
      // Hand the viewport to the neighboring content — a full viewport down
      // (next section top-aligned) or most of one back up.
      window.scrollBy({
        top: Math.round(window.innerHeight * (dir === 1 ? 1 : -0.9)),
        behavior: "smooth",
      });
    };

    const stepBy = (dir: 1 | -1, now: number) => {
      if (now - lastStepAt < STEP_COOLDOWN_MS) return;
      lastStepAt = now;
      const next = stepRef.current + dir;
      if (next < 0) { exit(-1); return; }
      if (next > STEP_COUNT - 1) { exit(1); return; }
      setStepBoth(next);
    };

    const onScroll = () => {
      const top = container.getBoundingClientRect().top;
      if (engagedRef.current) {
        // Programmatic jumps (anchor nav, scroll-to-top) release the pin
        // instead of fighting it.
        if (Math.abs(top) > window.innerHeight) {
          setEngagedBoth(false);
          prevTop = top;
          return;
        }
        // Clamp leftover fling momentum so the section stays pinned.
        if (Math.abs(top) > 1) window.scrollBy(0, top);
        prevTop = 0;
        return;
      }
      const crossedDown = prevTop > ENGAGE_EPSILON && top <= ENGAGE_EPSILON;
      const crossedUp = prevTop < -ENGAGE_EPSILON && top >= -ENGAGE_EPSILON;
      if (crossedDown || crossedUp) {
        setStepBoth(crossedDown ? 0 : STEP_COUNT - 1);
        setEngagedBoth(true);
        lastStepAt = performance.now(); // the engaging gesture doesn't also step
        if (touchActive) ignoreGesture = true;
        snap();
        prevTop = 0;
        return;
      }
      prevTop = top;
    };

    const onTouchStart = (e: TouchEvent) => {
      touchActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (engagedRef.current && e.cancelable) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchActive) return;
      touchActive = false;
      if (ignoreGesture) { ignoreGesture = false; return; }
      if (!engagedRef.current) return;
      const t = e.changedTouches[0];
      const dy = touchStartY - t.clientY;
      const dx = touchStartX - t.clientX;
      if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) <= Math.abs(dx)) return;
      stepBy(dy > 0 ? 1 : -1, performance.now());
    };

    // Wheel/trackpad parity so narrow desktop windows behave like touch.
    const onWheel = (e: WheelEvent) => {
      if (!engagedRef.current) return;
      e.preventDefault();
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) >= 60) {
        const dir = wheelAcc > 0 ? 1 : -1;
        wheelAcc = 0;
        stepBy(dir, performance.now());
      }
    };

    const onResize = () => {
      if (engagedRef.current) snap();
    };

    // Touch/wheel listeners live on window, not the container — fixed overlays
    // outside the section (e.g. the cookie banner) would otherwise swallow
    // swipes that start on them. While engaged the section owns the viewport,
    // and taps (not swipes) on such overlays still work normally.
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      setEngagedBoth(false);
    };
  }, [isDesktop]);

  // Mobile: header hides while the section is pinned.
  useEffect(() => {
    if (isDesktop) return;
    window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: engaged }));
    return () => { window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: false })); };
  }, [engaged, isDesktop]);

  // Which part is highlighted — scroll-driven on desktop, swipe-driven on mobile.
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

  // Mobile step transition: the leaving text fades toward where it "went"
  // (up when advancing, down when going back) and the entering text fades in
  // at the same position, slightly delayed so out reads before in.
  const stepClass = (i: number) =>
    cn(
      "absolute inset-x-0 top-0 px-6 pt-[12vh] transition-[opacity,transform] duration-[420ms] ease-out",
      i === step
        ? "pointer-events-auto translate-y-0 opacity-100 delay-200"
        : cn("opacity-0", i < step ? "-translate-y-6" : "translate-y-6"),
    );

  return (
    <div ref={containerRef} className="relative bg-[color:var(--canvas)]">
      {/* FULL-WIDTH pinned media */}
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen w-full items-end pb-[6vh] overflow-hidden bg-[color:var(--canvas)] lg:items-center lg:pb-0"
        style={!isDesktop ? { height: "100dvh", touchAction: engaged ? "none" : undefined } : undefined}
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

        {/* MOBILE swipe-step texts — all stacked at the same position over the
            pinned media; swipes swap them with fade-up / fade-down. */}
        {!isDesktop && (
          <div className="pointer-events-none absolute inset-0 z-10">
            {/* Step 0 — section title + Part 0 intro */}
            <div className={stepClass(0)} aria-hidden={step !== 0}>
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
            </div>
            {/* Steps 1..N — one per part */}
            {WINDOW_PARTS.map((part, i) => (
              <div key={part.id} className={stepClass(i + 1)} aria-hidden={step !== i + 1}>
                <div className="max-w-[24rem]">
                  <PartBody
                    part={part}
                    activeMaterial={activeMaterial}
                    material={material}
                    onMaterial={handleMaterial}
                    toggleEnabled={thermalSettled}
                  />
                </div>
              </div>
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

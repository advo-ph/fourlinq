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
} from "@/data/scroll-window-phases";
import MaterialToggle from "./ThermalSystemToggle";
import PhaseCalloutLines from "./PhaseCalloutLines";
import PhaseCalloutMarkers from "./PhaseCalloutMarkers";

const THERMAL_INDEX = WINDOW_PARTS.findIndex((p) => p.id === THERMAL_PART_ID);
const POSTER = FRAME_PATH_TEMPLATE.replace("{index}", "0001");
const ALU_IMAGE = WINDOW_MATERIALS.find((m) => m.id === "alu")?.image ?? "";

// ── Scroll layout ──────────────────────────────────────────
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

const ScrollWindow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mediaBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const [nearViewport, setNearViewport] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
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

  // Connector lines only in the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Active part = the last part whose text has scrolled up to the activation
  // line. Before the first part reaches it (the Part-0 run-in) and if you scroll
  // back above it, activeIndex is -1 → the animation rests on frame 1, no
  // highlight.
  useEffect(() => {
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
  }, []);

  const { images, progress, isLoaded } = useFramePreloader(
    TOTAL_FRAMES,
    FRAME_PATH_TEMPLATE,
    { enabled: nearViewport, padLength: FRAME_PAD_LENGTH },
  );

  const { displayedFrame, settled } = useSegmentedFrames({
    activeIndex,
    parts: WINDOW_PARTS,
    enabled: isLoaded,
  });

  const thermalActive = activeIndex === THERMAL_INDEX;
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
    <div ref={containerRef} className="relative bg-[color:var(--canvas)]">
      {/* FULL-WIDTH pinned media */}
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen w-full items-center overflow-hidden bg-[color:var(--canvas)]"
      >
        <div ref={mediaBoxRef} className="relative w-full aspect-[1920/1080]">
          {/* Instant poster */}
          <img
            src={POSTER}
            alt=""
            aria-hidden="true"
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
              isLoaded ? "opacity-0" : "opacity-100",
            )}
          />
          {/* Animated frame canvas */}
          <canvas
            ref={canvasRef}
            className={cn(
              "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
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
                "pointer-events-none absolute inset-0 h-full w-full object-contain",
                matFade ? "transition-opacity duration-500 ease-out" : "transition-none",
                thermalSettled && material === "alu" ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          {/* Part-2 numbered pins — the mobile stand-in for the connector lines */}
          <PhaseCalloutMarkers callouts={activeMaterial.callouts} active={thermalSettled} />
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
      </div>

      {/* NORMAL-FLOW text — scrolls over the pinned media */}
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
        {WINDOW_PARTS.map((part, i) => {
          const isThermal = part.id === THERMAL_PART_ID;
          return (
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
                            ref={(el) => { itemRefs.current[ci] = el; }}
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
                          onChange={handleMaterial}
                          disabled={!thermalSettled}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* Trailing settle room so Part 3 stays pinned while centered */}
        <div aria-hidden="true" style={{ height: `${TRAILING_VH}vh` }} />
      </div>
    </div>
  );
};

export default ScrollWindow;

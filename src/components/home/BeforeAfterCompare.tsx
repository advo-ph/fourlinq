import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";

/**
 * Before/after wipe — drag the handle to trade one photograph for the other.
 *
 * ASSET NOTE (2026-09-02). The repository holds no during-construction
 * photography; every FourlinQ project shot on file is of a completed install.
 * The pair below is therefore the honest closest thing: a real handover-stage
 * room (systems in, nothing else) against a real finished interior. They are
 * two different houses, so the copy claims only "the same systems", never the
 * same building. When the client supplies a true matched pair, replace the two
 * files in `public/images/compare/` — same names, same 16:9 crop — and nothing
 * else here needs to change. `/images/` is served with a 5-minute TTL
 * (server/index.ts), so a swap reaches visitors on their next load.
 */
const BEFORE = {
  src: "/images/compare/turnover-bare.webp",
  label: "On turnover",
  alt: "Bare room on handover day, with FourlinQ black aluminium sliding doors and windows already installed",
};

const AFTER = {
  src: "/images/compare/turnover-finished.webp",
  label: "Lived in",
  alt: "Finished living room with full-height FourlinQ glazing opening onto a pool",
};

/**
 * The attract sequence. Overshoot right, overshoot left, settle — enough travel
 * to read as "this moves" without looking like a glitch. Played once when the
 * module first enters view, then once more after a pause if the visitor still
 * hasn't touched it. It never runs again after that, and never runs at all
 * under prefers-reduced-motion.
 */
const NUDGE_STEPS = [50, 61, 41, 52, 50];
const NUDGE_STEP_MS = 380;
const NUDGE_REPEAT_DELAY_MS = 4200;
const NUDGE_MAX_PLAYS = 2;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Overlay chip. Deliberately not the shared `.eyebrow` class: that is 14px with
 * 0.14em tracking, which wraps to two lines inside a 390px-wide frame and tears
 * the pill background. These sit on top of photography, so they get their own
 * smaller, no-wrap scale.
 */
const CHIP =
  "pointer-events-none absolute bg-black/50 px-2.5 py-1 font-sans text-[0.625rem] font-medium uppercase tracking-[0.14em] text-white/90 whitespace-nowrap backdrop-blur-sm md:px-3 md:py-1.5 md:text-[0.75rem]";

const clamp = (value: number) => Math.min(100, Math.max(0, value));

const BeforeAfterCompare = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const [position, setPosition] = useState(50);
  // Eased while the handle moves on its own, off while a finger or cursor is
  // driving it — a transition during a drag feels like lag.
  const [eased, setEased] = useState(true);
  const [engaged, setEngaged] = useState(false);

  const stopNudging = useCallback(() => setEngaged(true), []);

  const setFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    stopNudging();
    setEased(false);
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromClientX(event.clientX);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setEased(true);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    let next: number | null = null;

    if (event.key === "ArrowLeft") next = position - step;
    else if (event.key === "ArrowRight") next = position + step;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;

    if (next === null) return;
    event.preventDefault();
    stopNudging();
    setEased(true);
    setPosition(clamp(next));
  };

  // Attract loop. Bails out entirely for reduced-motion users, and unsubscribes
  // the observer as soon as it has fired once so a scroll-past-and-back doesn't
  // restart the sequence.
  useEffect(() => {
    if (prefersReducedMotion || engaged) return;
    const frame = frameRef.current;
    if (!frame) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let plays = 0;

    const play = () => {
      NUDGE_STEPS.forEach((value, index) => {
        timers.push(
          setTimeout(() => {
            // A drag that started mid-sequence must win.
            if (draggingRef.current) return;
            setEased(true);
            setPosition(value);
          }, index * NUDGE_STEP_MS),
        );
      });

      plays += 1;
      if (plays < NUDGE_MAX_PLAYS) {
        timers.push(
          setTimeout(play, NUDGE_STEPS.length * NUDGE_STEP_MS + NUDGE_REPEAT_DELAY_MS),
        );
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timers.push(setTimeout(play, 500));
      },
      { threshold: 0.45 },
    );

    observer.observe(frame);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [prefersReducedMotion, engaged]);

  const motionStyle = eased ? { transition: `clip-path 420ms ${EASE}` } : { transition: "none" };
  const handleMotionStyle = eased ? { transition: `left 420ms ${EASE}` } : { transition: "none" };

  return (
    <Section tone="canvas" size="lg">
      <EyebrowHeading
        level={2}
        eyebrow="Before and after"
        lede="Drag the handle. On the left, a FourlinQ install on handover day — frames set, glass in, the room still bare. On the right, a finished home carrying the same systems."
      >
        The part you keep looking at.
      </EyebrowHeading>

      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative mt-12 aspect-video w-full cursor-ew-resize select-none overflow-hidden bg-[#0a0a0a] lg:mt-16"
        // pan-y keeps vertical page scrolling with the browser while horizontal
        // drags still reach the pointer handlers.
        style={{ touchAction: "pan-y" }}
      >
        {/* Finished state is the base layer; the handover state is wiped over it. */}
        <img
          src={AFTER.src}
          alt={AFTER.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        {/* Clipping the wrapper (not resizing the image) keeps both photographs
            on exactly the same geometry, so the seam never shifts. */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)`, ...motionStyle }}
        >
          <img
            src={BEFORE.src}
            alt={BEFORE.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Corner labels. Each dims when its own side is mostly wiped away. */}
        <span
          className={`${CHIP} left-3 top-3 md:left-6 md:top-6`}
          style={{ opacity: position < 18 ? 0 : 1, transition: "opacity 300ms ease" }}
        >
          {BEFORE.label}
        </span>
        <span
          className={`${CHIP} right-3 top-3 md:right-6 md:top-6`}
          style={{ opacity: position > 82 ? 0 : 1, transition: "opacity 300ms ease" }}
        >
          {AFTER.label}
        </span>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare handover and finished states"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% handover, ${100 - Math.round(position)}% finished`}
          onKeyDown={handleKeyDown}
          onFocus={stopNudging}
          className="group absolute inset-y-0 z-10 w-12 -translate-x-1/2 cursor-ew-resize focus:outline-none"
          style={{ left: `${position}%`, ...handleMotionStyle }}
        >
          <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.45)]" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-brand-500 group-focus-visible:ring-offset-2 md:h-12 md:w-12">
            {/* Two chevrons pointing outward — the universal "pull me apart" mark. */}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.5 6.5 5 12l4.5 5.5" />
              <path d="M14.5 6.5 19 12l-4.5 5.5" />
            </svg>
          </span>
        </div>

        {/* Text prompt for anyone who reads before they touch. Retires for good
            on first interaction. */}
        <span
          className={`${CHIP} bottom-3 left-1/2 -translate-x-1/2 md:bottom-6`}
          style={{ opacity: engaged ? 0 : 1, transition: "opacity 400ms ease" }}
        >
          Drag to compare
        </span>
      </div>
    </Section>
  );
};

export default BeforeAfterCompare;

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";

/**
 * Before/after wipe. On a mouse the seam simply follows the cursor; on touch it
 * is dragged.
 *
 * ASSET NOTE (2026-09-03). A true matched pair: the same room photographed
 * before and after, so the seam lines up on the same walls and openings. To
 * swap them, replace the two files in `public/images/compare/` — same names,
 * same 1536x864 crop — and nothing else here needs to change. `/images/` is
 * served with a 5-minute TTL (server/index.ts), so a swap reaches visitors on
 * their next load.
 */
const BEFORE = {
  src: "/images/compare/turnover-bare.webp",
  alt: "The same room mid-build: scaffolding outside, bare openings, dust on the floor",
};

const AFTER = {
  src: "/images/compare/turnover-finished.webp",
  alt: "The finished room with FourlinQ black aluminium sliding doors and windows fitted",
};

/**
 * MOTION MODEL
 *
 * Every movement is driven by one requestAnimationFrame loop that writes
 * `clip-path` and `left` straight to the DOM. Nothing about the seam's position
 * lives in React state.
 *
 * That is deliberate, and it is what fixes the two faults in the first version:
 *
 *   1. Jank. The attract nudge used to setState to five fixed stops, each
 *      starting a 420ms CSS transition, while the stops fired every 380ms. Every
 *      transition was cut off mid-flight and restarted from wherever it had got
 *      to, which is exactly what "jonky" looked like. The nudge is now a
 *      continuous decaying sine wave sampled per frame, so there is no
 *      transition to interrupt.
 *   2. Touch lag. A setState per pointermove meant a full React render (and a
 *      re-render of both <img> subtrees) between the finger moving and the seam
 *      moving. Writing to the node directly removes that entirely.
 *
 * `posRef` is where the seam is drawn; `targetRef` is where it wants to be. The
 * loop eases the first toward the second, except while dragging, where it snaps
 * so the seam stays locked to the finger.
 */
const CENTRE = 50;

/** Attract nudge: a decaying sine. The sin(pi*t) envelope is zero at both ends,
 *  so the wobble grows in and settles out without any visible start or stop. */
const NUDGE_DURATION_MS = 2400;
const NUDGE_AMPLITUDE = 15;
const NUDGE_CYCLES = 1.25;
const NUDGE_START_DELAY_MS = 450;
const NUDGE_REPEAT_DELAY_MS = 3800;
const NUDGE_MAX_PLAYS = 2;

/** Fraction of the remaining distance closed per 60fps frame when easing. Kept
 *  frame-rate independent below, so a 120Hz display eases at the same speed. */
const FOLLOW_SMOOTHING = 0.2;
/** Used once the cursor has left: the seam settles on the last place it was put
 *  rather than travelling anywhere new, so this only ever closes a tiny gap. */
const SETTLE_SMOOTHING = 0.11;
const REFERENCE_FRAME_MS = 1000 / 60;

/** Below this gap the seam is close enough to snap and stop the loop. */
const SETTLE_EPSILON = 0.02;

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/** Sentinel for "begin the nudge on the next frame", so its phase starts at
 *  exactly t=0 rather than at whatever fraction the scheduling frame landed on. */
const NUDGE_PENDING = -1;

const BeforeAfterCompare = () => {
  const prefersReducedMotion = useReducedMotion();

  const frameRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const posRef = useRef(CENTRE);
  const targetRef = useRef(CENTRE);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const ariaRef = useRef(CENTRE);

  const draggingRef = useRef(false);
  const hoveringRef = useRef(false);
  const nudgeStartRef = useRef<number | null>(null);
  const nudgePlaysRef = useRef(0);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const engagedRef = useRef(false);
  // tick() must be able to restart the loop when a replay timer fires, but
  // ensureLoop is defined after tick. This ref breaks the cycle without making
  // the two callbacks mutually dependent.
  const ensureLoopRef = useRef<() => void>(() => {});

  /** Write one frame. No React involved. */
  const paint = useCallback((value: number) => {
    if (wipeRef.current) {
      wipeRef.current.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    }
    if (handleRef.current) {
      handleRef.current.style.left = `${value}%`;
    }
    // Announce whole percentages only, so assistive tech isn't told about
    // every sub-pixel frame of a 60fps sweep.
    const rounded = Math.round(value);
    if (rounded !== ariaRef.current && handleRef.current) {
      ariaRef.current = rounded;
      handleRef.current.setAttribute("aria-valuenow", String(rounded));
      handleRef.current.setAttribute(
        "aria-valuetext",
        `${rounded}% handover, ${100 - rounded}% finished`,
      );
    }
  }, []);

  const tick = useCallback(
    (ts: number) => {
      // Clamped so a backgrounded tab returning doesn't jump the seam.
      const dt = Math.min(64, ts - (lastTsRef.current ?? ts));
      lastTsRef.current = ts;

      // Stamp a pending nudge to this frame's clock.
      if (nudgeStartRef.current === NUDGE_PENDING) nudgeStartRef.current = ts;

      const nudgeStart = nudgeStartRef.current;
      if (nudgeStart !== null) {
        const t = (ts - nudgeStart) / NUDGE_DURATION_MS;
        if (t >= 1) {
          nudgeStartRef.current = null;
          targetRef.current = CENTRE;
          if (nudgePlaysRef.current < NUDGE_MAX_PLAYS && !engagedRef.current) {
            nudgeTimerRef.current = setTimeout(() => {
              if (engagedRef.current) return;
              nudgePlaysRef.current += 1;
              nudgeStartRef.current = NUDGE_PENDING;
              ensureLoopRef.current();
            }, NUDGE_REPEAT_DELAY_MS);
          }
        } else {
          targetRef.current =
            CENTRE +
            NUDGE_AMPLITUDE * Math.sin(Math.PI * t) * Math.sin(2 * Math.PI * NUDGE_CYCLES * t);
        }
      }

      const target = targetRef.current;
      const pos = posRef.current;

      // A drag tracks 1:1; the nudge curve is already smooth, so it is followed
      // exactly rather than eased twice (which would round off its shape).
      if (draggingRef.current || nudgeStartRef.current !== null) {
        posRef.current = target;
      } else {
        const perFrame = hoveringRef.current ? FOLLOW_SMOOTHING : SETTLE_SMOOTHING;
        const factor = 1 - Math.pow(1 - perFrame, dt / REFERENCE_FRAME_MS);
        posRef.current = pos + (target - pos) * factor;
      }

      paint(posRef.current);

      const busy =
        draggingRef.current || hoveringRef.current || nudgeStartRef.current !== null;
      if (!busy && Math.abs(target - posRef.current) < SETTLE_EPSILON) {
        posRef.current = target;
        paint(target);
        rafRef.current = null;
        lastTsRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [paint],
  );

  const ensureLoop = useCallback(() => {
    if (rafRef.current === null) {
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  ensureLoopRef.current = ensureLoop;

  /** First interaction of any kind cancels the attract nudge for good, so the
   *  seam never fights the person now moving it. Refs only — this component
   *  never re-renders after mount. */
  const engage = useCallback(() => {
    if (engagedRef.current) return;
    engagedRef.current = true;
    nudgeStartRef.current = null;
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
  }, []);

  const targetFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width === 0) return;
    targetRef.current = clamp(((clientX - rect.left) / rect.width) * 100);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // A mouse press is not required — hover already drives the seam — but
    // pressing should still grab it, and on touch this is the only way in.
    engage();
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    targetFromClientX(event.clientX);
    ensureLoop();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      targetFromClientX(event.clientX);
      ensureLoop();
      return;
    }
    // Hover-follow, cursor devices only. A touch "move" without a press never
    // reaches here in practice, and pen/touch are excluded explicitly so a
    // stray hover event can't move the seam on a phone.
    if (event.pointerType !== "mouse") return;
    engage();
    hoveringRef.current = true;
    targetFromClientX(event.clientX);
    ensureLoop();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    ensureLoop();
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) return;
    if (event.pointerType !== "mouse") return;
    // The seam stays exactly where the cursor left it. Snapping back to centre
    // undid whatever the visitor had just lined up to look at, and made the
    // module feel like it was resisting them. `targetRef` is left untouched, so
    // the loop simply settles on the last position and stops.
    hoveringRef.current = false;
    ensureLoop();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    let next: number | null = null;

    if (event.key === "ArrowLeft") next = targetRef.current - step;
    else if (event.key === "ArrowRight") next = targetRef.current + step;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 100;

    if (next === null) return;
    event.preventDefault();
    engage();
    hoveringRef.current = false;
    targetRef.current = clamp(next);
    ensureLoop();
  };

  // Kick the attract sequence once, the first time the module is properly in
  // view. The observer disconnects immediately so scrolling back doesn't replay
  // it. Reduced-motion users get a static seam at centre.
  useEffect(() => {
    if (prefersReducedMotion) return;
    const frame = frameRef.current;
    if (!frame) return;

    let startTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        startTimer = setTimeout(() => {
          if (engagedRef.current) return;
          nudgePlaysRef.current = 1;
          nudgeStartRef.current = NUDGE_PENDING;
          ensureLoop();
        }, NUDGE_START_DELAY_MS);
      },
      { threshold: 0.45 },
    );

    observer.observe(frame);
    return () => {
      observer.disconnect();
      if (startTimer) clearTimeout(startTimer);
    };
  }, [prefersReducedMotion, ensureLoop]);

  // Paint the opening frame, and make sure nothing is left running on unmount.
  useEffect(() => {
    paint(CENTRE);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, [paint]);

  return (
    <Section tone="canvas" size="lg">
      {/* Title only. The photographs carry the point; a lede explaining them
          just delayed people from reaching the thing they came to drag. */}
      <EyebrowHeading level={2}>Compare the before and after</EyebrowHeading>

      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={handlePointerLeave}
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
        <div ref={wipeRef} className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
          <img
            src={BEFORE.src}
            alt={BEFORE.alt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div
          ref={handleRef}
          role="slider"
          tabIndex={0}
          aria-label="Compare handover and finished states"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={50}
          aria-valuetext="50% handover, 50% finished"
          onKeyDown={handleKeyDown}
          onFocus={engage}
          className="group absolute inset-y-0 z-10 w-12 -translate-x-1/2 cursor-ew-resize focus:outline-none"
          style={{ left: "50%" }}
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
      </div>
    </Section>
  );
};

export default BeforeAfterCompare;

import { useEffect, useRef, useState } from "react";
import { getSystemAnimation } from "@/data/systemAnimations";

interface Props {
  /** Product slug — used to look up the frame sequence. */
  productId: string;
  /** Resting image shown when idle. */
  src: string;
  alt: string;
  /** Tailwind classes applied to the resting <img> (object-fit, hover scale, …). */
  imgClassName?: string;
  /**
   * Object-fit/positioning classes for the animation layer. Should match the
   * resting image's fit so the crossfade lines up. Defaults to the card fit.
   */
  animClassName?: string;
  /**
   * How playback is triggered:
   * - "hover" (default): plays forward on pointer-enter, reverses on leave.
   * - "click": first press plays forward, next press reverses (toggle).
   */
  trigger?: "hover" | "click";
  /**
   * Mobile only. Fires a one-shot play-forward → hold → reverse sequence when
   * ≥50% of the element scrolls into view. No-op on desktop (canHover) or when
   * prefers-reduced-motion: reduce is set. Fires at most once per mount.
   */
  autoPlayInView?: boolean;
  /**
   * Mobile only. Fires a one-shot play-forward → hold → reverse sequence 400 ms
   * after mount (matching the drawer slide-in duration). No-op on desktop or
   * when prefers-reduced-motion: reduce is set. Fires at most once per mount.
   */
  autoPlayOnMount?: boolean;
}

/** Open animation duration (closed → open). */
const FORWARD_MS = 600;
/** Close animation duration (open → closed) — snappier on the way back. */
const REVERSE_MS = 440;

/**
 * Media that plays a system's "opening" frame animation and reverses it.
 * Falls back to a plain static <img> for systems with no animation. Frames are
 * preloaded + decoded when the element nears the viewport so the first play is
 * lag-free, and run via requestAnimationFrame so playback stays smooth and
 * interruptible mid-flight.
 */
export default function SystemCardMedia({
  productId,
  src,
  alt,
  imgClassName = "",
  animClassName = "w-full h-full object-cover",
  trigger = "hover",
  autoPlayInView = false,
  autoPlayOnMount = false,
}: Props) {
  const anim = getSystemAnimation(productId);

  if (!anim) {
    return <img src={src} alt={alt} loading="lazy" decoding="async" className={imgClassName} />;
  }

  return (
    <AnimatedMedia
      frames={anim.frames}
      src={src}
      alt={alt}
      imgClassName={imgClassName}
      animClassName={animClassName}
      trigger={trigger}
      autoPlayInView={autoPlayInView}
      autoPlayOnMount={autoPlayOnMount}
    />
  );
}

function AnimatedMedia({
  frames,
  src,
  alt,
  imgClassName,
  animClassName,
  trigger,
  autoPlayInView,
  autoPlayOnMount,
}: {
  frames: string[];
  src: string;
  alt: string;
  imgClassName: string;
  animClassName: string;
  trigger: "hover" | "click";
  autoPlayInView: boolean;
  autoPlayOnMount: boolean;
}) {
  const N = frames.length;

  // Only wire the hover animation on devices that actually hover (fine pointer).
  // On touch screens, "pointer-enter" fires on tap and would play the animation
  // instead of letting the press fall through to the card's open-drawer click —
  // which read as a flicker that never opened the drawer. Binding nothing here
  // lets the tap bubble straight to the button.
  const canHover =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  const wrapRef = useRef<HTMLDivElement>(null);
  const animImgRef = useRef<HTMLImageElement>(null);
  const idxRef = useRef(0); // current frame index (float, eased by rAF)
  const dirRef = useRef(0); // -1 closing | 0 idle | 1 opening
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  // warmStartedRef: set at the TOP of warm() to prevent double-warming.
  // warmedRef: set at the END of warm() once all frames have decoded and are ready to play.
  const warmStartedRef = useRef(false);
  const warmedRef = useRef(false);
  // Retained, decoded frame <img> objects. Holding references keeps them in the
  // browser's in-memory cache for the component's lifetime, so playback never
  // re-fetches a frame. Without this, the warmed images are GC-eligible and the
  // HTTP cache gets evicted under memory pressure (e.g. while screen-recording),
  // causing mid-animation frame requests to fail (net::ERR_INSUFFICIENT_RESOURCES)
  // and the animation to collapse to just its first and last frame.
  const framesImgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const openRef = useRef(false); // toggle state for click trigger
  const playOnceCalledRef = useRef(false); // prevents double-fire between mount + in-view triggers
  const playOncePendingRef = useRef(false); // prevents two triggers from both starting polls simultaneously
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // warmFnRef: lets effects beyond the preload observer call warm() directly.
  const warmFnRef = useRef<(() => void) | null>(null);
  // revealedRef: kept in sync with `revealed` state so closures scheduled via
  // setTimeout (e.g. the playReverse call in playOnce) see the current value
  // rather than the stale value captured at the time they were created.
  const revealedRef = useRef(false);
  // lastShownRef: tracks the last frame index written to animImgRef so showFrame
  // can bail out early when the rounded index hasn't changed between rAF ticks,
  // avoiding redundant src writes that force unnecessary decode/paint work.
  const lastShownRef = useRef(-1);
  const [revealed, setRevealed] = useState(false); // top layer opacity

  // Preload + decode this element's frames once it nears the viewport, so the
  // first play is lag-free. Decoding uses bounded parallelism (6 concurrent
  // workers pulling from a shared index cursor) to avoid serialising 28 network
  // round trips on mobile while still keeping the main thread responsive.
  // Effect is declared first so warmFnRef is assigned before the autoPlayOnMount
  // effect runs (effects execute in declaration order).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;

    const warm = async () => {
      if (cancelled || warmStartedRef.current) return;
      warmStartedRef.current = true; // guard against double-warming

      const CONCURRENCY = 6;
      let cursor = 0; // shared index — workers race to claim the next frame

      const worker = async () => {
        while (true) {
          if (cancelled) return;
          const i = cursor++;
          if (i >= frames.length) return;
          const img = new Image();
          img.decoding = "async";
          img.src = frames[i];
          // Retain the element so the decoded frame stays resident — this is what
          // keeps playback from re-fetching (and failing) under memory pressure.
          framesImgsRef.current[i] = img;
          try {
            await img.decode();
          } catch {
            /* decode can reject if interrupted — the retained <img> stays cached */
          }
        }
      };

      // Launch up to CONCURRENCY workers in parallel; all share `cursor`.
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, frames.length) }, worker),
      );

      if (!cancelled) {
        warmedRef.current = true; // frames are ready; playOnce poll can proceed
      }
    };

    // Store warm so autoPlayOnMount effect can call it without waiting for IO.
    warmFnRef.current = warm;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          warm();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [frames]);

  const showFrame = (i: number) => {
    // Skip the write when the rounded index hasn't changed — avoids redundant
    // src assignments that force unnecessary decode/paint work at 60 fps.
    if (i === lastShownRef.current) return;
    const img = animImgRef.current;
    if (!img) return;
    lastShownRef.current = i;
    // Prefer the retained, already-decoded frame's URL so the swap resolves from
    // the in-memory cache instead of issuing a fresh (evictable, failable) fetch.
    img.src = framesImgsRef.current[i]?.src ?? frames[i];
  };

  const tick = (ts: number) => {
    const dt = ts - (lastTsRef.current || ts);
    lastTsRef.current = ts;

    const dir = dirRef.current;
    if (dir === 0) {
      rafRef.current = null;
      return;
    }

    const stepMs = (dir > 0 ? FORWARD_MS : REVERSE_MS) / (N - 1);
    idxRef.current += dir * (dt / stepMs);

    if (dir > 0 && idxRef.current >= N - 1) {
      idxRef.current = N - 1;
      showFrame(N - 1);
      dirRef.current = 0; // hold open, stop the loop
      rafRef.current = null;
      return;
    }
    if (dir < 0 && idxRef.current <= 0) {
      idxRef.current = 0;
      showFrame(0);
      dirRef.current = 0;
      rafRef.current = null;
      revealedRef.current = false; // sync ref before state update
      setRevealed(false); // crossfade back to the resting image
      return;
    }

    showFrame(Math.round(idxRef.current));
    rafRef.current = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (rafRef.current == null) {
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const playForward = () => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Reset lastShownRef so a re-play always repaints from the current position.
    lastShownRef.current = -1;
    showFrame(Math.round(idxRef.current));
    revealedRef.current = true; // sync ref before state update
    setRevealed(true);
    dirRef.current = 1;
    startLoop();
  };

  const playReverse = () => {
    // Guard on the ref rather than the `revealed` state value — the ref is
    // always current even inside a stale setTimeout closure, whereas the state
    // value captured at scheduling time would have been false (pre-forward-play).
    if (!revealedRef.current) return;
    dirRef.current = -1;
    startLoop();
  };

  // One-shot mobile auto-play: forward → hold ~300 ms → reverse.
  // Guards: desktop (canHover), reduced-motion, and double-fire (playOnceCalledRef).
  const playOnce = () => {
    if (canHover) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (playOnceCalledRef.current) return;
    // Prevent two simultaneous triggers (mount + in-view) from both starting polls.
    if (playOncePendingRef.current) return;
    playOncePendingRef.current = true;

    const run = () => {
      // Mark the one-shot consumed here (inside run) so a timed-out poll does
      // NOT burn the one-shot — a slow network may just need more time.
      playOnceCalledRef.current = true;
      playOncePendingRef.current = false;
      playForward();
      holdTimerRef.current = setTimeout(() => {
        playReverse();
      }, FORWARD_MS + 300);
    };

    if (warmedRef.current) {
      run();
    } else {
      // Frames haven't decoded yet — poll until ready (max 5 s / 100 attempts).
      // 100 attempts at 50 ms = 5 s budget; slow mobile networks need the time.
      let attempts = 0;
      readyPollRef.current = setInterval(() => {
        attempts++;
        if (warmedRef.current) {
          if (readyPollRef.current != null) clearInterval(readyPollRef.current);
          readyPollRef.current = null;
          run();
        } else if (attempts >= 100) {
          if (readyPollRef.current != null) clearInterval(readyPollRef.current);
          readyPollRef.current = null;
          playOncePendingRef.current = false;
          // Frames didn't finish in time — play anyway as a best-effort fallback
          // so the user sees something rather than nothing.
          run();
        }
      }, 50);
    }
  };

  // Hover trigger
  const handleEnter = () => {
    openRef.current = true;
    playForward();
  };
  const handleLeave = () => {
    openRef.current = false;
    playReverse();
  };

  // Click trigger — press toggles between opening and closing.
  const handleToggle = () => {
    if (openRef.current) {
      openRef.current = false;
      playReverse();
    } else {
      openRef.current = true;
      playForward();
    }
  };

  // Auto-play when the card scrolls ≥50% into view (mobile only, fires once).
  useEffect(() => {
    if (!autoPlayInView || canHover) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          playOnce();
        }
      },
      { threshold: 0.5, rootMargin: "0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayInView]);

  // Auto-play 400 ms after mount — used by drawers whose slide-in is 400 ms (mobile only).
  // Calls warm() directly (via warmFnRef) without waiting for the IntersectionObserver,
  // because the drawer panel slides in over 400 ms and the observer may not report
  // intersecting in time for frames to be ready when playOnce polls.
  useEffect(() => {
    if (!autoPlayOnMount || canHover) return;
    // Kick off warm immediately so frames decode in parallel with the drawer slide-in.
    warmFnRef.current?.();
    const id = setTimeout(() => {
      playOnce();
    }, 400);
    return () => {
      clearTimeout(id);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayOnMount]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (holdTimerRef.current != null) clearTimeout(holdTimerRef.current);
      if (readyPollRef.current != null) clearInterval(readyPollRef.current);
      // Release retained frames so a long-lived list of cards doesn't pin
      // decoded image memory after the card unmounts.
      framesImgsRef.current = [];
    },
    [],
  );

  const interaction =
    trigger === "click"
      ? {
          onClick: handleToggle,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          },
          role: "button",
          tabIndex: 0,
          "aria-label": `Play ${alt} opening animation`,
        }
      : canHover
        ? { onPointerEnter: handleEnter, onPointerLeave: handleLeave }
        : {};

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-full ${trigger === "click" ? "cursor-pointer select-none" : ""}`}
      {...interaction}
    >
      <img src={src} alt={alt} loading="lazy" decoding="async" className={imgClassName} />
      <img
        ref={animImgRef}
        src={frames[0]}
        alt=""
        aria-hidden="true"
        decoding="async"
        className={`absolute inset-0 ${animClassName} transition-opacity duration-150 ease-out ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

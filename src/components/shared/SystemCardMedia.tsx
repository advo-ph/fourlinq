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
}: {
  frames: string[];
  src: string;
  alt: string;
  imgClassName: string;
  animClassName: string;
  trigger: "hover" | "click";
}) {
  const N = frames.length;
  const wrapRef = useRef<HTMLDivElement>(null);
  const animImgRef = useRef<HTMLImageElement>(null);
  const idxRef = useRef(0); // current frame index (float, eased by rAF)
  const dirRef = useRef(0); // -1 closing | 0 idle | 1 opening
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const preloadedRef = useRef(false);
  const openRef = useRef(false); // toggle state for click trigger
  const [revealed, setRevealed] = useState(false); // top layer opacity

  // Preload + decode this element's frames once it nears the viewport, so the
  // first play is lag-free. Decoding sequentially keeps the main thread
  // responsive and avoids janking the animation.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;
    const warm = async () => {
      if (cancelled || preloadedRef.current) return;
      preloadedRef.current = true;
      for (const f of frames) {
        if (cancelled) return;
        const img = new Image();
        img.decoding = "async";
        img.src = f;
        try {
          await img.decode();
        } catch {
          /* decode can reject if interrupted — the HTTP fetch is still cached */
        }
      }
    };
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
    const img = animImgRef.current;
    if (img) img.src = frames[i];
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
    showFrame(Math.round(idxRef.current));
    setRevealed(true);
    dirRef.current = 1;
    startLoop();
  };

  const playReverse = () => {
    if (!revealed) return;
    dirRef.current = -1;
    startLoop();
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

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
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
      : { onPointerEnter: handleEnter, onPointerLeave: handleLeave };

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

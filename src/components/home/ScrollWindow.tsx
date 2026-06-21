import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { useScrollFrames } from "@/hooks/useScrollFrames";
import {
  SCROLL_PHASES,
  TOTAL_FRAMES,
  FRAME_PATH_TEMPLATE,
  FRAME_PAD_LENGTH,
  type ScrollPhase,
} from "@/data/scroll-window-phases";

// ── PhaseText ──────────────────────────────────────────────
// Opacity and Y position are purely scroll-driven.
// If you stop scrolling, the text freezes exactly where it is.

interface PhaseTextProps {
  phase: ScrollPhase;
  isActive: boolean;
  /** 0–1 scroll progress within this phase's scroll zone */
  progress: number;
}

const FADE_IN_END = 0.15;
const FADE_OUT_START = 0.85;
const Y_BOTTOM = 60;   // px — text starts here at phase start
const Y_TOP = -60;     // px — text ends here at phase end

const PhaseText = ({ phase, isActive, progress }: PhaseTextProps) => {
  if (!phase.text) return null;

  // Y moves linearly from bottom bound to top bound across the entire phase
  const translateY = isActive
    ? Y_BOTTOM + (Y_TOP - Y_BOTTOM) * progress
    : Y_BOTTOM;

  // Opacity fades in at start, holds, fades out at end
  let opacity: number;
  if (!isActive) {
    opacity = 0;
  } else if (progress < FADE_IN_END) {
    opacity = progress / FADE_IN_END;
  } else if (progress > FADE_OUT_START) {
    opacity = (1 - progress) / (1 - FADE_OUT_START);
  } else {
    opacity = 1;
  }

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        willChange: "opacity, transform",
      }}
      className={cn(
        "absolute inset-0 flex items-end pb-10 lg:items-center lg:pb-0",
        opacity === 0 && "pointer-events-none"
      )}
    >
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="max-w-[26rem] mx-auto lg:mx-0 text-center lg:text-left">
          <p className="eyebrow !text-[color:var(--ink-muted)] mb-3 lg:mb-4">{phase.text.eyebrow}</p>
          <h3 className="font-serif text-[1.5rem] md:text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.15] mb-3 lg:mb-5">
            {phase.text.headline}
          </h3>
          <p className="text-body-sm lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.55]">
            {phase.text.body}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── ScrollWindow ───────────────────────────────────────────

const SCROLL_HEIGHT_VH = 500;

const ScrollWindow = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { images, progress, isLoaded } = useFramePreloader(
    TOTAL_FRAMES,
    FRAME_PATH_TEMPLATE,
    { enabled: nearViewport, padLength: FRAME_PAD_LENGTH },
  );

  const { displayedFrame, scrollPhaseId, scrollPhaseProgress } = useScrollFrames({
    containerRef,
    totalFrames: TOTAL_FRAMES,
    phases: SCROLL_PHASES,
    enabled: isLoaded,
  });

  // Draw frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prefer the requested frame; fall back to nearest buffered frame so the
    // canvas stays painted even while later frames are still streaming in.
    let img = images[displayedFrame];
    if (!img || !img.naturalWidth) {
      for (let offset = 1; offset < images.length; offset++) {
        const before = images[displayedFrame - offset];
        if (before?.naturalWidth) { img = before; break; }
        const after = images[displayedFrame + offset];
        if (after?.naturalWidth) { img = after; break; }
      }
    }
    if (!img || !img.naturalWidth) return;

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.drawImage(img, 0, 0);
  }, [displayedFrame, images, isLoaded]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[color:var(--canvas)]"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[color:var(--canvas)]">
        {/* Loading state */}
        {!isLoaded && nearViewport && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-48 h-[2px] bg-[color:var(--rule-soft)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[color:var(--ink-muted)] transition-[width] duration-200"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="mt-4 eyebrow text-[color:var(--ink-faint)]">Loading</p>
            </div>
          </div>
        )}

        {/* Instant poster — first frame painted by the browser before the
            JS preloader has a chance to start. Eliminates the blank hero.
            Mobile: top half (~55vh, object-contain so the full frame shows
            above the text). Desktop: full-bleed cover behind centered text. */}
        <img
          src={FRAME_PATH_TEMPLATE.replace("{index}", "0001")}
          alt=""
          decoding="async"
          aria-hidden="true"
          className={cn(
            "absolute left-0 right-0 top-0 h-[55vh] w-full object-contain",
            "lg:inset-0 lg:h-full lg:object-cover",
            "transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100",
          )}
        />

        {/* Canvas for frame rendering. Same responsive sizing as the poster. */}
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute left-0 right-0 top-0 h-[55vh] w-full object-contain",
            "lg:inset-0 lg:h-full lg:object-cover",
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Phase text overlays — scroll-driven, freezes when scroll stops */}
        {isLoaded &&
          SCROLL_PHASES.filter((p) => p.text).map((phase) => (
            <PhaseText
              key={phase.id}
              phase={phase}
              isActive={scrollPhaseId === phase.id}
              progress={scrollPhaseId === phase.id ? scrollPhaseProgress : 0}
            />
          ))}
      </div>
    </div>
  );
};

export default ScrollWindow;

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Immersive full-screen-height project gallery.
 *
 * Desktop (lg+): left large-photo panel + right vertical thumbnail rail.
 * Mobile (<lg):  stacked — hero image at the caller's ratio (default 4:3) +
 *                horizontal 4-column thumbnail strip below.
 *
 * Scroll behavior: the whole section (photo + thumbnails) scales down, drifts
 * downward, and gains corner radius as it scrolls through. The effect completes
 * at 30% of the section's scroll-through and then holds — useTransform clamps —
 * after which the section scrolls away normally. No sticky/pinned positioning.
 *
 * Desktop-only recession (see HAZARD note below): in the back half of that same
 * range the thumbnail rail cascades out (staggered per-thumb fade/slide) and its
 * width collapses to 0, while the section's side padding widens — so the large
 * photo ends up narrower and horizontally centred rather than merely wider.
 *
 * HAZARD — none of the collapse behaviour may be applied to mobile. The mobile
 * thumbnail strip sits BELOW the hero inside the same element useScroll measures,
 * so collapsing it would change the wrapper's height, which changes
 * scrollYProgress, which re-drives the collapse — a feedback loop that produces
 * scroll jitter. The desktop section is safe only because it is fixed-height
 * (h-[calc(100dvh-72px)]) and the rail collapses horizontally.
 *
 * Hover behavior:
 *  - Hovering a thumbnail temporarily previews that photo; moving away restores the pinned image.
 *  - Hover gated behind matchMedia("(hover: hover)") so touch devices never trigger it.
 *  - Clicking/tapping a thumbnail permanently pins that photo.
 *
 * USER AMENDMENT 2026-07-25: No AccentStripe in the hero overlay. Scrim + serif white title only.
 */

export interface ProjectHeroGalleryProps {
  photos: Array<{ src: string; alt: string }>;
  title: string;
  className?: string;
  /** CSS aspect-ratio for the mobile hero panel, e.g. "4/3" or "16/9". Defaults to 4/3. */
  ratio?: string;
}

const isHoverDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

interface RailThumbProps {
  index: number;
  count: number;
  progress: MotionValue<number>;
  end: number;
  reduced: boolean;
  className: string;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  ariaLabel: string;
  pressed: boolean;
  tabIndex: number;
  children: ReactNode;
}

/**
 * One desktop-rail thumbnail with its own scroll sub-range, so the rail cascades
 * top→bottom on the way out and reverses on the way back in.
 *
 * Extracted into its own component because useTransform cannot be called inside
 * a .map() — that would break the rules of hooks.
 */
const RailThumb = ({
  index,
  count,
  progress,
  end,
  reduced,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ariaLabel,
  pressed,
  tabIndex,
  children,
}: RailThumbProps) => {
  // Thumb 0 leaves first, last thumb starts at 45% of the range; each fades over 35%.
  const lead = count > 1 ? (index / (count - 1)) * (end * 0.45) : 0;
  const span = end * 0.35;
  const range = reduced ? [0, 1] : [lead, lead + span];
  const opacity = useTransform(progress, range, reduced ? [1, 1] : [1, 0]);
  const x = useTransform(progress, range, reduced ? [0, 0] : [0, 28]);
  const scale = useTransform(progress, range, reduced ? [1, 1] : [1, 0.94]);
  const pointerEvents = useTransform(opacity, (v) => (v < 0.05 ? "none" : "auto"));

  return (
    <motion.button
      style={{ opacity, x, scale, pointerEvents }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      tabIndex={tabIndex}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const ProjectHeroGallery = ({ photos, title, className, ratio = "4/3" }: ProjectHeroGalleryProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState(0);

  const activeIdx = hoveredIdx ?? pinnedIdx;

  // Breakpoint flags drive the shrink intensity — desktop is pronounced, mobile softer —
  // and the rail's start width (w-[280px] xl:w-[320px]). Tracked in state (not Tailwind
  // classes) because the values feed motion transforms.
  const [isDesktop, setIsDesktop] = useState(false);
  const [isXl, setIsXl] = useState(false);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const xl = window.matchMedia("(min-width: 1280px)");
    const sync = () => {
      setIsDesktop(lg.matches);
      setIsXl(xl.matches);
    };
    sync();
    lg.addEventListener("change", sync);
    xl.addEventListener("change", sync);
    return () => {
      lg.removeEventListener("change", sync);
      xl.removeEventListener("change", sync);
    };
  }, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });

  // Effect completes at 30% of the section's scroll-through, then holds
  // (useTransform clamps by default).
  const END = 0.3;
  const endScale = reduced ? 1 : isDesktop ? 0.85 : 0.92;
  const endY = reduced ? 0 : isDesktop ? 80 : 40;
  const endRadius = reduced ? 0 : isDesktop ? 16 : 12;

  const scale = useTransform(scrollYProgress, [0, END], [1, endScale]);
  const y = useTransform(scrollYProgress, [0, END], [0, endY]);
  const radius = useTransform(scrollYProgress, [0, END], [0, endRadius]);

  // Rail collapse runs in the BACK HALF of the scroll range, after the thumb cascade.
  // Desktop only — see the HAZARD note in the file header.
  const railW = isXl ? 320 : 280;
  const railWidth = useTransform(
    scrollYProgress,
    [END * 0.5, END],
    reduced ? [railW, railW] : [railW, 0]
  );
  // px STRINGS, not numbers: `columnGap` is absent from framer-motion's
  // numberValueTypes map, so a numeric motion value is written to style as a raw
  // unitless number — invalid CSS for a length, so the declaration is dropped and
  // the `lg:gap-4` class wins. The gap would then hold at 16px and only snap to 0
  // at the very end (unitless zero being the one legal case). Verified 2026-07-25.
  const railGap = useTransform(
    scrollYProgress,
    [END * 0.5, END],
    reduced ? ["16px", "16px"] : ["16px", "0px"]
  );
  // Percentage padding stays responsive and narrows the photo as it centres, so the
  // collapsed state reads as "receded" rather than just "wider".
  const sidePad = useTransform(
    scrollYProgress,
    [END * 0.5, END],
    reduced ? ["1.1%", "1.1%"] : ["1.1%", "12%"]
  );

  // Once the rail has collapsed its buttons are visually gone but still focusable,
  // so mirror the collapse into the a11y tree. Guarded by a ref so the state only
  // flips at the threshold instead of re-rendering on every scroll frame.
  const [railHidden, setRailHidden] = useState(false);
  const railHiddenRef = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = !reduced && v > END * 0.9;
    if (railHiddenRef.current === next) return;
    railHiddenRef.current = next;
    setRailHidden(next);
  });

  // NOTE: every hook above must stay above this early return (rules of hooks).
  if (photos.length === 0) return null;

  const handleMouseEnter = (i: number) => {
    if (isHoverDevice()) setHoveredIdx(i);
  };
  const handleMouseLeave = () => {
    if (isHoverDevice()) setHoveredIdx(null);
  };

  // Thumbnail grid class: 1-col for ≤4 photos, 2-col for >4
  const railGridClass =
    photos.length > 4 ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-3";

  const thumbButtonClass = (i: number) =>
    cn(
      "block w-full aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)] transition-opacity duration-300 ease-marvin",
      i === activeIdx
        ? "ring-2 ring-inset ring-[color:var(--accent)] opacity-100"
        : "ring-1 ring-inset ring-[color:var(--rule-soft)] opacity-70 hover:opacity-100"
    );

  const photoStack = (
    <>
      {photos.map((photo, i) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-marvin",
            i === activeIdx ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </>
  );

  const titleOverlay = (
    /* Measured 2026-07-25: the old 3-stop `to-t from-black/70 via-black/30` put
       54% of the scrim ABOVE the text and landed peak darkness 40px BELOW it,
       leaving only 0.34–0.56 alpha across the title's own band. These explicit
       stops hold a dark plateau (0.78→0.70) across the text and collapse the
       falloff into the top third so no grey haze floats above the title. */
    <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.70)_38%,rgba(0,0,0,0.40)_64%,rgba(0,0,0,0.12)_86%,rgba(0,0,0,0)_100%)] pt-14 sm:pt-16 lg:pt-20 px-5 pb-5 sm:px-8 sm:pb-7 lg:px-12 lg:pb-10">
      <h1 className="font-serif text-h4 sm:text-h3 lg:text-h2 xl:text-h1 tracking-tight text-white text-balance max-w-[20ch] drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]">
        {title}
      </h1>
    </div>
  );

  return (
    /* ONE wrapper for both layouts, so there is only one useScroll instance.
       The two sections are mutually exclusive (`hidden lg:flex` / `lg:hidden`),
       so the wrapper's height always equals whichever one is visible. */
    <motion.div ref={wrapRef} style={{ scale, y, willChange: "transform" }}>
      {/* ── Desktop layout (lg+) ── */}
      {/* The inline paddingInline intentionally overrides the horizontal half of
          `p-3 lg:p-4`; the vertical half still comes from the class. */}
      <motion.section
        aria-label={title}
        style={{ columnGap: railGap, paddingInline: sidePad }}
        className={cn(
          "hidden lg:flex flex-row h-[calc(100dvh-72px)] p-3 lg:p-4 gap-3 lg:gap-4",
          className
        )}
      >
        {/* Left: large photo panel */}
        <motion.div
          style={{ borderRadius: radius }}
          className="relative flex-1 overflow-hidden bg-[color:var(--canvas-soft)]"
        >
          {photoStack}
          {titleOverlay}
        </motion.div>

        {/* Right: vertical thumbnail rail. Width is owned by the motion value
            (the w-[280px] xl:w-[320px] class moved to the inner grid) so the
            thumbnails clip out cleanly instead of reflowing as it narrows. */}
        <motion.div
          style={{ width: railWidth }}
          aria-hidden={railHidden}
          className="h-full overflow-y-auto no-scrollbar"
        >
          <div className={cn("w-[280px] xl:w-[320px]", railGridClass)}>
            {photos.map((photo, i) => (
              <RailThumb
                key={photo.src}
                index={i}
                count={photos.length}
                progress={scrollYProgress}
                end={END}
                reduced={!!reduced}
                onClick={() => setPinnedIdx(i)}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
                ariaLabel={`Show photo ${i + 1} of ${photos.length}`}
                pressed={i === activeIdx}
                tabIndex={railHidden ? -1 : 0}
                className={thumbButtonClass(i)}
              >
                <img
                  src={photo.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </RailThumb>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* ── Mobile layout (<lg) ── */}
      <section
        aria-label={title}
        className={cn("flex flex-col p-3 gap-3 lg:hidden", className)}
      >
        {/* Hero image — ratio comes from the caller (default 4:3). Applied as an
            inline style, NOT `aspect-[${ratio}]`: Tailwind cannot JIT-compile a
            class name built from a runtime value. */}
        <motion.div
          style={{ aspectRatio: ratio.replace("/", " / "), borderRadius: radius }}
          className="relative overflow-hidden w-full bg-[color:var(--canvas-soft)]"
        >
          {photoStack}
          {titleOverlay}
        </motion.div>

        {/* Horizontal 4-column thumbnail strip */}
        {photos.length > 1 && (
          <div className="grid grid-cols-4 gap-2 w-full">
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                onClick={() => setPinnedIdx(i)}
                aria-label={`Show photo ${i + 1} of ${photos.length}`}
                aria-pressed={i === activeIdx}
                className={thumbButtonClass(i)}
              >
                <img
                  src={photo.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default ProjectHeroGallery;

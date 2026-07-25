import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
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
 * at 55% of the section's scroll-through and then holds — useTransform clamps —
 * after which the section scrolls away normally. No sticky/pinned positioning.
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

const ProjectHeroGallery = ({ photos, title, className, ratio = "4/3" }: ProjectHeroGalleryProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState(0);

  const activeIdx = hoveredIdx ?? pinnedIdx;

  // Breakpoint flag drives the shrink intensity — desktop is pronounced, mobile softer.
  // Tracked in state (not a Tailwind class) because the values feed motion transforms.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });

  // Effect completes at 55% of the section's scroll-through, then holds
  // (useTransform clamps by default).
  const END = 0.55;
  const endScale = reduced ? 1 : isDesktop ? 0.85 : 0.92;
  const endY = reduced ? 0 : isDesktop ? 80 : 40;
  const endRadius = reduced ? 0 : isDesktop ? 16 : 12;

  const scale = useTransform(scrollYProgress, [0, END], [1, endScale]);
  const y = useTransform(scrollYProgress, [0, END], [0, endY]);
  const radius = useTransform(scrollYProgress, [0, END], [0, endRadius]);

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
      <section
        aria-label={title}
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

        {/* Right: vertical thumbnail rail */}
        <div
          className="w-[280px] xl:w-[320px] h-full overflow-y-auto no-scrollbar"
        >
          <div className={railGridClass}>
            {photos.map((photo, i) => (
              <button
                key={photo.src}
                onClick={() => setPinnedIdx(i)}
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
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
        </div>
      </section>

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

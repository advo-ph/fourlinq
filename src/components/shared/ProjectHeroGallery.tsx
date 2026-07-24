import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Immersive full-screen-height project gallery.
 *
 * Desktop (lg+): left large-photo panel + right vertical thumbnail rail.
 * Mobile (<lg):  stacked — hero image at 68svh + horizontal 4-column thumbnail strip below.
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
}

const isHoverDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const ProjectHeroGallery = ({ photos, title, className }: ProjectHeroGalleryProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState(0);

  const activeIdx = hoveredIdx ?? pinnedIdx;

  if (photos.length === 0) return null;

  const handleMouseEnter = (i: number) => {
    if (isHoverDevice()) setHoveredIdx(i);
  };
  const handleMouseLeave = () => {
    if (isHoverDevice()) setHoveredIdx(null);
  };

  // Thumbnail grid class: 1-col for ≤6 photos, 2-col for >6
  const railGridClass =
    photos.length > 6 ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-3";

  const thumbButtonClass = (i: number) =>
    cn(
      "block w-full aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)] transition-opacity duration-300 ease-marvin",
      i === activeIdx
        ? "ring-1 ring-[color:var(--accent)] opacity-100"
        : "ring-1 ring-[color:var(--rule-soft)] opacity-70 hover:opacity-100"
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

  const scrimOverlay = (
    <div
      className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none"
      aria-hidden="true"
    />
  );

  const titleOverlay = (
    <div className="absolute bottom-0 left-0 p-8 lg:p-12 pointer-events-none">
      <h1
        className="font-serif text-h3 lg:text-h2 xl:text-h1 tracking-tight text-white text-balance max-w-[20ch] drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]"
      >
        {title}
      </h1>
    </div>
  );

  return (
    <>
      {/* ── Desktop layout (lg+) ── */}
      <section
        aria-label={title}
        className={cn(
          "hidden lg:flex flex-row h-[calc(100dvh-72px)] p-3 lg:p-4 gap-3 lg:gap-4",
          className
        )}
      >
        {/* Left: large photo panel */}
        <div className="relative flex-1 overflow-hidden bg-[color:var(--canvas-soft)]">
          {photoStack}
          {scrimOverlay}
          {titleOverlay}
        </div>

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
        {/* Hero image */}
        <div className="relative h-[68svh] overflow-hidden w-full bg-[color:var(--canvas-soft)]">
          {photoStack}
          {scrimOverlay}
          {titleOverlay}
        </div>

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
    </>
  );
};

export default ProjectHeroGallery;

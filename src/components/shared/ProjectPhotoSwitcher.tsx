import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Project photo gallery with thumbnail rail.
 *
 * Behavior:
 *  - Large hero image + thumbnail rail underneath.
 *  - Hovering a thumbnail temporarily previews that photo; moving away
 *    restores the pinned (last-clicked) image.
 *  - Clicking a thumbnail permanently pins that photo as the hero.
 *  - The hero is stable — moving the mouse over the big image does NOT
 *    change the photo. Only thumbnail hover/click drives the selection.
 *  - On touch (no hover), the thumbnails act as a discrete tab strip.
 */

export interface ProjectPhoto {
  src: string;
  alt: string;
  /** Location or project name shown as a caption overlay. */
  caption?: string;
}

interface ProjectPhotoSwitcherProps {
  photos: ProjectPhoto[];
  eyebrow?: string;
  className?: string;
  /** Hero aspect ratio. Defaults to "16:9". Thumbnails always stay 5:4. */
  ratio?: "16:9" | "4:3";
}

const ProjectPhotoSwitcher = ({ photos, eyebrow = "Project gallery", className, ratio = "16:9" }: ProjectPhotoSwitcherProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState(0);

  const activeIdx = hoveredIdx ?? pinnedIdx;
  const active = photos[activeIdx] ?? photos[0];

  if (photos.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)}>
      {eyebrow && (
        <p className="eyebrow mb-5">{eyebrow}</p>
      )}

      {/* Hero image */}
      <div
        className={cn("relative overflow-hidden bg-[color:var(--canvas-soft)]", ratio === "4:3" ? "aspect-[4/3]" : "aspect-[16/9]")}
      >
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

        {/* Hover-zone indicators — invisible UI affordance */}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] flex pointer-events-none">
            {photos.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 transition-colors duration-300 ease-marvin",
                  i === activeIdx ? "bg-[color:var(--accent)]" : "bg-white/40"
                )}
              />
            ))}
          </div>
        )}

        {/* Caption */}
        {active.caption && (
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
            <p className="inline-block text-[11px] tracking-[0.12em] uppercase font-medium text-white bg-[color:var(--ink-primary)]/80 backdrop-blur-sm px-3 py-2">
              {active.caption}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail rail — click-to-pin + tab strip on touch.
          onMouseLeave restores the pinned image when the cursor leaves
          the entire rail (moving between thumbnails does not flicker). */}
      {photos.length > 1 && (
        <ul
          className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {photos.map((photo, i) => (
            <li key={photo.src}>
              <button
                onClick={() => setPinnedIdx(i)}
                onMouseEnter={() => setHoveredIdx(i)}
                aria-label={`Show ${photo.caption || photo.alt}`}
                aria-pressed={i === activeIdx}
                className={cn(
                  "block w-full aspect-[5/4] overflow-hidden bg-[color:var(--canvas-soft)] transition-all duration-300 ease-marvin",
                  i === activeIdx
                    ? "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-white"
                    : "ring-1 ring-[color:var(--rule-soft)] hover:ring-[color:var(--ink-primary)] opacity-80 hover:opacity-100"
                )}
              >
                <img
                  src={photo.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectPhotoSwitcher;

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Cursor-switching project photo gallery — Tita's §2.1.3 verbatim ask.
 *
 * Behavior:
 *  - Large hero image + thumbnail rail underneath.
 *  - Hovering anywhere along the WIDTH of the hero image switches which
 *    project photo is shown — divides the hero width into N equal zones
 *    (one per photo) and shows the photo for whichever zone the cursor is in.
 *    Marvin/Pella hover-swap PDP pattern, but proportional rather than discrete.
 *  - Thumbnail clicks lock the selection until cursor re-enters the hero.
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
}

const ProjectPhotoSwitcher = ({ photos, eyebrow = "Project gallery", className }: ProjectPhotoSwitcherProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pinnedIdx, setPinnedIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const activeIdx = hoveredIdx ?? pinnedIdx;
  const active = photos[activeIdx] ?? photos[0];

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current || photos.length <= 1) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const zone = Math.min(photos.length - 1, Math.max(0, Math.floor((x / rect.width) * photos.length)));
    setHoveredIdx(zone);
  }, [photos.length]);

  const handleLeave = useCallback(() => {
    setHoveredIdx(null);
  }, []);

  if (photos.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)}>
      {eyebrow && (
        <p className="eyebrow mb-5">{eyebrow}</p>
      )}

      {/* Hero image — cursor switches between photos along the X-axis */}
      <div
        ref={heroRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative aspect-[16/9] overflow-hidden bg-[color:var(--canvas-soft)]"
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

      {/* Thumbnail rail — click-to-pin + tab strip on touch */}
      {photos.length > 1 && (
        <ul className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
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

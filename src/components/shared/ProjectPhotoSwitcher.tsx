import { useState, useRef, useCallback, useMemo } from "react";
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
  const photo = useMemo(
    () => photos.filter((entry, index) =>
      Boolean(entry.src) && photos.findIndex((candidate) => candidate.src === entry.src) === index
    ),
    [photos],
  );

  const activeIdx = Math.min(hoveredIdx ?? pinnedIdx, Math.max(0, photo.length - 1));
  const activePhoto = photo[activeIdx] ?? photo[0];

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current || photo.length <= 1) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const zone = Math.min(photo.length - 1, Math.max(0, Math.floor((x / rect.width) * photo.length)));
    setHoveredIdx(zone);
  }, [photo.length]);

  const handleLeave = useCallback(() => {
    setHoveredIdx(null);
  }, []);

  if (photo.length === 0) return null;

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
        role="group"
        aria-roledescription="carousel"
        aria-label={eyebrow || "Project gallery"}
        className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-[color:var(--canvas-soft)]"
      >
        {photo.map((entry, i) => (
          <img
            key={`${entry.src}-${i}`}
            src={entry.src}
            alt={i === activeIdx ? entry.alt : ""}
            aria-hidden={i !== activeIdx}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-marvin",
              i === activeIdx ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        {/* Hover-zone indicators — invisible UI affordance */}
        {photo.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] flex pointer-events-none">
            {photo.map((_, i) => (
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
        {activePhoto.caption && (
          <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
            <p className="inline-block text-[11px] tracking-[0.12em] uppercase font-medium text-white bg-[color:var(--ink-primary)]/80 backdrop-blur-sm px-3 py-2">
              Photo {activeIdx + 1} of {photo.length} · {activePhoto.caption}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail rail — click-to-pin + tab strip on touch */}
      {photo.length > 1 && (
        <ul aria-label="Choose a project photo" className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {photo.map((entry, i) => (
            <li key={`${entry.src}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  setPinnedIdx(i);
                  setHoveredIdx(null);
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onFocus={() => setHoveredIdx(i)}
                onBlur={() => setHoveredIdx(null)}
                aria-label={`Show photo ${i + 1} of ${photo.length}: ${entry.caption || entry.alt}`}
                aria-pressed={i === activeIdx}
                className={cn(
                  "block w-full aspect-[5/4] overflow-hidden bg-[color:var(--canvas-soft)] transition-all duration-300 ease-marvin",
                  i === activeIdx
                    ? "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-white"
                    : "ring-1 ring-[color:var(--rule-soft)] hover:ring-[color:var(--ink-primary)] opacity-80 hover:opacity-100"
                )}
              >
                <img
                  src={entry.src}
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

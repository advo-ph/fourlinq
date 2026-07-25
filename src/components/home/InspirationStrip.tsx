import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FeatureLink from "@/components/primitives/FeatureLink";
import { projects as allProjects } from "@/data/projects";
import { toThumbPath } from "@/lib/project-thumbs";
import { versionedImage } from "@/lib/image-version";
import { cn } from "@/lib/utils";
import { fetchMergedProjectImages } from "@/lib/merged-project-images";

const FB = "/images/projects-fb";

// The five "feature" images the sticky left panel crossfades through as the
// right column scrolls. The section's scroll span is split into five equal
// parts (part 1 → … → part 5); each part owns one hero, and the top line fills
// as you scroll a part, then the image turns over to the next.
const FEATURE_HEROES: { src: string; alt: string }[] = [
  { src: `${FB}/home-feature-1.jpg`, alt: "Curved-glass modern residence with FourlinQ windows and dark louvered gate" },
  { src: `${FB}/home-feature-2.jpg`, alt: "Modernist white hillside residence with FourlinQ glazing and elevator tower" },
  { src: `${FB}/home-feature-3.jpg`, alt: "Multi-storey contemporary home at dusk with full-height FourlinQ glazing" },
  { src: `${FB}/home-feature-5.jpg`, alt: "Two-storey modern home with FourlinQ windows and wood-slat gate" },
  { src: `${FB}/home-feature-4.jpg`, alt: "Stone-clad residence with FourlinQ windows overlooking an infinity pool" },
];

// Header is 72px (--header-h); leave a little air so the pinned feature clears it.
const STICKY_TOP = 88;

// Full-bleed "Our Projects" gallery. Right column scrolls the ENTIRE catalog as
// 4:3 cropped tiles; the left column is a sticky feature that
// crossfades through five heroes as you scroll, with a thin top line tracking
// scroll position within the current part. (Per Prince, 2026-07-22.)
const ProjectTile = ({ project, coverSrc }: { project: (typeof allProjects)[number]; coverSrc?: string }) => {
  // Use admin-set cover if available, otherwise the baseline project hero.
  const imageSrc = coverSrc ?? project.image;
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block overflow-hidden bg-[color:var(--canvas-soft)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)]">
        <img
          src={versionedImage(toThumbPath(imageSrc))}
          alt={project.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-marvin [@media(hover:hover)]:group-hover:scale-[1.04]"
          onError={(e) => {
            // Thumb missing (e.g. newly added image) — fall back to full-res.
            const vFull = versionedImage(imageSrc);
            if ((e.currentTarget as HTMLImageElement).src !== vFull) {
              (e.currentTarget as HTMLImageElement).src = vFull;
            }
          }}
        />
      </div>
    </Link>
  );
};

const InspirationStrip = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Start with the full project list; filter out hidden/deleted projects once
  // the merged API response arrives. Until then, all projects are visible
  // (same baseline behaviour as before this fix).
  const [projects, setProjects] = useState(allProjects);
  // Admin-set cover images: projectId → cover image path. Empty until the
  // merged API responds. Tiles fall back to the baseline hero when absent.
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;
    fetchMergedProjectImages()
      .then((data) => {
        if (!live) return;
        const hiddenSet = new Set([
          ...(data.hiddenProjects ?? []),
          ...(data.deletedProjects ?? []),
        ]);
        if (hiddenSet.size > 0) {
          setProjects(allProjects.filter((p) => !hiddenSet.has(p.id)));
        }
        if (data.projectCoverImages && Object.keys(data.projectCoverImages).length > 0) {
          setCoverImages(data.projectCoverImages);
        }
      })
      .catch(() => {
        // Swallow — keep showing the full project list on failure
      });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const panel = panelRef.current;
    const line = lineRef.current;
    if (!track || !panel || !line) return;

    const mq = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    let running = false;
    let fill = 0; // eased line fill (0..1) within the current part
    let seg = 0; // current part index (0..2)

    const tick = () => {
      const rect = track.getBoundingClientRect();
      // Scroll range over which the panel stays pinned: track height minus the
      // panel's own height. p goes 0 → 1 across that pinned run.
      const range = rect.height - panel.offsetHeight;
      const p = range > 0 ? (STICKY_TOP - rect.top) / range : 0;
      const clamped = p < 0 ? 0 : p > 1 ? 1 : p;

      const pos = clamped * 5; // 0..5 across the five parts
      const idx = pos >= 5 ? 4 : Math.floor(pos); // active part, clamped to last
      const target = pos - idx; // 0..1 fill within the active part

      if (idx !== seg) {
        // Snap on part change so the line doesn't drain backwards between parts.
        seg = idx;
        fill = target;
        setActiveIndex(idx);
      } else {
        // Ease toward the scroll target for a smooth line tween on wheel steps.
        fill += (target - fill) * 0.16;
      }
      line.style.width = `${(fill * 100).toFixed(2)}%`;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !mq.matches) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only run the effect while the section is near the viewport, and only on
    // desktop (the sticky split is desktop-only; mobile shows the plain grid).
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "200px" },
    );
    io.observe(track);

    const onMq = () => {
      stop();
      if (mq.matches) start();
      else setActiveIndex(0);
    };
    mq.addEventListener("change", onMq);

    return () => {
      io.disconnect();
      mq.removeEventListener("change", onMq);
      stop();
    };
  }, []);

  return (
    <section className="relative bg-[color:var(--canvas)]">
      {/* Full-width hairline gives the section a clean, defined top edge. */}
      <div className="border-t border-[color:var(--rule-strong)]" aria-hidden="true" />

      <div className="px-4 md:px-6 lg:px-8 py-section-mobile md:py-section-tablet lg:py-section-desktop">
        {/* Left: sticky crossfading feature. Right: the full catalog, scrolling. */}
        <div
          ref={trackRef}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr)] gap-3 lg:gap-4 items-start"
        >
          {/* Sticky feature. On mobile the panel still renders so the heading
              and subtitle sit above the grid; only the scroll line and the
              crossfading hero are desktop-only. */}
          <div
            ref={panelRef}
            className="mb-5 lg:mb-0 lg:sticky lg:self-start"
            style={{ top: STICKY_TOP }}
          >
            {/* Thin scroll-position line: fills across a part, then the hero turns over. */}
            <div className="relative hidden h-[1.5px] w-full overflow-hidden bg-[color:var(--rule-soft)] lg:block">
              <div
                ref={lineRef}
                className="absolute inset-y-0 left-0 bg-[color:var(--accent)]"
                style={{ width: "0%" }}
              />
            </div>

            {/* Crossfading hero stack. object-cover so any source ratio overlays cleanly. */}
            <div className="relative hidden mt-3 aspect-[3/2] overflow-hidden bg-neutral-100 lg:block">
              {FEATURE_HEROES.map((hero, i) => (
                <img
                  key={hero.src}
                  src={versionedImage(hero.src)}
                  alt={hero.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-marvin motion-reduce:transition-none",
                    i === activeIndex ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
            </div>

            {/* Title + subtitle under the feature. The headline echoes
                BRAND.promise ("A Lifetime of Satisfaction and Peace of Mind")
                so it bookends BrandCTA lower on the page. Subtitle carries the
                factual load: the systems listed are the actual installs in
                projects.ts. */}
            <div className="lg:mt-6">
              <h3 className="font-serif font-normal tracking-tight leading-[1.15] text-h4 lg:text-h3 text-[color:var(--ink-primary)]">
                Built to your satisfaction.
              </h3>
              <p className="mt-3 max-w-[32rem] text-body text-[color:var(--ink-secondary)] leading-[1.6]">
                FourlinQ installations across the Philippines. Casement and
                sliding windows, entrance doors, and full aluminium systems.
              </p>
              <div className="mt-5">
                <FeatureLink to="/inspiration">View full gallery</FeatureLink>
              </div>
            </div>
          </div>

          {/* The full catalog: every project, 4:3 tiles, masonry columns. */}
          <div className="columns-2 xl:columns-3 gap-1.5 lg:gap-2">
            {projects.map((p) => (
              <div key={p.id} className="mb-1.5 lg:mb-2 break-inside-avoid">
                <ProjectTile project={p} coverSrc={coverImages[p.id]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InspirationStrip;

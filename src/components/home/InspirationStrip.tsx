import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FeatureLink from "@/components/primitives/FeatureLink";
import { projects as allProjects } from "@/data/projects";
import { toThumbPath } from "@/lib/project-thumbs";
import { versionedImage } from "@/lib/image-version";
import { cn } from "@/lib/utils";
import { fetchMergedProjectImagesFresh } from "@/lib/merged-project-images";
import { fetchProjects, mergeProject, type CmsProject } from "@/lib/cms-api";
import type { MergedProjectImagesResponse } from "@/types/project-images";

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
// Tiles this far into the list are on screen the moment the section is reached,
// so they load eagerly at high priority; everything below stays lazy. Two
// masonry columns on mobile, three from xl — six covers the first rows either way.
const EAGER_TILE_COUNT = 6;

const ProjectTile = ({
  project,
  coverSrc,
  eager,
}: {
  project: (typeof allProjects)[number];
  coverSrc?: string;
  eager?: boolean;
}) => {
  // Use admin-set cover if available, otherwise the baseline project hero.
  // toThumbPath resolves both families of small variant — the baked 640px WebP
  // for repo assets and the 480px "-thumb" sibling for CMS uploads.
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
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
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
  // The feature heroes are ~1.9 MB of full-res JPEG. They are display:none below
  // lg, but a hidden <img> with a src still downloads — so mobile was paying for
  // all five and showing none. Gate on the same query the scroll effect uses and
  // skip rendering them entirely. Initialised eagerly (not in an effect) so
  // desktop still paints the first hero on the very first render.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );
  // Live admin/CMS state. Null until each request lands; the derived list below
  // degrades to the static baseline so the gallery is never blank.
  const [merged, setMerged] = useState<MergedProjectImagesResponse | null>(null);
  const [cmsRows, setCmsRows] = useState<CmsProject[] | null>(null);

  useEffect(() => {
    let live = true;

    // Both requests fire in parallel and each paints independently — the merged
    // payload decides what is visible, so it must not wait on the CMS call.
    //
    // Fresh, not the shared 60 s fetch: the endpoint ships
    // `max-age=30, stale-while-revalidate=300`, so a cached read can be minutes
    // behind an admin hide/reorder/image swap. fetchMergedProjectImagesFresh
    // sends ?_r=1 + no-cache to defeat the module, browser, and server caches.
    fetchMergedProjectImagesFresh()
      .then((d) => { if (live) setMerged(d); })
      .catch(() => { /* keep the static baseline rendered */ });

    // CMS rows layer edited titles over projects.ts. Currently a no-op for the
    // tile image (see below) but keeps this gallery in step with /inspiration.
    fetchProjects()
      .then((rows) => { if (live) setCmsRows(rows); })
      .catch(() => { /* covers/order still apply without it */ });

    return () => { live = false; };
  }, []);

  const projects = useMemo(() => {
    const base = cmsRows ? mergeProject(allProjects, cmsRows) : allProjects;
    if (!merged) return base;

    const hiddenSet = new Set([
      ...(merged.hiddenProjects ?? []),
      ...(merged.deletedProjects ?? []),
    ]);
    // projectOrder is already hidden/deleted-filtered server-side, so anything
    // missing from it is unranked and sorts to the end, stably.
    const rank = new Map((merged.projectOrder ?? []).map((id, i) => [id, i]));
    const rankOf = (id: string) => rank.get(id) ?? Number.MAX_SAFE_INTEGER;

    return base
      .filter((p) => !hiddenSet.has(p.id))
      .sort((a, b) => rankOf(a.id) - rankOf(b.id));
  }, [merged, cmsRows]);

  // projectId → cover path, derived server-side from the project's effective
  // image order with admin hides/replacements applied. Present for every
  // project, so in practice this and not project.image drives every tile.
  const coverImages = merged?.projectCoverImages ?? {};

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
      // Keep hero rendering in step with the breakpoint: crossing up to desktop
      // mounts them, crossing down unmounts so they stop costing bandwidth.
      setIsDesktop(mq.matches);
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
              {isDesktop && FEATURE_HEROES.map((hero, i) => (
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
            {projects.map((p, i) => (
              <div key={p.id} className="mb-1.5 lg:mb-2 break-inside-avoid">
                <ProjectTile
                  project={p}
                  coverSrc={coverImages[p.id]}
                  eager={i < EAGER_TILE_COUNT}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InspirationStrip;

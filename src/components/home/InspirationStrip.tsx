import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AccentStripe from "@/components/primitives/AccentStripe";
import FeatureLink from "@/components/primitives/FeatureLink";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";

const FB = "/images/projects-fb";

// The five "feature" images the sticky left panel crossfades through as the
// right column scrolls. The section's scroll span is split into five equal
// parts (part 1 → … → part 5); each part owns one hero, and the top line fills
// as you scroll a part, then the image turns over to the next.
const FEATURE_HEROES: { src: string; alt: string }[] = [
  { src: `${FB}/home-feature-1.jpg`, alt: "Curved-glass modern residence with FourlinQ windows and dark louvered gate" },
  { src: `${FB}/home-feature-2.jpg`, alt: "Modernist white hillside residence with FourlinQ glazing and elevator tower" },
  { src: `${FB}/home-feature-3.jpg`, alt: "Multi-storey contemporary home at dusk with full-height FourlinQ glazing" },
  { src: `${FB}/home-feature-4.jpg`, alt: "Stone-clad residence with FourlinQ windows overlooking an infinity pool" },
  { src: `${FB}/home-feature-5.jpg`, alt: "Two-storey modern home with FourlinQ windows and wood-slat gate" },
];

// Header is 72px (--header-h); leave a little air so the pinned feature clears it.
const STICKY_TOP = 88;

// Full-bleed "Our Projects" gallery. Right column scrolls the ENTIRE catalog at
// natural aspect ratio (no cropping); the left column is a sticky feature that
// crossfades through five heroes as you scroll, with a thin top line tracking
// scroll position within the current part. (Per Prince, 2026-07-22.)
const ProjectTile = ({ project }: { project: (typeof projects)[number] }) => (
  <Link
    to={`/projects/${project.id}`}
    className="group block overflow-hidden bg-neutral-100"
  >
    <img
      src={project.image}
      alt={project.name}
      loading="lazy"
      decoding="async"
      className="w-full h-auto transition-transform duration-700 ease-marvin [@media(hover:hover)]:group-hover:scale-[1.04]"
    />
  </Link>
);

const InspirationStrip = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
        <div className="flex items-end justify-between gap-6 mb-8 lg:mb-10">
          <div>
            <AccentStripe width="sm" color="accent" className="mb-3" />
            <p className="eyebrow text-[color:var(--ink-muted)]">Our Projects</p>
          </div>
          <FeatureLink to="/inspiration">View full gallery</FeatureLink>
        </div>

        {/* Left: sticky crossfading feature. Right: the full catalog, scrolling. */}
        <div
          ref={trackRef}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr)] gap-3 lg:gap-8 items-start"
        >
          {/* Sticky feature — desktop only. */}
          <div
            ref={panelRef}
            className="hidden lg:block lg:sticky lg:self-start"
            style={{ top: STICKY_TOP }}
          >
            {/* Thin scroll-position line: fills across a part, then the hero turns over. */}
            <div className="relative h-px w-full overflow-hidden bg-[color:var(--rule-soft)]">
              <div
                ref={lineRef}
                className="absolute inset-y-0 left-0 bg-[color:var(--accent)]"
                style={{ width: "0%" }}
              />
            </div>

            {/* Crossfading hero stack. object-cover so any source ratio overlays cleanly. */}
            <div className="relative mt-3 aspect-[3/2] overflow-hidden bg-neutral-100">
              {FEATURE_HEROES.map((hero, i) => (
                <img
                  key={hero.src}
                  src={hero.src}
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

            {/* Title + subtitle under the feature. Copy is real: the regions
                and systems reflect the actual installs in projects.ts. */}
            <div className="mt-6">
              <h3 className="font-serif font-normal tracking-tight leading-[1.15] text-h5 lg:text-h4 text-[color:var(--ink-primary)]">
                From Luzon to Mindanao
              </h3>
              <p className="mt-3 max-w-[32rem] text-body-sm text-[color:var(--ink-secondary)] leading-[1.6]">
                Documented FourlinQ installations across the Philippines —
                casement and sliding windows, entrance doors, and full aluminium
                systems.
              </p>
            </div>
          </div>

          {/* The full catalog — every project, natural ratio, masonry columns. */}
          <div className="columns-2 xl:columns-3 gap-3 lg:gap-4">
            {projects.map((p) => (
              <div key={p.id} className="mb-3 lg:mb-4 break-inside-avoid">
                <ProjectTile project={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InspirationStrip;

import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import AccentStripe from "@/components/primitives/AccentStripe";
import { SYSTEM_TYPE, PROFILE_MATERIAL } from "@/data/taxonomy";

const TILE_FRAMES = 53;

interface SystemTile {
  name: string;
  description: string;
  framePath: string;
  to: string;
}

// The homepage product gateway. Labels and destinations come from the shared
// taxonomy so the home, nav, /products, and footer can't drift apart; only the
// scroll-animation frame path is local to this surface.
const FRAME_PATH: Record<string, string> = {
  window: "/images/systems/window/frame_{index}.jpg",
  door: "/images/systems/door/frame_{index}.jpg",
  specialist: "/images/systems/specialist/frame_{index}.jpg",
};

const systemTile: SystemTile[] = SYSTEM_TYPE.map((t) => ({
  name: t.label,
  description: t.description,
  framePath: FRAME_PATH[t.type_code],
  to: t.to,
}));

function SystemFrameTile({ system }: { system: SystemTile }) {
  const tileRef = useRef<HTMLLIElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const [near, setNear] = useState(false);

  const { images, isLoaded } = useFramePreloader(
    TILE_FRAMES,
    system.framePath,
    { enabled: near, padLength: 4 },
  );

  useEffect(() => {
    const el = tileRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          obs.disconnect();
        }
      },
      { rootMargin: "50% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const draw = useCallback(
    (f: number) => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;
      const img = images[f];
      if (!img?.naturalWidth) return;
      if (cvs.width !== img.naturalWidth || cvs.height !== img.naturalHeight) {
        cvs.width = img.naturalWidth;
        cvs.height = img.naturalHeight;
      }
      ctx.drawImage(img, 0, 0);
    },
    [images],
  );

  useEffect(() => {
    if (!isLoaded) return;
    draw(0);
  }, [isLoaded, draw]);

  // Scroll-based: map tile's viewport travel to frame index
  useEffect(() => {
    if (!isLoaded) return;

    const onScroll = () => {
      const el = tileRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh / 2 + rect.height / 2)));
      const target = Math.min(
        TILE_FRAMES - 1,
        Math.floor(progress * TILE_FRAMES),
      );

      if (target !== frameRef.current) {
        frameRef.current = target;
        draw(target);
      }
    };

    const tick = () => {
      onScroll();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isLoaded, draw]);

  return (
    <li ref={tileRef}>
      <Link to={system.to} className="group block">
        <div className="relative aspect-video overflow-hidden bg-neutral-50 mb-6">
          <canvas
            ref={canvasRef}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-500",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-h4 lg:text-h3 font-normal tracking-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
            {system.name}
          </h3>
          <ArrowUpRight
            size={20}
            className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
          />
        </div>
        <p className="mt-3 text-body-sm lg:text-body text-[color:var(--ink-secondary)] max-w-[24rem]">
          {system.description}
        </p>
      </Link>
    </li>
  );
}

/**
 * The material axis, as text-only spec columns (no image). Four peers in one
 * row: uPVC and the three aluminium systems. Routes come from the shared
 * taxonomy (uPVC → /why-upvc, all aluminium → /aluminium) so this surface can't
 * drift from the nav. Content mirrors useAluminium.ts (aluminium best_for) and
 * the uPVC advantages, condensed to homepage length.
 */
interface MaterialColumn {
  title: string;
  /** The "Best for" subtitle. Kept short so every column wraps to two lines. */
  bestFor: string;
  /** Three feature/spec lines — equal count keeps the four columns level. */
  features: string[];
  to: string;
}

const materialRoute = (code: (typeof PROFILE_MATERIAL)[number]["material_code"]) =>
  PROFILE_MATERIAL.find((m) => m.material_code === code)!.to;

const MATERIAL_COLUMN: MaterialColumn[] = [
  {
    title: "uPVC",
    bestFor: "Everyday residential windows and doors.",
    features: [
      "Multi-chamber, steel-reinforced profile",
      "Corrosion-free, no repainting",
      "24–32 dB sound attenuation",
    ],
    to: materialRoute("upvc"),
  },
  {
    title: "Aluminium Thermal Break",
    bestFor: "Air-conditioned and west-facing interiors.",
    features: [
      "Polyamide isolator inside the frame",
      "Cuts heat transfer and condensation",
      "High-end, climate-controlled builds",
    ],
    to: materialRoute("aluminium"),
  },
  {
    title: "Non-Thermal Break",
    bestFor: "Naturally ventilated spaces and lanais.",
    features: [
      "Solid aluminium, no isolator",
      "Slimmer sightlines, lower cost",
      "Wall thickness 1.2–3.0 mm",
    ],
    to: materialRoute("aluminium"),
  },
  {
    title: "Aluminium Slim",
    bestFor: "Floor-to-ceiling, minimum-sightline glazing.",
    features: [
      "Minimum-sightline profile",
      "Maximum glass, frame recedes",
      "Panoramic, full-height spans",
    ],
    to: materialRoute("aluminium"),
  },
];

/**
 * A single material column: serif title, an uppercase "Best for" subtitle, then
 * a hairline-ruled spec list. The whole column is the link — hovering anywhere
 * on it reddens the title. Every title is a single line (whitespace-nowrap plus
 * a size that fits the four-up column), so the "Best for" blocks and spec lists
 * all start at the same y; the subtitle's fixed min-height and h-full keep the
 * four columns a common height even when a "Best for" line wraps.
 */
function MaterialCard({ material }: { material: MaterialColumn }) {
  return (
    <li>
      <Link to={material.to} className="group flex h-full flex-col text-left">
        <h3 className="font-serif text-base xl:text-lg font-normal tracking-tight leading-[1.25] whitespace-nowrap text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
          {material.title}
        </h3>

        <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)]">
          Best for
        </p>
        <p className="mt-1.5 text-body-sm leading-[1.4] min-h-[2.75em] text-[color:var(--ink-secondary)]">
          {material.bestFor}
        </p>

        <ul className="mt-5 border-t border-[color:var(--rule-strong)] divide-y divide-[color:var(--rule-soft)]">
          {material.features.map((feature) => (
            <li
              key={feature}
              className="py-2.5 text-body-sm leading-[1.35] text-[color:var(--ink-primary)]"
            >
              {feature}
            </li>
          ))}
        </ul>
      </Link>
    </li>
  );
}

/** One section, two axes: the three system types as animated frame tiles, then
 *  the material axis (uPVC + three aluminium systems) as a text-only spec row. */
const SystemsTiles = () => (
  <div id="browse-products">
    <div className="mb-10 lg:mb-12">
      <AccentStripe width="sm" color="accent" className="mb-3" />
      <h2 className="eyebrow text-[color:var(--ink-muted)]">Products and materials</h2>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
      {systemTile.map((sys) => (
        <SystemFrameTile key={sys.name} system={sys} />
      ))}
    </ul>

    <div className="mt-14 lg:mt-16 border-t border-[color:var(--rule-strong)] pt-10 lg:pt-12">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 items-stretch">
        {MATERIAL_COLUMN.map((material) => (
          <MaterialCard key={material.title} material={material} />
        ))}
      </ul>
    </div>
  </div>
);

export default SystemsTiles;

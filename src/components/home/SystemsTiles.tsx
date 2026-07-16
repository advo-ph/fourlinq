import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
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
          <h3 className="font-serif text-h4 lg:text-h3 font-normal tracking-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--ink-secondary)] transition-colors duration-300 ease-marvin">
            {system.name}
          </h3>
          <ArrowUpRight
            size={20}
            className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--ink-primary)]"
          />
        </div>
        <p className="mt-3 text-body-sm lg:text-body text-[color:var(--ink-secondary)] max-w-[24rem]">
          {system.description}
        </p>
      </Link>
    </li>
  );
}

const SystemsTiles = () => (
  <div id="browse-products">
    <div className="mb-12 lg:mb-16">
      <EyebrowHeading eyebrow="Browse products" level={2}>
        By type.
      </EyebrowHeading>
      <p className="mt-8 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] leading-[1.65]">
        Custom-fabricated windows and doors from our Manila workshop. Measured
        to your architect's drawings, finished in any of twelve colors, and
        installed by our own crew.
      </p>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
      {systemTile.map((sys) => (
        <SystemFrameTile key={sys.name} system={sys} />
      ))}
    </ul>

    {/* Axis 2. Aluminium is a material, not a fourth type — so it gets its own
        heading here rather than a fourth tile above (Imie, 2026-07-02). */}
    <div className="mt-20 lg:mt-24 pt-14 lg:pt-16 border-t border-[color:var(--rule-strong)]">
      <EyebrowHeading eyebrow="Browse products" level={2}>
        By material.
      </EyebrowHeading>
      <p className="mt-8 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] leading-[1.65]">
        Every type is fabricated in either profile system. The material is a
        separate choice from the type.
      </p>

      <ul className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10 lg:max-w-[48rem]">
        {PROFILE_MATERIAL.map((m) => (
          <li key={m.material_code}>
            <Link to={m.to} className="group block">
              <div className="flex items-start justify-between gap-4 border-t border-[color:var(--rule-strong)] pt-5">
                <h3 className="font-serif text-h5 lg:text-h4 font-normal tracking-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--ink-secondary)] transition-colors duration-300 ease-marvin">
                  {m.label}
                </h3>
                <ArrowUpRight
                  size={20}
                  className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--ink-primary)]"
                />
              </div>
              <p className="mt-3 text-body-sm lg:text-body text-[color:var(--ink-secondary)] max-w-[26rem]">
                {m.description}
              </p>
              <ul className="mt-4 border-t border-[color:var(--rule-soft)]">
                {m.item.map((it) => (
                  <li
                    key={it}
                    className="text-body-sm text-[color:var(--ink-primary)] py-2.5 border-b border-[color:var(--rule-soft)]"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <FeatureLink to="/why-upvc">Why uPVC</FeatureLink>
      </div>
    </div>
  </div>
);

export default SystemsTiles;

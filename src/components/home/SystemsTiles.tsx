import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import { SYSTEM_TYPE, PROFILE_MATERIAL } from "@/data/taxonomy";

interface SystemTile {
  name: string;
  description: string;
  imageSrc: string;
  to: string;
}

// The homepage product gateway. Labels and destinations come from the shared
// taxonomy so the home, nav, /products, and footer can't drift apart. Each
// category uses one ordinary image: the product remains understandable without
// JavaScript, motion preferences, or hundreds of frame requests.
const SYSTEM_IMAGE: Record<string, string> = {
  window: "/images/systems/window/frame_0001.jpg",
  door: "/images/systems/door/frame_0001.jpg",
  specialist: "/images/wp-export/specialshapes.webp",
};

const systemTile: SystemTile[] = SYSTEM_TYPE.map((t) => ({
  name: t.label,
  description: t.description,
  imageSrc: SYSTEM_IMAGE[t.type_code],
  to: t.to,
}));

function SystemCard({ system }: { system: SystemTile }) {
  return (
    <li>
      <Link to={system.to} className="group block">
        <div className="relative aspect-video overflow-hidden bg-neutral-50 mb-6">
          <img
            src={system.imageSrc}
            alt={`${system.name} product example`}
            data-product-media="static"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain"
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
        <SystemCard key={sys.name} system={sys} />
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
              <div className="flex items-start justify-between gap-4 border-t-[3px] border-[color:var(--accent)] pt-5">
                <h3 className="font-serif text-h5 lg:text-h4 font-normal tracking-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                  {m.label}
                </h3>
                <ArrowUpRight
                  size={20}
                  className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
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

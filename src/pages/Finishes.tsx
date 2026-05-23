import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { FINISH_SCENES, getFinishVariantSrc } from "@/data/finish-scenes";
import { ArrowRight, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type FinishFilter = "all" | "wood-grain" | "solid";

const FILTER_TABS: { id: FinishFilter; label: string }[] = [
  { id: "all", label: "All 11 finishes" },
  { id: "wood-grain", label: "Wood grain" },
  { id: "solid", label: "Solid" },
];

/**
 * Per-finish editorial pairing — where in a Philippine home this finish reads
 * best, what architectural register it belongs to, what to pair it with.
 * Brochure-verified description lives in FRAME_FINISHES.description; this
 * adds the context that turns a swatch grid into a design conversation.
 */
const finishPairing: Record<string, string> = {
  "oak-light":
    "The finish that quietly disappears. Sits well with a Scandinavian-Filipino register: pale oak floors, white plaster walls, indoor planting. Reads as warm white from across the room. Pairs with concrete and linen.",
  "oak-malt":
    "The honest middle. Less rustic than Golden Oak, less austere than Woodgray. Works on a lanai facade where the warm tone catches afternoon light. Pairs with bone-white walls and brushed bronze.",
  woodgray:
    "The driftwood register. The most architectural of the wood-grains. Reads as weathered timber on a beachfront install, as soft warm grey in an urban condo. Pairs with white oak, polished concrete, and natural stone.",
  "2-wood-black":
    "The moody alternative to Jet Black. When the architect wants drama without a flat industrial read. Reads as wenge in raking light, as deep espresso in direct sun. Pairs with travertine, brass, and high-contrast white.",
  "dark-oak":
    "Filipino hardwood register without the hardwood maintenance. Reads as narra or aged kamagong from across a room. Specifies for heritage homes and ancestral-house renovations. Pairs with capiz, terracotta, limewashed walls.",
  walnut:
    "The richest wood-grain in the catalog. For projects where the window is meant to be noticed: feature walls, statement entries, double-height openings. Reads as solid American walnut up close. Pairs with brass and deep emerald.",
  "golden-oak":
    "The warmest wood-grain. The finish for a sun-drenched lanai or a kitchen window above the sink. Specifies well in tropical-traditional homes: bahay-na-bato influences, capiz screens, rattan furniture. Pairs with terracotta and mango wood.",
  white:
    "The default and the discipline. The matte white that lets the architecture lead. The gold standard for modern facades, condominium interiors, white-on-white kitchens. Pairs with everything.",
  "jet-black":
    "Flat black. No grain, no texture, no softening. The choice when the window is a graphic gesture: a black frame against a white wall, a dark line in a minimalist facade. Pairs with raw concrete, white oak, bright planting.",
  "charcoal-gray":
    "Black without the commitment. Softer than Jet Black. Reads as deep graphite, dark stone, gunmetal. Works on seaside elevations and industrial-modern condos. Pairs with pale concrete, brushed steel, warm timber.",
  "matte-quartz":
    "The mid-tone grey. The most neutral non-white finish. Reads as architectural concrete from across the room. For projects where the window should feel structural, not decorative. Pairs with concrete, white, and natural greenery.",
};

/**
 * The wow-factor page: interactive finish explorer.
 * Click a finish; the window frame in the hero photo changes to that finish.
 * No competitor in the Philippine fenestration market has anything like this.
 */
const Finishes = () => {
  const [selectedId, setSelectedId] = useState(FRAME_FINISHES[0].id);
  const [filter, setFilter] = useState<FinishFilter>("all");
  const scene = FINISH_SCENES[0]; // single scene for now

  const selected = useMemo(
    () => FRAME_FINISHES.find((f) => f.id === selectedId) ?? FRAME_FINISHES[0],
    [selectedId]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return FRAME_FINISHES;
    return FRAME_FINISHES.filter((f) => f.category === filter);
  }, [filter]);

  return (
    <Layout>
      <PageHeader
        eyebrow="The catalog"
        title="Eleven finishes. One window."
        breadcrumbLabel="Finishes"
        subtitle="Each FourlinQ system is available in eleven brochure-verified finishes. Seven wood-grain laminates and four solid colors. Pick one. See it on the frame."
      />

      {/* Interactive hero — photo + overlaid frame swatch + description */}
      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-[7fr,5fr] gap-10 lg:gap-16 items-start">
            {/* Hero preview — stacked images, cross-fade to selected variant */}
            <div className={cn("relative bg-[color:var(--canvas-soft)] overflow-hidden", scene.aspect)}>
              {scene.hasAssets ? (
                // Real variants — preload all 11, cross-fade to selected
                FRAME_FINISHES.map((f) => (
                  <img
                    key={f.id}
                    src={getFinishVariantSrc(scene, f)}
                    alt={`${scene.label} with ${f.label} frame`}
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-marvin",
                      f.id === selected.id ? "opacity-100" : "opacity-0"
                    )}
                    loading={f.id === selected.id ? "eager" : "lazy"}
                    decoding="async"
                  />
                ))
              ) : (
                // No assets yet — show the base scene cleanly, no fake overlay
                <img
                  src={scene.fallbackSrc}
                  alt={scene.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              )}

              {/* Status badge — honest about asset state */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[color:var(--ink-primary)]/90 backdrop-blur-sm text-white px-3 py-2 text-[11px] uppercase tracking-[0.12em] font-medium">
                {scene.hasAssets ? (
                  <>Preview · {selected.label}</>
                ) : (
                  <>
                    <Camera size={12} strokeWidth={1.5} />
                    Photo previews coming soon
                  </>
                )}
              </div>
            </div>

            {/* Selected finish description */}
            <div className="lg:pt-8">
              <p className="eyebrow mb-4 inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-[color:var(--rule-strong)]">
                {selected.category === "wood-grain" ? "Wood grain" : "Solid"}
              </p>
              <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] tracking-tight leading-[1.05] mb-6">
                {selected.label}
              </h2>
              <p className="text-body-lg lg:text-lead text-[color:var(--ink-secondary)] leading-[1.55] max-w-[34rem]">
                {selected.description}
              </p>
              {finishPairing[selected.id] && (
                <div className="mt-6 max-w-[34rem]">
                  <p className="eyebrow mb-3">Where it works</p>
                  <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.7]">
                    {finishPairing[selected.id]}
                  </p>
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <EditorialButton to="/products" variant="primary" size="md">
                  See on a system
                </EditorialButton>
                <EditorialButton to="/brand#contact" variant="ghost" size="md">
                  Request a sample →
                </EditorialButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Finish picker — full swatch grid */}
      <Section tone="soft" size="lg">
        <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
          <div>
            <p className="eyebrow mb-5">The full collection</p>
            <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] tracking-tight leading-[1.1] max-w-[18ch]">
              Tap a finish. Watch the window change.
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex items-end gap-6 border-b border-[color:var(--rule-soft)]">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`pb-3 text-body-sm font-medium transition-colors duration-300 ease-marvin border-b-2 -mb-px min-h-[44px] flex items-end ${
                    active
                      ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                      : "text-[color:var(--ink-muted)] border-transparent hover:text-[color:var(--ink-primary)]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
          {filtered.map((f) => {
            const isSelected = f.id === selected.id;
            const fakeGrain = f.category === "wood-grain"
              ? `repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 4px)`
              : "none";
            return (
              <li key={f.id}>
                <button
                  onClick={() => setSelectedId(f.id)}
                  className="group block text-left w-full"
                  aria-pressed={isSelected}
                >
                  <div
                    className={`aspect-square w-full transition-all duration-300 ease-marvin ${
                      isSelected
                        ? "ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-[color:var(--canvas-soft)]"
                        : "ring-1 ring-[color:var(--rule-soft)] hover:ring-[color:var(--ink-primary)]"
                    }`}
                    style={{
                      backgroundColor: f.swatchHex,
                      backgroundImage: fakeGrain !== "none" ? fakeGrain : undefined,
                      backgroundBlendMode: fakeGrain !== "none" ? "multiply" : undefined,
                    }}
                  />
                  <p className={`mt-3 text-body-sm font-medium transition-colors duration-300 ease-marvin ${
                    isSelected ? "text-[color:var(--accent)]" : "text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)]"
                  }`}>
                    {f.label}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-muted)] mt-1">
                    {f.category === "wood-grain" ? "Wood grain" : "Solid"}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* The provenance — why these finishes */}
      <Section tone="canvas" size="md">
        <div className="grid lg:grid-cols-[5fr,7fr] gap-12 lg:gap-20">
          <div>
            <p className="eyebrow mb-5">How we chose</p>
            <h2 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1]">
              Eleven finishes, not eleven hundred.
            </h2>
          </div>
          <div className="space-y-5 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.7] max-w-[40rem]">
            <p>
              Other brands offer hundreds of swatches and call it choice. We chose eleven. The ones that work in Filipino homes, hold up in Filipino sun, and pair cleanly with the architectural materials already common here.
            </p>
            <p>
              The seven wood-grain laminates are heat-fused (not painted or printed), so they don't peel, chip, or fade. The four solid finishes use UV-stabilized pigments that hold their color through 25 years of tropical sun.
            </p>
            <p>
              Every finish is brochure-verified. None are conceptual. If you see it here, you
              can order it.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section tone="dark" size="md">
        <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
          <div>
            <p className="eyebrow !text-white/50 mb-5">Ready to pick?</p>
            <h2 className="font-serif text-h2 lg:text-h1 text-white tracking-tight leading-[1.1]">
              See the finish on a real system.
            </h2>
          </div>
          <div className="space-y-6">
            <ul className="flex flex-col divide-y divide-white/15 border-y border-white/15">
              <li>
                <Link
                  to="/products"
                  className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                >
                  <span className="text-body-lg font-medium">Browse all systems</span>
                  <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-marvin" />
                </Link>
              </li>
              <li>
                <Link
                  to="/design-tool"
                  className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                >
                  <span className="text-body-lg font-medium">Configure your own with the Design Tool</span>
                  <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-marvin" />
                </Link>
              </li>
              <li>
                <Link
                  to="/brand#showrooms"
                  className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                >
                  <span className="text-body-lg font-medium">Visit a showroom for physical samples</span>
                  <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-marvin" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default Finishes;

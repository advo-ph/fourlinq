import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialSplit from "@/components/primitives/EditorialSplit";
import FinishSwatch from "@/components/shared/FinishSwatch";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { FINISH_SCENES } from "@/data/finish-scenes";
import WindowPreview from "@/components/configurator/WindowPreview";
import { ArrowRight } from "lucide-react";

/**
 * /finishes: swatch-forward editorial catalog + live door recolour.
 *
 * Opens on the brochure-verified finishes (Wood grain / Solid), then a door
 * scene driven by WindowPreview so every swatch visibly recolours a real door
 * (SVG path — no inpainted assets required). Editorial splits follow.
 */

const WOOD_GRAIN = FRAME_FINISHES.filter((f) => f.category === "wood-grain");
const SOLID = FRAME_FINISHES.filter((f) => f.category === "solid");

const DOOR_SCENE = FINISH_SCENES.find((s) => s.id === "door");

const SwatchGroup = ({
  label,
  count,
  finishes,
  gridClassName,
}: {
  label: string;
  count: string;
  finishes: typeof FRAME_FINISHES;
  gridClassName: string;
}) => (
  <div>
    <Reveal className="flex items-baseline justify-between gap-6 border-b border-[color:var(--rule-soft)] pb-5">
      <h3 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight">
        {label}
      </h3>
      <span className="eyebrow shrink-0">{count}</span>
    </Reveal>
    <Stagger gap={0.06} className={`mt-10 grid ${gridClassName} gap-x-5 gap-y-8`}>
      {finishes.map((f) => (
        <StaggerItem key={f.id} className="group">
          <FinishSwatch
            finishId={f.id}
            color={f.swatchHex}
            size="lg"
            className="!w-full !h-auto aspect-square border-[color:var(--rule-soft)]"
          />
          <p className="mt-3 text-sm font-medium text-[color:var(--ink-primary)]">
            {f.label}
          </p>
          <p className="eyebrow mt-1">
            {f.category === "wood-grain" ? "Wood grain" : "Solid"}
          </p>
        </StaggerItem>
      ))}
    </Stagger>
  </div>
);

/** Live SVG door recolour — swatch click updates frameColor on WindowPreview. */
const DoorFinishPreview = () => {
  const defaultFinish =
    FRAME_FINISHES.find((f) => f.id === "white") ?? FRAME_FINISHES[0];
  const [activeFinishId, setActiveFinishId] = useState(defaultFinish.id);
  const activeFinish =
    FRAME_FINISHES.find((f) => f.id === activeFinishId) ?? defaultFinish;
  const productType = DOOR_SCENE?.productType ?? "entrance";

  return (
    <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12 lg:gap-16 items-center">
      <div>
        <Reveal>
          <p className="eyebrow mb-3">Try a finish</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
            Click a colour. Watch the door change.
          </h2>
          <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-md">
            {DOOR_SCENE?.description ??
              "Casement door finish preview. Every swatch recolours the frame and solid lower panel."}
          </p>
        </Reveal>
        <div
          className="mt-8 flex flex-wrap gap-3"
          role="listbox"
          aria-label="Finish colour for door preview"
        >
          {FRAME_FINISHES.map((finish) => {
            const selected = finish.id === activeFinishId;
            return (
              <button
                key={finish.id}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={finish.label}
                title={finish.label}
                onClick={() => setActiveFinishId(finish.id)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <FinishSwatch
                  finishId={finish.id}
                  color={finish.swatchHex}
                  size="md"
                  selected={selected}
                />
                <span
                  className={`text-[10px] leading-tight text-center max-w-[4.5rem] ${
                    selected
                      ? "text-[color:var(--ink-primary)] font-medium"
                      : "text-[color:var(--ink-muted)]"
                  }`}
                >
                  {finish.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="bg-card rounded-xl border border-border p-6 sm:p-8 flex flex-col items-center justify-center min-h-[360px]"
        data-finish-door-preview="true"
        data-active-finish={activeFinish.id}
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-primary/50 mb-4">
          {activeFinish.label}
        </p>
        <WindowPreview
          type={productType}
          frameColor={activeFinish.swatchHex}
          finishId={activeFinish.id}
          glassTint="rgba(200,220,240,0.1)"
          glassOpacity={0.1}
          width={1000}
          height={2200}
        />
      </div>
    </div>
  );
};

const Finishes = () => (
  <Layout>
    <PageHeader
      title="Twelve finishes"
      subtitle="Solid colours and wood-grain laminates on real profile. Click a swatch on the door below to see it live."
    />
    {/* The swatch showcase: the hero of the page */}
    <Section tone="canvas" size="lg">
      <div className="flex flex-col gap-20 lg:gap-28">
        <SwatchGroup
          label="Wood grain."
          count="Seven laminates"
          finishes={WOOD_GRAIN}
          gridClassName="grid-cols-4 sm:grid-cols-5 lg:grid-cols-7"
        />
        <SwatchGroup
          label="Solid."
          count="Five colors"
          finishes={SOLID}
          gridClassName="grid-cols-3 sm:grid-cols-5 lg:grid-cols-5"
        />
      </div>
    </Section>

    {/* Live door recolour — proves swatch → door colour on screen */}
    <Section tone="canvas" size="lg">
      <DoorFinishPreview />
    </Section>

    {/* How the finishes behave: editorial splits on real homes */}
    <Section tone="canvas" size="lg">
      <div className="flex flex-col gap-24 lg:gap-36">
        <EditorialSplit
          image="/images/projects/real/sliding-doors-lanai.webp"
          alt="Sliding lanai doors with solid-color FourlinQ frames"
          ratio="aspect-[4/3]"
          index="01"
        >
          <p className="eyebrow mb-3">The solids</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
            Color that holds.
          </h2>
          <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
            UV-stabilized pigment through the profile. Twenty-five years of sun,
            same color. No repaint, no chalking.
          </p>
        </EditorialSplit>

        <EditorialSplit
          image="/images/projects/real/arch-french-doors.webp"
          alt="Arched French doors in a wood-grain FourlinQ finish"
          flip
          ratio="aspect-[4/3]"
          index="02"
        >
          <p className="eyebrow mb-3">The wood grains</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
            Timber, without the upkeep.
          </h2>
          <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
            Heat-fused laminate, not print or paint. It wipes down like solid.
            No oiling, no sanding, no peel.
          </p>
        </EditorialSplit>
      </div>
    </Section>

    {/* CTA: kept from the original */}
    {/* noAnimation: dark band flush against the dark footer — container fade
        made the footer/background look animated. Inner Stagger still plays. */}
    <Section tone="dark" size="md" noAnimation>
      <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
        <Reveal>
          <p className="eyebrow text-white/55 mb-5">See it in place</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-white tracking-tight leading-[1.04]">
            Put the finish on a real system.
          </h2>
        </Reveal>
        <Stagger className="flex flex-col divide-y divide-white/15 border-y border-white/15">
          <StaggerItem>
            <Link to="/products" className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300">
              <span className="text-body-lg font-medium">Browse all systems</span>
              <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link to="/brand#showrooms" className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300">
              <span className="text-body-lg font-medium">Visit a showroom for physical samples</span>
              <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link to="/design-tool" className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300">
              <span className="text-body-lg font-medium">Open the design tool</span>
              <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </StaggerItem>
        </Stagger>
      </div>
    </Section>
  </Layout>
);

export default Finishes;

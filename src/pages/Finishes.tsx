import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EditorialSplit from "@/components/primitives/EditorialSplit";
import FinishSwatch from "@/components/shared/FinishSwatch";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { ArrowRight } from "lucide-react";

/**
 * /finishes: swatch-forward editorial catalog (2026-07-20 redesign).
 *
 * Opens straight on the twelve brochure-verified finishes: a FinishSwatch grid
 * grouped Wood grain / Solid (each group sized to a single row), straight from
 * FRAME_FINISHES. Editorial splits on real homes follow. No interaction, no
 * invented finishes.
 */

const WOOD_GRAIN = FRAME_FINISHES.filter((f) => f.category === "wood-grain");
const SOLID = FRAME_FINISHES.filter((f) => f.category === "solid");

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

const Finishes = () => (
  <Layout>
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
        </Stagger>
      </div>
    </Section>
  </Layout>
);

export default Finishes;

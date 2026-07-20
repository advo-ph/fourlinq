import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EditorialImage from "@/components/primitives/EditorialImage";
import EditorialSplit from "@/components/primitives/EditorialSplit";
import FullBleed from "@/components/primitives/FullBleed";
import Statement from "@/components/primitives/Statement";
import FinishSwatch from "@/components/shared/FinishSwatch";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { ArrowRight } from "lucide-react";

/**
 * /finishes: swatch-forward editorial catalog (2026-07-20 redesign).
 *
 * Cinematic hero, then the twelve brochure-verified finishes as the hero of the
 * page: FinishSwatch grid grouped Wood grain / Solid, straight from
 * FRAME_FINISHES. Statement moment + editorial splits on real homes. No
 * interaction, no invented finishes.
 */

const WOOD_GRAIN = FRAME_FINISHES.filter((f) => f.category === "wood-grain");
const SOLID = FRAME_FINISHES.filter((f) => f.category === "solid");

const SwatchGroup = ({
  label,
  count,
  finishes,
}: {
  label: string;
  count: string;
  finishes: typeof FRAME_FINISHES;
}) => (
  <div>
    <Reveal className="flex items-baseline justify-between gap-6 border-b border-[color:var(--rule-soft)] pb-5">
      <h3 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight">
        {label}
      </h3>
      <span className="eyebrow shrink-0">{count}</span>
    </Reveal>
    <Stagger
      gap={0.06}
      className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
    >
      {finishes.map((f) => (
        <StaggerItem key={f.id} className="group">
          <FinishSwatch
            finishId={f.id}
            color={f.swatchHex}
            size="lg"
            className="!w-full !h-auto aspect-square border-[color:var(--rule-soft)]"
          />
          <p className="mt-5 text-body font-medium text-[color:var(--ink-primary)]">
            {f.label}
          </p>
          <p className="eyebrow mt-1.5">
            {f.category === "wood-grain" ? "Wood grain" : "Solid"}
          </p>
        </StaggerItem>
      ))}
    </Stagger>
  </div>
);

const Finishes = () => (
  <Layout>
    {/* Cinematic hero: one photograph, one line */}
    <section className="relative h-[82vh] min-h-[560px] overflow-hidden">
      <EditorialImage
        src="/images/projects/real/residence-wood-clad.webp"
        alt="A FourlinQ home framed in wood-grain uPVC window profiles"
        ratio="h-full"
        eager
        scrim
      />
      <div className="absolute inset-0 flex items-end">
        <div className="container-editorial pb-12 lg:pb-20">
          <Stagger gap={0.1}>
            <StaggerItem>
              <p className="eyebrow text-white/80 mb-5">The finish catalog</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-serif font-normal text-white text-display leading-[0.98] tracking-tight max-w-[16ch]">
                Twelve finishes. Zero guesswork.
              </h1>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>

    {/* Statement moment */}
    <Section tone="canvas" size="xl">
      <Statement lines={["Seven wood grains.", "Five solids.", "Every one verified."]} dimFrom={2} />
      <Reveal delay={0.2}>
        <p className="mt-10 lg:mt-14 text-body-lg lg:text-lead text-[color:var(--ink-secondary)] leading-[1.55] max-w-[40rem]">
          Not hundreds of swatches dressed up as choice. A curated palette, held
          to European fenestration standards, proven under tropical sun and salt
          air. See it here, you can order it.
        </p>
      </Reveal>
    </Section>

    {/* The swatch showcase: the hero of the page */}
    <Section tone="canvas" size="md" className="!pt-0">
      <div className="flex flex-col gap-20 lg:gap-28">
        <SwatchGroup label="Wood grain." count="Seven laminates" finishes={WOOD_GRAIN} />
        <SwatchGroup label="Solid." count="Five colors" finishes={SOLID} />
      </div>
    </Section>

    {/* Full-bleed breather */}
    <FullBleed
      src="/images/projects/real/residence-wood-grain-corner.webp"
      alt="A two-storey FourlinQ residence with wood-grain corner glazing"
      ratio="aspect-[21/9]"
      caption="Wood grain, on a real facade. Heat-fused, not painted."
    />

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
    <Section tone="dark" size="md">
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

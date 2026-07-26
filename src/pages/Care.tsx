import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EditorialImage from "@/components/primitives/EditorialImage";
import EditorialSplit from "@/components/primitives/EditorialSplit";
import FullBleed from "@/components/primitives/FullBleed";
import Statement from "@/components/primitives/Statement";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { Droplets, Wrench, Sparkles, ShieldCheck, Calendar } from "lucide-react";

const routine = [
  {
    icon: <Droplets size={22} strokeWidth={1.5} />,
    when: "Every few months",
    title: "Clean the frames.",
    body: "Warm soapy water, a soft cloth, both sides of the sash. Wood-grain wipes down like solid. No oiling. No refinishing.",
    image: "/images/projects/real/residence-wood-clad.webp",
    alt: "A FourlinQ home with wood-clad uPVC window frames",
  },
  {
    icon: <Wrench size={22} strokeWidth={1.5} />,
    when: "Every 6 months",
    title: "Oil the hardware.",
    body: "One drop of light machine oil on hinge pins, locks, and rollers. Not more. Excess oil just collects dust.",
    image: "/images/projects/real/french-doors-conservatory.webp",
    alt: "French doors with visible hinges and locking hardware",
  },
  {
    icon: <Sparkles size={22} strokeWidth={1.5} />,
    when: "Every 6 months",
    title: "Clear the tracks.",
    body: "On Sliding and Slide & Fold, brush out the track. Grit wears rollers down faster than anything else.",
    image: "/images/projects/real/sliding-doors-lanai.webp",
    alt: "Sliding lanai doors on a FourlinQ home",
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.5} />,
    when: "Once a year",
    title: "Check the seals.",
    body: "Run a finger along the gasket. Soft, continuous, seated. Find a gap? Send a photo. We replace gaskets under warranty.",
    image: "/images/projects/real/special-shapes-glazing.webp",
    alt: "Close glazing detail on a special-shape FourlinQ window",
  },
  {
    icon: <Calendar size={22} strokeWidth={1.5} />,
    when: "After a storm",
    title: "Walk the perimeter.",
    body: "After a signal 3 or stronger, check every lock engages and every panel closes flush. Usually nothing. Occasionally the catch you're glad you found early.",
    image: "/images/projects/real/residence-wood-grain-corner.webp",
    alt: "A two-storey FourlinQ residence with full-height corner glazing",
  },
];

const avoid = [
  "Steel wool, scouring pads, abrasive scrubbers.",
  "Solvents. Thinner, acetone, lacquer cleaner.",
  "Bleach. It yellows uPVC over time.",
  "Pressure washers on high. They force water past the seals.",
  "DIY hardware fixes. Call us. The warranty covers it.",
];

const Care = () => (
  <Layout>
    {/* Cinematic hero — one photograph, one line, room to breathe */}
    <section className="relative h-[calc(var(--fq-lvh)*0.82)] min-h-[560px] overflow-hidden">
      <EditorialImage
        src="/images/projects/real/residence-wood-grain-corner.webp"
        alt="A FourlinQ residence with full-height wood-grain uPVC glazing"
        ratio="h-full"
        eager
        scrim
      />
      <div className="absolute inset-0 flex items-end">
        <div className="container-editorial pb-12 lg:pb-20">
          <Stagger gap={0.1}>
            <StaggerItem>
              <p className="eyebrow text-white/80 mb-5">Care guide</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-serif font-normal text-white text-display leading-[0.98] tracking-tight max-w-[14ch]">
                Built to outlast you.
              </h1>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>

    {/* Statement moment — the whole section is three phrases */}
    <Section tone="canvas" size="xl">
      <Statement lines={["No painting.", "No rust.", "No sanding."]} dimFrom={2} />
      <Reveal delay={0.2}>
        <p className="mt-10 lg:mt-14 text-body-lg lg:text-lead text-[color:var(--ink-secondary)] leading-[1.55] max-w-[40rem]">
          uPVC asks almost nothing of you. Five small habits keep the seals and
          hardware running long past the warranty.
        </p>
      </Reveal>
    </Section>

    {/* The routine — numbered editorial splits, alternating */}
    <Section tone="canvas" size="md" className="!pt-0">
      <div className="flex flex-col gap-24 lg:gap-36">
        {routine.map((r, i) => (
          <EditorialSplit
            key={r.title}
            image={r.image}
            alt={r.alt}
            flip={i % 2 === 1}
            ratio="aspect-[4/3]"
            index={String(i + 1).padStart(2, "0")}
          >
            <p className="text-[color:var(--accent)] mb-4">{r.icon}</p>
            <p className="eyebrow mb-3">{r.when}</p>
            <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
              {r.title}
            </h2>
            <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
              {r.body}
            </p>
          </EditorialSplit>
        ))}
      </div>
    </Section>

    {/* Full-bleed breather */}
    <FullBleed
      src="/images/projects/real/sliding-doors-interior.webp"
      alt="Interior view through FourlinQ sliding doors"
      ratio="aspect-[21/9]"
      caption="Twenty years from now, these still slide like the day they went in."
    />

    {/* What to avoid — dark, oversized */}
    <Section tone="dark" size="lg">
      <div className="grid gap-12 lg:grid-cols-[4fr,6fr] lg:gap-24 items-start">
        <Reveal>
          <p className="eyebrow text-white/55 mb-5">Never</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-white leading-[1.02] tracking-tight max-w-[12ch]">
            Five ways to wreck a finish.
          </h2>
        </Reveal>
        <Stagger className="flex flex-col divide-y divide-white/12 border-y border-white/12">
          {avoid.map((item, i) => (
            <StaggerItem key={item}>
              <p className="flex items-start gap-5 py-6 text-body-lg lg:text-lead text-white/90 leading-snug">
                <span className="text-[color:var(--accent)] font-serif text-h4 leading-none tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>

    {/* Warranty note */}
    <Section tone="canvas" size="lg">
      <Reveal className="border-l-2 border-[color:var(--accent)] pl-6 lg:pl-12 max-w-[46rem]">
        <p className="eyebrow mb-5">The fine print, unhidden</p>
        <p className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.12]">
          You don't have to do any of this to keep your warranty.
        </p>
        <p className="mt-6 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
          Ten years on profiles, five on hardware, covering normal use and
          weather. The routine buys you more life beyond that. If something
          fails before then, it's on us.
        </p>
      </Reveal>
    </Section>

    {/* CTA */}
    <Section tone="soft" size="md">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-24 lg:items-center">
        <Reveal>
          <p className="eyebrow mb-4">Something feels off?</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] tracking-tight leading-[1.04]">
            We'll come take a look.
          </h2>
        </Reveal>
        <Reveal from="up" delay={0.1} className="flex flex-wrap items-center gap-5 lg:justify-end">
          <EditorialButton to="/brand#contact" variant="primary" size="md">
            Contact us
          </EditorialButton>
          <EditorialButton to="/faq" variant="ghost" size="md">
            Read the FAQ
          </EditorialButton>
        </Reveal>
      </div>
    </Section>
  </Layout>
);

export default Care;

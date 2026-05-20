import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { Droplets, Wrench, ShieldCheck, Sparkles, AlertTriangle, Calendar } from "lucide-react";

const routines = [
  {
    icon: <Droplets size={20} strokeWidth={1.5} />,
    label: "Every few months",
    title: "Clean the frames.",
    body: "Warm soapy water and a soft cloth. Wipe down both sides of the frame and the sash. The wood-grain finishes wipe down the same way as solids — no oiling, no refinishing required.",
  },
  {
    icon: <Wrench size={20} strokeWidth={1.5} />,
    label: "Every 6 months",
    title: "Lubricate the hardware.",
    body: "A single drop of light machine oil on hinge pins, lock cylinders, and roller bearings keeps everything smooth. Don't over-apply — excess oil collects dust.",
  },
  {
    icon: <Sparkles size={20} strokeWidth={1.5} />,
    label: "Every 6 months",
    title: "Clear the tracks.",
    body: "On Sliding and Slide & Fold systems, brush or vacuum out the track. Dust and grit build up there and over time wear down the rollers faster than anything else.",
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={1.5} />,
    label: "Once a year",
    title: "Inspect the weatherseals.",
    body: "Run a finger along the rubber gasket inside the frame. It should be soft, continuous, and seated in its channel. If you find a gap or a flattened section, take a photo and send it to us — we replace gaskets under warranty.",
  },
  {
    icon: <Calendar size={20} strokeWidth={1.5} />,
    label: "After a major storm",
    title: "Walk the perimeter.",
    body: "After a signal-3 or stronger typhoon, check that all locks still engage smoothly, all panels still close flush, and there's no debris lodged in tracks or hinges. Report anything that doesn't feel right — most post-storm checks turn up nothing, but it's the right time to spot small issues before they become big ones.",
  },
];

const avoid = [
  "Abrasive scrubbers, steel wool, or scouring pads.",
  "Solvents — paint thinner, acetone, methylated spirits, lacquer cleaners.",
  "Bleach or chlorine-based cleaners — they can yellow uPVC over time.",
  "Pressure washers at high settings — can force water past weatherseals.",
  "DIY mechanical adjustments to hardware (call us, the warranty covers it).",
];

const Care = () => (
  <Layout>
    <PageHeader
      eyebrow="Care guide"
      title="Designed to outlast you. With a little help."
      breadcrumbLabel="Care"
      subtitle="FourlinQ uPVC systems need almost no maintenance — no painting, no rust-proofing, no annual sanding. But a small routine extends the life of the seals and hardware. Here's what we recommend."
    />

    {/* The routine */}
    <Section tone="canvas" size="lg" className="!pt-0">
      <EyebrowHeading eyebrow="The routine" level={2}>
        Five small habits.
      </EyebrowHeading>

      <ol className="mt-12 lg:mt-16 flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
        {routines.map((r, i) => (
          <li key={i} className="grid grid-cols-[auto,1fr] lg:grid-cols-[3rem,12rem,1fr] gap-x-6 gap-y-3 py-8 lg:py-10 items-start">
            <div className="text-[color:var(--ink-muted)] lg:pt-1">
              {r.icon}
            </div>
            <p className="eyebrow lg:pt-1 col-span-1 lg:col-span-1">{r.label}</p>
            <div className="col-span-2 lg:col-span-1">
              <h3 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">
                {r.title}
              </h3>
              <p className="text-body text-[color:var(--ink-secondary)] leading-[1.7] max-w-[34rem]">
                {r.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>

    {/* What to avoid */}
    <Section tone="soft" size="lg">
      <div className="grid lg:grid-cols-[5fr,6fr] gap-12 lg:gap-20">
        <div>
          <div className="flex items-start gap-3 mb-6">
            <div className="text-[color:var(--accent)] shrink-0 mt-1">
              <AlertTriangle size={20} strokeWidth={1.5} />
            </div>
            <EyebrowHeading eyebrow="What to avoid" level={2}>
              Five things that will damage the finish.
            </EyebrowHeading>
          </div>
          <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[28rem] leading-relaxed">
            uPVC is forgiving but not indestructible. These are the products and habits that will void the warranty or shorten the life of the finish.
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
          {avoid.map((item, i) => (
            <li key={i} className="py-4 text-body text-[color:var(--ink-primary)] leading-relaxed flex items-start gap-3">
              <span className="text-[color:var(--accent)] mt-1 shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>

    {/* Warranty note */}
    <Section tone="canvas" size="md">
      <div className="border-l-2 border-[color:var(--accent)] pl-6 lg:pl-8 max-w-[42rem]">
        <p className="eyebrow mb-3">Warranty note</p>
        <p className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight leading-snug">
          Following this routine isn't required to keep your warranty valid.
        </p>
        <p className="mt-4 text-body text-[color:var(--ink-secondary)] leading-relaxed">
          The 10-year warranty on profiles and 5-year warranty on hardware cover normal use and weather exposure. The routine above is about <em>maximizing</em> the life of the seals and rollers beyond the warranty period — not preserving the warranty itself. If anything goes wrong before then, we cover it.
        </p>
      </div>
    </Section>

    {/* CTA */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
        <EyebrowHeading eyebrow="Something wrong?" level={2} toneInverse>
          We'll come take a look.
        </EyebrowHeading>
        <div className="flex flex-wrap items-center gap-5">
          <EditorialButton to="/brand#contact" variant="primary" size="md">
            Contact us
          </EditorialButton>
          <EditorialButton to="/faq" variant="ghost" size="md" className="text-white hover:text-white">
            Read the FAQ →
          </EditorialButton>
        </div>
      </div>
    </Section>
  </Layout>
);

export default Care;

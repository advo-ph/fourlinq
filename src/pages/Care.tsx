import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { AlertTriangle, Droplets, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const routines = [
  {
    icon: <Droplets size={20} strokeWidth={1.5} />,
    label: "Start gently",
    title: "Wipe the frame.",
    body: "Use a soft cloth with mild soapy water for routine surface cleaning. Test a small area first, rinse away residue, and ask FourlinQ for finish-specific guidance before using anything stronger.",
  },
  {
    icon: <Wrench size={20} strokeWidth={1.5} />,
    label: "Before applying a product",
    title: "Confirm the hardware guidance.",
    body: "Do not assume one lubricant suits every hinge, lock, or roller. Ask FourlinQ for the installed hardware maker's current instructions before lubricating, adjusting, or removing a part.",
  },
  {
    icon: <Sparkles size={20} strokeWidth={1.5} />,
    label: "As debris appears",
    title: "Clear the tracks.",
    body: "Remove loose dry debris from an accessible track with a soft brush or low-suction vacuum. Stop if a panel binds, a drain path is unclear, or cleaning would require disassembly.",
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={1.5} />,
    label: "When something changes",
    title: "Document, then ask.",
    body: "Photograph a loose seal, new leak, unusual noise, binding panel, damaged finish, or hardware change before attempting a repair. Send the photo with the project reference so FourlinQ can advise the next step.",
  },
];

const avoid = [
  "Abrasive scrubbers, steel wool, or scouring pads.",
  "Solvents: paint thinner, acetone, methylated spirits, lacquer cleaners.",
  "Bleach or chlorine-based cleaners unless the current finish guide explicitly permits them.",
  "Pressure washing directly at joints, drainage paths, gaskets, or hardware.",
  "Mechanical adjustment, glazing removal, gasket replacement, or disassembly without system-specific instructions.",
];

const Care = () => (
  <Layout>
    <PageHeader
      eyebrow="Care guide"
      title="Start with gentle, system-specific care."
      breadcrumbLabel="Care"
      subtitle="This is a conservative public checklist, not a manufacturer service manual. The exact cleaner, lubricant, interval, adjustment, and warranty condition depend on the installed profile, finish, glass, and hardware."
    />

    {/* The routine */}
    <Section tone="canvas" size="lg" className="!pt-0">
      <EyebrowHeading eyebrow="The routine" level={2}>
        Four careful habits.
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
            Until FourlinQ supplies the current instructions for your installed system, avoid methods that can scratch a finish, force water into joints, or alter hardware. This list does not define warranty exclusions.
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
          This page does not define warranty validity.
        </p>
        <p className="mt-4 text-body text-[color:var(--ink-secondary)] leading-relaxed">
          FourlinQ's brochure states a 10-year limited warranty, but the public source does not provide a separate hardware term or the complete maintenance conditions. Request the current written warranty and care guidance for your order before relying on either.
        </p>
      </div>
    </Section>

    {/* CTA */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
        <EyebrowHeading eyebrow="Something wrong?" level={2} toneInverse>
          Ask before you adjust or repair it.
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

import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { benefits, comparisonData } from "@/data/benefits";
import { Eye, Flame, Sun, Shield, Clock, CloudRain, VolumeX, Droplets, Wind } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Eye size={22} strokeWidth={1.5} />,
  flame: <Flame size={22} strokeWidth={1.5} />,
  sun: <Sun size={22} strokeWidth={1.5} />,
  shield: <Shield size={22} strokeWidth={1.5} />,
  clock: <Clock size={22} strokeWidth={1.5} />,
  "cloud-rain": <CloudRain size={22} strokeWidth={1.5} />,
  "volume-x": <VolumeX size={22} strokeWidth={1.5} />,
};

const climate = [
  { icon: <Sun size={20} strokeWidth={1.5} />, title: "Tropical heat", body: "Multi-chamber profile design traps air to reduce heat transfer, keeping interiors cooler and lowering energy consumption." },
  { icon: <Droplets size={20} strokeWidth={1.5} />, title: "Coastal humidity", body: "Unlike steel, uPVC never rusts — ideal for the Philippine climate with its humidity, salt air, and heavy rainfall." },
  { icon: <Wind size={20} strokeWidth={1.5} />, title: "Storm conditions", body: "EPDM gaskets and drainage holes ensure a tight seal against rain, wind, and storm conditions — built for tropical weather." },
];

const WhyUpvc = () => (
  <Layout>
    <PageHeader
      eyebrow="The material"
      title="Why uPVC."
      breadcrumbLabel="Why uPVC"
      subtitle="Superior thermal performance, zero maintenance, and typhoon-grade durability — engineered for Philippine homes."
    />

    {/* Benefits — editorial two-column list */}
    <Section tone="canvas" size="lg">
      <EyebrowHeading eyebrow="What you get" level={2}>
        Built for how you actually live.
      </EyebrowHeading>
      <ul className="mt-12 lg:mt-16 grid md:grid-cols-2 gap-x-12 gap-y-10 lg:gap-y-14">
        {benefits.map((benefit) => (
          <li key={benefit.id} className="flex gap-5">
            <div className="shrink-0 text-[color:var(--ink-muted)] mt-1">{iconMap[benefit.icon]}</div>
            <div>
              <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-2">{benefit.title}</h3>
              <p className="text-body-sm lg:text-body text-[color:var(--ink-secondary)] leading-[1.6]">
                {benefit.shortDescription}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>

    {/* Comparison — editorial table */}
    <Section tone="soft" size="lg">
      <EyebrowHeading eyebrow="Material comparison" level={2}>
        How uPVC stacks up.
      </EyebrowHeading>
      <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[36rem]">
        Side-by-side against aluminium and timber — the two materials uPVC most often replaces in residential construction.
      </p>

      <div className="mt-12 lg:mt-16 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-t-2 border-b border-[color:var(--ink-primary)]">
              <th className="py-4 pr-6 text-[11px] tracking-[0.12em] uppercase font-medium text-[color:var(--ink-muted)]">Feature</th>
              <th className="py-4 px-4 text-[11px] tracking-[0.12em] uppercase font-medium text-[color:var(--ink-primary)]">uPVC</th>
              <th className="py-4 px-4 text-[11px] tracking-[0.12em] uppercase font-medium text-[color:var(--ink-muted)]">Aluminium</th>
              <th className="py-4 pl-4 text-[11px] tracking-[0.12em] uppercase font-medium text-[color:var(--ink-muted)]">Timber</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row) => (
              <tr key={row.feature} className="border-b border-[color:var(--rule-soft)]">
                <td className="py-4 pr-6 text-body-sm font-medium text-[color:var(--ink-primary)] align-top">{row.feature}</td>
                <td className="py-4 px-4 text-body-sm text-[color:var(--ink-primary)] font-medium align-top">{row.upvc}</td>
                <td className="py-4 px-4 text-body-sm text-[color:var(--ink-muted)] align-top">{row.aluminium}</td>
                <td className="py-4 pl-4 text-body-sm text-[color:var(--ink-muted)] align-top">{row.timber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    {/* Climate */}
    <Section tone="canvas" size="lg">
      <EyebrowHeading eyebrow="The Philippine climate" level={2}>
        Three forces. One material.
      </EyebrowHeading>
      <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[36rem]">
        Unique challenges demand more from your windows and doors.
      </p>
      <ul className="mt-12 lg:mt-16 grid md:grid-cols-3 gap-px bg-[color:var(--rule-soft)]">
        {climate.map((item) => (
          <li key={item.title} className="bg-white p-7 lg:p-8">
            <div className="text-[color:var(--ink-muted)] mb-5">{item.icon}</div>
            <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-3">{item.title}</h3>
            <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.6]">{item.body}</p>
          </li>
        ))}
      </ul>
    </Section>

    {/* CTA */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
        <EyebrowHeading eyebrow="Ready to upgrade?" level={2} toneInverse>
          Explore our full range of uPVC systems.
        </EyebrowHeading>
        <div className="flex flex-wrap items-center gap-5">
          <EditorialButton to="/products" variant="primary" size="md">Browse Systems</EditorialButton>
          <EditorialButton to="/design-tool" variant="ghost" size="md" className="text-white hover:text-white">
            Open Design Tool
          </EditorialButton>
        </div>
      </div>
    </Section>
  </Layout>
);

export default WhyUpvc;

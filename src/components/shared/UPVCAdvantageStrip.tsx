/**
 * uPVC Advantage Strip — 6 PH-context-specific advantages, shown on every
 * system landing page.
 *
 * K&M ships a generic "8 Advantages" list copied from European boilerplate
 * (audit §3). Our version reframes each advantage around the actual
 * Philippine climate — typhoons, salt air, monsoon humidity, dB-cited noise,
 * lead-free formulation, made-to-measure local fabrication.
 *
 * Numbers cited are from FourlinQ brochure / verified specs. No fabrication.
 */

interface Advantage {
  number: string;
  title: string;
  body: string;
}

const advantages: Advantage[] = [
  {
    number: "01",
    title: "Built for Philippine typhoons",
    body: "Multi-chamber profiles with galvanized steel reinforcement, engineered to withstand sustained design-load wind pressure. Standard hardware tested against monsoon-driven rain ingress.",
  },
  {
    number: "02",
    title: "Salt-air resistant",
    body: "uPVC profiles never rust or corrode. The material is inherently inert, so it stays dimensionally stable in coastal salt air without needing protective coatings.",
  },
  {
    number: "03",
    title: "Quiet, thermally sealed",
    body: "EPDM gasket assembly plus 6–12 mm glazing options reduce exterior noise and slow heat transfer. Relevant for bedrooms next to busy roads and west-facing walls that take afternoon sun.",
  },
  {
    number: "04",
    title: "Lead-free uPVC",
    body: "FourlinQ profile compound is lead-free, meeting modern PH residential health standards. No painting, repainting, or sealant refresh required across the warranty life.",
  },
  {
    number: "05",
    title: "10-year system warranty",
    body: "Structural performance, weather seal integrity, and finish stability. Covered for ten years from installation. The warranty period matches what we have observed in the field across our installs.",
  },
  {
    number: "06",
    title: "Made-to-measure, locally",
    body: "Every system is custom-fabricated in our Manila workshop, sized to your architect's drawings. No European shipping lead times, no standard-size compromise on the lanai opening.",
  },
];

const UPVCAdvantageStrip = () => (
  <div>
    <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8 mb-12 lg:mb-16">
      <div className="lg:col-span-5">
        <p className="eyebrow mb-4">Why FourlinQ</p>
        <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
          Six advantages, each engineered for the Philippine climate.
        </h2>
      </div>
      <p className="lg:col-span-6 lg:col-start-7 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] self-end">
        Other uPVC manufacturers publish the same European boilerplate
        advantages list. Ours is rewritten around the actual conditions a
        Philippine home will put a window through. Typhoon-driven rain,
        salt air, west-facing afternoon sun, and twenty monsoon seasons.
      </p>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
      {advantages.map((a) => (
        <li key={a.number} className="border-t border-[color:var(--rule-soft)] pt-5">
          <p className="font-serif text-[40px] lg:text-[48px] leading-none tracking-tight text-[color:var(--ink-faint)] mb-4">
            {a.number}
          </p>
          <h3 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight leading-snug mb-3">
            {a.title}
          </h3>
          <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
            {a.body}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

export default UPVCAdvantageStrip;

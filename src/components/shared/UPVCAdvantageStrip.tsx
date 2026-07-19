import { ADVANTAGES } from "@/data/fourlinq-data";

/** Brochure-listed uPVC advantages. Project-specific ratings stay out. */

interface Advantage {
  number: string;
  title: string;
  body: string;
}

const advantage: Advantage[] = ADVANTAGES.map((item, index) => ({
  number: String(index + 1).padStart(2, "0"),
  title: item.label,
  body: item.description,
}));

const UPVCAdvantageStrip = () => (
  <div>
    <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8 mb-12 lg:mb-16">
      <div className="lg:col-span-5">
        <p className="eyebrow mb-4">Why FourlinQ</p>
        {/* TODO: client copy — section h2 needs brochure-verified replacement */}
        <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
          Seven brochure-listed uPVC advantages.
        </h2>
      </div>
      <p className="lg:col-span-6 lg:col-start-7 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] self-end">
        These descriptions come from FourlinQ's verified brochure data. They are general material statements, not product-specific test ratings or a substitute for the proposed system evidence.
      </p>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
      {advantage.map((a) => (
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

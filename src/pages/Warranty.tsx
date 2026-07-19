import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import EditorialButton from "@/components/primitives/Button";
import { BRAND, CONTACT } from "@/data/fourlinq-data";

/**
 * /warranty — dedicated warranty page.
 * Milgard audit §6 pattern: warranty as oxygen, not footer.
 *
 * Photo-led layout: hero install, per-scope material/hardware photo,
 * per-step contextual photo. Each section gets a real photograph instead
 * of a wall of text.
 */

const Warranty = () => (
  <Layout>
    <PageHeader
      eyebrow="The promise"
      title="The brochure states a 10-year limited warranty."
      breadcrumbLabel="Warranty"
      subtitle="This page summarizes the four scope labels in FourlinQ's verified brochure. It is not the full warranty, and it does not add coverage, exclusions, remedies, or service timelines that are absent from the source."
    />

    <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
      <div className="container-editorial">
        {/* Headline statement + the 10 stat — split with hero install photo */}
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 mb-20 lg:mb-28">
          <div className="lg:col-span-7">
            <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
              FourlinQ's brochure names a 10-year limited warranty and four scope areas. Before ordering, ask for the current written terms for your exact system and compare them with the quotation. Those documents—not this web summary—define the warranty.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="eyebrow mb-4">In one number</p>
            <p className="font-serif text-[88px] lg:text-[112px] leading-none text-[color:var(--accent)] tracking-tight">
              10
            </p>
            <p className="mt-2 text-body-sm text-[color:var(--ink-secondary)] uppercase tracking-[0.1em]">
              Years
            </p>
          </div>
        </div>

        {/* Hero install photo */}
        <div className="mb-24 lg:mb-32">
          <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-[color:var(--canvas-soft)]">
            <img
              src="/images/wp-export/FourlinQ-Project-7.jpg"
              alt="Modern residence with FourlinQ casement and sliding windows installed throughout"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* What's covered — 4 scope cards each with their own photo */}
        <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 mb-24 lg:mb-32">
          <p className="eyebrow mb-5">What's covered</p>
          <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)] mb-12 lg:mb-16 max-w-3xl">
            Four brochure-listed areas.
          </h2>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14 lg:gap-y-20">
            {BRAND.warrantyScope.map((scope, i) => {
              const photo = scopePhoto[scope];
              return (
                <li key={scope}>
                  {photo && (
                    <div className="aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)] mb-6">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="font-serif text-[32px] lg:text-[40px] leading-none text-[color:var(--ink-faint)] mb-3 tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">
                    {scope}
                  </h3>
                  <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65] max-w-md">
                    {scopeDescription[scope] || "Listed in the brochure warranty summary. Ask for the current written definition and conditions."}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The honest part — kept text-only, this is the legal-disclosure tone */}
        <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8">
            <div className="lg:col-span-4">
              <p className="eyebrow mb-3">What is not published here</p>
              <h2 className="font-serif text-h3 lg:text-h2 leading-[1.1] tracking-tight text-[color:var(--ink-primary)]">
                The full terms and exclusions.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ul className="space-y-5 text-body text-[color:var(--ink-secondary)] leading-[1.65]">
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>Which products, components, finishes, glass, hardware, labor, and project conditions are eligible.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>When coverage begins, whether registration is required, whether it can transfer, and what records must be kept.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>The exclusions, limits, required maintenance, claim evidence, inspection process, remedy, and who pays associated costs.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>Any system-specific performance rating or warranty condition that may differ from the brochure summary.</span>
                </li>
              </ul>
              <p className="mt-8 text-body-sm text-[color:var(--ink-muted)] italic leading-[1.65]">
                This site does not currently host a verified warranty document. Request the current copy and keep the version that accompanies your signed order.
              </p>
            </div>
          </div>
        </div>

        {/* How it works — 3 steps each with their own photo */}
        <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 mb-24 lg:mb-32">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="font-serif text-h3 lg:text-h2 leading-[1.1] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14">
            Three steps before you rely on it.
          </h2>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {warrantyStep.map(({ step, title, body, photo }) => (
              <li key={step}>
                {photo && (
                  <div className="aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)] mb-6">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="font-serif text-[40px] leading-none text-[color:var(--accent)] mb-4 tracking-tight">
                  {step}
                </p>
                <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">
                  {title}
                </h3>
                <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Authority — numeric trust strip */}
        <div className="border-t border-[color:var(--rule-soft)] pt-16 lg:pt-20 mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8 items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-3">What this page can verify</p>
              <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
                A bounded public summary.
              </h2>
              <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] max-w-xl">
                The public source supports the 10-year label and four scope names. It does not support a universal performance promise, a service deadline, or a complete legal interpretation. FourlinQ should confirm those details in writing for the selected system.
              </p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <ul className="space-y-6">
                <li>
                  <p className="font-serif text-h2 lg:text-h1 leading-none text-[color:var(--ink-primary)] tracking-tight">12</p>
                  <p className="mt-2 text-body-sm text-[color:var(--ink-muted)] uppercase tracking-[0.1em]">uPVC finishes in the verified library</p>
                </li>
                <li className="border-t border-[color:var(--rule-soft)] pt-6">
                  <p className="font-serif text-h2 lg:text-h1 leading-none text-[color:var(--ink-primary)] tracking-tight">3</p>
                  <p className="mt-2 text-body-sm text-[color:var(--ink-muted)] uppercase tracking-[0.1em]">Published FourlinQ locations</p>
                </li>
                <li className="border-t border-[color:var(--rule-soft)] pt-6">
                  <p className="font-serif text-h2 lg:text-h1 leading-none text-[color:var(--ink-primary)] tracking-tight">10</p>
                  <p className="mt-2 text-body-sm text-[color:var(--ink-muted)] uppercase tracking-[0.1em]">Year limited-warranty brochure label</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Closing CTA — paired with a showroom-feel photo */}
        <div className="border-t border-[color:var(--rule-soft)] pt-16 lg:pt-20">
          <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-center">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-4">Next</p>
              <h2 className="font-serif text-h2 lg:text-h1 tracking-tight text-[color:var(--ink-primary)] leading-[1.05] mb-6">
                Ask to review the current terms.
              </h2>
              <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] mb-10">
                Contact FourlinQ before ordering and ask for the exact warranty document tied to the proposed system. A visit to a confirmed location can help you inspect available systems and samples, but it does not replace written terms.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">
                <EditorialButton to="/brand#showrooms" variant="primary" size="lg">
                  View locations
                </EditorialButton>
                <Link to="/why-upvc" className="text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin underline-offset-4 hover:underline">
                  Why uPVC →
                </Link>
              </div>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <div className="aspect-[4/5] overflow-hidden bg-[color:var(--canvas-soft)]">
                <img
                  src="/images/wp-export/FQC-Project-17.jpg"
                  alt="A FourlinQ installation seen from inside, garden view through the glass"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

// Per-scope photo: real brochure material/hardware shots
const scopePhoto: Record<string, { src: string; alt: string }> = {
  "Corrosion resistance": {
    src: "/images/wp-export/Corrosion-Resistance.jpg",
    alt: "Brochure image associated with corrosion resistance",
  },
  "Long lasting performance": {
    src: "/images/wp-export/Stainless-Mechanism-e1568775693636.jpg",
    alt: "Close-up of operating hardware from the FourlinQ image library",
  },
  "Weather resistance": {
    src: "/images/wp-export/Air-Water-Tight.jpg",
    alt: "Brochure image of a gasket and profile assembly",
  },
  "Sound insulation": {
    src: "/images/wp-export/Sound-Insulation.jpg",
    alt: "Brochure image associated with sound insulation",
  },
};

// The brochure supplies only these scope labels. The descriptions below keep
// that boundary visible and do not infer legal coverage.
const scopeDescription: Record<string, string> = {
  "Corrosion resistance":
    "Listed in the brochure warranty summary. Ask which material, component, environment, and remedy the current written terms cover.",
  "Long lasting performance":
    "Listed in the brochure warranty summary. Ask how performance is measured and which profile, hardware, glass, finish, labor, and maintenance conditions apply.",
  "Weather resistance":
    "Listed in the brochure warranty summary. Ask for the tested system rating, installation conditions, exclusions, and claim evidence for the proposed opening.",
  "Sound insulation":
    "Listed in the brochure warranty summary. It is not a published decibel guarantee; ask for the exact glazing and system evidence before relying on an acoustic target.",
};

// Three verification steps with contextual photos.
const warrantyStep = [
  {
    step: "01",
    title: "Request the terms",
    body: "Ask FourlinQ for the current warranty document before you approve the order. Confirm the version date and the legal or business name issuing it.",
    photo: {
      src: "/images/wp-export/Casement-Window.jpg",
      alt: "A finished FourlinQ casement window installation",
    },
  },
  {
    step: "02",
    title: "Match the system",
    body: "Check that the quoted profile, glass, hardware, finish, installation scope, project location, and any registration requirement match the written terms.",
    photo: {
      src: "/images/wp-export/Black-Profile.jpg",
      alt: "FourlinQ profile finish detail",
    },
  },
  {
    step: "03",
    title: "Keep the record",
    body: `Keep the signed order, warranty version, invoices, and handover records. For a possible claim, contact ${CONTACT.mobileAssist} or ${CONTACT.email} and ask for the current process before arranging repair work.`,
    photo: {
      src: "/images/wp-export/Stainless-Mechanisms.jpg",
      alt: "FourlinQ stainless steel mechanism close-up",
    },
  },
];

export default Warranty;

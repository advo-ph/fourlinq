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
      title="A 10-year warranty, written down."
      breadcrumbLabel="Warranty"
      subtitle="Every FourlinQ window and door is backed by a 10-year warranty covering the system's structural performance, weather resistance, and finish integrity."
    />

    <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
      <div className="container-editorial">
        {/* Headline statement + the 10 stat — split with hero install photo */}
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 mb-20 lg:mb-28">
          <div className="lg:col-span-7">
            <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
              A FourlinQ system is engineered to last decades. The 10-year warranty is our way of putting that engineering in writing. And we stand behind it long after the install crew has gone home.
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
            Four areas, no surprises.
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
                    {scopeDescriptions[scope] || "Covered for the full 10-year warranty term."}
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
              <p className="eyebrow mb-3">The honest part</p>
              <h2 className="font-serif text-h3 lg:text-h2 leading-[1.1] tracking-tight text-[color:var(--ink-primary)]">
                What the warranty doesn't cover.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <ul className="space-y-5 text-body text-[color:var(--ink-secondary)] leading-[1.65]">
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>Damage from impact, modification, or installation by anyone other than a FourlinQ-authorized team.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>Cosmetic wear that doesn't affect structural performance, like minor surface scuffs from cleaning equipment or hardware patina from repeated use.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>Failures caused by structural movement of the building itself, or by glazing replaced with third-party glass.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[color:var(--ink-faint)] font-serif shrink-0 w-8">—</span>
                  <span>Damage from natural events that exceed engineered design loads (typhoon Category 5 sustained winds, direct seismic foundation movement).</span>
                </li>
              </ul>
              <p className="mt-8 text-body-sm text-[color:var(--ink-muted)] italic leading-[1.65]">
                Full terms ship with every order. Printed, signed, and dated. We'll walk you through them at the showroom.
              </p>
            </div>
          </div>
        </div>

        {/* How it works — 3 steps each with their own photo */}
        <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 mb-24 lg:mb-32">
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="font-serif text-h3 lg:text-h2 leading-[1.1] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14">
            Three steps. No paperwork burden.
          </h2>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {STEPS.map(({ step, title, body, photo }) => (
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
              <p className="eyebrow mb-3">Why we can stand behind it</p>
              <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
                Engineered for Philippine homes — not imported into them.
              </h2>
              <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] max-w-xl">
                The warranty isn't a marketing decision. It's the number that matches what we've seen across FourlinQ installations in Metro Manila, Cebu, Tagaytay, and the coast. Profiles that look the same after a decade of sun. Hardware that still operates smoothly after a thousand monsoons.
              </p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <ul className="space-y-6">
                <li>
                  <p className="font-serif text-h2 lg:text-h1 leading-none text-[color:var(--ink-primary)] tracking-tight">11</p>
                  <p className="mt-2 text-body-sm text-[color:var(--ink-muted)] uppercase tracking-[0.1em]">Brochure-verified finishes</p>
                </li>
                <li className="border-t border-[color:var(--rule-soft)] pt-6">
                  <p className="font-serif text-h2 lg:text-h1 leading-none text-[color:var(--ink-primary)] tracking-tight">4</p>
                  <p className="mt-2 text-body-sm text-[color:var(--ink-muted)] uppercase tracking-[0.1em]">Showrooms across Metro Manila and Cebu</p>
                </li>
                <li className="border-t border-[color:var(--rule-soft)] pt-6">
                  <p className="font-serif text-h2 lg:text-h1 leading-none text-[color:var(--ink-primary)] tracking-tight">10</p>
                  <p className="mt-2 text-body-sm text-[color:var(--ink-muted)] uppercase tracking-[0.1em]">Year standard system warranty</p>
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
                Walk into a showroom. See the warranty in person.
              </h2>
              <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] mb-10">
                The fastest way to feel confident about a 10-year promise is to feel a 10-year-old FourlinQ window in your hands. There's one at every showroom, installed back when we were founding the company.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">
                <EditorialButton to="/brand#showrooms" variant="primary" size="lg">
                  Visit a Showroom
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
    alt: "uPVC profile demonstrating corrosion resistance",
  },
  "Long lasting performance": {
    src: "/images/wp-export/Stainless-Mechanism-e1568775693636.jpg",
    alt: "FourlinQ stainless steel operating hardware",
  },
  "Weather resistance": {
    src: "/images/wp-export/Air-Water-Tight.jpg",
    alt: "Air and water tight EPDM gasket assembly on FourlinQ profile",
  },
  "Sound insulation": {
    src: "/images/wp-export/Sound-Insulation.jpg",
    alt: "Sound-insulating multi-chamber uPVC profile assembly",
  },
};

// Short descriptions per warranty scope, sourced from BRAND.warrantyScope semantics.
const scopeDescriptions: Record<string, string> = {
  "Corrosion resistance":
    "uPVC profiles never rust or corrode. Multi-chamber design, galvanized-steel reinforcement, and EPDM gaskets are warranted against material degradation through the full term.",
  "Long lasting performance":
    "Operating hardware (hinges, rollers, locks, handles) engineered for decades of daily use. Covered against mechanical failure under normal residential operation.",
  "Weather resistance":
    "Sealed against monsoon rain, salt-air corrosion, and the daily thermal cycling of the Philippine climate. Covered against air-water-wind penetration that arises from the system itself, not from building movement.",
  "Sound insulation":
    "Multi-chamber profiles plus 6–12 mm glazing options reduce exterior noise. Covered against acoustic degradation of the seal assembly through the warranty term.",
};

// Three steps with contextual photos
const STEPS = [
  {
    step: "01",
    title: "Installed",
    body: "When the FourlinQ team finishes your install, the warranty period begins automatically. Your project file is logged in our database; you don't need to do anything.",
    photo: {
      src: "/images/wp-export/Casement-Window.jpg",
      alt: "A finished FourlinQ casement window installation",
    },
  },
  {
    step: "02",
    title: "Recorded",
    body: "We send you a signed warranty certificate by email and post within fourteen days. Keep it with your house papers. Or call us if you can't find it. We have the record.",
    photo: {
      src: "/images/wp-export/Black-Profile.jpg",
      alt: "FourlinQ profile finish detail",
    },
  },
  {
    step: "03",
    title: "Honored",
    body: `If anything covered by the warranty fails within ten years, call ${CONTACT.mobileAssist} or email ${CONTACT.email}. We'll schedule a site visit within a week and resolve it at no cost.`,
    photo: {
      src: "/images/wp-export/Stainless-Mechanisms.jpg",
      alt: "FourlinQ stainless steel mechanism close-up",
    },
  },
];

export default Warranty;

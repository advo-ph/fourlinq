import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EditorialImage from "@/components/primitives/EditorialImage";
import Statement from "@/components/primitives/Statement";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { BRAND, CONTACT } from "@/data/fourlinq-data";

/**
 * /warranty — the promise, photo-led and cut to the bone.
 * Milgard audit §6: warranty as oxygen, not footer.
 */

const Warranty = () => (
  <Layout>
    {/* Cinematic hero */}
    <section className="relative h-[calc(var(--fq-lvh)*0.78)] min-h-[540px] overflow-hidden">
      <EditorialImage
        src="/images/wp-export/FourlinQ-Project-7.jpg"
        alt="Modern residence with FourlinQ casement and sliding windows installed throughout"
        ratio="h-full"
        eager
        scrim
      />
      <div className="absolute inset-0 flex items-end">
        <div className="container-editorial pb-12 lg:pb-20">
          <Stagger gap={0.1}>
            <StaggerItem>
              <p className="eyebrow text-white/80 mb-5">The promise</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-serif font-normal text-white text-display leading-[0.98] tracking-tight max-w-[13ch]">
                Backed for ten years.
              </h1>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>

    {/* The number */}
    <Section tone="canvas" size="xl">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
        <Reveal className="lg:col-span-7">
          <p className="font-serif text-h3 lg:text-h2 leading-[1.15] text-[color:var(--ink-primary)] tracking-tight max-w-[20ch]">
            Engineering, put in writing.
          </p>
          <p className="mt-6 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-[40rem]">
            A FourlinQ system is built to last decades. The ten-year limited
            warranty is us standing behind it, long after the crew drives off.
          </p>
        </Reveal>
        <Reveal from="up" delay={0.1} className="lg:col-span-4 lg:col-start-9">
          <p className="eyebrow mb-3">In one number</p>
          <p className="font-serif text-display leading-none text-[color:var(--accent)] tracking-tight">10</p>
          <p className="mt-2 text-body-sm text-[color:var(--ink-secondary)] uppercase tracking-[0.1em]">Years</p>
        </Reveal>
      </div>
    </Section>

    {/* What's covered — 4 scope cards, staggered */}
    <Section tone="canvas" size="md" className="!pt-0">
      <Reveal>
        <p className="eyebrow mb-5">What's covered</p>
        <h2 className="font-serif text-h2 lg:text-h1 leading-[1.04] tracking-tight text-[color:var(--ink-primary)] mb-12 lg:mb-16 max-w-[16ch]">
          Four areas. No surprises.
        </h2>
      </Reveal>
      <Stagger gap={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14 lg:gap-y-20">
        {BRAND.warrantyScope.map((scope, i) => {
          const photo = scopePhoto[scope];
          return (
            <StaggerItem key={scope}>
              {photo && (
                <EditorialImage src={photo.src} alt={photo.alt} ratio="aspect-[4/3]" className="mb-6" />
              )}
              {/* Brand red — matches the EditorialSplit index numerals (client
                  comment: numbered markers should be red, not grey). */}
              <p className="font-serif text-h3 leading-none text-[color:var(--accent)] mb-3 tracking-tight">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">{scope}</h3>
              <p className="text-body text-[color:var(--ink-secondary)] leading-[1.6] max-w-md">
                {scopeDescriptions[scope] || "Covered for the full ten-year limited warranty term."}
              </p>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>

    {/* What it doesn't cover — dark, honest */}
    <Section tone="dark" size="lg">
      <div className="grid gap-12 lg:grid-cols-[4fr,6fr] lg:gap-24 items-start">
        <Reveal>
          <p className="eyebrow text-white/55 mb-5">The honest part</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-white leading-[1.02] tracking-tight max-w-[12ch]">
            What it doesn't cover.
          </h2>
        </Reveal>
        <div>
          <Stagger className="flex flex-col divide-y divide-white/12 border-y border-white/12">
            {EXCLUSIONS.map((item, i) => (
              <StaggerItem key={item}>
                <p className="flex items-start gap-5 py-6 text-body-lg text-white/90 leading-snug">
                  <span className="text-[color:var(--accent)] font-serif text-h4 leading-none tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <p className="mt-8 text-body-sm text-white/55 italic leading-[1.6]">
              Full terms ship with every order. Printed, signed, dated. We walk
              you through them at the showroom.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>

    {/* How it works — 3 steps */}
    <Section tone="canvas" size="lg">
      <Reveal>
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="font-serif text-h2 lg:text-h1 leading-[1.04] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14 max-w-[18ch]">
          Three steps. No paperwork.
        </h2>
      </Reveal>
      <Stagger gap={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
        {STEPS.map(({ step, title, body, photo }) => (
          <StaggerItem key={step}>
            {photo && (
              <EditorialImage src={photo.src} alt={photo.alt} ratio="aspect-[4/3]" className="mb-6" />
            )}
            <p className="font-serif text-h2 leading-none text-[color:var(--accent)] mb-4 tracking-tight">{step}</p>
            <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">{title}</h3>
            <p className="text-body text-[color:var(--ink-secondary)] leading-[1.6]">{body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>

    {/* Why we can stand behind it */}
    <Section tone="soft" size="lg">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-end">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow mb-3">Why we can stand behind it</p>
          <h2 className="font-serif text-h2 lg:text-h1 leading-[1.04] tracking-tight text-[color:var(--ink-primary)] max-w-[18ch]">
            European systems, built for the tropics.
          </h2>
          <p className="mt-6 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-[40rem]">
            Ten years is the number that matches what we see across our installs
            in Manila, Cebu, Tagaytay, and the coast. Profiles unchanged after a
            decade of sun. Hardware still smooth after a thousand monsoons.
          </p>
        </Reveal>
        <Stagger gap={0.1} className="lg:col-span-4 lg:col-start-9 space-y-6">
          {TRUST.map((t, i) => (
            <StaggerItem key={t.label}>
              <div className={i > 0 ? "border-t border-[color:var(--rule-soft)] pt-6" : ""}>
                <p className="font-serif text-h1 leading-none text-[color:var(--ink-primary)] tracking-tight">{t.value}</p>
                <p className="mt-2 text-body-sm text-[color:var(--ink-muted)] uppercase tracking-[0.1em]">{t.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>

    {/* CTA */}
    <Section tone="canvas" size="lg">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12 items-center">
        <Reveal className="lg:col-span-7">
          <p className="eyebrow mb-4">Next</p>
          <h2 className="font-serif text-h2 lg:text-h1 tracking-tight text-[color:var(--ink-primary)] leading-[1.04] mb-6 max-w-[16ch]">
            See the warranty in person.
          </h2>
          <p className="text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] mb-10 max-w-[38rem]">
            The fastest way to trust a ten-year promise is to hold a ten-year-old
            FourlinQ window. There's one at every showroom, installed back when we
            were founding the company.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">
            <EditorialButton to="/brand#showrooms" variant="primary" size="lg">
              Visit a Showroom
            </EditorialButton>
            <Link to="/why-upvc" className="text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin underline-offset-4 hover:underline">
              Why uPVC
            </Link>
          </div>
        </Reveal>
        <Reveal from="right" delay={0.1} className="lg:col-span-4 lg:col-start-9">
          <EditorialImage
            src="/images/wp-export/FQC-Project-17.jpg"
            alt="A FourlinQ installation seen from inside, garden view through the glass"
            ratio="aspect-[4/5]"
          />
        </Reveal>
      </div>
    </Section>
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

// Short descriptions per warranty scope, tightened, no em-dashes.
const scopeDescriptions: Record<string, string> = {
  "Corrosion resistance":
    "uPVC never rusts. Multi-chamber profiles, galvanized-steel reinforcement, and EPDM gaskets are warranted against material degradation for the full term.",
  "Long lasting performance":
    "Hinges, rollers, locks, and handles engineered for decades of daily use. Covered against mechanical failure under normal residential operation.",
  "Weather resistance":
    "Sealed against monsoon rain, salt air, and daily thermal cycling. Covered against air, water, and wind penetration that arises from the system itself.",
  "Sound insulation":
    "Multi-chamber profiles and 6 to 12 mm glazing cut exterior noise. Covered against acoustic degradation of the seal assembly through the term.",
};

const EXCLUSIONS = [
  "Damage from impact, modification, or installation by anyone other than a FourlinQ-authorized team.",
  "Cosmetic wear that doesn't affect performance. Minor scuffs, hardware patina from use.",
  "Failures caused by movement of the building itself, or by glazing swapped for third-party glass.",
  "Natural events beyond engineered design loads. Category 5 sustained winds, direct seismic foundation movement.",
];

const TRUST = [
  { value: "11", label: "Brochure-verified finishes" },
  { value: "3", label: "Showrooms across Manila and Cebu" },
  { value: "10", label: "Year standard system warranty" },
];

// Three steps with contextual photos
const STEPS = [
  {
    step: "01",
    title: "Installed",
    body: "The FourlinQ team finishes your install and the warranty starts. Your project is logged in our database. You do nothing.",
    photo: {
      src: "/images/wp-export/Casement-Window.jpg",
      alt: "A finished FourlinQ casement window installation",
    },
  },
  {
    step: "02",
    title: "Recorded",
    body: "A signed certificate reaches you by email and post within fourteen days. Keep it with your house papers, or call us. We have the record.",
    photo: {
      src: "/images/wp-export/Black-Profile.jpg",
      alt: "FourlinQ profile finish detail",
    },
  },
  {
    step: "03",
    title: "Honored",
    body: `If anything covered fails within ten years, call ${CONTACT.mobileAssist} or email ${CONTACT.email}. We schedule a site visit within a week and fix it at no cost.`,
    photo: {
      src: "/images/wp-export/Stainless-Mechanisms.jpg",
      alt: "FourlinQ stainless steel mechanism close-up",
    },
  },
];

export default Warranty;

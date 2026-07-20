import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EditorialImage from "@/components/primitives/EditorialImage";
import EditorialSplit from "@/components/primitives/EditorialSplit";
import FullBleed from "@/components/primitives/FullBleed";
import Statement from "@/components/primitives/Statement";
import { Reveal, Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { CONTACT, phoneHref } from "@/data/fourlinq-data";

/**
 * /for-architects. The architect's corner, rebuilt editorial.
 *
 * Rephrase-only pass. Every claim already lived in the prior page: a
 * single-brand uPVC system, resources delivered by email rather than a
 * public portal, two live pages (finishes, care), a four-step support
 * flow, and a direct line to the engineering team. Nothing invented.
 */

const mailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}`;

const support = [
  {
    step: "01",
    eyebrow: "Drawing review",
    title: "Send the elevations.",
    body: "We check the fenestration geometry. We flag the spans that need reinforced systems. Where uPVC is the wrong answer, we say so.",
    image: "/images/projects/real/church-glazed-partition.webp",
    alt: "A glazed partition in a church interior",
  },
  {
    step: "02",
    eyebrow: "Spec call",
    title: "Talk it through.",
    body: "An engineer walks the brief with you over Zoom or at the showroom. Profile choice, finish strategy, glass, hardware schedule.",
    image: "/images/projects/real/arch-french-doors.webp",
    alt: "Arched French doors in uPVC",
  },
  {
    step: "03",
    eyebrow: "Sample delivery",
    title: "Hold the finish.",
    body: "Physical finish samples and profile cuts couriered to your studio. Metro Manila turnaround is three to five working days.",
    image: "/images/projects/real/residence-wood-grain-corner.webp",
    alt: "A two-storey residence with full-height corner glazing",
  },
  {
    step: "04",
    eyebrow: "Site coordination",
    title: "We install our own.",
    body: "Our team coordinates shop drawings, the site survey, and the schedule with your contractor. We do not subcontract installation.",
    image: "/images/projects/real/resort-multi-unit.webp",
    alt: "A multi-unit resort building glazed with FourlinQ systems",
  },
];

const library: { title: string; note: string; to?: string }[] = [
  { title: "System catalog", note: "On request" },
  { title: "Casement drawings", note: "On request" },
  { title: "Sliding drawings", note: "On request" },
  { title: "Large-panel engineering data", note: "On request" },
  { title: "Curtain wall manual", note: "On request" },
  { title: "Revit family library", note: "In progress" },
  { title: "Finish palette", note: "Live now", to: "/finishes" },
  { title: "Care specification", note: "Live now", to: "/care" },
];

const ForArchitects = () => (
  <Layout>
    {/* Cinematic hero */}
    <section className="relative h-[82vh] min-h-[560px] overflow-hidden">
      <EditorialImage
        src="/images/projects/real/special-shapes-glazing.webp"
        alt="A custom special-shape FourlinQ glazing detail"
        ratio="h-full"
        eager
        scrim
      />
      <div className="absolute inset-0 flex items-end">
        <div className="container-editorial pb-12 lg:pb-20">
          <Stagger gap={0.1}>
            <StaggerItem>
              <p className="eyebrow text-white/80 mb-5">For architects and specifiers</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-serif font-normal text-white text-display leading-[0.98] tracking-tight max-w-[16ch]">
                The spec that never changes.
              </h1>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>

    {/* Statement moment */}
    <Section tone="canvas" size="xl">
      <Statement lines={["Same profile.", "Same hardware.", "Same finish."]} dimFrom={2} />
      <Reveal delay={0.2}>
        <p className="mt-10 lg:mt-14 text-body-lg lg:text-lead text-[color:var(--ink-secondary)] leading-[1.55] max-w-[42rem]">
          FourlinQ is a single-brand uPVC system. One spec, consistent across
          every project. What changes is the geometry of the opening. And your
          intent.
        </p>
      </Reveal>
    </Section>

    {/* The support flow. Numbered editorial splits */}
    <Section tone="canvas" size="md" className="!pt-0">
      <Reveal className="mb-16 lg:mb-24 max-w-[40rem]">
        <p className="eyebrow mb-4">Project support</p>
        <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
          How we work with a specifying architect.
        </h2>
      </Reveal>
      <div className="flex flex-col gap-24 lg:gap-36">
        {support.map((s, i) => (
          <EditorialSplit
            key={s.step}
            image={s.image}
            alt={s.alt}
            flip={i % 2 === 1}
            ratio="aspect-[4/3]"
            index={s.step}
          >
            <p className="eyebrow mb-3">{s.eyebrow}</p>
            <h3 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
              {s.title}
            </h3>
            <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
              {s.body}
            </p>
          </EditorialSplit>
        ))}
      </div>
    </Section>

    {/* Full-bleed breather */}
    <FullBleed
      src="/images/projects/real/church-glazed-partition.webp"
      alt="A large glazed partition in a church interior"
      ratio="aspect-[21/9]"
      caption="One profile family. Sized to whatever the opening asks for."
    />

    {/* Technical library. Dark, honest, delivered by email */}
    <Section tone="dark" size="lg">
      <div className="grid gap-12 lg:grid-cols-[4fr,6fr] lg:gap-24 items-start">
        <Reveal>
          <p className="eyebrow text-white/55 mb-5">Technical library</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-white leading-[1.02] tracking-tight max-w-[14ch]">
            The drawing. The data. The BIM file.
          </h2>
          <p className="mt-6 text-body-lg text-white/70 leading-[1.6] max-w-[34rem]">
            We hand these over by email, not through a public portal. It keeps
            versions current and gives you a real person for the follow-up
            question. Email {CONTACT.email} with a title from the list.
          </p>
        </Reveal>
        <Stagger className="flex flex-col divide-y divide-white/12 border-y border-white/12">
          {library.map((r) => (
            <StaggerItem key={r.title}>
              <div className="flex items-center justify-between gap-5 py-5">
                {r.to ? (
                  <Link
                    to={r.to}
                    className="font-serif text-h4 text-white leading-tight tracking-tight inline-flex items-center gap-2 hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                  >
                    {r.title}
                    <ArrowUpRight size={18} strokeWidth={1.5} />
                  </Link>
                ) : (
                  <span className="font-serif text-h4 text-white/90 leading-tight tracking-tight">
                    {r.title}
                  </span>
                )}
                <span className="eyebrow-s text-white/50 shrink-0">{r.note}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>

    {/* Direct line */}
    <Section tone="canvas" size="lg">
      <Reveal className="border-l-2 border-[color:var(--accent)] pl-6 lg:pl-12 max-w-[46rem]">
        <p className="eyebrow mb-5">Direct line</p>
        <p className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.12]">
          No bot. The people who size the profile and stamp the spec.
        </p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-3 text-body-sm">
          <li className="border-t border-[color:var(--rule-soft)] pt-4">
            <p className="text-[color:var(--ink-muted)] mb-1">Engineering</p>
            <a href={mailHref} target="_blank" rel="noopener noreferrer" className="text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin inline-flex items-center gap-1.5">
              {CONTACT.email}
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </a>
          </li>
          <li className="border-t border-[color:var(--rule-soft)] pt-4">
            <p className="text-[color:var(--ink-muted)] mb-1">Sales line</p>
            <a href={phoneHref(CONTACT.mobileSales)} className="text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
              {CONTACT.mobileSales}
            </a>
          </li>
          <li className="border-t border-[color:var(--rule-soft)] pt-4">
            <p className="text-[color:var(--ink-muted)] mb-1">Landline</p>
            <a href={phoneHref(CONTACT.landline)} className="text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
              {CONTACT.landline}
            </a>
          </li>
        </ul>
      </Reveal>
    </Section>

    {/* CTA. Two paths */}
    <Section tone="soft" size="md">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-24 lg:items-start">
        <Reveal>
          <p className="eyebrow mb-4">Specifying now</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] tracking-tight leading-[1.04] mb-5">
            Email the engineering team.
          </h2>
          <p className="text-body text-[color:var(--ink-secondary)] leading-[1.65] mb-8 max-w-[34rem]">
            Send the project brief. We respond within one business day with the
            drawings, samples, or budget guidance you need.
          </p>
          <EditorialButton href={mailHref} variant="primary" size="md">
            <Mail size={16} strokeWidth={1.5} className="mr-2" />
            {CONTACT.email}
          </EditorialButton>
        </Reveal>
        <Reveal from="up" delay={0.1}>
          <p className="eyebrow mb-4">Just exploring</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] tracking-tight leading-[1.04] mb-5">
            Walk through a showroom.
          </h2>
          <p className="text-body text-[color:var(--ink-secondary)] leading-[1.65] mb-8 max-w-[34rem]">
            Bring a client, bring a junior, bring nothing. Ninety minutes with
            the team across our showrooms in Metro Manila and Cebu.
          </p>
          <EditorialButton to="/brand#showrooms" variant="secondary" size="md">
            <MapPin size={16} strokeWidth={1.5} className="mr-2" />
            Find a showroom
          </EditorialButton>
        </Reveal>
      </div>
    </Section>
  </Layout>
);

export default ForArchitects;

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import ConsultationForm from "@/components/shared/ConsultationForm";
import { certifications, CONTACT, BRANCHES, BRAND } from "@/data/brand";
import { Phone, Mail, ArrowUpRight } from "lucide-react";

const Brand = () => (
  <Layout>
    {/* ── Full-viewport house hero ── image fills the screen, title overlays. ── */}
    <header className="relative h-[calc(100vh-72px)] overflow-hidden">
      <img
        src="/images/wp-export/Our_Brand.jpg"
        alt="A modern Philippine residence outfitted with FourlinQ systems"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark gradient overlay so the text reads clearly over the photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" aria-hidden="true" />

      <div className="relative h-full container-editorial flex flex-col">
        <nav aria-label="Breadcrumb" className="pt-8 lg:pt-12">
          <ol className="flex items-center gap-2 text-[12px] tracking-[0.08em] uppercase text-white/70">
            <li>
              <Link to="/" className="hover:text-white transition-colors duration-300 ease-marvin">
                FourlinQ
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} strokeWidth={1.5} /></li>
            <li className="text-white font-medium">Brand</li>
          </ol>
        </nav>

        <div className="mt-auto pb-16 lg:pb-24 max-w-[58rem]">
          <p className="eyebrow !text-white/70 mb-5 inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-white/50">
            Our brand
          </p>
          <h1 className="font-serif font-normal tracking-tight text-white text-[3rem] sm:text-[3.75rem] lg:text-[5rem] xl:text-[6rem] leading-[1.02]">
            European engineering. Philippine projects.
          </h1>
          <p className="mt-7 lg:mt-9 text-body-lg lg:text-lead text-white/80 max-w-[40rem] leading-[1.55]">
            {BRAND.promise}
          </p>
        </div>
      </div>
    </header>

    {/* Story — asymmetric bento grid of hairline cards. One featured card
        anchors the section; three smaller cards orbit around it. No numbers,
        no shadows, just thin rules and typography. */}
    <Section tone="canvas" size="lg">
      <div className="mb-12 lg:mb-16 flex items-end justify-between gap-8 flex-wrap">
        <p className="eyebrow inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-[color:var(--rule-strong)]">
          Our story
        </p>
        <span className="eyebrow text-[color:var(--ink-muted)]">FourlinQ / 2026</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-px bg-[color:var(--rule-soft)] border border-[color:var(--rule-soft)]">
        {/* Featured card — spans 2 rows on lg */}
        <article className="lg:col-span-7 lg:row-span-2 bg-[color:var(--canvas)] p-8 lg:p-14 flex flex-col justify-between min-h-[28rem]">
          <p className="eyebrow text-[color:var(--ink-muted)]">The promise</p>
          <div>
            <h3 className="font-serif font-normal tracking-tight text-[color:var(--ink-primary)] text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] xl:text-[3.75rem] leading-[1.02] max-w-[18ch]">
              {BRAND.heroQuote}
            </h3>
            <p className="mt-8 lg:mt-10 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-[34rem]">
              {BRAND.promiseSupport} Every system is fabricated to the architect's specifications. No standard sizes off the shelf.
            </p>
          </div>
        </article>

        {/* Top-right card */}
        <article className="lg:col-span-5 bg-[color:var(--canvas)] p-8 lg:p-10 flex flex-col">
          <p className="eyebrow mb-5 text-[color:var(--ink-muted)]">Finishes</p>
          <h3 className="font-serif font-normal tracking-tight text-[color:var(--ink-primary)] text-[1.75rem] lg:text-[2rem] leading-[1.1]">
            Twelve total.
          </h3>
          <p className="mt-4 text-body text-[color:var(--ink-secondary)] leading-[1.6]">
            Six solid colors and six wood-grain laminates, heat-fused into the profile.
          </p>
        </article>

        {/* Bottom-right card */}
        <article className="lg:col-span-5 bg-[color:var(--canvas)] p-8 lg:p-10 flex flex-col">
          <p className="eyebrow mb-5 text-[color:var(--ink-muted)]">Showrooms</p>
          <h3 className="font-serif font-normal tracking-tight text-[color:var(--ink-primary)] text-[1.75rem] lg:text-[2rem] leading-[1.1]">
            Manila and Cebu.
          </h3>
          <p className="mt-4 text-body text-[color:var(--ink-secondary)] leading-[1.6]">
            Walk through full-scale systems with our consultants. Frames you can open, finishes you can touch, hardware that's already in your wall.
          </p>
        </article>
      </div>
    </Section>

    {/* Warranty — thin dark band. Inline 10 + YEAR WARRANTY is the hero;
        promise prose is small detail beneath; marquee runs flush. */}
    <Section tone="dark" size="sm">
      <div className="grid lg:grid-cols-12 gap-x-12 gap-y-6 items-end">
        <div className="lg:col-span-7 flex items-baseline gap-5 lg:gap-7">
          <p className="font-serif font-normal text-white leading-none tracking-tight text-[5rem] lg:text-[7.5rem] xl:text-[9rem]">
            10
          </p>
          <p className="text-[15px] lg:text-[18px] uppercase tracking-[0.18em] text-[color:var(--accent)] font-medium">
            Year warranty.
          </p>
        </div>

        <p className="lg:col-span-5 text-body-sm lg:text-body text-white/65 leading-[1.55] max-w-[32rem]">
          {BRAND.promise}
        </p>
      </div>

      {/* Marquee scope band — flush to bottom of section */}
      <div className="mt-8 lg:mt-10 -mx-5 lg:-mx-12 border-t border-white/10 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap py-3">
          {[...Array(2)].map((_, dup) => (
            <span key={dup} className="flex shrink-0 items-center text-[11px] lg:text-body-sm uppercase tracking-[0.18em] text-white/70">
              {BRAND.warrantyScope.map((scope) => (
                <span key={`${dup}-${scope}`} className="flex items-center">
                  <span className="px-6 lg:px-10">{scope}</span>
                  <span className="text-[color:var(--accent)]">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </Section>

    {/* Certifications */}
    <Section id="certifications" tone="soft" size="lg" className="scroll-mt-28">
      <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 mb-12 lg:mb-16">
        <div className="lg:col-span-5">
          <EyebrowHeading eyebrow="Trust" level={2} align="left">
            Certifications & standards.
          </EyebrowHeading>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] self-end">
          Every FourlinQ system is engineered, fabricated, and installed against the standards listed below. The certifications hold whether your project is a private residence or a commercial fitout.
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        {certifications.map((cert) => (
          <li key={cert.name} className="border-t border-[color:var(--rule-soft)] pt-5">
            <p className="text-body-sm font-medium text-[color:var(--ink-primary)] leading-snug">
              {cert.name}
            </p>
          </li>
        ))}
      </ul>
    </Section>

    {/* Contact */}
    <Section id="contact" tone="canvas" size="lg" className="scroll-mt-28">
      <div className="grid lg:grid-cols-[5fr,7fr] gap-12 lg:gap-20">
        <div>
          <EyebrowHeading eyebrow="Book a consultation" level={2}>
            Start with a conversation.
          </EyebrowHeading>
          <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[28rem] leading-[1.65]">
            Tell us about your project in four quick questions. A FourlinQ engineer will respond within one business day to schedule your ninety-minute showroom visit.
          </p>

          <ul className="mt-10 flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
            <ContactRow icon={<Phone size={16} strokeWidth={1.5} />} label="Sales" value={CONTACT.mobileSales} href={`tel:${CONTACT.mobileSales.replace(/-/g, "")}`} />
            <ContactRow icon={<Phone size={16} strokeWidth={1.5} />} label="Assistance" value={CONTACT.mobileAssist} href={`tel:${CONTACT.mobileAssist.replace(/-/g, "")}`} />
            <ContactRow icon={<Phone size={16} strokeWidth={1.5} />} label="Landline" value={CONTACT.landline} href={`tel:${CONTACT.landline.replace(/[()]/g, "")}`} />
            <ContactRow icon={<Mail size={16} strokeWidth={1.5} />} label="Email" value={CONTACT.email} href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}`} external />
          </ul>
        </div>
        <ConsultationForm />
      </div>
    </Section>

    {/* Showrooms */}
    <Section id="showrooms" tone="soft" size="lg" className="scroll-mt-28">
      <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
        <EyebrowHeading eyebrow="Where to find us" level={2}>
          Four showrooms across the Philippines.
        </EyebrowHeading>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {BRANCHES.map((branch) => (
          <li key={branch.id} className="bg-white border border-[color:var(--rule-soft)] overflow-hidden flex flex-col">
            <iframe
              title={`Map — ${branch.label}`}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${branch.lng - 0.005},${branch.lat - 0.003},${branch.lng + 0.005},${branch.lat + 0.003}&layer=mapnik&marker=${branch.lat},${branch.lng}`}
              className="w-full h-44 border-0"
              loading="lazy"
            />
            <div className="p-6 flex-1 flex flex-col">
              <p className="eyebrow mb-3">{branch.region}</p>
              <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-3">{branch.label}</h3>
              <p className="text-body-sm text-[color:var(--ink-secondary)] leading-relaxed flex-1">{branch.address}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-1.5 text-body-sm font-medium text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
              >
                Get directions
                <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ease-marvin" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </Section>

    {/* CTA */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
        <EyebrowHeading eyebrow="Start your project" level={2} toneInverse>
          From consultation to installation, we're with you every step.
        </EyebrowHeading>
        <div className="flex flex-wrap items-center gap-5">
          <EditorialButton to="/products" variant="primary" size="md">Explore Systems</EditorialButton>
          <EditorialButton to="/design-tool" variant="ghost" size="md" className="text-white hover:text-white">
            Open Design Tool
          </EditorialButton>
        </div>
      </div>
    </Section>
  </Layout>
);

const ContactRow = ({ icon, label, value, href, external }: { icon: React.ReactNode; label: string; value: string; href: string; external?: boolean }) => (
  <li>
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 py-4 hover:bg-[color:var(--canvas-soft)] -mx-2 px-2 transition-colors duration-300 ease-marvin"
    >
      <div className="text-[color:var(--ink-muted)] shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)] mb-0.5">{label}</p>
        <p className="text-body-sm text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">{value}</p>
      </div>
      <ArrowUpRight size={14} strokeWidth={1.5} className="text-[color:var(--ink-muted)] group-hover:text-[color:var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ease-marvin" />
    </a>
  </li>
);

export default Brand;

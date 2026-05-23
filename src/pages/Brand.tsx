import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import ConsultationForm from "@/components/shared/ConsultationForm";
import { certifications, CONTACT, BRANCHES, BRAND } from "@/data/brand";
import { Phone, Mail, ArrowUpRight } from "lucide-react";

const Brand = () => (
  <Layout>
    <PageHeader
      eyebrow="Our brand"
      title="Custom-made for the homes you actually live in."
      breadcrumbLabel="Brand"
      subtitle={BRAND.promise}
    />

    {/* Brand hero — full-bleed editorial image right after the PageHeader */}
    <Section tone="canvas" size="md" className="!pb-0">
      <div className="aspect-[21/9] lg:aspect-[21/9] overflow-hidden bg-[color:var(--canvas-soft)]">
        <img
          src="/images/wp-export/Our_Brand.jpg"
          alt="A modern Philippine residence outfitted with FourlinQ systems"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>
    </Section>

    {/* Story */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-[5fr,6fr] gap-12 lg:gap-20 items-center">
        <div>
          <EyebrowHeading eyebrow="Our story" level={2}>
            {BRAND.heroQuote}
          </EyebrowHeading>
          <div className="mt-8 lg:mt-10 space-y-5 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[36rem] leading-[1.65]">
            <p>{BRAND.promiseSupport}</p>
            <p>
              Eleven finishes from classic white to rich wood grains. Backed by a {BRAND.warranty} covering corrosion resistance, weather resistance, and long-lasting performance.
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/5] lg:aspect-[5/6] overflow-hidden bg-[color:var(--canvas-soft)]">
          <img src="/images/wp-export/FQC-Brand.jpg" alt="A FourlinQ-equipped home in the Philippines" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
      </div>
    </Section>

    {/* Warranty — dark inset */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-20 items-start">
        <div>
          <p className="eyebrow !text-white/50 mb-5">The promise</p>
          <h2 className="font-serif text-h3 lg:text-h2 text-white tracking-tight leading-[1.1]">
            {BRAND.warranty}
          </h2>
        </div>
        <div>
          <p className="text-body-lg text-white/70 mb-10 max-w-[34rem]">{BRAND.promise}</p>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            {BRAND.warrantyScope.map((scope) => (
              <li key={scope} className="bg-[color:var(--canvas-dark)] p-5">
                <p className="text-body-sm text-white font-medium">{scope}</p>
              </li>
            ))}
          </ul>
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

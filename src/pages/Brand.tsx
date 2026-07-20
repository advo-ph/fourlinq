import Layout from "@/components/layout/Layout";
import PageBody from "@/components/shared/PageBody";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EditorialImage from "@/components/primitives/EditorialImage";
import EditorialSplit from "@/components/primitives/EditorialSplit";
import FullBleed from "@/components/primitives/FullBleed";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import ConsultationForm from "@/components/shared/ConsultationForm";
import { Stagger, StaggerItem } from "@/components/primitives/Reveal";
import { certifications, CONTACT, BRANCHES, BRAND, phoneHref } from "@/data/brand";
import { Phone, Mail, ArrowUpRight } from "lucide-react";

const Brand = () => (
  <Layout>
    {/* Cinematic hero one photograph, one line */}
    <section className="relative h-[82vh] min-h-[560px] overflow-hidden">
      <EditorialImage
        src="/images/brand-story.jpg"
        alt="A modern Philippine residence outfitted with FourlinQ windows and doors"
        ratio="h-full"
        eager
        scrim
      />
      <div className="absolute inset-0 flex items-end">
        <div className="container-editorial pb-12 lg:pb-20">
          <Stagger gap={0.1}>
            <StaggerItem>
              <p className="eyebrow text-white/80 mb-5">Our brand</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="font-serif font-normal text-white text-display leading-[0.98] tracking-tight max-w-[14ch]">
                Built for a lifetime.
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 text-body-lg lg:text-lead text-white/80 max-w-[38ch] leading-snug">
                What we promise, what the warranty covers, where to put your hands on it.
              </p>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>

    {/* Story editorial splits, alternating */}
    <Section tone="canvas" size="md">
      <div className="flex flex-col gap-24 lg:gap-36">
        <EditorialSplit
          image="/images/projects/real/residence-wood-grain-corner.webp"
          alt="A two-storey FourlinQ residence with full-height corner glazing"
          ratio="aspect-[4/3]"
          index="01"
        >
          <p className="eyebrow mb-3">The promise</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
            A lifetime of peace of mind.
          </h2>
          <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
            Windows and doors built to last. Made to your specification, backed
            for ten years, and engineered to stay true long after the keys change
            hands.
          </p>
        </EditorialSplit>

        <EditorialSplit
          image="/images/projects/real/resort-multi-unit.webp"
          alt="A multi-unit resort building fitted with FourlinQ systems"
          flip
          ratio="aspect-[4/3]"
          index="02"
        >
          <p className="eyebrow mb-3">Any project</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
            Homes and resorts alike.
          </h2>
          <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
            A single residence or a multi-unit development. The same standard
            holds, whether the job is a private home or a commercial fitout.
          </p>
        </EditorialSplit>

        <EditorialSplit
          image="/images/projects/real/french-doors-conservatory.webp"
          alt="French doors opening onto a FourlinQ conservatory"
          ratio="aspect-[4/3]"
          index="03"
        >
          <p className="eyebrow mb-3">Finishes</p>
          <h2 className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] leading-[1.04] tracking-tight">
            Twelve, heat-fused.
          </h2>
          <p className="mt-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
            Six solid colors, six wood-grain laminates, fused into the profile.
            Wipe-clean, never repainted.
          </p>
          <div className="mt-8">
            <EditorialButton to="/finishes" variant="ghost" size="md">
              See all twelve
            </EditorialButton>
          </div>
        </EditorialSplit>
      </div>
    </Section>

    {/* Full-bleed breather */}
    <FullBleed
      src="/images/projects/real/sliding-doors-interior.webp"
      alt="Interior view through FourlinQ sliding doors"
      ratio="aspect-[21/9]"
      caption="Open it, close it, ten thousand times. It still runs true."
    />

    {/* Warranty dark band. The 10-year mark owns the room */}
    <Section tone="dark" size="sm">
      <div className="grid lg:grid-cols-12 gap-x-12 gap-y-6 items-end">
        <div className="lg:col-span-7 flex items-baseline gap-5 lg:gap-7">
          <p className="font-serif font-normal text-white leading-none tracking-tight text-display">
            10
          </p>
          <p className="eyebrow text-[color:var(--accent)]">
            Year limited warranty.
          </p>
        </div>
        <p className="lg:col-span-5 text-body-sm lg:text-body text-white/65 leading-[1.55] max-w-[32rem]">
          {BRAND.promise} That is what the warranty is for.
        </p>
      </div>

      {/* Marquee scope band flush to bottom of section */}
      <div className="mt-8 lg:mt-10 -mx-5 lg:-mx-12 border-t border-white/10 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap py-3">
          {[...Array(2)].map((_, dup) => (
            <span key={dup} className="flex shrink-0 items-center text-eyebrow text-white/70">
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
            Certifications and standards.
          </EyebrowHeading>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] self-end">
          Every FourlinQ system is engineered, fabricated, and installed against
          the standards below. They hold whether your project is a private
          residence or a commercial fitout.
        </p>
      </div>
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        {certifications.map((cert) => (
          <StaggerItem key={cert.name}>
            <div className="border-t border-[color:var(--rule-soft)] pt-5">
              <p className="text-body-sm font-medium text-[color:var(--ink-primary)] leading-snug">
                {cert.name}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>

    {/* Contact */}
    <Section id="contact" tone="canvas" size="lg" className="scroll-mt-28">
      <div className="grid lg:grid-cols-[5fr,7fr] gap-12 lg:gap-20">
        <div>
          <EyebrowHeading eyebrow="Book a consultation" level={2}>
            Start with a conversation.
          </EyebrowHeading>
          <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[28rem] leading-[1.65]">
            Four quick questions about your project. A FourlinQ engineer replies
            within one business day to book your ninety-minute showroom visit.
          </p>

          <ul className="mt-10 flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
            <ContactRow icon={<Phone size={16} strokeWidth={1.5} />} label="Sales" value={CONTACT.mobileSales} href={phoneHref(CONTACT.mobileSales)} />
            <ContactRow icon={<Phone size={16} strokeWidth={1.5} />} label="Assistance" value={CONTACT.mobileAssist} href={phoneHref(CONTACT.mobileAssist)} />
            <ContactRow icon={<Phone size={16} strokeWidth={1.5} />} label="Landline" value={CONTACT.landline} href={phoneHref(CONTACT.landline)} />
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
          Three showrooms across the Philippines.
        </EyebrowHeading>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {BRANCHES.map((branch) => (
          <li key={branch.id} className="bg-white border border-[color:var(--rule-soft)] overflow-hidden flex flex-col">
            <iframe
              title={`Map ${branch.label}`}
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

    {/* Editable CMS body empty by default, renders nothing if Tita hasn't added content */}
    <PageBody route="/brand" />

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
        <p className="text-eyebrow text-[color:var(--ink-muted)] mb-0.5">{label}</p>
        <p className="text-body-sm text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">{value}</p>
      </div>
      <ArrowUpRight size={14} strokeWidth={1.5} className="text-[color:var(--ink-muted)] group-hover:text-[color:var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ease-marvin" />
    </a>
  </li>
);

export default Brand;

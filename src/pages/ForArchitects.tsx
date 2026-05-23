import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import EditorialButton from "@/components/primitives/Button";
import { FileText, Hammer, Phone, MapPin, ArrowUpRight, Mail } from "lucide-react";
import { CONTACT, BRAND } from "@/data/fourlinq-data";

/**
 * /for-architects — single-page architect's corner.
 *
 * P4 signature surface from docs/competitor-audit-kenneth-mock.md §8 Tier 3.
 * Kenneth & Mock and Vitrocsa offer architects nothing of this sort: no
 * downloadable spec sheets, no CAD blocks, no spec-team direct line.
 *
 * This page is deliberately functional rather than evocative — architects
 * are here for resources, not poetry. Vitrocsa-restraint applies: every
 * link points to a real resource or a real human; nothing is decorative.
 *
 * Asset availability is honest: documents marked "Available on request"
 * until Tita supplies the actual PDFs / CAD blocks.
 */

interface Resource {
  title: string;
  type: "PDF" | "DWG" | "RFA" | "ZIP" | "DOC";
  description: string;
  /** Honest status: ready to download, or available on request? */
  status: "available" | "request" | "in-progress";
  /** Direct download URL when available */
  href?: string;
}

const technicalResources: Resource[] = [
  {
    title: "FourlinQ System Catalog",
    type: "PDF",
    description: "Complete brochure of all window and door systems with profile cross-sections, available finishes, and engineering specifications.",
    status: "request",
  },
  {
    title: "Casement Window — Technical Drawings",
    type: "DWG",
    description: "2D AutoCAD blocks with profile sections, glazing options, and standard configurations for the Casement system.",
    status: "request",
  },
  {
    title: "Sliding Door — Technical Drawings",
    type: "DWG",
    description: "2D AutoCAD blocks for Sliding Door, Lift & Slide, and Slide & Fold systems with track details.",
    status: "request",
  },
  {
    title: "Large Panel Door — Engineering Data",
    type: "PDF",
    description: "Maximum spans, glazing weight limits, reinforcement requirements for door openings up to 6 metres wide.",
    status: "request",
  },
  {
    title: "Curtain Wall — System Manual",
    type: "PDF",
    description: "Full curtain wall system specifications, structural calculations, and installation methodology.",
    status: "request",
  },
  {
    title: "Revit Family Library",
    type: "RFA",
    description: "BIM family files for FourlinQ window and door systems, ready to drop into your Revit project.",
    status: "in-progress",
  },
  {
    title: "Finish Color Palette",
    type: "PDF",
    description: "All eleven brochure-verified finishes with hex values, swatches, and recommended pairings for residential and commercial use.",
    status: "available",
    href: "/finishes",
  },
  {
    title: "Care & Maintenance Specification",
    type: "PDF",
    description: "Standard cleaning protocols, recommended hardware service intervals, and warranty registration requirements for client handover packages.",
    status: "available",
    href: "/care",
  },
];

const statusLabel = (s: Resource["status"]) => {
  switch (s) {
    case "available": return "Available now";
    case "request": return "Available on request";
    case "in-progress": return "In progress — Q3 2026";
  }
};

const ForArchitects = () => (
  <Layout>
    <PageHeader
      eyebrow="For architects + specifiers"
      title="The resources to specify a FourlinQ system."
      breadcrumbLabel="For Architects"
      subtitle="Technical drawings, BIM families, finish catalogs, and direct access to the FourlinQ engineering team. No bot. Just an email to the people who size the profile and stamp the spec."
    />

    {/* Intro */}
    <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
      <div className="container-editorial">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 mb-20 lg:mb-28">
          <div className="lg:col-span-7">
            <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
              FourlinQ is a single-brand uPVC system. The spec is consistent across every project. Same profile, same hardware, same finish library, same {BRAND.warranty.toLowerCase()}. What changes from project to project is the geometry of the opening and the architect's intent.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="eyebrow mb-4">Direct line</p>
            <ul className="space-y-5 text-body-sm">
              <li className="border-t border-[color:var(--rule-soft)] pt-4">
                <p className="text-[color:var(--ink-muted)] mb-1">FourlinQ Engineering</p>
                <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}`} target="_blank" rel="noopener noreferrer" className="text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin inline-flex items-center gap-1.5">
                  {CONTACT.email}
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </a>
              </li>
              <li className="border-t border-[color:var(--rule-soft)] pt-4">
                <p className="text-[color:var(--ink-muted)] mb-1">Sales line</p>
                <a href={`tel:${CONTACT.mobileSales.replace(/-/g, "")}`} className="text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                  {CONTACT.mobileSales}
                </a>
              </li>
              <li className="border-t border-[color:var(--rule-soft)] pt-4">
                <p className="text-[color:var(--ink-muted)] mb-1">Landline</p>
                <a href={`tel:${CONTACT.landline.replace(/[()]/g, "")}`} className="text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                  {CONTACT.landline}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Technical resources */}
        <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-x-8 mb-10 lg:mb-14">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-4">Technical library</p>
              <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
                The spec sheet, the drawing, the BIM file.
              </h2>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] self-end">
              We hand-deliver these by email rather than maintain a public download portal. Keeps the file versions current. Lets us know which firms are using us. And it means you have a real human to ask the follow-up question. Email {CONTACT.email} with the title from the list below.
            </p>
          </div>

          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-10">
            {technicalResources.map((r) => (
              <li key={r.title} className="border-t border-[color:var(--rule-soft)] pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-[10px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-muted)] border border-[color:var(--rule-strong)] px-2 py-1 shrink-0">
                    {r.type}
                  </span>
                  <span className={`text-[10px] tracking-[0.14em] uppercase font-medium px-2 py-1 ${
                    r.status === "available"
                      ? "bg-[color:var(--ink-primary)] text-white"
                      : r.status === "in-progress"
                      ? "text-[color:var(--ink-muted)] border border-[color:var(--rule-soft)]"
                      : "text-[color:var(--ink-secondary)] border border-[color:var(--rule-strong)]"
                  }`}>
                    {statusLabel(r.status)}
                  </span>
                </div>
                <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-3 leading-snug">
                  {r.status === "available" && r.href ? (
                    <Link to={r.href} className="hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin inline-flex items-center gap-2">
                      {r.title}
                      <ArrowUpRight size={16} strokeWidth={1.5} />
                    </Link>
                  ) : (
                    r.title
                  )}
                </h3>
                <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
                  {r.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* What we do for your project */}
        <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 mb-24 lg:mb-32">
          <p className="eyebrow mb-3">Project support</p>
          <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14 max-w-3xl">
            How we work with a specifying architect.
          </h2>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {[
              {
                step: "01",
                title: "Drawing review",
                body: "Send us your elevations and we'll review fenestration geometry, flag any spans that need aluminum-reinforced systems, and propose alternates where uPVC isn't the right answer.",
              },
              {
                step: "02",
                title: "Spec call",
                body: "A FourlinQ engineer reviews the brief with you over Zoom or at the showroom. We talk profile choice, finish strategy, glass specification, and hardware schedule.",
              },
              {
                step: "03",
                title: "Sample delivery",
                body: "Physical finish samples and small profile cuts couriered to your studio. Standard turnaround in Metro Manila is 3-5 working days.",
              },
              {
                step: "04",
                title: "Site coordination",
                body: "Our install team coordinates with your contractor on shop-drawing review, site survey, and the install schedule. We do not subcontract installation.",
              },
            ].map(({ step, title, body }) => (
              <li key={step}>
                <p className="font-serif text-[40px] leading-none text-[color:var(--accent)] mb-4 tracking-tight">
                  {step}
                </p>
                <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-3 leading-snug">
                  {title}
                </h3>
                <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Closing CTA — two paths */}
        <div className="border-t border-[color:var(--rule-soft)] pt-16 lg:pt-20">
          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-12">
            <div>
              <p className="eyebrow mb-3">Specifying now</p>
              <h2 className="font-serif text-h3 lg:text-h2 tracking-tight text-[color:var(--ink-primary)] leading-[1.1] mb-5">
                Email the engineering team.
              </h2>
              <p className="text-body text-[color:var(--ink-secondary)] leading-[1.65] mb-8">
                Send the project brief and we'll respond within one business day with the drawings, samples, or budget guidance you need.
              </p>
              <EditorialButton href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}`} variant="primary" size="md">
                <Mail size={16} strokeWidth={1.5} className="mr-2" />
                {CONTACT.email}
              </EditorialButton>
            </div>
            <div>
              <p className="eyebrow mb-3">Just exploring</p>
              <h2 className="font-serif text-h3 lg:text-h2 tracking-tight text-[color:var(--ink-primary)] leading-[1.1] mb-5">
                Walk through a showroom.
              </h2>
              <p className="text-body text-[color:var(--ink-secondary)] leading-[1.65] mb-8">
                Bring a junior architect, bring a client, bring nothing. Ninety minutes with the FourlinQ team at one of our four showrooms across Metro Manila and Cebu.
              </p>
              <EditorialButton to="/brand#showrooms" variant="secondary" size="md">
                <MapPin size={16} strokeWidth={1.5} className="mr-2" />
                Find a showroom
              </EditorialButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default ForArchitects;

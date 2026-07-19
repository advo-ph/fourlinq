import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import EditorialButton from "@/components/primitives/Button";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { CONTACT, phoneHref } from "@/data/fourlinq-data";

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
  type: "PAGE" | "TERMS" | "DRAWING" | "BIM";
  description: string;
  /** Honest status: public page, or a file whose existence must be confirmed. */
  status: "public" | "confirm";
  href?: string;
}

const technicalResources: Resource[] = [
  {
    title: "Public system catalog",
    type: "PAGE",
    description: "The current public window, door, and specialist-system index. It is a browsing surface, not a stamped specification or complete technical catalog.",
    status: "public",
    href: "/products",
  },
  {
    title: "uPVC finish library",
    type: "PAGE",
    description: "Twelve entries from the verified physical-sample library: five solid and seven wood-grain. Screen colors are approximate; confirm a physical sample and current availability.",
    status: "public",
    href: "/finishes",
  },
  {
    title: "Current warranty terms",
    type: "TERMS",
    description: "The website carries only a brochure summary. Ask FourlinQ to confirm the current written terms for the exact proposed system and order.",
    status: "confirm",
  },
  {
    title: "Project-specific drawings and profile sections",
    type: "DRAWING",
    description: "No verified public DWG/PDF library is hosted here. Send the opening schedule and ask which current drawings, sections, and test documents exist for the proposed profile.",
    status: "confirm",
  },
  {
    title: "CAD and BIM assets",
    type: "BIM",
    description: "The repository does not contain a verified Revit family or CAD-block library. Ask whether a current supplier or project-specific file is available; do not specify from a placeholder entry.",
    status: "confirm",
  },
];

const statusLabel = (status: Resource["status"]) =>
  status === "public" ? "Public page" : "Confirm with FourlinQ";

const ForArchitects = () => (
  <Layout>
    <PageHeader
      eyebrow="For architects + specifiers"
      title="Start a technical request with verified inputs."
      breadcrumbLabel="For Architects"
      subtitle="The site publishes a product index and finish library. It does not currently host a verified CAD, BIM, specification, test-report, or warranty-document library, so those files must be confirmed for each proposed system."
    />

    {/* Intro */}
    <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
      <div className="container-editorial">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 mb-20 lg:mb-28">
          <div className="lg:col-span-7">
            <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
              FourlinQ publishes both uPVC and aluminium profile paths, with multiple named profile families. The exact profile, reinforcement, glass, hardware, finish, fabrication limit, installation scope, and evidence package must be matched to the opening rather than assumed from a generic web page.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="eyebrow mb-4">Direct line</p>
            <ul className="space-y-5 text-body-sm">
              <li className="border-t border-[color:var(--rule-soft)] pt-4">
                <p className="text-[color:var(--ink-muted)] mb-1">Technical request</p>
                <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}`} target="_blank" rel="noopener noreferrer" className="text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin inline-flex items-center gap-1.5">
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
          </div>
        </div>

        {/* Technical resources */}
        <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16 mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-x-8 mb-10 lg:mb-14">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-4">Technical library</p>
              <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
                Public now, or confirm first.
              </h2>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] self-end">
              The labels below distinguish pages that exist today from technical files whose existence and revision must be confirmed. Email {CONTACT.email} with the project, proposed system, opening schedule, and the exact evidence or file format you need.
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
                    r.status === "public"
                      ? "bg-[color:var(--ink-primary)] text-white"
                      : "text-[color:var(--ink-secondary)] border border-[color:var(--rule-strong)]"
                  }`}>
                    {statusLabel(r.status)}
                  </span>
                </div>
                <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-3 leading-snug">
                  {r.status === "public" && r.href ? (
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
          <p className="eyebrow mb-3">Prepare the request</p>
          <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)] mb-10 lg:mb-14 max-w-3xl">
            Four inputs that make the technical reply useful.
          </h2>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {[
              {
                step: "01",
                title: "Opening schedule",
                body: "Send the opening code, width, height, quantity, operation, sill/head condition, and the latest elevation or detail revision.",
              },
              {
                step: "02",
                title: "Required performance",
                body: "State the project-specific wind, water, acoustic, thermal, safety, egress, accessibility, and code criteria that the selected assembly must satisfy.",
              },
              {
                step: "03",
                title: "Evidence request",
                body: "Name the exact deliverable needed—profile section, test report, calculation, sample, warranty, method statement, CAD, or BIM—and the decision date.",
              },
              {
                step: "04",
                title: "Written confirmation",
                body: "Do not treat a call, web visualization, or marketing image as approval. Ask FourlinQ to identify the proposed system and confirm availability, compatibility, responsibilities, and document revision in writing.",
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
                Send the project brief and list the exact file or decision needed. FourlinQ will confirm what is available and the expected response time.
              </p>
              <EditorialButton href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}`} variant="primary" size="md">
                <Mail size={16} strokeWidth={1.5} className="mr-2" />
                {CONTACT.email}
              </EditorialButton>
            </div>
            <div>
              <p className="eyebrow mb-3">Just exploring</p>
              <h2 className="font-serif text-h3 lg:text-h2 tracking-tight text-[color:var(--ink-primary)] leading-[1.1] mb-5">
                Inspect a published location.
              </h2>
              <p className="text-body text-[color:var(--ink-secondary)] leading-[1.65] mb-8">
                Use the published location list to inspect systems and finish samples. Contact FourlinQ first to confirm access, the relevant sample, and an appointment time.
              </p>
              <EditorialButton to="/brand#showrooms" variant="secondary" size="md">
                <MapPin size={16} strokeWidth={1.5} className="mr-2" />
                View locations
              </EditorialButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default ForArchitects;

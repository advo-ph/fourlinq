import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { clearConsent } from "@/lib/consent";

const legalContent: Record<string, { title: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "July 2026",
    sections: [
      {
        heading: "Information We Collect",
        body: "When you submit a consultation, quote, contact, or configuration form, the site sends the fields shown in that form to FourlinQ's server. Depending on the form, this can include your name, email, phone, project details, preferences, notes, and configuration choices.",
      },
      {
        heading: "How We Use Your Information",
        body: "The server stores public-form submissions as inquiries so authorized FourlinQ users can review and respond. When mail delivery is configured, the server may also send an inquiry notification to the configured FourlinQ mailbox. A configuration is not a quotation or technical approval.",
      },
      {
        heading: "Cookies & Analytics",
        body: "Optional first-party analytics are opt-in. Before Accept, and after Decline, the client does not send analytics events. After Accept, it can send a generated session identifier, event name, page path, clicked target, event data, referrer, user-agent, screen size, and scroll-depth data to FourlinQ's analytics endpoint.",
      },
      {
        heading: "Retention and requests",
        body: "The current public site does not publish a verified retention period, deletion schedule, data-sharing register, or complete data-subject request procedure. Ask FourlinQ for the current operational policy if those details affect your decision to submit information.",
      },
      {
        heading: "Contact",
        body: "For a privacy question or request, contact sales@fourlinq.com or 0925-848-8888 and identify the submission reference when available. Do not send passwords or unnecessary sensitive information through a public project form.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    lastUpdated: "July 2026",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "Use the public site as general product and contact information. A webpage, image, configurator state, chat response, or FAQ answer is not a signed quotation, shop drawing, test report, permit statement, installation contract, or warranty document.",
      },
      {
        heading: "Products & Services",
        body: "Product names, images, finish swatches, dimensions, descriptions, and availability can vary by profile, supplier, project, fabrication limit, and CMS update. Ask FourlinQ to identify and confirm the exact proposed assembly in writing before purchase or specification.",
      },
      {
        heading: "Design Tool",
        body: "The online Design Tool creates an illustrative brief. Its global slider range and visual preview do not prove compatibility, structural adequacy, glass availability, fabrication limits, ratings, price, or approval. Only a server-confirmed reference proves the brief was submitted—not that it was accepted or quoted.",
      },
      {
        heading: "External and user-provided material",
        body: "The site can link to external maps, mail, media, documents, and client-provided content. Verify the destination, rights, revision, and suitability before reusing or relying on any linked or displayed material.",
      },
      {
        heading: "Controlling project documents",
        body: "For a project, rely on the signed quotation, approved drawings, identified technical evidence, written scope, and current warranty terms. If a web statement conflicts with a signed project document, ask FourlinQ to resolve the conflict in writing before proceeding.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    lastUpdated: "July 2026",
    sections: [
      {
        heading: "What Are Cookies",
        body: "This site's public consent choice is stored in browser local storage under fourlinq_cookie_consent. After analytics consent, a generated session identifier can also be stored in session storage for the current browser session. The admin area uses a separate authentication cookie after an authorized login.",
      },
      {
        heading: "Cookies We Use",
        body: "The public analytics client is first-party and opt-in. It stays off when the choice is unset or declined. After Accept, the fields listed in the Privacy notice can be sent to /api/analytics. The repository does not load an advertising network in this consent path.",
      },
      {
        heading: "Managing Cookies",
        body: "Use the Change analytics preference control on this page to reopen the choice. Clearing site storage in your browser also removes the public preference and session identifier. Declining analytics does not disable the public catalog or Design Tool controls.",
      },
      {
        heading: "Updates",
        body: "This notice describes the current repository implementation. If the analytics fields, storage keys, third-party services, or admin authentication change, the notice and last-updated date should be revised with the code.",
      },
    ],
  },
};

const Legal = () => {
  const [searchParams] = useSearchParams();
  const [preferenceReset, setPreferenceReset] = useState(false);
  const requestedPage = searchParams.get("page") || "privacy";
  const page = Object.prototype.hasOwnProperty.call(legalContent, requestedPage) ? requestedPage : "privacy";
  const content = legalContent[page];

  return (
    <Layout>
      <PageHeader
        eyebrow="Legal"
        title={content.title}
        breadcrumbLabel={content.title}
        subtitle={`Last updated ${content.lastUpdated}.`}
      />
      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-reading">
          <nav aria-label="Legal notices" className="mb-10 border-y border-[color:var(--rule-soft)]">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 py-4 text-body-sm">
              {[
                { key: "privacy", label: "Privacy" },
                { key: "terms", label: "Website terms" },
                { key: "cookies", label: "Cookies" },
              ].map((notice) => (
                <li key={notice.key}>
                  <Link
                    to={`/legal?page=${notice.key}`}
                    aria-current={page === notice.key ? "page" : undefined}
                    className={page === notice.key ? "font-medium text-[color:var(--ink-primary)]" : "text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)]"}
                  >
                    {notice.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mb-10 border-l-2 border-[color:var(--accent)] pl-5 text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
            This notice is a source-aligned description of the current website behavior. It is not a substitute for FourlinQ's internal privacy program, a signed project agreement, or legal advice.
          </p>
          <div className="space-y-10 lg:space-y-12">
            {content.sections.map((section) => (
              <article key={section.heading}>
                <h2 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">
                  {section.heading}
                </h2>
                <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.7]">
                  {section.body}
                </p>
              </article>
            ))}
            {page === "cookies" && (
              <div className="border-t border-[color:var(--rule-soft)] pt-8">
                <button
                  type="button"
                  onClick={() => {
                    clearConsent();
                    setPreferenceReset(true);
                    window.dispatchEvent(new CustomEvent("fourlinq:consent-reset"));
                  }}
                  className="min-h-[44px] border border-[color:var(--ink-primary)] px-5 text-body-sm font-medium text-[color:var(--ink-primary)] hover:bg-[color:var(--canvas-soft)]"
                >
                  Change analytics preference
                </button>
                {preferenceReset && <p className="mt-3 text-body-sm text-[color:var(--ink-secondary)]" role="status">The consent choice is open again.</p>}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Legal;

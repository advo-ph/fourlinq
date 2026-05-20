import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";

const legalContent: Record<string, { title: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "March 2026",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect personal information you provide when requesting a consultation, using our design tool, or contacting us. This may include your name, email address, phone number, and project details.",
      },
      {
        heading: "How We Use Your Information",
        body: "Your information is used to respond to inquiries, provide quotes, schedule consultations, and improve our services. We do not sell your personal data to third parties.",
      },
      {
        heading: "Cookies & Analytics",
        body: "Our website uses essential cookies for functionality and analytics cookies to understand how visitors interact with our site. You can manage cookie preferences through your browser settings.",
      },
      {
        heading: "Data Security",
        body: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction.",
      },
      {
        heading: "Contact",
        body: "For privacy-related inquiries, please contact us at sales@fourlinq.com or call 0925-848-8888.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    lastUpdated: "March 2026",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By accessing and using the FourlinQ website, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the site.",
      },
      {
        heading: "Products & Services",
        body: "All product specifications, images, and descriptions on this website are for informational purposes. Actual products may vary. Pricing and availability are subject to change without notice.",
      },
      {
        heading: "Design Tool",
        body: "The online design tool provides approximate visualizations for planning purposes only. Final product specifications, dimensions, and pricing will be confirmed during your consultation.",
      },
      {
        heading: "Intellectual Property",
        body: "All content on this website — including text, images, logos, and design tool software — is the property of FourlinQ and is protected by applicable intellectual property laws.",
      },
      {
        heading: "Limitation of Liability",
        body: "FourlinQ shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or reliance on information provided herein.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    lastUpdated: "March 2026",
    sections: [
      {
        heading: "What Are Cookies",
        body: "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you interact with its pages.",
      },
      {
        heading: "Cookies We Use",
        body: "Essential cookies enable core functionality like navigation and form submissions. Analytics cookies help us understand visitor behavior to improve the site experience. We do not use advertising or tracking cookies.",
      },
      {
        heading: "Managing Cookies",
        body: "You can control and delete cookies through your browser settings. Disabling essential cookies may affect the functionality of certain features, such as the design tool.",
      },
      {
        heading: "Updates",
        body: "We may update this Cookie Policy periodically. Changes will be posted on this page with a revised date.",
      },
    ],
  },
};

const Legal = () => {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "privacy";
  const content = legalContent[page] || legalContent.privacy;

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
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Legal;

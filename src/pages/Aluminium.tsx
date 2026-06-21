import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import { useAluminium } from "@/hooks/useAluminium";

/**
 * /aluminium — FourlinQ's aluminium product line (the deep-dive page).
 *
 * Shares its data with the /products material toggle via useAluminium so the
 * two surfaces never drift. Tita edits these from /admin > Content > Aluminium.
 */

const Aluminium = () => {
  const { systems } = useAluminium();

  return (
    <Layout>
      <PageHeader
        eyebrow="The aluminium line"
        title="Aluminium, when uPVC isn't enough."
        breadcrumbLabel="Aluminium"
        subtitle="FourlinQ carries two material lines. uPVC for most residential openings, aluminium for the projects that need bigger spans, thinner sightlines, or a different aesthetic. Three aluminium systems, each suited to a different brief."
      />

      {/* Sub-systems — content editable from /admin > Content > Aluminium */}
      <Section tone="canvas" size="lg">
        <div className="border-t border-[color:var(--rule-strong)]">
          {systems.map((sys) => (
            <article
              key={sys.slug}
              className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-6 border-b border-[color:var(--rule-soft)] py-12 lg:py-16"
            >
              {sys.hero_image_url ? (
                <div className="lg:col-span-12 mb-4 aspect-[21/9] overflow-hidden bg-[color:var(--canvas-soft)]">
                  <img
                    src={sys.hero_image_url}
                    alt={`${sys.name} system`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              <div className="lg:col-span-5">
                <h2 className="font-serif font-normal tracking-tight text-h3 lg:text-h2 text-[color:var(--ink-primary)] leading-[1.1]">
                  {sys.name}
                </h2>
                {sys.best_for ? (
                  <>
                    <p className="mt-4 text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)]">
                      Best for
                    </p>
                    <p className="mt-2 text-body text-[color:var(--ink-primary)] leading-[1.5] max-w-[28rem]">
                      {sys.best_for}
                    </p>
                  </>
                ) : null}
                {sys.spec_sheet_url ? (
                  <a
                    href={sys.spec_sheet_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-6 inline-block text-body-sm font-medium text-[color:var(--ink-primary)] border-b border-[color:var(--ink-primary)] pb-1 hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]"
                  >
                    Download spec sheet →
                  </a>
                ) : null}
              </div>
              {sys.summary ? (
                <p className="lg:col-span-7 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-[42rem]">
                  {sys.summary}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      {/* When aluminium vs uPVC — static framing copy */}
      <Section tone="soft" size="lg">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8">
          <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
            When we'd specify aluminium.
          </h2>
          <div className="lg:col-span-6 lg:col-start-7 space-y-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
            <p>
              Bigger openings without intermediate mullions. Thinner sightlines than a uPVC profile can give. Multi-storey or commercial projects where the frame is structural as much as aesthetic. Anywhere the architectural intent calls for less frame around more glass.
            </p>
            <p>
              For everything else (the standard residential opening, the bedroom window, the lanai door), uPVC is the right answer. Most of our houses are uPVC. Aluminium is what we reach for when uPVC genuinely isn't enough, not as a default upsell.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section tone="dark" size="md">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <h2 className="font-serif font-normal tracking-tight text-h3 text-white leading-[1.15]">
            Project on the edge of uPVC? Book the conversation.
          </h2>
          <div className="flex flex-wrap items-center gap-5">
            <EditorialButton to="/brand#contact" variant="primary" size="md">
              Book a Consultation
            </EditorialButton>
            <EditorialButton to="/why-upvc" variant="ghost" size="md" className="text-white hover:text-white">
              Read about uPVC
            </EditorialButton>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default Aluminium;

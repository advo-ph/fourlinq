import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";

/**
 * /aluminium — FourlinQ's aluminium product line, separate from the uPVC line.
 *
 * Per Tita (2026-05-25): "we carry two types of windows — uPVC system and
 * aluminium system (thermal break, non-thermal break, alu slim). these have
 * been mentioned to you when you visited the showrooms."
 *
 * This page makes the aluminium line visible alongside uPVC. Content-only
 * for now (no individual product cards) — explainer first, products to follow
 * once brochure specs land.
 */

const ALUMINIUM_SYSTEMS = [
  {
    id: "thermal-break",
    name: "Thermal Break",
    summary:
      "Aluminium profile with a non-conductive polyamide strip between the inner and outer halves of the frame. Cuts heat transfer from outside in (and condensation in air-conditioned interiors). The default choice for high-end residential and any space that's cooled year-round.",
    bestFor: "Air-conditioned interiors, west-facing facades, climate-controlled commercial.",
  },
  {
    id: "non-thermal-break",
    name: "Non-Thermal Break",
    summary:
      "Solid aluminium profile without the thermal isolator. Slimmer sightlines, lower cost, simpler fabrication. Standard for projects where conducted heat is not the primary concern.",
    bestFor: "Naturally ventilated spaces, covered lanais, secondary structures.",
  },
  {
    id: "alu-slim",
    name: "Alu Slim",
    summary:
      "Minimum-sightline aluminium system engineered for maximum glass area. The frame nearly disappears against the glazing. For projects where the architecture is the view and the window should not be.",
    bestFor: "Floor-to-ceiling glazing, panoramic openings, contemporary residential.",
  },
];

const Aluminium = () => (
  <Layout>
    <PageHeader
      eyebrow="The aluminium line"
      title="Aluminium, when uPVC isn't enough."
      breadcrumbLabel="Aluminium"
      subtitle="FourlinQ carries two material lines. uPVC for most residential openings, aluminium for the projects that need bigger spans, thinner sightlines, or a different aesthetic. Three aluminium systems, each suited to a different brief."
    />

    {/* Three system types — same eyebrow + body pattern as the uPVC pages */}
    <Section tone="canvas" size="lg">
      <div className="border-t border-[color:var(--rule-strong)]">
        {ALUMINIUM_SYSTEMS.map((sys) => (
          <article
            key={sys.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-6 border-b border-[color:var(--rule-soft)] py-12 lg:py-16"
          >
            <div className="lg:col-span-5">
              <h2 className="font-serif font-normal tracking-tight text-h3 lg:text-h2 text-[color:var(--ink-primary)] leading-[1.1]">
                {sys.name}
              </h2>
              <p className="mt-4 text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)]">
                Best for
              </p>
              <p className="mt-2 text-body text-[color:var(--ink-primary)] leading-[1.5] max-w-[28rem]">
                {sys.bestFor}
              </p>
            </div>
            <p className="lg:col-span-7 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-[42rem]">
              {sys.summary}
            </p>
          </article>
        ))}
      </div>
    </Section>

    {/* When aluminium vs uPVC — comparison framing */}
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
            For everything else — the standard residential opening, the bedroom window, the lanai door — uPVC is the right answer. Most of our houses are uPVC. Aluminium is what we reach for when uPVC genuinely isn't enough, not as a default upsell.
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

export default Aluminium;

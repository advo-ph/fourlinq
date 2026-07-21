import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import { useAluminium } from "@/hooks/useAluminium";
import { ALUMINIUM_FINISHES } from "@/data/fourlinq-data";
import ProfileSystems from "@/components/shared/ProfileSystems";

/**
 * /aluminium. FourlinQ's aluminium product line (the deep-dive page).
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

      {/* Hero image. The page was text-only and read as unfinished next to the
          photo-led /why-upvc. A real FourlinQ install with the slim dark-frame
          aluminium look the page describes (bigger glass, thinner sightlines). */}
      <div className="container-editorial">
        <div className="aspect-[16/9] overflow-hidden bg-[color:var(--canvas-soft)]">
          <img
            src="/images/aluminium/hero-slim-frame-residence.webp"
            alt="A three-storey FourlinQ residence with slim dark-frame aluminium windows and doors"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Sub-systems. Content editable from /admin > Content > Aluminium */}
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

      {/* Profile systems. Standard / Regular and Alu Slim, supplied by Imie
          2026-05-31. Data existed in PROFILE_SYSTEMS but rendered nowhere. */}
      <Section tone="canvas" size="lg">
        <div className="grid lg:grid-cols-12 gap-x-12 mb-12">
          <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
            The aluminium profiles.
          </h2>
          <p className="lg:col-span-6 lg:col-start-7 mt-6 lg:mt-0 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] self-end">
            Two profile families sit under the systems above. The choice is wall thickness against sightline.
          </p>
        </div>
        <ProfileSystems material="aluminium" />
      </Section>

      {/* Powder-coat finishes, client-supplied. The systems above come from the
          CMS via useAluminium; these swatches have no CMS table yet. */}
      <Section tone="soft" size="lg">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-3">Popular finishes</p>
            <h2 className="font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
              Powder-coat colours.
            </h2>
          </div>
          <ul className="lg:col-span-7 flex flex-wrap gap-x-8 gap-y-5">
            {ALUMINIUM_FINISHES.map((f) => (
              <li key={f.id} className="flex items-center gap-3">
                <span
                  className="inline-block h-8 w-8 rounded-full border border-[color:var(--rule-soft)]"
                  style={{ backgroundColor: f.hex }}
                />
                <span className="text-body text-[color:var(--ink-primary)]">{f.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* When aluminium vs uPVC. Static framing copy */}
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
      {/* noAnimation: dark band flush against the dark footer — animating the
          container read as the footer/background moving. See Index BrandCTA. */}
      <Section tone="dark" size="md" noAnimation>
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

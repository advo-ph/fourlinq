import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { ArrowRight } from "lucide-react";

/**
 * /finishes — display-only catalog page (2026-05-24).
 *
 * Earlier version had an interactive hero (click a swatch → window preview
 * cross-fades) and filter tabs. Pulled both out: this page now just shows
 * the twelve finishes, captioned. No clicks change anything.
 */

const Finishes = () => (
  <Layout>
    <PageHeader
      eyebrow="The catalog"
      title="Twelve finishes in the uPVC library."
      breadcrumbLabel="Finishes"
      subtitle="The verified physical-sample data contains seven wood-grain and five solid uPVC finishes. This page does not promise that every finish is available on every profile, product, or order."
    />

    {/* The twelve finishes — static grid. No interaction. */}
    <Section tone="canvas" size="lg">
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
        {FRAME_FINISHES.map((f) => {
          const hasRealTexture = f.hasTexture && f.textureImagePath;
          return (
            <li key={f.id}>
              <div
                className="aspect-square w-full overflow-hidden border border-[color:var(--rule-soft)]"
                style={hasRealTexture ? undefined : { backgroundColor: f.swatchHex }}
              >
                {hasRealTexture && (
                  <img
                    src={f.textureImagePath}
                    alt={`${f.label} finish`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="mt-4 text-body-sm font-medium text-[color:var(--ink-primary)]">
                {f.label}
              </p>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-muted)] mt-1">
                {f.category === "wood-grain" ? "Wood grain" : "Solid"}
              </p>
            </li>
          );
        })}
      </ul>
    </Section>

    {/* The provenance — why these finishes */}
    <Section tone="soft" size="md">
      <div className="grid lg:grid-cols-[5fr,7fr] gap-12 lg:gap-20">
        <div>
          <h2 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1]">
            Twelve finishes, not twelve hundred.
          </h2>
        </div>
        <div className="space-y-5 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.7] max-w-[40rem]">
          <p>
            These twelve entries come from FourlinQ's recorded physical uPVC sample bars. The source set supports the names, categories, and sample appearance; it does not include a published colorfastness test, salt-air validation, or universal compatibility matrix.
          </p>
          <p>
            On-screen swatches and texture photos vary by display, lighting, crop, and source image. Confirm a current physical sample, coating or laminate identifier, profile compatibility, and availability before approving a finish.
          </p>
          <p>
            Aluminium uses a separate four-color powder-coat list on the Aluminium page. Do not carry a uPVC finish selection across to aluminium without FourlinQ's written confirmation.
          </p>
        </div>
      </div>
    </Section>

    {/* CTA */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
        <h2 className="font-serif text-h2 lg:text-h1 text-white tracking-tight leading-[1.1]">
          See the finish on a real system.
        </h2>
        <ul className="flex flex-col divide-y divide-white/15 border-y border-white/15">
          <li>
            <Link to="/products" className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300">
              <span className="text-body-lg font-medium">Browse all systems</span>
              <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </li>
          <li>
            <Link to="/brand#showrooms" className="group flex items-center justify-between gap-4 py-4 text-white hover:text-[color:var(--accent)] transition-colors duration-300">
              <span className="text-body-lg font-medium">Ask to view current physical samples</span>
              <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </li>
        </ul>
      </div>
    </Section>
  </Layout>
);

export default Finishes;

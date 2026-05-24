import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { benefits, comparisonData } from "@/data/benefits";
import { cn } from "@/lib/utils";

/**
 * /why-upvc — photo-led category-authority page.
 *
 * Rewritten 2026-05-24 from the prior icon-only/text-wall version that
 * Tita flagged as bad. Now each of the 7 brochure-verified advantages
 * gets its own photo-paragraph row (alternating L/R for visual rhythm)
 * using real product/material photos from /public/images/wp-export/.
 */

/** Real photo per benefit, sourced from brochure assets. */
const benefitPhoto: Record<string, { src: string; alt: string }> = {
  "attractive-appearance": {
    src: "/images/wp-export/Walnut-Profile.jpg",
    alt: "Close-up of FourlinQ Walnut profile finish",
  },
  "fire-retardant": {
    src: "/images/wp-export/Fire-Retardant.jpg",
    alt: "uPVC fire-retardant material test",
  },
  "thermal-efficiency": {
    src: "/images/wp-export/White-Profile.jpg",
    alt: "FourlinQ multi-chamber uPVC profile cross-section",
  },
  "corrosion-resistant": {
    src: "/images/wp-export/Corrosion-Resistance.jpg",
    alt: "uPVC profile demonstrating corrosion resistance",
  },
  "long-lasting-performance": {
    src: "/images/wp-export/Stainless-Mechanism-e1568775693636.jpg",
    alt: "FourlinQ stainless steel operating hardware",
  },
  "weather-resistance": {
    src: "/images/wp-export/Air-Water-Tight.jpg",
    alt: "Air and water tight EPDM gasket assembly on FourlinQ profile",
  },
  "sound-insulation": {
    src: "/images/wp-export/Sound-Insulation.jpg",
    alt: "Sound-insulating multi-chamber uPVC + glazing assembly",
  },
};

const benefitElaboration: Record<string, string> = {
  "attractive-appearance":
    "Eleven heat-fused finishes. From a clean matte white that flatters tropical-modern facades to deep wood-grain laminates that read as solid timber from across the room. The finish is bonded to the profile at the factory, not painted on after. It does not chip when the contractor leans a ladder against it. It does not fade to a different color than the next window in the same elevation. A FourlinQ window installed in 2014 still matches one installed in 2026 if the same finish was specified.",
  "fire-retardant":
    "uPVC is self-extinguishing. The material does not propagate flame and stops burning when the heat source is removed. This is engineered into the polymer, not added as a coating. Electrical fires in older condominium stock and provincial residences are a real category of risk. The difference between a frame that contributes to a fire and one that resists it is the difference between losing a window and losing a wing of the house.",
  "thermal-efficiency":
    "A multi-chamber uPVC profile is not a hollow tube. It is a series of air pockets engineered to break the path of heat. Each chamber adds a small thermal break that compounds across the depth of the profile. A west-facing wall hit by direct afternoon sun stays cooler on the interior surface than one with a less-insulated frame. Lower surface temperature means less radiant heat into the room, which means the airconditioner runs less often, which means a quieter, cheaper home.",
  "corrosion-resistant":
    "uPVC is inherently inert. It does not rust, does not oxidize, does not require sacrificial coatings to stay protected. In salt-air conditions on the coast, or on a high-floor unit exposed to amihan, that nature is doing the protecting. There is no coating to fail. A FourlinQ uPVC profile installed within a kilometer of the sea will look the same in ten years as it does the day the install crew leaves.",
  "long-lasting-performance":
    "The 10-year FourlinQ system warranty covers structural performance, the weather seal, and the finish. Not just the profile. This warranty term matches what we have observed in our installs over more than two decades. uPVC does not warp in tropical humidity, does not rot when a typhoon drives water against it for six hours, and does not require sanding, repainting, or resealing on the maintenance schedule a timber frame demands.",
  "weather-resistance":
    "Two engineering details do most of the work. EPDM gaskets compress under sash pressure to form an airtight seal. Drainage holes machined into the frame let any water that does penetrate run back out rather than pool inside the chamber. During a Habagat-driven afternoon storm where rain is wind-driven horizontally at 60 km/h, a properly installed FourlinQ system stays dry inside.",
  "sound-insulation":
    "Multi-chamber profiles plus glazing thicknesses from 6 mm to 12 mm produce 24–32 dB of acoustic attenuation in standard residential installations. A bedroom on a busy street feels noticeably quieter than a single-glazed room next door. The reduction is largest at the frequency band of road traffic, which is exactly where homeowners feel the difference between a restful bedroom and one that needs a white-noise machine.",
};

const WhyUpvc = () => (
  <Layout>
    <PageHeader
      eyebrow="The material"
      title="Why uPVC."
      breadcrumbLabel="Why uPVC"
      subtitle="A material chosen for what a Philippine home actually goes through. The heat. The humidity. The salt air along the coast. The storms that test what a house is made of."
    />

    {/* Opening editorial — split with hero spec photo */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12 items-center">
        <div className="lg:col-span-6">
          <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
            uPVC is the material chosen for most FourlinQ residential installations. It is inherently inert, dimensionally stable in tropical humidity, and engineered to hold its finish for decades without painting or recoating.
          </p>
          <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] max-w-[36rem]">
            It is the material we chose because it is the material that survives twenty Philippine summers without asking for help.
          </p>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="aspect-[4/5] overflow-hidden bg-[color:var(--canvas-soft)]">
            <img
              src="/images/wp-export/Walnut-Profile.jpg"
              alt="Close-up of FourlinQ multi-chamber uPVC profile with Walnut finish"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </Section>

    {/* The 7 benefits — alternating photo-paragraph rows */}
    <Section tone="soft" size="lg">
      <EyebrowHeading eyebrow="What you get" level={2}>
        Built for how you actually live.
      </EyebrowHeading>

      <ul className="mt-16 lg:mt-24 space-y-24 lg:space-y-32">
        {benefits.map((benefit, i) => {
          const photo = benefitPhoto[benefit.id];
          const elaboration = benefitElaboration[benefit.id];
          const reverse = i % 2 === 1;
          return (
            <li key={benefit.id}>
              <div className={cn(
                "grid lg:grid-cols-12 gap-x-8 lg:gap-x-12 gap-y-10 items-center",
              )}>
                {/* Photo column */}
                <div className={cn(
                  "lg:col-span-6",
                  reverse ? "lg:col-start-7 lg:row-start-1" : ""
                )}>
                  {photo && (
                    <div className="aspect-[4/3] lg:aspect-[5/4] overflow-hidden bg-[color:var(--canvas-soft)]">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Text column */}
                <div className={cn(
                  "lg:col-span-5",
                  reverse ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-8"
                )}>
                  <p className="eyebrow mb-4 text-[color:var(--accent)]">
                    0{i + 1}
                  </p>
                  <h3 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1] mb-5">
                    {benefit.title}
                  </h3>
                  <p className="text-body-lg text-[color:var(--ink-primary)] leading-[1.55] mb-4 font-medium">
                    {benefit.shortDescription}
                  </p>
                  {elaboration && (
                    <p className="text-body text-[color:var(--ink-secondary)] leading-[1.7]">
                      {elaboration}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>

    {/* Materials comparison — three columns, equal weight. FourlinQ sells
        uPVC AND aluminum; we describe each material's character honestly
        rather than declaring a winner. */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-8 mb-12 lg:mb-16">
        <div className="lg:col-span-5">
          <EyebrowHeading eyebrow="Material at a glance" level={2}>
            How the three materials compare.
          </EyebrowHeading>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] self-end">
          FourlinQ specifies uPVC for most residential applications and aluminum where the project asks for very large spans or slimmer sightlines. The table below describes each material's character, not a winner.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-t-2 border-b border-[color:var(--ink-primary)]">
              <th className="py-5 pr-6 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-muted)]">Feature</th>
              <th className="py-5 px-4 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-primary)]">uPVC</th>
              <th className="py-5 px-4 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-primary)]">Aluminium</th>
              <th className="py-5 pl-4 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-primary)]">Timber</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row) => (
              <tr key={row.feature} className="border-b border-[color:var(--rule-soft)]">
                <td className="py-5 pr-6 text-body-sm font-medium text-[color:var(--ink-muted)] align-top">
                  {row.feature}
                </td>
                <td className="py-5 px-4 text-body-sm text-[color:var(--ink-primary)] align-top">
                  {row.upvc}
                </td>
                <td className="py-5 px-4 text-body-sm text-[color:var(--ink-primary)] align-top">
                  {row.aluminium}
                </td>
                <td className="py-5 pl-4 text-body-sm text-[color:var(--ink-primary)] align-top">
                  {row.timber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-body-sm text-[color:var(--ink-muted)] italic max-w-[44rem]">
        FourlinQ offers both uPVC and aluminum systems. Your consultation will recommend whichever material fits the geometry, sightline preference, and climate exposure of your specific project.
      </p>
    </Section>

    {/* Climate context — photo-paragraph instead of icon cards */}
    <Section tone="soft" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-8 lg:gap-x-12 gap-y-12 items-center">
        <div className="lg:col-span-5">
          <EyebrowHeading eyebrow="The Philippine climate" level={2}>
            Three forces. One material.
          </EyebrowHeading>
          <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] max-w-[36rem]">
            We do not import European spec sheets. The material in our profiles is the same uPVC formulation used across northern Europe. The way we specify it (chamber count, steel reinforcement gauge, gasket compound, glazing thickness) is calibrated for what a Philippine house actually goes through.
          </p>
          <ul className="mt-10 space-y-6">
            <li className="border-t border-[color:var(--rule-soft)] pt-5">
              <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-2">Tropical heat</h3>
              <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
                Multi-chamber profile design traps air to reduce heat transfer. Lower interior surface temperatures, less radiant heat into the room.
              </p>
            </li>
            <li className="border-t border-[color:var(--rule-soft)] pt-5">
              <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-2">Coastal humidity</h3>
              <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
                From the salt air of the coast to year-round humidity inland, uPVC does not rust, does not corrode, does not require sacrificial coatings to survive.
              </p>
            </li>
            <li className="border-t border-[color:var(--rule-soft)] pt-5">
              <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-2">Storm conditions</h3>
              <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.65]">
                Engineered EPDM gaskets, drainage chambers, and galvanized steel reinforcement let a FourlinQ frame ride out the kinds of typhoons that drive rain horizontally for hours.
              </p>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="aspect-[4/5] overflow-hidden bg-[color:var(--canvas-soft)]">
            <img
              src="/images/wp-export/FQC-Project-17.jpg"
              alt="A FourlinQ installation seen from the inside, garden view through the glass"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </Section>

    {/* Honest limits */}
    <Section tone="canvas" size="md">
      <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-3">The honest part</p>
          <h2 className="font-serif text-h3 lg:text-h2 leading-[1.1] tracking-tight text-[color:var(--ink-primary)]">
            Where uPVC is not the right answer.
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6 space-y-5 text-body text-[color:var(--ink-secondary)] leading-[1.65]">
          <p>
            uPVC is the right answer for most Philippine residential windows and doors. It is not the right answer when the project calls for very large unbroken spans or for the slimmest possible sightlines — that is when we specify FourlinQ aluminum instead. Aluminum gives you the span and the sightline; uPVC gives you the thermal break and the maintenance-free finish.
          </p>
          <p>
            uPVC also does not pretend to be timber. If you want the look of solid hardwood, we offer wood-grain laminated finishes that do an honest job. If hardwood is the texture you want under your hand, we will tell you that and recommend a hardwood door from a specialist.
          </p>
          <p>
            Premium is not the same thing as universal. The right question is not <em>"which material is best"</em>; it is <em>"which material fits this opening, in this climate, with this design intent."</em> FourlinQ stocks both uPVC and aluminum so the consultation can recommend either honestly.
          </p>
        </div>
      </div>
    </Section>

    {/* CTA */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
        <EyebrowHeading eyebrow="Ready to specify?" level={2} toneInverse>
          See how uPVC reads in a real Philippine home.
        </EyebrowHeading>
        <div className="flex flex-wrap items-center gap-5">
          <EditorialButton to="/products" variant="primary" size="md">Browse Systems</EditorialButton>
          <EditorialButton to="/brand#showrooms" variant="ghost" size="md" className="text-white hover:text-white">
            Visit a Showroom
          </EditorialButton>
        </div>
      </div>
    </Section>
  </Layout>
);

export default WhyUpvc;

import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { benefits, comparisonData } from "@/data/benefits";
import { Eye, Flame, Sun, Shield, Clock, CloudRain, VolumeX, Droplets, Wind } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Eye size={22} strokeWidth={1.5} />,
  flame: <Flame size={22} strokeWidth={1.5} />,
  sun: <Sun size={22} strokeWidth={1.5} />,
  shield: <Shield size={22} strokeWidth={1.5} />,
  clock: <Clock size={22} strokeWidth={1.5} />,
  "cloud-rain": <CloudRain size={22} strokeWidth={1.5} />,
  "volume-x": <VolumeX size={22} strokeWidth={1.5} />,
};

/**
 * Editorial PH-climate elaboration per benefit. Brochure-verified short
 * descriptions are in src/data/fourlinq-data.ts ADVANTAGES — these expansions
 * add the WHY context that turns a feature list into an authority page.
 * Keep facts conservative; lean on Philippine climate specifics.
 */
const benefitElaboration: Record<string, string> = {
  "attractive-appearance":
    "Eleven heat-fused finishes. From a clean matte white that flatters tropical-modern facades to deep wood-grain laminates that read as solid timber from across the room. The finish is bonded to the profile at the factory, not painted on after. It does not chip when the contractor leans a ladder against it. It does not fade to a different color than the next window in the same elevation. A FourlinQ window installed in 2014 still matches one installed in 2026 if the same finish was specified.",
  "fire-retardant":
    "uPVC is self-extinguishing. The material does not propagate flame and stops burning when the heat source is removed. This is engineered into the polymer, not added as a coating. Electrical fires in older condominium stock and provincial residences are a real category of risk. The difference between a frame that contributes to a fire and one that resists it is the difference between losing a window and losing a wing of the house.",
  "thermal-efficiency":
    "A multi-chamber uPVC profile is not a hollow tube. It is a series of air pockets engineered to break the path of heat. Each chamber adds a small thermal break that compounds across the depth of the profile. A west-facing wall hit by direct afternoon sun transfers measurably less heat through a multi-chamber uPVC frame than through a single-chamber aluminum one. Lower interior surface temperature on the frame means less radiant heat into the room, which means the airconditioner runs less often, which means a quieter, cheaper home.",
  "corrosion-resistant":
    "Aluminum oxidizes. Steel rusts. uPVC does neither. In salt-air conditions on the coast, or on a high-floor unit exposed to amihan, this is the difference between a window frame that needs servicing inside a decade and one that does not. There is no sacrificial coating to fail. The material itself is the protection. A FourlinQ profile installed within a kilometer of the sea will look the same in ten years as it does the day the install crew leaves.",
  "long-lasting-performance":
    "The 10-year FourlinQ system warranty covers structural performance, the weather seal, and the finish. Not just the profile. This warranty term matches what we have observed in our installs over more than two decades. uPVC does not warp in tropical humidity, does not rot when a typhoon drives water against it for six hours, and does not require sanding, repainting, or resealing on the maintenance schedule a timber frame demands.",
  "weather-resistance":
    "Two engineering details do most of the work. EPDM gaskets compress under sash pressure to form an airtight seal. Drainage holes machined into the frame let any water that does penetrate run back out rather than pool inside the chamber. During a Habagat-driven afternoon storm where rain is wind-driven horizontally at 60 km/h, a properly installed FourlinQ system stays dry inside.",
  "sound-insulation":
    "Multi-chamber profiles plus glazing thicknesses from 6 mm to 12 mm produce 24–32 dB of acoustic attenuation in standard residential installations. A bedroom on a busy street feels noticeably quieter than a single-glazed aluminum room next door. The reduction is largest at the frequency band of road traffic, which is exactly where homeowners feel the difference between a restful bedroom and one that needs a white-noise machine.",
};

const climate = [
  {
    icon: <Sun size={20} strokeWidth={1.5} />,
    title: "Tropical heat",
    body: "Sun load on a Philippine house is not a temperate-climate problem. Multi-chamber profile design traps air to reduce heat transfer, which keeps interior surface temperatures down on the frame and reduces radiant heat into the room.",
  },
  {
    icon: <Droplets size={20} strokeWidth={1.5} />,
    title: "Coastal humidity",
    body: "From the salt air of Anilao to the year-round humidity of Iloilo, the materials in a window frame are tested constantly. uPVC does not rust, does not corrode, does not require sacrificial coatings to survive.",
  },
  {
    icon: <Wind size={20} strokeWidth={1.5} />,
    title: "Storm conditions",
    body: "Engineered EPDM gaskets, drainage chambers, and galvanized steel reinforcement let a FourlinQ frame ride out the kinds of typhoons that drive rain horizontally for hours at a stretch.",
  },
];

const WhyUpvc = () => (
  <Layout>
    <PageHeader
      eyebrow="The material"
      title="Why uPVC."
      breadcrumbLabel="Why uPVC"
      subtitle="A material chosen for what a Philippine home actually goes through. The heat. The humidity. The salt air along the coast. The storms that test what a house is made of."
    />

    {/* Opening editorial */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12">
        <div className="lg:col-span-7">
          <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
            uPVC is the material that quietly out-engineers every alternative in tropical residential construction. It does not rust like steel, warp like timber, oxidize like aluminum, or fade like painted finishes. It is the material we chose because it is the material that survives twenty Philippine summers without asking for help.
          </p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="eyebrow mb-4">At a glance</p>
          <ul className="space-y-4 text-body-sm text-[color:var(--ink-secondary)] leading-[1.6]">
            <li className="border-t border-[color:var(--rule-soft)] pt-4">
              <span className="font-serif text-h6 text-[color:var(--ink-primary)] block mb-1">Multi-chamber</span>
              Profile engineered with internal air pockets to break the path of heat
            </li>
            <li className="border-t border-[color:var(--rule-soft)] pt-4">
              <span className="font-serif text-h6 text-[color:var(--ink-primary)] block mb-1">Steel-reinforced</span>
              Galvanized core gives structural rigidity for full-height openings
            </li>
            <li className="border-t border-[color:var(--rule-soft)] pt-4">
              <span className="font-serif text-h6 text-[color:var(--ink-primary)] block mb-1">EPDM-sealed</span>
              Compression gasket holds an airtight, watertight seal across the lifetime of the system
            </li>
          </ul>
        </div>
      </div>
    </Section>

    {/* Benefits — editorial cards with elaboration */}
    <Section tone="soft" size="lg">
      <EyebrowHeading eyebrow="What you get" level={2}>
        Built for how you actually live.
      </EyebrowHeading>
      <ul className="mt-12 lg:mt-16 grid md:grid-cols-2 gap-x-10 gap-y-14 lg:gap-y-20">
        {benefits.map((benefit) => (
          <li key={benefit.id} className="border-t border-[color:var(--rule-soft)] pt-7">
            <div className="flex gap-4 items-start mb-4">
              <div className="shrink-0 text-[color:var(--ink-muted)] mt-1">{iconMap[benefit.icon]}</div>
              <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight leading-snug">
                {benefit.title}
              </h3>
            </div>
            <p className="text-body-sm lg:text-body text-[color:var(--ink-primary)] leading-[1.65] mb-4 font-medium">
              {benefit.shortDescription}
            </p>
            {benefitElaboration[benefit.id] && (
              <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.7]">
                {benefitElaboration[benefit.id]}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>

    {/* Comparison — editorial table */}
    <Section tone="canvas" size="lg">
      <EyebrowHeading eyebrow="Material comparison" level={2}>
        How uPVC stacks up.
      </EyebrowHeading>
      <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[40rem] leading-[1.65]">
        Side-by-side against the two materials uPVC most often replaces in Philippine residential construction. The differences read as feature lists; they show up in homes as different sounds, different surface temperatures, and different maintenance calendars.
      </p>

      <div className="mt-12 lg:mt-16 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-t-2 border-b border-[color:var(--ink-primary)]">
              <th className="py-4 pr-6 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-muted)]">Feature</th>
              <th className="py-4 px-4 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-primary)]">uPVC</th>
              <th className="py-4 px-4 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-muted)]">Aluminium</th>
              <th className="py-4 pl-4 text-[11px] tracking-[0.14em] uppercase font-medium text-[color:var(--ink-muted)]">Timber</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row) => (
              <tr key={row.feature} className="border-b border-[color:var(--rule-soft)]">
                <td className="py-4 pr-6 text-body-sm font-medium text-[color:var(--ink-primary)] align-top">{row.feature}</td>
                <td className="py-4 px-4 text-body-sm text-[color:var(--ink-primary)] font-medium align-top">{row.upvc}</td>
                <td className="py-4 px-4 text-body-sm text-[color:var(--ink-muted)] align-top">{row.aluminium}</td>
                <td className="py-4 pl-4 text-body-sm text-[color:var(--ink-muted)] align-top">{row.timber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    {/* Climate */}
    <Section tone="soft" size="lg">
      <EyebrowHeading eyebrow="The Philippine climate" level={2}>
        Three forces. One material.
      </EyebrowHeading>
      <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[40rem] leading-[1.65]">
        We do not import European spec sheets. The material in our profiles is the same uPVC formulation used across northern Europe. The way we specify it (chamber count, steel reinforcement gauge, gasket compound, glazing thickness) is calibrated for what a Philippine house actually goes through.
      </p>
      <ul className="mt-12 lg:mt-16 grid md:grid-cols-3 gap-px bg-[color:var(--rule-soft)]">
        {climate.map((item) => (
          <li key={item.title} className="bg-white p-8 lg:p-10">
            <div className="text-[color:var(--ink-muted)] mb-5">{item.icon}</div>
            <h3 className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight mb-3">{item.title}</h3>
            <p className="text-body-sm text-[color:var(--ink-secondary)] leading-[1.7]">{item.body}</p>
          </li>
        ))}
      </ul>
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
            uPVC is the right answer for residential windows and doors in the Philippines for almost every common application. It is not always the right answer for very large unbroken spans. Past a certain pane size, glass weight and wind load math push the spec toward aluminum-reinforced systems. We will say so during your consultation rather than over-specify.
          </p>
          <p>
            uPVC also does not pretend to be timber. If you want the look of solid hardwood, we offer wood-grain laminated finishes that do an honest job. If hardwood is the texture you want under your hand, we will tell you that and recommend a hardwood door from a specialist.
          </p>
          <p>
            Premium is not the same thing as universal. The right question is not <em>"is uPVC the best material"</em>; it is <em>"is uPVC the right material for this specific opening, in this specific climate, with this specific budget and design intent."</em> The answer is usually yes. When it is no, we will say so.
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

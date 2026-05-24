import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import { benefits, comparisonData } from "@/data/benefits";

/**
 * /why-upvc — restrained rewrite (2026-05-24, round 3).
 *
 * Calibrated against RESTRAINT.md. One hero, one feature block, one
 * 2x3 photo grid, one comparison table, one quiet limits section, one CTA.
 * No gradient overlays, no italic display words, no scroll cues, no numbered
 * eyebrows, no decorative hairlines, no custom keyframes.
 */

const elaboration: Record<string, string> = {
  "attractive-appearance":
    "Twelve finishes — six solid colors and six wood grains, heat-fused into the profile. The wood-grain ones have actual depth to them, so they hold up to being looked at closely.",
  "fire-retardant":
    "uPVC is self-extinguishing. Take the flame away and it stops burning. It's a property of the polymer itself, not a treatment applied at the surface.",
  "thermal-efficiency":
    "The profile is hollow and divided into chambers. The air trapped in those chambers slows heat transfer through the frame, which keeps the interior face of the window closer to room temperature and means less work for the AC.",
  "corrosion-resistant":
    "uPVC doesn't oxidize, so coastal projects don't behave any differently from inland ones. We've installed frames a few hundred meters from the shoreline that still look unchanged years later.",
  "long-lasting-performance":
    "Ten-year warranty on the profile, the weather seal, and the finish. The finish is fused into the surface, so the frame looks the same in year ten as it did the day it was installed — without painting or sanding.",
  "weather-resistance":
    "EPDM gaskets seal where the sash closes against the frame. If any water gets past the seal, drainage slots at the bottom let it run back out instead of sitting inside the profile. Tested against horizontal rain.",
  "sound-insulation":
    "With the right glazing, the chambered profile typically gives 24–32 dB of attenuation. That isn't silence, but a bedroom on a main road becomes usable as a bedroom again.",
};

const photo: Record<string, { src: string; alt: string }> = {
  "attractive-appearance":     { src: "/images/finishes/textures/walnut.jpeg",                  alt: "Walnut wood-grain finish texture" },
  "fire-retardant":            { src: "/images/wp-export/Fire-Retardant.jpg",                  alt: "uPVC fire-retardant material test" },
  "thermal-efficiency":        { src: "/images/wp-export/White-Profile.jpg",                   alt: "Multi-chamber uPVC profile cross-section" },
  "corrosion-resistant":       { src: "/images/wp-export/Corrosion-Resistance.jpg",            alt: "Salt-air corrosion test on uPVC" },
  "long-lasting-performance":  { src: "/images/wp-export/Stainless-Mechanism-e1568775693636.jpg", alt: "Stainless operating hardware" },
  "weather-resistance":        { src: "/images/wp-export/Air-Water-Tight.jpg",                 alt: "EPDM gasket weather seal" },
  "sound-insulation":          { src: "/images/wp-export/Sound-Insulation.jpg",                alt: "Sound-insulating profile and glazing" },
};

const find = (id: string) => benefits.find((b) => b.id === id)!;
const featured = "attractive-appearance";
const rest = [
  "fire-retardant",
  "thermal-efficiency",
  "corrosion-resistant",
  "long-lasting-performance",
  "weather-resistance",
  "sound-insulation",
];

const WhyUpvc = () => (
  <Layout>
    {/* ── Hero ── contained, white. Photo right, headline left. ── */}
    <Section tone="canvas" size="xl" noAnimation>
      <nav aria-label="Breadcrumb" className="mb-16">
        <ol className="flex items-center gap-2 text-body-sm text-[color:var(--ink-muted)]">
          <li>
            <Link to="/" className="hover:text-[color:var(--ink-primary)]">FourlinQ</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[color:var(--ink-primary)]">Why uPVC</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-12 gap-x-12 gap-y-12 items-end">
        <div className="lg:col-span-6">
          <h1 className="font-serif font-normal tracking-tight text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] leading-[1] text-[color:var(--ink-primary)]">
            Why uPVC.
          </h1>
          <p className="mt-8 text-lead text-[color:var(--ink-secondary)] max-w-[36rem]">
            We use uPVC because of the things this country does to a window — the heat, the humidity, the salt air along the coast, and the storms. The rest of this page is what that actually means for the frame in your wall.
          </p>
        </div>
        <div className="lg:col-span-6">
          <div className="aspect-[4/5] overflow-hidden bg-[color:var(--canvas-soft)]">
            <img
              src="/images/wp-export/Walnut-Profile.jpg"
              alt="FourlinQ multi-chamber uPVC profile in Walnut finish"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </Section>

    {/* ── Featured advantage ── one large photo + caption ── */}
    <Section tone="canvas" size="lg" contained={false} noAnimation>
      <div className="container-editorial">
        <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-[color:var(--canvas-soft)]">
          <img
            src={photo[featured].src}
            alt={photo[featured].alt}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-10 lg:mt-12 grid lg:grid-cols-12 gap-x-12">
          <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-[2.5rem] lg:text-h3 leading-[1.1] text-[color:var(--ink-primary)]">
            {find(featured).title}
          </h2>
          <p className="lg:col-span-6 lg:col-start-7 mt-6 lg:mt-0 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-[36rem]">
            {elaboration[featured]}
          </p>
        </div>
      </div>
    </Section>

    {/* ── Six remaining advantages ── one repeating tile, 3x2 grid ── */}
    <Section tone="canvas" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {rest.map((id) => {
          const b = find(id);
          const p = photo[id];
          return (
            <article key={id}>
              <div className="aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)] mb-6">
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-serif font-normal tracking-tight text-h5 text-[color:var(--ink-primary)] leading-[1.2] mb-3">
                {b.title}
              </h3>
              <p className="text-body text-[color:var(--ink-secondary)] leading-[1.6]">
                {elaboration[id]}
              </p>
            </article>
          );
        })}
      </div>
    </Section>

    {/* ── Material comparison ── clean 3-col table, no badges ── */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-12 mb-14">
        <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
          uPVC. Aluminum. Timber.
        </h2>
        <p className="lg:col-span-6 lg:col-start-7 mt-6 lg:mt-0 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] self-end">
          We carry uPVC and aluminum. Most houses end up with uPVC; bigger openings or thinner sightlines go to aluminum. Timber sits in the third column for comparison — we don't sell it.
        </p>
      </div>

      <div className="border-t border-[color:var(--rule-soft)]">
        {/* Column headers */}
        <div className="grid grid-cols-4 border-b border-[color:var(--rule-soft)] py-5">
          <span className="text-body-sm text-[color:var(--ink-muted)]">Feature</span>
          <span className="text-body font-medium text-[color:var(--ink-primary)]">uPVC</span>
          <span className="text-body text-[color:var(--ink-secondary)]">Aluminum</span>
          <span className="text-body text-[color:var(--ink-secondary)]">Timber</span>
        </div>
        {comparisonData.map((row) => (
          <div key={row.feature} className="grid grid-cols-4 border-b border-[color:var(--rule-soft)] py-5">
            <span className="text-body-sm text-[color:var(--ink-muted)] pr-4">{row.feature}</span>
            <span className="text-body text-[color:var(--ink-primary)] pr-4">{row.upvc}</span>
            <span className="text-body text-[color:var(--ink-secondary)] pr-4">{row.aluminium}</span>
            <span className="text-body text-[color:var(--ink-secondary)] pr-4">{row.timber}</span>
          </div>
        ))}
      </div>
    </Section>

    {/* ── Honest limits ── plain two-column ── */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8">
        <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
          Where uPVC isn't the answer.
        </h2>
        <div className="lg:col-span-6 lg:col-start-7 space-y-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
          <p>
            For very large unbroken spans or the slimmest possible sightlines, we specify FourlinQ aluminum. For hardwood texture under your hand, we'll point you to a specialist instead of selling laminate.
          </p>
          <p>
            The right question is not which material is best — it's which material fits this opening. We stock both uPVC and aluminum so the consultation can recommend either honestly.
          </p>
        </div>
      </div>
    </Section>

    {/* ── CTA ── single dark section, two buttons ── */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <h2 className="font-serif font-normal tracking-tight text-h3 text-white leading-[1.15]">
          See how uPVC reads in a real Philippine home.
        </h2>
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

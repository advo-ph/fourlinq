import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import PageBody from "@/components/shared/PageBody";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import { benefits, comparisonData } from "@/data/benefits";
import { UPVC_PROFILE_FEATURES } from "@/data/fourlinq-data";
import ProfileSystems from "@/components/shared/ProfileSystems";

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
    "Twelve finishes in total. Six solid colors and six wood grains, heat-fused into the profile. The wood-grain ones have actual depth to them, so they hold up to being looked at closely.",
  "fire-retardant":
    "uPVC is self-extinguishing. Take the flame away and it stops burning. It's a property of the polymer itself, not a treatment applied at the surface.",
  "thermal-efficiency":
    "The profile is hollow and divided into chambers. The air trapped in those chambers slows heat transfer through the frame, which keeps the interior face of the window closer to room temperature and means less work for the AC.",
  "corrosion-resistant":
    "uPVC doesn't oxidize, so coastal projects don't behave any differently from inland ones. We've installed frames a few hundred meters from the shoreline that still look unchanged years later.",
  "long-lasting-performance":
    "Ten-year limited warranty on the profile, the weather seal, and the finish. The finish is fused into the surface, so the frame looks the same in year ten as it did the day it was installed. You don't paint it or sand it down at any point.",
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

// Five wood-grain finishes that cycle through the pinned-scroll featured block.
const SCROLL_TEXTURES = [
  { id: "walnut",      label: "Walnut",      src: "/images/finishes/textures/walnut.jpeg" },
  { id: "dark-oak",    label: "Dark Oak",    src: "/images/finishes/textures/dark-oak.jpeg" },
  { id: "golden-oak",  label: "Golden Oak",  src: "/images/finishes/textures/golden-oak.jpg" },
  { id: "oak-malt",    label: "Oak Malt",    src: "/images/finishes/textures/oak-malt.jpeg" },
  { id: "oak-light",   label: "Oak Light",   src: "/images/finishes/textures/oak-light.png" },
];

const FeaturedTextureScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const idx = Math.min(SCROLL_TEXTURES.length - 1, Math.floor(progress * SCROLL_TEXTURES.length));
      setActiveIdx(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = SCROLL_TEXTURES[activeIdx];

  return (
    <div
      ref={containerRef}
      className="relative bg-[color:var(--canvas-soft)]"
      style={{ height: `${SCROLL_TEXTURES.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="container-editorial w-full">
          <div className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-[color:var(--canvas)]">
            {SCROLL_TEXTURES.map((t, i) => (
              <img
                key={t.id}
                src={t.src}
                alt={`${t.label} wood-grain finish`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out"
                style={{ opacity: i === activeIdx ? 1 : 0 }}
              />
            ))}
          </div>
          <div className="mt-8 lg:mt-10 grid lg:grid-cols-12 gap-x-12 items-baseline">
            <div className="lg:col-span-5">
              <h2 className="font-serif font-normal tracking-tight text-[2.5rem] lg:text-h3 leading-[1.1] text-[color:var(--ink-primary)]">
                {find(featured).title}
              </h2>
              <p
                key={current.id}
                className="mt-3 text-[11px] tracking-[0.16em] uppercase text-[color:var(--ink-muted)] transition-opacity duration-500"
              >
                {current.label} · {activeIdx + 1} of {SCROLL_TEXTURES.length}
              </p>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 mt-6 lg:mt-0 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] max-w-[36rem]">
              {elaboration[featured]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
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
    {/* ── Full-viewport hero ── text left, profile image right, both vertically
        centered. Breadcrumb floats at top inside the same hero. ── */}
    <header className="relative h-[calc(100vh-72px)] flex flex-col">
      <div className="container-editorial pt-8 lg:pt-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[12px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)]">
            <li>
              <Link to="/" className="hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin">
                FourlinQ
              </Link>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} strokeWidth={1.5} /></li>
            <li className="text-[color:var(--ink-primary)] font-medium">Why uPVC</li>
          </ol>
        </nav>
      </div>

      <div className="container-editorial flex-1 flex items-center py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-16 items-center w-full">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-6">
              The material
            </p>
            <h1 className="font-serif font-normal tracking-tight text-[color:var(--ink-primary)] text-[3rem] sm:text-[3.75rem] lg:text-[5rem] xl:text-[6rem] leading-[1.02] max-w-[14ch]">
              Why uPVC.
            </h1>
            <p className="mt-8 lg:mt-10 text-body-lg lg:text-lead text-[color:var(--ink-secondary)] max-w-[36rem] leading-[1.55]">
              We use uPVC because of what this country does to a window. The heat, the humidity, the salt air along the coast, the storms. The rest of this page is what that actually means for the frame in your wall.
            </p>
          </div>
          <div className="lg:col-span-7">
            <img
              src="/images/wp-export/Walnut-Profile.png"
              alt="FourlinQ multi-chamber uPVC profile in Walnut finish"
              loading="eager"
              decoding="async"
              className="block w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
        </div>
      </div>
    </header>

    {/* ── What's in the frame ── the brochure's 7 cut-section features ──
        Answers Imie 2026-07-15: "lacking so much information as to why you
        should choose uPVC — it just indicated the color?" The engineering case
        now runs BEFORE the finish/texture scroll, so the page argues the
        material first and shows colour second. Copy is brochure-verbatim
        (descriptionVerbatim) with a plain-language benefit under each. */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-12 mb-14">
        <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
          What's actually in the frame.
        </h2>
        <p className="lg:col-span-6 lg:col-start-7 mt-6 lg:mt-0 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] self-end">
          Seven things engineered into every FourlinQ uPVC profile — and what each one means once the window is in your wall.
        </p>
      </div>

      <ul className="border-t border-[color:var(--rule-strong)]">
        {UPVC_PROFILE_FEATURES.map((f) => (
          <li
            key={f.number}
            className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-3 border-b border-[color:var(--rule-soft)] py-8 lg:py-10"
          >
            <span className="lg:col-span-1 font-serif text-h4 leading-none text-[color:var(--accent)] tabular-nums">
              {f.number}
            </span>
            <h3 className="lg:col-span-4 font-serif font-normal tracking-tight text-h5 text-[color:var(--ink-primary)] leading-[1.2]">
              {f.label}
            </h3>
            <div className="lg:col-span-7">
              <p className="text-body text-[color:var(--ink-primary)] leading-[1.6]">
                {f.descriptionVerbatim}
              </p>
              <p className="mt-2 text-body-sm text-[color:var(--ink-secondary)] leading-[1.6]">
                {f.benefitPlain}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>

    {/* ── The profiles we build with ── Veka / Skyframe, supplied by Imie
        2026-05-31. Lives here because the brand and origin of the profile is
        part of the answer to "why uPVC", and it's what actually backs the
        European-engineering claim. */}
    <Section tone="soft" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-12 mb-12">
        <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
          The profiles we build with.
        </h2>
        <p className="lg:col-span-6 lg:col-start-7 mt-6 lg:mt-0 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] self-end">
          We don't extrude our own profile. We fabricate on established systems, and we'll tell you which one is in your wall.
        </p>
      </div>
      <ProfileSystems material="upvc" />
    </Section>

    {/* ── Featured advantage ── pinned scroll, cross-fades through 5 finishes ── */}
    <FeaturedTextureScroll />

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

    {/* ── Material comparison ── table with uPVC column highlighted ── */}
    <Section tone="soft" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-12 mb-14">
        <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
          uPVC. Aluminum. Timber.
        </h2>
        <p className="lg:col-span-6 lg:col-start-7 mt-6 lg:mt-0 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6] self-end">
          We carry uPVC and aluminum. Most houses end up with uPVC; bigger openings or thinner sightlines go to aluminum. Timber sits in the third column for comparison — we don't sell it.
        </p>
      </div>

      {/* Table — uPVC column gets a tinted background + bold text */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Header */}
          <div className="grid grid-cols-[1.5fr_2fr_2fr_2fr] border-t-2 border-[color:var(--ink-primary)]">
            <span className="eyebrow text-[color:var(--ink-muted)] py-5 pr-4">Feature</span>
            <span className="py-5 px-5 bg-[color:var(--canvas)] border-l border-r border-[color:var(--ink-primary)] font-serif text-h5 font-normal text-[color:var(--ink-primary)] leading-none">
uPV<span className="text-[color:var(--accent)]">C</span>
            </span>
            <span className="py-5 px-4 font-serif text-h5 font-normal text-[color:var(--ink-secondary)] leading-none">
              Aluminum
            </span>
            <span className="py-5 px-4 font-serif text-h5 font-normal text-[color:var(--ink-secondary)] leading-none">
              Timber
            </span>
          </div>

          {/* Rows */}
          {comparisonData.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1.5fr_2fr_2fr_2fr] border-b border-[color:var(--rule-soft)] ${i === 0 ? "border-t border-[color:var(--rule-soft)]" : ""}`}
            >
              <span className="text-body-sm font-medium uppercase tracking-[0.06em] text-[color:var(--ink-muted)] py-5 pr-4 self-start">
                {row.feature}
              </span>
              <span className="py-5 px-5 bg-[color:var(--canvas)] border-l border-r border-[color:var(--ink-primary)] text-body font-bold text-[color:var(--ink-primary)] leading-[1.5]">
                {row.upvc}
              </span>
              <span className="py-5 px-4 text-body-sm text-[color:var(--ink-secondary)] leading-[1.5]">
                {row.aluminium}
              </span>
              <span className="py-5 px-4 text-body-sm text-[color:var(--ink-secondary)] leading-[1.5]">
                {row.timber}
              </span>
            </div>
          ))}

          {/* Bottom edge of uPVC column */}
          <div className="grid grid-cols-[1.5fr_2fr_2fr_2fr]">
            <span />
            <span className="border-l border-r border-b-2 border-[color:var(--ink-primary)] bg-[color:var(--canvas)]" />
            <span />
            <span />
          </div>
        </div>
      </div>
    </Section>

    {/* ── Honest limits ── plain two-column ── */}
    <Section tone="canvas" size="lg">
      <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8">
        <h2 className="lg:col-span-5 font-serif font-normal tracking-tight text-h3 leading-[1.15] text-[color:var(--ink-primary)]">
          When we'd point you elsewhere.
        </h2>
        <div className="lg:col-span-6 lg:col-start-7 space-y-5 text-body-lg text-[color:var(--ink-secondary)] leading-[1.6]">
          <p>
            And if what you really want is hardwood, just buy hardwood. The wood-grain finish is good, but it's a finish. We'll tell you that before you order.
          </p>
        </div>
      </div>
    </Section>

    {/* Editable CMS body — empty by default */}
    <PageBody route="/why-upvc" />

    {/* ── CTA ── single dark section, two buttons ── */}
    <Section tone="dark" size="md">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <h2 className="font-serif font-normal tracking-tight text-h3 text-white leading-[1.15]">
          Come look at uPVC in person.
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

import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";

const ScrollWindow = lazy(() => import("@/components/home/ScrollWindow"));
// The real configurator, embedded (left picker / right live preview) — not a
// teaser card. Lazy so its icon set and preview don't weigh the first paint.
const DesignToolEmbed = lazy(() => import("@/pages/DesignTool"));
import { type HeroSlide } from "@/components/home/HeroCarousel";
import VideoHero from "@/components/home/VideoHero";
import SystemsTiles from "@/components/home/SystemsTiles";
import ProjectReels from "@/components/home/ProjectReels";
import InspirationStrip from "@/components/home/InspirationStrip";
import WhatsNew from "@/components/home/WhatsNew";
import BrandCTA from "@/components/home/BrandCTA";
import UtilityBand from "@/components/home/UtilityBand";

// Captions are intentionally generic until client confirms actual project locations.
const heroSlides: HeroSlide[] = [
  { src: "/images/wp-export/FourlinQ-Project-7.jpg", alt: "Modern white residence with FourlinQ casement windows", caption: "Featured residence" },
  { src: "/images/wp-export/FourlinQ-Project-8.jpg", alt: "Curved-glass home with custom FourlinQ shaped panels", caption: "Custom architectural project" },
  { src: "/images/brand-story.jpg",                  alt: "Three-story modern home with full FourlinQ system",    caption: "Three-storey residence" },
  { src: "/images/wp-export/FQC-Project-18.jpg",     alt: "Interior with sliding doors opening to a garden",      caption: "Sliding-door interior" },
  { src: "/images/wp-export/FQC-Project-17.jpg",     alt: "Living room with full-height casement windows",         caption: "Full-height casement project" },
  { src: "/images/hero-bg.jpg",                       alt: "Three-story modern home detail",                      caption: "Recent project" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero headline approved by Tita 2026-05-25. Two-line lockup, no lede
          or CTAs (per Prince, 2026-07-21) — the headline alone carries the
          hero and sits low over the video. */}
      <VideoHero
        videoSrc="/videos/hero-loop.mp4"
        fallbackSlides={heroSlides}
        headline={"Built to Last.\nDesigned to Inspire."}
      />

      {/* A little breathing room above the benefit sequence. */}
      <div aria-hidden="true" className="h-[10vh]" />

      {/* Benefit sequence. Its section title + Part 0 intro live inside the
          component now (aligned to the sequence's own margins), per Prince
          2026-07-21 — the old editorial subtitle moved into Part 0. */}
      <Suspense fallback={null}>
        <ScrollWindow />
      </Suspense>

      {/* Product gateway follows the ScrollWindow benefit sequence (per Prince,
          2026-07-21 — reverses the 2026-07-10 "categorize muna" ordering). On a
          white canvas rather than the soft grey it used when it sat above. */}
      <Section tone="canvas" size="lg">
        <SystemsTiles />
      </Section>

      <ProjectReels />

      {/* Our Projects gallery moved above the design tool (per Prince,
          2026-07-21) — project proof sits before the configurator. */}
      <InspirationStrip />

      {/* Showroom spotlight now sits above the design tool (per Prince,
          2026-07-22) — it carries the full canvas padding that the design
          tool section used to, and the design tool follows with !pt-0. */}
      <Section tone="canvas" size="lg">
        <WhatsNew />
      </Section>

      <Section tone="canvas" size="lg" className="!pt-0">
        <Suspense fallback={null}>
          <DesignToolEmbed embedded />
        </Suspense>
      </Section>

      <Section tone="dark" size="lg" noAnimation>
        <BrandCTA />
      </Section>

      {/* Three-card utility band, the one Marvin homepage module we lacked
          (Find a Dealer / Professional Resources / Photo Gallery → Showrooms /
          For Architects / Inspiration). Closes the completeness gap Imie
          flagged without cloning Marvin's collection architecture. */}
      <Section tone="dark" size="md" noAnimation className="!pt-0">
        <UtilityBand />
      </Section>
    </Layout>
  );
};

export default Index;

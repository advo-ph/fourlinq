import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";

const ScrollWindow = lazy(() => import("@/components/home/ScrollWindow"));
import { type HeroSlide } from "@/components/home/HeroCarousel";
import VideoHero from "@/components/home/VideoHero";
import SystemsTiles from "@/components/home/SystemsTiles";
import ProjectReels from "@/components/home/ProjectReels";
import InspirationStrip from "@/components/home/InspirationStrip";
import WhatsNew from "@/components/home/WhatsNew";
import BrandCTA from "@/components/home/BrandCTA";
import DesignToolPreview from "@/components/home/DesignToolPreview";

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
      {/* Hero headline approved by Tita 2026-05-25. Lede acknowledges both
          FourlinQ product lines (uPVC + aluminium). No warranty mention —
          per Tita, some customers opt out of the 10-yr warranty so it's
          not a universal homepage anchor. */}
      <VideoHero
        videoSrc="/videos/hero-loop.mp4"
        fallbackSlides={heroSlides}
        headline="Built to Last. Designed to Inspire."
        lede="Custom-made uPVC and aluminium systems, fabricated to your specifications."
        ctaLabel="Explore Systems"
        ctaTo="/products"
        secondaryLabel="Book Consultation"
        secondaryTo="/brand#contact"
      />

      {/* Categories before benefits. Imie, meeting 2026-07-10 (00:35:06):
          "categorize muna" — the site was reaching the benefit story before it
          ever showed what we sell. The product gateway used to sit below the
          500vh ScrollWindow sequence, starting around y=5400 on desktop. It now
          comes first, within one viewport of the hero; the benefit sequence
          follows it. */}
      <Section tone="soft" size="lg">
        <SystemsTiles />
      </Section>

      <Suspense fallback={null}>
        <ScrollWindow />
      </Suspense>

      <ProjectReels />

      <Section tone="canvas" size="lg">
        <DesignToolPreview />
      </Section>

      <InspirationStrip />

      <Section tone="canvas" size="lg" className="!pt-0">
        <WhatsNew />
      </Section>

      <Section tone="dark" size="lg" noAnimation>
        <BrandCTA />
      </Section>
    </Layout>
  );
};

export default Index;

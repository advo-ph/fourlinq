import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FinishExplorer from "@/components/home/FinishExplorer";

const ScrollWindow = lazy(() => import("@/components/home/ScrollWindow"));
import { type HeroSlide } from "@/components/home/HeroCarousel";
import VideoHero from "@/components/home/VideoHero";
import SystemsTiles from "@/components/home/SystemsTiles";
import ProjectReels from "@/components/home/ProjectReels";
import InspirationStrip from "@/components/home/InspirationStrip";
import WhatsNew from "@/components/home/WhatsNew";
import BrandCTA from "@/components/home/BrandCTA";

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
      <VideoHero
        videoSrc="/videos/hero-loop.mp4"
        fallbackSlides={heroSlides}
        caption="For the Philippine climate"
        headline="Built for the houses we share with the weather."
        lede="Custom-made uPVC windows and doors. Twelve finishes. One promise."
        ctaLabel="Explore Systems"
        ctaTo="/products"
      />

      <Suspense fallback={null}>
        <ScrollWindow />
      </Suspense>

      <Section tone="soft" size="lg">
        <SystemsTiles />
      </Section>

      <Section tone="canvas" size="lg">
        <EyebrowHeading eyebrow="Our Finishes" level={2}>
          Twelve finishes. Every product.
        </EyebrowHeading>
        <p className="mt-8 lg:mt-10 mb-12 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] leading-[1.6]">
          Seven wood-grain laminates from Oak Light to Walnut, and five solids including Jet Black, Charcoal Gray, and Matte Quartz. Each laminate is heat-fused directly to the uPVC core, not painted on.
        </p>
        <FinishExplorer />
      </Section>

      <ProjectReels />

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

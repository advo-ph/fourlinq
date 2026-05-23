import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import CapizDivider from "@/components/primitives/CapizDivider";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";

const Window3D = lazy(() => import("@/components/3d/Window3D"));
import { type HeroSlide } from "@/components/home/HeroCarousel";
import VideoHero from "@/components/home/VideoHero";
import EditorialIntro from "@/components/home/EditorialIntro";
import AuthorityStrip from "@/components/home/AuthorityStrip";
import SystemsTiles from "@/components/home/SystemsTiles";
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
        lede="Custom-made uPVC windows and doors. Eleven finishes. One promise."
        ctaLabel="Explore Systems"
        ctaTo="/products"
      />

      <Section tone="canvas" size="lg">
        <CapizDivider className="mb-section-mobile md:mb-section-tablet lg:mb-section-desktop" />
        <EditorialIntro />
      </Section>

      <Section tone="canvas" size="md">
        <AuthorityStrip />
      </Section>

      <Section tone="soft" size="lg">
        <SystemsTiles />
      </Section>

      {/* Interactive 3D window — procedural, no AI assets needed */}
      <Section tone="canvas" size="lg">
        <div className="grid lg:grid-cols-[5fr,6fr] gap-12 lg:gap-16 items-start">
          <div>
            <EyebrowHeading eyebrow="Try the systems" level={2}>
              Rotate. Open. Refinish.
            </EyebrowHeading>
            <p className="mt-8 lg:mt-10 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] leading-[1.6]">
              Drag to rotate. Click to open. Swap any of the eleven finishes.
            </p>
          </div>
          <div>
            <Suspense
              fallback={
                <div className="w-full aspect-[5/6] lg:aspect-[4/5] bg-[color:var(--canvas-soft)] flex items-center justify-center">
                  <p className="eyebrow">Loading 3D…</p>
                </div>
              }
            >
              <Window3D />
            </Suspense>
          </div>
        </div>
      </Section>

      <Section tone="canvas" size="lg">
        <InspirationStrip />
      </Section>

      <Section tone="canvas" size="lg" className="!pt-0">
        <WhatsNew />
      </Section>

      <Section tone="dark" size="lg">
        <BrandCTA />
      </Section>
    </Layout>
  );
};

export default Index;

import Layout from "@/components/layout/Layout";
import Section from "@/components/primitives/Section";
import HeroCarousel, { type HeroSlide } from "@/components/home/HeroCarousel";
import EditorialIntro from "@/components/home/EditorialIntro";
import SystemsTiles from "@/components/home/SystemsTiles";
import InspirationStrip from "@/components/home/InspirationStrip";
import WhatsNew from "@/components/home/WhatsNew";
import BrandCTA from "@/components/home/BrandCTA";

const heroSlides: HeroSlide[] = [
  { src: "/images/wp-export/FourlinQ-Project-7.jpg", alt: "Modern white residence with FourlinQ casement windows", caption: "Quezon City residence" },
  { src: "/images/wp-export/FourlinQ-Project-8.jpg", alt: "Curved-glass home with custom FourlinQ shaped panels", caption: "Tagaytay residence" },
  { src: "/images/brand-story.jpg",                  alt: "Three-story modern home with full FourlinQ system",       caption: "Quezon City residence" },
  { src: "/images/wp-export/FQC-Project-18.jpg",     alt: "Interior with sliding doors opening to a garden",         caption: "Las Piñas residence" },
  { src: "/images/wp-export/FQC-Project-17.jpg",     alt: "Living room with full-height casement windows",            caption: "Antipolo residence" },
  { src: "/images/hero-bg.jpg",                       alt: "Three-story modern home detail",                         caption: "Featured project" },
];

const Index = () => {
  return (
    <Layout>
      <HeroCarousel
        slides={heroSlides}
        headline="A lifetime of satisfaction and peace of mind."
        lede="Custom-made uPVC windows and doors engineered for the Philippine climate. Available in 11 finishes, backed by a 10-year warranty."
        ctaLabel="Explore Systems"
        ctaTo="/products"
        secondaryLabel="Visit a Showroom →"
        secondaryTo="/brand#showrooms"
      />

      <Section tone="canvas" size="lg">
        <EditorialIntro />
      </Section>

      <Section tone="soft" size="lg">
        <SystemsTiles />
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

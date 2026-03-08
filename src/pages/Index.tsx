import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import ProductsPreview from "@/components/home/ProductsPreview";
import DesignToolTeaser from "@/components/home/DesignToolTeaser";
import WhyUpvcCards from "@/components/home/WhyUpvcCards";
import InspirationGallery from "@/components/home/InspirationGallery";
import CTABanner from "@/components/shared/CTABanner";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <TrustBar />
      <ProductsPreview />
      <DesignToolTeaser />
      <WhyUpvcCards />
      <InspirationGallery />
      <CTABanner />
    </Layout>
  );
};

export default Index;

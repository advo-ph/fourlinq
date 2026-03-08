import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

interface CTABannerProps {
  headline?: string;
  subtext?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

const CTABanner = ({
  headline = "Ready to Transform Your Space?",
  subtext = "Book a free consultation with our fenestration specialists or browse our complete range of uPVC systems.",
  primaryLabel = "Book Consultation",
  primaryTo = "/brand#contact",
  secondaryLabel = "Browse Products",
  secondaryTo = "/products",
}: CTABannerProps) => {
  return (
    <AnimatedSection className="bg-primary py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground mb-4">
          {headline}
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
          {subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-surface text-primary hover:bg-surface/90 font-medium">
            <Link to={primaryTo}>{primaryLabel}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-medium">
            <Link to={secondaryTo}>{secondaryLabel}</Link>
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default CTABanner;

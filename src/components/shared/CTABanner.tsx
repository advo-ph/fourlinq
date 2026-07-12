import { Link } from "react-router-dom";

interface CTABannerProps {
  headline?: string;
  subtext?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

const CTABanner = ({
  headline = "Start with a conversation.",
  subtext = "Ninety minutes with a FourlinQ engineer at one of our three showrooms across Metro Manila and Cebu. Bring your floor plan, or just your questions.",
  primaryLabel = "Visit a Showroom",
  primaryTo = "/brand#showrooms",
  secondaryLabel = "Browse Products",
  secondaryTo = "/products",
}: CTABannerProps) => {
  return (
    <section className="bg-primary py-20">
      <div className="page-container max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground mb-4">
          {headline}
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
          {subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={primaryTo} className="inline-flex items-center justify-center px-8 py-3 bg-accent text-white text-sm font-medium uppercase tracking-[0.08em] hover:bg-red-700 transition-colors">
            {primaryLabel}
          </Link>
          <Link to={secondaryTo} className="inline-flex items-center justify-center px-8 py-3 border border-white/30 text-white text-sm font-medium uppercase tracking-[0.08em] hover:bg-white/10 transition-colors">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;

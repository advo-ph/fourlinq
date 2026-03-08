import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/wp-export/Our_Brand.jpg"
          alt="Modern Philippine home interior with large uPVC windows and natural light"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/70 to-surface/20 md:to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="text-sm font-medium uppercase tracking-[0.15em] text-accent mb-4">
            German-Engineered uPVC
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary leading-[1.1] mb-6">
            Premium Systems for Philippine Living
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-md">
            Windows and doors that insulate, protect, and beautify — designed for the tropical climate.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="font-medium text-base">
              <Link to="/products">Explore Systems</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium text-base border-primary/30 text-primary hover:bg-primary/5">
              <Link to="/design-tool">Open Design Tool</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown className="text-primary/40" size={28} />
      </motion.div>
    </section>
  );
};

export default HeroSection;

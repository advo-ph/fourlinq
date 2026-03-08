import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
          alt="Modern Philippine home interior with large uPVC windows and natural light"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-primary leading-tight mb-6">
            Premium uPVC Systems for Philippine Living
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            German-engineered windows and doors that insulate, protect, and beautify — designed specifically for the tropical Philippine climate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
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

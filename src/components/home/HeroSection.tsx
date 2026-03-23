import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-[#1a1a1a]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Modern home with large uPVC windows"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full page-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-left"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Precision.
            <br />
            Performance.
            <br />
            Perfection.
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-10 leading-relaxed max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
            Premium uPVC windows and doors engineered for Philippine homes.
            Designed for comfort, built to last.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white text-sm font-medium uppercase tracking-[0.1em] hover:bg-red-700 transition-all duration-300 hover:-translate-y-0.5"
            >
              Explore Collection
            </Link>
            <Link
              to="/brand#contact"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/40 text-white text-sm font-medium uppercase tracking-[0.1em] hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-0.5"
            >
              Request a Quote
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

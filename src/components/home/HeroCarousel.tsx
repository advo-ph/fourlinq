import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import EditorialButton from "@/components/primitives/Button";

export interface HeroSlide {
  src: string;
  alt: string;
  /** Eyebrow caption shown above headline (e.g. "Tagaytay Residence"). */
  caption?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  headline: string;
  lede: string;
  ctaLabel: string;
  ctaTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  /** Auto-advance interval in ms. Default 6000. */
  interval?: number;
}

/**
 * Marvin-style hero: cross-fading full-bleed photo carousel with a subtle
 * Ken Burns zoom on each slide, gradient scrim at bottom-left, single
 * primary CTA. Autoplay pauses on hover. Manual pagination dots.
 */
const HeroCarousel = ({
  slides,
  headline,
  lede,
  ctaLabel,
  ctaTo,
  secondaryLabel,
  secondaryTo,
  interval = 6000,
}: HeroCarouselProps) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (paused || total <= 1) return;
    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, interval);
    return () => clearInterval(intervalRef.current);
  }, [paused, total, interval]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[color:var(--canvas-dark)] -mt-[72px]"
      style={{ height: "min(100vh, 920px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="FourlinQ projects"
    >
      {/* Stacked image layers — only the active one is opacity-1 */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          {slides.map((slide, i) =>
            i === active ? (
              <motion.div
                key={i}
                className="absolute inset-0 will-change-[opacity,transform]"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1.05 }}
                exit={{ opacity: 0, scale: 1.08 }}
                transition={{
                  opacity: { duration: 1.2, ease: [0.68, 0, 0.33, 1] },
                  scale:   { duration: 8.0, ease: [0.68, 0, 0.33, 1] },
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* Single bottom-up scrim — softer than double-layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 pointer-events-none" />

      {/* Hero text block */}
      <div className="absolute inset-0 flex items-end pb-16 md:pb-20 lg:pb-24">
        <div className="container-editorial w-full">
          <div className="max-w-[42rem]" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>
            {slides[active]?.caption && (
              <p className="eyebrow !text-white mb-5 inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-white/80">
                {slides[active].caption}
              </p>
            )}
            <h1 className="font-serif font-normal tracking-tight text-white text-display-sm sm:text-[4rem] lg:text-h1 xl:text-display leading-[1.02]">
              {headline}
            </h1>
            <p className="mt-6 md:mt-8 text-body lg:text-body-lg text-white/90 max-w-[34rem]">
              {lede}
            </p>
            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">
              <EditorialButton to={ctaTo} variant="primary" size="md">
                {ctaLabel}
              </EditorialButton>
              {secondaryLabel && secondaryTo && (
                <EditorialButton to={secondaryTo} variant="ghost" size="md" className="text-white hover:text-white">
                  {secondaryLabel}
                </EditorialButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination dots, bottom-center */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {slides.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "transition-all duration-300 ease-marvin",
                  "h-px",
                  isActive ? "w-12 bg-white" : "w-8 bg-white/40 hover:bg-white/70"
                )}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;

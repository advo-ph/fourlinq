import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  alt: string;
  /** Eyebrow caption shown above headline (e.g. "Tagaytay Residence"). */
  caption?: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  /** Hero headline. May contain "\n" for a two-line lockup — the h1 renders
   *  with `whitespace-pre-line`. */
  headline: string;
  /** Auto-advance interval in ms. Default 6000. */
  interval?: number;
}

/**
 * Showroom hero: cross-fading full-bleed project carousel with restrained
 * centered copy and a two-button CTA rhythm.
 */
const HeroCarousel = ({
  slides,
  headline,
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
      style={{ height: "100dvh" }}
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
                  opacity: { duration: 1.2, ease: [0.5, 0, 0, 0.75] },
                  scale:   { duration: 8.0, ease: [0.5, 0, 0, 0.75] },
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      {/* Top scrim — keeps the transparent white nav legible over bright hero content (e.g. sky-heavy slides) */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/55 via-black/18 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-[3rem] sm:bottom-[3.75rem] md:bottom-[4.25rem] lg:bottom-[4.75rem]">
        <div className="container-editorial">
          <div className="w-full max-w-[43rem] text-left">
          {slides[active]?.caption && (
            <p className="mb-3 text-body-sm font-medium text-white">
              {slides[active].caption}
            </p>
          )}
          <h1 className="whitespace-pre-line font-serif text-[2.35rem] font-normal leading-[1.04] tracking-tight text-white sm:text-[2.75rem] md:text-[3.15rem] lg:text-[3.75rem] xl:text-h1">
            {headline}
          </h1>
          </div>
        </div>
      </div>

      {/* Pagination dots on a 44px tap target */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          {slides.map((_, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                className="group h-11 px-2 flex items-center justify-center"
              >
                <span
                  className={cn(
                    "block transition-all duration-300 ease-marvin",
                    "h-2 rounded-full",
                    isActive ? "w-2 bg-white" : "w-2 bg-white/40 group-hover:bg-white/80"
                  )}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;

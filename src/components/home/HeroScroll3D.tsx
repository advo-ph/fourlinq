import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-driven editorial showcase. Four scenes, each pairing one real
 * FourlinQ photo with a single editorial line. Sticky-scroll pinning is on
 * for both mobile and desktop — the section is 400vh tall; the visual + text
 * are pinned and scenes cross-fade as the user scrolls past.
 *
 * Layout is responsive within the pinned panel: desktop = side-by-side text
 * column + image column; mobile = full-bleed image with text overlaid at the
 * bottom on a dark gradient (so the photos still get full visual weight).
 *
 * Each scene uses a different image — no asset reuse across scenes or pages.
 */

interface Scene {
  eyebrow: string;
  headline: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
}

const SCENES: Scene[] = [
  {
    // TODO: client copy — first scene headline + body need brochure-verified replacements
    eyebrow: "FourlinQ",
    headline: "Custom-made, to your specifications.",
    body: "Custom uPVC and aluminum windows, sized to your architect's drawings, fabricated in our Manila workshop.",
    imageSrc: "/images/projects-fb/mbArIDA5.jpg",
    imageAlt: "Completed FourlinQ install at the Nuvali residence",
  },
  {
    eyebrow: "Engineered to move",
    headline: "Open. Close. Ten years.",
    body: "EPDM gaskets, galvanized steel reinforcement, and hardware tested through twenty monsoon seasons.",
    imageSrc: "/images/wp-export/Slide-and-Fold.jpg",
    imageAlt: "FourlinQ slide-and-fold door system, panels mid-fold",
  },
  {
    eyebrow: "Eleven finishes",
    headline: "From classic white to rich walnut.",
    body: "Solid colors and wood-grain laminates that hold their finish without painting or recoating.",
    imageSrc: "/images/wp-export/Great-Profile-Colors.jpg",
    imageAlt: "The lineup of FourlinQ uPVC profile finishes side by side",
  },
  {
    eyebrow: "Five systems",
    headline: "Casement. Sliding. Awning. Special Shapes. Slide & Fold.",
    body: "Combinable into curtain-wall feature walls. Specified per opening, not per catalog page.",
    imageSrc: "/images/projects-fb/yDrxH9L-.jpg",
    imageAlt: "FourlinQ slide-and-fold installation at San Lorenzo, Makati",
  },
];

const HeroScroll3D = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const [sceneIdx, setSceneIdx] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(SCENES.length - 1, Math.max(0, Math.floor(v * SCENES.length)));
    if (idx !== sceneIdx) setSceneIdx(idx);
  });

  const scene = SCENES[sceneIdx];

  return (
    <section
      ref={sectionRef}
      className="relative bg-[color:var(--canvas-soft)] h-[400vh]"
      aria-label="FourlinQ product showcase"
    >
      <div className="sticky top-0 h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* ── Desktop: left text column (hidden on mobile, text is overlaid instead) ── */}
        <div className="hidden lg:flex w-[42%] items-center px-16 bg-[color:var(--canvas-soft)] relative z-10">
          <div className="max-w-[28rem]">
            <motion.p
              key={`d-eyebrow-${sceneIdx}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.68, 0, 0.33, 1] }}
              className="eyebrow mb-5 text-[color:var(--ink-muted)]"
            >
              {scene.eyebrow}
            </motion.p>
            <motion.h2
              key={`d-headline-${sceneIdx}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.68, 0, 0.33, 1] }}
              className="font-serif text-h2 lg:text-h1 text-[color:var(--ink-primary)] tracking-tight leading-[1.05] mb-6"
            >
              {scene.headline}
            </motion.h2>
            <motion.p
              key={`d-body-${sceneIdx}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.68, 0, 0.33, 1] }}
              className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65]"
            >
              {scene.body}
            </motion.p>

            <div className="mt-10 flex items-center gap-2">
              {SCENES.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-[2px] transition-all duration-500 ease-[cubic-bezier(.68,0,.33,1)]",
                    i === sceneIdx
                      ? "w-10 bg-[color:var(--ink-primary)]"
                      : "w-5 bg-[color:var(--rule-soft)]",
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-[10px] tracking-[0.12em] uppercase text-[color:var(--ink-muted)]">
              Scroll to advance · {sceneIdx + 1} of {SCENES.length}
            </p>
          </div>
        </div>

        {/* ── Image column — fills the rest of the pinned panel; on mobile it's the whole panel ── */}
        <div className="relative flex-1 h-full bg-[color:var(--canvas)] overflow-hidden">
          {SCENES.map((s, i) => (
            <img
              key={i}
              src={s.imageSrc}
              alt={s.imageAlt}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-[cubic-bezier(.68,0,.33,1)]",
                i === sceneIdx ? "opacity-100" : "opacity-0",
              )}
            />
          ))}

          {/* Mobile-only text overlay — sits on a dark gradient so it stays readable on any photo */}
          <div className="lg:hidden absolute inset-x-0 bottom-0 pt-24 pb-10 px-6 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white">
            <motion.p
              key={`m-eyebrow-${sceneIdx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
              className="text-[11px] tracking-[0.14em] uppercase font-medium text-white/70 mb-3"
            >
              {scene.eyebrow}
            </motion.p>
            <motion.h2
              key={`m-headline-${sceneIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.68, 0, 0.33, 1] }}
              className="font-serif text-h3 leading-[1.1] tracking-tight mb-4"
            >
              {scene.headline}
            </motion.h2>
            <motion.p
              key={`m-body-${sceneIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.68, 0, 0.33, 1] }}
              className="text-body-sm text-white/85 leading-[1.6] max-w-[34rem]"
            >
              {scene.body}
            </motion.p>
            <div className="mt-6 flex items-center gap-2">
              {SCENES.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-[2px] transition-all duration-500 ease-[cubic-bezier(.68,0,.33,1)]",
                    i === sceneIdx ? "w-8 bg-white" : "w-4 bg-white/40",
                  )}
                />
              ))}
              <span className="ml-2 text-[10px] tracking-[0.12em] uppercase text-white/60">
                {sceneIdx + 1} / {SCENES.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroScroll3D;

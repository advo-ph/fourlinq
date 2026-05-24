import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import EditorialButton from "@/components/primitives/Button";
import WindowPreview from "@/components/configurator/WindowPreview";
import { FRAME_FINISHES } from "@/data/fourlinq-data";

/**
 * Home-page promo for the Design Tool. Replaces the old "Try the systems"
 * 3D viewer (rendered unreliably across browsers, didn't position well).
 *
 * Auto-cycles through four system/finish combos using the same SVG-based
 * WindowPreview component the configurator uses on /design-tool — so what
 * the visitor sees on the home page is exactly what they'll get when they
 * open the tool.
 */

interface PreviewConfig {
  type: string;
  finishId: string;
  width: number;
  height: number;
  glassTint: string;
  glassOpacity: number;
  label: string;
}

const CYCLE: PreviewConfig[] = [
  { type: "casement", finishId: "walnut", width: 1400, height: 1600, glassTint: "rgba(200,220,240,0.1)", glassOpacity: 0.1, label: "Casement · Walnut" },
  { type: "bifold", finishId: "golden-oak", width: 2800, height: 2200, glassTint: "rgba(200,220,240,0.1)", glassOpacity: 0.1, label: "Slide & Fold · Golden Oak" },
  { type: "curtain-wall", finishId: "charcoal-gray", width: 2400, height: 2400, glassTint: "rgba(180,210,240,0.15)", glassOpacity: 0.15, label: "Curtain Wall · Charcoal Gray" },
  { type: "special-shapes", finishId: "oak-light", width: 1600, height: 2000, glassTint: "rgba(200,220,240,0.1)", glassOpacity: 0.1, label: "Special Shapes · Oak Light" },
];

const ROTATION_MS = 3800;

const DesignToolPreview = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % CYCLE.length), ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  const cfg = CYCLE[idx];
  const finish = FRAME_FINISHES.find((f) => f.id === cfg.finishId) ?? FRAME_FINISHES[0];

  return (
    <div className="grid lg:grid-cols-[5fr,6fr] gap-12 lg:gap-16 items-center">
      <div>
        <EyebrowHeading eyebrow="Design Tool" level={2}>
          Build your window. Live.
        </EyebrowHeading>
        <p className="mt-8 lg:mt-10 text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[34rem] leading-[1.6]">
          Pick a system, choose a finish, set the size — watch it render in real time. The same preview engine architects use when they spec a FourlinQ project.
        </p>

        {/* Live config caption */}
        <div className="mt-8 mb-2 min-h-[20px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={cfg.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: [0.68, 0, 0.33, 1] }}
              className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)] font-medium"
            >
              {cfg.label} · {cfg.width} × {cfg.height} mm
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Cycle dots */}
        <div className="flex items-center gap-2 mb-10">
          {CYCLE.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Show configuration ${i + 1}`}
              className={`h-[2px] transition-all duration-500 ease-[cubic-bezier(.68,0,.33,1)] ${
                i === idx
                  ? "w-10 bg-[color:var(--ink-primary)]"
                  : "w-5 bg-[color:var(--rule-strong)] hover:bg-[color:var(--ink-muted)]"
              }`}
            />
          ))}
        </div>

        <EditorialButton to="/design-tool" variant="primary" size="md">
          Open the Design Tool
        </EditorialButton>
      </div>

      <div className="flex items-center justify-center min-h-[400px] lg:min-h-[480px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${cfg.type}-${cfg.finishId}-${cfg.width}-${cfg.height}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.68, 0, 0.33, 1] }}
          >
            <WindowPreview
              type={cfg.type}
              finishId={cfg.finishId}
              frameColor={finish.swatchHex}
              glassTint={cfg.glassTint}
              glassOpacity={cfg.glassOpacity}
              width={cfg.width}
              height={cfg.height}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DesignToolPreview;

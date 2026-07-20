import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * An image that drifts slightly as it scrolls through the viewport — the quiet
 * parallax-lite move that makes photography feel alive instead of pasted in.
 * The scale is tiny on purpose (1.0 -> 1.08); big parallax reads as a gimmick,
 * this reads as depth. Static under prefers-reduced-motion.
 *
 * ratio is a Tailwind aspect-* class so callers control the crop per placement.
 */
interface EditorialImageProps {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
  eager?: boolean;
  /** Overlay a soft dark gradient (for captions/text over the image). */
  scrim?: boolean;
}

const EditorialImage = ({
  src,
  alt,
  ratio = "aspect-[4/3]",
  className,
  eager = false,
  scrim = false,
}: EditorialImageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1.08, 1]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-[color:var(--canvas-soft)]", ratio, className)}>
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ scale }}
        className="h-full w-full object-cover"
      />
      {scrim && (
        /* Strong enough to hold white text over a bright photo; the via stop
           keeps the top half of the image clean. */
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
      )}
    </div>
  );
};

export default EditorialImage;

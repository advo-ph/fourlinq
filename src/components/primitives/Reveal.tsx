import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { MOTION } from "@/theme.config";
import type { ReactNode } from "react";

/**
 * The editorial motion backbone.
 *
 * Reveal / Stagger / StaggerItem give pages CHOREOGRAPHED motion instead of the
 * single blanket fade every <Section> already does. The difference is what
 * makes a page read as designed rather than flat: content arrives in sequence,
 * with intent, the way Marvin paces a scroll.
 *
 * All three reveal ONCE (not on every scroll-past — that reads as jitter) and
 * collapse to a no-op under prefers-reduced-motion, so the a11y contract holds.
 */

const EASE = MOTION.ease;

type Direction = "up" | "down" | "left" | "right" | "none";

const offset: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
};

interface RevealProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  /** Which way the element travels in from. Default "up". */
  from?: Direction;
  /** Seconds before it starts. Use to hand-choreograph a hero. Default 0. */
  delay?: number;
  /** Travel duration. Default 0.6s. */
  duration?: number;
}

export const Reveal = ({ children, from = "up", delay = 0, duration = 0.6, ...rest }: RevealProps) => {
  const reduced = useReducedMotion();
  if (reduced) return <motion.div {...rest}>{children}</motion.div>;
  return (
    <motion.div
      initial={{ opacity: 0, ...offset[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

interface StaggerProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  /** Gap between each child's reveal. Default 0.08s — quick, not sluggish. */
  gap?: number;
  /** Delay before the first child. Default 0. */
  delay?: number;
}

/** Wrap a group; direct <StaggerItem> children reveal one after another. */
export const Stagger = ({ children, gap = 0.08, delay = 0, ...rest }: StaggerProps) => {
  const reduced = useReducedMotion();
  if (reduced) return <motion.div {...rest}>{children}</motion.div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ shown: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: ReactNode;
  from?: Direction;
}

export const StaggerItem = ({ children, from = "up", ...rest }: StaggerItemProps) => {
  const reduced = useReducedMotion();
  if (reduced) return <motion.div {...rest}>{children}</motion.div>;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offset[from] },
        shown: { opacity: 1, x: 0, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;

import { useRef, useEffect, type ReactNode } from "react";
import { motion, useAnimation, useInView, useReducedMotion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

const ScrollReveal = ({ children, className }: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.15 });
  const controls = useAnimation();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      controls.set({ opacity: 1, scale: 1 });
      return;
    }
    if (isInView) {
      controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
      });
    } else {
      controls.start({
        opacity: 0,
        transition: { duration: 0.3, ease: "easeIn" },
      }).then(() => {
        controls.set({ scale: 0.96 });
      });
    }
  }, [isInView, controls, prefersReduced]);

  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? undefined : { opacity: 0, scale: 0.96 }}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;

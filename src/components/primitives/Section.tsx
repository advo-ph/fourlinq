import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { HTMLAttributes, ReactNode } from "react";
import { MOTION } from "@/theme.config";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Background mode. Marvin alternates between light + dark sections per page. */
  tone?: "canvas" | "soft" | "dark";
  /** Vertical padding scale. Default 'lg' = 120/72/48 desktop/tablet/mobile. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Wrap children in a Container with editorial max-width. Default true. */
  contained?: boolean;
  /** Disable the scroll-triggered fade-in animation. */
  noAnimation?: boolean;
}

const fadeVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const fadeTransition = {
  duration: 0.6,
  ease: MOTION.ease,
};

const Section = ({
  children,
  tone = "canvas",
  size = "lg",
  contained = true,
  noAnimation = false,
  className,
  ...rest
}: SectionProps) => {
  const prefersReducedMotion = useReducedMotion();

  const toneClass =
    tone === "soft" ? "bg-[color:var(--canvas-soft)]" :
    tone === "dark" ? "bg-[color:var(--canvas-dark)] text-[color:var(--ink-inverse)]" :
                      "bg-[color:var(--canvas)]";

  const padClass =
    size === "sm" ? "py-12 md:py-16 lg:py-20" :
    size === "md" ? "py-16 md:py-20 lg:py-24" :
    size === "xl" ? "py-20 md:py-28 lg:py-40" :
                    "py-section-mobile md:py-section-tablet lg:py-section-desktop";

  const content = contained ? (
    <div className="container-editorial">{children}</div>
  ) : (
    children
  );

  const classes = cn(toneClass, padClass, className);

  if (noAnimation || prefersReducedMotion) {
    return (
      <section className={classes} {...rest}>
        {content}
      </section>
    );
  }

  return (
    <motion.section
      className={classes}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeVariants}
      transition={fadeTransition}
      {...rest}
    >
      {content}
    </motion.section>
  );
};

export default Section;

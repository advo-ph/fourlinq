import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Background mode. Marvin alternates between light + dark sections per page. */
  tone?: "canvas" | "soft" | "dark";
  /** Vertical padding scale. Default 'lg' = 120/72/48 desktop/tablet/mobile. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Wrap children in a Container with editorial max-width. Default true. */
  contained?: boolean;
}

const Section = ({
  children,
  tone = "canvas",
  size = "lg",
  contained = true,
  className,
  ...rest
}: SectionProps) => {
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

  return (
    <section className={cn(toneClass, padClass, className)} {...rest}>
      {content}
    </section>
  );
};

export default Section;

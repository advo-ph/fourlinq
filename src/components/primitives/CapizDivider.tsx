import { cn } from "@/lib/utils";

/**
 * Subtle vernacular divider — abstracts the capiz-shell window lattice.
 *
 * Traditional Filipino capiz windows are a grid of translucent shell panes
 * held by thin wooden mullions. This component reduces that to its
 * essential rhythm: a row of small vertical ticks above a single hairline.
 * Not literal, not decorative — a quiet structural rhythm that's distinctly
 * Filipino in origin but reads as editorial restraint to anyone else.
 *
 * Use sparingly. Once per page maximum. The right places:
 *   - Between hero and first content section
 *   - Above the warranty/promise band
 *   - Above the footer-CTA section
 */

interface CapizDividerProps {
  className?: string;
  /** "rest" stays static. "wake" is for the rare moment we want subtle motion. */
  variant?: "rest" | "wake";
  /** Density — higher = more ticks, default 24. */
  ticks?: number;
}

const CapizDivider = ({ className, variant = "rest", ticks = 24 }: CapizDividerProps) => (
  <div className={cn("w-full flex items-end justify-center gap-[2px] h-3 select-none", className)} aria-hidden="true">
    {Array.from({ length: ticks }).map((_, i) => (
      <span
        key={i}
        className={cn(
          "bg-[color:var(--rule-strong)]",
          variant === "wake" && "transition-all duration-[600ms] ease-marvin"
        )}
        style={{
          width: "1px",
          height: variant === "wake" ? `${6 + Math.sin(i / 2) * 4}px` : "8px",
          opacity: 0.6,
        }}
      />
    ))}
  </div>
);

export default CapizDivider;

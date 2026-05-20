import { cn } from "@/lib/utils";

interface AccentStripeProps {
  /** Width of the stripe — Marvin uses 48px or 100px. */
  width?: "sm" | "lg";
  /** Color — defaults to brand accent. */
  color?: "accent" | "ink" | "muted";
  className?: string;
}

/**
 * Marvin's signature 5px colored accent stripe — used under collection titles
 * and as section-marker hairlines. Marvin sets width to either 48px or 100px.
 */
const AccentStripe = ({ width = "sm", color = "accent", className }: AccentStripeProps) => {
  const colorClass =
    color === "accent" ? "bg-[color:var(--accent)]" :
    color === "ink"    ? "bg-[color:var(--ink-primary)]" :
                         "bg-[color:var(--rule-strong)]";
  const widthClass = width === "lg" ? "w-[100px]" : "w-12";
  return <span className={cn("block h-[5px]", widthClass, colorClass, className)} aria-hidden="true" />;
};

export default AccentStripe;

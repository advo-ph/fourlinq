import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface FeatureLinkProps {
  to: string;
  children: ReactNode;
  /** Visual size variant. */
  size?: "sm" | "md";
  /** Inverse styling for dark backgrounds. */
  inverse?: boolean;
  external?: boolean;
  className?: string;
}

/**
 * Marvin's "Learn More →" pattern — plain text + arrow, no button chrome.
 * Underline appears on hover. Arrow nudges right on hover.
 */
const FeatureLink = ({
  to,
  children,
  size = "md",
  inverse = false,
  external = false,
  className,
}: FeatureLinkProps) => {
  const inkClass = inverse ? "text-[color:var(--ink-inverse)]" : "text-[color:var(--ink-primary)]";
  const sizeClass = size === "sm" ? "text-body-sm" : "text-body";

  const inner = (
    <span className={cn(
      "group inline-flex items-center gap-2 font-sans font-medium",
      "transition-colors duration-300 ease-marvin",
      sizeClass,
      inkClass,
      "border-b border-[color:var(--rule-strong)] hover:border-current pb-0.5",
      className
    )}>
      <span>{children}</span>
      <ArrowRight size={16} className="transition-transform duration-300 ease-marvin group-hover:translate-x-1" />
    </span>
  );

  if (external) {
    return <a href={to} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return <Link to={to}>{inner}</Link>;
};

export default FeatureLink;

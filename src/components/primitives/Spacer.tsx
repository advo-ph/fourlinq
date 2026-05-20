import { cn } from "@/lib/utils";

interface SpacerProps {
  /** Vertical space scale. Tokens match Marvin's v-space-* (4-64px). */
  size?: "v100" | "v200" | "v300" | "v400" | "v500" | "v600" | "v700" | "v800" | "v900";
  className?: string;
}

const Spacer = ({ size = "v500", className }: SpacerProps) => (
  <div className={cn(`h-${size}`, className)} aria-hidden="true" />
);

export default Spacer;

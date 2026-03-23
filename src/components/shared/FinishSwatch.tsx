import { FRAME_FINISHES } from "@/data/fourlinq-data";

interface FinishSwatchProps {
  finishId?: string;
  color: string;
  finishType?: "solid" | "wood-grain";
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-14 h-14",
};

const WoodGrainOverlay = () => (
  <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full opacity-[0.18]" preserveAspectRatio="none">
    <path d="M0 6 Q12 4 24 7 T48 5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    <path d="M0 13 Q16 11 28 14 T48 12" stroke="currentColor" strokeWidth="0.8" fill="none" />
    <path d="M0 20 Q10 18 22 21 T48 19" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M0 27 Q14 25 30 28 T48 26" stroke="currentColor" strokeWidth="0.7" fill="none" />
    <path d="M0 33 Q18 31 26 34 T48 32" stroke="currentColor" strokeWidth="1.3" fill="none" />
    <path d="M0 39 Q8 37 20 40 T48 38" stroke="currentColor" strokeWidth="0.9" fill="none" />
    <path d="M0 45 Q12 43 28 46 T48 44" stroke="currentColor" strokeWidth="1.1" fill="none" />
  </svg>
);

const FinishSwatch = ({
  finishId,
  color,
  finishType,
  size = "md",
  selected = false,
  className = "",
}: FinishSwatchProps) => {
  // Auto-detect finishType from finishId if not provided
  const resolvedType =
    finishType ??
    FRAME_FINISHES.find((f) => f.id === finishId)?.category ??
    "solid";

  const isWoodGrain = resolvedType === "wood-grain";
  const shape = isWoodGrain ? "rounded-lg" : "rounded-full";
  const borderStyle = selected
    ? "border-primary ring-2 ring-primary/30"
    : "border-border";

  return (
    <div
      className={`${sizeMap[size]} ${shape} border-[3px] ${borderStyle} relative overflow-hidden transition-colors ${className}`}
      style={{ backgroundColor: color, color: "#000" }}
    >
      {isWoodGrain && <WoodGrainOverlay />}
    </div>
  );
};

export default FinishSwatch;

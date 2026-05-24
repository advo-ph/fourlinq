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

const FinishSwatch = ({
  finishId,
  color,
  finishType,
  size = "md",
  selected = false,
  className = "",
}: FinishSwatchProps) => {
  const finish = FRAME_FINISHES.find((f) => f.id === finishId);
  const resolvedType = finishType ?? finish?.category ?? "solid";
  const isWoodGrain = resolvedType === "wood-grain";
  const shape = isWoodGrain ? "rounded-lg" : "rounded-full";
  const borderStyle = selected
    ? "border-primary ring-2 ring-primary/30"
    : "border-border";

  const hasRealTexture = finish?.hasTexture && finish.textureImagePath;

  return (
    <div
      className={`${sizeMap[size]} ${shape} border-[3px] ${borderStyle} relative overflow-hidden transition-colors ${className}`}
      style={hasRealTexture ? undefined : { backgroundColor: color }}
    >
      {hasRealTexture && (
        <img
          src={finish.textureImagePath}
          alt={finish.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default FinishSwatch;

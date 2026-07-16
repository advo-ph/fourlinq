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
  size = "md",
  selected = false,
  className = "",
}: FinishSwatchProps) => {
  const finish = FRAME_FINISHES.find((f) => f.id === finishId);
  const shape = "rounded-sm";
  const borderStyle = selected
    ? "border-[color:var(--ink-primary)] ring-1 ring-[color:var(--ink-primary)]"
    : "border-border";

  const hasRealTexture = finish?.hasTexture && finish.textureImagePath;

  return (
    <div
      className={`${sizeMap[size]} ${shape} border ${borderStyle} relative overflow-hidden transition-colors ${className}`}
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

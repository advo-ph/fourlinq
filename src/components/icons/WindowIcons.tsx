interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const defaultProps = { size: 48, strokeWidth: 1.5 };

// Shared constants for visual consistency
const FRAME = { x: 8, y: 6, w: 64, h: 68 }; // uniform bounding box
const INNER_SCALE = 0.6; // inner sash lines relative to outer frame

export const CasementIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <line x1="40" y1="6" x2="40" y2="74" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="12" y="10" width="24" height="60" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="44" y="10" width="24" height="60" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Left handle */}
    <rect x="31" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Right handle */}
    <rect x="47" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Left panel – hinge on left edge, arc sweeps right */}
    <path
      d="M12 22 A 18 18 0 0 1 30 40"
      strokeDasharray="3 2.5"
      strokeWidth={strokeWidth * 0.55}
      opacity={0.5}
    />
    <path
      d="M28 37 l2 3 l-3 1.5"
      strokeWidth={strokeWidth * 0.55}
      fill="none"
      opacity={0.5}
    />
    {/* Right panel – hinge on right edge, arc sweeps left */}
    <path
      d="M68 22 A 18 18 0 0 0 50 40"
      strokeDasharray="3 2.5"
      strokeWidth={strokeWidth * 0.55}
      opacity={0.5}
    />
    <path
      d="M52 37 l-2 3 l3 1.5"
      strokeWidth={strokeWidth * 0.55}
      fill="none"
      opacity={0.5}
    />
    {/* Hinge dots */}
    <circle cx="12" cy="20" r="1" fill="currentColor" opacity={0.5} />
    <circle cx="12" cy="58" r="1" fill="currentColor" opacity={0.5} />
    <circle cx="68" cy="20" r="1" fill="currentColor" opacity={0.5} />
    <circle cx="68" cy="58" r="1" fill="currentColor" opacity={0.5} />
  </svg>
);

export const AwningIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <rect x="13" y="11" width="54" height="58" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Top hinge dots */}
    <circle cx="24" cy="11" r="1" fill="currentColor" opacity={0.6} />
    <circle cx="56" cy="11" r="1" fill="currentColor" opacity={0.6} />
    {/* Bottom-swing arc */}
    <path
      d="M13 69 Q40 50 67 69"
      strokeDasharray="3 2.5"
      strokeWidth={strokeWidth * 0.55}
      opacity={0.5}
    />
    {/* Swing arrow */}
    <line x1="40" y1="64" x2="40" y2="52" strokeWidth={strokeWidth * 0.65} opacity={0.55} />
    <path d="M37 56 l3 -4 l3 4" strokeWidth={strokeWidth * 0.65} fill="none" opacity={0.55} />
    {/* Handle */}
    <rect x="39" y="60" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const SlidingIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <line x1="8" y1="11" x2="72" y2="11" strokeWidth={strokeWidth * INNER_SCALE} />
    <line x1="8" y1="69" x2="72" y2="69" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="11" y="14" width="28" height="52" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="37" y="14" width="32" height="52" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Slide arrows */}
    <line x1="48" y1="40" x2="64" y2="40" strokeWidth={strokeWidth * 0.65} opacity={0.55} />
    <path d="M61 37 l3 3 l-3 3" strokeWidth={strokeWidth * 0.65} fill="none" opacity={0.55} />
    <line x1="48" y1="45" x2="32" y2="45" strokeWidth={strokeWidth * 0.65} opacity={0.55} />
    <path d="M35 42 l-3 3 l3 3" strokeWidth={strokeWidth * 0.65} fill="none" opacity={0.55} />
    {/* Handle */}
    <rect x="40" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const FixedIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <rect x="13" y="11" width="54" height="58" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect
      x="16"
      y="14"
      width="48"
      height="52"
      rx="0.5"
      strokeDasharray="2.5 4"
      strokeWidth={strokeWidth * 0.45}
    />
    {/* Fixed cross */}
    <line x1="16" y1="14" x2="64" y2="66" strokeWidth={strokeWidth * 0.3} opacity={0.25} />
    <line x1="64" y1="14" x2="16" y2="66" strokeWidth={strokeWidth * 0.3} opacity={0.25} />
  </svg>
);

export const TiltAndTurnIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <rect x="13" y="11" width="54" height="58" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Handle */}
    <rect x="61" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Turn arc – side hinge on left */}
    <path
      d="M13 11 Q38 40 13 69"
      strokeDasharray="3 2.5"
      strokeWidth={strokeWidth * 0.5}
      opacity={0.4}
    />
    {/* Tilt arc – bottom hinge */}
    <path
      d="M13 69 Q40 52 67 69"
      strokeDasharray="2.5 3"
      strokeWidth={strokeWidth * 0.5}
      opacity={0.35}
    />
    {/* Turn arrow */}
    <path d="M17 24 l-4 3 l4 3" strokeWidth={strokeWidth * 0.55} fill="none" opacity={0.45} />
    {/* Tilt arrow */}
    <path
      d="M40 62 l0 -6 M37 59 l3 -3 l3 3"
      strokeWidth={strokeWidth * 0.55}
      fill="none"
      opacity={0.45}
    />
    {/* Hinge dots */}
    <circle cx="13" cy="20" r="1" fill="currentColor" opacity={0.45} />
    <circle cx="13" cy="60" r="1" fill="currentColor" opacity={0.45} />
  </svg>
);

export const SlidingDoorIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <line x1="8" y1="11" x2="72" y2="11" strokeWidth={strokeWidth * INNER_SCALE} />
    <line x1="8" y1="69" x2="72" y2="69" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="12" y="14" width="26" height="52" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="36" y="14" width="32" height="52" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Slide arrows */}
    <line x1="50" y1="40" x2="64" y2="40" strokeWidth={strokeWidth * 0.65} opacity={0.55} />
    <path d="M61 37 l3 3 l-3 3" strokeWidth={strokeWidth * 0.65} fill="none" opacity={0.55} />
    <line x1="50" y1="45" x2="36" y2="45" strokeWidth={strokeWidth * 0.65} opacity={0.55} />
    <path d="M39 42 l-3 3 l3 3" strokeWidth={strokeWidth * 0.65} fill="none" opacity={0.55} />
    {/* Handle */}
    <rect x="40" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const BifoldIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <line x1="8" y1="11" x2="72" y2="11" strokeWidth={strokeWidth * INNER_SCALE} />
    <line x1="8" y1="69" x2="72" y2="69" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Panel 1 – flat */}
    <path d="M11 14 L24 14 L24 66 L11 66 Z" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Panel 2 – angled to show fold perspective */}
    <path d="M24 14 L36 16 L36 64 L24 66 Z" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Panel 3 – angled */}
    <path d="M40 14 L52 16 L52 64 L40 66 Z" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Panel 4 – flat */}
    <path d="M52 14 L69 14 L69 66 L52 66 Z" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Fold hinge dots */}
    <circle cx="24" cy="40" r="1.4" fill="currentColor" />
    <circle cx="52" cy="40" r="1.4" fill="currentColor" />
    {/* Fold arrows */}
    <path d="M29 38 l5 2 l-5 2" strokeWidth={strokeWidth * 0.65} />
    <path d="M47 38 l-5 2 l5 2" strokeWidth={strokeWidth * 0.65} />
    {/* Fold crease lines */}
    <line
      x1="24" y1="14" x2="24" y2="66"
      strokeDasharray="2.5 3"
      strokeWidth={strokeWidth * 0.45}
      opacity={0.35}
    />
    <line
      x1="38" y1="14" x2="38" y2="66"
      strokeDasharray="2.5 3"
      strokeWidth={strokeWidth * 0.45}
      opacity={0.35}
    />
    <line
      x1="52" y1="14" x2="52" y2="66"
      strokeDasharray="2.5 3"
      strokeWidth={strokeWidth * 0.45}
      opacity={0.35}
    />
  </svg>
);

export const LiftAndSlideIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    <line x1="8" y1="11" x2="72" y2="11" strokeWidth={strokeWidth * INNER_SCALE} />
    <line x1="8" y1="69" x2="72" y2="69" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="12" y="14" width="26" height="52" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="40" y="14" width="28" height="52" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Handle */}
    <rect x="43" y="36" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Lift-then-slide L-arrow */}
    <line x1="56" y1="46" x2="56" y2="34" strokeWidth={strokeWidth * 0.65} opacity={0.55} />
    <path d="M53.5 37 l2.5 -3 l2.5 3" strokeWidth={strokeWidth * 0.65} fill="none" opacity={0.55} />
    <line x1="56" y1="34" x2="66" y2="34" strokeWidth={strokeWidth * 0.65} opacity={0.55} />
    <path d="M63 31 l3 3 l-3 3" strokeWidth={strokeWidth * 0.65} fill="none" opacity={0.55} />
  </svg>
);

export const FrenchDoorIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    {/* Center mullion */}
    <line x1="40" y1="6" x2="40" y2="74" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Left door panel */}
    <rect x="12" y="10" width="24" height="60" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Right door panel */}
    <rect x="44" y="10" width="24" height="60" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Left muntin bars — 2x3 grid (1 vertical + 2 horizontal) */}
    <line x1="24" y1="10" x2="24" y2="70" strokeWidth={strokeWidth * 0.4} opacity={0.7} />
    <line x1="12" y1="30" x2="36" y2="30" strokeWidth={strokeWidth * 0.4} opacity={0.7} />
    <line x1="12" y1="50" x2="36" y2="50" strokeWidth={strokeWidth * 0.4} opacity={0.7} />
    {/* Right muntin bars — 2x3 grid (1 vertical + 2 horizontal) */}
    <line x1="56" y1="10" x2="56" y2="70" strokeWidth={strokeWidth * 0.4} opacity={0.7} />
    <line x1="44" y1="30" x2="68" y2="30" strokeWidth={strokeWidth * 0.4} opacity={0.7} />
    <line x1="44" y1="50" x2="68" y2="50" strokeWidth={strokeWidth * 0.4} opacity={0.7} />
    {/* Left handle */}
    <rect x="31" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Right handle */}
    <rect x="47" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Left door swing arc – clipped within frame */}
    <path
      d="M36 14 A 22 50 0 0 0 12 66"
      strokeDasharray="3 2.5"
      strokeWidth={strokeWidth * 0.5}
      opacity={0.45}
    />
    <path
      d="M14 63 l-2 3 l-2.5 -1"
      strokeWidth={strokeWidth * 0.5}
      fill="none"
      opacity={0.45}
    />
    {/* Right door swing arc – clipped within frame */}
    <path
      d="M44 14 A 22 50 0 0 1 68 66"
      strokeDasharray="3 2.5"
      strokeWidth={strokeWidth * 0.5}
      opacity={0.45}
    />
    <path
      d="M66 63 l2 3 l2.5 -1"
      strokeWidth={strokeWidth * 0.5}
      fill="none"
      opacity={0.45}
    />
  </svg>
);

export const EntranceIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    {/* Transom bar */}
    <line x1="8" y1="18" x2="72" y2="18" />
    {/* Transom glass */}
    <rect x="13" y="10" width="54" height="5" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Solid door panel */}
    <rect x="13" y="22" width="54" height="48" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Recessed panel inset — subtle depth indicator */}
    <rect
      x="17"
      y="26"
      width="46"
      height="41"
      rx="0.5"
      strokeWidth={strokeWidth * 0.4}
      opacity={0.25}
    />
    {/* Handle */}
    <rect x="57" y="42" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Swing arc */}
    <path
      d="M13 22 Q38 46 13 70"
      strokeDasharray="3 2.5"
      strokeWidth={strokeWidth * 0.5}
      opacity={0.35}
    />
  </svg>
);

export const LargePanelIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg viewBox="0 0 80 80" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    {/* One huge glass panel — the defining feature of large panel doors */}
    <rect x="13" y="13" width="54" height="54" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Subtle handle on the leading edge */}
    <rect x="60" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
    {/* Width arrows along the bottom to imply the "up to 6m" span */}
    <line x1="13" y1="73" x2="67" y2="73" strokeWidth={strokeWidth * 0.4} opacity={0.5} />
    <path d="M 13 73 L 16 71 M 13 73 L 16 75" strokeWidth={strokeWidth * 0.4} opacity={0.5} />
    <path d="M 67 73 L 64 71 M 67 73 L 64 75" strokeWidth={strokeWidth * 0.4} opacity={0.5} />
  </svg>
);

export const NinetySeriesIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  // aria-hidden so the embedded "90" glyph doesn't get spliced into the
  // button's accessible name (was rendering as "9090 Series" in textContent).
  <svg viewBox="0 0 80 80" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden="true">
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    {/* Two overlapping panels — sliding-door style with a heavier interlock at the meeting rail to signal the 90mm profile depth. */}
    <rect x="13" y="13" width="28" height="54" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    <rect x="39" y="13" width="28" height="54" rx="0.5" strokeWidth={strokeWidth * INNER_SCALE} />
    {/* Thicker interlock mullion */}
    <rect x="38" y="14" width="3" height="52" fill="currentColor" stroke="none" opacity={0.5} />
    {/* Handle */}
    <rect x="60" y="37" width="2" height="6" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const ArchIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg viewBox="0 0 80 80" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
    {/* Full-arch window — no rectangular frame, just the arched opening */}
    <path d="M 16 70 L 16 38 A 24 24 0 0 1 64 38 L 64 70 Z" strokeWidth={strokeWidth} />
    <path d="M 20 70 L 20 38 A 20 20 0 0 1 60 38 L 60 70 Z" strokeWidth={strokeWidth * INNER_SCALE} opacity={0.8} />
    {/* Springline + radial muntins */}
    <line x1="20" y1="38" x2="60" y2="38" strokeWidth={strokeWidth * 0.4} opacity={0.5} />
    <line x1="40" y1="38" x2="40" y2="18" strokeWidth={strokeWidth * 0.4} opacity={0.5} />
  </svg>
);

export const CurtainWallIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg viewBox="0 0 80 80" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    {/* 3×3 glass grid suggesting a curtain wall system */}
    {[0, 1, 2].map((c) =>
      [0, 1, 2].map((r) => (
        <rect
          key={`${c}-${r}`}
          x={13 + c * 18}
          y={13 + r * 18}
          width={16}
          height={16}
          rx={0.4}
          strokeWidth={strokeWidth * 0.5}
          opacity={0.7}
        />
      ))
    )}
  </svg>
);

export const CustomShapesIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg viewBox="0 0 80 80" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className}>
    {/* Trapezoid / angled shape — represents non-rectangular custom geometry */}
    <path d="M 16 70 L 16 30 L 40 12 L 64 30 L 64 70 Z" strokeWidth={strokeWidth} />
    <path d="M 20 66 L 20 33 L 40 18 L 60 33 L 60 66 Z" strokeWidth={strokeWidth * 0.6} opacity={0.7} />
  </svg>
);

export const SpecialShapesIcon = ({
  className,
  size = defaultProps.size,
  strokeWidth = defaultProps.strokeWidth,
}: IconProps) => (
  <svg
    viewBox="0 0 80 80"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
  >
    <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="1.5" />
    {/* Arch-top window: rectangular bottom + semicircular top */}
    <path
      d="M 18 67 L 18 38 A 22 22 0 0 1 62 38 L 62 67 Z"
      strokeWidth={strokeWidth * INNER_SCALE}
    />
    {/* Springline divider where arch meets the rectangular sash */}
    <line x1="18" y1="38" x2="62" y2="38" strokeWidth={strokeWidth * 0.4} opacity={0.6} />
    {/* Radial muntins fanning from the arch springline center */}
    <line x1="40" y1="38" x2="40" y2="16" strokeWidth={strokeWidth * 0.3} opacity={0.55} />
    <line x1="40" y1="38" x2="24" y2="22" strokeWidth={strokeWidth * 0.3} opacity={0.55} />
    <line x1="40" y1="38" x2="56" y2="22" strokeWidth={strokeWidth * 0.3} opacity={0.55} />
    {/* Vertical mullion in the rectangular section */}
    <line x1="40" y1="38" x2="40" y2="67" strokeWidth={strokeWidth * 0.4} opacity={0.55} />
  </svg>
);
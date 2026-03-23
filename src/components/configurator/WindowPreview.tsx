import { memo } from "react";

interface PreviewProps {
  type: string;
  frameColor: string;
  finishId: string;
  glassTint: string;
  glassOpacity: number;
  width: number;
  height: number;
}

const darken = (hex: string, amount: number) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `rgb(${r},${g},${b})`;
};

const lighten = (hex: string, amount: number) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `rgb(${r},${g},${b})`;
};

// Wood grain config per finish — grain line color, opacity, density, style
const woodGrainConfig: Record<string, {
  grainColor: string;
  grainOpacity: number;
  highlightColor: string;
  highlightOpacity: number;
  density: "fine" | "medium" | "bold";
}> = {
  "oak-light": {
    grainColor: "#8B7355",
    grainOpacity: 0.18,
    highlightColor: "#FFFFFF",
    highlightOpacity: 0.12,
    density: "fine",
  },
  "oak-malt": {
    grainColor: "#7A5C2E",
    grainOpacity: 0.25,
    highlightColor: "#E8D5A8",
    highlightOpacity: 0.15,
    density: "medium",
  },
  "golden-oak": {
    grainColor: "#6B4400",
    grainOpacity: 0.3,
    highlightColor: "#FFD970",
    highlightOpacity: 0.12,
    density: "bold",
  },
  "dark-oak": {
    grainColor: "#1A0A00",
    grainOpacity: 0.3,
    highlightColor: "#A06030",
    highlightOpacity: 0.15,
    density: "bold",
  },
  "walnut": {
    grainColor: "#1A0F08",
    grainOpacity: 0.35,
    highlightColor: "#8B6B50",
    highlightOpacity: 0.12,
    density: "bold",
  },
  "2-wood-black": {
    grainColor: "#000000",
    grainOpacity: 0.25,
    highlightColor: "#4A3A30",
    highlightOpacity: 0.1,
    density: "medium",
  },
  "woodgray": {
    grainColor: "#3A3530",
    grainOpacity: 0.2,
    highlightColor: "#A09890",
    highlightOpacity: 0.12,
    density: "medium",
  },
};

const WindowPreview = memo(({ type, frameColor, finishId, glassTint, glassOpacity, width, height }: PreviewProps) => {
  const aspectRatio = height / width;
  const svgW = 300;
  const svgH = svgW * Math.min(Math.max(aspectRatio, 0.4), 1.6);

  const dark = darken(frameColor, 35);
  const light = lighten(frameColor, 20);
  const num = parseInt(frameColor.replace("#", ""), 16);
  const brightness = ((num >> 16) + ((num >> 8) & 0xff) + (num & 0xff)) / 3;
  const handleClr = brightness > 160 ? "#888888" : lighten(frameColor, 60);

  const isWoodGrain = finishId in woodGrainConfig;
  const grainCfg = woodGrainConfig[finishId];

  const pad = 10;
  const fw = 12;
  const fx = pad, fy = pad, fWidth = svgW - pad * 2, fHeight = svgH - pad * 2;
  const gx = fx + fw, gy = fy + fw, gw = fWidth - fw * 2, gh = fHeight - fw * 2;
  const glassColor = `rgba(200,220,240,${0.12 + glassOpacity * 0.4})`;

  // --- Wood grain pattern definitions ---
  const renderDefs = () => {
    if (!isWoodGrain || !grainCfg) return null;

    const { grainColor, grainOpacity, highlightColor, highlightOpacity, density } = grainCfg;

    // Generate grain lines based on density
    const spacing = density === "fine" ? 3 : density === "medium" ? 4.5 : 6;
    const lineWidth = density === "fine" ? 0.6 : density === "medium" ? 0.9 : 1.2;
    const lines: { y: number; dx: number; w: number; o: number }[] = [];
    for (let y = 1; y < 40; y += spacing) {
      lines.push({
        y: y + (Math.sin(y * 0.7) * 0.8),
        dx: Math.sin(y * 0.3) * 2,
        w: lineWidth * (0.6 + Math.sin(y * 0.5) * 0.4),
        o: grainOpacity * (0.5 + Math.sin(y * 0.9) * 0.5),
      });
    }

    return (
      <defs>
        {/* Horizontal grain pattern (for top/bottom frame) */}
        <pattern id="grain-h" patternUnits="userSpaceOnUse" width="80" height="40">
          <rect width="80" height="40" fill={frameColor} />
          {lines.map((l, i) => (
            <path
              key={i}
              d={`M 0 ${l.y} Q 20 ${l.y + l.dx} 40 ${l.y - l.dx * 0.5} Q 60 ${l.y + l.dx * 0.7} 80 ${l.y}`}
              stroke={grainColor}
              strokeWidth={l.w}
              fill="none"
              opacity={l.o}
            />
          ))}
          {/* Highlight streaks */}
          {lines.filter((_, i) => i % 3 === 0).map((l, i) => (
            <path
              key={`h${i}`}
              d={`M 0 ${l.y + 1} Q 30 ${l.y + 1 + l.dx * 0.5} 80 ${l.y + 1}`}
              stroke={highlightColor}
              strokeWidth={l.w * 0.6}
              fill="none"
              opacity={highlightOpacity}
            />
          ))}
          {/* Knot detail */}
          <ellipse cx="55" cy="20" rx="3" ry="5" fill="none" stroke={grainColor} strokeWidth="0.5" opacity={grainOpacity * 0.4} />
        </pattern>

        {/* Vertical grain pattern (for left/right frame + sashes) */}
        <pattern id="grain-v" patternUnits="userSpaceOnUse" width="40" height="80" patternTransform="rotate(90)">
          <rect width="40" height="80" fill={frameColor} />
          {lines.map((l, i) => (
            <path
              key={i}
              d={`M 0 ${l.y} Q 20 ${l.y + l.dx} 40 ${l.y - l.dx * 0.5} Q 60 ${l.y + l.dx * 0.7} 80 ${l.y}`}
              stroke={grainColor}
              strokeWidth={l.w}
              fill="none"
              opacity={l.o}
              transform={`scale(1, ${80 / 40})`}
            />
          ))}
          {lines.filter((_, i) => i % 3 === 0).map((l, i) => (
            <path
              key={`h${i}`}
              d={`M 0 ${l.y + 1} Q 30 ${l.y + 1 + l.dx * 0.5} 80 ${l.y + 1}`}
              stroke={highlightColor}
              strokeWidth={l.w * 0.6}
              fill="none"
              opacity={highlightOpacity}
              transform={`scale(1, ${80 / 40})`}
            />
          ))}
        </pattern>

        {/* Combined pattern that tiles for general frame fill */}
        <pattern id="grain-fill" patternUnits="userSpaceOnUse" width="80" height="40">
          <rect width="80" height="40" fill={frameColor} />
          {lines.map((l, i) => (
            <path
              key={i}
              d={`M 0 ${l.y} C 15 ${l.y + l.dx * 1.5} 25 ${l.y - l.dx} 40 ${l.y + l.dx * 0.3} S 65 ${l.y - l.dx * 0.8} 80 ${l.y + l.dx * 0.5}`}
              stroke={grainColor}
              strokeWidth={l.w}
              fill="none"
              opacity={l.o}
            />
          ))}
          {lines.filter((_, i) => i % 2 === 0).map((l, i) => (
            <path
              key={`hl${i}`}
              d={`M 5 ${l.y + 0.8} Q 40 ${l.y + 0.8 + l.dx * 0.3} 75 ${l.y + 0.8}`}
              stroke={highlightColor}
              strokeWidth={l.w * 0.5}
              fill="none"
              opacity={highlightOpacity * 0.7}
            />
          ))}
        </pattern>
      </defs>
    );
  };

  // Fill color — pattern for wood, solid for others
  const frameFill = isWoodGrain ? "url(#grain-fill)" : frameColor;

  // --- Primitives ---

  const glass = (x: number, y: number, w: number, h: number) => (
    <g>
      {/* Opaque base to block any pattern underneath */}
      <rect x={x} y={y} width={w} height={h} fill="#D0D8E0" />
      <rect x={x} y={y} width={w} height={h} fill={glassTint} />
      <rect x={x} y={y} width={w} height={h} fill={glassColor} />
      <rect x={x} y={y} width={w} height={h * 0.35} fill="white" opacity="0.06" />
    </g>
  );

  const handle = (x: number, y: number, vertical = true) =>
    vertical ? (
      <g>
        <rect x={x - 2} y={y - 11} width={4} height={22} rx="2" fill={handleClr} opacity="0.85" />
        <rect x={x - 3} y={y - 2} width={6} height={4} rx="1.5" fill={handleClr} opacity="0.7" />
      </g>
    ) : (
      <g>
        <rect x={x - 11} y={y - 2} width={22} height={4} rx="2" fill={handleClr} opacity="0.85" />
        <rect x={x - 2} y={y - 3} width={4} height={6} rx="1.5" fill={handleClr} opacity="0.7" />
      </g>
    );

  const sash = (x: number, y: number, w: number, h: number) => {
    const s = 4;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={dark} rx="1" />
        <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} fill={frameFill} rx="1" />
        {glass(x + s, y + s, w - s * 2, h - s * 2)}
        <rect x={x + s} y={y + s} width={w - s * 2} height={h - s * 2} fill="none" stroke={dark} strokeWidth="0.5" opacity="0.4" />
      </g>
    );
  };

  // --- Outer frame ---
  const outerFrame = () => (
    <g>
      <rect x={fx + 2} y={fy + 3} width={fWidth} height={fHeight} rx="3" fill="black" opacity="0.08" />
      <rect x={fx} y={fy} width={fWidth} height={fHeight} rx="3" fill={dark} />
      <rect x={fx + 1.5} y={fy + 1.5} width={fWidth - 3} height={fHeight - 3} rx="2" fill={frameFill} />
      <line x1={fx + 3} y1={fy + 2} x2={fx + fWidth - 3} y2={fy + 2} stroke={light} strokeWidth="1.5" opacity="0.5" />
      <line x1={fx + 2} y1={fy + 3} x2={fx + 2} y2={fy + fHeight - 3} stroke={light} strokeWidth="1.5" opacity="0.3" />
      <line x1={fx + 3} y1={fy + fHeight - 2} x2={fx + fWidth - 3} y2={fy + fHeight - 2} stroke={dark} strokeWidth="1.5" opacity="0.5" />
      <line x1={fx + fWidth - 2} y1={fy + 3} x2={fx + fWidth - 2} y2={fy + fHeight - 3} stroke={dark} strokeWidth="1.5" opacity="0.3" />
      <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={dark} strokeWidth="1" opacity="0.5" />
    </g>
  );

  // --- Product types (unchanged logic) ---
  const renderContent = () => {
    switch (type) {
      case "casement": {
        const gap = 2;
        const pw = (gw - gap) / 2;
        const midX = gx + pw + gap / 2;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + pw + gap, gy, pw, gh)}
            <rect x={midX - 1.5} y={gy} width={gap + 1} height={gh} fill={frameFill} />
            <line x1={midX} y1={gy} x2={midX} y2={gy + gh} stroke={dark} strokeWidth="0.5" opacity="0.3" />
            {handle(midX - 7, gy + gh / 2)}
            {handle(midX + 7, gy + gh / 2)}
          </g>
        );
      }
      case "sliding": {
        const pw = gw / 2 + 4;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + gw - pw, gy, pw, gh)}
            {handle(gx + gw - 14, gy + gh / 2)}
          </g>
        );
      }
      case "fixed":
        return (
          <g>
            {glass(gx, gy, gw, gh)}
            <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={dark} strokeWidth="0.5" opacity="0.3" />
          </g>
        );
      case "awning":
        return (
          <g>
            {sash(gx, gy, gw, gh)}
            <circle cx={gx + 12} cy={gy + 6} r="2" fill={handleClr} opacity="0.6" />
            <circle cx={gx + gw - 12} cy={gy + 6} r="2" fill={handleClr} opacity="0.6" />
            {handle(gx + gw / 2, gy + gh - 10, false)}
          </g>
        );
      case "tilt-turn":
        return (
          <g>
            {sash(gx, gy, gw, gh)}
            <line x1={gx + gw / 2} y1={gy + 10} x2={gx + 12} y2={gy + gh - 10} stroke={handleClr} strokeWidth="0.6" strokeDasharray="4 3" opacity="0.12" />
            <line x1={gx + gw / 2} y1={gy + 10} x2={gx + gw - 12} y2={gy + gh - 10} stroke={handleClr} strokeWidth="0.6" strokeDasharray="4 3" opacity="0.12" />
            {handle(gx + gw - 12, gy + gh / 2)}
          </g>
        );
      case "bifold": {
        const panels = 4;
        const gap = 2;
        const pw = (gw - gap * (panels - 1)) / panels;
        return (
          <g>
            {Array.from({ length: panels }).map((_, i) => {
              const px = gx + i * (pw + gap);
              return (
                <g key={i}>
                  {sash(px, gy, pw, gh)}
                  {i < panels - 1 && <circle cx={px + pw + gap / 2} cy={gy + 8} r="2" fill={handleClr} opacity="0.6" />}
                </g>
              );
            })}
            {handle(gx + gw / 2, gy + gh / 2)}
          </g>
        );
      }
      case "sliding-door": {
        const pw = gw / 2 + 5;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + gw - pw, gy, pw, gh)}
            {handle(gx + gw - 16, gy + gh / 2)}
            <rect x={gx} y={gy + gh - 2} width={gw} height={2} fill={dark} opacity="0.15" />
          </g>
        );
      }
      case "lift-slide": {
        const pw = gw / 2 + 5;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + gw - pw, gy, pw, gh)}
            {handle(gx + gw - 16, gy + gh / 2)}
            <rect x={gx + gw - 19} y={gy + gh / 2 + 14} width={6} height={12} rx="2" fill={handleClr} opacity="0.7" />
            <rect x={gx} y={gy + gh - 4} width={gw} height={4} fill={dark} opacity="0.12" />
          </g>
        );
      }
      case "french-door": {
        const gap = 3;
        const pw = (gw - gap) / 2;
        const midX = gx + pw + gap / 2;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + pw + gap, gy, pw, gh)}
            <rect x={midX - 1.5} y={gy} width={gap} height={gh} fill={frameFill} />
            <line x1={midX} y1={gy} x2={midX} y2={gy + gh} stroke={dark} strokeWidth="0.5" opacity="0.3" />
            {handle(midX - 7, gy + gh / 2)}
            {handle(midX + 7, gy + gh / 2)}
          </g>
        );
      }
      case "entrance": {
        const transomH = gh * 0.2;
        const divider = 3;
        const doorTop = gy + transomH + divider;
        const doorH = gh - transomH - divider;
        const doorGlassH = doorH * 0.32;
        const panelTop = doorTop + doorGlassH + 8;
        const panelH = doorH - doorGlassH - 16;
        return (
          <g>
            {glass(gx, gy, gw, transomH)}
            <rect x={gx} y={gy} width={gw} height={transomH} fill="none" stroke={dark} strokeWidth="0.5" opacity="0.4" />
            <rect x={gx} y={gy + transomH} width={gw} height={divider} fill={frameFill} />
            <rect x={gx} y={doorTop} width={gw} height={doorH} fill={dark} rx="1" />
            <rect x={gx + 1} y={doorTop + 1} width={gw - 2} height={doorH - 2} fill={frameFill} rx="1" />
            {glass(gx + 8, doorTop + 6, gw - 16, doorGlassH)}
            <rect x={gx + 8} y={doorTop + 6} width={gw - 16} height={doorGlassH} fill="none" stroke={dark} strokeWidth="0.5" opacity="0.3" />
            <rect x={gx + 8} y={panelTop} width={gw - 16} height={panelH} rx="2" fill="none" stroke={dark} strokeWidth="0.8" opacity="0.15" />
            <rect x={gx + 16} y={panelTop + 8} width={gw - 32} height={panelH * 0.4} rx="2" fill="none" stroke={dark} strokeWidth="0.6" opacity="0.12" />
            <rect x={gx + 16} y={panelTop + panelH * 0.52} width={gw - 32} height={panelH * 0.38} rx="2" fill="none" stroke={dark} strokeWidth="0.6" opacity="0.12" />
            {handle(gx + gw - 18, doorTop + doorH / 2)}
            <rect x={gx + gw / 2 - 14} y={panelTop + panelH - 6} width={28} height={3} rx="1" fill={handleClr} opacity="0.6" />
          </g>
        );
      }
      default:
        return sash(gx, gy, gw, gh);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[320px]">
        {renderDefs()}
        {outerFrame()}
        {renderContent()}
      </svg>
      <p className="text-sm text-muted-foreground mt-4">{width} mm &times; {height} mm</p>
    </div>
  );
});

WindowPreview.displayName = "WindowPreview";

export default WindowPreview;

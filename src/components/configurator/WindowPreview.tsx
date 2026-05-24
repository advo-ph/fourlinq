import { memo } from "react";
import { FRAME_FINISHES } from "@/data/fourlinq-data";

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
    grainColor: "#8A6E3E",
    grainOpacity: 0.2,
    highlightColor: "#EDE0C0",
    highlightOpacity: 0.18,
    density: "fine",
  },
  "oak-malt": {
    grainColor: "#7A5C2E",
    grainOpacity: 0.25,
    highlightColor: "#E8D5A8",
    highlightOpacity: 0.15,
    density: "medium",
  },
  "black-wood": {
    grainColor: "#000000",
    grainOpacity: 0.25,
    highlightColor: "#4A3A30",
    highlightOpacity: 0.1,
    density: "medium",
  },
  "gray-wood": {
    grainColor: "#3A3530",
    grainOpacity: 0.2,
    highlightColor: "#A09890",
    highlightOpacity: 0.12,
    density: "medium",
  },
  "walnut": {
    grainColor: "#1A0F08",
    grainOpacity: 0.35,
    highlightColor: "#8B6B50",
    highlightOpacity: 0.12,
    density: "bold",
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

  const finishData = FRAME_FINISHES.find((f) => f.id === finishId);
  const hasRealTexture = finishData?.hasTexture && finishData.textureImagePath;
  const isWoodGrain = finishId in woodGrainConfig;
  const grainCfg = woodGrainConfig[finishId];

  const pad = 10;
  const fw = 12;
  const fx = pad, fy = pad, fWidth = svgW - pad * 2, fHeight = svgH - pad * 2;
  const gx = fx + fw, gy = fy + fw, gw = fWidth - fw * 2, gh = fHeight - fw * 2;
  const glassColor = `rgba(200,220,240,${0.12 + glassOpacity * 0.4})`;

  const renderDefs = () => {
    if (hasRealTexture) {
      return (
        <defs>
          <pattern id="grain-fill" patternUnits="objectBoundingBox" width="1" height="1">
            <image href={finishData.textureImagePath} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
          </pattern>
        </defs>
      );
    }

    if (!isWoodGrain || !grainCfg) return null;

    const { grainColor, grainOpacity, highlightColor, highlightOpacity, density } = grainCfg;
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

  const frameFill = (hasRealTexture || isWoodGrain) ? "url(#grain-fill)" : frameColor;

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
      case "special-shapes": {
        // Arch-topped window: half-circle top + rectangular sash below.
        const archH = Math.min(gw * 0.5, gh * 0.45);
        const archBottomY = gy + archH;
        const sashY = archBottomY + 3;
        const sashH = gh - archH - 3;
        const cx = gx + gw / 2;
        const r = gw / 2;
        return (
          <g>
            {/* Arch — glass + dark outline */}
            <path d={`M ${gx} ${archBottomY} A ${r} ${archH} 0 0 1 ${gx + gw} ${archBottomY} L ${gx + gw} ${archBottomY} Z`} fill="#D0D8E0" />
            <path d={`M ${gx} ${archBottomY} A ${r} ${archH} 0 0 1 ${gx + gw} ${archBottomY} L ${gx + gw} ${archBottomY} Z`} fill={glassTint} />
            <path d={`M ${gx} ${archBottomY} A ${r} ${archH} 0 0 1 ${gx + gw} ${archBottomY} L ${gx + gw} ${archBottomY} Z`} fill={glassColor} />
            <path d={`M ${gx} ${archBottomY} A ${r} ${archH} 0 0 1 ${gx + gw} ${archBottomY}`} fill="none" stroke={dark} strokeWidth="1.2" />
            {/* Radial mullions to suggest fan glazing */}
            {[0.25, 0.5, 0.75].map((t, i) => {
              const angle = Math.PI * t;
              const ex = cx - r * Math.cos(angle);
              const ey = archBottomY - archH * Math.sin(angle);
              return <line key={i} x1={cx} y1={archBottomY} x2={ex} y2={ey} stroke={frameColor} strokeWidth="2" />;
            })}
            {/* Rectangular sash below */}
            {sashH > 4 && sash(gx, sashY, gw, sashH)}
          </g>
        );
      }
      case "arch-shapes": {
        // Round-top (Palladian) window. Uses the full preview area: arch on
        // top, rectangular body below. The OUTER frame contour follows this
        // silhouette — drawn as a path with even-odd fill so the dark frame
        // is a visible band between the outer arch and an inset inner arch.
        const fwL = fw;  // match the rectangular outer-frame thickness                              // frame thickness in svg px
        const ox = pad, oy = pad;                   // outer position
        const ow = svgW - pad * 2;
        const oh = svgH - pad * 2;
        // Keep the arch as a smaller rounded crown (matches the picker icon):
        // ~25% of height, naturally proportioned to width.
        const archHOuter = Math.min(ow * 0.28, oh * 0.25);
        const bodyTopOuter = oy + archHOuter;
        const rOuter = ow / 2;
        const cx = ox + ow / 2;

        // Inner contour, inset by frame thickness on all sides
        const ix = ox + fwL;
        const iy = oy + fwL;
        const iw = ow - fwL * 2;
        const ih = oh - fwL * 2;
        const archHInner = Math.max(2, archHOuter - fwL);
        const bodyTopInner = iy + archHInner;
        const rInner = iw / 2;

        // Outer outline path — start at bottom-left, up the left wall, over the
        // arch, down the right wall, across the bottom, close.
        const outerD =
          `M ${ox} ${oy + oh} ` +
          `L ${ox} ${bodyTopOuter} ` +
          `A ${rOuter} ${archHOuter} 0 0 1 ${ox + ow} ${bodyTopOuter} ` +
          `L ${ox + ow} ${oy + oh} Z`;
        const innerD =
          `M ${ix} ${iy + ih} ` +
          `L ${ix} ${bodyTopInner} ` +
          `A ${rInner} ${archHInner} 0 0 1 ${ix + iw} ${bodyTopInner} ` +
          `L ${ix + iw} ${iy + ih} Z`;

        // Glass area = inner shape
        const glassArea = innerD;

        // Body / arch split points for mullions (inside inner shape)
        const bodyH = ih - archHInner;
        const bodyTop = bodyTopInner;

        return (
          <g>
            {/* Drop shadow under the whole silhouette */}
            <path d={outerD} transform="translate(2,3)" fill="black" opacity="0.08" />
            {/* Dark frame outline (the band) */}
            <path d={outerD} fill={dark} />
            {/* Frame fill (texture/color) — band between outer and inner */}
            <path d={`${outerD} ${innerD}`} fill={frameFill} fillRule="evenodd" />
            {/* Glass — fills the inner shape */}
            <path d={glassArea} fill="#D0D8E0" />
            <path d={glassArea} fill={glassTint} />
            <path d={glassArea} fill={glassColor} />
            <path d={glassArea} fill="white" opacity="0.06" />

            {/* Mullions — clipped to glass shape via a clipPath would be ideal,
                but at this scale we just draw lines inside the inner contour. */}
            {/* King mullion (vertical through both arch and body) */}
            <rect x={cx - 1.5} y={iy} width={3} height={ih} fill={frameFill} />
            <line x1={cx - 1.5} y1={iy} x2={cx - 1.5} y2={iy + ih} stroke={dark} strokeWidth="0.4" opacity="0.5" />
            <line x1={cx + 1.5} y1={iy} x2={cx + 1.5} y2={iy + ih} stroke={dark} strokeWidth="0.4" opacity="0.5" />
            {/* Fan muntins — symmetric pair across the arch */}
            {[0.32, 0.68].map((t, i) => {
              const angle = Math.PI * t;
              const ex = cx - rInner * Math.cos(angle);
              const ey = bodyTop - archHInner * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={cx} y1={bodyTop}
                  x2={ex} y2={ey}
                  stroke={frameColor}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              );
            })}
            {/* Horizontal mullion at body midpoint */}
            {bodyH > 12 && (
              <rect x={ix} y={bodyTop + bodyH / 2 - 1.5} width={iw} height={3} fill={frameFill} />
            )}
            {/* Spring-line where arch meets body */}
            <line x1={ix} y1={bodyTop} x2={ix + iw} y2={bodyTop} stroke={dark} strokeWidth="0.8" opacity="0.55" />

            {/* Final crisp outline */}
            <path d={outerD} fill="none" stroke={dark} strokeWidth="0.6" opacity="0.85" />
          </g>
        );
      }
      case "curtain-wall": {
        // Grid of glass panels — typical 3-wide × N-tall curtain wall.
        const cols = 3;
        const rows = Math.max(2, Math.round(gh / (gw / cols)));
        const cw = gw / cols;
        const rh = gh / rows;
        const cells: React.ReactElement[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = gx + c * cw;
            const y = gy + r * rh;
            cells.push(<g key={`${r}-${c}`}>{glass(x + 0.5, y + 0.5, cw - 1, rh - 1)}</g>);
          }
        }
        return (
          <g>
            {cells}
            {/* Mullions */}
            {Array.from({ length: cols + 1 }).map((_, i) => (
              <rect key={`v${i}`} x={gx + i * cw - 1} y={gy} width={2} height={gh} fill={frameFill} />
            ))}
            {Array.from({ length: rows + 1 }).map((_, i) => (
              <rect key={`h${i}`} x={gx} y={gy + i * rh - 1} width={gw} height={2} fill={frameFill} />
            ))}
          </g>
        );
      }
      case "custom-shapes": {
        // Gable (pentagonal) window — outer frame contour follows the gable
        // silhouette, with an inset inner contour creating the visible frame
        // band. Communicates "any custom geometry".
        const fwL = fw;  // match the rectangular outer-frame thickness
        const ox = pad, oy = pad;
        const ow = svgW - pad * 2;
        const oh = svgH - pad * 2;
        const peakY = oy;
        const eaveYOuter = oy + Math.min(ow * 0.32, oh * 0.38);
        const baseYOuter = oy + oh;
        const cx = ox + ow / 2;

        // Inset by frame thickness — for the angled top, inset along the
        // slope normal (approx by raising inner peak proportionally).
        const slopeRise = eaveYOuter - peakY;
        const slopeRun = ow / 2;
        const slopeLen = Math.hypot(slopeRise, slopeRun);
        // Peak inset: move down by a bit more than fwL to keep the slope band even
        const peakInsetY = peakY + fwL * (slopeLen / slopeRun);
        const eaveYInner = eaveYOuter + fwL * (slopeRise / slopeLen);
        const leftXInner = ox + fwL;
        const rightXInner = ox + ow - fwL;
        const baseYInner = baseYOuter - fwL;

        const outerD =
          `M ${cx} ${peakY} ` +
          `L ${ox + ow} ${eaveYOuter} ` +
          `L ${ox + ow} ${baseYOuter} ` +
          `L ${ox} ${baseYOuter} ` +
          `L ${ox} ${eaveYOuter} Z`;
        const innerD =
          `M ${cx} ${peakInsetY} ` +
          `L ${rightXInner} ${eaveYInner} ` +
          `L ${rightXInner} ${baseYInner} ` +
          `L ${leftXInner} ${baseYInner} ` +
          `L ${leftXInner} ${eaveYInner} Z`;

        return (
          <g>
            {/* Drop shadow under the silhouette */}
            <path d={outerD} transform="translate(2,3)" fill="black" opacity="0.08" />
            {/* Dark frame outline (under-band) */}
            <path d={outerD} fill={dark} />
            {/* Frame fill — band between outer and inner using even-odd */}
            <path d={`${outerD} ${innerD}`} fill={frameFill} fillRule="evenodd" />
            {/* Glass — fills the inner pentagon */}
            <path d={innerD} fill="#D0D8E0" />
            <path d={innerD} fill={glassTint} />
            <path d={innerD} fill={glassColor} />
            <path d={innerD} fill="white" opacity="0.06" />

            {/* Mullions inside the inner contour:
                - center post from peak inset to base
                - horizontal cross at the eave line */}
            <line x1={cx} y1={peakInsetY} x2={cx} y2={baseYInner}
                  stroke={frameColor} strokeWidth="2.4" strokeLinecap="round" />
            <line x1={leftXInner} y1={eaveYInner} x2={rightXInner} y2={eaveYInner}
                  stroke={frameColor} strokeWidth="2.4" strokeLinecap="round" />

            {/* Final crisp silhouette outline */}
            <path d={outerD} fill="none" stroke={dark} strokeWidth="0.6" opacity="0.85" />
          </g>
        );
      }
      case "large-panel-doors": {
        // Single oversized panel door — full-height glass with one slim handle.
        return (
          <g>
            <rect x={gx} y={gy} width={gw} height={gh} fill={dark} rx="1" />
            <rect x={gx + 1.5} y={gy + 1.5} width={gw - 3} height={gh - 3} fill={frameFill} rx="1" />
            {glass(gx + 5, gy + 5, gw - 10, gh - 10)}
            <rect x={gx + 5} y={gy + 5} width={gw - 10} height={gh - 10} fill="none" stroke={dark} strokeWidth="0.5" opacity="0.3" />
            <rect x={gx + gw - 9} y={gy + gh / 2 - 18} width={3} height={36} rx="1.5" fill={handleClr} opacity="0.85" />
            <rect x={gx} y={gy + gh - 2} width={gw} height={2} fill={dark} opacity="0.15" />
          </g>
        );
      }
      case "90-series": {
        // 3-panel slider in the 90mm series — wider rails, three glass panels.
        const pw = gw / 3;
        return (
          <g>
            {sash(gx, gy, pw + 2, gh)}
            {sash(gx + pw - 1, gy, pw + 2, gh)}
            {sash(gx + 2 * pw - 2, gy, pw + 2, gh)}
            {handle(gx + 2 * pw - 8, gy + gh / 2)}
            <rect x={gx} y={gy + gh - 3} width={gw} height={3} fill={dark} opacity="0.15" />
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
        {/* Skip the rectangular outer frame for shaped windows — each shaped
            case draws its own frame contour. */}
        {type !== "arch-shapes" && type !== "custom-shapes" && outerFrame()}
        {renderContent()}
      </svg>
      <p className="text-sm text-muted-foreground mt-4">{width} mm &times; {height} mm</p>
    </div>
  );
});

WindowPreview.displayName = "WindowPreview";

export default WindowPreview;

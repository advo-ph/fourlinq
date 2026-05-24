import { memo, useId } from "react";
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

const WindowPreview = memo(({ type, frameColor, finishId, glassTint, glassOpacity, width, height }: PreviewProps) => {
  // Scale the preview so size in mm actually changes the rendered size, not
  // just the aspect ratio. Maps the 400–3000 mm slider range onto a 140–340 px
  // SVG dimension (≈0.12 px per mm), independently per axis. A small windows
  // floor at 140 px keeps detail readable; the 340 px cap matches the
  // surrounding column max-width so big sizes never overflow.
  const PX_PER_MM = 0.115;
  const MIN_PX = 140;
  const MAX_PX = 340;
  const toPx = (mm: number) => Math.min(MAX_PX, Math.max(MIN_PX, mm * PX_PER_MM));
  const svgW = toPx(width);
  const svgH = toPx(height);

  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (k: string) => `${k}-${uid}`;

  const dark = darken(frameColor, 35);
  const darker = darken(frameColor, 55);
  const num = parseInt(frameColor.replace("#", ""), 16);
  const brightness = ((num >> 16) + ((num >> 8) & 0xff) + (num & 0xff)) / 3;
  const handleClr = brightness > 160 ? "#7A7A7A" : lighten(frameColor, 60);
  const handleHi = brightness > 160 ? "#BDBDBD" : lighten(frameColor, 90);

  const finishMeta = FRAME_FINISHES.find((f) => f.id === finishId);
  const texturePath = finishMeta?.textureImagePath;
  const isWoodGrain = Boolean(texturePath);

  const pad = 14;
  const fw = 12;
  const fx = pad, fy = pad, fWidth = svgW - pad * 2, fHeight = svgH - pad * 2;
  const gx = fx + fw, gy = fy + fw, gw = fWidth - fw * 2, gh = fHeight - fw * 2;

  const frameFill = isWoodGrain ? `url(#${id("grain")})` : frameColor;

  const defs = (
    <defs>
      {/* Drop shadow under the whole window assembly */}
      <filter id={id("shadow")} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
        <feOffset dx="0" dy="3" result="off" />
        <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>

      {/* Wood grain pattern */}
      {isWoodGrain && texturePath && (
        <pattern id={id("grain")} patternUnits="userSpaceOnUse" width="70" height="70">
          <image href={texturePath} x={0} y={0} width={70} height={70} preserveAspectRatio="xMidYMid slice" />
        </pattern>
      )}

      {/* Glass gradient — sky/ground reflection */}
      <linearGradient id={id("glassBase")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A8C0D8" />
        <stop offset="55%" stopColor="#C7D6E2" />
        <stop offset="100%" stopColor="#D8DDE0" />
      </linearGradient>

      {/* Diagonal light streak overlay on glass */}
      <linearGradient id={id("glassHi")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.32" />
        <stop offset="35%" stopColor="white" stopOpacity="0.04" />
        <stop offset="55%" stopColor="white" stopOpacity="0.18" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>

      {/* Frame bevel — adds top-light / bottom-shadow inside the frame edge */}
      <linearGradient id={id("frameBevel")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.35" />
        <stop offset="45%" stopColor="white" stopOpacity="0.05" />
        <stop offset="100%" stopColor="black" stopOpacity="0.18" />
      </linearGradient>

      {/* Handle metallic gradient */}
      <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={handleClr} />
        <stop offset="48%" stopColor={handleHi} />
        <stop offset="100%" stopColor={handleClr} />
      </linearGradient>
    </defs>
  );

  // ─── Primitives ───
  const glass = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id("glassBase")})`} />
      <rect x={x} y={y} width={w} height={h} fill={glassTint} opacity={glassOpacity > 0.3 ? 0.6 : 1} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id("glassHi")})`} style={{ mixBlendMode: "screen" }} />
      {/* Inner shadow against the sash */}
      <rect x={x} y={y} width={w} height={2} fill="black" opacity="0.18" />
      <rect x={x} y={y} width={2} height={h} fill="black" opacity="0.12" />
    </g>
  );

  // Refined handle — pill body with a brushed metallic gradient + base puck.
  const handle = (x: number, y: number, vertical = true) =>
    vertical ? (
      <g>
        <rect x={x - 3.5} y={y - 3.5} width={7} height={7} rx={1.5} fill={handleClr} opacity={0.55} />
        <rect x={x - 2} y={y - 12} width={4} height={24} rx={2} fill={`url(#${id("metal")})`} />
        <rect x={x - 1.4} y={y - 11} width={0.7} height={22} fill="white" opacity={0.35} />
      </g>
    ) : (
      <g>
        <rect x={x - 3.5} y={y - 3.5} width={7} height={7} rx={1.5} fill={handleClr} opacity={0.55} />
        <rect x={x - 12} y={y - 2} width={24} height={4} rx={2} fill={`url(#${id("metal")})`} />
        <rect x={x - 11} y={y - 1.4} width={22} height={0.7} fill="white" opacity={0.35} />
      </g>
    );

  // Sash — the operable panel: dark edge + frame fill + recessed glass.
  const sash = (x: number, y: number, w: number, h: number) => {
    const s = 5;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx="1.5" fill={dark} />
        <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx="1" fill={frameFill} />
        <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx="1" fill={`url(#${id("frameBevel")})`} />
        {glass(x + s, y + s, w - s * 2, h - s * 2)}
        <rect x={x + s} y={y + s} width={w - s * 2} height={h - s * 2} rx="0.5" fill="none" stroke={darker} strokeWidth="0.6" opacity="0.55" />
      </g>
    );
  };

  // ─── Outer frame: beveled edge, soft inset shadow under the frame ───
  const outerFrame = () => (
    <g>
      <rect x={fx} y={fy} width={fWidth} height={fHeight} rx="2" fill={darker} />
      <rect x={fx + 1} y={fy + 1} width={fWidth - 2} height={fHeight - 2} rx="1.5" fill={frameFill} />
      <rect x={fx + 1} y={fy + 1} width={fWidth - 2} height={fHeight - 2} rx="1.5" fill={`url(#${id("frameBevel")})`} />
      {/* Glazing channel rim around the inner opening */}
      <rect x={gx - 1} y={gy - 1} width={gw + 2} height={gh + 2} rx="1" fill="none" stroke={darker} strokeWidth="1" />
      <rect x={gx} y={gy} width={gw} height={gh} fill={darker} opacity={0.06} />
    </g>
  );

  // ─── Renderers ───
  const renderContent = () => {
    switch (type) {
      case "casement": {
        const gap = 3;
        const pw = (gw - gap) / 2;
        const midX = gx + pw + gap / 2;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + pw + gap, gy, pw, gh)}
            <rect x={midX - 1.5} y={gy} width={gap + 1} height={gh} fill={frameFill} />
            <rect x={midX - 1.5} y={gy} width={gap + 1} height={gh} fill={`url(#${id("frameBevel")})`} />
            <line x1={midX} y1={gy} x2={midX} y2={gy + gh} stroke={darker} strokeWidth="0.5" opacity="0.5" />
            {handle(midX - 8, gy + gh / 2)}
            {handle(midX + 8, gy + gh / 2)}
          </g>
        );
      }
      case "sliding": {
        const pw = gw / 2 + 4;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + gw - pw, gy, pw, gh)}
            {handle(gx + gw - 15, gy + gh / 2)}
          </g>
        );
      }
      case "fixed":
        return (
          <g>
            {glass(gx, gy, gw, gh)}
            <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={darker} strokeWidth="0.7" opacity="0.55" />
          </g>
        );
      case "awning":
        return (
          <g>
            {sash(gx, gy, gw, gh)}
            <circle cx={gx + 14} cy={gy + 7} r="2.2" fill={handleClr} opacity="0.7" />
            <circle cx={gx + gw - 14} cy={gy + 7} r="2.2" fill={handleClr} opacity="0.7" />
            {handle(gx + gw / 2, gy + gh - 11, false)}
          </g>
        );
      case "tilt-turn":
        return (
          <g>
            {sash(gx, gy, gw, gh)}
            {/* Tilt indicator: faint dashed triangle hinting at top-tilt opening */}
            <line x1={gx + 8} y1={gy + gh - 8} x2={gx + gw / 2} y2={gy + 10} stroke={handleClr} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.18" />
            <line x1={gx + gw - 8} y1={gy + gh - 8} x2={gx + gw / 2} y2={gy + 10} stroke={handleClr} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.18" />
            {handle(gx + gw - 12, gy + gh / 2)}
          </g>
        );
      case "special-shapes": {
        // Arch-top window — the frame itself is arch-topped (semicircle on top
        // of a rectangular base) instead of a rectangle with arch glass inside.
        // Previously the rectangular frame's top corners showed empty white
        // triangles where the arch glass didn't reach.
        const archH = Math.min(fWidth / 2, fHeight * 0.45);
        const cxFrame = fx + fWidth / 2;
        const baseTop = fy + archH;
        const outerR = fWidth / 2;
        const ifx = fx + fw, ify = fy + fw, iw = fWidth - fw * 2;
        const innerR = Math.max(8, outerR - fw);
        const innerBaseTop = ify + Math.max(0, archH - fw);
        const innerBottom = ify + fHeight - fw * 2;
        const outerPath = `M ${fx} ${fy + fHeight} L ${fx} ${baseTop} A ${outerR} ${outerR} 0 0 1 ${fx + fWidth} ${baseTop} L ${fx + fWidth} ${fy + fHeight} Z`;
        const innerPath = `M ${ifx} ${innerBottom} L ${ifx} ${innerBaseTop} A ${innerR} ${innerR} 0 0 1 ${ifx + iw} ${innerBaseTop} L ${ifx + iw} ${innerBottom} Z`;
        return (
          <g>
            {/* Outer arch-top frame */}
            <path d={outerPath} fill={darker} />
            <path d={outerPath} fill={frameFill} transform="" />
            <path d={outerPath} fill={`url(#${id("frameBevel")})`} />
            {/* Cut out the inner (glass) area by stamping the frame color over the outer, then drawing glass inside */}
            <path d={innerPath} fill={`url(#${id("glassBase")})`} />
            <path d={innerPath} fill={glassTint} opacity={glassOpacity > 0.3 ? 0.6 : 1} />
            <path d={innerPath} fill={`url(#${id("glassHi")})`} style={{ mixBlendMode: "screen" }} />
            {/* Glazing channel rim */}
            <path d={innerPath} fill="none" stroke={darker} strokeWidth="0.8" opacity="0.55" />
            {/* Radial muntins in the arch portion */}
            {[-0.66, -0.33, 0, 0.33, 0.66].map((t) => (
              <line key={t}
                x1={cxFrame} y1={innerBaseTop}
                x2={cxFrame + Math.sin(t * Math.PI / 2) * innerR}
                y2={innerBaseTop - Math.cos(t * Math.PI / 2) * innerR}
                stroke={darker} strokeWidth="0.7" opacity="0.55" />
            ))}
            {/* Springline divider between arch and rectangular sash */}
            <line x1={ifx} y1={innerBaseTop} x2={ifx + iw} y2={innerBaseTop} stroke={darker} strokeWidth="0.7" opacity="0.55" />
            {/* Vertical mullion in the rectangular section */}
            <line x1={cxFrame} y1={innerBaseTop} x2={cxFrame} y2={innerBottom} stroke={darker} strokeWidth="0.7" opacity="0.45" />
          </g>
        );
      }
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
                  {i < panels - 1 && (
                    <>
                      <circle cx={px + pw + gap / 2} cy={gy + 10} r="2.2" fill={handleClr} opacity="0.8" />
                      <circle cx={px + pw + gap / 2} cy={gy + gh - 10} r="2.2" fill={handleClr} opacity="0.8" />
                    </>
                  )}
                </g>
              );
            })}
            {/* Single handle on the leading (rightmost) panel's inner edge —
                bifolds operate from one end; a middle-of-the-wall handle
                doesn't reflect how the door actually opens. */}
            {handle(gx + gw - 10, gy + gh / 2)}
            {/* Track */}
            <rect x={gx - 1} y={gy + gh + 1} width={gw + 2} height={3} fill={darker} opacity="0.5" />
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
            <rect x={gx - 1} y={gy + gh + 1} width={gw + 2} height={3} fill={darker} opacity="0.5" />
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
            {/* Lift-mechanism lever below the handle */}
            <rect x={gx + gw - 19} y={gy + gh / 2 + 16} width={6} height={14} rx={2} fill={`url(#${id("metal")})`} />
            <rect x={gx - 1} y={gy + gh + 1} width={gw + 2} height={4} fill={darker} opacity="0.5" />
            <rect x={gx - 1} y={gy + gh + 4} width={gw + 2} height={1} fill={darker} opacity="0.7" />
          </g>
        );
      }
      case "large-panel-doors": {
        // One enormous glass panel, full-bleed inside the outer frame
        return (
          <g>
            <rect x={gx} y={gy} width={gw} height={gh} fill={`url(#${id("glassBase")})`} />
            <rect x={gx} y={gy} width={gw} height={gh} fill={glassTint} opacity={glassOpacity > 0.3 ? 0.6 : 1} />
            <rect x={gx} y={gy} width={gw} height={gh} fill={`url(#${id("glassHi")})`} style={{ mixBlendMode: "screen" }} />
            <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={darker} strokeWidth="0.7" opacity="0.5" />
            {/* Inset hairline indicating glazing channel */}
            <rect x={gx + 3} y={gy + 3} width={gw - 6} height={gh - 6} fill="none" stroke={darker} strokeWidth="0.4" opacity="0.3" />
            {handle(gx + gw - 14, gy + gh / 2)}
            <rect x={gx - 1} y={gy + gh + 1} width={gw + 2} height={3} fill={darker} opacity="0.55" />
          </g>
        );
      }
      case "90-series": {
        // Premium 90mm-depth sliding door. Two overlapping sashes — the
        // overlap at the meeting rail naturally implies the interlock without
        // needing a separate floating bar (the bar previously appeared to hover
        // above the panels because it was inset 2px while the sash frames ran
        // full-height).
        const pw = gw / 2 + 8;
        return (
          <g>
            {sash(gx, gy, pw, gh)}
            {sash(gx + gw - pw, gy, pw, gh)}
            {handle(gx + gw - 17, gy + gh / 2)}
            {/* Heavier double-line track signals the deeper profile */}
            <rect x={gx - 1} y={gy + gh + 1} width={gw + 2} height={5} fill={darker} opacity="0.55" />
            <rect x={gx - 1} y={gy + gh + 6} width={gw + 2} height={1} fill={darker} opacity="0.75" />
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
            <rect x={midX - 1.5} y={gy} width={gap} height={gh} fill={`url(#${id("frameBevel")})`} />
            {handle(midX - 8, gy + gh / 2)}
            {handle(midX + 8, gy + gh / 2)}
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
            <rect x={gx} y={gy} width={gw} height={transomH} fill="none" stroke={darker} strokeWidth="0.6" opacity="0.5" />
            <rect x={gx} y={gy + transomH} width={gw} height={divider} fill={frameFill} />
            <rect x={gx} y={doorTop} width={gw} height={doorH} fill={darker} rx="1" />
            <rect x={gx + 1} y={doorTop + 1} width={gw - 2} height={doorH - 2} fill={frameFill} rx="1" />
            <rect x={gx + 1} y={doorTop + 1} width={gw - 2} height={doorH - 2} fill={`url(#${id("frameBevel")})`} rx="1" />
            {glass(gx + 8, doorTop + 6, gw - 16, doorGlassH)}
            <rect x={gx + 8} y={doorTop + 6} width={gw - 16} height={doorGlassH} fill="none" stroke={darker} strokeWidth="0.5" opacity="0.4" />
            <rect x={gx + 8} y={panelTop} width={gw - 16} height={panelH} rx="2" fill="none" stroke={darker} strokeWidth="0.7" opacity="0.18" />
            <rect x={gx + 16} y={panelTop + 8} width={gw - 32} height={panelH * 0.4} rx="2" fill="none" stroke={darker} strokeWidth="0.5" opacity="0.15" />
            <rect x={gx + 16} y={panelTop + panelH * 0.52} width={gw - 32} height={panelH * 0.38} rx="2" fill="none" stroke={darker} strokeWidth="0.5" opacity="0.15" />
            {handle(gx + gw - 18, doorTop + doorH / 2)}
          </g>
        );
      }
      case "arch-shapes": {
        // Pure full arch — half-circle on top of a narrow base, no rectangular sash
        const r = gw / 2;
        const cx = gx + gw / 2;
        const baseH = Math.max(8, gh - r);
        const archBottom = gy + r;
        return (
          <g>
            <path d={`M ${gx} ${archBottom} L ${gx} ${archBottom} A ${r} ${r} 0 0 1 ${gx + gw} ${archBottom} L ${gx + gw} ${gy + gh} L ${gx} ${gy + gh} Z`} fill={`url(#${id("glassBase")})`} />
            <path d={`M ${gx} ${archBottom} L ${gx} ${archBottom} A ${r} ${r} 0 0 1 ${gx + gw} ${archBottom} L ${gx + gw} ${gy + gh} L ${gx} ${gy + gh} Z`} fill={glassTint} opacity={glassOpacity > 0.3 ? 0.6 : 1} />
            <path d={`M ${gx} ${archBottom} L ${gx} ${archBottom} A ${r} ${r} 0 0 1 ${gx + gw} ${archBottom} L ${gx + gw} ${gy + gh} L ${gx} ${gy + gh} Z`} fill={`url(#${id("glassHi")})`} style={{ mixBlendMode: "screen" }} />
            {/* Radial muntins */}
            {[-0.7, -0.35, 0, 0.35, 0.7].map((t) => (
              <line key={t} x1={cx} y1={archBottom} x2={cx + Math.sin(t * Math.PI / 2) * r} y2={archBottom - Math.cos(t * Math.PI / 2) * r} stroke={darker} strokeWidth="0.7" opacity="0.55" />
            ))}
            {/* Springline + base divider */}
            {baseH > 12 && <line x1={gx} y1={archBottom} x2={gx + gw} y2={archBottom} stroke={darker} strokeWidth="0.7" opacity="0.55" />}
            {/* Arch outline */}
            <path d={`M ${gx} ${archBottom} A ${r} ${r} 0 0 1 ${gx + gw} ${archBottom}`} stroke={darker} strokeWidth="1" fill="none" opacity="0.85" />
            <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={darker} strokeWidth="0.6" opacity="0.4" />
          </g>
        );
      }
      case "curtain-wall": {
        // 3 cols × n rows of glass panels separated by slim mullions
        const cols = 3;
        const rows = Math.max(2, Math.min(4, Math.round(gh / (gw / cols))));
        const mw = 1.6;
        const cellW = (gw - mw * (cols - 1)) / cols;
        const cellH = (gh - mw * (rows - 1)) / rows;
        return (
          <g>
            {Array.from({ length: cols }).map((_, c) =>
              Array.from({ length: rows }).map((_, r) => {
                const x = gx + c * (cellW + mw);
                const y = gy + r * (cellH + mw);
                return (
                  <g key={`${c}-${r}`}>
                    {glass(x, y, cellW, cellH)}
                    <rect x={x} y={y} width={cellW} height={cellH} fill="none" stroke={darker} strokeWidth="0.5" opacity="0.5" />
                  </g>
                );
              })
            )}
          </g>
        );
      }
      case "custom-shapes": {
        // Raked trapezoid — the canonical "custom" geometry: top edge slopes
        // to track a gable-roof line, square bottom and verticals. Real-world
        // FourlinQ specialist projects: gable-end windows in heritage homes,
        // raked walls in modernist facades.
        const slope = gh * 0.32;
        const pts = `${gx},${gy + slope} ${gx + gw},${gy} ${gx + gw},${gy + gh} ${gx},${gy + gh}`;
        const cx = gx + gw / 2;
        return (
          <g>
            <polygon points={pts} fill={`url(#${id("glassBase")})`} />
            <polygon points={pts} fill={glassTint} opacity={glassOpacity > 0.3 ? 0.6 : 1} />
            <polygon points={pts} fill={`url(#${id("glassHi")})`} style={{ mixBlendMode: "screen" }} />
            <polygon points={pts} fill="none" stroke={darker} strokeWidth="1" opacity="0.9" />
            {/* Vertical mullion */}
            <line x1={cx} y1={gy + slope / 2} x2={cx} y2={gy + gh} stroke={darker} strokeWidth="0.7" opacity="0.55" />
          </g>
        );
      }
      default:
        return sash(gx, gy, gw, gh);
    }
  };

  // Non-rectangular types draw their own outer geometry — skip the rectangular frame.
  const skipOuterFrame = type === "arch-shapes" || type === "custom-shapes" || type === "special-shapes";

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgW} ${svgH + 8}`}
        width={svgW}
        height={svgH + 8}
        style={{ maxWidth: "100%" }}
      >
        {defs}
        <g filter={`url(#${id("shadow")})`}>
          {!skipOuterFrame && outerFrame()}
          {renderContent()}
        </g>
      </svg>
      <p className="text-sm text-muted-foreground mt-4">{width} mm &times; {height} mm</p>
    </div>
  );
});

WindowPreview.displayName = "WindowPreview";

export default WindowPreview;

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useProductTypes, useFinishes, useGlassTypes } from "@/hooks/useConfigurator";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  CasementIcon, SlidingIcon, FixedIcon, BifoldIcon, AwningIcon,
  LiftAndSlideIcon, FrenchDoorIcon, TiltAndTurnIcon, SlidingDoorIcon, EntranceIcon,
} from "@/components/icons/WindowIcons";

const iconMap: Record<string, React.FC<{ className?: string; size?: number; strokeWidth?: number }>> = {
  casement: CasementIcon,
  awning: AwningIcon,
  sliding: SlidingIcon,
  fixed: FixedIcon,
  "tilt-turn": TiltAndTurnIcon,
  bifold: BifoldIcon,
  "lift-slide": LiftAndSlideIcon,
  "french-door": FrenchDoorIcon,
  "sliding-door": SlidingDoorIcon,
  entrance: EntranceIcon,
};

// Glass visual representations for the preview
const glassVisuals: Record<string, { opacity: number; tint: string }> = {
  "clear-float": { opacity: 0.1, tint: "rgba(200,220,240,0.1)" },
  "low-e-coated": { opacity: 0.15, tint: "rgba(180,210,240,0.15)" },
  "frosted-privacy": { opacity: 0.5, tint: "rgba(255,255,255,0.6)" },
  "tinted-bronze": { opacity: 0.35, tint: "rgba(80,70,50,0.35)" },
  "tinted-grey": { opacity: 0.3, tint: "rgba(100,100,100,0.3)" },
  "laminated-safety": { opacity: 0.12, tint: "rgba(200,220,240,0.12)" },
  "decorative-lead": { opacity: 0.2, tint: "rgba(180,180,160,0.2)" },
  reflective: { opacity: 0.25, tint: "rgba(160,180,200,0.25)" },
  "obscure-pattern": { opacity: 0.45, tint: "rgba(220,220,220,0.45)" },
  "clear-sidelight": { opacity: 0.08, tint: "rgba(200,220,240,0.08)" },
};

const sizeConstraints = {
  width: { min: 400, max: 3000, step: 50 },
  height: { min: 400, max: 3000, step: 50 },
};

const stepLabels = ["Type", "Finish", "Glass", "Size"];

const DesignTool = () => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    type: "casement",
    finish: "white",
    glass: "clear-float",
    width: 1200,
    height: 1400,
  });

  const { data: productTypes = [], isLoading: typesLoading } = useProductTypes();
  const { data: finishOptions = [], isLoading: finishesLoading } = useFinishes();
  const { data: glassOptions = [], isLoading: glassLoading } = useGlassTypes();

  const isLoading = typesLoading || finishesLoading || glassLoading;

  const selectedFinish = finishOptions.find((f) => f.id === config.finish) || { name: "White", color: "#F5F5F0", id: "white" };
  const selectedGlass = glassOptions.find((g) => g.id === config.glass) || { name: "Clear", id: "clear-float" };
  const selectedType = productTypes.find((t) => t.id === config.type) || { name: "Casement", id: "casement", iconKey: "casement" };

  const glassVisual = glassVisuals[config.glass] || { opacity: 0.1, tint: "rgba(200,220,240,0.1)" };

  const canContinue = step < 3;
  const canBack = step > 0;

  const renderPreview = () => {
    const w = 180;
    const h = (config.height / config.width) * w;
    const clampedH = Math.min(Math.max(h, 120), 260);
    const frameColor = selectedFinish.color;
    const glassTint = glassVisual.tint;

    const renderFrame = () => {
      const f = 6; // frame inset
      const fw = w - f * 2; // frame inner width
      const fh = clampedH - f * 2; // frame inner height

      switch (config.type) {
        case "sliding": {
          const mid = w / 2;
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="4" />
              <rect x={f + 4} y={f + 4} width={mid - f - 6} height={fh - 8} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              <rect x={mid + 2} y={f + 4} width={mid - f - 6} height={fh - 8} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              <rect x={mid - 2} y={clampedH / 2 - 10} width="4" height="20" rx="1" fill={frameColor} opacity={0.4} />
            </>
          );
        }
        case "sliding-door": {
          const mid = w / 2;
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="5" />
              <rect x={f + 5} y={f + 5} width={mid - f - 8} height={fh - 10} fill={glassTint} stroke={frameColor} strokeWidth="1.5" />
              <rect x={mid + 3} y={f + 5} width={mid - f - 8} height={fh - 10} fill={glassTint} stroke={frameColor} strokeWidth="1.5" />
              <rect x={mid - 2} y={clampedH / 2 - 12} width="4" height="24" rx="1.5" fill={frameColor} opacity={0.5} />
              <line x={f} y1={clampedH - f - 3} x2={w - f} y2={clampedH - f - 3} stroke={frameColor} strokeWidth="2" opacity={0.3} />
            </>
          );
        }
        case "fixed":
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="4" />
              <rect x={f + 4} y={f + 4} width={fw - 8} height={fh - 8} fill={glassTint} />
            </>
          );
        case "bifold": {
          const panels = 4;
          const panelW = fw / panels;
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="5" />
              {Array.from({ length: panels }).map((_, i) => (
                <g key={i}>
                  <rect x={f + i * panelW + 2} y={f + 5} width={panelW - 4} height={fh - 10} fill={glassTint} stroke={frameColor} strokeWidth="1.5" />
                  {i < panels - 1 && <circle cx={f + (i + 1) * panelW} cy={f + 8} r="2" fill={frameColor} opacity={0.3} />}
                </g>
              ))}
              <rect x={f + panelW * 2 - 2} y={clampedH / 2 - 8} width="4" height="16" rx="1" fill={frameColor} opacity={0.4} />
            </>
          );
        }
        case "lift-slide": {
          const mid = w / 2;
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="5" />
              <rect x={f + 5} y={f + 5} width={mid - f - 8} height={fh - 10} fill={glassTint} stroke={frameColor} strokeWidth="1.5" />
              <rect x={mid + 3} y={f + 5} width={mid - f - 8} height={fh - 10} fill={glassTint} stroke={frameColor} strokeWidth="1.5" />
              <rect x={mid + 8} y={clampedH / 2 - 12} width="5" height="24" rx="2" fill={frameColor} opacity={0.5} />
              <line x1={f} y1={clampedH - f - 4} x2={w - f} y2={clampedH - f - 4} stroke={frameColor} strokeWidth="3" opacity={0.25} />
            </>
          );
        }
        case "french-door": {
          const mid = w / 2;
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="5" />
              <line x1={mid} y1={f} x2={mid} y2={clampedH - f} stroke={frameColor} strokeWidth="3" />
              {/* Left door - glass panels */}
              <rect x={f + 5} y={f + 5} width={mid - f - 8} height={fh * 0.45} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              <rect x={f + 5} y={f + 5 + fh * 0.48} width={mid - f - 8} height={fh * 0.45} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              {/* Right door - glass panels */}
              <rect x={mid + 3} y={f + 5} width={mid - f - 8} height={fh * 0.45} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              <rect x={mid + 3} y={f + 5 + fh * 0.48} width={mid - f - 8} height={fh * 0.45} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              {/* Handles */}
              <rect x={mid - 8} y={clampedH / 2 - 10} width="3" height="20" rx="1" fill={frameColor} opacity={0.5} />
              <rect x={mid + 5} y={clampedH / 2 - 10} width="3" height="20" rx="1" fill={frameColor} opacity={0.5} />
            </>
          );
        }
        case "entrance": {
          const doorX = f + 5;
          const doorW = fw - 10;
          const doorH = fh - 10;
          const glassTop = f + 5;
          const glassH = doorH * 0.28;
          const panelTop = glassTop + glassH + 6;
          const panelH = doorH - glassH - 6;
          return (
            <>
              {/* Thick entrance frame */}
              <rect x={f} y={f} width={fw} height={fh} rx="3" fill="none" stroke={frameColor} strokeWidth="6" />
              {/* Transom glass */}
              <rect x={doorX} y={glassTop} width={doorW} height={glassH} rx="1" fill={glassTint} stroke={frameColor} strokeWidth="1" />
              {/* Door panel with raised inner panel detail */}
              <rect x={doorX} y={panelTop} width={doorW} height={panelH} rx="1" fill={frameColor} opacity={0.08} stroke={frameColor} strokeWidth="1" />
              <rect x={doorX + 12} y={panelTop + 10} width={doorW - 24} height={panelH * 0.4} rx="2" fill="none" stroke={frameColor} strokeWidth="1.5" opacity={0.2} />
              <rect x={doorX + 12} y={panelTop + panelH * 0.5} width={doorW - 24} height={panelH * 0.4} rx="2" fill="none" stroke={frameColor} strokeWidth="1.5" opacity={0.2} />
              {/* Handle */}
              <rect x={doorX + doorW - 16} y={panelTop + panelH / 2 - 14} width="4" height="28" rx="2" fill={frameColor} opacity={0.5} />
              {/* Lock */}
              <circle cx={doorX + doorW - 14} cy={panelTop + panelH / 2 + 20} r="2.5" fill={frameColor} opacity={0.3} />
            </>
          );
        }
        case "awning":
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="4" />
              <rect x={f + 4} y={f + 4} width={fw - 8} height={fh - 8} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              {/* Hinge line at top */}
              <line x1={f + 4} y1={f + 4} x2={w - f - 4} y2={f + 4} stroke={frameColor} strokeWidth="2" opacity={0.5} />
              {/* Open angle lines */}
              <line x1={f + 4} y1={f + 4} x2={w / 2} y2={clampedH * 0.35} stroke={frameColor} strokeWidth="1" opacity={0.25} />
              <line x1={w - f - 4} y1={f + 4} x2={w / 2} y2={clampedH * 0.35} stroke={frameColor} strokeWidth="1" opacity={0.25} />
              {/* Bottom latch */}
              <rect x={w / 2 - 6} y={clampedH - f - 10} width="12" height="3" rx="1" fill={frameColor} opacity={0.4} />
            </>
          );
        case "tilt-turn":
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="4" />
              <rect x={f + 4} y={f + 4} width={fw - 8} height={fh - 8} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              {/* Tilt indicator — dashed triangle from bottom */}
              <line x1={w / 2} y1={f + 8} x2={f + 8} y2={clampedH - f - 8} stroke={frameColor} strokeWidth="1" strokeDasharray="4 3" opacity={0.2} />
              <line x1={w / 2} y1={f + 8} x2={w - f - 8} y2={clampedH - f - 8} stroke={frameColor} strokeWidth="1" strokeDasharray="4 3" opacity={0.2} />
              {/* Turn indicator — dashed vertical */}
              <line x1={w / 2} y1={f + 8} x2={w / 2} y2={clampedH - f - 8} stroke={frameColor} strokeWidth="1" strokeDasharray="4 3" opacity={0.15} />
              {/* Handle */}
              <rect x={w - f - 12} y={clampedH / 2 - 10} width="4" height="20" rx="1.5" fill={frameColor} opacity={0.5} />
            </>
          );
        default: // casement
          return (
            <>
              <rect x={f} y={f} width={fw} height={fh} rx="2" fill="none" stroke={frameColor} strokeWidth="4" />
              <line x1={w / 2} y1={f} x2={w / 2} y2={clampedH - f} stroke={frameColor} strokeWidth="2" />
              <rect x={f + 4} y={f + 4} width={w / 2 - f - 6} height={fh - 8} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              <rect x={w / 2 + 2} y={f + 4} width={w / 2 - f - 6} height={fh - 8} fill={glassTint} stroke={frameColor} strokeWidth="1" />
              {/* Handles */}
              <rect x={w / 2 - 7} y={clampedH / 2 - 8} width="3" height="16" rx="1" fill={frameColor} opacity={0.4} />
              <rect x={w / 2 + 4} y={clampedH / 2 - 8} width="3" height="16" rx="1" fill={frameColor} opacity={0.4} />
            </>
          );
      }
    };

    return (
      <div className="flex flex-col items-center">
        <svg viewBox={`0 0 ${w} ${clampedH}`} className="w-full max-w-[280px]">{renderFrame()}</svg>
        <p className="text-sm text-muted-foreground mt-4">{config.width} mm × {config.height} mm</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <PageHeader title="Design Tool" breadcrumbLabel="Design Tool" subtitle="Loading configurator..." />
        <div className="pb-20">
          <div className="page-container max-w-6xl">
            <div className="flex items-center justify-center py-20">
              <div className="text-muted-foreground text-sm">Loading design tool…</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Design Tool"
        breadcrumbLabel="Design Tool"
        subtitle="Configure your perfect window or door system with our interactive tool."
      />

      <div className="pb-20">
        <div className="page-container max-w-6xl">
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(i)}
                  className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${
                    i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >{i + 1}</button>
                <span className={`text-sm hidden sm:inline ${i === step ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
                {i < 3 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="min-h-[320px]">
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-4">Select Product Type</h2>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Windows</h3>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {productTypes.filter((t) => t.category === "windows").map((type) => {
                      const Icon = iconMap[type.iconKey];
                      return (
                        <button key={type.id} onClick={() => setConfig({ ...config, type: type.id })} className={`p-4 rounded-lg border-2 text-center transition-colors ${config.type === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                          <div className="flex justify-center mb-2">
                            {Icon && <Icon size={36} className={config.type === type.id ? "text-primary" : "text-muted-foreground"} strokeWidth={1} />}
                          </div>
                          <span className="text-xs font-medium text-primary">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Doors</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {productTypes.filter((t) => t.category === "doors").map((type) => {
                      const Icon = iconMap[type.iconKey];
                      return (
                        <button key={type.id} onClick={() => setConfig({ ...config, type: type.id })} className={`p-4 rounded-lg border-2 text-center transition-colors ${config.type === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                          <div className="flex justify-center mb-2">
                            {Icon && <Icon size={36} className={config.type === type.id ? "text-primary" : "text-muted-foreground"} strokeWidth={1} />}
                          </div>
                          <span className="text-xs font-medium text-primary">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-4">Choose Finish</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {finishOptions.map((finish) => (
                      <button key={finish.id} onClick={() => setConfig({ ...config, finish: finish.id })} className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 rounded-full border-[3px] transition-colors ${config.finish === finish.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`} style={{ backgroundColor: finish.color }} />
                        <span className="text-xs text-muted-foreground">{finish.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-4">Select Glass Type</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {glassOptions.map((glass) => {
                      const visual = glassVisuals[glass.id] || { tint: "rgba(200,220,240,0.1)" };
                      return (
                        <button key={glass.id} onClick={() => setConfig({ ...config, glass: glass.id })} className={`p-3 rounded-lg border-2 text-center transition-colors ${config.glass === glass.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                          <div className="w-10 h-14 mx-auto rounded mb-2 border border-border" style={{ backgroundColor: visual.tint }} />
                          <span className="text-xs font-medium text-primary">{glass.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-6">Set Dimensions</h2>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">Width</span><span className="text-sm font-medium text-primary">{config.width} mm</span></div>
                      <Slider value={[config.width]} onValueChange={([v]) => setConfig({ ...config, width: v })} min={sizeConstraints.width.min} max={sizeConstraints.width.max} step={sizeConstraints.width.step} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">Height</span><span className="text-sm font-medium text-primary">{config.height} mm</span></div>
                      <Slider value={[config.height]} onValueChange={([v]) => setConfig({ ...config, height: v })} min={sizeConstraints.height.min} max={sizeConstraints.height.max} step={sizeConstraints.height.step} />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-4 mt-8">
                {canBack && <Button variant="outline" onClick={() => setStep(step - 1)} className="font-medium">Back</Button>}
                {canContinue && <Button onClick={() => setStep(step + 1)} className="font-medium">Continue</Button>}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/50 mb-6">Live Preview</h3>
              {renderPreview()}
              <div className="mt-8 w-full border-t border-border pt-6 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="text-primary font-medium">{selectedType.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Finish</span><span className="text-primary font-medium">{selectedFinish.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Glass</span><span className="text-primary font-medium">{selectedGlass.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dimensions</span><span className="text-primary font-medium">{config.width} × {config.height} mm</span></div>
              </div>
              <div className="flex gap-3 mt-6 w-full">
                <Button variant="outline" className="flex-1 font-medium" onClick={async () => {
                  try {
                    const res = await fetch("/api/save-configuration", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ config }),
                    });
                    const data = await res.json();
                    const saved = JSON.parse(localStorage.getItem("fourlinq_configs") || "[]");
                    saved.push({ ...config, refId: data.refId, date: new Date().toISOString() });
                    localStorage.setItem("fourlinq_configs", JSON.stringify(saved));
                    toast.success(`Configuration saved! Reference: ${data.refId}`);
                  } catch {
                    const refId = "CFG-" + Date.now().toString(36).toUpperCase();
                    const saved = JSON.parse(localStorage.getItem("fourlinq_configs") || "[]");
                    saved.push({ ...config, refId, date: new Date().toISOString() });
                    localStorage.setItem("fourlinq_configs", JSON.stringify(saved));
                    toast.success(`Configuration saved locally! Reference: ${refId}`);
                  }
                }}>Save Configuration</Button>
                <Button asChild className="flex-1 font-medium"><Link to="/brand#contact">Book Consultation</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DesignTool;

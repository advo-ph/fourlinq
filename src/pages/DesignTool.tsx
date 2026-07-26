import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useProductTypes, useMaterials, useFinishes, useGlassTypes, finishesForMaterial } from "@/hooks/useConfigurator";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, X } from "lucide-react";
import WindowPreview from "@/components/configurator/WindowPreview";
import FinishSwatch from "@/components/shared/FinishSwatch";
import { trackConfigChange } from "@/hooks/useAnalytics";
import {
  CasementIcon, SlidingIcon, FixedIcon, BifoldIcon, AwningIcon,
  LiftAndSlideIcon, FrenchDoorIcon, TiltAndTurnIcon, SlidingDoorIcon, EntranceIcon,
  SpecialShapesIcon, LargePanelIcon, NinetySeriesIcon,
  ArchIcon, CurtainWallIcon, CustomShapesIcon,
} from "@/components/icons/WindowIcons";

const iconMap: Record<string, React.FC<{ className?: string; size?: number; strokeWidth?: number }>> = {
  casement: CasementIcon,
  awning: AwningIcon,
  sliding: SlidingIcon,
  fixed: FixedIcon,
  "special-shapes": SpecialShapesIcon,
  "tilt-turn": TiltAndTurnIcon,
  bifold: BifoldIcon,
  "lift-slide": LiftAndSlideIcon,
  "french-door": FrenchDoorIcon,
  "sliding-door": SlidingDoorIcon,
  entrance: EntranceIcon,
  "large-panel": LargePanelIcon,
  "90-series": NinetySeriesIcon,
  arch: ArchIcon,
  "curtain-wall": CurtainWallIcon,
  "custom-shapes": CustomShapesIcon,
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

// Type → Material → Finish → Glass → Size. The Material step was added to match
// the meeting's "like Apple selection" flow (00:11:11 to 00:11:28) and the site's
// type-vs-material axes: material decides which finishes are offered next.
const stepLabels = ["Type", "Material", "Finish", "Glass", "Size"];
const LAST_STEP = stepLabels.length - 1;

const SaveModal = ({ isOpen, onClose, config, selectedType, selectedMaterial, selectedFinish, selectedGlass }: {
  isOpen: boolean;
  onClose: () => void;
  config: { type: string; material: string; finish: string; glass: string; width: number; height: number };
  selectedType: { name: string };
  selectedMaterial: { name: string };
  selectedFinish: { name: string };
  selectedGlass: { name: string };
}) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ refId?: string; success: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/save-configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, config }),
      });
      const data = await res.json();
      const saved = JSON.parse(localStorage.getItem("fourlinq_configs") || "[]");
      saved.push({ ...config, ...form, refId: data.refId, date: new Date().toISOString() });
      localStorage.setItem("fourlinq_configs", JSON.stringify(saved));
      setResult({ refId: data.refId, success: true });
    } catch {
      const refId = "CFG-" + Date.now().toString(36).toUpperCase();
      const saved = JSON.parse(localStorage.getItem("fourlinq_configs") || "[]");
      saved.push({ ...config, refId, date: new Date().toISOString() });
      localStorage.setItem("fourlinq_configs", JSON.stringify(saved));
      setResult({ refId, success: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => { setForm({ name: "", email: "", phone: "" }); setResult(null); onClose(); };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/30 z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl shadow-2xl border border-border w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">Save Your Configuration</h2>
            <button onClick={handleClose} className="text-[color:var(--ink-muted)] hover:text-primary p-1"><X size={18} /></button>
          </div>

          {result ? (
            <div className="px-6 py-8 text-center">
              <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
              <p className="text-[color:var(--ink-primary)] font-medium mb-2">Configuration Saved!</p>
              <p className="text-xs text-[color:var(--ink-muted)]">Reference: <span className="font-mono font-medium text-primary">{result.refId}</span></p>
              <p className="text-sm text-[color:var(--ink-muted)] mt-3">Our team will reach out with a detailed quotation.</p>
              <Button onClick={handleClose} className="mt-6">Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Type</span><span className="font-medium text-primary">{selectedType.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Material</span><span className="font-medium text-primary">{selectedMaterial.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Finish</span><span className="font-medium text-primary">{selectedFinish.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Glass</span><span className="font-medium text-primary">{selectedGlass.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Size</span><span className="font-medium text-primary">{config.width} × {config.height} mm</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] py-2.5 text-body-sm text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] transition-colors duration-300 ease-marvin" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] py-2.5 text-body-sm text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] transition-colors duration-300 ease-marvin" placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] py-2.5 text-body-sm text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] transition-colors duration-300 ease-marvin" placeholder="+63 9XX XXX XXXX" />
              </div>
              <Button type="submit" className="w-full font-medium" size="lg" disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : "Save & Get a Quote"}
              </Button>
              <p className="text-[10px] text-[color:var(--ink-muted)] text-center">We'll use your details to prepare a custom quotation.</p>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

const DesignTool = ({ embedded = false }: { embedded?: boolean }) => {
  const [searchParams] = useSearchParams();
  // Embeddable two ways: as a component (homepage renders <DesignTool embedded />)
  // or via /design-tool?embed=1 (iframe/legacy).
  const isEmbed = embedded || searchParams.get("embed") === "1";
  const [step, setStep] = useState(0);
  const [saveOpen, setSaveOpen] = useState(false);
  const [config, setConfig] = useState({
    type: "casement",
    material: "upvc",
    finish: "white",
    glass: "clear-float",
    width: 1200,
    height: 1400,
  });

  const updateConfig = (field: string, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string") trackConfigChange(field, value);
  };

  // Switching material re-scopes the finish set, so snap the finish to the first
  // valid one for the new material, otherwise a uPVC finish id would linger on
  // an aluminium config and the preview/summary would show a finish that isn't
  // offered for that material.
  const selectMaterial = (materialId: string) => {
    setConfig((prev) => {
      const nextFinishes = finishesForMaterial(materialId);
      const finishStillValid = nextFinishes.some((f) => f.id === prev.finish);
      return {
        ...prev,
        material: materialId,
        finish: finishStillValid ? prev.finish : nextFinishes[0]?.id ?? prev.finish,
      };
    });
    trackConfigChange("material", materialId);
  };

  const { data: productTypes = [], isLoading: typesLoading } = useProductTypes();
  const { data: materials = [], isLoading: materialsLoading } = useMaterials();
  const { isLoading: finishesLoading } = useFinishes();
  const { data: glassOptions = [], isLoading: glassLoading } = useGlassTypes();

  const isLoading = typesLoading || materialsLoading || finishesLoading || glassLoading;

  const finishOptions = finishesForMaterial(config.material);
  const selectedFinish = finishOptions.find((f) => f.id === config.finish) || finishOptions[0] || { name: "White", color: "#F5F5F5", id: "white" };
  const selectedGlass = glassOptions.find((g) => g.id === config.glass) || { name: "Clear", id: "clear-float" };
  const selectedType = productTypes.find((t) => t.id === config.type) || { name: "Casement", id: "casement", iconKey: "casement" };
  const selectedMaterial = materials.find((m) => m.id === config.material) || { name: "uPVC", id: "upvc" };

  const glassVisual = glassVisuals[config.glass] || { opacity: 0.1, tint: "rgba(200,220,240,0.1)" };

  const canContinue = step < LAST_STEP;
  const canBack = step > 0;

  const Chrome = ({ children }: { children: React.ReactNode }) =>
    isEmbed ? <>{children}</> : <Layout>{children}</Layout>;

  if (isLoading) {
    return (
      <Chrome>
        {!isEmbed && <PageHeader title="Design Tool" subtitle="Loading configurator..." />}
        <div className={isEmbed ? "py-6" : "pb-20"}>
          <div className="page-container max-w-6xl">
            <div className="flex items-center justify-center py-20">
              <div className="text-[color:var(--ink-muted)] text-sm">Loading design tool…</div>
            </div>
          </div>
        </div>
      </Chrome>
    );
  }

  return (
    <Chrome>
      {!isEmbed && (
        <PageHeader title="Design Tool" />
      )}

      <div className={isEmbed ? "py-6" : "pb-20"}>
        <div className="page-container max-w-6xl">
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(i)}
                  className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${
                    i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-[color:var(--ink-muted)]"
                  }`}
                >{i + 1}</button>
                <span className={`text-sm hidden sm:inline ${i === step ? "text-[color:var(--ink-primary)] font-medium" : "text-[color:var(--ink-muted)]"}`}>{label}</span>
                {i < LAST_STEP && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 min-w-0">
            <div className="min-h-[320px] min-w-0">
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-4">Select Product Type</h2>
                  <h3 className="eyebrow mb-3">Windows</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {productTypes.filter((t) => t.category === "windows").map((type) => {
                      const Icon = iconMap[type.iconKey];
                      return (
                        <button key={type.id} onClick={() => updateConfig("type", type.id)} className={`p-4 rounded-lg border-2 text-center transition-colors ${config.type === type.id ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]" : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"}`}>
                          <div className="flex justify-center mb-2">
                            {Icon && <Icon size={36} className={config.type === type.id ? "text-primary" : "text-[color:var(--ink-muted)]"} strokeWidth={1} />}
                          </div>
                          <span className="text-xs font-medium text-primary">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <h3 className="eyebrow mb-3">Doors</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {productTypes.filter((t) => t.category === "doors").map((type) => {
                      const Icon = iconMap[type.iconKey];
                      return (
                        <button key={type.id} onClick={() => updateConfig("type", type.id)} className={`p-4 rounded-lg border-2 text-center transition-colors ${config.type === type.id ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]" : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"}`}>
                          <div className="flex justify-center mb-2">
                            {Icon && <Icon size={36} className={config.type === type.id ? "text-primary" : "text-[color:var(--ink-muted)]"} strokeWidth={1} />}
                          </div>
                          <span className="text-xs font-medium text-primary">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <h3 className="eyebrow mb-3">Specialist</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {productTypes.filter((t) => t.category === "specialist").map((type) => {
                      const Icon = iconMap[type.iconKey];
                      return (
                        <button key={type.id} onClick={() => updateConfig("type", type.id)} className={`p-4 rounded-lg border-2 text-center transition-colors ${config.type === type.id ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]" : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"}`}>
                          <div className="flex justify-center mb-2">
                            {Icon && <Icon size={36} className={config.type === type.id ? "text-primary" : "text-[color:var(--ink-muted)]"} strokeWidth={1} />}
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
                  <h2 className="text-lg font-medium text-primary mb-4">Choose Material</h2>
                  <p className="text-sm text-[color:var(--ink-secondary)] mb-6 max-w-md leading-relaxed">
                    uPVC and aluminium are both profile systems. The material sets which
                    finishes are available next.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {materials.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => selectMaterial(mat.id)}
                        className={`p-5 rounded-lg border-2 text-left transition-colors ${config.material === mat.id ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]" : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"}`}
                      >
                        <span className="block text-base font-medium text-primary mb-1">{mat.name}</span>
                        <span className="block text-xs text-[color:var(--ink-muted)] leading-snug">{mat.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-4">Choose Finish</h2>
                  <p className="text-sm text-[color:var(--ink-muted)] mb-4">
                    {selectedMaterial.name} finishes
                  </p>
                  <h3 className="eyebrow mb-3">Solid</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                    {finishOptions.filter((f) => f.finishType === "solid").map((finish) => (
                      <button key={finish.id} onClick={() => updateConfig("finish", finish.id)} className="flex flex-col items-center gap-2 group" title={finish.description}>
                        <FinishSwatch finishId={finish.id} color={finish.color} finishType="solid" selected={config.finish === finish.id} />
                        <span className={`text-[11px] text-center leading-tight ${config.finish === finish.id ? "text-[color:var(--ink-primary)] font-medium" : "text-[color:var(--ink-muted)]"}`}>{finish.name}</span>
                      </button>
                    ))}
                  </div>
                  {finishOptions.some((f) => f.finishType === "wood-grain") && (
                    <>
                      <h3 className="eyebrow mb-3">Wood Grain</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {finishOptions.filter((f) => f.finishType === "wood-grain").map((finish) => (
                          <button key={finish.id} onClick={() => updateConfig("finish", finish.id)} className="flex flex-col items-center gap-2 group" title={finish.description}>
                            <FinishSwatch finishId={finish.id} color={finish.color} finishType="wood-grain" selected={config.finish === finish.id} />
                            <span className={`text-[11px] text-center leading-tight ${config.finish === finish.id ? "text-[color:var(--ink-primary)] font-medium" : "text-[color:var(--ink-muted)]"}`}>{finish.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-4">Select Glass Type</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {glassOptions.map((glass) => {
                      const visual = glassVisuals[glass.id] || { tint: "rgba(200,220,240,0.1)" };
                      return (
                        <button key={glass.id} onClick={() => updateConfig("glass", glass.id)} className={`p-3 border text-center transition-colors duration-300 ease-marvin ${config.glass === glass.id ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]" : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"}`}>
                          <div className="w-10 h-14 mx-auto rounded mb-2 border border-border" style={{ backgroundColor: visual.tint }} />
                          <span className="text-xs font-medium text-primary">{glass.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {step === 4 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-6">Set Dimensions</h2>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-sm text-[color:var(--ink-muted)]">Width</span><span className="text-sm font-medium text-primary">{config.width} mm</span></div>
                      <Slider value={[config.width]} onValueChange={([v]) => updateConfig("width", v)} min={sizeConstraints.width.min} max={sizeConstraints.width.max} step={sizeConstraints.width.step} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-sm text-[color:var(--ink-muted)]">Height</span><span className="text-sm font-medium text-primary">{config.height} mm</span></div>
                      <Slider value={[config.height]} onValueChange={([v]) => updateConfig("height", v)} min={sizeConstraints.height.min} max={sizeConstraints.height.max} step={sizeConstraints.height.step} />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-8">
                {canBack && <Button variant="outline" onClick={() => setStep(step - 1)} className="font-medium">Back</Button>}
                {canContinue && <Button onClick={() => setStep(step + 1)} className="font-medium">Continue</Button>}
                {embedded && (
                  <Button asChild variant="ghost" className="font-medium">
                    <Link to="/design-tool">Open Design Tool →</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 sm:p-8 min-w-0 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/50 mb-6">Live Preview</h3>
              <WindowPreview
                type={config.type}
                frameColor={selectedFinish.color}
                finishId={config.finish}
                glassTint={glassVisual.tint}
                glassOpacity={glassVisual.opacity}
                width={config.width}
                height={config.height}
              />
              <div className="mt-8 w-full border-t border-border pt-6 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-[color:var(--ink-muted)]">Type</span><span className="text-[color:var(--ink-primary)] font-medium">{selectedType.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[color:var(--ink-muted)]">Material</span><span className="text-[color:var(--ink-primary)] font-medium">{selectedMaterial.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[color:var(--ink-muted)]">Finish</span><span className="text-[color:var(--ink-primary)] font-medium">{selectedFinish.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[color:var(--ink-muted)]">Glass</span><span className="text-[color:var(--ink-primary)] font-medium">{selectedGlass.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[color:var(--ink-muted)]">Dimensions</span><span className="text-[color:var(--ink-primary)] font-medium">{config.width} × {config.height} mm</span></div>
              </div>
              <div className="flex gap-3 mt-6 w-full">
                <Button variant="outline" className="flex-1 font-medium" onClick={() => setSaveOpen(true)}>Save & Get Quote</Button>
                <Button asChild className="flex-1 font-medium"><Link to="/brand#contact">Book Consultation</Link></Button>
              </div>
              <SaveModal
                isOpen={saveOpen}
                onClose={() => setSaveOpen(false)}
                config={config}
                selectedType={selectedType}
                selectedMaterial={selectedMaterial}
                selectedFinish={selectedFinish}
                selectedGlass={selectedGlass}
              />
            </div>
          </div>
        </div>
      </div>
    </Chrome>
  );
};

export default DesignTool;

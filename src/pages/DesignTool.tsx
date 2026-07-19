import { useEffect, useId, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProductTypes, useMaterials, useFinishes, useGlassTypes, finishesForMaterial } from "@/hooks/useConfigurator";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react";
import WindowPreview from "@/components/configurator/WindowPreview";
import FinishSwatch from "@/components/shared/FinishSwatch";
import { trackConfigChange } from "@/hooks/useAnalytics";
import {
  saveConfiguration,
  type Configuration,
  type SaveConfigurationResult,
} from "@/lib/configuration";
import { DESIGN_TOOL_FRAME_MESSAGE } from "@/lib/embed";
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

// The preview keeps glass visually neutral until FourlinQ confirms an assembly.
const glassVisuals: Record<string, { opacity: number; tint: string }> = {
  "confirm-with-fourlinq": { opacity: 0.1, tint: "rgba(200,220,240,0.1)" },
};

const sizeConstraints = {
  width: { min: 400, max: 3000, step: 50 },
  height: { min: 400, max: 3000, step: 50 },
};

// Type → Material → Finish → Glass → Size. The Material step was added to match
// the meeting's "like Apple selection" flow (00:11:11–00:11:28) and the site's
// type-vs-material axes: material decides which finishes are offered next.
const stepLabels = ["Type", "Material", "Finish", "Glass", "Size"];
const LAST_STEP = stepLabels.length - 1;
type ProductCategory = "windows" | "doors" | "specialist";
const PRODUCT_CATEGORY: ReadonlyArray<{ id: ProductCategory; label: string }> = [
  { id: "windows", label: "Windows" },
  { id: "doors", label: "Doors" },
  { id: "specialist", label: "Specialist" },
];

const SaveModal = ({ isOpen, onClose, config, selectedType, selectedMaterial, selectedFinish, selectedGlass }: {
  isOpen: boolean;
  onClose: () => void;
  config: Configuration;
  selectedType: { name: string };
  selectedMaterial: { name: string };
  selectedFinish: { name: string };
  selectedGlass: { name: string };
}) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SaveConfigurationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      setResult(await saveConfiguration({ ...form, config }));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `${cause.message} Nothing was submitted. Please try again or contact FourlinQ directly.`
          : "The configuration could not be sent. Nothing was submitted. Please try again or contact FourlinQ directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) return;
    setForm({ name: "", email: "", phone: "" });
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-xl border-border bg-surface p-0 shadow-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameRef.current?.focus();
        }}
      >
        <div className="border-b border-border px-6 py-4 pr-14">
          <DialogTitle className="text-lg font-semibold text-primary">
            Send your configuration
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs leading-relaxed text-[color:var(--ink-muted)]">
            This sends your visual brief to FourlinQ for review. It is not a confirmed technical specification or quotation.
          </DialogDescription>
        </div>

        {result ? (
          <div className="px-6 py-8 text-center" role="status" aria-live="polite">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={48} aria-hidden="true" />
            <p className="mb-2 font-medium text-[color:var(--ink-primary)]">Configuration sent.</p>
            <p className="text-xs text-[color:var(--ink-muted)]">Reference: <span className="font-mono font-medium text-primary">{result.refId}</span></p>
            <p className="mt-3 text-sm text-[color:var(--ink-muted)]">FourlinQ received this visual brief. The team still needs to confirm compatibility, dimensions, availability, and price.</p>
            <Button onClick={() => handleOpenChange(false)} className="mt-6">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div className="bg-muted rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Type</span><span className="font-medium text-primary">{selectedType.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Material</span><span className="font-medium text-primary">{selectedMaterial.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Finish</span><span className="font-medium text-primary">{selectedFinish.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Glass</span><span className="font-medium text-primary">{selectedGlass.name}</span></div>
                <div className="flex justify-between"><span className="text-[color:var(--ink-muted)]">Size</span><span className="font-medium text-primary">{config.width} × {config.height} mm</span></div>
              </div>
              {error && (
                <div className="flex items-start gap-2 border-l-2 border-[color:var(--accent)] pl-3 text-xs leading-relaxed text-[color:var(--ink-secondary)]" role="alert">
                  <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label htmlFor={nameId} className="block text-sm font-medium text-primary mb-1">Name *</label>
                <input ref={nameRef} id={nameId} name="name" autoComplete="name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] py-2.5 text-body-sm text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] transition-colors duration-300 ease-marvin" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor={emailId} className="block text-sm font-medium text-primary mb-1">Email *</label>
                <input id={emailId} name="email" autoComplete="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] py-2.5 text-body-sm text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] transition-colors duration-300 ease-marvin" placeholder="you@email.com" />
              </div>
              <div>
                <label htmlFor={phoneId} className="block text-sm font-medium text-primary mb-1">Phone</label>
                <input id={phoneId} name="phone" autoComplete="tel" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] py-2.5 text-body-sm text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] transition-colors duration-300 ease-marvin" placeholder="+63 9XX XXX XXXX" />
              </div>
              <Button type="submit" className="w-full font-medium" size="lg" disabled={submitting}>
                {submitting ? <><Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" /> Sending...</> : "Send for quote review"}
              </Button>
              <p className="text-center text-[10px] text-[color:var(--ink-muted)]">Your details and configuration will be sent only after the server confirms this submission.</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const DesignTool = () => {
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";
  const [step, setStep] = useState(0);
  const [productCategory, setProductCategory] = useState<ProductCategory>("windows");
  const [saveOpen, setSaveOpen] = useState(false);
  const [config, setConfig] = useState({
    type: "casement",
    material: "upvc",
    finish: "white",
    glass: "confirm-with-fourlinq",
    width: 1200,
    height: 1400,
  });

  const updateConfig = (field: string, value: string | number) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string") trackConfigChange(field, value);
  };

  // Switching material re-scopes the finish set, so snap the finish to the first
  // valid one for the new material — otherwise a uPVC finish id would linger on
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

  const visibleProductType = productTypes.filter((type) => type.category === productCategory);
  const selectProductCategory = (category: ProductCategory) => {
    setProductCategory(category);
    const currentType = productTypes.find((type) => type.id === config.type);
    if (currentType?.category === category) return;
    const nextType = productTypes.find((type) => type.category === category);
    if (nextType) updateConfig("type", nextType.id);
  };

  const isLoading = typesLoading || materialsLoading || finishesLoading || glassLoading;

  const finishOptions = finishesForMaterial(config.material);
  const selectedFinish = finishOptions.find((f) => f.id === config.finish) || finishOptions[0] || { name: "White", color: "#F5F5F5", id: "white" };
  const selectedGlass = glassOptions.find((g) => g.id === config.glass) || { name: "Glass to be confirmed", id: "confirm-with-fourlinq" };
  const selectedType = productTypes.find((t) => t.id === config.type) || { name: "Casement", id: "casement", iconKey: "casement" };
  const selectedMaterial = materials.find((m) => m.id === config.material) || { name: "uPVC", id: "upvc" };

  const glassVisual = glassVisuals[config.glass] || { opacity: 0.1, tint: "rgba(200,220,240,0.1)" };

  const canContinue = step < LAST_STEP;
  const canBack = step > 0;

  useEffect(() => {
    if (!isEmbed || window.parent === window) return;
    const main = document.getElementById("main-content");
    if (!main) return;

    let frame = 0;
    const reportHeight = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const height = Math.ceil(Math.max(main.scrollHeight, main.getBoundingClientRect().height));
        window.parent.postMessage({ type: DESIGN_TOOL_FRAME_MESSAGE, height }, window.location.origin);
      });
    };
    const observer = new ResizeObserver(reportHeight);
    observer.observe(main);
    window.addEventListener("resize", reportHeight);
    reportHeight();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", reportHeight);
    };
  }, [isEmbed]);

  const Chrome = ({ children }: { children: React.ReactNode }) =>
    isEmbed ? <main id="main-content">{children}</main> : <Layout>{children}</Layout>;

  if (isLoading) {
    return (
      <Chrome>
        {!isEmbed && <PageHeader title="Design Tool" breadcrumbLabel="Design Tool" subtitle="Loading configurator..." />}
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
        <PageHeader
          eyebrow="Configurator"
          title="Sketch a window. Send it for review."
          breadcrumbLabel="Design Tool"
          subtitle="Create a visual brief by choosing a type, material, finish, and approximate size. Glass and the final assembly still require FourlinQ review."
        />
      )}

      <div className={isEmbed ? "py-4" : "pb-20"} data-design-tool-embed={isEmbed || undefined}>
        <div className={isEmbed ? "mx-auto max-w-6xl px-4 sm:px-6" : "page-container max-w-6xl"}>
          {/* Step Progress */}
          <div className={`flex items-center justify-center gap-2 ${isEmbed ? "mb-2 min-[680px]:mb-8" : "mb-2 sm:mb-12"}`} aria-label="Configuration progress">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${label}`}
                  className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${
                    i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-[color:var(--ink-muted)]"
                  }`}
                >{i + 1}</button>
                <span className={`${isEmbed ? "hidden min-[680px]:inline" : "hidden sm:inline"} text-sm ${i === step ? "text-[color:var(--ink-primary)] font-medium" : "text-[color:var(--ink-muted)]"}`}>{label}</span>
                {i < LAST_STEP && <div className={`h-px w-4 sm:w-8 ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
          <p className={`${isEmbed ? "min-[680px]:hidden" : "sm:hidden"} mb-6 text-center text-xs font-medium text-[color:var(--ink-secondary)]`}>
            Step {step + 1} of {stepLabels.length} · {stepLabels[step]}
          </p>

          <div className={isEmbed ? "grid min-w-0 gap-6 sm:grid-cols-[minmax(0,1.12fr)_minmax(240px,0.88fr)]" : "grid min-w-0 gap-12 md:grid-cols-2"}>
            <div className={`min-w-0 ${isEmbed ? "min-h-[280px]" : "min-h-[320px]"}`}>
              {step === 0 && (
                <div>
                  <h2 className="mb-2 text-lg font-medium text-primary">Choose a product family</h2>
                  <p className="mb-5 text-sm leading-relaxed text-[color:var(--ink-secondary)]">
                    Start with the kind of opening. You can switch families without losing the rest of your brief.
                  </p>
                  <div className="mb-6 grid grid-cols-3 border-b border-[color:var(--rule-soft)]" role="group" aria-label="Product category">
                    {PRODUCT_CATEGORY.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => selectProductCategory(category.id)}
                        aria-pressed={productCategory === category.id}
                        className={`min-h-11 border-b-2 px-2 pb-3 text-xs font-medium transition-colors duration-300 ease-marvin sm:text-sm ${productCategory === category.id ? "border-[color:var(--ink-primary)] text-[color:var(--ink-primary)]" : "border-transparent text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)]"}`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                  <h3 className="eyebrow mb-3">{PRODUCT_CATEGORY.find((category) => category.id === productCategory)?.label}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {visibleProductType.map((type) => {
                      const Icon = iconMap[type.iconKey];
                      return (
                        <button type="button" key={type.id} onClick={() => updateConfig("type", type.id)} aria-pressed={config.type === type.id} className={`min-h-[92px] rounded-lg border-2 p-3 text-center transition-colors ${config.type === type.id ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]" : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"}`}>
                          <div className="mb-2 flex justify-center">
                            {Icon && <Icon size={32} className={config.type === type.id ? "text-primary" : "text-[color:var(--ink-muted)]"} strokeWidth={1} />}
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
                    Choose a published profile-system path to narrow the finish library.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {materials.map((mat) => (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => selectMaterial(mat.id)}
                        aria-pressed={config.material === mat.id}
                        className={`rounded-lg border-2 p-4 text-left transition-colors ${config.material === mat.id ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]" : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"}`}
                      >
                        <span className="block text-base font-medium text-primary mb-1">{mat.name}</span>
                        <span className="block text-xs text-[color:var(--ink-muted)] leading-snug">{mat.description}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-[color:var(--ink-secondary)]">
                    Material selection narrows finishes only. FourlinQ must confirm the exact profile or extrusion, reinforcement or thermal-break requirement, glass, hardware, dimensions, ratings, and suitability.
                  </p>
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
                      <button type="button" key={finish.id} onClick={() => updateConfig("finish", finish.id)} aria-pressed={config.finish === finish.id} className="flex flex-col items-center gap-2 group" title={finish.description}>
                        <FinishSwatch finishId={finish.id} color={finish.color} finishType="solid" selected={config.finish === finish.id} decorative />
                        <span className={`text-[11px] text-center leading-tight ${config.finish === finish.id ? "text-[color:var(--ink-primary)] font-medium" : "text-[color:var(--ink-muted)]"}`}>{finish.name}</span>
                      </button>
                    ))}
                  </div>
                  {finishOptions.some((f) => f.finishType === "wood-grain") && (
                    <>
                      <h3 className="eyebrow mb-3">Wood Grain</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {finishOptions.filter((f) => f.finishType === "wood-grain").map((finish) => (
                          <button type="button" key={finish.id} onClick={() => updateConfig("finish", finish.id)} aria-pressed={config.finish === finish.id} className="flex flex-col items-center gap-2 group" title={finish.description}>
                            <FinishSwatch finishId={finish.id} color={finish.color} finishType="wood-grain" selected={config.finish === finish.id} decorative />
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
                  <h2 className="text-lg font-medium text-primary mb-2">Confirm glass with FourlinQ</h2>
                  <p className="mb-4 text-sm leading-relaxed text-[color:var(--ink-secondary)]">
                    No product-specific glass matrix is published here. FourlinQ will confirm the type, thickness, safety requirement, coating, compatibility, and availability for the proposed opening.
                  </p>
                  <div className="flex items-start gap-3 border-l-2 border-[color:var(--accent)] bg-[color:var(--canvas-soft)] p-4" role="note">
                    <Info size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-[color:var(--ink-primary)]">{selectedGlass.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[color:var(--ink-secondary)]">
                        Your saved brief will carry this as a review item, not as a selected specification.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div>
                  <h2 className="text-lg font-medium text-primary mb-6">Set Dimensions</h2>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-sm text-[color:var(--ink-muted)]">Width</span><span className="text-sm font-medium text-primary">{config.width} mm</span></div>
                      <Slider aria-label="Approximate width in millimetres" value={[config.width]} onValueChange={([v]) => updateConfig("width", v)} min={sizeConstraints.width.min} max={sizeConstraints.width.max} step={sizeConstraints.width.step} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-sm text-[color:var(--ink-muted)]">Height</span><span className="text-sm font-medium text-primary">{config.height} mm</span></div>
                      <Slider aria-label="Approximate height in millimetres" value={[config.height]} onValueChange={([v]) => updateConfig("height", v)} min={sizeConstraints.height.min} max={sizeConstraints.height.max} step={sizeConstraints.height.step} />
                    </div>
                  </div>
                  <p className="mt-6 text-xs leading-relaxed text-[color:var(--ink-secondary)]">
                    These controls change only the scale of this visual brief. The endpoints are not product limits; FourlinQ must confirm dimensions for the selected assembly.
                  </p>
                </div>
              )}
              <div className="flex gap-4 mt-8">
                {canBack && <Button variant="outline" onClick={() => setStep(step - 1)} className="font-medium">Back</Button>}
                {canContinue && <Button onClick={() => setStep(step + 1)} className="font-medium">Continue</Button>}
              </div>
              {!canContinue && (
                <div className="mt-8 border-t border-[color:var(--rule-soft)] pt-6">
                  <p className="text-sm font-medium text-[color:var(--ink-primary)]">Ready for a feasibility and quote review?</p>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--ink-secondary)]">
                    FourlinQ will receive this as a visual brief. It is not a technical approval or quotation.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button onClick={() => setSaveOpen(true)} className="font-medium">Send visual brief</Button>
                    {isEmbed ? (
                      <Button asChild variant="outline" className="font-medium">
                        <a href="/design-tool" target="_top">Open full Design Tool</a>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="font-medium"><Link to="/brand#contact">Book Consultation</Link></Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`min-w-0 self-start rounded-xl border border-border bg-card ${isEmbed ? "p-4 sm:sticky sm:top-4" : "p-5 sm:p-8 md:sticky md:top-24"}`}>
              <h3 className={`text-center text-sm font-semibold uppercase tracking-wider text-primary/50 ${isEmbed ? "mb-3" : "mb-6"}`}>Live Preview</h3>
              <WindowPreview
                type={config.type}
                frameColor={selectedFinish.color}
                finishId={config.finish}
                glassTint={glassVisual.tint}
                glassOpacity={glassVisual.opacity}
                width={config.width}
                height={config.height}
                label={`${selectedType.name} ${selectedMaterial.name} window preview in ${selectedFinish.name}, ${selectedGlass.name.toLowerCase()}, ${config.width} by ${config.height} millimetres`}
                compact={isEmbed}
              />
              <div className={`${isEmbed ? "mt-4 pt-4" : "mt-8 pt-6"} w-full space-y-2 border-t border-border`}>
                <div className={`flex justify-between ${isEmbed ? "text-xs" : "text-sm"}`}><span className="text-[color:var(--ink-muted)]">Type</span><span className="font-medium text-[color:var(--ink-primary)]">{selectedType.name}</span></div>
                <div className={`flex justify-between ${isEmbed ? "text-xs" : "text-sm"}`}><span className="text-[color:var(--ink-muted)]">Material</span><span className="font-medium text-[color:var(--ink-primary)]">{selectedMaterial.name}</span></div>
                <div className={`flex justify-between ${isEmbed ? "text-xs" : "text-sm"}`}><span className="text-[color:var(--ink-muted)]">Finish</span><span className="font-medium text-[color:var(--ink-primary)]">{selectedFinish.name}</span></div>
                <div className={`flex justify-between gap-4 ${isEmbed ? "text-xs" : "text-sm"}`}><span className="text-[color:var(--ink-muted)]">Glass</span><span className="text-right font-medium text-[color:var(--ink-primary)]">{selectedGlass.name}</span></div>
                <div className={`flex justify-between ${isEmbed ? "text-xs" : "text-sm"}`}><span className="text-[color:var(--ink-muted)]">Dimensions</span><span className="font-medium text-[color:var(--ink-primary)]">{config.width} × {config.height} mm</span></div>
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

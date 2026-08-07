// Configurator data, derived from verified fourlinq-data.ts
// Glass options are kept locally (not in brochure data)
import { FRAME_FINISHES, DIMENSION_CONSTRAINTS } from "./fourlinq-data";
import type { WindowType } from "./fourlinq-data";

export interface ProductType {
  id: string;
  name: string;
  icon: string;
  category: "windows" | "doors" | "specialist";
}

export interface FinishOption {
  id: string;
  name: string;
  color: string;
  finishType: "solid" | "wood-grain";
  description: string;
}

export interface GlassOption {
  id: string;
  name: string;
  opacity: number;
  tint: string;
}

/** A single panel in a multi-panel door run: fixed leaf or sliding leaf. */
export type PanelKind = "fixed" | "slide";

/**
 * Named panel layout preset for multi-panel door systems.
 * Sequence field is singular (`panel`) per project naming convention.
 */
export interface PanelLayout {
  id: string;
  label: string;
  /** Product family this layout applies to (e.g. sliding-door). */
  family: string;
  /** Ordered panel sequence — fixed | slide. Singular field name. */
  panel: PanelKind[];
}

/** Sliding-door family id used by panel layouts. */
export const SLIDING_DOOR_FAMILY = "sliding-door";

/**
 * Panel layouts available on the sliding-door family.
 * Drawn generically from the sequence so future 3- or 8-panel runs cost nothing.
 */
export const panelLayout: PanelLayout[] = [
  {
    id: "slide-slide",
    label: "Slide · Slide",
    family: SLIDING_DOOR_FAMILY,
    panel: ["slide", "slide"],
  },
  {
    id: "fixed-slide",
    label: "Fixed · Slide",
    family: SLIDING_DOOR_FAMILY,
    panel: ["fixed", "slide"],
  },
  {
    id: "fixed-slide-slide-fixed",
    label: "Fixed · 2-panel slide · Fixed",
    family: SLIDING_DOOR_FAMILY,
    panel: ["fixed", "slide", "slide", "fixed"],
  },
  {
    id: "fixed-slide-slide-slide-slide-fixed",
    label: "Fixed · 4-panel slide · Fixed",
    family: SLIDING_DOOR_FAMILY,
    panel: ["fixed", "slide", "slide", "slide", "slide", "fixed"],
  },
];

/** Look up a panel layout by id. */
export function getPanelLayout(id: string): PanelLayout | undefined {
  return panelLayout.find((layout) => layout.id === id);
}

/** Layouts available for a product family (e.g. sliding-door). */
export function panelLayoutForFamily(family: string): PanelLayout[] {
  return panelLayout.filter((layout) => layout.family === family);
}

/**
 * Even width division of the frame inner opening across N panels.
 * Total of the returned width × count equals innerWidth (floating-point safe for sum checks).
 */
export function dividePanelWidth(innerWidth: number, panelCount: number): number {
  if (panelCount <= 0) return 0;
  return innerWidth / panelCount;
}

// Catalog mirrors the brochure-verified FourlinQ product line: 5 windows, 7 doors,
// 3 specialist geometries. iconKeys reuse a few core icons across related types.
export const productTypes: ProductType[] = [
  // Windows
  { id: "casement", name: "Casement", icon: "casement", category: "windows" },
  { id: "awning", name: "Awning", icon: "awning", category: "windows" },
  { id: "sliding", name: "Sliding", icon: "sliding", category: "windows" },
  { id: "fixed", name: "Fixed", icon: "fixed", category: "windows" },
  { id: "tilt-turn", name: "Tilt & Turn", icon: "tilt-turn", category: "windows" },
  { id: "special-shapes", name: "Special Shapes", icon: "special-shapes", category: "windows" },
  // Doors. Featured order: Slide & Fold → Large Panel → 90 Series → Lift & Slide
  { id: "bifold", name: "Slide & Fold", icon: "bifold", category: "doors" },
  { id: "large-panel-doors", name: "Large Panel Doors", icon: "large-panel", category: "doors" },
  { id: "90-series", name: "90 Series", icon: "90-series", category: "doors" },
  { id: "lift-slide", name: "Lift & Slide", icon: "lift-slide", category: "doors" },
  { id: "sliding-door", name: "Sliding Door", icon: "sliding-door", category: "doors" },
  { id: "french-door", name: "French Sliding Door", icon: "french-door", category: "doors" },
  { id: "entrance", name: "Casement Door", icon: "entrance", category: "doors" },
  // Specialist. Custom-fabricated geometries
  { id: "arch-shapes", name: "Arch Shapes", icon: "arch", category: "specialist" },
  { id: "curtain-wall", name: "Curtain Wall", icon: "curtain-wall", category: "specialist" },
  { id: "custom-shapes", name: "Custom Shapes", icon: "custom-shapes", category: "specialist" },
];

// 11 verified finishes from physical uPVC profile sample bars
// Mapped from FRAME_FINISHES canonical source
export const finishOptions: FinishOption[] = FRAME_FINISHES.map((f) => ({
  id: f.id,
  name: f.label,
  color: f.swatchHex,
  finishType: f.category,
  description: f.description,
}));

export const glassOptions: GlassOption[] = [
  { id: "clear-float", name: "Clear Float", opacity: 0.1, tint: "rgba(200,220,240,0.1)" },
  { id: "low-e-coated", name: "Low-E Coated", opacity: 0.15, tint: "rgba(180,210,240,0.15)" },
  { id: "frosted-privacy", name: "Frosted Privacy", opacity: 0.5, tint: "rgba(255,255,255,0.6)" },
  { id: "tinted-bronze", name: "Tinted Bronze", opacity: 0.35, tint: "rgba(80,70,50,0.35)" },
  { id: "tinted-grey", name: "Tinted Grey", opacity: 0.3, tint: "rgba(100,100,100,0.3)" },
  { id: "laminated-safety", name: "Laminated Safety", opacity: 0.12, tint: "rgba(200,220,240,0.12)" },
];

export const defaultConfig = {
  type: "casement",
  finish: "white",
  glass: "clear-float",
  width: 1200,
  height: 1400,
  /** Optional multi-panel layout id (sliding-door family). */
  panelLayoutId: "slide-slide" as string | undefined,
};

// Per-type dimension constraints from verified data (in mm)
export const sizeConstraints = {
  width: { min: 400, max: 3000, step: 50 },
  height: { min: 400, max: 3000, step: 50 },
};

export { DIMENSION_CONSTRAINTS };
export type { WindowType };

// Configurator data — derived from verified fourlinq-data.ts
// Glass options are kept locally (not in brochure data)
import { FRAME_FINISHES, DIMENSION_CONSTRAINTS } from "./fourlinq-data";
import type { WindowType } from "./fourlinq-data";

export interface ProductType {
  id: string;
  name: string;
  icon: string;
  category: "windows" | "doors";
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

// Verified from brochure: Casement, Sliding, Awning, Special Shapes (windows)
// Doors: Sliding Door, Bifold/Slide & Fold, French Door, Entrance, Lift & Slide
export const productTypes: ProductType[] = [
  // Windows
  { id: "casement", name: "Casement", icon: "casement", category: "windows" },
  { id: "awning", name: "Awning", icon: "awning", category: "windows" },
  { id: "sliding", name: "Sliding", icon: "sliding", category: "windows" },
  { id: "fixed", name: "Fixed", icon: "fixed", category: "windows" },
  { id: "tilt-turn", name: "Tilt & Turn", icon: "tilt-turn", category: "windows" },
  // Doors
  { id: "sliding-door", name: "Sliding Door", icon: "sliding-door", category: "doors" },
  { id: "bifold", name: "Slide & Fold", icon: "bifold", category: "doors" },
  { id: "lift-slide", name: "Lift & Slide", icon: "lift-slide", category: "doors" },
  { id: "french-door", name: "French Door", icon: "french-door", category: "doors" },
  { id: "entrance", name: "Entrance", icon: "entrance", category: "doors" },
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
};

// Per-type dimension constraints from verified data (in mm)
export const sizeConstraints = {
  width: { min: 400, max: 3000, step: 50 },
  height: { min: 400, max: 3000, step: 50 },
};

export { DIMENSION_CONSTRAINTS };
export type { WindowType };

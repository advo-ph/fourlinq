// Configurator data — derived from verified fourlinq-data.ts.
// No product-specific glass matrix is published, so glass stays confirmation-only.
import { FRAME_FINISHES } from "./fourlinq-data";

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
  // Doors — featured order: Slide & Fold → Large Panel → 90 Series → Lift & Slide
  { id: "bifold", name: "Slide & Fold", icon: "bifold", category: "doors" },
  { id: "large-panel-doors", name: "Large Panel Doors", icon: "large-panel", category: "doors" },
  { id: "90-series", name: "90 Series", icon: "90-series", category: "doors" },
  { id: "lift-slide", name: "Lift & Slide", icon: "lift-slide", category: "doors" },
  { id: "sliding-door", name: "Sliding Door", icon: "sliding-door", category: "doors" },
  { id: "french-door", name: "French Sliding Door", icon: "french-door", category: "doors" },
  { id: "entrance", name: "Casement Door", icon: "entrance", category: "doors" },
  // Specialist — custom-fabricated geometries
  { id: "arch-shapes", name: "Arch Shapes", icon: "arch", category: "specialist" },
  { id: "curtain-wall", name: "Curtain Wall", icon: "curtain-wall", category: "specialist" },
  { id: "custom-shapes", name: "Custom Shapes", icon: "custom-shapes", category: "specialist" },
];

// 12 verified entries from physical uPVC profile sample bars
// Mapped from FRAME_FINISHES canonical source
export const finishOptions: FinishOption[] = FRAME_FINISHES.map((f) => ({
  id: f.id,
  name: f.label,
  color: f.swatchHex,
  finishType: f.category,
  description: f.description,
}));

export const glassOptions: GlassOption[] = [
  { id: "confirm-with-fourlinq", name: "Glass to be confirmed", opacity: 0.1, tint: "rgba(200,220,240,0.1)" },
];

export const defaultConfig = {
  type: "casement",
  finish: "white",
  glass: "confirm-with-fourlinq",
  width: 1200,
  height: 1400,
};

// Per-type dimension constraints from verified data (in mm)
export const sizeConstraints = {
  width: { min: 400, max: 3000, step: 50 },
  height: { min: 400, max: 3000, step: 50 },
};

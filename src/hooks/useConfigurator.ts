import {
  productTypes as staticProductTypes,
  finishOptions as staticFinishes,
  glassOptions as staticGlassOptions,
} from "@/data/configurator";
import { ALUMINIUM_FINISHES } from "@/data/fourlinq-data";

export interface ProductTypeItem {
  id: string;
  name: string;
  iconKey: string;
  openingMechanism: string;
  category: string;
  categoryName: string;
}

export type MaterialId = "upvc" | "aluminium";

export interface MaterialItem {
  id: MaterialId;
  name: string;
  description: string;
}

export interface FinishOption {
  id: string;
  name: string;
  color: string;
  finishType?: string;
  description?: string;
}

export interface GlassOption {
  id: string;
  name: string;
  glassCategory?: string;
  uValue?: number;
  acousticDb?: number;
}

const productTypeData: ProductTypeItem[] = staticProductTypes.map((t) => ({
  id: t.id,
  name: t.name,
  iconKey: t.icon,
  openingMechanism: t.id,
  category: t.category,
  categoryName:
    t.category === "windows" ? "Windows" :
    t.category === "doors" ? "Doors" :
    "Specialist",
}));

// uPVC frame finishes — the 12 brochure-verified solid + wood-grain finishes.
const upvcFinishData: FinishOption[] = staticFinishes.map((f) => ({
  id: f.id,
  name: f.name,
  color: f.color,
  finishType: f.finishType,
  description: f.description,
}));

// Aluminium powder-coat colours (Imie, 2026-05-31). Rendered as solid swatches.
const aluminiumFinishData: FinishOption[] = ALUMINIUM_FINISHES.map((f) => ({
  id: f.id,
  name: f.name,
  color: f.hex,
  finishType: "solid",
  description: `${f.name} powder-coat finish`,
}));

// The two profile systems (Imie, 2026-07-02: "Aluminium is like uPVC — they are
// both profile systems"). Material is the axis that decides the finish set:
// uPVC carries the 12 frame finishes, aluminium the powder-coat colours.
const materialData: MaterialItem[] = [
  { id: "upvc", name: "uPVC", description: "Multi-chamber profile, steel-reinforced, corrosion-free. The default for most residential openings." },
  { id: "aluminium", name: "Aluminium", description: "For bigger spans, thinner sightlines, and thermal control where uPVC is not enough." },
];

const finishByMaterial: Record<MaterialId, FinishOption[]> = {
  upvc: upvcFinishData,
  aluminium: aluminiumFinishData,
};

/** Finishes available for a material. Falls back to uPVC for an unknown id. */
export function finishesForMaterial(material: string): FinishOption[] {
  return finishByMaterial[material as MaterialId] ?? upvcFinishData;
}

const glassData: GlassOption[] = staticGlassOptions.map((g) => ({
  id: g.id,
  name: g.name,
}));

export function useProductTypes() {
  return { data: productTypeData, isLoading: false, error: null };
}

export function useMaterials() {
  return { data: materialData, isLoading: false, error: null };
}

/** Full uPVC finish set. Prefer finishesForMaterial() when a material is chosen. */
export function useFinishes() {
  return { data: upvcFinishData, isLoading: false, error: null };
}

export function useGlassTypes() {
  return { data: glassData, isLoading: false, error: null };
}

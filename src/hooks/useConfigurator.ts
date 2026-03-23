import {
  productTypes as staticProductTypes,
  finishOptions as staticFinishes,
  glassOptions as staticGlassOptions,
} from "@/data/configurator";

export interface ProductTypeItem {
  id: string;
  name: string;
  iconKey: string;
  openingMechanism: string;
  category: string;
  categoryName: string;
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
  categoryName: t.category === "windows" ? "Windows" : "Doors",
}));

const finishData: FinishOption[] = staticFinishes.map((f) => ({
  id: f.id,
  name: f.name,
  color: f.color,
  finishType: f.finishType,
  description: f.description,
}));

const glassData: GlassOption[] = staticGlassOptions.map((g) => ({
  id: g.id,
  name: g.name,
}));

export function useProductTypes() {
  return { data: productTypeData, isLoading: false, error: null };
}

export function useFinishes() {
  return { data: finishData, isLoading: false, error: null };
}

export function useGlassTypes() {
  return { data: glassData, isLoading: false, error: null };
}

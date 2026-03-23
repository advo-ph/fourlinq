import { useQuery } from "@tanstack/react-query";
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

const staticTypesFallback: ProductTypeItem[] = staticProductTypes.map((t) => ({
  id: t.id,
  name: t.name,
  iconKey: t.icon,
  openingMechanism: t.id,
  category: t.category,
  categoryName: t.category === "windows" ? "Windows" : "Doors",
}));

const staticFinishesFallback: FinishOption[] = staticFinishes.map((f) => ({
  id: f.id,
  name: f.name,
  color: f.color,
  finishType: f.finishType,
  description: f.description,
}));

const staticGlassFallback: GlassOption[] = staticGlassOptions.map((g) => ({
  id: g.id,
  name: g.name,
}));

async function fetchProductTypes(): Promise<ProductTypeItem[]> {
  try {
    const res = await fetch("/api/product-types");
    if (!res.ok) throw new Error("Failed to fetch product types");
    return res.json();
  } catch {
    return staticTypesFallback;
  }
}

async function fetchFinishes(): Promise<FinishOption[]> {
  try {
    const res = await fetch("/api/finishes");
    if (!res.ok) throw new Error("Failed to fetch finishes");
    return res.json();
  } catch {
    return staticFinishesFallback;
  }
}

async function fetchGlassTypes(): Promise<GlassOption[]> {
  try {
    const res = await fetch("/api/glass-types");
    if (!res.ok) throw new Error("Failed to fetch glass types");
    return res.json();
  } catch {
    return staticGlassFallback;
  }
}

export function useProductTypes() {
  return useQuery({
    queryKey: ["productTypes"],
    queryFn: fetchProductTypes,
    staleTime: 10 * 60 * 1000,
  });
}

export function useFinishes() {
  return useQuery({
    queryKey: ["finishes"],
    queryFn: fetchFinishes,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGlassTypes() {
  return useQuery({
    queryKey: ["glassTypes"],
    queryFn: fetchGlassTypes,
    staleTime: 10 * 60 * 1000,
  });
}

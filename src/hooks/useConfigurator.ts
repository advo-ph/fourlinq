import { useQuery } from "@tanstack/react-query";

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
}

export interface GlassOption {
  id: string;
  name: string;
  glassCategory?: string;
  uValue?: number;
  acousticDb?: number;
}

async function fetchProductTypes(): Promise<ProductTypeItem[]> {
  const res = await fetch("/api/product-types");
  if (!res.ok) throw new Error("Failed to fetch product types");
  return res.json();
}

async function fetchFinishes(): Promise<FinishOption[]> {
  const res = await fetch("/api/finishes");
  if (!res.ok) throw new Error("Failed to fetch finishes");
  return res.json();
}

async function fetchGlassTypes(): Promise<GlassOption[]> {
  const res = await fetch("/api/glass-types");
  if (!res.ok) throw new Error("Failed to fetch glass types");
  return res.json();
}

export function useProductTypes() {
  return useQuery({
    queryKey: ["productTypes"],
    queryFn: fetchProductTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes — rarely changes
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

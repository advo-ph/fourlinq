import { useQuery } from "@tanstack/react-query";
import { products as staticProducts } from "@/data/products";

export interface ProductFinish {
  name: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  image: string;
  specs: string[];
  finishes: ProductFinish[];
  glassOptions: string[];
  /** Optional YouTube video ID — renders an embed in the product detail panel. */
  youtubeId?: string;
  typeName?: string;
  iconKey?: string;
  typeSlug?: string;
  isFeatured?: boolean;
}

/**
 * Fetches the product catalog from /api/products (DB-backed since Phase 1).
 * Falls back to the bundled static catalog if the API is unreachable or
 * returns nothing — keeps the page renderable even when the API is down,
 * and means the UI stays usable while the DB seed catches up to the
 * frontend catalog.
 */
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`/api/products ${res.status}`);
  const rows = (await res.json()) as Product[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Empty product list — falling back to static.");
  }
  return rows;
}

export function useProducts(category?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    placeholderData: staticProducts as Product[],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const list = error || !data ? (staticProducts as Product[]) : data;
  const filtered = category ? list.filter((p) => p.category === category) : list;
  return { data: filtered, isLoading, error: null };
}

export function useProduct(slug: string) {
  const { data } = useProducts();
  const found = data.find((p) => p.id === slug);
  return { data: found, isLoading: false, error: found ? null : new Error("Product not found") };
}

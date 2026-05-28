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

const USE_API = false; // flip to true after the seed-cutover migration aligns
                       // DB rows with src/data/products.ts. See ROADMAP Phase 1.

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`/api/products ${res.status}`);
  const rows = (await res.json()) as Product[];
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Empty product list");
  }
  return rows;
}

/**
 * Returns the product catalog. Today: bundled static array (brochure-aligned).
 * Tomorrow (after Phase 1 seed-cutover migration): API result from /api/products.
 *
 * The React Query call is kept in place behind the USE_API flag so the
 * fetch/cache plumbing is exercised during development. Flip USE_API to true
 * when the DB seed matches the static catalog.
 */
export function useProducts(category?: string) {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: USE_API,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const list: Product[] =
    USE_API && !query.error && query.data ? query.data : (staticProducts as Product[]);
  const filtered = category ? list.filter((p) => p.category === category) : list;
  return { data: filtered, isLoading: USE_API ? query.isLoading : false, error: null };
}

export function useProduct(slug: string) {
  const { data } = useProducts();
  const found = data.find((p) => p.id === slug);
  return { data: found, isLoading: false, error: found ? null : new Error("Product not found") };
}

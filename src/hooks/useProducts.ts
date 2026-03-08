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
  typeName?: string;
  iconKey?: string;
  typeSlug?: string;
  isFeatured?: boolean;
}

function getStaticProducts(category?: string): Product[] {
  if (!category) return staticProducts;
  return staticProducts.filter((p) => p.category === category);
}

async function fetchProducts(category?: string): Promise<Product[]> {
  try {
    const url = category ? `/api/products?category=${category}` : "/api/products";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch {
    return getStaticProducts(category);
  }
}

async function fetchProduct(slug: string): Promise<Product> {
  try {
    const res = await fetch(`/api/products/${slug}`);
    if (!res.ok) throw new Error("Product not found");
    return res.json();
  } catch {
    const found = staticProducts.find((p) => p.id === slug);
    if (found) return found;
    throw new Error("Product not found");
  }
}

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: () => fetchProducts(category),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

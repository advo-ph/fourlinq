import { useQuery } from "@tanstack/react-query";

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

async function fetchProducts(category?: string): Promise<Product[]> {
  const url = category ? `/api/products?category=${category}` : "/api/products";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`/api/products/${slug}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", category ?? "all"],
    queryFn: () => fetchProducts(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

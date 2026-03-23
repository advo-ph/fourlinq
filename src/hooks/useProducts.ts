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

export function useProducts(category?: string) {
  const data = category
    ? staticProducts.filter((p) => p.category === category)
    : staticProducts;
  return { data, isLoading: false, error: null };
}

export function useProduct(slug: string) {
  const found = staticProducts.find((p) => p.id === slug);
  return { data: found, isLoading: false, error: found ? null : new Error("Product not found") };
}

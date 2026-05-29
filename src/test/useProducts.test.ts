/**
 * useProducts hook — verifies the static-fallback contract.
 *
 * Why this test matters: the hook ships behind `USE_API=false`. When the flag
 * flips after the seed cutover migration, this test stays useful because the
 * fallback path is the safety net for any future API failure.
 */
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useProducts, useProduct } from "@/hooks/useProducts";
import { products as staticProducts } from "@/data/products";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useProducts", () => {
  it("returns the full static catalog when no category filter is passed", () => {
    const { result } = renderHook(() => useProducts(), { wrapper });
    expect(result.current.data.length).toBe(staticProducts.length);
    expect(result.current.error).toBe(null);
  });

  it("filters by category", () => {
    const { result } = renderHook(() => useProducts("doors"), { wrapper });
    expect(result.current.data.length).toBeGreaterThan(0);
    expect(result.current.data.every((p) => p.category === "doors")).toBe(true);
  });

  it("returns Slide & Fold with the Tita-supplied YouTube reference video", () => {
    const { result } = renderHook(() => useProducts(), { wrapper });
    const slideAndFold = result.current.data.find((p) => p.id === "slide-and-fold");
    expect(slideAndFold).toBeDefined();
    expect(slideAndFold?.youtubeId).toBe("-8XwIKAtAAc");
  });

  it("includes the casement-door product with matching id and name", () => {
    // Regression for the id=entrance-door name=Casement Door mismatch fixed
    // in the 2026-05-29 revision pass.
    const { result } = renderHook(() => useProducts("doors"), { wrapper });
    const casementDoor = result.current.data.find((p) => p.id === "casement-door");
    expect(casementDoor).toBeDefined();
    expect(casementDoor?.name).toBe("Casement Door");
  });
});

describe("useProduct (single)", () => {
  it("resolves a known slug to the static product", () => {
    const { result } = renderHook(() => useProduct("casement"), { wrapper });
    expect(result.current.data?.id).toBe("casement");
    expect(result.current.error).toBe(null);
  });

  it("returns an error for an unknown slug", () => {
    const { result } = renderHook(() => useProduct("nonexistent-product-xyz"), { wrapper });
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

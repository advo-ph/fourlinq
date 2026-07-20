/**
 * useDocument hook — verifies the static-fallback contract for the
 * /for-architects technical library.
 *
 * Why this test matters: the fallback must mirror what migration 013 seeds
 * into cms_document, so the page renders identically whether or not the API
 * is reachable. If the seed and the fallback drift, an API outage would
 * silently change the library.
 */
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useDocument, DOCUMENT_FALLBACK } from "@/hooks/useDocument";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client }, children);
}

describe("useDocument", () => {
  it("never returns an empty library (fallback while the API resolves)", () => {
    const { result } = renderHook(() => useDocument(), { wrapper });
    expect(result.current.document.length).toBe(DOCUMENT_FALLBACK.length);
  });

  it("ships a downloadable system catalog out of the box", () => {
    const catalog = DOCUMENT_FALLBACK.find((d) => d.slug === "system-catalog");
    expect(catalog).toBeDefined();
    expect(catalog?.file_path).toBe("/docs/fourlinq-system-catalog.pdf");
  });

  it("links the two live pages instead of offering a file", () => {
    const live = DOCUMENT_FALLBACK.filter((d) => d.link_url);
    expect(live.map((d) => d.link_url).sort()).toEqual(["/care", "/finishes"]);
    expect(live.every((d) => !d.file_path)).toBe(true);
  });

  it("keeps every fallback row honestly labeled: file, link, or a request/progress note", () => {
    for (const d of DOCUMENT_FALLBACK) {
      // A row must never claim both a file and a link — status derivation
      // (file > link > note) would silently hide the link.
      expect(Boolean(d.file_path) && Boolean(d.link_url)).toBe(false);
      expect(d.title.length).toBeGreaterThan(0);
      expect(d.doc_type.length).toBeGreaterThan(0);
    }
  });
});

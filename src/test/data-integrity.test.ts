/**
 * Data integrity tests — catch the kinds of bugs that the 2026-05-29 Tita
 * revision pass surfaced (id/name mismatch, missing video, parochial copy).
 */
import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { benefits, comparisonData } from "@/data/benefits";

describe("products data integrity", () => {
  it("all product ids are kebab-case and unique", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("every product belongs to a known category", () => {
    const allowed = new Set(["windows", "doors", "specialist", "systems"]);
    for (const p of products) {
      expect(allowed.has(p.category)).toBe(true);
    }
  });

  it("every product image path starts with /images/ (no broken URLs)", () => {
    for (const p of products) {
      expect(p.image).toMatch(/^\/images\//);
    }
  });

  it("youtubeId, when present, looks like a YouTube video id", () => {
    for (const p of products) {
      if (p.youtubeId !== undefined) {
        expect(p.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      }
    }
  });

  it("no product carries the stale entrance-door id (renamed 2026-05-29)", () => {
    expect(products.find((p) => p.id === "entrance-door")).toBeUndefined();
  });
});

describe("FRAME_FINISHES integrity", () => {
  it("has exactly 12 brochure-verified finishes", () => {
    expect(FRAME_FINISHES.length).toBe(12);
  });

  it("splits 5 solid + 7 wood-grain per the brochure", () => {
    const solid = FRAME_FINISHES.filter((f) => f.category === "solid").length;
    const wood = FRAME_FINISHES.filter((f) => f.category === "wood-grain").length;
    expect(solid).toBe(5);
    expect(wood).toBe(7);
  });

  it("finish ids are unique and kebab-case", () => {
    const ids = FRAME_FINISHES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

describe("benefits + comparisonData", () => {
  it("benefits list is non-empty and every entry has the required fields", () => {
    expect(benefits.length).toBeGreaterThan(0);
    for (const b of benefits) {
      expect(b.id).toBeTruthy();
      expect(b.title).toBeTruthy();
      expect(b.shortDescription).toBeTruthy();
    }
  });

  it("comparison table has uPVC + Aluminum + Timber columns per row", () => {
    expect(comparisonData.length).toBeGreaterThan(0);
    for (const row of comparisonData) {
      expect(row.feature).toBeTruthy();
      expect(row.upvc).toBeTruthy();
      expect(row.aluminium).toBeTruthy();
      expect(row.timber).toBeTruthy();
    }
  });
});

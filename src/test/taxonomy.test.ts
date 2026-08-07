/**
 * Taxonomy invariants — the automated gate for roadmap items RM2 and RM4.
 *
 * These exist because the site shipped the wrong model once already. On
 * 2026-07-05 /products went live with an "Aluminium Line" card as a fourth peer
 * beside Window/Door/Specialist. Imie rejected it ("It's not according to
 * intended layout of the site 😭") and restated the rule: "Aluminium is like
 * uPVC — they are both profile systems."
 *
 * Type and material are orthogonal axes. These tests fail if aluminium ever
 * creeps back into the type list, or if the five navigation surfaces drift out
 * of agreement again.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SYSTEM_TYPE, PROFILE_MATERIAL, findTypeByFilter } from "@/data/taxonomy";
import { products } from "@/data/products";

/** Every surface that is allowed to render product navigation. */
const SURFACE = [
  "src/pages/Products.tsx",
  "src/components/home/SystemsTiles.tsx",
  "src/components/layout/QuietNavbar.tsx",
  "src/components/layout/EditorialFooter.tsx",
];

const read = (path: string) => readFileSync(path, "utf8");

/**
 * Source with comments stripped, so assertions test what the page RENDERS and
 * not what the code says about itself. Several of these files legitimately name
 * the old "Aluminium Line" card in a comment to explain why it is gone.
 */
const readCode = (path: string) =>
  read(path)
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments, incl. JSX {/* … */}
    .replace(/(^|[^:])\/\/.*$/gm, "$1"); // line comments, but not the // in a URL

describe("the two axes stay orthogonal (RM2)", () => {
  it("the type axis is exactly window, door, specialist", () => {
    expect(SYSTEM_TYPE.map((t) => t.type_code)).toEqual([
      "window",
      "door",
      "specialist",
    ]);
  });

  it("aluminium is NOT a type — it is a material", () => {
    // The exact regression Imie rejected on 2026-07-05.
    for (const type of SYSTEM_TYPE) {
      expect(type.type_code).not.toBe("aluminium");
      expect(type.label.toLowerCase()).not.toContain("aluminium");
    }
    expect(PROFILE_MATERIAL.map((m) => m.material_code)).toContain("aluminium");
  });

  it("the material axis is exactly the two profile systems", () => {
    expect(PROFILE_MATERIAL.map((m) => m.material_code)).toEqual([
      "upvc",
      "aluminium",
    ]);
    // Both are named as profile systems, per Imie 2026-07-02.
    for (const material of PROFILE_MATERIAL) {
      expect(material.label).toMatch(/profile system/i);
    }
  });

  it("no surface renders an 'Aluminium Line' peer card again", () => {
    for (const path of SURFACE) {
      expect(readCode(path)).not.toMatch(/Aluminium Line/);
    }
  });
});

describe("one taxonomy across every surface (RM4)", () => {
  it("every navigation surface imports the shared taxonomy", () => {
    // A surface that hardcodes its own list is how the four surfaces drifted
    // into three different models in the first place.
    for (const path of SURFACE) {
      expect(read(path)).toMatch(/from "@\/data\/taxonomy"/);
    }
  });

  it("every axis entry points at a route that exists", () => {
    const route = read("src/App.tsx");
    const destination = [
      ...SYSTEM_TYPE.map((t) => t.to),
      ...PROFILE_MATERIAL.map((m) => m.to),
    ];
    for (const to of destination) {
      const path = to.split("?")[0];
      expect(route).toContain(`path="${path}"`);
    }
  });

  it("no axis entry is missing a label, description, or item", () => {
    for (const entry of [...SYSTEM_TYPE, ...PROFILE_MATERIAL]) {
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.item.length).toBeGreaterThan(0);
    }
  });
});

describe("the type axis agrees with the product catalog", () => {
  it("every type filter resolves back to its type", () => {
    for (const type of SYSTEM_TYPE) {
      expect(findTypeByFilter(type.filter)?.type_code).toBe(type.type_code);
    }
  });

  it("every type filter actually matches products, so no tab lands empty", () => {
    for (const type of SYSTEM_TYPE) {
      const match = products.filter((p) => p.category === type.filter);
      expect(match.length).toBeGreaterThan(0);
    }
  });

  it("no product falls outside the type axis", () => {
    // "systems" is a legacy catch-all category with no tab of its own; a product
    // sitting there is unreachable from /products, so flag it.
    const known = new Set(SYSTEM_TYPE.map((t) => t.filter as string));
    for (const product of products) {
      expect(known.has(product.category)).toBe(true);
    }
  });
});

describe("Aug 7: glass is a product line under specialist, not a fourth type", () => {
  it("the type axis still has exactly three members", () => {
    expect(SYSTEM_TYPE).toHaveLength(3);
    expect(SYSTEM_TYPE.map((t) => t.type_code)).toEqual([
      "window",
      "door",
      "specialist",
    ]);
  });

  it("glass-railing is reachable under specialist and is not a new ProductCategory", () => {
    const product = products.find((p) => p.id === "glass-railing");
    expect(product, "glass-railing must exist in the static catalog").toBeDefined();
    expect(product!.category).toBe("specialist");

    // Regression guard: no "glass" peer on the type axis (the 2026-07-05 mistake
    // was a fourth type card; glass stays a product LINE inside specialist).
    for (const type of SYSTEM_TYPE) {
      expect(type.type_code).not.toBe("glass");
      expect(type.filter).not.toBe("glass");
      expect(type.label.toLowerCase()).not.toBe("glass");
    }
  });
});

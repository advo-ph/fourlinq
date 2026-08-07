/**
 * Data integrity tests — catch the kinds of bugs that the 2026-05-29 Tita
 * revision pass surfaced (id/name mismatch, missing video, parochial copy).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { benefits, comparisonData } from "@/data/benefits";

/** Fixed ids from the 2026-08-07 client feedback (LANE_PROMPT / migration 019). */
export const AUG07_PRODUCT_ID = [
  "glass-railing",
  "sc-door",
  "automated-window",
  "louvre",
] as const;

/** Resolve a public `/images/...` path to a file under public/ and check it exists. */
export function publicImageExists(publicPath: string): boolean {
  const relative = publicPath.replace(/^\//, "");
  return existsSync(resolve(process.cwd(), "public", relative));
}

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

  it("every product image resolves to a file on disk", () => {
    for (const p of products) {
      expect(publicImageExists(p.image), `${p.id} image missing: ${p.image}`).toBe(true);
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

describe("Aug 7 product additions (glass-railing, sc-door, automated-window, louvre)", () => {
  const expected: Record<
    (typeof AUG07_PRODUCT_ID)[number],
    { name: string; category: string }
  > = {
    "glass-railing": { name: "Glass Railing", category: "specialist" },
    "sc-door": {
      name: "SC-Door System (Sliding Casement Door)",
      category: "doors",
    },
    "automated-window": { name: "Automated Windows", category: "windows" },
    louvre: { name: "Louvre Windows", category: "windows" },
  };

  it("all four fixed ids exist in the static catalog with the locked names and categories", () => {
    for (const id of AUG07_PRODUCT_ID) {
      const product = products.find((p) => p.id === id);
      expect(product, `missing product id ${id}`).toBeDefined();
      expect(product!.name).toBe(expected[id].name);
      expect(product!.category).toBe(expected[id].category);
    }
  });

  it("each of the four has non-empty description, shortDescription, specs, finishes, glassOptions", () => {
    for (const id of AUG07_PRODUCT_ID) {
      const product = products.find((p) => p.id === id);
      expect(product, `missing product id ${id}`).toBeDefined();
      expect(product!.description.trim().length).toBeGreaterThan(0);
      expect(product!.shortDescription.trim().length).toBeGreaterThan(0);
      expect(product!.specs.length).toBeGreaterThan(0);
      expect(product!.finishes.length).toBeGreaterThan(0);
      expect(product!.glassOptions.length).toBeGreaterThan(0);
      for (const spec of product!.specs) {
        expect(spec.trim().length).toBeGreaterThan(0);
      }
      for (const glass of product!.glassOptions) {
        expect(glass.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("each of the four has an image path that exists on disk", () => {
    for (const id of AUG07_PRODUCT_ID) {
      const product = products.find((p) => p.id === id);
      expect(product, `missing product id ${id}`).toBeDefined();
      expect(product!.image).toMatch(/^\/images\//);
      expect(
        publicImageExists(product!.image),
        `${id} image missing: ${product!.image}`,
      ).toBe(true);
    }
  });

  it("SC-Door copy says Sliding Casement and never glider", () => {
    const product = products.find((p) => p.id === "sc-door");
    expect(product).toBeDefined();
    const copy = `${product!.name} ${product!.description} ${product!.shortDescription} ${product!.specs.join(" ")}`;
    expect(copy).toMatch(/Sliding Casement/i);
    expect(copy.toLowerCase()).not.toContain("glider");
  });
});

describe("migration 019 ↔ static catalog id parity", () => {
  it("seeded product slugs in 019 match the Aug-7 static id set", () => {
    const migrationPath = resolve(
      process.cwd(),
      "server/migrations/019_aug07_product_additions.sql",
    );
    expect(existsSync(migrationPath), "migration 019 file must exist").toBe(true);
    const sql = readFileSync(migrationPath, "utf8");

    // Collect quoted slugs that appear in the VALUES/seed body of product
    // and product_type inserts. Filter to the known Aug-7 fixed ids only —
    // the migration may also reference category slugs (windows/doors/specialist).
    const quoted = [...sql.matchAll(/'([a-z0-9]+(?:-[a-z0-9]+)*)'/g)].map(
      (m) => m[1],
    );
    const seeded = new Set(
      quoted.filter((slug) =>
        (AUG07_PRODUCT_ID as readonly string[]).includes(slug),
      ),
    );
    expect([...seeded].sort()).toEqual([...AUG07_PRODUCT_ID].sort());
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

  it("comparison table has uPVC + Aluminium + Timber columns per row", () => {
    expect(comparisonData.length).toBeGreaterThan(0);
    for (const row of comparisonData) {
      expect(row.feature).toBeTruthy();
      expect(row.upvc).toBeTruthy();
      expect(row.aluminium).toBeTruthy();
      expect(row.timber).toBeTruthy();
    }
  });
});

/**
 * Data integrity tests — catch the kinds of bugs that the 2026-05-29 Tita
 * revision pass surfaced (id/name mismatch, missing video, parochial copy).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
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

/**
 * SQL of the highest-numbered migration that writes a `description` for `slug`.
 * Copy gets revised in later migrations, so the newest one is the authority the
 * static catalog has to agree with. Returns null when no migration sets it.
 */
export function newestMigrationCopyFor(slug: string): string | null {
  const dir = resolve(process.cwd(), "server/migrations");
  const ordered = readdirSync(dir)
    .filter((name) => /^\d+_.*\.sql$/.test(name))
    .sort((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10));

  for (const name of ordered) {
    const sql = readFileSync(resolve(dir, name), "utf8");
    if (sql.includes(`'${slug}'`) && /description/.test(sql)) return sql;
  }
  return null;
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

describe("Aug 8 door-automation split (automated-door)", () => {
  it("automated-door exists under doors, so the door ask is reachable from the doors filter", () => {
    const product = products.find((p) => p.id === "automated-door");
    expect(product, "missing product id automated-door").toBeDefined();
    expect(product!.name).toBe("Automated Door Access");
    // The whole point of the split: /products?filter=doors must surface it.
    expect(product!.category).toBe("doors");
  });

  it("automated-door is fully specified and its schematic exists on disk", () => {
    const product = products.find((p) => p.id === "automated-door")!;
    expect(product.description.trim().length).toBeGreaterThan(0);
    expect(product.shortDescription.trim().length).toBeGreaterThan(0);
    expect(product.specs.length).toBeGreaterThan(0);
    expect(product.finishes.length).toBeGreaterThan(0);
    expect(product.glassOptions.length).toBeGreaterThan(0);
    expect(product.image).toMatch(/^\/images\//);
    expect(
      publicImageExists(product.image),
      `automated-door image missing: ${product.image}`,
    ).toBe(true);
  });

  it("automated-window no longer claims door scope", () => {
    // Regression guard for the gap this split closes: one product answering two
    // asks meant the door half was filed under windows and unreachable from
    // /products?filter=doors.
    const window = products.find((p) => p.id === "automated-window")!;
    expect(window.category).toBe("windows");
    const copy = `${window.description} ${window.shortDescription} ${window.specs.join(" ")}`;

    // It must not OFFER door automation as its own scope — that was the 019
    // phrasing ("...automation for operable windows and compatible door
    // leaves") that made this one product answer two asks.
    expect(copy).not.toMatch(/and compatible door leaves/i);
    expect(copy).not.toMatch(/Digital access options for/i);

    // It MAY mention digital access — but only as a pointer to the door
    // product, never as a bare claim. If the phrase appears, the pointer must
    // appear with it.
    if (/digital access/i.test(copy)) {
      expect(copy).toMatch(/separate product/i);
      expect(copy).toMatch(/Automated Door Access/);
    }
  });

  it("each door-category ask has a product a doors shopper can actually reach", () => {
    const doorProduct = products.filter((p) => p.category === "doors");
    expect(doorProduct.some((p) => p.id === "automated-door")).toBe(true);
    expect(doorProduct.some((p) => p.id === "sc-door")).toBe(true);
  });
});

describe("migration ↔ static catalog parity", () => {
  it("020 seeds automated-door and narrows automated-window", () => {
    const migrationPath = resolve(
      process.cwd(),
      "server/migrations/020_automated_door_split.sql",
    );
    expect(existsSync(migrationPath), "migration 020 file must exist").toBe(true);
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("'automated-door'");
    expect(sql).toMatch(/UPDATE product/);
    expect(sql).toContain("'automated-window'");
    // Same no-DELETE discipline as 019 — withdrawal is is_active = false in a
    // later migration, never a DELETE here (the 017 failure mode).
    expect(sql).not.toMatch(/\bDELETE\b/i);
    expect(sql).not.toMatch(/\bDROP\b/i);
  });

  it.each(["automated-door", "automated-window"])(
    "the static copy for %s matches the newest migration that sets it",
    (slug) => {
      // Static catalog is the fallback when /api/products errors, so a drift
      // between the two ships two different products under one id. Copy gets
      // revised, so the authority is the HIGHEST-numbered migration that writes
      // a description for the slug, not one hard-coded file.
      const sql = newestMigrationCopyFor(slug);
      expect(sql, `no migration writes a description for ${slug}`).not.toBeNull();
      const product = products.find((p) => p.id === slug)!;
      expect(sql).toContain(product.description);
      expect(sql).toContain(product.shortDescription);
    },
  );
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

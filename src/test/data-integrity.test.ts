/**
 * Data integrity tests — catch the kinds of bugs that the 2026-05-29 Tita
 * revision pass surfaced (id/name mismatch, missing video, parochial copy).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { getSystemAnimation } from "@/data/systemAnimations";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { benefits, comparisonData } from "@/data/benefits";

/**
 * Fixed ids from the 2026-08-07 client feedback (LANE_PROMPT / migration 019).
 * 2026-08-16: sc-door removed from catalog per client instruction; replaced by
 * sliding-casement-door which inherits its assets and takes its catalog slot.
 */
export const AUG07_PRODUCT_ID = [
  "glass-railing",
  "sliding-casement-door",
  "automated-window",
  "louvre",
] as const;

/** Resolve a public `/images/...` path to a file under public/ and check it exists. */
export function publicImageExists(publicPath: string): boolean {
  const relative = publicPath.replace(/^\//, "");
  return existsSync(resolve(process.cwd(), "public", relative));
}

/**
 * SQL of the newest statement that writes a `description` for `slug`.
 *
 * Copy gets revised in later migrations, so the highest-numbered write is the
 * authority the static catalog has to agree with. Scoped to a single statement,
 * not the whole file: a later migration may touch the same slug for an
 * unrelated reason (023 repoints thumbnail_url and nothing else), and a
 * file-wide match would treat that as the copy authority and fail every
 * product it names. Returns null when no migration writes one.
 */
export function newestMigrationCopyFor(slug: string): string | null {
  const dir = resolve(process.cwd(), "server/migrations");
  const ordered = readdirSync(dir)
    .filter((name) => /^\d+_.*\.sql$/.test(name))
    .sort((a, b) => Number.parseInt(b, 10) - Number.parseInt(a, 10));

  for (const name of ordered) {
    const sql = readFileSync(resolve(dir, name), "utf8");
    // Split on statement-terminating semicolons only. Product copy contains
    // mid-sentence semicolons ("...blades; project consultation..."), and a
    // naive split on ";" would cut a description in half.
    const statement = sql.split(/;\s*\r?\n/);
    const writesCopy = statement.find(
      (s) => s.includes(`'${slug}'`) && /\bdescription\b/.test(s),
    );
    if (writesCopy) return writesCopy;
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

describe("Aug 7 product additions (glass-railing, sliding-casement-door, automated-window, louvre)", () => {
  const expected: Record<
    (typeof AUG07_PRODUCT_ID)[number],
    { name: string; category: string }
  > = {
    "glass-railing": { name: "Glass Railing", category: "specialist" },
    "sliding-casement-door": {
      name: "Sliding Casement Door",
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

  it("Sliding Casement Door copy mentions casement and never glider", () => {
    // 2026-08-16: sc-door replaced by sliding-casement-door. The original guard
    // required "Sliding Casement" in the copy — the new product name is itself
    // "Sliding Casement Door", so that requirement is met by the name alone.
    // Guard: copy must contain "casement" and must not claim it is a glider.
    const product = products.find((p) => p.id === "sliding-casement-door");
    expect(product).toBeDefined();
    const copy = `${product!.name} ${product!.description} ${product!.shortDescription} ${product!.specs.join(" ")}`;
    expect(copy).toMatch(/casement/i);
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
    // 2026-08-16: sc-door removed; sliding-casement-door takes its slot.
    expect(doorProduct.some((p) => p.id === "sliding-casement-door")).toBe(true);
    // Guard that the removed sc-door id is no longer present.
    expect(doorProduct.some((p) => p.id === "sc-door")).toBe(false);
  });
});

describe("Aug 12 door additions (fixed-slide-door, slim-door)", () => {
  const NEW_DOOR = ["fixed-slide-door", "slim-door"] as const;

  it.each(NEW_DOOR)(
    "%s is reachable from the doors filter, which is the whole point of carding it",
    (id) => {
      // fixed-slide-door existed only as a design-tool layout and slim-door not
      // at all, so neither was findable by someone browsing /products.
      const product = products.find((p) => p.id === id);
      expect(product, `missing product id ${id}`).toBeDefined();
      expect(product!.category).toBe("doors");
    },
  );

  it.each(NEW_DOOR)("%s is fully specified with an image on disk", (id) => {
    const product = products.find((p) => p.id === id)!;
    expect(product.description.trim().length).toBeGreaterThan(0);
    expect(product.shortDescription.trim().length).toBeGreaterThan(0);
    expect(product.specs.length).toBeGreaterThan(0);
    expect(product.finishes.length).toBeGreaterThan(0);
    expect(product.glassOptions.length).toBeGreaterThan(0);
    expect(publicImageExists(product.image), `${id} image missing: ${product.image}`).toBe(
      true,
    );
  });

  it("fixed-slide-door describes the six-panel layout the client named", () => {
    const product = products.find((p) => p.id === "fixed-slide-door")!;
    const copy = `${product.description} ${product.specs.join(" ")}`.toLowerCase();
    expect(copy).toContain("six panels");
    expect(copy).toMatch(/four slid/);
  });

  it("fixed-slide-door quotes no opening width", () => {
    // The 9 m default in the handoff geometry is our engineering choice, not a
    // confirmed product spec. A width on the card is the site promising a size
    // nobody with product authority signed off (MEETING_2026-08-12 §6).
    const product = products.find((p) => p.id === "fixed-slide-door")!;
    const copy = `${product.description} ${product.shortDescription} ${product.specs.join(" ")}`;
    expect(copy).not.toMatch(/\d+\s*(m|mm|metre|meter|ft|foot|feet)\b/i);
  });

  it("slim-door commits to swinging, and offers only glass the catalog carries", () => {
    // The image the client supplied on 2026-08-12 settled the swing-or-slide
    // question MEETING_2026-08-12 §8 left open. Guard against it drifting back
    // to a sliding claim.
    const product = products.find((p) => p.id === "slim-door")!;
    const copy = `${product.description} ${product.specs.join(" ")}`;
    expect(copy).toMatch(/swing/i);
    expect(copy).not.toMatch(/slid(e|ing)/i);

    // Reeded glass shows in the render but is not a FourlinQ glass option, so
    // the copy must not sell it.
    expect(copy).not.toMatch(/reeded|fluted|ribbed/i);
  });

  it.each(["automated-window", "automated-door", "fixed-slide-door", "slim-door"])(
    "%s points at an approved render, not a schematic stand-in",
    (id) => {
      const product = products.find((p) => p.id === id)!;
      expect(product.image).toMatch(/^\/images\/products\/render\//);
      expect(publicImageExists(product.image), `${id} image missing`).toBe(true);
    },
  );
});

describe("hover animations resolve to frames on disk", () => {
  // A system registered in systemAnimations.ts with no frames behind it fails
  // silently: the card renders, hover reveals a broken <img>, and nothing in
  // the build complains. Cheap to guard, so guard it.
  //
  // 2026-08-16: reconciled against the actual systemAnimations.ts ANIMATED map.
  // Added: louvre, automated-window (both registered + 28 frames on disk).
  // Added: sliding-casement-door (renamed from sc-door, assets git-mv'd).
  // Removed: slim-door — it has only 25 frames on disk (not 28) and is NOT
  //   registered in systemAnimations.ts ANIMATED map. Leaving it out rather
  //   than silently masking the drift. Reported as outstanding: slim-door needs
  //   either registration in systemAnimations.ts (with correct FRAME_COUNT) or
  //   the frames trimmed/completed to 28. See bake-system-anim.mjs.
  const ANIMATED_ID = [
    "casement",
    "sliding",
    "awning",
    "sliding-door",
    "slide-and-fold",
    "casement-door",
    "french-door",
    "large-panel-doors",
    "lift-and-slide",
    "90-series",
    "louvre",
    "automated-window",
    "sliding-casement-door",
    "automated-door",
  ] as const;

  it.each(ANIMATED_ID)("%s has every frame it claims", (id) => {
    const anim = getSystemAnimation(id);
    expect(anim, `${id} is not registered in systemAnimations.ts`).not.toBeNull();
    for (const frame of anim!.frames) {
      expect(publicImageExists(frame), `${id} missing frame: ${frame}`).toBe(true);
    }
  });

  it("every animated id is a real product id", () => {
    const productId = new Set(products.map((p) => p.id));
    for (const id of ANIMATED_ID) {
      expect(productId.has(id), `${id} animates but is not a product`).toBe(true);
    }
  });

  it("the first frame is the one the resting image crossfades into", () => {
    // SystemCardMedia fades the frame layer over the resting <img>, so the
    // first frame in the returned array must exist on disk for every animated
    // product or the reveal starts on a gap.
    //
    // For most systems the array is 01→28 (closed→open) and frames[0] is 01.
    // For REVERSED systems (automated-window) the array is 28→01 (open→closed)
    // so frames[0] is 28 — that is the resting pose that matches the card still,
    // and SystemCardMedia handles it correctly. We skip the /01\.webp$/ check
    // for those: what matters is that frames[0] exists, not which frame it is.
    const REVERSED_IDS = new Set(["automated-window"]);
    for (const id of ANIMATED_ID) {
      const frames = getSystemAnimation(id)!.frames;
      if (!REVERSED_IDS.has(id)) {
        expect(frames[0]).toMatch(/\/01\.webp$/);
      }
      expect(publicImageExists(frames[0])).toBe(true);
    }
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

  it("023 seeds the two new doors and repoints the automation renders", () => {
    const migrationPath = resolve(
      process.cwd(),
      "server/migrations/023_fixed_slide_and_slim_door.sql",
    );
    expect(existsSync(migrationPath), "migration 023 file must exist").toBe(true);
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("'fixed-slide-door'");
    expect(sql).toContain("'slim-door'");
    expect(sql).toContain("/images/products/render/automated-window.webp");
    expect(sql).toContain("/images/products/render/automated-door.webp");
    // Same no-DELETE discipline as 019/020/022 — withdrawal is is_active =
    // false in a later migration, never a DELETE here (the 017 failure mode).
    expect(sql).not.toMatch(/\bDELETE\b/i);
    expect(sql).not.toMatch(/\bDROP\b/i);
  });

  it.each([
    "automated-door",
    "automated-window",
    "fixed-slide-door",
    "slim-door",
  ])(
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
  // Migration 019 seeded the original Aug-7 slugs. One of them (sc-door) has
  // since been superseded by sliding-casement-door (client instruction
  // 2026-08-16, migration 027). AUG07_PRODUCT_ID now tracks the CURRENT live
  // ids. This test checks 019 against the original seeded set, which includes
  // sc-door rather than sliding-casement-door.
  const AUG07_SEEDED_IN_019 = [
    "glass-railing",
    "sc-door",
    "automated-window",
    "louvre",
  ] as const;

  it("seeded product slugs in 019 match the original Aug-7 seed set", () => {
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
        (AUG07_SEEDED_IN_019 as readonly string[]).includes(slug),
      ),
    );
    expect([...seeded].sort()).toEqual([...AUG07_SEEDED_IN_019].sort());
  });

  it("migration 027 introduces sliding-casement-door and retires sc-door", () => {
    // Migration 027 supersedes 019/024/025/026 for the sc-door slug. It must
    // seed sliding-casement-door and deactivate sc-door (no-DELETE discipline).
    const migrationPath = resolve(
      process.cwd(),
      "server/migrations/027_sliding_casement_door.sql",
    );
    expect(existsSync(migrationPath), "migration 027 file must exist").toBe(true);
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain("'sliding-casement-door'");
    expect(sql).toContain("'sc-door'");
    // No-DELETE discipline: sc-door must be deactivated, not deleted.
    expect(sql).toMatch(/is_active\s*=\s*false/);
    // Check for SQL DELETE/DROP statements only (not the word in comments).
    // Strip SQL comments before checking so "--no-DELETE discipline" prose
    // does not trip the guard (same pattern as migration 020/023 tests above).
    const sqlNoComments = sql.replace(/--[^\n]*/g, "");
    expect(sqlNoComments).not.toMatch(/\bDELETE\b/i);
    expect(sqlNoComments).not.toMatch(/\bDROP\b/i);

    // --- Structural schema-correctness checks ---
    // These would have caught the three fatal defects in the original 027 file.

    // 1. product_type INSERT must supply product_category_id (NOT NULL FK).
    //    The correct pattern resolves it via a JOIN on product_category, not
    //    by deriving from an existing row (which silently no-ops when sc-door
    //    is absent). Verify the INSERT INTO product_type block references
    //    product_category_id as a target column.
    expect(
      sqlNoComments,
      "product_type INSERT must supply product_category_id (NOT NULL column)",
    ).toMatch(
      /INSERT\s+INTO\s+product_type\s*\([^)]*product_category_id[^)]*\)/i,
    );

    // 2. product INSERT must supply product_type_id (NOT NULL FK).
    //    Without it the INSERT fails with a not-null violation.
    expect(
      sqlNoComments,
      "product INSERT must supply product_type_id (NOT NULL column)",
    ).toMatch(/INSERT\s+INTO\s+product\s*\([^)]*product_type_id[^)]*\)/i);

    // 3. product INSERT must NOT write to a column called category_slug.
    //    category_slug is a VALUES alias used only in the JOIN in migration 019
    //    and does not exist as a real column on the product table.
    expect(
      sqlNoComments,
      "product INSERT must not reference category_slug (not a real column)",
    ).not.toMatch(/INSERT\s+INTO\s+product\s*\([^)]*category_slug[^)]*\)/i);

    // 4. product INSERT must supply finish_labels and glass_labels (text[]).
    //    Without them /api/products returns the new product with zero finishes
    //    and zero glass options, diverging from the static catalog.
    expect(
      sqlNoComments,
      "product INSERT must supply finish_labels",
    ).toMatch(/INSERT\s+INTO\s+product\s*\([^)]*finish_labels[^)]*\)/i);
    expect(
      sqlNoComments,
      "product INSERT must supply glass_labels",
    ).toMatch(/INSERT\s+INTO\s+product\s*\([^)]*glass_labels[^)]*\)/i);

    // 5. Both finish_labels and glass_labels must be populated with literal
    //    array values (not NULL or empty). Check the canonical finish labels
    //    from FRAME_FINISHES are present in the file body.
    const EXPECTED_FINISH_LABELS = [
      "Oak Light", "Oak Malt", "Jet Black", "Charcoal Gray",
      "Matte Quartz", "Silica Cream", "Black Wood", "Gray Wood",
      "Dark Oak", "Walnut", "Golden Oak", "White",
    ];
    for (const label of EXPECTED_FINISH_LABELS) {
      expect(
        sql,
        `finish_labels must include '${label}'`,
      ).toContain(label);
    }
    const EXPECTED_GLASS_LABELS = [
      "Clear Float", "Frosted Privacy", "Low-E Coated", "Laminated Safety",
    ];
    for (const label of EXPECTED_GLASS_LABELS) {
      expect(
        sql,
        `glass_labels must include '${label}'`,
      ).toContain(label);
    }
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

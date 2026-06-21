/**
 * Non-destructive sync of product display content (name, thumbnail, copy) from
 * src/data/products.ts into the live `product` table, keyed by slug.
 *
 * Why this exists separately from seed-products.ts:
 *   seed-products.ts DELETEs every product row and reinserts. That wipes the
 *   CMS-editable text[] columns (spec_labels / finish_labels / glass_labels)
 *   Tita fills in via the admin UI. When we only need to push refreshed images,
 *   renamed products, or updated marketing copy, a destructive reseed is the
 *   wrong tool. This script UPDATEs in place and touches ONLY:
 *     - name
 *     - thumbnail_url   (the system images)
 *     - description
 *     - short_description
 *   Everything else (specs/finishes/glass labels, sort_order, featured flags,
 *   join tables) is left exactly as-is.
 *
 * Idempotent: safe to re-run. Reports any static slug with no DB row, and any
 * DB row left untouched.
 *
 * Apply on the VPS:
 *   ssh advo
 *   cd /opt/fourlinq && export $(grep -v "^#" .env | xargs) && npx tsx server/scripts/sync-product-content.ts
 */
import pool from "../db.js";
import { products as staticProducts } from "../../src/data/products.js";

async function sync() {
  console.log(`[sync-product-content] Syncing ${staticProducts.length} products by slug...`);

  let updated = 0;
  const unchanged = 0;
  const missing: string[] = [];

  for (const p of staticProducts) {
    const { rowCount } = await pool.query(
      `UPDATE product
         SET name = $2,
             thumbnail_url = $3,
             description = $4,
             short_description = $5
       WHERE slug = $1`,
      [p.id, p.name, p.image, p.description, p.shortDescription],
    );

    if (!rowCount) {
      missing.push(p.id);
      console.warn(`[sync-product-content] NO ROW for slug "${p.id}" — skipped.`);
      continue;
    }

    updated++;
    console.log(`[sync-product-content] synced ${p.id} → "${p.name}" (${p.image})`);
  }

  // Surface any active DB products the static catalog does not cover, so we
  // notice drift in the other direction (a CMS-only product, a stale row).
  const { rows: orphanRows } = await pool.query(
    `SELECT slug FROM product WHERE is_active = true AND deleted_at IS NULL`,
  );
  const staticSlugs = new Set(staticProducts.map((p) => p.id));
  const orphans = orphanRows.map((r) => r.slug).filter((s) => !staticSlugs.has(s));

  console.log(`\n[sync-product-content] Done.`);
  console.log(`  Updated: ${updated}/${staticProducts.length}`);
  if (unchanged) console.log(`  Unchanged: ${unchanged}`);
  if (missing.length) console.log(`  Static slugs with no DB row: ${missing.join(", ")}`);
  if (orphans.length) console.log(`  Active DB products not in static catalog: ${orphans.join(", ")}`);

  await pool.end();
}

sync().catch((err) => {
  console.error("[sync-product-content] FAILED:", err);
  process.exit(1);
});

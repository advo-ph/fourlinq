/**
 * Cuts over the DB product catalog to match src/data/products.ts.
 *
 * Why: the existing migration-002 seed had 8 marketing-named products
 * ("Casement 70 Series" etc). The static catalog Tita approved has 14
 * brochure-aligned products ("Casement"). This script truncates the old
 * rows and reseeds from the static array so the DB can become the source
 * of truth without changing what /products renders.
 *
 * Idempotent: safe to re-run.
 *
 * Apply on the VPS (after migration 009):
 *   ssh advo
 *   cd /opt/fourlinq && export $(grep -v "^#" .env | xargs) && npx tsx server/scripts/seed-products.ts
 *
 * After this runs successfully, flip USE_API=true in src/hooks/useProducts.ts.
 */
import pool from "../db.js";
import { products as staticProducts } from "../../src/data/products.js";

const ORGANIZATION_ID = 1;

async function findProductTypeId(slug: string): Promise<number | null> {
  const { rows } = await pool.query(
    `SELECT product_type_id FROM product_type WHERE organization_id = $1 AND slug = $2`,
    [ORGANIZATION_ID, slug],
  );
  return rows[0]?.product_type_id ?? null;
}

async function findFinishId(label: string): Promise<number | null> {
  // FRAME_FINISHES labels (e.g. "Walnut") map to finish.name; finish.slug uses
  // a kebab-case form (e.g. "walnut"). Match on name first, fall back to slug.
  const { rows } = await pool.query(
    `SELECT finish_id FROM finish WHERE organization_id = $1 AND (LOWER(name) = LOWER($2) OR slug = $3)`,
    [ORGANIZATION_ID, label, label.toLowerCase().replace(/\s+/g, "-")],
  );
  return rows[0]?.finish_id ?? null;
}

async function findGlassTypeId(label: string): Promise<number | null> {
  const { rows } = await pool.query(
    `SELECT glass_type_id FROM glass_type WHERE organization_id = $1 AND LOWER(name) = LOWER($2)`,
    [ORGANIZATION_ID, label],
  );
  return rows[0]?.glass_type_id ?? null;
}

async function reseed() {
  console.log(`[seed-products] Truncating product / product_feature / product_finish / product_glass...`);
  await pool.query(`TRUNCATE product_feature, product_finish, product_glass, product RESTART IDENTITY CASCADE`);

  let inserted = 0;
  let skippedTypes = 0;
  let unknownFinishes = new Set<string>();
  let unknownGlass = new Set<string>();

  for (const [idx, p] of staticProducts.entries()) {
    const productTypeId = await findProductTypeId(p.id);
    if (!productTypeId) {
      console.warn(`[seed-products] SKIP "${p.id}" — no matching product_type slug. Run migration 009 first?`);
      skippedTypes++;
      continue;
    }

    const { rows } = await pool.query(
      `INSERT INTO product
         (organization_id, product_type_id, name, slug, short_description, description,
          thumbnail_url, is_active, is_featured, youtube_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, $10)
       RETURNING product_id`,
      [
        ORGANIZATION_ID, productTypeId, p.name, p.id,
        p.shortDescription, p.description, p.image,
        idx < 4, // first four featured
        p.youtubeId ?? null,
        idx + 1,
      ],
    );
    const productId = rows[0].product_id;

    // Specs → product_feature
    for (const [i, spec] of p.specs.entries()) {
      await pool.query(
        `INSERT INTO product_feature (product_id, feature_type, label, sort_order)
         VALUES ($1, 'spec', $2, $3)`,
        [productId, spec, i],
      );
    }

    // Finishes → product_finish (lookup by label)
    for (const f of p.finishes) {
      const finishId = await findFinishId(f.name);
      if (!finishId) {
        unknownFinishes.add(f.name);
        continue;
      }
      await pool.query(
        `INSERT INTO product_finish (product_id, finish_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [productId, finishId],
      );
    }

    // Glass options → product_glass (lookup by label)
    for (const g of p.glassOptions) {
      const glassId = await findGlassTypeId(g);
      if (!glassId) {
        unknownGlass.add(g);
        continue;
      }
      await pool.query(
        `INSERT INTO product_glass (product_id, glass_type_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [productId, glassId],
      );
    }

    inserted++;
    console.log(`[seed-products] inserted ${p.id} (${p.name})`);
  }

  console.log(`\n[seed-products] Done.`);
  console.log(`  Inserted: ${inserted}/${staticProducts.length}`);
  if (skippedTypes) console.log(`  Skipped (missing product_type): ${skippedTypes}`);
  if (unknownFinishes.size) console.log(`  Unknown finish labels: ${[...unknownFinishes].join(", ")}`);
  if (unknownGlass.size) console.log(`  Unknown glass labels: ${[...unknownGlass].join(", ")}`);

  await pool.end();
}

reseed().catch((err) => {
  console.error("[seed-products] FAILED:", err);
  process.exit(1);
});

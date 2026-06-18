/**
 * Surgically removes em dashes (—) from the CMS-editable text[] label columns
 * on the live `product` table: spec_labels, finish_labels, glass_labels.
 *
 * Why this exists separately from sync-product-content.ts:
 *   sync-product-content.ts pushes name/thumbnail/description/short_description
 *   from src/data/products.ts but intentionally leaves the editable label
 *   columns alone (those are Tita's CMS edits). The product descriptions are
 *   handled by that sync. This script handles the bullet labels WITHOUT
 *   clobbering CMS content: it only rewrites the em dashes inside each label,
 *   leaving every other character — and any other label Tita added — untouched.
 *
 *   "EPDM gaskets — weatherproof seal"  ->  "EPDM gaskets, weatherproof seal"
 *
 * Idempotent: re-running after the dashes are gone updates nothing.
 *
 * Apply on the VPS (run AFTER sync-product-content.ts so descriptions are fresh too):
 *   ssh advo
 *   cd /opt/fourlinq && export $(grep -v "^#" .env | xargs) && npx tsx server/scripts/fix-label-dashes.ts
 */
import pool from "../db.js";

const LABEL_COLUMNS = ["spec_labels", "finish_labels", "glass_labels"] as const;

// " — " acts as a comma-like separator in every affected label, so collapse the
// padded form to ", " first, then catch any bare "—" left over.
function deDash(label: string): string {
  return label.replace(/\s*—\s*/g, ", ");
}

async function fix() {
  console.log("[fix-label-dashes] Scanning product label columns for em dashes...");

  let changedRows = 0;

  for (const column of LABEL_COLUMNS) {
    const { rows } = await pool.query(
      `SELECT product_id, slug, ${column} AS labels
         FROM product
        WHERE ${column} IS NOT NULL
          AND EXISTS (SELECT 1 FROM unnest(${column}) elem WHERE elem LIKE '%—%')`,
    );

    for (const row of rows) {
      const fixed: string[] = (row.labels as string[]).map(deDash);
      await pool.query(
        `UPDATE product SET ${column} = $2 WHERE product_id = $1`,
        [row.product_id, fixed],
      );
      changedRows++;
      console.log(`[fix-label-dashes] ${row.slug}.${column}: ${fixed.length} labels rewritten`);
    }
  }

  console.log(`\n[fix-label-dashes] Done. ${changedRows} (row, column) pairs updated.`);
  await pool.end();
}

fix().catch((err) => {
  console.error("[fix-label-dashes] FAILED:", err);
  process.exit(1);
});

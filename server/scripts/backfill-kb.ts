/**
 * One-off KB backfill for entities whose rows were seeded by SQL migration
 * (so no admin mutation ever triggered a syncEntity call): aluminium
 * (migration 010) and document (migration 013). Idempotent — syncEntity
 * upserts by source_url, so re-running just refreshes the chunks.
 *
 * Run: npx tsx server/scripts/backfill-kb.ts
 */
import pool from "../db.js";
import { kb } from "../cms-config.js";

async function backfill(kind: string, table: string, pk: string) {
  const { rows } = await pool.query(`SELECT ${pk} AS id FROM ${table} WHERE deleted_at IS NULL`);
  for (const r of rows) {
    await kb.syncEntity(kind, Number(r.id));
    console.log(`synced ${kind} #${r.id}`);
  }
}

await backfill("aluminium", "cms_aluminium_system", "cms_aluminium_system_id");
await backfill("document", "cms_document", "cms_document_id");
await pool.end();
console.log("done");

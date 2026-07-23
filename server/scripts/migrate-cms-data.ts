/**
 * Migrates hardcoded src/data/projects.ts + src/data/whats-new.ts into the
 * new cms_project, cms_news_post, cms_media_asset tables.
 *
 * Idempotent: upserts by slug. Safe to re-run.
 *
 * Run: npx tsx server/scripts/migrate-cms-data.ts
 */
import dotenv from "dotenv";
dotenv.config();

import pool from "../db.js";
import { projects as PROJECTS } from "../../src/data/projects.js";
import { whatsNew as NEWS } from "../../src/data/whats-new.js";

const ORG_ID = 1;

async function ensureMediaAsset(filePath: string, alt: string | null, source: string): Promise<number> {
  const existing = await pool.query(
    `SELECT cms_media_asset_id FROM cms_media_asset WHERE file_path = $1 AND organization_id = $2`,
    [filePath, ORG_ID]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    return Number(existing.rows[0].cms_media_asset_id);
  }
  const ins = await pool.query(
    `INSERT INTO cms_media_asset (organization_id, file_path, alt_text, source)
     VALUES ($1, $2, $3, $4) RETURNING cms_media_asset_id`,
    [ORG_ID, filePath, alt, source]
  );
  return Number(ins.rows[0].cms_media_asset_id);
}

async function migrateProjects() {
  let inserted = 0, updated = 0;
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    const coverId = await ensureMediaAsset(p.image, p.name, "fb-scrape");
    if (p.gallery) {
      for (const g of p.gallery) await ensureMediaAsset(g, p.name, "fb-scrape");
    }

    const existing = await pool.query(
      `SELECT cms_project_id FROM cms_project WHERE slug = $1`,
      [p.id]
    );
    const params = [
      ORG_ID, p.id, p.name, p.location, p.category,
      p.caption ?? null, p.description ?? null,
      coverId, p.image,
      p.gallery ?? [],
      p.architect ?? null,
      p.quote?.text ?? null, p.quote?.attribution ?? null,
      p.year ?? null,
      p.systemsUsed ?? [],
      i,
    ];
    if (existing.rowCount && existing.rowCount > 0) {
      await pool.query(
        `UPDATE cms_project SET
           title=$3, location=$4, category=$5, caption=$6, description=$7,
           cover_asset_id=$8, cover_path=$9, gallery_paths=$10,
           architect=$11, quote_text=$12, quote_attribution=$13,
           project_year=$14, systems_used=$15, display_order=$16
         WHERE organization_id=$1 AND slug=$2`,
        params
      );
      updated++;
    } else {
      await pool.query(
        `INSERT INTO cms_project
          (organization_id, slug, title, location, category, caption, description,
           cover_asset_id, cover_path, gallery_paths,
           architect, quote_text, quote_attribution,
           project_year, systems_used, display_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        params
      );
      inserted++;
    }
  }
  console.log(`📦 cms_project: ${inserted} inserted, ${updated} updated (${PROJECTS.length} total)`);

  // Prune stale rows: delete cms_project rows in this org whose slug no longer
  // exists in the source data. project_image_override.project_id is a plain TEXT
  // column with no FK to cms_project, so no dependent-row cleanup is required.
  const sourceSlugs = PROJECTS.map((p) => p.id);
  const pruned = await pool.query(
    `DELETE FROM cms_project
     WHERE organization_id = $1
       AND slug <> ALL($2::text[])
     RETURNING slug`,
    [ORG_ID, sourceSlugs]
  );
  if (pruned.rowCount && pruned.rowCount > 0) {
    const slugList = pruned.rows.map((r: { slug: string }) => r.slug).join(", ");
    console.log(`🗑 cms_project: pruned ${pruned.rowCount} stale row(s) (${slugList})`);
  }
}

async function migrateNews() {
  let inserted = 0, updated = 0;
  for (const n of NEWS) {
    const coverId = await ensureMediaAsset(n.image, n.title, "fb-scrape");
    const existing = await pool.query(
      `SELECT cms_news_post_id FROM cms_news_post WHERE slug = $1`,
      [n.id]
    );
    const publishedAt = new Date(n.date);
    const isInternal = n.link?.startsWith("/") ?? false;
    const params = [
      ORG_ID, n.id, n.title, n.excerpt, null, n.category,
      coverId, n.image,
      isInternal ? null : n.link ?? null,
      isInternal ? n.link ?? null : null,
      publishedAt,
    ];
    if (existing.rowCount && existing.rowCount > 0) {
      await pool.query(
        `UPDATE cms_news_post SET
           title=$3, excerpt=$4, body=$5, category=$6,
           cover_asset_id=$7, cover_path=$8,
           external_link=$9, internal_link=$10, published_at=$11
         WHERE organization_id=$1 AND slug=$2`,
        params
      );
      updated++;
    } else {
      await pool.query(
        `INSERT INTO cms_news_post
          (organization_id, slug, title, excerpt, body, category,
           cover_asset_id, cover_path, external_link, internal_link, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        params
      );
      inserted++;
    }
  }
  console.log(`📰 cms_news_post: ${inserted} inserted, ${updated} updated (${NEWS.length} total)`);
}

async function main() {
  await migrateProjects();
  await migrateNews();
  const counts = await pool.query(
    `SELECT 'cms_project' AS t, count(*)::int FROM cms_project
     UNION ALL SELECT 'cms_news_post', count(*)::int FROM cms_news_post
     UNION ALL SELECT 'cms_media_asset', count(*)::int FROM cms_media_asset`
  );
  console.log("📊 Totals:", counts.rows.map((r) => `${r.t}=${r.count}`).join(", "));
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

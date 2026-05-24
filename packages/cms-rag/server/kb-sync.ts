/**
 * Generic CMS-row → knowledge_chunk synchronizer.
 *
 * Each consumer registers an EntityKbAdapter that maps one of their CMS rows
 * into a normalized chunk (title + content + tags + sourceUrl). The sync
 * function reads the row by id, runs the adapter, upserts the chunk, and
 * (best-effort) re-embeds inline so the chatbot is fresh after every save.
 *
 * Source URL convention: `{scheme}://{kind}/{id}`. The scheme is configurable
 * per consumer (default `cms`).
 */
import type { Pool } from "pg";
import type { Embedder } from "./embed.js";

export interface CmsChunk {
  title: string;
  content: string;
  contentType: string;
  tags: string[];
  sourceUrl: string;
}

export interface EntityKbAdapter<TRow = Record<string, unknown>> {
  /** Logical name (e.g. "project", "news", "page"). Used in source_url scheme. */
  kind: string;
  /** Returns the row from the consumer's table by id, or null if missing/deleted. */
  loadById: (pool: Pool, id: number) => Promise<TRow | null>;
  /** True if this row should be removed from the KB (deleted or unpublished). */
  isInactive?: (row: TRow) => boolean;
  /** Build the chunk to upsert. */
  toChunk: (row: TRow, id: number) => CmsChunk;
}

export interface KbSyncConfig {
  pool: Pool;
  embedder?: Embedder;
  /** Knowledge base name to upsert chunks into. */
  kbName: string;
  /** Description used when creating the KB row. */
  kbDescription?: string;
  /** organization_id for the consumer's tenant. */
  organizationId: number;
  /** kb_type field. */
  kbType?: string;
  /** Adapters, indexed by kind. */
  adapters: Record<string, EntityKbAdapter>;
}

export function createKbSync(config: KbSyncConfig) {
  const { pool, embedder, kbName, kbDescription, organizationId, kbType, adapters } = config;

  async function getOrCreateKbId(): Promise<number> {
    const existing = await pool.query(
      `SELECT knowledge_base_id FROM knowledge_base WHERE name = $1 LIMIT 1`,
      [kbName],
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return Number(existing.rows[0].knowledge_base_id);
    }
    const ins = await pool.query(
      `INSERT INTO knowledge_base (organization_id, name, description, kb_type)
       VALUES ($1, $2, $3, $4) RETURNING knowledge_base_id`,
      [organizationId, kbName, kbDescription ?? null, kbType ?? "educational"],
    );
    return Number(ins.rows[0].knowledge_base_id);
  }

  async function upsertChunk(kbId: number, c: CmsChunk): Promise<void> {
    const existing = await pool.query(
      `SELECT knowledge_chunk_id FROM knowledge_chunk WHERE source_url = $1 LIMIT 1`,
      [c.sourceUrl],
    );
    let chunkId: number;
    if (existing.rowCount && existing.rowCount > 0) {
      chunkId = Number(existing.rows[0].knowledge_chunk_id);
      await pool.query(
        `UPDATE knowledge_chunk
         SET title=$1, content=$2, content_type=$3, tags=$4,
             embedding=NULL, updated_at=NOW(), is_active=true
         WHERE knowledge_chunk_id=$5`,
        [c.title, c.content, c.contentType, c.tags, chunkId],
      );
    } else {
      const ins = await pool.query(
        `INSERT INTO knowledge_chunk
          (knowledge_base_id, title, content, content_type, tags, source_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING knowledge_chunk_id`,
        [kbId, c.title, c.content, c.contentType, c.tags, c.sourceUrl],
      );
      chunkId = Number(ins.rows[0].knowledge_chunk_id);
    }
    if (embedder) {
      try {
        const vec = await embedder(`${c.title}\n\n${c.content}`);
        await pool.query(
          `UPDATE knowledge_chunk SET embedding = $1::vector WHERE knowledge_chunk_id = $2`,
          [`[${vec.join(",")}]`, chunkId],
        );
      } catch (e) {
        console.warn(`KB embed deferred for chunk ${chunkId}: ${String(e).slice(0, 80)}`);
      }
    }
  }

  async function syncEntity(kind: string, id: number): Promise<void> {
    const adapter = adapters[kind];
    if (!adapter) throw new Error(`No KB adapter registered for kind="${kind}"`);
    const row = await adapter.loadById(pool, id);
    const sourceUrl = `cms://${kind}/${id}`;
    if (!row || adapter.isInactive?.(row)) {
      await pool.query(
        `UPDATE knowledge_chunk SET is_active = false WHERE source_url = $1`,
        [sourceUrl],
      );
      return;
    }
    const kbId = await getOrCreateKbId();
    const chunk = adapter.toChunk(row, id);
    chunk.sourceUrl = sourceUrl; // enforce convention
    await upsertChunk(kbId, chunk);
  }

  async function deactivateEntity(kind: string, id: number): Promise<void> {
    await pool.query(
      `UPDATE knowledge_chunk SET is_active = false WHERE source_url = $1`,
      [`cms://${kind}/${id}`],
    );
  }

  return { syncEntity, deactivateEntity, upsertChunk, getOrCreateKbId };
}

export type KbSync = ReturnType<typeof createKbSync>;

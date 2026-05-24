/**
 * Generic CMS router factory — generates public read + admin CRUD routes
 * for any number of entities described by EntityConfig. Each entity is
 * a row in the consumer's DB and (optionally) a KB chunk via kb-sync.
 *
 * Mount the public router under e.g. /api/cms and the admin router under
 * /api/admin/cms (with your auth middleware applied upstream).
 */
import { Router, type RequestHandler } from "express";
import type { Pool } from "pg";
import type { KbSync } from "./kb-sync.js";

export type FieldType =
  | "text" | "textarea" | "markdown" | "number" | "boolean"
  | "select" | "image" | "string_array" | "json";

export interface EntityField {
  /** DB column name (snake_case). */
  column: string;
  /** Label shown in admin UI. */
  label?: string;
  type: FieldType;
  /** For select: list of options. */
  options?: Array<{ value: string; label: string }>;
  /** Required for POST (validated server-side). */
  required?: boolean;
  /** If true, included in public response. Defaults to true. */
  public?: boolean;
  /** Default value used on POST when omitted. */
  default?: unknown;
}

export interface EntityConfig {
  /** Logical name used in URLs and KB source_url: /entity/{kind}. */
  kind: string;
  /** Display name in admin UI (e.g. "Project", "News Post"). */
  label: string;
  /** Plural display name (e.g. "Projects"). */
  labelPlural: string;
  /** DB table name. */
  table: string;
  /** Primary key column name (e.g. "cms_project_id"). */
  pk: string;
  /** Column used as the row's slug (must be UNIQUE in DB). */
  slugColumn?: string;
  /** Column to ORDER BY in list views. Default `pk` desc. */
  orderBy?: string;
  /** Required filter: organization_id column name. Default `organization_id`. */
  orgColumn?: string;
  /** Soft-delete column name. If set, filtered out of public reads. Default `deleted_at`. */
  deletedAtColumn?: string | null;
  /** Publish column name. If set, filtered out of public reads when false. Default `is_published`. */
  publishedColumn?: string | null;
  /** Fields to expose. */
  fields: EntityField[];
  /** Optional: KB sync on write. */
  syncKb?: boolean;
}

export interface CmsRouterConfig {
  pool: Pool;
  /** Consumer's organization_id (multi-tenant). */
  organizationId: number;
  entities: EntityConfig[];
  /** Optional KB sync — if provided and entity.syncKb=true, mutations trigger resync. */
  kb?: KbSync;
}

function publicCols(e: EntityConfig): string[] {
  const cols = [e.pk, ...e.fields.filter((f) => f.public !== false).map((f) => f.column)];
  return [...new Set(cols)];
}

function adminCols(e: EntityConfig): string[] {
  const cols = [e.pk, "created_at", "updated_at", ...e.fields.map((f) => f.column)];
  return [...new Set(cols)];
}

function buildWhere(e: EntityConfig, opts: { adminOnly?: boolean } = {}): { clause: string; params: unknown[] } {
  const params: unknown[] = [];
  const clauses: string[] = [];
  const orgCol = e.orgColumn ?? "organization_id";
  clauses.push(`${orgCol} = $${params.length + 1}`); params.push(null); // org filled later
  const delCol = e.deletedAtColumn === null ? null : (e.deletedAtColumn ?? "deleted_at");
  if (delCol) clauses.push(`${delCol} IS NULL`);
  if (!opts.adminOnly) {
    const pubCol = e.publishedColumn === null ? null : (e.publishedColumn ?? "is_published");
    if (pubCol) clauses.push(`${pubCol} = true`);
  }
  return { clause: clauses.join(" AND "), params };
}

export function createCmsRouter(config: CmsRouterConfig): { publicRouter: Router; adminRouter: Router } {
  const { pool, organizationId, entities, kb } = config;
  const publicRouter = Router();
  const adminRouter = Router();

  for (const e of entities) {
    const orderBy = e.orderBy ?? `${e.pk} DESC`;
    const orgCol = e.orgColumn ?? "organization_id";

    // --- Public list ---
    publicRouter.get(`/${e.kind}`, async (_req, res) => {
      const where = buildWhere(e); where.params[0] = organizationId;
      const sql = `SELECT ${publicCols(e).join(", ")} FROM ${e.table} WHERE ${where.clause} ORDER BY ${orderBy}`;
      const { rows } = await pool.query(sql, where.params);
      res.json({ items: rows, kind: e.kind });
    });

    // --- Public by slug ---
    if (e.slugColumn) {
      publicRouter.get(`/${e.kind}/:slug`, async (req, res) => {
        const where = buildWhere(e);
        where.params[0] = organizationId;
        const sql = `SELECT ${publicCols(e).join(", ")} FROM ${e.table} WHERE ${where.clause} AND ${e.slugColumn} = $${where.params.length + 1} LIMIT 1`;
        where.params.push(req.params.slug);
        const { rows } = await pool.query(sql, where.params);
        if (!rows[0]) return res.status(404).json({ error: "Not found" });
        res.json({ item: rows[0], kind: e.kind });
      });
    }

    // --- Admin list ---
    adminRouter.get(`/${e.kind}`, async (_req, res) => {
      const where = buildWhere(e, { adminOnly: true }); where.params[0] = organizationId;
      const sql = `SELECT ${adminCols(e).join(", ")} FROM ${e.table} WHERE ${where.clause} ORDER BY ${orderBy}`;
      const { rows } = await pool.query(sql, where.params);
      res.json({ items: rows, kind: e.kind });
    });

    // --- Admin create ---
    adminRouter.post(`/${e.kind}`, async (req, res) => {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const required = e.fields.filter((f) => f.required).map((f) => f.column);
      const missing = required.filter((c) => body[c] == null || body[c] === "");
      if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(", ")}` });

      const cols = [orgCol]; const vals: unknown[] = [organizationId]; const ph = ["$1"];
      for (const f of e.fields) {
        const v = body[f.column] !== undefined ? body[f.column] : f.default;
        if (v === undefined) continue;
        cols.push(f.column); vals.push(coerce(f, v)); ph.push(`$${vals.length}`);
      }
      const sql = `INSERT INTO ${e.table} (${cols.join(", ")}) VALUES (${ph.join(", ")}) RETURNING ${e.pk}`;
      const { rows } = await pool.query(sql, vals);
      const id = Number(rows[0][e.pk]);
      if (e.syncKb && kb) kb.syncEntity(e.kind, id).catch((err) => console.error(`KB sync ${e.kind} #${id}:`, err));
      res.json({ [e.pk]: id });
    });

    // --- Admin update ---
    adminRouter.put(`/${e.kind}/:id`, async (req, res) => {
      const id = Number(req.params.id);
      const body = (req.body ?? {}) as Record<string, unknown>;
      const sets: string[] = []; const vals: unknown[] = [];
      for (const f of e.fields) {
        if (!(f.column in body)) continue;
        vals.push(coerce(f, body[f.column]));
        sets.push(`${f.column} = $${vals.length}`);
      }
      if (sets.length === 0) return res.json({ ok: true });
      vals.push(id); vals.push(organizationId);
      const sql = `UPDATE ${e.table} SET ${sets.join(", ")} WHERE ${e.pk} = $${vals.length - 1} AND ${orgCol} = $${vals.length}`;
      await pool.query(sql, vals);
      if (e.syncKb && kb) kb.syncEntity(e.kind, id).catch((err) => console.error(`KB sync ${e.kind} #${id}:`, err));
      res.json({ ok: true });
    });

    // --- Admin delete (soft if deleted_at column present) ---
    adminRouter.delete(`/${e.kind}/:id`, async (req, res) => {
      const id = Number(req.params.id);
      const delCol = e.deletedAtColumn === null ? null : (e.deletedAtColumn ?? "deleted_at");
      const pubCol = e.publishedColumn === null ? null : (e.publishedColumn ?? "is_published");
      if (delCol) {
        const pubBit = pubCol ? `, ${pubCol} = false` : "";
        await pool.query(
          `UPDATE ${e.table} SET ${delCol} = NOW()${pubBit} WHERE ${e.pk} = $1 AND ${orgCol} = $2`,
          [id, organizationId],
        );
      } else {
        await pool.query(`DELETE FROM ${e.table} WHERE ${e.pk} = $1 AND ${orgCol} = $2`, [id, organizationId]);
      }
      if (e.syncKb && kb) kb.deactivateEntity(e.kind, id).catch((err) => console.error(`KB deactivate ${e.kind} #${id}:`, err));
      res.json({ ok: true });
    });
  }

  // Expose entity config so the frontend can introspect (drives generic UI).
  publicRouter.get("/_entities", (_req, res) => {
    res.json({ entities: entities.map(stripSensitive) });
  });
  adminRouter.get("/_entities", (_req, res) => {
    res.json({ entities: entities.map(stripSensitive) });
  });

  return { publicRouter, adminRouter };
}

function coerce(f: EntityField, v: unknown): unknown {
  if (v === null || v === undefined) return null;
  switch (f.type) {
    case "number": return v === "" ? null : Number(v);
    case "boolean": return Boolean(v);
    case "string_array":
      if (Array.isArray(v)) return v;
      if (typeof v === "string") return v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
      return [];
    case "json": return typeof v === "string" ? JSON.parse(v) : v;
    default: return v;
  }
}

function stripSensitive(e: EntityConfig) {
  return {
    kind: e.kind, label: e.label, labelPlural: e.labelPlural,
    slugColumn: e.slugColumn, pk: e.pk,
    fields: e.fields,
  };
}

export const handlerType: RequestHandler | null = null; // keep import for type augmentation

/**
 * Audit logger for admin writes. Wraps res.json so we can capture the
 * outcome (id created/updated/deleted) without changing route handlers.
 */
import type { Request, Response, NextFunction } from "express";
import type { Pool } from "pg";

export interface AuditConfig {
  pool: Pool;
  /** Pull org from req.auth or fallback. */
  defaultOrgId: number;
  /** Optional inflater: turn the request URL into {kind, entity_id}. */
  parse?: (req: Request) => { kind: string; entity_id: string | null; action: string };
}

const METHOD_ACTION: Record<string, string> = {
  POST: "create", PUT: "update", PATCH: "update", DELETE: "delete",
};

function defaultParse(req: Request): { kind: string; entity_id: string | null; action: string } {
  // /api/admin/cms/{kind}[/{id}] OR /api/admin/cms/media/upload
  const m = req.path.match(/^\/?([^/]+)(?:\/([^/?]+))?/);
  const kind = m?.[1] ?? "unknown";
  const entity_id = m?.[2] ?? null;
  const action = METHOD_ACTION[req.method] ?? req.method.toLowerCase();
  return { kind, entity_id: entity_id === "upload" ? null : entity_id, action: kind === "media" && entity_id === "upload" ? "upload" : action };
}

export function createAuditMiddleware(config: AuditConfig) {
  const { pool, defaultOrgId, parse = defaultParse } = config;

  return function audit(req: Request, res: Response, next: NextFunction) {
    if (!METHOD_ACTION[req.method] && !(req.method === "POST" && req.path.endsWith("/upload"))) {
      return next();
    }

    const startBody = req.body ?? {};
    const origJson = res.json.bind(res);

    res.json = function (body: unknown) {
      try {
        const parsed = parse(req);
        if (res.statusCode < 200 || res.statusCode >= 300) return origJson(body);
        const entityId = parsed.entity_id ?? extractId(body);
        const summary = summarize(parsed.action, parsed.kind, startBody, body);
        pool.query(
          `INSERT INTO cms_audit_log
            (organization_id, profile_id, actor_email, action, entity_kind, entity_id,
             summary, diff, ip_address, user_agent)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            req.auth?.organization_id ?? defaultOrgId,
            req.auth?.profile_id ?? null,
            req.auth?.email ?? null,
            parsed.action,
            parsed.kind,
            entityId,
            summary,
            { request: redact(startBody), response: body },
            req.ip ?? null,
            req.headers["user-agent"] ?? null,
          ]
        ).catch((e) => console.error("audit log write failed:", e));
      } catch (e) {
        console.error("audit middleware error:", e);
      }
      return origJson(body);
    };

    next();
  };
}

function extractId(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  for (const k of Object.keys(b)) {
    if (k.endsWith("_id") && (typeof b[k] === "number" || typeof b[k] === "string")) {
      return String(b[k]);
    }
  }
  return null;
}

function summarize(action: string, kind: string, reqBody: Record<string, unknown>, _resBody: unknown): string {
  const title = String(reqBody?.title ?? reqBody?.name ?? reqBody?.route ?? reqBody?.slug ?? "");
  return title ? `${action} ${kind}: ${title}` : `${action} ${kind}`;
}

function redact(body: Record<string, unknown>): Record<string, unknown> {
  const clone = { ...body };
  for (const key of Object.keys(clone)) {
    if (/password|secret|token/i.test(key)) clone[key] = "[redacted]";
  }
  return clone;
}

/**
 * User management routes — admin only. List users, create/invite, set role,
 * deactivate, reset password.
 */
import { Router, type RequestHandler } from "express";
import type { Pool } from "pg";
import bcrypt from "bcryptjs";

export interface UsersRouterConfig {
  pool: Pool;
  organizationId: number;
}

export function createUsersRouter(config: UsersRouterConfig): Router {
  const { pool, organizationId } = config;
  const router = Router();

  router.get("/users", async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT p.profile_id, p.auth_user_id, u.email, u.is_active AS user_active, u.last_login_at,
              p.first_name, p.last_name, p.is_active AS profile_active, p.last_seen_at,
              r.name AS role, r.label AS role_label, p.created_at
       FROM profile p
       JOIN auth_user u ON u.auth_user_id = p.auth_user_id
       JOIN role r ON r.role_id = p.role_id
       WHERE p.organization_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.created_at ASC`,
      [organizationId]
    );
    res.json({ items: rows });
  });

  router.get("/roles", async (_req, res) => {
    const { rows } = await pool.query(
      `SELECT role_id, name, label FROM role WHERE organization_id = $1 ORDER BY role_id`,
      [organizationId]
    );
    res.json({ items: rows });
  });

  router.post("/users", async (req, res) => {
    const { email, password, first_name, last_name, role } = req.body ?? {};
    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ error: "email, password, first_name, last_name, role required" });
    }
    const exists = await pool.query(`SELECT 1 FROM auth_user WHERE LOWER(email) = LOWER($1)`, [email]);
    if (exists.rowCount && exists.rowCount > 0) return res.status(409).json({ error: "Email already exists" });

    const { rows: roleRows } = await pool.query(
      `SELECT role_id FROM role WHERE organization_id = $1 AND name = $2`,
      [organizationId, role]
    );
    if (!roleRows[0]) return res.status(400).json({ error: `Unknown role: ${role}` });

    const hash = await bcrypt.hash(String(password), 12);
    const { rows: userRows } = await pool.query(
      `INSERT INTO auth_user (email, password_hash, is_verified, is_active)
       VALUES ($1, $2, true, true) RETURNING auth_user_id`,
      [String(email).toLowerCase(), hash]
    );
    const authUserId = Number(userRows[0].auth_user_id);
    const { rows: profileRows } = await pool.query(
      `INSERT INTO profile (auth_user_id, organization_id, role_id, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING profile_id`,
      [authUserId, organizationId, Number(roleRows[0].role_id), first_name, last_name]
    );
    res.json({ profile_id: Number(profileRows[0].profile_id), auth_user_id: authUserId });
  });

  router.put("/users/:profileId", async (req, res) => {
    const profileId = Number(req.params.profileId);
    const { first_name, last_name, role, is_active, password } = req.body ?? {};
    if (role) {
      const { rows: roleRows } = await pool.query(
        `SELECT role_id FROM role WHERE organization_id = $1 AND name = $2`,
        [organizationId, role]
      );
      if (!roleRows[0]) return res.status(400).json({ error: `Unknown role: ${role}` });
      await pool.query(
        `UPDATE profile SET role_id = $1, updated_at = NOW()
         WHERE profile_id = $2 AND organization_id = $3`,
        [Number(roleRows[0].role_id), profileId, organizationId]
      );
    }
    if (first_name || last_name || is_active !== undefined) {
      await pool.query(
        `UPDATE profile SET
           first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           is_active = COALESCE($3, is_active),
           updated_at = NOW()
         WHERE profile_id = $4 AND organization_id = $5`,
        [first_name ?? null, last_name ?? null, is_active, profileId, organizationId]
      );
    }
    if (password) {
      const hash = await bcrypt.hash(String(password), 12);
      await pool.query(
        `UPDATE auth_user SET password_hash = $1, updated_at = NOW()
         WHERE auth_user_id = (SELECT auth_user_id FROM profile WHERE profile_id = $2)`,
        [hash, profileId]
      );
    }
    res.json({ ok: true });
  });

  router.delete("/users/:profileId", async (req, res) => {
    const profileId = Number(req.params.profileId);
    // Soft-deactivate; don't drop the row (we need it for audit log foreign keys).
    await pool.query(
      `UPDATE profile SET is_active = false, deleted_at = NOW()
       WHERE profile_id = $1 AND organization_id = $2`,
      [profileId, organizationId]
    );
    res.json({ ok: true });
  });

  // Audit log readback
  router.get("/audit-log", async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const { rows } = await pool.query(
      `SELECT cms_audit_log_id, profile_id, actor_email, action, entity_kind, entity_id,
              summary, ip_address, created_at
       FROM cms_audit_log
       WHERE organization_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [organizationId, limit]
    );
    res.json({ items: rows });
  });

  return router;
}

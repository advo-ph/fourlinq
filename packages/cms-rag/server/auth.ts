/**
 * Per-user authentication kit for cms-rag consumers.
 *
 * Uses bcryptjs + JWT in an httpOnly cookie. The token carries
 * { profile_id, auth_user_id, organization_id, role_name, email }.
 *
 *   const auth = createAuthKit({ pool, jwtSecret, cookieName });
 *   app.post("/api/auth/login",  auth.loginHandler);
 *   app.post("/api/auth/logout", auth.logoutHandler);
 *   app.get ("/api/auth/me",     auth.meHandler);
 *
 *   app.use("/api/admin/cms", auth.requireRole(["admin", "editor"]), cmsAdmin);
 *
 * Each consumer maintains their own user list (auth_user + profile + role
 * tables from cms-rag/migrations/003_auth.sql or your own schema).
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface AuthClaims {
  profile_id: number;
  auth_user_id: number;
  organization_id: number;
  role_name: string;
  email: string;
}

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthClaims;
  }
}

export interface AuthKitConfig {
  pool: Pool;
  jwtSecret: string;
  cookieName?: string;
  /** Token TTL in seconds. Default 8 hours. */
  tokenTtlSeconds?: number;
  /** Secure cookie flag — set true in prod (https). */
  secureCookie?: boolean;
}

export function createAuthKit(config: AuthKitConfig) {
  const {
    pool, jwtSecret,
    cookieName = "__cms_session",
    tokenTtlSeconds = 8 * 60 * 60,
    secureCookie = process.env.NODE_ENV === "production",
  } = config;

  async function findUserByEmail(email: string) {
    const { rows } = await pool.query(
      `SELECT u.auth_user_id, u.email, u.password_hash, u.is_active AS user_active,
              p.profile_id, p.organization_id, p.first_name, p.last_name,
              p.is_active AS profile_active,
              r.name AS role_name, r.label AS role_label
       FROM auth_user u
       JOIN profile p ON p.auth_user_id = u.auth_user_id
       JOIN role r    ON r.role_id = p.role_id
       WHERE LOWER(u.email) = LOWER($1)
       LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  }

  function issueCookie(res: Response, claims: AuthClaims): void {
    const token = jwt.sign(claims, jwtSecret, { expiresIn: tokenTtlSeconds });
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      maxAge: tokenTtlSeconds * 1000,
    });
  }

  const loginHandler: RequestHandler = async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await findUserByEmail(String(email));
    if (!user || !user.user_active || !user.profile_active) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const claims: AuthClaims = {
      profile_id: Number(user.profile_id),
      auth_user_id: Number(user.auth_user_id),
      organization_id: Number(user.organization_id),
      role_name: String(user.role_name),
      email: String(user.email),
    };
    issueCookie(res, claims);

    pool.query(`UPDATE auth_user SET last_login_at = NOW() WHERE auth_user_id = $1`, [claims.auth_user_id]).catch(() => {});
    pool.query(`UPDATE profile SET last_seen_at = NOW() WHERE profile_id = $1`, [claims.profile_id]).catch(() => {});

    res.json({
      user: {
        profile_id: claims.profile_id,
        email: claims.email,
        role: user.role_name,
        role_label: user.role_label,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  };

  const logoutHandler: RequestHandler = (_req, res) => {
    res.clearCookie(cookieName, { httpOnly: true, secure: secureCookie, sameSite: "lax" });
    res.json({ ok: true });
  };

  function decode(req: Request): AuthClaims | null {
    const token = req.cookies?.[cookieName];
    if (!token) return null;
    try {
      return jwt.verify(token, jwtSecret) as AuthClaims;
    } catch {
      return null;
    }
  }

  const meHandler: RequestHandler = async (req, res) => {
    const claims = decode(req);
    if (!claims) return res.status(401).json({ error: "Not authenticated" });
    const { rows } = await pool.query(
      `SELECT p.profile_id, u.email, p.first_name, p.last_name,
              r.name AS role, r.label AS role_label
       FROM profile p
       JOIN auth_user u ON u.auth_user_id = p.auth_user_id
       JOIN role r ON r.role_id = p.role_id
       WHERE p.profile_id = $1`,
      [claims.profile_id]
    );
    if (!rows[0]) return res.status(401).json({ error: "Profile not found" });
    res.json({ user: rows[0] });
  };

  function requireAuth(req: Request, res: Response, next: NextFunction) {
    const claims = decode(req);
    if (!claims) return res.status(401).json({ error: "Not authenticated" });
    req.auth = claims;
    next();
  }

  function requireRole(roles: string[]): RequestHandler[] {
    return [
      requireAuth,
      (req: Request, res: Response, next: NextFunction) => {
        if (!req.auth) return res.status(401).json({ error: "Not authenticated" });
        if (!roles.includes(req.auth.role_name)) {
          return res.status(403).json({ error: `Requires one of: ${roles.join(", ")}` });
        }
        next();
      },
    ];
  }

  return { loginHandler, logoutHandler, meHandler, requireAuth, requireRole };
}

export type AuthKit = ReturnType<typeof createAuthKit>;

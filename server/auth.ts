/**
 * FourlinQ adapter over @cms-rag's auth kit. Provides the same exported
 * symbols as before (loginHandler, logoutHandler, checkAuthHandler,
 * requireAdmin) so the rest of the codebase keeps compiling, while
 * delegating to per-user bcrypt+JWT auth backed by auth_user/profile/role.
 */
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import pool from "./db.js";
import { createAuthKit } from "../packages/cms-rag/server/index.js";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || crypto.randomBytes(32).toString("hex");
const COOKIE_NAME = "__flq_admin";

export const authKit = createAuthKit({
  pool,
  jwtSecret: JWT_SECRET,
  cookieName: COOKIE_NAME,
});

export const loginHandler = authKit.loginHandler;
export const logoutHandler = authKit.logoutHandler;

export async function checkAuthHandler(req: Request, res: Response) {
  // Adapter for the existing /api/admin/check shape: { authenticated: bool, user? }.
  const fakeRes = {
    statusCode: 200,
    // `this` needs annotating: the trailing `as unknown as Response` cast makes
    // TS infer the literal's `this` as {}, so `this.statusCode` fails to resolve.
    status(this: { statusCode: number }, code: number) { this.statusCode = code; return this; },
    json(body: unknown) { (this as { _body?: unknown })._body = body; return this; },
  } as unknown as Response & { _body?: { user?: unknown } };
  await new Promise<void>((resolve) => {
    authKit.meHandler(req, fakeRes, () => resolve());
    // meHandler is async; wait a tick to let it settle
    setTimeout(resolve, 50);
  });
  if (fakeRes.statusCode === 200 && (fakeRes as { _body?: { user?: unknown } })._body?.user) {
    res.json({ authenticated: true, user: (fakeRes as { _body?: { user?: unknown } })._body!.user });
  } else {
    res.json({ authenticated: false });
  }
}

/** Backwards-compatible middleware. Now requires *any* authenticated user;
 *  per-role gating is handled by requireRole(...) on specific routes. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return authKit.requireAuth(req, res, next);
}

/** Re-exported for direct use on specific routes. */
export const requireRole = authKit.requireRole;

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Generate a random secret on each server start if not set in env
// This means all sessions invalidate on restart — intentional for security
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "FourlinQ@dmin2026";
const TOKEN_NAME = "__flq_admin";
const TOKEN_MAX_AGE = 8 * 60 * 60; // 8 hours

export function loginHandler(req: Request, res: Response) {
  const { password } = req.body;

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign(
    { role: "admin", iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: TOKEN_MAX_AGE }
  );

  // httpOnly — can't be read by JS
  // secure — only sent over HTTPS
  // sameSite strict — no CSRF
  res.cookie(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_MAX_AGE * 1000,
    path: "/",
  });

  res.json({ success: true });
}

export function logoutHandler(_req: Request, res: Response) {
  res.clearCookie(TOKEN_NAME, { path: "/" });
  res.json({ success: true });
}

export function checkAuthHandler(req: Request, res: Response) {
  const token = req.cookies?.[TOKEN_NAME];
  if (!token) return res.json({ authenticated: false });

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true });
  } catch {
    res.clearCookie(TOKEN_NAME, { path: "/" });
    res.json({ authenticated: false });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[TOKEN_NAME];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.clearCookie(TOKEN_NAME, { path: "/" });
    return res.status(401).json({ error: "Session expired" });
  }
}

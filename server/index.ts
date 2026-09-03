import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import chatLiteRouter from "./routes/chat-lite.js";
import adminChatRouter from "./routes/admin-chat.js";
import inquiriesRouter from "./routes/inquiries.js";
import analyticsRouter from "./routes/analytics.js";
import productsRouter from "./routes/products.js";
import { projectImagesPublic, projectImagesAdmin } from "./routes/project-images.js";
import { cmsPublic, cmsAdmin, uploadRouter, docsUploadRouter, usersRouter, auditMiddleware } from "./cms-config.js";
import { loginHandler, logoutHandler, checkAuthHandler, requireAdmin, requireRole } from "./auth.js";
import { spaStatusForPath } from "./spa-route.js";

dotenv.config({ path: ".env.development.local" });
dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || "6207", 10);
const isProd = process.env.NODE_ENV === "production";

// nginx runs on this same host and proxies to us over loopback, so every
// request arrives with a socket address of 127.0.0.1. Without this, Express
// reports req.ip as 127.0.0.1 for EVERY visitor, which collapses all three
// per-IP rate limiters in routes/inquiries.ts into a single shared bucket —
// measured: the 4th distinct visitor to the contact form inside a minute got a
// 429, so the form allowed 3 submissions per minute site-wide rather than 3
// per person. It also filled the pm2 error log with
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR on every hit.
//
// "loopback" and NOT `true`: `true` trusts the whole X-Forwarded-For chain, so
// a client can send its own header and pick a fresh key per request. Measured
// against this exact limiter config, an abuser under `true` sent 5/5 requests
// with no 429 at all; under "loopback" they were blocked from the 4th, because
// only 127.0.0.1 counts as a proxy and nginx's appended real client address is
// the first untrusted hop. express-rate-limit flags `true` as a misconfiguration
// for the same reason (ERR_ERL_PERMISSIVE_TRUST_PROXY).
//
// Revisit this if a CDN is ever put in front of the origin: fourlinq.ph
// currently resolves straight to the VPS with no intermediary, so there is
// exactly one hop to trust.
app.set("trust proxy", "loopback");

// Security
app.use(helmet({ contentSecurityPolicy: false }));
// Gzip/Brotli compression for all responses (JSON API + served files).
// Placed before routes and static so every response is compressed.
app.use(compression());
app.use(cors({
  origin: isProd
    ? ["https://fourlinq.ph", "https://www.fourlinq.ph"]
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ─── Public routes ───────────────────────────────
app.use("/api/chat", chatLiteRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/cms", cmsPublic);
// Serve uploaded CMS media (must come before SPA fallback)
app.use("/uploads", express.static(path.resolve(import.meta.dirname, "../uploads"), { maxAge: "30d" }));
// Public form submissions (router has /contact, /quote-request, /save-configuration)
app.use("/api", inquiriesRouter);
// Public product catalog (Phase 1 — DB-backed, hook falls back to static if 5xx)
app.use("/api/products", productsRouter);
// Public project-images merged endpoint (no auth, cached 30 s)
app.use("/api/project-images", projectImagesPublic);

// ─── Admin auth (open) ──────────────────────────
app.post("/api/admin/login", loginHandler);
app.post("/api/admin/logout", logoutHandler);
app.get("/api/admin/check", checkAuthHandler);

// ─── Protected admin routes ──────────────────────
// requireAdmin = "any authenticated user". requireRole(["admin"]) for admin-only.
app.use("/api/admin/chat", requireAdmin, adminChatRouter);
app.use("/api/admin/analytics", requireAdmin, analyticsRouter);

// CMS — admin + editor can manage all content; media role limited to /media only
app.use("/api/admin/cms/media",
  ...requireRole(["admin", "editor", "media"]), auditMiddleware, uploadRouter);
app.use("/api/admin/cms/docs",
  ...requireRole(["admin", "editor", "media"]), auditMiddleware, docsUploadRouter);
app.use("/api/admin/cms",
  ...requireRole(["admin", "editor"]), auditMiddleware, cmsAdmin);

// User management — admin only
app.use("/api/admin/users", ...requireRole(["admin"]), auditMiddleware, usersRouter);

// Project-images override management — admin + editor
app.use("/api/admin/project-images", ...requireRole(["admin", "editor"]), projectImagesAdmin);

// Admin inquiries (router has /inquiries GET and /inquiries/:id PATCH)
app.use("/api/admin", requireAdmin, inquiriesRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 for unmatched /api
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Serve frontend in production
if (isProd) {
  const distPath = path.resolve(import.meta.dirname, "../dist");
  app.use(
    express.static(distPath, {
      // Default: long-lived immutable cache for Vite-hashed JS/CSS assets
      // (e.g. /assets/index-abc123.js). These filenames are content-addressable
      // so they are safe to cache forever.
      maxAge: "365d",
      immutable: true,
      setHeaders(res, filePath) {
        // HTML files must never be served from a long-lived cache — the browser
        // must always revalidate so a new deploy's hashed asset references are
        // picked up immediately rather than serving stale chunk URLs.
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store");
          return;
        }
        // Images under /images/ are replaced in-place across deploys, so they
        // must NOT be cached immutably. We use a short TTL (5 min) with
        // stale-while-revalidate so the browser revalidates often. The frontend
        // appends ?v=<contenthash> to image URLs (via src/lib/image-version.ts)
        // so a freshly regenerated image will load immediately even for users
        // who have a stale cached copy — the new ?v= parameter produces a
        // cache-miss on the old entry.
        //
        // Thumbs (/images/projects-fb/thumbs/) and originals share this same
        // policy so the two variants are never cached for different durations,
        // which was the root cause of the mismatched thumbnail/lightbox bug.
        if (filePath.includes("/images/")) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=300, stale-while-revalidate=86400"
          );
          return;
        }
        // System hover-animation frames have fixed filenames (01.webp … 28.webp)
        // and are rewritten in place whenever a set is re-baked or re-imported,
        // so they need the same policy as /images/ for exactly the same reason.
        // Serving them immutably for a year meant a replaced set never reached
        // anyone who had already hovered the card. getSystemAnimation appends
        // ?v=<set hash> (src/generated/anim-versions.json) so a replacement is
        // picked up at once even by a browser holding a stale immutable copy.
        if (filePath.includes("/systems/anim/")) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=300, stale-while-revalidate=86400"
          );
          return;
        }
        // All other static assets (fonts, icons, manifest.json, etc.) inherit
        // the top-level maxAge + immutable set above — no override needed.
      },
    })
  );
  app.use((req, res) => {
    // SPA fallback: same no-store policy so the freshly-deployed index.html
    // (with updated hashed asset references) is never served stale.
    res.setHeader("Cache-Control", "no-store");
    res.status(spaStatusForPath(req.path)).sendFile(path.join(distPath, "index.html"));
  });
}

const server = app.listen(PORT, () => {
  console.log(`FourlinQ ${isProd ? "production" : "dev"} server on http://localhost:${PORT}`);
  // pm2 runs this in cluster mode with wait_ready: it keeps the OLD worker
  // serving until the new one says it is listening, which is what makes a
  // reload zero-downtime. Without this signal pm2 falls back to a timeout and
  // deploys go back to dropping requests. No-op outside pm2 (plain `node`).
  process.send?.("ready");
});

// Drain in-flight requests (including SSE streams) before exiting, so a reload
// never severs a response mid-write.
const shutdownServer = (signal: string) => {
  console.log(`${signal} received — closing server to new connections`);
  server.close(() => process.exit(0));
  // Backstop: pm2's kill_timeout is 5s, so never outlive it.
  setTimeout(() => process.exit(0), 4500).unref();
};
process.on("SIGINT", () => shutdownServer("SIGINT"));
process.on("SIGTERM", () => shutdownServer("SIGTERM"));

export default app;

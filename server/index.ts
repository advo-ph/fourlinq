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
const PORT = parseInt(process.env.API_PORT || "3001", 10);
const isProd = process.env.NODE_ENV === "production";

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
      maxAge: "30d",
      immutable: true,
      setHeaders(res, filePath) {
        // HTML files must never be served from a long-lived cache — the browser
        // must always revalidate so a new deploy's hashed asset references are
        // picked up immediately rather than serving stale chunk URLs.
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store");
          return;
        }
        if (filePath.includes("/images/")) {
          res.setHeader(
            "Cache-Control",
            "public, max-age=3600, stale-while-revalidate=86400"
          );
        }
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

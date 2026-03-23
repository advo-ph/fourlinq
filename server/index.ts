import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import chatLiteRouter from "./routes/chat-lite.js";
import adminChatRouter from "./routes/admin-chat.js";
import inquiriesRouter from "./routes/inquiries.js";
import { loginHandler, logoutHandler, checkAuthHandler, requireAdmin } from "./auth.js";

dotenv.config({ path: ".env.development.local" });
dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || "3001", 10);
const isProd = process.env.NODE_ENV === "production";

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: isProd
    ? ["https://fourlinq.ph", "https://www.fourlinq.ph"]
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ─── Public routes ───────────────────────────────
app.use("/api/chat", chatLiteRouter);

// Public form submissions (contact, quote, save-config)
app.post("/api/contact", inquiriesRouter);
app.post("/api/quote-request", inquiriesRouter);
app.post("/api/save-configuration", inquiriesRouter);

// ─── Admin auth (no password required) ───────────
app.post("/api/admin/login", loginHandler);
app.post("/api/admin/logout", logoutHandler);
app.get("/api/admin/check", checkAuthHandler);

// ─── Protected admin routes ──────────────────────
app.use("/api/admin/chat", requireAdmin, adminChatRouter);
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
  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`FourlinQ ${isProd ? "production" : "dev"} server on http://localhost:${PORT}`);
});

export default app;

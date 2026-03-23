import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";
import chatLiteRouter from "./routes/chat-lite.js";
import inquiriesRouter from "./routes/inquiries.js";

dotenv.config({ path: ".env.development.local" });
dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || "3001", 10);
const isProd = process.env.NODE_ENV === "production";

// Security
app.use(
  helmet({
    contentSecurityPolicy: false, // Let Nginx handle CSP in production
  })
);
app.use(
  cors({
    origin: isProd
      ? ["https://fourlinq.ph", "https://www.fourlinq.ph"]
      : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.json());

// API routes
app.use("/api/chat", chatLiteRouter);
app.use("/api", inquiriesRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler for unmatched /api routes
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Serve built frontend in production
if (isProd) {
  const distPath = path.resolve(import.meta.dirname, "../dist");
  app.use(express.static(distPath));
  // SPA fallback — serve index.html for all non-API routes
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`FourlinQ ${isProd ? "production" : "dev"} server on http://localhost:${PORT}`);
});

export default app;

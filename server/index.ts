import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";
import catalogRouter from "./routes/catalog.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || "3001", 10);

// Security
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"], credentials: true }));
app.use(express.json());

// Public API routes (no auth required for product catalog)
app.use("/api/products", productsRouter);
app.use("/api", catalogRouter);
app.use("/api/chat", chatRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler for unmatched /api routes
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`✓ FourlinQ API running on http://localhost:${PORT}`);
  console.log(`  Routes:`);
  console.log(`    GET /api/health`);
  console.log(`    GET /api/products`);
  console.log(`    GET /api/products/:slug`);
  console.log(`    GET /api/product-types`);
  console.log(`    GET /api/finishes`);
  console.log(`    GET /api/glass-types`);
  console.log(`    GET /api/projects`);
});

export default app;

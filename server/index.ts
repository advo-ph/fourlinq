import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import chatLiteRouter from "./routes/chat-lite.js";
import inquiriesRouter from "./routes/inquiries.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || "3001", 10);

// Security
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.json());

// Lightweight routes (no DB required)
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

app.listen(PORT, () => {
  console.log(`FourlinQ API running on http://localhost:${PORT}`);
  console.log(`  POST /api/chat/stream`);
  console.log(`  POST /api/contact`);
  console.log(`  POST /api/quote-request`);
  console.log(`  POST /api/save-configuration`);
});

export default app;

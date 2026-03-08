import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const DATA_DIR = path.resolve(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function appendToFile(filename: string, data: Record<string, unknown>) {
  ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  const entry = JSON.stringify({ ...data, timestamp: new Date().toISOString() }) + "\n";
  fs.appendFileSync(filepath, entry, "utf-8");
}

/**
 * POST /api/contact
 * Body: { name, email, phone?, subject?, message }
 */
router.post("/contact", (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }

  const inquiry = { type: "contact", name, email, phone, subject, message };
  appendToFile("inquiries.jsonl", inquiry);
  console.log("New contact inquiry:", name, email);

  res.json({ success: true, message: "Thank you! We'll get back to you within 24 hours." });
});

/**
 * POST /api/quote-request
 * Body: { name, email, phone?, productId?, productName?, notes? }
 */
router.post("/quote-request", (req, res) => {
  const { name, email, phone, productId, productName, notes } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const refId = "QR-" + Date.now().toString(36).toUpperCase();
  const inquiry = { type: "quote", refId, name, email, phone, productId, productName, notes };
  appendToFile("inquiries.jsonl", inquiry);
  console.log("New quote request:", refId, name, productName);

  res.json({ success: true, refId, message: `Quote request ${refId} received! We'll send you a detailed quotation within 48 hours.` });
});

/**
 * POST /api/save-configuration
 * Body: { name?, email?, config: { type, finish, glass, width, height } }
 */
router.post("/save-configuration", (req, res) => {
  const { name, email, config } = req.body;

  if (!config) {
    return res.status(400).json({ error: "config is required" });
  }

  const refId = "CFG-" + Date.now().toString(36).toUpperCase();
  const entry = { type: "configuration", refId, name, email, config };
  appendToFile("inquiries.jsonl", entry);
  console.log("Configuration saved:", refId);

  res.json({ success: true, refId, message: `Configuration ${refId} saved!` });
});

export default router;

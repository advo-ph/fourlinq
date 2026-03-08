import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, config } = req.body;

  if (!config) {
    return res.status(400).json({ error: "config is required" });
  }

  const refId = "CFG-" + Date.now().toString(36).toUpperCase();

  try {
    const sql = getDb();
    await sql`
      INSERT INTO inquiries (type, ref_id, name, email, config_json, created_at)
      VALUES ('configuration', ${refId}, ${name || null}, ${email || null}, ${JSON.stringify(config)}, NOW())
    `;
  } catch (err) {
    console.error("Save config DB error:", err);
  }

  res.json({ success: true, refId, message: `Configuration ${refId} saved!` });
}

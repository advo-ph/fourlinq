import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "./_db.js";

/**
 * GET /api/setup-db
 * Creates the inquiries table. Run once after connecting Neon.
 * Delete this endpoint after setup.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL,
        ref_id VARCHAR(50),
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT,
        product_id VARCHAR(100),
        product_name VARCHAR(255),
        notes TEXT,
        config_json JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    res.json({ success: true, message: "Database table created successfully." });
  } catch (err) {
    console.error("DB setup error:", err);
    res.status(500).json({ error: "Failed to create table", details: (err as Error).message });
  }
}

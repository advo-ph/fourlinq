import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, productId, productName, notes } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const refId = "QR-" + Date.now().toString(36).toUpperCase();

  try {
    const sql = getDb();
    await sql`
      INSERT INTO inquiries (type, ref_id, name, email, phone, product_id, product_name, notes, created_at)
      VALUES ('quote', ${refId}, ${name}, ${email}, ${phone || null}, ${productId || null}, ${productName || null}, ${notes || null}, NOW())
    `;
  } catch (err) {
    console.error("Quote request DB error:", err);
  }

  res.json({
    success: true,
    refId,
    message: `Quote request ${refId} received! We'll send you a detailed quotation within 48 hours.`,
  });
}

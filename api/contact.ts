import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "./_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }

  try {
    const sql = getDb();
    await sql`
      INSERT INTO inquiries (type, name, email, phone, subject, message, created_at)
      VALUES ('contact', ${name}, ${email}, ${phone || null}, ${subject || null}, ${message}, NOW())
    `;
  } catch (err) {
    console.error("Contact DB error:", err);
  }

  res.json({ success: true, message: "Thank you! We'll get back to you within 24 hours." });
}

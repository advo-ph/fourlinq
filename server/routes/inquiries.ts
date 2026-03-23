import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * POST /api/contact
 * Body: { name, email, phone?, subject?, message }
 */
router.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }

  try {
    const refId = "CT-" + Date.now().toString(36).toUpperCase();
    await pool.query(
      `INSERT INTO inquiries (type, ref_id, name, email, phone, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      ["contact", refId, name, email, phone || null, subject || null, message]
    );
    console.log("New contact:", refId, name, email);
    res.json({ success: true, refId, message: "Thank you! We'll get back to you within 24 hours." });
  } catch (err) {
    console.error("Contact save error:", err);
    res.status(500).json({ error: "Failed to save. Please call 0925-848-8888 or email sales@fourlinq.com." });
  }
});

/**
 * POST /api/quote-request
 * Body: { name, email, phone?, productId?, productName?, notes?, finish?, dimensions?, quantity?, budget?, timeline? }
 */
router.post("/quote-request", async (req, res) => {
  const { name, email, phone, productId, productName, notes, finish, dimensions, quantity, budget, timeline } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  try {
    const refId = "QR-" + Date.now().toString(36).toUpperCase();
    const config = { productId, productName, finish, dimensions, quantity, budget, timeline };
    await pool.query(
      `INSERT INTO inquiries (type, ref_id, name, email, phone, product_id, product_name, config, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      ["quote", refId, name, email, phone || null, productId || null, productName || null, JSON.stringify(config), notes || null]
    );
    console.log("New quote:", refId, name, productName);
    res.json({ success: true, refId, message: `Quote request ${refId} received! We'll send you a detailed quotation within 48 hours.` });
  } catch (err) {
    console.error("Quote save error:", err);
    res.status(500).json({ error: "Failed to save. Please call 0925-848-8888 or email sales@fourlinq.com." });
  }
});

/**
 * POST /api/save-configuration
 * Body: { name?, email?, phone?, config: { type, finish, glass, width, height } }
 */
router.post("/save-configuration", async (req, res) => {
  const { name, email, phone, config } = req.body;

  if (!config) {
    return res.status(400).json({ error: "config is required" });
  }

  try {
    const refId = "CFG-" + Date.now().toString(36).toUpperCase();
    await pool.query(
      `INSERT INTO inquiries (type, ref_id, name, email, phone, config)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ["configuration", refId, name || null, email || null, phone || null, JSON.stringify(config)]
    );
    console.log("Config saved:", refId, name || "(anonymous)");
    res.json({ success: true, refId, message: `Configuration ${refId} saved!` });
  } catch (err) {
    console.error("Config save error:", err);
    res.status(500).json({ error: "Failed to save configuration." });
  }
});

/**
 * GET /api/admin/inquiries
 * Query: ?type=contact|quote|configuration&status=new|contacted|quoted|won|lost&limit=50&offset=0
 */
router.get("/inquiries", async (req, res) => {
  const { type, status, limit = "50", offset = "0" } = req.query;

  try {
    let query = "SELECT * FROM inquiries WHERE 1=1";
    const params: (string | number)[] = [];
    let idx = 1;

    if (type) {
      query += ` AND type = $${idx++}`;
      params.push(type as string);
    }
    if (status) {
      query += ` AND status = $${idx++}`;
      params.push(status as string);
    }

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await pool.query(query, params);

    // Also get counts
    const counts = await pool.query(
      `SELECT type, status, count(*)::int as count FROM inquiries GROUP BY type, status ORDER BY type, status`
    );

    res.json({
      inquiries: result.rows,
      total: result.rowCount,
      counts: counts.rows,
    });
  } catch (err) {
    console.error("Admin inquiries error:", err);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

/**
 * PATCH /api/admin/inquiries/:id
 * Body: { status?, notes? }
 */
router.patch("/inquiries/:id", async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const updates: string[] = [];
    const params: (string | number)[] = [];
    let idx = 1;

    if (status) {
      updates.push(`status = $${idx++}`);
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${idx++}`);
      params.push(notes);
    }
    updates.push(`updated_at = now()`);

    params.push(parseInt(id, 10));
    await pool.query(
      `UPDATE inquiries SET ${updates.join(", ")} WHERE id = $${idx}`,
      params
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Admin update error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
});

/**
 * GET /api/admin/chat-logs
 * Query: ?limit=50&offset=0
 * Returns conversations grouped by session, with message count and latest message
 */
router.get("/chat-logs", async (req, res) => {
  const { limit = "50", offset = "0" } = req.query;

  try {
    // Get sessions with summary info
    const sessions = await pool.query(
      `SELECT
        session_id,
        min(created_at) as started_at,
        max(created_at) as last_message_at,
        count(*) FILTER (WHERE role = 'user')::int as user_messages,
        count(*)::int as total_messages,
        (SELECT message FROM chat_messages m2 WHERE m2.session_id = cm.session_id AND m2.role = 'user' ORDER BY m2.created_at ASC LIMIT 1) as first_question
      FROM chat_messages cm
      GROUP BY session_id
      ORDER BY max(created_at) DESC
      LIMIT $1 OFFSET $2`,
      [parseInt(limit as string, 10), parseInt(offset as string, 10)]
    );

    // Total session count
    const countResult = await pool.query(
      "SELECT count(DISTINCT session_id)::int as total FROM chat_messages"
    );

    // Top questions (most common first user messages)
    const topQuestions = await pool.query(
      `SELECT first_msg as question, count(*)::int as times_asked FROM (
        SELECT DISTINCT ON (session_id) session_id, message as first_msg
        FROM chat_messages WHERE role = 'user'
        ORDER BY session_id, created_at ASC
      ) sub
      GROUP BY first_msg
      ORDER BY count(*) DESC
      LIMIT 10`
    );

    res.json({
      sessions: sessions.rows,
      total: countResult.rows[0]?.total || 0,
      topQuestions: topQuestions.rows,
    });
  } catch (err) {
    console.error("Chat logs error:", err);
    res.status(500).json({ error: "Failed to fetch chat logs" });
  }
});

/**
 * GET /api/admin/chat-logs/:sessionId
 * Returns all messages for a specific conversation
 */
router.get("/chat-logs/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, role, message, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC",
      [sessionId]
    );
    res.json({ messages: result.rows });
  } catch (err) {
    console.error("Chat log detail error:", err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

export default router;

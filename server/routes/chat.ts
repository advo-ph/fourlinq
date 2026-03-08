import { Router } from "express";
import pool from "../db.js";
import { chatStream } from "../lib/gemini.js";
import { retrieveContext, buildSystemPrompt } from "../lib/rag.js";
import { nanoid } from "nanoid";

const router = Router();

/**
 * POST /api/chat
 * Body: { message: string, sessionToken?: string }
 * Returns: SSE stream of chat response chunks
 */
router.post("/", async (req, res) => {
  try {
    const { message, sessionToken } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    // 1. Get or create session
    let token = sessionToken;
    let sessionId: number;

    if (token) {
      const { rows } = await pool.query(
        `SELECT chatbot_session_id FROM chatbot_session WHERE session_token = $1`,
        [token]
      );
      if (rows.length > 0) {
        sessionId = rows[0].chatbot_session_id;
      } else {
        token = nanoid(21);
        const { rows: newRows } = await pool.query(
          `INSERT INTO chatbot_session (organization_id, session_token, channel) VALUES (1, $1, 'website') RETURNING chatbot_session_id`,
          [token]
        );
        sessionId = newRows[0].chatbot_session_id;
      }
    } else {
      token = nanoid(21);
      const { rows } = await pool.query(
        `INSERT INTO chatbot_session (organization_id, session_token, channel) VALUES (1, $1, 'website') RETURNING chatbot_session_id`,
        [token]
      );
      sessionId = rows[0].chatbot_session_id;
    }

    // 2. Save user message
    await pool.query(
      `INSERT INTO chatbot_message (chatbot_session_id, role, content) VALUES ($1, 'user', $2)`,
      [sessionId, message]
    );

    // 3. Get conversation history (last 10 messages)
    const { rows: historyRows } = await pool.query(
      `SELECT role, content FROM chatbot_message
       WHERE chatbot_session_id = $1
       ORDER BY created_at ASC
       LIMIT 20`,
      [sessionId]
    );

    const history = historyRows.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }],
    }));

    // 4. RAG: retrieve relevant context
    const context = await retrieveContext(message, 5);

    // 5. Build system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // 6. Stream the Gemini response via SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Session-Token", token);

    let fullResponse = "";

    for await (const chunk of chatStream(systemPrompt, history, message)) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ chunk, sessionToken: token })}\n\n`);
    }

    // 7. Save assistant response
    const knowledgeChunkIds = context.map((_, i) => i + 1);
    await pool.query(
      `INSERT INTO chatbot_message (chatbot_session_id, role, content, knowledge_chunks_used)
       VALUES ($1, 'assistant', $2, $3)`,
      [sessionId, fullResponse, knowledgeChunkIds]
    );

    // Update message count
    await pool.query(
      `UPDATE chatbot_session SET message_count = message_count + 2 WHERE chatbot_session_id = $1`,
      [sessionId]
    );

    res.write(`data: ${JSON.stringify({ done: true, sessionToken: token })}\n\n`);
    res.end();
  } catch (err) {
    console.error("POST /api/chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat service unavailable" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "An error occurred" })}\n\n`);
      res.end();
    }
  }
});

/**
 * GET /api/chat/history?sessionToken=xxx
 * Returns message history for a session.
 */
router.get("/history", async (req, res) => {
  try {
    const { sessionToken } = req.query;
    if (!sessionToken || typeof sessionToken !== "string") {
      return res.status(400).json({ error: "sessionToken required" });
    }

    const { rows: session } = await pool.query(
      `SELECT chatbot_session_id FROM chatbot_session WHERE session_token = $1`,
      [sessionToken]
    );

    if (session.length === 0) {
      return res.json({ messages: [] });
    }

    const { rows: messages } = await pool.query(
      `SELECT role, content, created_at FROM chatbot_message
       WHERE chatbot_session_id = $1
       ORDER BY created_at ASC`,
      [session[0].chatbot_session_id]
    );

    res.json({ messages });
  } catch (err) {
    console.error("GET /api/chat/history error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

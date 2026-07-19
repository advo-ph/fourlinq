import { Router } from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "../db.js";
import { LLMRouter, providersFromEnv, AllProvidersFailedError } from "../llm/index.js";
import type { ChatMessage, ContentPart } from "../llm/index.js";
import { retrieveContext } from "../lib/rag.js";

dotenv.config();

const router = Router();

const providers = providersFromEnv();
const llm = providers.length > 0 ? new LLMRouter({ providers }) : null;
if (!llm) {
  console.warn("No LLM provider keys configured — chat will be disabled");
}

// Static fallback only — used if RAG retrieval fails. The primary knowledge
// source is the live `knowledge_chunk` table, retrieved per-query and
// appended to this prompt below at request time.
const SYSTEM_PROMPT = `You are LinQ, the AI assistant for FourlinQ Windows & Doors in the Philippines.

PERSONALITY:
- Professional and direct, like a careful product-information assistant.
- Concise. Default under 120 words. Lead with the answer.
- Bullet points for lists. No fluff openers ("Great question!", "Certainly!").

🚫 ABSOLUTE PROHIBITIONS (NEVER violate, even if asked directly):
- NEVER quote, estimate, or guess a price, price range, "starting from" figure, or peso/dollar amount for any product. If asked about cost, say: "Pricing is custom per project — please contact our sales team at 0925-848-8888 or sales@fourlinq.com for a quote." That is the only acceptable response on pricing.
- NEVER invent specifications, percentages, performance numbers, statistics, CO₂ figures, energy savings percentages, U-values, decibel ratings, or any quantitative claim that is not literally in the LIVE KNOWLEDGE block.
- NEVER present the brochure's 10-year limited-warranty label or its four scope names as complete legal terms, product-specific ratings, or guaranteed remedies. Request the current written warranty for the proposed system.
- NEVER invent a tagline, slogan, or marketing copy. Quote only from the LIVE KNOWLEDGE block.
- NEVER claim coverage of cities, regions, or services (delivery, installation network, payment plans, financing) that are not in the LIVE KNOWLEDGE block. The site has three published locations, not three universally stocked showrooms. If asked about coverage, say it needs confirmation and provide the current sales contact.

KNOWLEDGE SOURCE:
A "LIVE KNOWLEDGE" block follows below with the most relevant source passages
from the FourlinQ site database. Preserve its caveats. A catalog name, brochure
label, image, or marketing statement is not a technical submittal, rating,
quotation, approval, or complete warranty. If the answer is not there, do not
fill the gap from general knowledge.

RULES:
1. If the answer is not literally in the LIVE KNOWLEDGE passages, respond with: "I don't have that detail yet — please contact our sales team at 0925-848-8888 or sales@fourlinq.com." Do not paraphrase. Do not guess.
2. Do not criticize competitors.
3. Suggest the Design Tool (/design-tool) as an illustrative brief when users discuss configurations or finishes; never call it a compatibility or pricing tool.
4. Suggest a consultation when the user reaches a buying stage.
5. Contact: Sales 0925-848-8888, Assistance 0925-896-5978, Landline (02)8563-5363, Email sales@fourlinq.com.
6. Finish lists must be bulleted, never inline prose.
7. IMAGE MODE: if the user sends a photo, identify the architectural context briefly, recommend ONE primary system type with one-sentence reasoning, and ONE finish that suits the surrounding palette. Close by inviting them to open the Design Tool (/design-tool) or contact sales. Stay under 130 words.

GROUNDING CHECKLIST (silent — do not output):
Before sending a reply, scan it for: prices, percentages, any year-count, decibel/U-value numbers, city names not in passages, warranty coverage or remedy claims, taglines, claims about installer networks, or nationwide shipping. If any appear without the source boundary and exact support in the LIVE KNOWLEDGE block, rewrite to remove them or replace them with the confirmation/contact line.`;

interface GeminiHistoryTurn {
  role?: "user" | "model";
  parts?: Array<{ text?: string }>;
}

function normalizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const turn of raw as GeminiHistoryTurn[]) {
    const role: ChatMessage["role"] = turn?.role === "model" ? "assistant" : "user";
    const text = (turn?.parts ?? []).map((p) => p?.text ?? "").join("").trim();
    if (text) out.push({ role, content: text });
  }
  return out;
}

/**
 * POST /api/chat/stream
 * Body: { message: string, history: Array<{ role: "user"|"model", parts: [{text}] }> }
 * Returns: SSE stream — same envelope as before. The router itself is
 * non-streaming; we emit the final response as a single chunk so the
 * existing client keeps working without changes.
 */
router.post("/stream", async (req, res) => {
  if (!llm) {
    return res.status(503).json({ error: "Chat service not configured" });
  }

  const { message, history, sessionId, imageDataUrl } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const sid = sessionId || crypto.randomUUID();
  const hasImage = typeof imageDataUrl === "string" && imageDataUrl.startsWith("data:image/");
  const userContent: string | ContentPart[] = hasImage
    ? [
        { type: "text", text: message },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ]
    : message;

  const messages: ChatMessage[] = [
    ...normalizeHistory(history),
    { role: "user", content: userContent },
  ];

  pool.query(
    "INSERT INTO chat_messages (session_id, role, message, image_url) VALUES ($1, $2, $3, $4)",
    [sid, "user", message, hasImage ? imageDataUrl : null]
  ).catch((e) => console.error("Chat log (user) error:", e));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write(`data: ${JSON.stringify({ sessionId: sid })}\n\n`);

  // Retrieve top-K relevant chunks from the live knowledge_chunk table so
  // edits in the admin Content Manager immediately influence answers.
  // Falls back to the hardcoded SYSTEM_PROMPT if retrieval fails.
  let systemPrompt = SYSTEM_PROMPT;
  try {
    const chunks = await retrieveContext(message, 15);
    if (chunks.length > 0) {
      const contextBlock = chunks
        .map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`)
        .join("\n\n");
      systemPrompt = `${SYSTEM_PROMPT}\n\n[LIVE KNOWLEDGE — top ${chunks.length} matches from the site database]\n${contextBlock}`;
    }
  } catch (e) {
    console.warn("RAG retrieval failed, using static prompt:", (e as Error).message);
  }

  try {
    const reply = await llm.chat({
      systemPrompt,
      messages,
      maxTokens: 1500,
      // Low temperature keeps the model conservative — it sticks to what's
      // in LIVE KNOWLEDGE instead of confidently embellishing.
      temperature: 0.2,
      needsVision: hasImage,
    });

    res.write(`data: ${JSON.stringify({ chunk: reply.text })}\n\n`);

    pool.query(
      "INSERT INTO chat_messages (session_id, role, message) VALUES ($1, $2, $3)",
      [sid, "model", reply.text]
    ).catch((e) => console.error("Chat log (model) error:", e));

    res.write(`data: ${JSON.stringify({ done: true, provider: reply.provider, model: reply.model })}\n\n`);
    res.end();
  } catch (err) {
    const detail = err instanceof AllProvidersFailedError ? err.message : err instanceof Error ? err.message : String(err);
    console.error("Chat stream error:", detail);
    res.write(`data: ${JSON.stringify({ error: "Chat service unavailable" })}\n\n`);
    res.end();
  }
});

router.get("/providers", (_req, res) => {
  if (!llm) return res.json({ providers: [] });
  res.json({ providers: llm.listProviders() });
});

export default router;

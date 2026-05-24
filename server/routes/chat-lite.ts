import { Router } from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import pool from "../db.js";
import { LLMRouter, providersFromEnv, AllProvidersFailedError } from "../llm/index.js";
import type { ChatMessage, ContentPart } from "../llm/index.js";

dotenv.config();

const router = Router();

const providers = providersFromEnv();
const llm = providers.length > 0 ? new LLMRouter({ providers }) : null;
if (!llm) {
  console.warn("No LLM provider keys configured — chat will be disabled");
}

// ─────────────────────────────────────────────
// KNOWLEDGE BASE — 100% verified from official FourlinQ brochures
// Source: src/data/fourlinq-data.ts
// ⚠️ Do NOT add claims not present in the brochure
// ─────────────────────────────────────────────

const KNOWLEDGE_BASE = `
[BRAND]
Company: FourlinQ Windows & Doors
Promise: "A Lifetime of Satisfaction and Peace of Mind."
Core offer: Custom-made Windows & Doors to suit customers' specifications.
Warranty: 10-Year Warranty covering corrosion resistance, long lasting performance, weather resistance, and sound insulation.

[CONTACT — VERIFIED]
Sales: 0925-848-8888
Assistance: 0925-896-5978
Landline: (02)8563-5363
Email: sales@fourlinq.com

[BRANCHES — 4 LOCATIONS]
1. Main Office — #2635 Lamayan St., Sta. Ana, Manila (NCR)
2. Ortigas — CW Home Depot, Unit 41 Doña Julia Vargas Ave., cor. Meralco Avenue, Brgy. Ugong, Pasig City (NCR)
3. Alabang — CW Home Depot, Alabang Zapote Road cor. Filinvest Ave., Westgate Alabang, Muntinlupa (NCR)
4. Cebu Branch — Door 9 Centro Fortuna Building, A.S. Fortuna Street, Banilad, Mandaue City, Cebu

[PRODUCT TYPES — 5 CONFIRMED]
1. Casement (Window) — "Smooth operation. Reliable performance." Hinged on one side, opens outward for maximum ventilation and a clean facade. Benefit: Maximum ventilation and easy cleaning.
2. Sliding (Window & Door) — "Elegant. Versatile. Thoroughly reliable." Slides horizontally along a track — ideal where outward clearance is limited. Benefit: Space-saving, ideal for balconies and wide openings.
3. Special Shapes (Window) — "Make a statement with glass." Can be combined with other window types to create a dramatic feature wall of glass. Supports fully custom geometry.
4. Awning (Window) — "Light and security, beautifully combined." Hinged at the top and opens outward. Provides light and architectural interest where security matters.
5. Slide & Fold (Window & Door) — "Open up your space completely." Panels slide and fold to one side, creating a fully open wall. Ideal for living areas, patios, and entertainment spaces.

[MATERIALS]
1. uPVC — Fire retardant, thermally efficient (multi-chamber design), never rusts or corrodes, no painting or maintenance required, galvanized steel reinforced for security, EPDM gaskets (fully weatherproof), 6mm–12mm glass options, sound insulating. 10-Year Warranty. Compatible with all 11 finishes.
2. Aluminum (New) — Slim sightlines for a modern minimal look, high strength-to-weight ratio, suitable for large-span openings, corrosion-resistant. Compatible with 4 solid finishes only (White, Jet Black, Charcoal Gray, Matte Quartz).

[7 FOURLINQ ADVANTAGES — VERIFIED CLAIMS ONLY]
1. Attractive Appearance — 11 finishes from classic white to rich wood grains, designed to complement any architectural style.
2. Fire Retardant — uPVC is inherently fire retardant, slowing the spread of flames.
3. Thermal Efficiency — Multi-chamber profile traps air to reduce heat transfer, keeping interiors cooler.
4. Corrosion Resistant — Unlike steel, uPVC never rusts — ideal for Philippine humidity, salt air, and heavy rainfall.
5. Long Lasting Performance — 10-year warranty. uPVC does not warp, rot, or require repainting.
6. Weather Resistance — EPDM gaskets and drainage holes ensure a tight seal against rain, wind, and storms.
7. Sound Insulation — Multi-chamber profiles and thick glass (6mm–12mm) significantly reduce outside noise.

[uPVC PROFILE ENGINEERING — 7 FEATURES]
1. Thick Glass — 6mm–12mm for insulation, soundproofing, and impact resistance.
2. Smooth Homogenous Profile — Easy cleaning, no grooves where dirt accumulates.
3. Galvanized Steel Reinforcement — Structural rigidity that resists forced entry and heavy wind loads.
4. Multi-Chamber Profile — Trapped air chambers act as thermal barriers — cooler rooms, lower electricity bills.
5. Internal Glazing Beads — Glass secured from inside — cannot be removed from outside.
6. EPDM Gaskets — Weatherproof seal against rain, wind, dust, and insects.
7. Drainage Holes — Prevents water pooling inside the frame.

[FRAME FINISHES — 11 OPTIONS]
Wood-grain (7): Oak Light, Oak Malt, Woodgray, 2 Wood Black, Dark Oak, Walnut, Golden Oak
Solid (4): White, Jet Black, Charcoal Gray, Matte Quartz

[DIMENSION RANGES (mm)]
Casement: 400–1800mm wide × 400–2100mm tall
Sliding: 600–3600mm wide × 600–2400mm tall
Special Shapes: 300–3000mm wide × 300–3000mm tall
Awning: 400–1500mm wide × 300–900mm tall
Slide & Fold: 1800–6000mm wide × 2000–2800mm tall
`;

const SYSTEM_PROMPT = `You are LinQ, the AI assistant for FourlinQ Windows & Doors — a premium uPVC and aluminum windows and doors company in the Philippines.

PERSONALITY:
- Professional and direct, like a knowledgeable showroom consultant.
- Concise. Default under 120 words. Lead with the answer.
- Bullet points for lists. No fluff openers ("Great question!", "Certainly!").

KNOWLEDGE:
${KNOWLEDGE_BASE}

RULES:
1. ONLY state facts present in your KNOWLEDGE section. Never invent specifications, prices, or features.
2. For pricing or specs not listed: "Contact our sales team — 0925-848-8888 or sales@fourlinq.com."
3. Custom quotes only. No prices in chat.
4. Do not criticize competitors.
5. Suggest the Design Tool (/design-tool) when users discuss configurations or finishes.
6. Suggest a consultation when the user reaches a buying stage.
7. Contact: Sales 0925-848-8888, Assistance 0925-896-5978, Landline (02)8563-5363, Email sales@fourlinq.com.
8. Finish lists must be bulleted, never inline prose. Aluminum supports four solid finishes: White, Jet Black, Charcoal Gray, Matte Quartz — one bullet each.
9. Warranty is 10-Year, covering corrosion resistance, long lasting performance, weather resistance, and sound insulation.
10. IMAGE MODE: if the user sends a photo, treat it as a wall/room/facade they want windows for. Identify the architectural context briefly (e.g. "looks like a modern facade with a wide horizontal opening"), then recommend ONE primary system type from our 5 with one-sentence reasoning, and ONE finish from our 11 that suits the surrounding palette. Close by inviting them to open the Design Tool (/design-tool) or contact sales. Stay under 130 words.`;

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

  try {
    const reply = await llm.chat({
      systemPrompt: SYSTEM_PROMPT,
      messages,
      maxTokens: 600,
      temperature: 0.6,
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

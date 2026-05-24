import type { VercelRequest, VercelResponse } from "@vercel/node";
import { LLMRouter, providersFromEnv, AllProvidersFailedError } from "../_llm/index.js";
import type { ChatMessage, ContentPart } from "../_llm/index.js";

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
1. Casement (Window) — Hinged on one side, opens outward. Maximum ventilation and easy cleaning.
2. Sliding (Window & Door) — Slides horizontally along a track. Space-saving, ideal for balconies and wide openings.
3. Special Shapes (Window) — Combined with other window types to create a dramatic feature wall of glass. Fully custom geometry.
4. Awning (Window) — Hinged at the top, opens outward. Provides light and architectural interest where security matters.
5. Slide & Fold (Window & Door) — Panels slide and fold to one side, creating a fully open wall.

[MATERIALS]
1. uPVC — Fire retardant, thermally efficient (multi-chamber), never rusts, no painting, galvanized steel reinforced, EPDM gaskets, 6mm–12mm glass, sound insulating. 10-Year Warranty. All 11 finishes.
2. Aluminum (New) — Slim sightlines, high strength-to-weight ratio, suitable for large-span openings, corrosion-resistant. Compatible with 4 solid finishes only (White, Jet Black, Charcoal Gray, Matte Quartz).

[7 ADVANTAGES]
1. Attractive Appearance — 11 finishes from classic white to rich wood grains.
2. Fire Retardant — uPVC inherently slows flame spread.
3. Thermal Efficiency — Multi-chamber profile reduces heat transfer.
4. Corrosion Resistant — uPVC never rusts.
5. Long Lasting Performance — 10-year warranty, no warp or rot.
6. Weather Resistance — EPDM gaskets and drainage holes.
7. Sound Insulation — Multi-chamber profiles + 6mm–12mm glass.

[FRAME FINISHES — 11]
Wood-grain (7): Oak Light, Oak Malt, Woodgray, 2 Wood Black, Dark Oak, Walnut, Golden Oak
Solid (4): White, Jet Black, Charcoal Gray, Matte Quartz

[DIMENSION RANGES (mm)]
Casement: 400–1800 wide × 400–2100 tall
Sliding: 600–3600 × 600–2400
Special Shapes: 300–3000 × 300–3000
Awning: 400–1500 × 300–900
Slide & Fold: 1800–6000 × 2000–2800
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
10. IMAGE MODE: if the user sends a photo, treat it as a wall/room/facade they want windows for. Identify the architectural context briefly, then recommend ONE primary system type from our 5 with one-sentence reasoning, and ONE finish from our 11 that suits the surrounding palette. Close by inviting them to open the Design Tool (/design-tool) or contact sales. Stay under 130 words.`;

const providers = providersFromEnv();
const llm = providers.length > 0 ? new LLMRouter({ providers }) : null;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!llm) {
    return res.status(503).json({ error: "Chat service not configured" });
  }

  const { message, history, imageDataUrl } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

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

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const reply = await llm.chat({
      systemPrompt: SYSTEM_PROMPT,
      messages,
      maxTokens: 600,
      temperature: 0.6,
      needsVision: hasImage,
    });

    res.write(`data: ${JSON.stringify({ chunk: reply.text })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, provider: reply.provider, model: reply.model })}\n\n`);
    res.end();
  } catch (err) {
    const detail = err instanceof AllProvidersFailedError ? err.message : err instanceof Error ? err.message : String(err);
    console.error("Chat stream error:", detail);
    res.write(`data: ${JSON.stringify({ error: "Chat service unavailable" })}\n\n`);
    res.end();
  }
}

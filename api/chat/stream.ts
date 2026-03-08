import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const KNOWLEDGE_BASE = `
[1] Casement 70 Series Overview
The Casement 70 Series is FourlinQ's flagship casement window. It features a 70mm multi-chamber profile for superior thermal insulation with a Uw value of 1.3 W/m²K. It includes double-sealed weatherstrips and supports up to 28mm glazing capacity. Available in 6 frame finishes (Matte Black, Dark Grey, Bronze, Sand, White, Anthracite) and 4 glass options (Clear Float, Low-E Coated, Frosted Privacy, Tinted Bronze).

[2] Sliding 85 Series Overview
The Sliding 85 Series is a premium sliding window engineered for wide openings and panoramic views. It has an 85mm reinforced profile with a tandem roller system for smooth operation. Supports up to 36mm glazing and includes an anti-lift security block.

[3] Fixed Panorama Panel Overview
The Fixed Panorama Panel is a floor-to-ceiling fixed glass panel designed for maximum natural light. 70mm structural profile, supports up to 44mm triple glazing. Maximum panel size 2.4m x 3.0m.

[4] French Door Classic Overview
Elegant double-leaf door system with 70mm reinforced profile, multi-point espagnolette locking. Low threshold option (20mm). Supports up to 36mm glazing.

[5] Lift & Slide Terrace Overview
Premium lift-and-slide door handling panels up to 200kg. 85mm heavy-duty profile with triple weatherseal. Supports up to 44mm glazing.

[6] Bifold Horizon Overview
Multi-panel folding door, 2-7 panel configurations, 76mm folding profile. Top-hung and bottom-rolling options. Typhoon-rated hardware.

[7] Entrance Prestige Overview
Complete entrance door with 82mm profile, reinforced steel core. 5-point security lock, RC2 burglar resistance.

[8] Curtain Wall System Overview
Commercial/high-rise solution. 50x100mm mullion profile, structural glazing option. Wind load rated up to 3.0 kPa.

[9] uPVC vs Aluminium — Thermal Performance
uPVC Uw 1.3-1.6 W/m²K vs aluminium 3.5-5.0 W/m²K. uPVC reduces AC costs by 30-40% in Philippine climate.

[10] uPVC vs Timber — Maintenance
uPVC requires zero maintenance. Timber needs repainting every 3-5 years, susceptible to termites. uPVC lasts 25+ years.

[11] uPVC Acoustic Performance
Up to 45dB noise reduction. Standard aluminium only 10-15dB.

[12] uPVC Weather Resistance — Philippine Climate
Tested to 200+ km/h typhoon winds. UV stabilizers prevent yellowing 25+ years. Marine-grade stainless hardware.

[13] Warranty: 10-year profiles, 5-year hardware, 2-year glass.

[14] Finishes: Matte Black, Dark Grey, Bronze, Sand, White, Anthracite. Custom RAL on request (10+ units).

[15] Lead time: Standard 4-6 weeks, custom 6-8 weeks, curtain wall 8-12 weeks.

[16] Installation: Certified network covering Metro Manila, Cebu, Davao. Factory-trained.

[17] Pricing: Casement PHP 8,000-15,000/panel. Sliding PHP 12,000-25,000/unit. Doors PHP 35,000-120,000.

[18] About FourlinQ: Premium uPVC, German-engineered profiles, European hardware. Contact: +63 2 8123 4567, info@fourlinq.ph. Showroom: Filinvest City, Alabang.

[19] Installation Process: (1) Free consultation (2) Quotation within 48hrs (3) Production 4-6 weeks (4) Installation 1-2 days (5) Quality inspection.
`;

const SYSTEM_PROMPT = `You are LinQ, the AI assistant for FourlinQ Windows & Doors — a premium uPVC fenestration company in the Philippines.

PERSONALITY:
- Professional yet warm and approachable — like a knowledgeable showroom consultant
- Proud of FourlinQ products without being pushy
- Use Filipino-English (Taglish) sparingly when it feels natural, but default to English
- Be concise — keep responses under 150 words unless the user asks for details
- Use bullet points and line breaks for readability

KNOWLEDGE:
${KNOWLEDGE_BASE}

RULES:
1. Never make up product specifications, prices, or features not in your knowledge
2. For pricing questions, provide the ranges from your knowledge and always recommend a free consultation for exact quotes
3. If asked about competitors, focus on FourlinQ strengths rather than criticizing competitors
4. Proactively suggest the Design Tool (/design-tool) when users discuss configurations
5. Suggest booking a consultation when the conversation reaches a buying stage
6. Contact info: +63 2 8123 4567, info@fourlinq.ph
7. Format responses in clean, readable text with bullet points where appropriate`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Chat service not configured" });
  }

  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chatHistory = Array.isArray(history) ? history : [];
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessageStream(message);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat service unavailable" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "An error occurred" })}\n\n`);
      res.end();
    }
  }
}

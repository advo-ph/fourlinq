import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set — chat will be disabled");
}

const KNOWLEDGE_BASE = `
[1] Casement 70 Series Overview
The Casement 70 Series is FourlinQ's flagship casement window. It features a 70mm multi-chamber profile for superior thermal insulation with a Uw value of 1.3 W/m²K. It includes double-sealed weatherstrips and supports up to 28mm glazing capacity. Available in 6 frame finishes (Matte Black, Dark Grey, Bronze, Sand, White, Anthracite) and 4 glass options (Clear Float, Low-E Coated, Frosted Privacy, Tinted Bronze). Ideal for bedrooms, living rooms, and offices in the Philippines.

[2] Sliding 85 Series Overview
The Sliding 85 Series is a premium sliding window engineered for wide openings and panoramic views. It has an 85mm reinforced profile with a tandem roller system for smooth, effortless operation. Supports up to 36mm glazing and includes an anti-lift security block.

[3] Fixed Panorama Panel Overview
The Fixed Panorama Panel is a floor-to-ceiling fixed glass panel designed for maximum natural light and unobstructed views. It uses a 70mm structural profile and supports up to 44mm triple glazing. Maximum panel size is 2.4m x 3.0m. Can use structural silicone for a frameless exterior look.

[4] French Door Classic Overview
The French Door Classic is an elegant double-leaf door system featuring a 70mm reinforced door profile with multi-point espagnolette locking. Low threshold option (20mm) for seamless indoor-outdoor transitions. Supports up to 36mm glazing.

[5] Lift & Slide Terrace Overview
Premium lift-and-slide door system that handles panels up to 200kg with fingertip ease. 85mm heavy-duty profile with triple weatherseal system. Supports up to 44mm glazing. Designed for luxury Philippine residences, resorts, and condominiums.

[6] Bifold Horizon Overview
Multi-panel folding door system that opens entire walls to the outdoors. Available in 2 to 7 panel configurations with a 76mm folding profile. Top-hung and bottom-rolling options. Typhoon-rated hardware.

[7] Entrance Prestige Overview
Complete entrance door system with 82mm profile and reinforced steel core. 5-point security lock with RC2 burglar resistance rating.

[8] Curtain Wall System Overview
Architectural solution for commercial and high-rise residential. 50x100mm mullion profile with structural glazing option. Wind load rated up to 3.0 kPa.

[9] uPVC vs Aluminium — Thermal Performance
uPVC profiles provide dramatically better thermal insulation than aluminium. A typical uPVC window achieves a Uw value of 1.3-1.6 W/m²K, while aluminium typically rates 3.5-5.0 W/m²K. uPVC can reduce air conditioning costs by 30-40% in the Philippine tropical climate.

[10] uPVC vs Timber — Maintenance
uPVC requires virtually zero maintenance compared to timber. Timber needs repainting every 3-5 years, is susceptible to termites, and can warp with humidity. uPVC retains its appearance for 25+ years. The lifetime cost is significantly lower.

[11] uPVC Acoustic Performance
FourlinQ uPVC windows achieve up to 45dB noise reduction. The multi-chamber profile combined with proper glazing creates multiple air barriers. Standard single-pane aluminium windows only achieve 10-15dB reduction.

[12] uPVC Weather Resistance — Philippine Climate
Engineered for Philippine tropical climate. Withstand typhoon-force winds (tested to 200+ km/h), UV exposure without fading, and extreme humidity. UV stabilizers prevent yellowing for 25+ years. Marine-grade stainless steel hardware for coastal areas.

[13] How long do FourlinQ windows last?
Designed to last 25-30 years. 10-year manufacturer warranty covering profile discoloration and structural integrity. Hardware components carry a 5-year warranty.

[14] What finishes are available?
6 standard finishes: Matte Black, Dark Grey, Bronze, Sand, White, Anthracite. Custom RAL colors available on request for orders above 10 units with 4-week lead time premium.

[15] What is the lead time for orders?
Standard orders: 4-6 weeks. Custom sizes: 6-8 weeks. Curtain wall: 8-12 weeks. Express delivery available at 15% premium.

[16] Do you offer installation services?
Yes, professional installation through certified installer network covering Metro Manila, Cebu, Davao, and major Philippine cities. All installers are factory-trained.

[17] How much do FourlinQ windows cost?
Casement windows: PHP 8,000-15,000 per panel. Sliding windows: PHP 12,000-25,000 per unit. Door systems: PHP 35,000-120,000. Use our Design Tool for exact requirements, or contact us for free consultation.

[18] Objection: uPVC looks cheap
Modern FourlinQ profiles use premium German-engineered formulations with matte, brushed texture resembling powder-coated aluminium. Dark Grey and Anthracite finishes are visually indistinguishable from premium aluminium.

[19] Objection: uPVC cannot handle Philippine typhoons
Profiles reinforced with galvanized steel inserts. Hardware tested for Signal No. 5 typhoons (200+ km/h). Multi-point locking and double/triple weatherseals. Proven in real-world super typhoons in Visayas and Bicol.

[20] About FourlinQ
Premium uPVC manufacturer serving the Philippines. German-engineered profiles and European hardware. Contact: +63 2 8123 4567, info@fourlinq.ph. Showroom in Filinvest City, Alabang, Muntinlupa.

[21] FourlinQ Warranty Policy
10-year warranty on profiles (structural + color). 5-year warranty on hardware. 2-year warranty on glass units. Void if installed by non-certified installers.

[22] Installation Process
5 steps: (1) Free consultation and site survey (2) Custom quotation within 48 hours (3) Production 4-6 weeks (4) Professional installation 1-2 days residential (5) Quality inspection.
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

/**
 * POST /api/chat/stream
 * Body: { message: string, history: Array<{ role: "user"|"model", parts: [{text}] }> }
 * Returns: SSE stream
 */
router.post("/stream", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "Chat service not configured" });
  }

  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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
    console.error("Chat stream error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat service unavailable" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "An error occurred" })}\n\n`);
      res.end();
    }
  }
});

export default router;

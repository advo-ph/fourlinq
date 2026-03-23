import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getAdminContext(): Promise<string> {
  try {
    // Summary counts
    const summary = await pool.query(`
      SELECT type, status, count(*)::int as count
      FROM inquiries
      GROUP BY type, status
      ORDER BY type, status
    `);

    // Recent inquiries (last 20)
    const recent = await pool.query(`
      SELECT id, type, ref_id, name, email, phone, product_name, status,
             created_at, config, message, notes
      FROM inquiries
      ORDER BY created_at DESC
      LIMIT 20
    `);

    // Today's count
    const today = await pool.query(`
      SELECT count(*)::int as count FROM inquiries
      WHERE created_at >= CURRENT_DATE
    `);

    // This week
    const week = await pool.query(`
      SELECT count(*)::int as count FROM inquiries
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    // This month
    const month = await pool.query(`
      SELECT count(*)::int as count FROM inquiries
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Status breakdown
    const statuses = await pool.query(`
      SELECT status, count(*)::int as count FROM inquiries GROUP BY status ORDER BY count DESC
    `);

    // Product popularity
    const products = await pool.query(`
      SELECT product_name, count(*)::int as count
      FROM inquiries
      WHERE product_name IS NOT NULL
      GROUP BY product_name
      ORDER BY count DESC
      LIMIT 10
    `);

    // Leads needing follow-up (status = 'new', older than 24h)
    const stale = await pool.query(`
      SELECT id, ref_id, name, email, type, created_at
      FROM inquiries
      WHERE status = 'new' AND created_at < now() - INTERVAL '24 hours'
      ORDER BY created_at ASC
      LIMIT 10
    `);

    // ─── ANALYTICS ─────────────────────────────
    const pageViews = await pool.query(`
      SELECT
        count(*) FILTER (WHERE created_at >= CURRENT_DATE)::int as today,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::int as week,
        count(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE)::int as visitors_today,
        count(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::int as visitors_week
      FROM analytics WHERE event = 'page_view'
    `);

    const topPages = await pool.query(`
      SELECT page, count(*)::int as views FROM analytics
      WHERE event = 'page_view' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY page ORDER BY views DESC LIMIT 8
    `);

    const topClicks = await pool.query(`
      SELECT target, count(*)::int as clicks FROM analytics
      WHERE event = 'click' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY target ORDER BY clicks DESC LIMIT 10
    `);

    const scrollDepth = await pool.query(`
      SELECT page, round(avg((data->>'depth')::numeric))::int as avg_depth FROM analytics
      WHERE event = 'scroll_depth' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY page ORDER BY avg_depth DESC
    `);

    const topFinishes = await pool.query(`
      SELECT data->>'value' as finish, count(*)::int as tries FROM analytics
      WHERE event = 'config_change' AND data->>'field' = 'finish'
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY data->>'value' ORDER BY tries DESC LIMIT 11
    `);

    const topTypes = await pool.query(`
      SELECT data->>'value' as product_type, count(*)::int as tries FROM analytics
      WHERE event = 'config_change' AND data->>'field' = 'type'
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY data->>'value' ORDER BY tries DESC LIMIT 5
    `);

    const topProductViews = await pool.query(`
      SELECT target as product, count(*)::int as views FROM analytics
      WHERE event = 'product_view' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY target ORDER BY views DESC LIMIT 10
    `);

    const chatOpens = await pool.query(`
      SELECT count(*)::int as total FROM analytics
      WHERE event = 'chat_open' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const pv = pageViews.rows[0] || {};

    return `
[LIVE DATABASE STATS — as of ${new Date().toISOString()}]

── LEADS ──
Leads today: ${today.rows[0].count}
Leads this week: ${week.rows[0].count}
Leads this month: ${month.rows[0].count}
Total leads: ${summary.rows.reduce((s: number, r: { count: number }) => s + r.count, 0)}

By type & status:
${summary.rows.map((r: { type: string; status: string; count: number }) => `  ${r.type} / ${r.status}: ${r.count}`).join("\n")}

Status breakdown:
${statuses.rows.map((r: { status: string; count: number }) => `  ${r.status}: ${r.count}`).join("\n")}

Most requested products (from quotes):
${products.rows.length > 0 ? products.rows.map((r: { product_name: string; count: number }) => `  ${r.product_name}: ${r.count} requests`).join("\n") : "  No product-specific requests yet"}

Stale leads (new > 24h, need follow-up):
${stale.rows.length > 0 ? stale.rows.map((r: { ref_id: string; name: string; email: string; type: string; created_at: string }) => `  ${r.ref_id} — ${r.name} (${r.email}) — ${r.type} — ${new Date(r.created_at).toLocaleDateString()}`).join("\n") : "  None — all leads followed up"}

── WEBSITE ANALYTICS ──
Page views today: ${pv.today || 0} (${pv.visitors_today || 0} unique visitors)
Page views this week: ${pv.week || 0} (${pv.visitors_week || 0} unique visitors)
Chat opens this week: ${chatOpens.rows[0]?.total || 0}

Top pages (last 7 days):
${topPages.rows.length > 0 ? topPages.rows.map((r: { page: string; views: number }) => `  ${r.page}: ${r.views} views`).join("\n") : "  No data yet"}

Top clicked elements (last 7 days):
${topClicks.rows.length > 0 ? topClicks.rows.map((r: { target: string; clicks: number }) => `  "${r.target}": ${r.clicks} clicks`).join("\n") : "  No data yet"}

Average scroll depth per page (last 7 days):
${scrollDepth.rows.length > 0 ? scrollDepth.rows.map((r: { page: string; avg_depth: number }) => `  ${r.page}: ${r.avg_depth}%`).join("\n") : "  No data yet"}

── DESIGN TOOL INSIGHTS ──
Most tried finishes (last 30 days):
${topFinishes.rows.length > 0 ? topFinishes.rows.map((r: { finish: string; tries: number }) => `  ${r.finish}: ${r.tries} tries`).join("\n") : "  No data yet"}

Most tried product types (last 30 days):
${topTypes.rows.length > 0 ? topTypes.rows.map((r: { product_type: string; tries: number }) => `  ${r.product_type}: ${r.tries} tries`).join("\n") : "  No data yet"}

Most viewed products (drawer opens, last 30 days):
${topProductViews.rows.length > 0 ? topProductViews.rows.map((r: { product: string; views: number }) => `  ${r.product}: ${r.views} views`).join("\n") : "  No data yet"}

── RECENT INQUIRIES ──
${recent.rows.map((r: { ref_id: string; type: string; name: string | null; email: string | null; product_name: string | null; status: string; created_at: string; message: string | null }) =>
  `  ${r.ref_id} | ${r.type} | ${r.name || "anon"} | ${r.email || "-"} | ${r.product_name || "-"} | ${r.status} | ${new Date(r.created_at).toLocaleDateString()}`
).join("\n")}
`;
  } catch (err) {
    console.error("Admin context error:", err);
    return "\n[DATABASE UNAVAILABLE — cannot query live stats]\n";
  }
}

const ADMIN_SYSTEM_PROMPT = `You are LinQ Admin, the internal AI assistant for FourlinQ Windows & Doors staff.

ROLE: You help FourlinQ staff manage their business by answering questions about:
1. Lead/inquiry statistics (from live database)
2. Client information and follow-up priorities
3. Company information (brand, products, branches, finishes — from verified brochure data)
4. General business advice for the windows & doors industry

PERSONALITY:
- Professional, concise, data-driven
- Present numbers clearly with context
- Proactively flag urgent items (stale leads, high-value opportunities)
- Use tables and bullet points for data

COMPANY KNOWLEDGE:
- FourlinQ Windows & Doors — custom-made uPVC windows and doors
- 10-Year Warranty (corrosion, performance, weather, sound)
- 5 product types: Casement, Sliding, Special Shapes, Awning, Slide & Fold
- 2 materials: uPVC (11 finishes), Aluminum (4 solid finishes)
- 4 branches: Manila Main Office, Ortigas CW Home Depot, Alabang CW Home Depot, Cebu Branch
- Contact: Sales 0925-848-8888, Assistance 0925-896-5978, Email sales@fourlinq.com

RULES:
1. When asked about stats, leads, or clients — use the LIVE DATABASE section below
2. When asked about products, finishes, advantages — use company knowledge
3. If data seems empty, say "No data yet" rather than making up numbers
4. For client lookups, show all available details (name, email, phone, product, status, date)
5. Suggest actionable next steps (e.g., "This lead has been waiting 3 days — consider calling them")
`;

router.post("/stream", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "Chat service not configured" });
  }

  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    // Inject live stats into system prompt
    const liveContext = await getAdminContext();
    const fullPrompt = ADMIN_SYSTEM_PROMPT + "\n" + liveContext;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: fullPrompt,
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
    console.error("Admin chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat service unavailable" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "An error occurred" })}\n\n`);
      res.end();
    }
  }
});

export default router;

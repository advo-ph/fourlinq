import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * POST /api/analytics
 * Body: { sessionId, event, page?, target?, data?, referrer?, screenW?, screenH? }
 * Public — no auth required (tracking pixel pattern)
 */
router.post("/", async (req, res) => {
  const { sessionId, event, page, target, data, referrer, screenW, screenH } = req.body;

  if (!sessionId || !event) {
    return res.status(400).json({ error: "sessionId and event required" });
  }

  try {
    await pool.query(
      `INSERT INTO analytics (session_id, event, page, target, data, referrer, user_agent, screen_w, screen_h)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        sessionId,
        event,
        page || null,
        target || null,
        data ? JSON.stringify(data) : "{}",
        referrer || null,
        req.headers["user-agent"] || null,
        screenW || null,
        screenH || null,
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Analytics write error:", err);
    // Silently fail — don't break user experience for analytics
    res.json({ ok: true });
  }
});

/**
 * GET /api/admin/analytics/summary
 * Protected by requireAdmin middleware (applied in index.ts)
 */
router.get("/summary", async (_req, res) => {
  try {
    // Page views today / week / month
    const pageViews = await pool.query(`
      SELECT
        count(*) FILTER (WHERE created_at >= CURRENT_DATE)::int as today,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::int as week,
        count(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')::int as month,
        count(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE)::int as visitors_today,
        count(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::int as visitors_week
      FROM analytics WHERE event = 'page_view'
    `);

    // Top pages
    const topPages = await pool.query(`
      SELECT page, count(*)::int as views, count(DISTINCT session_id)::int as unique_visitors
      FROM analytics WHERE event = 'page_view' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY page ORDER BY views DESC LIMIT 10
    `);

    // Top clicked elements
    const topClicks = await pool.query(`
      SELECT target, count(*)::int as clicks
      FROM analytics WHERE event = 'click' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY target ORDER BY clicks DESC LIMIT 15
    `);

    // Scroll depth averages per page
    const scrollDepth = await pool.query(`
      SELECT page, round(avg((data->>'depth')::numeric))::int as avg_depth, count(*)::int as samples
      FROM analytics WHERE event = 'scroll_depth' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY page ORDER BY avg_depth DESC
    `);

    // Design tool: most tried finishes
    const topFinishes = await pool.query(`
      SELECT data->>'finish' as finish, count(*)::int as tries
      FROM analytics WHERE event = 'config_change' AND data->>'field' = 'finish'
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY data->>'finish' ORDER BY tries DESC LIMIT 11
    `);

    // Design tool: most tried product types
    const topTypes = await pool.query(`
      SELECT data->>'value' as product_type, count(*)::int as tries
      FROM analytics WHERE event = 'config_change' AND data->>'field' = 'type'
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY data->>'value' ORDER BY tries DESC LIMIT 10
    `);

    // Products viewed (drawer opened)
    const topProducts = await pool.query(`
      SELECT target as product, count(*)::int as views
      FROM analytics WHERE event = 'product_view' AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY target ORDER BY views DESC LIMIT 10
    `);

    // Referrers
    const referrers = await pool.query(`
      SELECT referrer, count(DISTINCT session_id)::int as visitors
      FROM analytics WHERE event = 'page_view' AND referrer IS NOT NULL AND referrer != ''
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY referrer ORDER BY visitors DESC LIMIT 10
    `);

    // Daily visitors (last 14 days)
    const daily = await pool.query(`
      SELECT created_at::date as day, count(DISTINCT session_id)::int as visitors, count(*)::int as events
      FROM analytics WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY created_at::date ORDER BY day DESC
    `);

    res.json({
      pageViews: pageViews.rows[0],
      topPages: topPages.rows,
      topClicks: topClicks.rows,
      scrollDepth: scrollDepth.rows,
      topFinishes: topFinishes.rows,
      topTypes: topTypes.rows,
      topProducts: topProducts.rows,
      referrers: referrers.rows,
      daily: daily.rows,
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;

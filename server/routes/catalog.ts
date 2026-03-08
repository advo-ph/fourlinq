import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * GET /api/product-types
 * Returns all product types with category info and icon keys.
 * Used by Navbar mega menu and Design Tool.
 */
router.get("/product-types", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        pt.product_type_id,
        pt.slug AS id,
        pt.name,
        pt.icon_key AS "iconKey",
        pt.opening_mechanism AS "openingMechanism",
        pc.slug AS category,
        pc.name AS "categoryName"
      FROM product_type pt
      JOIN product_category pc ON pt.product_category_id = pc.product_category_id
      WHERE pt.is_active = true
      ORDER BY pc.sort_order, pt.sort_order`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/product-types error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/finishes
 * Returns all active finishes with name, slug, hex color.
 * Used by Design Tool and Product Drawer.
 */
router.get("/finishes", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        finish_id,
        slug AS id,
        name,
        hex_color AS color,
        finish_type AS "finishType"
      FROM finish
      WHERE is_active = true
      ORDER BY sort_order`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/finishes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/glass-types
 * Returns all active glass types.
 * Used by Design Tool and Product Drawer.
 */
router.get("/glass-types", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        glass_type_id,
        slug AS id,
        name,
        glass_category AS "glassCategory",
        u_value AS "uValue",
        shgc,
        acoustic_db AS "acousticDb"
      FROM glass_type
      WHERE is_active = true
      ORDER BY sort_order`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/glass-types error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/projects
 * Returns all featured projects for the portfolio/gallery.
 */
router.get("/projects", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        project_number AS id,
        name,
        location,
        image_url AS image
      FROM project
      WHERE is_featured = true AND deleted_at IS NULL
      ORDER BY sort_order`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/projects error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

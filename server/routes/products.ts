import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * GET /api/products
 * Optional query: ?category=windows|doors|systems
 * Returns all active products with their category slug, product type info, specs, finishes, and glass options.
 */
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    let whereClause = "WHERE p.is_active = true AND p.deleted_at IS NULL";
    const params: string[] = [];

    if (category && typeof category === "string") {
      params.push(category);
      whereClause += ` AND pc.slug = $${params.length}`;
    }

    const { rows: products } = await pool.query(
      `
      SELECT
        p.product_id,
        p.slug AS id,
        p.name,
        pc.slug AS category,
        p.description,
        p.short_description AS "shortDescription",
        p.thumbnail_url AS image,
        p.is_featured AS "isFeatured",
        p.sort_order,
        pt.name AS "typeName",
        pt.icon_key AS "iconKey",
        pt.slug AS "typeSlug"
      FROM product p
      JOIN product_type pt ON p.product_type_id = pt.product_type_id
      JOIN product_category pc ON pt.product_category_id = pc.product_category_id
      ${whereClause}
      ORDER BY p.sort_order
      `,
      params
    );

    // For each product, fetch specs, finishes, and glass options
    const enriched = await Promise.all(
      products.map(async (product) => {
        const [specsResult, finishesResult, glassResult] = await Promise.all([
          pool.query(
            `SELECT label AS value FROM product_feature WHERE product_id = $1 ORDER BY sort_order`,
            [product.product_id]
          ),
          pool.query(
            `SELECT f.name, f.hex_color AS color
             FROM product_finish pf
             JOIN finish f ON pf.finish_id = f.finish_id
             WHERE pf.product_id = $1
             ORDER BY f.sort_order`,
            [product.product_id]
          ),
          pool.query(
            `SELECT gt.name
             FROM product_glass pg
             JOIN glass_type gt ON pg.glass_type_id = gt.glass_type_id
             WHERE pg.product_id = $1
             ORDER BY gt.sort_order`,
            [product.product_id]
          ),
        ]);

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          shortDescription: product.shortDescription,
          image: product.image,
          specs: specsResult.rows.map((r) => r.value),
          finishes: finishesResult.rows,
          glassOptions: glassResult.rows.map((r) => r.name),
          typeName: product.typeName,
          iconKey: product.iconKey,
          typeSlug: product.typeSlug,
          isFeatured: product.isFeatured,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/products/:slug
 * Returns a single product by slug with full details.
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const { rows } = await pool.query(
      `
      SELECT
        p.product_id,
        p.slug AS id,
        p.name,
        pc.slug AS category,
        p.description,
        p.short_description AS "shortDescription",
        p.thumbnail_url AS image,
        pt.name AS "typeName",
        pt.icon_key AS "iconKey"
      FROM product p
      JOIN product_type pt ON p.product_type_id = pt.product_type_id
      JOIN product_category pc ON pt.product_category_id = pc.product_category_id
      WHERE p.slug = $1 AND p.is_active = true AND p.deleted_at IS NULL
      `,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = rows[0];

    const [specsResult, finishesResult, glassResult] = await Promise.all([
      pool.query(
        `SELECT label AS value, feature_type FROM product_feature WHERE product_id = $1 ORDER BY sort_order`,
        [product.product_id]
      ),
      pool.query(
        `SELECT f.name, f.hex_color AS color
         FROM product_finish pf
         JOIN finish f ON pf.finish_id = f.finish_id
         WHERE pf.product_id = $1
         ORDER BY f.sort_order`,
        [product.product_id]
      ),
      pool.query(
        `SELECT gt.name
         FROM product_glass pg
         JOIN glass_type gt ON pg.glass_type_id = gt.glass_type_id
         WHERE pg.product_id = $1
         ORDER BY gt.sort_order`,
        [product.product_id]
      ),
    ]);

    res.json({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      shortDescription: product.shortDescription,
      image: product.image,
      specs: specsResult.rows.map((r) => r.value),
      finishes: finishesResult.rows,
      glassOptions: glassResult.rows.map((r) => r.name),
      typeName: product.typeName,
      iconKey: product.iconKey,
    });
  } catch (err) {
    console.error("GET /api/products/:slug error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

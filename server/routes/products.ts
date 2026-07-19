import { Router } from "express";
import pool from "../db.js";
import { products as staticProducts } from "../../src/data/products.js";

const router = Router();

/**
 * Safety net: if Tita blanks a product's finish_labels / glass_labels /
 * spec_labels in the CMS, fall back to what the static catalog has for that
 * product so the page doesn't render an empty section. Keyed by slug.
 */
const STATIC_BY_SLUG = new Map(staticProducts.map((p) => [p.id, p]));

interface ProductOptionRow {
  id: string;
  spec_labels?: string[] | null;
  finish_labels?: string[] | null;
  glass_labels?: string[] | null;
}

async function resolveProductOption(product: ProductOptionRow) {
  const fallback = STATIC_BY_SLUG.get(product.id);
  const specs = Array.isArray(product.spec_labels) ? product.spec_labels : (fallback?.specs ?? []);
  const glassOptions = Array.isArray(product.glass_labels) ? product.glass_labels : (fallback?.glassOptions ?? []);
  const finishName = Array.isArray(product.finish_labels)
    ? product.finish_labels
    : (fallback?.finishes.map((finish) => finish.name) ?? []);

  let finishes: { name: string; color: string }[] = [];
  if (finishName.length > 0) {
    const { rows: finishRow } = await pool.query(
      `SELECT name, hex_color AS color FROM finish WHERE name = ANY($1::text[])`,
      [finishName],
    );
    const colorByName = new Map(finishRow.map((finish) => [finish.name, finish.color]));
    const staticColorByName = new Map(fallback?.finishes.map((finish) => [finish.name, finish.color]) ?? []);
    finishes = finishName.map((name) => ({
      name,
      color: colorByName.get(name) ?? staticColorByName.get(name) ?? "#cccccc",
    }));
  }

  return { specs, finishes, glassOptions };
}

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
        p.youtube_id AS "youtubeId",
        p.finish_labels,
        p.glass_labels,
        p.spec_labels,
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

    // Editable arrays are the only public option source. When they are null,
    // use the source-bounded bundled entry; never resurrect the retained legacy
    // join rows, which remain in the database for audit/recovery only.
    const enriched = await Promise.all(
      products.map(async (product) => {
        const { specs, finishes, glassOptions } = await resolveProductOption(product);

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          shortDescription: product.shortDescription,
          image: product.image,
          specs,
          finishes,
          glassOptions,
          typeName: product.typeName,
          iconKey: product.iconKey,
          typeSlug: product.typeSlug,
          isFeatured: product.isFeatured,
          youtubeId: product.youtubeId || undefined,
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
        p.youtube_id AS "youtubeId",
        p.finish_labels,
        p.glass_labels,
        p.spec_labels,
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

    const { specs, finishes, glassOptions } = await resolveProductOption(product);

    res.json({
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      shortDescription: product.shortDescription,
      image: product.image,
      specs,
      finishes,
      glassOptions,
      typeName: product.typeName,
      iconKey: product.iconKey,
      youtubeId: product.youtubeId || undefined,
    });
  } catch (err) {
    console.error("GET /api/products/:slug error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

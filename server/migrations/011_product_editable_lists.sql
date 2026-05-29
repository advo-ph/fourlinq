-- Migration 011: editable text[] columns on product for finishes / glass / specs
--
-- Why: today these come from product_finish, product_glass, product_feature
-- joins, which require ON CONFLICT-style joins to edit. The CMS supports
-- string_array fields natively, so denormalizing to columns gives Tita a
-- one-screen editor without us building a custom related-rows UI.
--
-- Trade-off: we lose referential integrity (Tita could type a finish label
-- that doesn't match a finish.name). Acceptable — the join tables stay for
-- cross-system queries; the editable columns are display-time only.
--
-- Apply on the VPS:
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/011_product_editable_lists.sql

BEGIN;

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS finish_labels text[],
  ADD COLUMN IF NOT EXISTS glass_labels  text[],
  ADD COLUMN IF NOT EXISTS spec_labels   text[];

COMMENT ON COLUMN product.finish_labels IS
  'Display-time list of finish names per product. Editable from CMS. Backfilled from product_finish join.';
COMMENT ON COLUMN product.glass_labels IS
  'Display-time list of glass option names per product. Editable from CMS. Backfilled from product_glass join.';
COMMENT ON COLUMN product.spec_labels IS
  'Display-time list of spec bullet strings per product. Editable from CMS. Backfilled from product_feature join.';

-- Backfill from existing joins so the page renders identically pre + post-cutover.
UPDATE product p
   SET finish_labels = sub.finishes
  FROM (
    SELECT pf.product_id, ARRAY_AGG(f.name ORDER BY f.sort_order) AS finishes
      FROM product_finish pf JOIN finish f ON pf.finish_id = f.finish_id
     GROUP BY pf.product_id
  ) sub
 WHERE p.product_id = sub.product_id;

UPDATE product p
   SET glass_labels = sub.glass
  FROM (
    SELECT pg.product_id, ARRAY_AGG(gt.name ORDER BY gt.sort_order) AS glass
      FROM product_glass pg JOIN glass_type gt ON pg.glass_type_id = gt.glass_type_id
     GROUP BY pg.product_id
  ) sub
 WHERE p.product_id = sub.product_id;

UPDATE product p
   SET spec_labels = sub.specs
  FROM (
    SELECT product_id, ARRAY_AGG(label ORDER BY sort_order) AS specs
      FROM product_feature
     GROUP BY product_id
  ) sub
 WHERE p.product_id = sub.product_id;

GRANT ALL ON TABLE product TO fourlinq;

COMMIT;

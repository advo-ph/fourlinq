-- Migration 008: add youtube_id column to product
--
-- Why: Tita supplied a Slide & Fold reference video (2026-05-28). The Product
-- TypeScript interface gained an optional `youtubeId` field; this aligns the
-- DB schema with it so DB-backed products can carry the same data.
--
-- Risk: low. Single nullable column add on a table with <100 rows. No
-- downtime, no backfill required (column defaults to NULL).
--
-- Apply on the VPS:
--   ssh advo
--   psql -U fourlinq -d fourlinq -f /opt/fourlinq/server/migrations/008_product_youtube.sql

BEGIN;

ALTER TABLE product
  ADD COLUMN IF NOT EXISTS youtube_id text;

COMMENT ON COLUMN product.youtube_id IS
  'Optional YouTube video ID (e.g. "-8XwIKAtAAc"). Renders an embed in the product detail panel. NULL = no video.';

-- Seed the one product Tita already supplied a video for, matching the static
-- catalog entry in src/data/products.ts.
UPDATE product
   SET youtube_id = '-8XwIKAtAAc'
 WHERE slug IN ('slide-and-fold', 'bifold-system', 'bifold-horizon');

COMMIT;

-- Migration 009: add missing product_type rows so the seed cutover can map
-- every static catalog entry to a real product_type_id.
--
-- Why: the existing 002_seed.sql only seeds 10 product_type rows. The static
-- catalog (src/data/products.ts) has 14 distinct product types — these 9 are
-- missing or named differently:
--
--   special-shapes, slide-and-fold (existed as 'bifold'), casement-door,
--   large-panel-doors, lift-and-slide (existed as 'lift-slide'),
--   90-series, arch-shapes, curtain-wall, custom-shapes
--
-- Apply on the VPS:
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/009_product_types_for_cutover.sql

BEGIN;

-- 1. Ensure the 'specialist' product_category exists (002_seed.sql only had windows + doors).
--    product_category_id is GENERATED ALWAYS — let the identity column assign.
INSERT INTO product_category (name, slug, sort_order)
SELECT 'Specialist', 'specialist', 3
WHERE NOT EXISTS (SELECT 1 FROM product_category WHERE slug = 'specialist');

-- 2. Insert missing product_type rows. Look up category_id by slug so the
--    inserts work regardless of what id 'specialist' got above.
INSERT INTO product_type (organization_id, product_category_id, name, slug, icon_key, opening_mechanism, is_operable, requires_track, sort_order)
SELECT 1, pc.product_category_id, v.name, v.slug, v.icon_key, v.opening_mechanism, v.is_operable, v.requires_track, v.sort_order
FROM (VALUES
  -- (category_slug, name, slug, icon_key, opening_mechanism, is_operable, requires_track, sort_order)
  ('windows',    'Special Shapes',    'special-shapes',     'special-shapes',  'fixed',        false, false, 5),
  ('doors',      'Slide & Fold',      'slide-and-fold',     'bifold',          'fold',         true,  true,  7),
  ('doors',      'Casement Door',     'casement-door',      'casement',        'side_hinge',   true,  false, 8),
  ('doors',      'Large Panel Doors', 'large-panel-doors',  'large-panel',     'slide',        true,  true,  9),
  ('doors',      'Lift & Slide',      'lift-and-slide',     'lift-and-slide',  'lift-slide',   true,  true, 10),
  ('doors',      '90 Series',         '90-series',          '90-series',       'slide',        true,  true, 11),
  ('specialist', 'Arch Shapes',       'arch-shapes',        'arch',            'fixed',        false, false, 1),
  ('specialist', 'Curtain Wall',      'curtain-wall',       'curtain-wall',    'fixed',        false, false, 2),
  ('specialist', 'Custom Shapes',     'custom-shapes',      'custom-shapes',   'fixed',        false, false, 3)
) AS v(category_slug, name, slug, icon_key, opening_mechanism, is_operable, requires_track, sort_order)
JOIN product_category pc ON pc.slug = v.category_slug
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 3. Grant the app user permission to truncate + reseed the product tables.
--    Required because seed-products.ts (run as the fourlinq app user) needs to
--    truncate sequences owned by postgres.
GRANT ALL ON SCHEMA public TO fourlinq;
GRANT ALL ON ALL TABLES IN SCHEMA public TO fourlinq;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO fourlinq;

COMMIT;

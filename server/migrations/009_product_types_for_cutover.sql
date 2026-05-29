-- Migration 009: add missing product_type rows so the seed cutover can map
-- every static catalog entry to a real product_type_id.
--
-- Why: the existing 002_seed.sql only seeds 10 product_type rows. The static
-- catalog (src/data/products.ts) has 14 distinct product types — these 8 are
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

-- Insert any missing product_type rows. ON CONFLICT keeps existing rows
-- untouched.
INSERT INTO product_type (organization_id, product_category_id, name, slug, icon_key, opening_mechanism, is_operable, requires_track, sort_order)
VALUES
  -- Windows additions
  (1, 1, 'Special Shapes', 'special-shapes', 'special-shapes', 'fixed',        false, false, 5),
  -- Doors additions / renames (use new slugs that match the static catalog)
  (1, 2, 'Slide & Fold',     'slide-and-fold',     'bifold',          'fold',         true,  true,  7),
  (1, 2, 'Casement Door',    'casement-door',      'casement',        'side_hinge',   true,  false, 8),
  (1, 2, 'Large Panel Doors','large-panel-doors',  'large-panel',     'slide',        true,  true,  9),
  (1, 2, 'Lift & Slide',     'lift-and-slide',     'lift-and-slide',  'lift-slide',   true,  true, 10),
  (1, 2, '90 Series',        '90-series',          '90-series',       'slide',        true,  true, 11),
  -- Specialist additions
  (1, 3, 'Arch Shapes',      'arch-shapes',        'arch',            'fixed',        false, false, 1),
  (1, 3, 'Curtain Wall',     'curtain-wall',       'curtain-wall',    'fixed',        false, false, 2),
  (1, 3, 'Custom Shapes',    'custom-shapes',      'custom-shapes',   'fixed',        false, false, 3)
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Ensure the 'specialist' product_category exists (002_seed.sql only had windows + doors).
INSERT INTO product_category (product_category_id, name, slug, sort_order)
VALUES (3, 'Specialist', 'specialist', 3)
ON CONFLICT (product_category_id) DO NOTHING;

COMMIT;

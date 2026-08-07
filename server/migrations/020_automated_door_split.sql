-- Migration 020: split door automation out of automated-window
--
-- Why: the 2026-07-10 client meeting named TWO separate things —
--
--   "Automate your door, meron din kami. Gusto mo magkaroon ng
--    digital access, meron din kami."          00:20:47   -> a DOOR
--   "Window opening devices. Meron din tayo yan."  00:21:11   -> a WINDOW
--
-- Migration 019 answered both with one product, automated-window, filed under
-- windows. That left the door ask unreachable from /products?filter=doors —
-- the one place a customer following up on that remark would look. This
-- migration adds the door half as its own product and narrows the window half's
-- copy to stop it claiming door scope.
--
--   automated-door     -> doors     (digital access + motorised door leaf)
--   automated-window   -> windows   (opening devices only; copy narrowed)
--
-- Idempotent: the insert uses ON CONFLICT DO NOTHING; the UPDATE is written to
-- be safe to re-run (it sets absolute values, not deltas) and is scoped by slug.
--
-- Down path: explicit no-down, same reasoning as 019. Deleting a product row in
-- production after a partial apply is the 017 failure mode. To withdraw this
-- product, write a later migration setting is_active = false; to undo the copy
-- narrowing, write the previous string back explicitly in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/020_automated_door_split.sql

BEGIN;

-- 1. product_type row so the product FK resolves by slug.
INSERT INTO product_type (
  organization_id,
  product_category_id,
  name,
  slug,
  icon_key,
  opening_mechanism,
  is_operable,
  requires_track,
  sort_order
)
SELECT
  1,
  pc.product_category_id,
  v.name,
  v.slug,
  v.icon_key,
  v.opening_mechanism,
  v.is_operable,
  v.requires_track,
  v.sort_order
FROM (VALUES
  ('doors', 'Automated Door Access', 'automated-door', 'automated-door', 'motorised', true, false, 13)
) AS v(category_slug, name, slug, icon_key, opening_mechanism, is_operable, requires_track, sort_order)
JOIN product_category pc ON pc.slug = v.category_slug
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 2. product row, same denormalized shape as 019 (migration 011 columns).
INSERT INTO product (
  organization_id,
  product_type_id,
  name,
  slug,
  short_description,
  description,
  thumbnail_url,
  is_active,
  is_featured,
  sort_order,
  finish_labels,
  glass_labels,
  spec_labels
)
SELECT
  1,
  pt.product_type_id,
  v.name,
  v.slug,
  v.short_description,
  v.description,
  v.thumbnail_url,
  true,
  false,
  v.sort_order,
  v.finish_labels,
  v.glass_labels,
  v.spec_labels
FROM (VALUES
  (
    'automated-door',
    'Automated Door Access',
    'Enter without a key. Close without a pull.',
    'Digital access and motorised operation for door leaves — keypad, card, fob, or app entry, with automatic opening where the leaf and frame allow it. For main entries, offices, and shared entrances that should open without a key and close without being pulled. Answers the automate-your-door / digital access ask from the 2026-07-10 client meeting (00:20:47). Lock integration, power, and control scope are project-specified — not a single SKU. Consultation required for leaf weight, fire-egress rules, and power provision.',
    '/images/products/schematic/automated-door.svg',
    19,
    ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
    ARRAY['Clear Float','Frosted Privacy','Low-E Coated','Laminated Safety']::text[],
    ARRAY[
      'Digital access: keypad, card, fob, or app (project-specified)',
      'Motorised opening for compatible door leaves',
      'Integrates with multi-point locking',
      'Suited to main entries and shared entrances',
      '⚠️ Indicative only — leaf weight, egress compliance, and power by project consultation'
    ]::text[]
  )
) AS v(slug, name, short_description, description, thumbnail_url, sort_order, finish_labels, glass_labels, spec_labels)
JOIN product_type pt ON pt.slug = v.slug AND pt.organization_id = 1
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 3. Narrow automated-window so it no longer claims door scope. Absolute
--    values, scoped by slug — safe to re-run.
UPDATE product
SET
  short_description = 'Open a high window without the ladder.',
  description = 'Motorised window opening devices for operable windows. Open high or hard-to-reach sashes without climbing; pair with wall switches, remotes, or building controls where specified. Answers the window opening devices ask from the 2026-07-10 client meeting (00:21:11) — door automation and digital access is a separate product, Automated Door Access, filed under doors. Hardware and control scope are project-specified — not a single SKU. Consultation required for load, travel, and power.',
  spec_labels = ARRAY[
    'Motorised window opening devices',
    'Wall switch, remote, or building-control integration (project-specified)',
    'Suited to high, large, or hard-to-reach operable units',
    '⚠️ Indicative only — actuator load, travel, and power by project consultation'
  ]::text[]
WHERE organization_id = 1 AND slug = 'automated-window';

COMMIT;

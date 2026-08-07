-- Migration 019: Aug 7 product additions (glass-railing, sc-door, louvre, automated-window)
--
-- Why: the 2026-07-10 client meeting named products that never landed in the
-- catalog (MEETING_INSTRUCTION_INVENTORY §2 glass railing at 00:10:14; §3
-- automate your door / digital access at 00:20:47 and window opening devices
-- at 00:21:11). This lane ships four fixed ids that other lanes key off:
--
--   glass-railing      → specialist  (Glass is a product LINE, not a 4th type)
--   sc-door            → doors       (Sliding Casement — never "glider")
--   louvre             → windows
--   automated-window   → windows     (opening devices + digital-access surface)
--
-- USE_API=true: /api/products reads Postgres. product_type rows are required
-- for seed-products.ts; product rows with finish_labels / glass_labels /
-- spec_labels keep the API shape aligned with src/data/products.ts without
-- a full reseed.
--
-- Idempotent: product_type and product inserts use ON CONFLICT DO NOTHING.
-- Safe to re-run by hand (no ledger / no runner — see commit 1961d1c).
--
-- Down path: explicit no-down. Deleting these rows in production after a
-- partial apply is the 017 failure mode (migration shipped, file deleted,
-- production still carries schema). If a product must be withdrawn, write a
-- later migration that sets is_active = false rather than DROP/DELETE here.
--
-- Apply on the VPS (do NOT run from a laptop against production from this
-- lane session — ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/019_aug07_product_additions.sql
--
-- After apply, optional full reseed (overwrites all product rows from static):
--   cd /opt/fourlinq && export $(grep -v '^#' .env | xargs) && npx tsx server/scripts/seed-products.ts

BEGIN;

-- Ensure specialist category exists (009 already adds it; re-assert for safety).
INSERT INTO product_category (name, slug, sort_order)
SELECT 'Specialist', 'specialist', 3
WHERE NOT EXISTS (SELECT 1 FROM product_category WHERE slug = 'specialist');

-- 1. product_type rows so seed-products.ts and product FKs can resolve by slug.
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
  ('specialist', 'Glass Railing',                         'glass-railing',     'glass-railing',     'fixed',      false, false, 4),
  ('doors',      'SC-Door System (Sliding Casement Door)', 'sc-door',           'sc-door',           'slide',      true,  true,  12),
  ('windows',    'Louvre Windows',                        'louvre',            'louvre',            'louvre',     true,  false, 6),
  ('windows',    'Automated Windows',                     'automated-window',  'automated-window',  'motorised',  true,  false, 7)
) AS v(category_slug, name, slug, icon_key, opening_mechanism, is_operable, requires_track, sort_order)
JOIN product_category pc ON pc.slug = v.category_slug
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 2. product rows with denormalized list columns (migration 011 shape) so
--    /api/products returns the same fields as the static catalog.
--    Finish labels match FRAME_FINISHES labels in fourlinq-data.ts.

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
    'glass-railing',
    'Glass Railing',
    'Open views. Safety glass at the edge.',
    'Frameless or minimal-framed glass railing and balcony systems for residential and commercial openings. Tempered safety glass panels with discrete hardware, suited to balconies, mezzanines, stair edges, and terrace edges where the view should stay open. Project-specified: panel height, mounting detail, and glass type are set per drawing. Consultation required for structural fixings and local code.',
    '/images/products/schematic/glass-railing.svg',
    15,
    ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
    ARRAY['Clear Float','Low-E Coated','Tinted Grey','Laminated Safety']::text[],
    ARRAY[
      'Tempered safety glass panels',
      'Frameless or minimal-frame hardware options',
      'Balcony, mezzanine, and terrace applications',
      'Project-specified height and mounting',
      '⚠️ Indicative only — structural fixings and code compliance by project consultation'
    ]::text[]
  ),
  (
    'sc-door',
    'SC-Door System (Sliding Casement Door)',
    'Casement seal and security, sliding operation.',
    'Sliding Casement Door system — a casement door that slides rather than swings. The leaf travels on a track to free floor space while keeping the sealed, multi-point character of a casement door. For main and secondary entries, lanai access, and rooms where a swinging leaf would block furniture or circulation. We call it sliding. Custom-specified per opening.',
    '/images/products/schematic/sc-door.svg',
    16,
    ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
    ARRAY['Clear Float','Frosted Privacy','Low-E Coated','Laminated Safety']::text[],
    ARRAY[
      'Sliding Casement operation (not a swing leaf)',
      'Multi-point locking on the active leaf',
      'Space-saving travel on track',
      'Multi-chamber profile with weather seals',
      'Custom specification per project'
    ]::text[]
  ),
  (
    'louvre',
    'Louvre Windows',
    'Blade-by-blade ventilation for tropical rooms.',
    'Operable louvre windows with adjustable horizontal blades for controlled ventilation. Blades open together so air moves even when you want the opening to stay rain-aware. Common in kitchens, bathrooms, utility rooms, and tropical facades that need airflow without a full sash swing. Available in glass louvre blades; project consultation for blade count, frame finish, and insect-screen options.',
    '/images/products/schematic/louvre.svg',
    17,
    ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
    ARRAY['Clear Float','Frosted Privacy','Tinted Bronze','Laminated Safety']::text[],
    ARRAY[
      'Adjustable horizontal louvre blades',
      'Ventilation with partial rain protection when angled',
      'Glass blade options',
      'Suited to kitchens, baths, and utility openings',
      'Project consultation for blade count and screen options'
    ]::text[]
  ),
  (
    'automated-window',
    'Automated Windows',
    'Open and secure openings without the ladder.',
    'Motorised window opening devices and digital-access automation for operable windows and compatible door leaves. Open high or hard-to-reach sashes without climbing; pair with wall switches, remotes, or building controls where specified. The surface for both window opening devices and automate-your-door / digital access asks from the 2026-07-10 client meeting. Hardware and control scope are project-specified — not a single SKU. Consultation required for load, travel, power, and lock integration.',
    '/images/products/schematic/automated-window.svg',
    18,
    ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
    ARRAY['Clear Float','Low-E Coated','Tinted Grey','Laminated Safety']::text[],
    ARRAY[
      'Motorised window opening devices',
      'Digital access options for compatible door leaves',
      'Wall switch, remote, or building-control integration (project-specified)',
      'Suited to high, large, or hard-to-reach operable units',
      '⚠️ Indicative only — actuator load, travel, and power by project consultation'
    ]::text[]
  )
) AS v(
  slug,
  name,
  short_description,
  description,
  thumbnail_url,
  sort_order,
  finish_labels,
  glass_labels,
  spec_labels
)
JOIN product_type pt
  ON pt.organization_id = 1
 AND pt.slug = v.slug
ON CONFLICT (organization_id, slug) DO NOTHING;

COMMIT;

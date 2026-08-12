-- Migration 023: two new door products, and approved renders for the
-- automation pair.
--
-- Why (client review, 2026-08-12):
--
--   1. Fixed & Slide Door. The Fixed-Slide-Slide-Slide-Slide-Fixed run existed
--      only as a DESIGN TOOL layout (src/data/configurator.ts, id
--      `fixed-slide-slide-slide-slide-fixed`) and as handoff geometry. It had
--      no catalog card, so a shopper on /products?filter=doors could not find
--      the product at all — the same reachability gap 020 fixed for door
--      automation. Filed under doors.
--
--   2. Slim Door. docs/MEETING_2026-08-12.md §8 recorded this as the least far
--      along of the nine Aug-7 asks: no card, no photo, and an open question
--      about whether the product swings or slides. We declined to guess. The
--      client supplied an image on 2026-08-12 showing a hinged leaf on a narrow
--      frame, which settles the mechanism. Filed under doors.
--
--   3. automated-window and automated-door were still pointing at the
--      schematic SVG stand-ins from 019/020. thumbnail_url now points at the
--      client-approved renders under /images/products/render/. As with
--      glass-railing and louvre in 022, these are RENDERS, not photographs:
--      ROADMAP item 20 / R4 record the client rejecting white-bg renders in
--      general, and she approved these specifically on 2026-08-12. The
--      standing real-photography ask in docs/AUG07_ASSET_REQUEST.md is
--      unchanged.
--
-- No opening width is stated for the Fixed & Slide Door. The 9 m default in
-- the handoff geometry is our engineering choice, not a confirmed product
-- spec, and a width on the card is the site promising a size no one with
-- product authority has signed off (docs/MEETING_2026-08-12.md §6).
--
-- Idempotent: inserts use ON CONFLICT DO NOTHING; the UPDATEs set absolute
-- values scoped by slug. Safe to re-run. Additive only: nothing here removes a
-- row or a column.
--
-- Down path: explicit no-down, same reasoning as 019, 020, and 022. Removing a
-- product row in production after a partial apply is the 017 failure mode. To
-- withdraw a product, write a later migration setting is_active = false.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/023_fixed_slide_and_slim_door.sql

BEGIN;

-- 1. product_type rows so the product FKs resolve by slug.
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
  ('doors', 'Fixed & Slide Door', 'fixed-slide-door', 'fixed-slide-door', 'slide',      true, true,  14),
  ('doors', 'Slim Door',          'slim-door',        'slim-door',        'side_hinge', true, false, 15)
) AS v(category_slug, name, slug, icon_key, opening_mechanism, is_operable, requires_track, sort_order)
JOIN product_category pc ON pc.slug = v.category_slug
ON CONFLICT (organization_id, slug) DO NOTHING;

-- 2. product rows, same denormalized shape as 019/020 (migration 011 columns).
--    Copy is customer-facing per the 022 rule: no internal citations, no
--    meeting timestamps, no "indicative only" hedge rows.
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
    'fixed-slide-door',
    'Fixed & Slide Door',
    'Four panels slide. Two stay put.',
    'A wide glazed run in six panels: a fixed panel at each end, and four sliding panels in the middle that part from the centre. Opens most of the wall without a swinging leaf eating into the room, and closes to an even, continuous line of glass. A good fit for lanais, living rooms, and any wall you want to open onto a garden or a view. Panel widths and the overall opening are set for your space during consultation.',
    '/images/products/render/fixed-slide-door.webp',
    20,
    ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
    ARRAY['Clear Float','Low-E Coated','Tinted Grey','Laminated Safety']::text[],
    ARRAY[
      'Six panels: fixed, four sliders, fixed',
      'Sliding panels part from the centre',
      'Fixed panels at both ends',
      'Full-height glazing across the run',
      'Panel widths set per opening'
    ]::text[]
  ),
  (
    'slim-door',
    'Slim Door',
    'Maximum glass. Minimum frame.',
    'A swing door on a narrow frame, so the glass reads as the whole panel and the border almost disappears. Suited to entries, studies, and interior rooms where you want light to carry from one space into the next without a heavy frame around it. Glass is chosen per opening: clear where light should pass through, privacy glass where it should not. Handing, glass, and finish are set during consultation.',
    '/images/products/render/slim-door.webp',
    21,
    ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
    ARRAY['Clear Float','Frosted Privacy','Low-E Coated','Laminated Safety']::text[],
    ARRAY[
      'Slim sightline frame',
      'Single swing leaf',
      'Full-height glazing',
      'Clear or privacy glass',
      'Handing and finish set per opening'
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

-- 3. Approved renders replace the schematic stand-ins on the automation pair.
UPDATE product
SET thumbnail_url = '/images/products/render/automated-window.webp'
WHERE organization_id = 1 AND slug = 'automated-window';

UPDATE product
SET thumbnail_url = '/images/products/render/automated-door.webp'
WHERE organization_id = 1 AND slug = 'automated-door';

COMMIT;

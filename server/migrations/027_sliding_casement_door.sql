-- Migration 027: sc-door → sliding-casement-door (Sliding Casement Door).
--
-- Why: client instruction, 2026-08-16. The "Soft Closing Sliding Door" /
-- "SC-Door" entry was a wrong product and is removed from the catalog.
-- Its useful soft-close copy folds into the sliding-door product.
-- A genuinely new FourlinQ product, Sliding Casement Door, takes its slot.
--
-- This supersedes 019/024/025/026 for the sc-door slug. History:
--   019 — seeded sc-door as "SC-Door System (Sliding Casement Door)"
--   024 — pointed sc-door thumbnail at the sliding-door image (shared render)
--   025 — renamed sc-door to "Soft Closing Sliding Door"
--   026 — gave sc-door its own render (animation frame 1, 1280×720)
-- All four migrations are now superseded for this slug. The sc-door slug is
-- retired; the new slug is sliding-casement-door.
--
-- Asset inheritance (recorded, not solved): the render, 28-frame hover
-- animation, and GLB are inherited from sc-door — those assets were originally
-- authored for "SC-Door System (Sliding Casement Door)" (migration 019), i.e.
-- this exact product. The 28-frame animation shows only the horizontal slide,
-- NOT the casement pull-open swing. A real photograph and a slide→swing frame
-- set are still outstanding from the client.
--
-- Idempotent: all UPDATEs are scoped by slug and safe to re-run. The slug
-- rename uses a two-step approach (new row insert + old row deactivation)
-- consistent with the no-DELETE discipline established in 019/020/022/023.
--
-- Down path: explicit no-down, same reasoning as 019/020/022/023/024/025/026.
-- To revert, write the previous state back explicitly in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/027_sliding_casement_door.sql

BEGIN;

-- 1. Rename the product_type row: slug sc-door → sliding-casement-door.
--    Uses literal VALUES (not derived from sc-door row) so it succeeds on any
--    database regardless of whether sc-door was previously seeded.
--    product_category_id is NOT NULL — resolved via JOIN on category slug 'doors'.
--    ON CONFLICT DO NOTHING means a second run is safe.
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
  'Sliding Casement Door',
  'sliding-casement-door',
  -- icon_key must be a key in iconMap (src/pages/DesignTool.tsx:28) or the
  -- Design Tool renders the type button with no icon at all — `Icon &&` just
  -- skips it silently. 'sliding-door' is the closest existing icon. The old
  -- sc-door row had icon_key 'sc-door', which was never in that map, so it
  -- had been rendering iconless since 019.
  'sliding-door',
  'slide-casement',
  true,
  true,
  12
FROM product_category pc
WHERE pc.slug = 'doors'
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Deactivate the old product_type row (no-DELETE discipline).
UPDATE product_type
SET is_active = false
WHERE organization_id = 1 AND slug = 'sc-door';

-- 2. Rename and update the product row.
--    Uses literal VALUES (not derived from sc-door row) so it succeeds on any
--    database regardless of whether sc-door was previously seeded.
--    product_type_id is NOT NULL — resolved via JOIN on the newly-inserted
--    sliding-casement-door product_type row.
--    finish_labels and glass_labels match FRAME_FINISHES labels in
--    fourlinq-data.ts and the sc-door glass options from migration 019.
INSERT INTO product (
  organization_id,
  product_type_id,
  name,
  slug,
  short_description,
  description,
  spec_labels,
  thumbnail_url,
  is_active,
  is_featured,
  sort_order,
  finish_labels,
  glass_labels
)
SELECT
  1,
  pt.product_type_id,
  'Sliding Casement Door',
  'sliding-casement-door',
  'Slides to position, then opens like a casement.',
  'A door that works two ways from one leaf. It slides horizontally along its track to position, then opens as a casement — pull the handle and the leaf swings toward you the way a normal casement door does. Close it, and it slides back along the track. The sliding travel frees the floor space a swinging leaf would otherwise need, while the casement action gives a full, sealed opening when you want one. Suited to lanai access, main and secondary entries, and wide openings that should work both ways. Custom-specified per opening.',
  ARRAY[
    'Slide-then-swing operation from a single leaf',
    'Multi-point locking on the active leaf',
    'Space-saving travel on track',
    'Multi-chamber profile with weather seals',
    'Custom specification per project'
  ]::text[],
  '/images/products/render/sliding-casement-door.webp',
  true,
  false,
  16,
  ARRAY['Oak Light','Oak Malt','Jet Black','Charcoal Gray','Matte Quartz','Silica Cream','Black Wood','Gray Wood','Dark Oak','Walnut','Golden Oak','White']::text[],
  ARRAY['Clear Float','Frosted Privacy','Low-E Coated','Laminated Safety']::text[]
FROM product_type pt
WHERE pt.organization_id = 1 AND pt.slug = 'sliding-casement-door'
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Deactivate the old sc-door product row (no-DELETE discipline).
UPDATE product
SET is_active = false
WHERE organization_id = 1 AND slug = 'sc-door';

-- 3. Update the sliding-door product: fold in the description and soft-close
--    spec absorbed from the removed sc-door product (client instruction
--    2026-08-16). The description previously borrowed the sliding *window*
--    type's text; it now has an inline copy scoped to the door product.
UPDATE product
SET
  description = 'Slides horizontally along a track rather than swinging, so the floor space a swinging leaf would take stays usable. A soft-close damper catches the leaf at the end of its travel, so it decelerates and seats itself instead of slamming. Suited to balconies, lanai access, and wide openings where outward clearance is limited.',
  spec_labels = ARRAY[
    'Multi-chamber uPVC profile with weather seals',
    'Space-saving horizontal slide',
    'Soft-close damper on the active leaf',
    '6mm to 12mm glass options',
    'Galvanized steel reinforcement'
  ]::text[]
WHERE organization_id = 1 AND slug = 'sliding-door';

COMMIT;

-- Migration 028: Slim Door is a three-panel slider, not a swing door.
--
-- Why: client-supplied animation clip "3P SLIDING" (2026-09-03). It shows three
-- glazed panels sliding to one side and stacking, opening most of the run.
--
-- This supersedes 023 for the slim-door slug. History:
--   023 — seeded slim-door as a single swing leaf, from a render supplied
--         2026-08-12, with opening_mechanism 'side_hinge' and no track.
--
-- The mechanism question: docs/MEETING_2026-08-12.md §8 left swing-or-slide
-- open. The Aug-12 render answered "swing" and 023 wrote that answer into the
-- database. Two later client sources answer "slide" — the "SlimDoor Chi" supplier
-- clips (2026-08-20) behind the homepage Slim ALU spotlight, and now this one.
-- Two client sources against one render, and the newer, so the catalogue and the
-- database move to slide. src/data/products.ts carries the identical copy; the
-- static catalog is the fallback when /api/products errors, so the two must not
-- drift (guarded by src/test/data-integrity.test.ts).
--
-- The thumbnail_url is unchanged on purpose. The file at that path was replaced
-- in place with frame 01 of the same clip, so the card still and the resting
-- hover-animation frame are now the same picture. Images under /images/ are
-- served max-age=300 (server/index.ts), not immutable, so the replacement
-- reaches returning visitors without a new path.
--
-- icon_key also changes, fixing a separate silent bug: 023 set it to 'slim-door',
-- which was never a key in iconMap (src/pages/DesignTool.tsx:28), so the Design
-- Tool has rendered this type button with no icon at all since 023 — `Icon &&`
-- just skips it. Same failure 027 found on sc-door. 'sliding-door' is the closest
-- existing icon and now also matches the mechanism.
--
-- Idempotent: every statement is a slug-scoped UPDATE, safe to re-run.
--
-- Down path: explicit no-down, same reasoning as 019/020/022/023/024/025/026/027.
-- To revert, write the previous state back explicitly in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/028_slim_door_slides.sql

BEGIN;

-- 1. product_type: swing on no track → slide on a track, and a real icon.
UPDATE product_type
SET
  opening_mechanism = 'slide',
  requires_track = true,
  icon_key = 'sliding-door'
WHERE organization_id = 1 AND slug = 'slim-door';

-- 2. product: copy must stay byte-identical to the slim-door entry in
--    src/data/products.ts.
UPDATE product
SET
  short_description = 'Three panels slide. The frame disappears.',
  description = 'Three glazed panels on a narrow frame. They slide to one side and stack together, so most of the run opens as a single clear span and the border almost disappears. Suited to living rooms, lanais, and any wall you want to open onto a garden or a view. Glass is chosen per opening: clear where light should pass through, privacy glass where it should not. Stacking side, glass, and finish are set during consultation.',
  spec_labels = ARRAY[
    'Slim sightline frame',
    'Three sliding panels',
    'Panels stack to one side',
    'Full-height glazing',
    'Stacking side and finish set per opening'
  ]::text[]
WHERE organization_id = 1 AND slug = 'slim-door';

COMMIT;

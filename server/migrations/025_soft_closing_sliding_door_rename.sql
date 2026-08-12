-- Migration 025: SC-Door is renamed "Soft Closing Sliding Door".
--
-- Why: client instruction, 2026-08-12. "SC-Door System (Sliding Casement
-- Door)" is an internal label — the parenthetical explains an abbreviation the
-- customer never saw expanded, and the name leads with the acronym rather than
-- the thing being sold.
--
-- What did NOT change: the product. It is still the Sliding Casement Door, and
-- the description below still says so in its first clause. The rename promotes
-- the soft-closing system to the front of the name; it does not reclassify the
-- door as an ordinary slider. Anyone editing this copy later should keep the
-- Sliding Casement claim — src/test/data-integrity.test.ts asserts it.
--
-- The slug stays 'sc-door'. It keys the 3D model (scripts/handoff/model/
-- sc-door-model.js), the product_type row, migrations 019 and 024, and any
-- deep link already shared. Renaming the slug would break all four to fix
-- nothing a visitor can see.
--
-- Consequence worth stating: this does not close the asset ask in
-- docs/AUG07_ASSET_REQUEST.md. That row wants a shot that is specifically NOT
-- a standard two-panel slider, and the card still shows the plain slider it
-- inherited in migration 024. A soft-closing casement slider is still not that
-- picture. The ask stands.
--
-- Idempotent: absolute UPDATEs scoped by slug, safe to re-run. Additive only:
-- nothing here removes a row or a column.
--
-- Down path: explicit no-down, same reasoning as 019/020/022/023/024. To
-- revert, write the previous name back explicitly in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/025_soft_closing_sliding_door_rename.sql

BEGIN;

-- 1. The catalog row that /api/products serves and the CMS edits.
UPDATE product
SET
  name = 'Soft Closing Sliding Door',
  short_description = 'Casement seal and security, closing softly.',
  description = 'Soft-closing system on a Sliding Casement Door — a casement door that slides rather than swings. A damper catches the leaf at the end of its travel, so it decelerates and seats itself instead of slamming, and the multi-point seal engages cleanly every time. The track frees the floor space a swinging leaf would take while keeping the sealed, secure character of a casement door. For main and secondary entries, lanai access, and rooms where a slamming or swinging leaf is a problem. Custom-specified per opening.',
  spec_labels = ARRAY[
    'Soft-close damper on the active leaf',
    'Sliding Casement operation (not a swing leaf)',
    'Multi-point locking on the active leaf',
    'Space-saving travel on track',
    'Multi-chamber profile with weather seals',
    'Custom specification per project'
  ]::text[]
WHERE organization_id = 1 AND slug = 'sc-door';

-- 2. The product_type row seeded by migration 019, so the type name the
--    configurator and any type-keyed UI reads matches the catalog name.
UPDATE product_type
SET name = 'Soft Closing Sliding Door'
WHERE organization_id = 1 AND slug = 'sc-door';

COMMIT;

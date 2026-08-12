-- Migration 024: SC-Door drops its schematic and shares the sliding-door image.
--
-- Why: client instruction, 2026-08-12 — put the sliding-door picture on the
-- SC-Door card. That retires the last schematic line drawing in the catalogue.
--
-- Read this before defending the card in front of the client:
-- docs/AUG07_ASSET_REQUEST.md asks for an SC-Door shot that is specifically
-- NOT a standard two-panel slider, because SC-Door is a Sliding Casement and
-- the two are different products. This image IS the plain slider. So two
-- products now rest on one picture, and the card no longer distinguishes the
-- thing its own description spends a paragraph distinguishing. The instruction
-- is hers and it is followed here; the standing ask for a distinguishing photo
-- is not closed by it, and is now more urgent rather than less.
--
-- Idempotent: one absolute UPDATE scoped by slug, safe to re-run. Additive
-- only: nothing here removes a row or a column.
--
-- Down path: explicit no-down, same reasoning as 019/020/022/023. To revert,
-- write the previous path back explicitly in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/024_sc_door_shares_sliding_master.sql

BEGIN;

UPDATE product
SET thumbnail_url = '/images/wp-export/slidingdoor.webp'
WHERE organization_id = 1 AND slug = 'sc-door';

COMMIT;

-- Migration 026: Soft Closing Sliding Door gets its own render.
--
-- Why: client-supplied image, 2026-08-12, minutes after the rename in 025.
--
-- What this ends: migration 024 pointed this product at
-- /images/wp-export/slidingdoor.webp, the same file the `sliding-door` product
-- uses, so two products rested on one picture. They no longer do. The
-- `sliding-door` row is untouched and keeps that path.
--
-- What this answers: docs/AUG07_ASSET_REQUEST.md asked for a shot that is
-- specifically NOT a standard two-panel slider. The new render shows the leaf
-- on its own top track with the roller hangers visible, which reads as the
-- track-hung system it is rather than an ordinary slider. That row can drop
-- off the urgent list.
--
-- What is still open: this is a render, not a photograph, and the leaf is
-- closed and head-on rather than mid-travel. Same approved-exception footing
-- as the rest of render/ (ROADMAP item 20 records the general rejection of
-- white-bg renders; these specific images are the client's own).
--
-- Idempotent: one absolute UPDATE scoped by slug, safe to re-run. Additive
-- only: nothing here removes a row or a column.
--
-- Down path: explicit no-down, same reasoning as 019/020/022/023/024/025. To
-- revert, write the previous path back explicitly in a later migration.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/026_soft_closing_sliding_door_own_render.sql

BEGIN;

UPDATE product
SET thumbnail_url = '/images/products/render/sc-door.webp'
WHERE organization_id = 1 AND slug = 'sc-door';

COMMIT;

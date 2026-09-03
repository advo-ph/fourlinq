-- Migration 029: point slim-door at a new render path so the swap actually lands.
--
-- Why: the client's three-panel sliding render replaced the Aug-12 swing render
-- on 2026-09-03, but it was written over the SAME file, at the same path. 028
-- said that was safe because /images/ is served max-age=300, not immutable.
-- That read the header half-right. The full policy in server/index.ts is
-- `public, max-age=300, stale-while-revalidate=86400`, and the SWR window is the
-- problem: for a day after the 300 s freshness lapses, a browser is entitled to
-- paint its stale copy immediately and only revalidate in the background. Anyone
-- who had loaded the card before the swap kept seeing the swing door. Reported
-- from a real device on 2026-09-04.
--
-- The fix is a new path. `/images/products/render/slim-door-3p.webp` is the same
-- bytes as the file 028 left in place — verified identical to the client's
-- 2026-09-03 supply — just under a name no cache has an entry for. The old
-- `slim-door.webp` is deleted in the same commit, so there is nothing left to
-- serve stale. Future replacements of this render need a NEW filename too: bump
-- the suffix and delete the old file. Same contract the Slim ALU spotlight film
-- already documents for /videos/ (SlimDoorSpotlight.tsx).
--
-- History for this slug:
--   023 — seeded slim-door from the Aug-12 swing render.
--   028 — corrected the mechanism to slide; deliberately left thumbnail_url
--         alone, on the in-place-replacement assumption this migration undoes.
--
-- Only thumbnail_url changes. The copy and mechanism 028 wrote are correct and
-- are not touched. src/data/products.ts carries the identical path; the static
-- catalog is the fallback when /api/products errors, so the two must not drift
-- (guarded by src/test/data-integrity.test.ts).
--
-- Idempotent: a single slug-scoped UPDATE, safe to re-run.
--
-- Down path: explicit no-down, same reasoning as 019/020/022/023/024/025/026/027/028.
-- To revert, write the previous path back explicitly in a later migration — but
-- note the file it named no longer exists on disk.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/029_slim_door_3p_render.sql

BEGIN;

UPDATE product
SET thumbnail_url = '/images/products/render/slim-door-3p.webp'
WHERE organization_id = 1 AND slug = 'slim-door';

COMMIT;

-- Migration 032: point glass-railing at the corrected-scale render path.
--
-- Why: glass-railing-v2.webp (migration 031) had the railing object scaled
-- up to ~85 % of the frame. The original render had a smaller, correctly
-- proportioned railing. v3 restores that original object scale inside the
-- 1672x941 (16:9) frame. The file was delivered 2026-09-08 and is at
-- public/images/products/render/glass-railing-v3.webp (7182 bytes).
--
-- A new filename is required because the static serving policy in
-- server/index.ts is `public, max-age=300, stale-while-revalidate=86400`.
-- The 86400 s SWR window means overwriting the same file on disk leaves
-- browsers painting the stale copy for up to a day. This is the same
-- constraint that forced 029 (slim-door-3p) and 031 (glass-railing-v2).
-- Future replacements of this render must also use a new filename and
-- delete the old file.
--
-- History for this slug:
--   022 — seeded glass-railing thumbnail_url from the Aug-12 white-bg render.
--   031 — recentered render (glass-railing-v2.webp).
--   032 — this migration: corrected object scale (glass-railing-v3.webp).
--
-- Only thumbnail_url changes. All other columns (name, copy, specs) are not
-- touched. src/data/products.ts carries the identical path; the static
-- catalog is the fallback when /api/products errors, so the two must not
-- drift (guarded by src/test/data-integrity.test.ts).
--
-- Idempotent: a single slug-scoped UPDATE, safe to re-run.
--
-- Down path: explicit no-down, same reasoning as 019/020/022–031.
-- To revert, write the previous path back explicitly in a later migration —
-- but note the file it named (glass-railing-v2.webp) has been deleted from disk.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/032_glass_railing_v3_render.sql

BEGIN;

UPDATE product
SET thumbnail_url = '/images/products/render/glass-railing-v3.webp'
WHERE organization_id = 1 AND slug = 'glass-railing';

COMMIT;

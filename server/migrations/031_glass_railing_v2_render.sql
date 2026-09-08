-- Migration 031: point glass-railing at a recentered render path.
--
-- Why: the Aug-12 render had the railing sitting in the bottom half of the
-- frame with a large dead white space above it. A recentered 1672x941 (16:9)
-- replacement was supplied 2026-09-08 as glass-railing-v2.webp.
--
-- A new filename is required because the static serving policy in
-- server/index.ts is `public, max-age=300, stale-while-revalidate=86400`.
-- The 86400 s SWR window means overwriting the same file on disk leaves
-- browsers painting the stale copy for up to a day. This is the same
-- constraint that forced 029 to use slim-door-3p.webp instead of
-- overwriting slim-door.webp. Future replacements of this render must also
-- use a new filename and delete the old file.
--
-- History for this slug:
--   022 — seeded glass-railing thumbnail_url from the Aug-12 white-bg render.
--
-- Only thumbnail_url changes. All other columns (name, copy, specs) are not
-- touched. src/data/products.ts carries the identical path; the static
-- catalog is the fallback when /api/products errors, so the two must not
-- drift (guarded by src/test/data-integrity.test.ts).
--
-- Idempotent: a single slug-scoped UPDATE, safe to re-run.
--
-- Down path: explicit no-down, same reasoning as 019/020/022–030.
-- To revert, write the previous path back explicitly in a later migration —
-- but note the file it named (glass-railing.webp) has been deleted from disk.
--
-- Apply on the VPS (ship the file; apply by hand at deploy time):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/031_glass_railing_v2_render.sql

BEGIN;

UPDATE product
SET thumbnail_url = '/images/products/render/glass-railing-v2.webp'
WHERE organization_id = 1 AND slug = 'glass-railing';

COMMIT;

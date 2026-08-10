-- Migration 021: Extend override_type CHECK constraint with project_name type.
--
-- New override_type value added:
--   project_name  — admin-set display name override. image_path = '__project__',
--                   value_text = the display name shown in the admin panel and on
--                   the public site (/inspiration cards, /projects/:slug title).
--                   The project_id / slug is NEVER changed by this override — it
--                   remains the join key for image manifests, existing override
--                   rows, and published /projects/:slug URLs.
--
-- Apply on VPS (BEFORE deploying updated code):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/021_project_name_override.sql
--
-- NOTE — 'project_cover' is carried forward deliberately. Migration 017 added it,
-- then commit b8d51a4 reverted the feature and deleted 017 from the repo, so the
-- value appears in NO migration file. Production nonetheless still has it in the
-- constraint AND retains one row using it (verified 2026-08-10). Recreating the
-- constraint from the 016 list would validate that surviving row and abort this
-- migration. The value is inert — server/routes/project-images.ts ignores it —
-- so it is preserved rather than dropped, which would mean deleting live data.

BEGIN;

-- 1. Drop the existing CHECK constraint.
--    Current name (verified): project_image_override_override_type_check
--    Verify before running on prod:
--      SELECT conname FROM pg_constraint WHERE conrelid = 'project_image_override'::regclass AND contype = 'c';
ALTER TABLE project_image_override
  DROP CONSTRAINT project_image_override_override_type_check;

-- 2. Recreate with the expanded value list (adds 'project_name' to migration 016 list).
ALTER TABLE project_image_override
  ADD CONSTRAINT project_image_override_override_type_check
    CHECK (override_type IN (
      'hidden',
      'replaced',
      'best_for_category',
      'project_order',
      'category_order',
      'image_order',
      'project_flagged',
      'project_hidden',
      'project_deleted',
      'project_ratio',
      'score_override',
      'image_flagged',
      'project_checked',
      'project_cover',  -- legacy value still present in production; see note above
      'project_name'
    ));

-- 3. Document all types including the new one.
COMMENT ON COLUMN project_image_override.override_type IS
  'hidden | replaced | best_for_category | project_order | category_order | image_order '
  '| project_flagged | project_hidden | project_deleted | project_ratio | score_override '
  '| image_flagged | project_checked | project_cover (legacy, inert) | project_name';

COMMIT;

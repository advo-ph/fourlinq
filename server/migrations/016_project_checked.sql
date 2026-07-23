-- Migration 016: Extend override_type CHECK constraint with project_checked type.
--
-- New override_type value added:
--   project_checked  — project marked as checked (visual marker, no automation).
--                      image_path = '__project__'. Purely visual; does NOT affect
--                      the public site payload or any automated filtering.
--
-- Apply on VPS (BEFORE deploying updated code):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/016_project_checked.sql

BEGIN;

-- 1. Drop the existing CHECK constraint.
--    Current name (verified): project_image_override_override_type_check
--    Verify before running on prod:
--      SELECT conname FROM pg_constraint WHERE conrelid = 'project_image_override'::regclass AND contype = 'c';
ALTER TABLE project_image_override
  DROP CONSTRAINT project_image_override_override_type_check;

-- 2. Recreate with the expanded value list (adds 'project_checked' to migration 015 list).
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
      'project_checked'
    ));

-- 3. Document all types including the new one.
COMMENT ON COLUMN project_image_override.override_type IS
  'hidden | replaced | best_for_category | project_order | category_order | image_order '
  '| project_flagged | project_hidden | project_deleted | project_ratio | score_override '
  '| image_flagged | project_checked';

COMMIT;

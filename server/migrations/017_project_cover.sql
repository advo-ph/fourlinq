-- Migration 017: Extend override_type CHECK constraint with project_cover type.
--
-- New override_type value added:
--   project_cover  — project cover image override for "All projects" cards, project hero,
--                    and InspirationStrip tiles. image_path = '__project__', value_text = actual image path.
--                    One row per project (unique constraint via __project__ sentinel + type).
--                    A hidden cover image is ignored server-side; the client also guards defensively.
--
-- Apply on VPS (BEFORE deploying updated code):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/017_project_cover.sql

BEGIN;

-- 1. Drop the existing CHECK constraint.
--    Current name (verified): project_image_override_override_type_check
--    Verify before running on prod:
--      SELECT conname FROM pg_constraint WHERE conrelid = 'project_image_override'::regclass AND contype = 'c';
ALTER TABLE project_image_override
  DROP CONSTRAINT project_image_override_override_type_check;

-- 2. Recreate with the expanded value list (adds 'project_cover' to migration 016 list).
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
      'project_cover'
    ));

-- 3. Document all types including the new one.
COMMENT ON COLUMN project_image_override.override_type IS
  'hidden | replaced | best_for_category | project_order | category_order | image_order '
  '| project_flagged | project_hidden | project_deleted | project_ratio | score_override '
  '| image_flagged | project_checked | project_cover';

COMMIT;

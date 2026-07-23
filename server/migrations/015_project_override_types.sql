-- Migration 015: Extend override_type CHECK constraint with project-level and score override types.
--
-- New override_type values added:
--   project_flagged  — project flagged (visual marker). image_path = '__project__'
--   project_hidden   — project hidden from public site and admin default list. image_path = '__project__'
--   project_deleted  — soft tombstone. image_path = '__project__'. Survives sync-cms re-sync.
--   project_ratio    — aspect ratio override for public project cards. image_path = '__project__', value_text = '16:9' | '4:3'
--   score_override   — per-image per-category score override. image_path = actual path, value_int = 0-100
--   image_flagged    — individual image flagged (visual marker). image_path = actual path
--
-- Apply on VPS (BEFORE deploying updated code):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/015_project_override_types.sql

BEGIN;

-- 1. Drop the existing CHECK constraint.
--    PostgreSQL assigned the name: project_image_override_override_type_check
--    (verified locally: SELECT conname FROM pg_constraint WHERE conrelid = 'project_image_override'::regclass AND contype = 'c';)
ALTER TABLE project_image_override
  DROP CONSTRAINT project_image_override_override_type_check;

-- 2. Recreate with the expanded value list.
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
      'image_flagged'
    ));

-- 3. Index: project-level type lookups (project_flagged/hidden/deleted/ratio) are frequent.
--    The existing idx_pio_type already covers override_type. No new index needed.

-- 4. Document new types.
COMMENT ON COLUMN project_image_override.override_type IS
  'hidden | replaced | best_for_category | project_order | category_order | image_order '
  '| project_flagged | project_hidden | project_deleted | project_ratio | score_override | image_flagged';

COMMIT;

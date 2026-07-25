-- Migration 018: optimised indexes for project_image_override hot-path queries
--
-- The public /api/project-images/merged endpoint and the admin list both query:
--   WHERE organization_id = $1 ORDER BY project_id, override_type, value_int
-- The existing idx_pio_org_project only covers (organization_id, project_id) and
-- cannot satisfy the ORDER BY without a re-sort.  The new composite index covers
-- all four columns so Postgres can satisfy the query in a single index scan.
--
-- idx_pio_org_project is superseded by the composite index (same leading columns)
-- and is dropped to avoid redundant write amplification.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_pio_org_project_type_order
  ON project_image_override (organization_id, project_id, override_type, value_int);

DROP INDEX IF EXISTS idx_pio_org_project;

COMMIT;

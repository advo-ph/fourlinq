-- Migration 014: project_image_override table for the /inspiration admin override layer
--
-- Why: the /inspiration gallery currently derives all image selection, ordering,
-- and category membership entirely at build-time from AI vision scores in
-- server/data/project-image-analysis.json. There is no way to correct a bad AI
-- pick, hide an undesirable image, or reorder projects without re-running the
-- pipeline and redeploying. This table provides a durable, deploy-proof override
-- layer that the runtime API merges on top of the file-based baseline so admin
-- and editor users can control the gallery without touching code.
--
-- Apply on the VPS (BEFORE deploying the updated code):
--   ssh advo
--   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/014_project_image_overrides.sql

BEGIN;

CREATE TABLE project_image_override (
  project_image_override_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id            BIGINT NOT NULL REFERENCES organization(organization_id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  image_path                 TEXT NOT NULL,
  override_type              TEXT NOT NULL
                               CHECK (override_type IN ('hidden','replaced','best_for_category',
                                                        'project_order','category_order','image_order')),
  category                   TEXT CHECK (category IN ('windows','doors','interior','exterior')),
  value_text                 TEXT,
  value_int                  INTEGER,
  created_by                 BIGINT REFERENCES auth_user(auth_user_id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deduplication index: treats NULL category the same as '' so that a
-- hidden/replaced/image_order/project_order override (which has category=NULL)
-- is prevented from being duplicated. COALESCE maps NULL→'' for the comparison.
-- The ON CONFLICT clause in the server UPSERT references this index by expression.
CREATE UNIQUE INDEX uq_pio_coalesce ON project_image_override
  (organization_id, project_id, image_path, override_type, COALESCE(category, ''));

CREATE INDEX idx_pio_org_project ON project_image_override (organization_id, project_id);
CREATE INDEX idx_pio_type        ON project_image_override (override_type);

COMMENT ON TABLE project_image_override IS
  'Admin overrides for the /inspiration project-image gallery. Rows win over the file-based AI baseline. Soft-delete not needed: DELETE removes an override (restores baseline).';

-- image_path = ''__project__'' is a sentinel for project-level (not image-level) overrides:
--   project_order    → override sort position in "All projects" view
--   category_order   → override sort position in a per-category view (category column required)
-- This satisfies the NOT NULL constraint and keeps the UNIQUE index unambiguous.

GRANT ALL ON project_image_override TO fourlinq;
GRANT ALL ON SEQUENCE project_image_override_project_image_override_id_seq TO fourlinq;

COMMIT;

-- Migration 007: per-user auth + audit log
-- Seeds three default roles (admin, editor, media) under org_id=1 and creates
-- the audit log table that every admin write logs through.
--
-- Initial admin user is NOT seeded here — run server/scripts/create-admin.ts
-- after applying this migration. That script reads ADMIN_EMAIL +
-- ADMIN_PASSWORD from env, hashes with bcrypt, and inserts the row.

BEGIN;

-- Roles ───────────────────────────────────────
-- name conventions:
--   admin    → full access, can manage users, settings, all content
--   editor   → can manage all content (projects, news, pages, products)
--   media    → can upload + edit media library only
INSERT INTO role (organization_id, name, label, is_system)
VALUES
    (1, 'admin',  'Administrator', true),
    (1, 'editor', 'Editor',        true),
    (1, 'media',  'Media manager', true)
ON CONFLICT (organization_id, name) DO UPDATE
  SET label = EXCLUDED.label,
      is_system = EXCLUDED.is_system;

-- Audit log ───────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_audit_log (
    cms_audit_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id  BIGINT NOT NULL,
    profile_id       BIGINT,                          -- nullable: edits before auth migration
    actor_email      TEXT,                            -- denormalized for fast list views
    action           TEXT NOT NULL,                   -- 'create' | 'update' | 'delete' | 'login' | 'upload'
    entity_kind      TEXT NOT NULL,                   -- 'projects' | 'news' | 'pages' | 'products' | 'media' | 'user'
    entity_id        TEXT,                            -- stringified PK; nullable for some actions
    summary          TEXT,                            -- short human-readable diff (e.g. "title: 'X' → 'Y'")
    diff             JSONB,                           -- full before/after for forensic recovery
    ip_address       INET,
    user_agent       TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cms_audit_log IS
    'Append-only audit trail for admin actions. Retention: 365 days, pruned by scripts/cms-audit-retention.ts cron.';

CREATE INDEX IF NOT EXISTS idx_cms_audit_log_recent   ON cms_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_audit_log_profile  ON cms_audit_log (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_audit_log_entity   ON cms_audit_log (entity_kind, entity_id);

COMMIT;

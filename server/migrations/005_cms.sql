-- Migration 005: CMS tables (projects, news, media) — move site content from
-- hardcoded src/data/*.ts files into the database so Tita (and later, admins)
-- can edit live without code pushes. Frontend will read via /api/cms/* routes.
--
-- Conventions: BIGINT IDENTITY PKs, snake_case columns, singular table names,
-- TIMESTAMPTZ, is_* predicate booleans, soft-delete via deleted_at.

BEGIN;

-- ============================================
-- Media library — shared by projects, news, products
-- ============================================
CREATE TABLE cms_media_asset (
    cms_media_asset_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id    BIGINT NOT NULL REFERENCES organization (organization_id),
    file_path          TEXT NOT NULL,                    -- public URL, e.g. /images/projects-fb/abc.jpg
    alt_text           TEXT,
    tags               TEXT[] DEFAULT '{}',
    width_px           INTEGER,
    height_px          INTEGER,
    byte_size          BIGINT,
    source             TEXT,                              -- 'wp-export' | 'fb-scrape' | 'upload'
    uploaded_by        BIGINT REFERENCES auth_user (auth_user_id) ON DELETE SET NULL,
    is_published       BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

COMMENT ON TABLE cms_media_asset IS
    'Site-wide image library for CMS content. file_path is a public URL (relative or absolute). Soft-deleted (deleted_at).';

CREATE INDEX idx_cms_media_asset_org  ON cms_media_asset (organization_id);
CREATE INDEX idx_cms_media_asset_path ON cms_media_asset (file_path);
CREATE INDEX idx_cms_media_asset_live ON cms_media_asset (created_at DESC) WHERE deleted_at IS NULL AND is_published;

-- ============================================
-- Portfolio projects (replaces src/data/projects.ts)
-- ============================================
CREATE TABLE cms_project (
    cms_project_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id    BIGINT NOT NULL REFERENCES organization (organization_id),
    slug               TEXT NOT NULL UNIQUE,
    title              TEXT NOT NULL,
    location           TEXT,                              -- e.g. "Las Piñas, Metro Manila"
    category           TEXT,                              -- 'casement'|'sliding'|'doors'|'specialist'|'interior'|'exterior'
    caption            TEXT,                              -- short FB-style caption
    description        TEXT,                              -- long body (markdown)
    cover_asset_id     BIGINT REFERENCES cms_media_asset (cms_media_asset_id) ON DELETE SET NULL,
    cover_path         TEXT,                              -- fallback URL pre-media-library
    gallery_paths      TEXT[] DEFAULT '{}',               -- ordered list of public image URLs
    architect          TEXT,
    quote_text         TEXT,
    quote_attribution  TEXT,
    project_year       INTEGER,
    systems_used       TEXT[] DEFAULT '{}',               -- ['Casement 70 Series', 'Sliding 85 Series']
    fb_post_id         TEXT,                              -- source FB postId if scraped
    display_order      INTEGER NOT NULL DEFAULT 0,
    is_featured        BOOLEAN NOT NULL DEFAULT false,
    is_published       BOOLEAN NOT NULL DEFAULT true,
    published_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

COMMENT ON TABLE cms_project IS
    'Portfolio project entries (formerly hardcoded in src/data/projects.ts). Each row drives /inspiration and /projects/:slug.';

CREATE INDEX idx_cms_project_org      ON cms_project (organization_id);
CREATE INDEX idx_cms_project_category ON cms_project (category) WHERE deleted_at IS NULL;
CREATE INDEX idx_cms_project_live     ON cms_project (display_order, published_at DESC) WHERE deleted_at IS NULL AND is_published;

-- ============================================
-- News / What's New (replaces src/data/whats-new.ts)
-- ============================================
CREATE TABLE cms_news_post (
    cms_news_post_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id    BIGINT NOT NULL REFERENCES organization (organization_id),
    slug               TEXT NOT NULL UNIQUE,
    title              TEXT NOT NULL,
    excerpt            TEXT,
    body               TEXT,                              -- markdown
    category           TEXT NOT NULL,                     -- 'project'|'product'|'event'|'press'
    cover_asset_id     BIGINT REFERENCES cms_media_asset (cms_media_asset_id) ON DELETE SET NULL,
    cover_path         TEXT,
    external_link      TEXT,
    internal_link      TEXT,                              -- e.g. /projects/las-pinas-residence
    is_published       BOOLEAN NOT NULL DEFAULT true,
    published_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

COMMENT ON TABLE cms_news_post IS
    'What''s New feed entries (formerly hardcoded in src/data/whats-new.ts). Drives /whats-new and the homepage news strip.';

CREATE INDEX idx_cms_news_org       ON cms_news_post (organization_id);
CREATE INDEX idx_cms_news_category  ON cms_news_post (category) WHERE deleted_at IS NULL;
CREATE INDEX idx_cms_news_published ON cms_news_post (published_at DESC) WHERE deleted_at IS NULL AND is_published;

-- ============================================
-- Trigger to bump updated_at automatically
-- ============================================
CREATE OR REPLACE FUNCTION cms_touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cms_media_asset_touch  BEFORE UPDATE ON cms_media_asset  FOR EACH ROW EXECUTE FUNCTION cms_touch_updated_at();
CREATE TRIGGER trg_cms_project_touch      BEFORE UPDATE ON cms_project      FOR EACH ROW EXECUTE FUNCTION cms_touch_updated_at();
CREATE TRIGGER trg_cms_news_post_touch    BEFORE UPDATE ON cms_news_post    FOR EACH ROW EXECUTE FUNCTION cms_touch_updated_at();

COMMIT;

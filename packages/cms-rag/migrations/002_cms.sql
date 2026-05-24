-- cms-rag · Migration 002: Generic CMS tables.
-- Three tables that almost every consumer needs:
--   cms_media_asset — image library
--   cms_page        — editable page metadata + hero + markdown body
--   cms_post        — generic post / news / project / case study row
--
-- Add project-specific tables alongside these if you need fields that don't
-- fit the generic shape (e.g. fourlinq's cms_project has gallery_paths,
-- systems_used). That's expected — this is a starting kit, not a straitjacket.

BEGIN;

-- ────────── Media library ──────────
CREATE TABLE IF NOT EXISTS cms_media_asset (
    cms_media_asset_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id    BIGINT NOT NULL,
    file_path          TEXT NOT NULL,
    alt_text           TEXT,
    tags               TEXT[] DEFAULT '{}',
    width_px           INTEGER,
    height_px          INTEGER,
    byte_size          BIGINT,
    source             TEXT,                              -- 'upload' | 'fb-scrape' | 'wp-export' | ...
    uploaded_by        BIGINT,
    is_published       BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);
COMMENT ON TABLE cms_media_asset IS 'Site-wide image library. file_path is the public URL served by your static handler.';
CREATE INDEX IF NOT EXISTS idx_cms_media_asset_org  ON cms_media_asset (organization_id);
CREATE INDEX IF NOT EXISTS idx_cms_media_asset_path ON cms_media_asset (file_path);

-- ────────── Pages ──────────
CREATE TABLE IF NOT EXISTS cms_page (
    cms_page_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id    BIGINT NOT NULL,
    route              TEXT NOT NULL,
    title              TEXT NOT NULL,
    meta_description   TEXT,
    meta_keywords      TEXT,
    hero_eyebrow       TEXT,
    hero_heading       TEXT,
    hero_subheading    TEXT,
    hero_cta_label     TEXT,
    hero_cta_href      TEXT,
    hero_image_path    TEXT,
    body               TEXT,
    is_published       BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ,
    UNIQUE (organization_id, route)
);
COMMENT ON TABLE cms_page IS 'Editable page metadata (hero, SEO, body slot). React components render these on top of static layouts.';
CREATE INDEX IF NOT EXISTS idx_cms_page_route ON cms_page (route) WHERE deleted_at IS NULL AND is_published;

-- ────────── Generic posts ──────────
CREATE TABLE IF NOT EXISTS cms_post (
    cms_post_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id    BIGINT NOT NULL,
    slug               TEXT NOT NULL,
    title              TEXT NOT NULL,
    excerpt            TEXT,
    body               TEXT,
    category           TEXT,
    cover_path         TEXT,
    external_link      TEXT,
    internal_link      TEXT,
    tags               TEXT[] DEFAULT '{}',
    is_published       BOOLEAN NOT NULL DEFAULT true,
    published_at       TIMESTAMPTZ DEFAULT NOW(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ,
    UNIQUE (organization_id, slug)
);
COMMENT ON TABLE cms_post IS 'Generic post (news, blog, announcement). Use category to segment.';
CREATE INDEX IF NOT EXISTS idx_cms_post_published ON cms_post (published_at DESC) WHERE deleted_at IS NULL AND is_published;

-- ────────── Auto-touch updated_at ──────────
CREATE OR REPLACE FUNCTION cms_touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cms_media_touch ON cms_media_asset;
CREATE TRIGGER trg_cms_media_touch BEFORE UPDATE ON cms_media_asset FOR EACH ROW EXECUTE FUNCTION cms_touch_updated_at();
DROP TRIGGER IF EXISTS trg_cms_page_touch ON cms_page;
CREATE TRIGGER trg_cms_page_touch  BEFORE UPDATE ON cms_page        FOR EACH ROW EXECUTE FUNCTION cms_touch_updated_at();
DROP TRIGGER IF EXISTS trg_cms_post_touch ON cms_post;
CREATE TRIGGER trg_cms_post_touch  BEFORE UPDATE ON cms_post        FOR EACH ROW EXECUTE FUNCTION cms_touch_updated_at();

COMMIT;

-- FourlinQ Backend Schema — Migration 001
-- PostgreSQL 15+
-- Run: psql -U <user> -d fourlinq -f server/migrations/001_schema.sql

-- ============================================
-- 1. Auth & Identity
-- ============================================

CREATE TABLE auth_user (
    auth_user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organization (
    organization_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    website TEXT,
    tax_id TEXT,
    currency TEXT DEFAULT 'PHP',
    timezone TEXT DEFAULT 'Asia/Manila',
    locale TEXT DEFAULT 'en-PH',
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE role (
    role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    label TEXT,
    is_system BOOLEAN DEFAULT false,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (organization_id, name)
);

CREATE TABLE permission (
    permission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    label TEXT,
    resource TEXT NOT NULL,
    action TEXT NOT NULL
);

CREATE TABLE role_permission (
    role_permission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES role (role_id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permission (permission_id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE profile (
    profile_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auth_user_id BIGINT NOT NULL REFERENCES auth_user (auth_user_id) ON DELETE CASCADE,
    organization_id BIGINT NOT NULL REFERENCES organization (organization_id),
    role_id BIGINT NOT NULL REFERENCES role (role_id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (auth_user_id, organization_id)
);

-- ============================================
-- 2. Organization & Venue
-- ============================================

CREATE TABLE branch (
    branch_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    code TEXT,
    address_line_1 TEXT,
    address_line_2 TEXT,
    city TEXT,
    province TEXT,
    region TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'PH',
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    phone TEXT,
    email TEXT,
    is_showroom BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    operating_hour JSONB,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE agent (
    agent_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organization (organization_id),
    profile_id BIGINT NOT NULL REFERENCES profile (profile_id),
    branch_id BIGINT REFERENCES branch (branch_id),
    agent_type TEXT NOT NULL,
    employee_number TEXT,
    commission_rate NUMERIC(5, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (organization_id, profile_id)
);

-- ============================================
-- 3. Product Catalog
-- ============================================

CREATE TABLE material_type (
    material_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (organization_id, slug)
);

CREATE TABLE profile_system (
  profile_system_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id   BIGINT REFERENCES organization(organization_id),
  material_type_id  BIGINT REFERENCES material_type(material_type_id),
  name              TEXT NOT NULL,
  manufacturer      TEXT,
  origin_country    TEXT,
  chamber_count     INT,
  wall_thickness_mm NUMERIC(5,2),
  u_value           NUMERIC(5,3),
  wind_resistance   TEXT,
  certification     TEXT[],
  datasheet_url     TEXT,
  is_active         BOOLEAN DEFAULT true,
  meta              JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_category (
    product_category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon_svg TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    UNIQUE (organization_id, slug)
);

CREATE TABLE product_type (
    product_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT REFERENCES organization (organization_id),
    product_category_id BIGINT NOT NULL REFERENCES product_category (product_category_id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon_key TEXT,
    icon_svg TEXT,
    opening_mechanism TEXT,
    is_operable BOOLEAN DEFAULT true,
    requires_track BOOLEAN DEFAULT false,
    panel_count_min INT DEFAULT 1,
    panel_count_max INT DEFAULT 1,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (organization_id, slug)
);

CREATE TABLE product (
  product_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  product_type_id     BIGINT NOT NULL REFERENCES product_type(product_type_id),
  profile_system_id   BIGINT REFERENCES profile_system(profile_system_id),
  sku_prefix          TEXT,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL,
  tagline             TEXT,
  short_description   TEXT,
  description         TEXT,
  technical_summary   TEXT,
  thumbnail_url       TEXT,
  gallery_url         TEXT[],
  min_width_mm        INT,
  max_width_mm        INT,
  min_height_mm       INT,
  max_height_mm       INT,
  size_step_mm        INT DEFAULT 50,
  is_custom_size      BOOLEAN DEFAULT true,
  lead_time_day       INT,
  warranty_year       INT DEFAULT 10,
  is_featured         BOOLEAN DEFAULT false,
  is_active           BOOLEAN DEFAULT true,
  sort_order          INT DEFAULT 0,
  meta                JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  deleted_at          TIMESTAMPTZ,
  created_by          BIGINT REFERENCES profile(profile_id),
  UNIQUE (organization_id, slug)
);

CREATE TABLE finish (
    finish_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    code TEXT,
    finish_type TEXT,
    hex_color TEXT,
    texture_url TEXT,
    is_standard BOOLEAN DEFAULT true,
    surcharge_pct NUMERIC(5, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    meta JSONB DEFAULT '{}',
    UNIQUE (organization_id, slug)
);

CREATE TABLE glass_type (
    glass_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    glass_category TEXT,
    thickness_mm TEXT,
    u_value NUMERIC(5, 3),
    shgc NUMERIC(4, 3),
    vlt NUMERIC(4, 3),
    acoustic_db INT,
    is_safety_glass BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    meta JSONB DEFAULT '{}',
    UNIQUE (organization_id, slug)
);

CREATE TABLE hardware_option (
    hardware_option_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT REFERENCES organization (organization_id),
    name TEXT NOT NULL,
    hardware_type TEXT,
    manufacturer TEXT,
    finish TEXT,
    is_standard BOOLEAN DEFAULT true,
    unit_price NUMERIC(12, 2),
    meta JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE product_variant (
    product_variant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organization (organization_id),
    product_id BIGINT NOT NULL REFERENCES product (product_id),
    finish_id BIGINT REFERENCES finish (finish_id),
    glass_type_id BIGINT REFERENCES glass_type (glass_type_id),
    sku TEXT NOT NULL,
    name TEXT,
    width_mm INT DEFAULT 0,
    height_mm INT DEFAULT 0,
    panel_count INT DEFAULT 1,
    base_price NUMERIC(12, 2),
    is_custom BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (organization_id, sku)
);

CREATE TABLE product_feature (
    product_feature_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product (product_id) ON DELETE CASCADE,
    feature_type TEXT,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE product_certification (
    product_certification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product (product_id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    issuing_body TEXT,
    certificate_number TEXT,
    issued_at DATE,
    expires_at DATE,
    document_url TEXT
);

CREATE TABLE product_hardware (
    product_hardware_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product (product_id) ON DELETE CASCADE,
    hardware_option_id BIGINT NOT NULL REFERENCES hardware_option (hardware_option_id),
    is_included BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0
);

-- Junction: which finishes are available for which product
CREATE TABLE product_finish (
    product_finish_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product (product_id) ON DELETE CASCADE,
    finish_id BIGINT NOT NULL REFERENCES finish (finish_id) ON DELETE CASCADE,
    UNIQUE (product_id, finish_id)
);

-- Junction: which glass types are available for which product
CREATE TABLE product_glass (
    product_glass_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES product (product_id) ON DELETE CASCADE,
    glass_type_id BIGINT NOT NULL REFERENCES glass_type (glass_type_id) ON DELETE CASCADE,
    UNIQUE (product_id, glass_type_id)
);

-- ============================================
-- 4. Projects (portfolio / gallery)
-- ============================================

CREATE TABLE project (
  project_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id      BIGINT NOT NULL REFERENCES organization(organization_id),
  project_number       TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  location             TEXT,
  image_url            TEXT,
  gallery_url          TEXT[],
  is_featured          BOOLEAN DEFAULT true,
  sort_order           INT DEFAULT 0,
  meta                 JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  deleted_at           TIMESTAMPTZ
);

-- ============================================
-- 5. Indexes
-- ============================================

CREATE INDEX idx_product_type ON product (product_type_id, is_active);

CREATE INDEX idx_product_org ON product (
    organization_id,
    is_active,
    sort_order
);

CREATE INDEX idx_product_slug ON product (slug);

CREATE INDEX idx_product_featured ON product (is_featured)
WHERE
    is_featured = true;

CREATE INDEX idx_variant_sku ON product_variant (sku, organization_id);

CREATE INDEX idx_variant_product ON product_variant (product_id, is_active);

CREATE INDEX idx_project_org ON project (
    organization_id,
    is_featured,
    sort_order
);
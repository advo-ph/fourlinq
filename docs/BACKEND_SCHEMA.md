# FourlinQ — Backend Data Architecture

**Version 2.2 — March 2026**
Platform: PostgreSQL 16 on Contabo VPS (62.146.237.12, Singapore)
Seed data source: `src/data/fourlinq-data.ts` — verified from official FourlinQ brochures and physical profile samples
Database: `fourlinq` / User: `fourlinq` / Host: `localhost:5432` (on VPS)
Auth: Self-owned `auth_user` table — no platform lock-in (not yet implemented)

## Current Deployment

```
VPS: Contabo Cloud VPS 20 SSD — Singapore (62.146.237.12)
OS: Ubuntu 24.04 LTS
DB: PostgreSQL 16
App: Node.js 22 + Express + PM2
Web: Nginx reverse proxy + Let's Encrypt SSL
Domain: fourlinq.ph
```

## Active API Endpoints

```
# Public (customer-facing)
POST /api/contact              — Contact form → inquiries table
POST /api/quote-request        — Quote modal → inquiries table (with config JSON)
POST /api/save-configuration   — Design tool → inquiries table (with config JSON)
POST /api/chat/stream          — LinQ chatbot (Gemini SSE stream, verified knowledge base)

# Admin
GET  /api/admin/inquiries      — List inquiries (?type, ?status, ?limit, ?offset)
PATCH /api/admin/inquiries/:id — Update status/notes
POST /api/admin/chat/stream    — LinQ Admin chatbot (Gemini SSE + live DB stats injection)

# Utility
GET  /api/health               — Health check
```

## Active Tables

### `inquiries` (operational — stores all leads)

```sql
CREATE TABLE inquiries (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type        TEXT NOT NULL DEFAULT 'contact',  -- 'contact'|'quote'|'configuration'
  ref_id      TEXT,                              -- 'CT-xxx'|'QR-xxx'|'CFG-xxx'
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  subject     TEXT,
  message     TEXT,
  product_id  TEXT,
  product_name TEXT,
  config      JSONB,                             -- design tool config or quote details
  notes       TEXT,
  status      TEXT DEFAULT 'new',                -- 'new'|'contacted'|'quoted'|'won'|'lost'
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

## Future Schema (from original design — not yet deployed)  
PK convention: `{table}_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`  
Public-facing tokens/codes: `TEXT` generated at app layer (nanoid, cuid2, or similar)  
Timestamps: `created_at`, `updated_at` on every table  
Soft deletes: `deleted_at TIMESTAMPTZ` nullable on all major entities

---

## Why BIGINT over UUID

| Property            | BIGINT (8 bytes)           | UUID (16 bytes)                        |
| ------------------- | -------------------------- | -------------------------------------- |
| Storage per column  | 8 bytes                    | 16 bytes                               |
| Index size          | ~50% smaller               | larger                                 |
| Insert performance  | Sequential, cache-friendly | Random, causes B-tree page splits      |
| Join performance    | Faster integer comparison  | Slower string comparison               |
| Readability in logs | `1042`                     | `f47ac10b-58cc-4372-a567-0e02b2c3d479` |
| Portability         | Universal                  | Universal                              |

> Public-facing identifiers (quotation numbers, session tokens, referral codes) use
> human-readable TEXT strings generated at the application layer — never expose raw BIGINT PKs in URLs.

---

## Portability Notes

This schema uses only standard PostgreSQL features:

- `BIGINT GENERATED ALWAYS AS IDENTITY` — standard SQL:2003
- `JSONB` — PostgreSQL 9.4+
- `vector` extension — pgvector, available on all major managed PostgreSQL hosts
- `TIMESTAMPTZ` — standard
- No Supabase-specific functions (`auth.uid()`, `auth.jwt()`)
- RLS policies reference your own `auth_user` table and a session context variable

To migrate between hosts: `pg_dump --no-owner --no-acl` and restore. Zero platform-specific syntax.

---

## Session Context for RLS

Since we're not using Supabase auth, RLS reads from a session-level variable set by the application at connection time:

```sql
-- App sets this at the start of every connection/transaction
SET LOCAL app.current_user_id = '1042';
SET LOCAL app.current_org_id  = '3';
SET LOCAL app.current_role    = 'agent';

-- RLS policies read it like:
current_setting('app.current_user_id')::BIGINT
current_setting('app.current_org_id')::BIGINT
current_setting('app.current_role')
```

---

## Hierarchy Overview

```
organization
├── branch
├── agent → profile → auth_user
├── product catalog
│   ├── material_type
│   ├── profile_system
│   ├── product_category
│   ├── product_type
│   ├── product
│   │   ├── product_variant (finish × glass × size)
│   │   ├── product_feature
│   │   ├── product_certification
│   │   └── product_hardware
│   ├── finish
│   ├── glass_type
│   └── hardware_option
├── pricing
│   ├── price_list
│   ├── price_list_item
│   └── discount_rule
├── customer
│   ├── company (B2B)
│   ├── customer_address
│   ├── customer_phone
│   ├── customer_email
│   └── customer_social
├── lead
│   ├── lead_source
│   ├── lead_activity
│   └── lead_assignment
├── referral
│   ├── referral_program
│   └── referral
├── quotation
│   ├── quotation_item
│   ├── quotation_discount
│   └── quotation_status_log
├── project
│   ├── project_milestone
│   ├── project_document
│   └── installation_schedule
├── communication
│   ├── message_template
│   ├── email_log
│   └── sms_log
├── notification
├── ai
│   ├── knowledge_base
│   ├── knowledge_chunk (+ pgvector embedding)
│   ├── chatbot_session
│   ├── chatbot_message
│   └── chatbot_feedback
└── config
    ├── setting
    ├── feature_flag
    └── webhook_endpoint
```

---

## 1. Auth & Identity

### `auth_user`

Owned auth table. Replace with your auth provider's user table if needed — just change the FK target.

```sql
CREATE TABLE auth_user (
  auth_user_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT UNIQUE,
  password_hash   TEXT NOT NULL,
  is_verified     BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `profile`

One per `auth_user`. Holds identity + role + org context.

```sql
CREATE TABLE profile (
  profile_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_user_id    BIGINT NOT NULL REFERENCES auth_user(auth_user_id) ON DELETE CASCADE,
  organization_id BIGINT NOT NULL REFERENCES organization(organization_id),
  role_id         BIGINT NOT NULL REFERENCES role(role_id),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  display_name    TEXT,
  avatar_url      TEXT,
  phone           TEXT,
  is_active       BOOLEAN DEFAULT true,
  last_seen_at    TIMESTAMPTZ,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (auth_user_id, organization_id)
);
```

### `role`

```sql
CREATE TABLE role (
  role_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES organization(organization_id),
  name            TEXT NOT NULL,  -- 'super_admin'|'admin'|'agent'|'customer'|'partner'|'viewer'
  label           TEXT,
  is_system       BOOLEAN DEFAULT false,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, name)
);
```

### `permission`

```sql
CREATE TABLE permission (
  permission_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key             TEXT NOT NULL UNIQUE,   -- 'quotation:create', 'lead:delete'
  label           TEXT,
  resource        TEXT NOT NULL,          -- 'quotation'|'lead'|'product'
  action          TEXT NOT NULL           -- 'create'|'read'|'update'|'delete'|'export'
);
```

### `role_permission`

```sql
CREATE TABLE role_permission (
  role_permission_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_id            BIGINT NOT NULL REFERENCES role(role_id) ON DELETE CASCADE,
  permission_id      BIGINT NOT NULL REFERENCES permission(permission_id) ON DELETE CASCADE,
  UNIQUE (role_id, permission_id)
);
```

---

## 2. Organization & Venue

### `organization`

```sql
CREATE TABLE organization (
  organization_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,   -- 'fourlinq'
  logo_url        TEXT,
  website         TEXT,
  tax_id          TEXT,
  currency        TEXT DEFAULT 'PHP',
  timezone        TEXT DEFAULT 'Asia/Manila',
  locale          TEXT DEFAULT 'en-PH',
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### `branch`

```sql
CREATE TABLE branch (
  branch_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organization(organization_id),
  name            TEXT NOT NULL,           -- 'Main Office'|'Ortigas — CW Home Depot'|'Alabang — CW Home Depot'|'Cebu Branch'
  code            TEXT,                    -- 'main'|'ortigas'|'alabang'|'cebu'
  address_line_1  TEXT,
  address_line_2  TEXT,
  city            TEXT,
  province        TEXT,
  region          TEXT,
  postal_code     TEXT,
  country         TEXT DEFAULT 'PH',
  lat             NUMERIC(10,7),
  lng             NUMERIC(10,7),
  phone           TEXT,
  email           TEXT,
  is_showroom     BOOLEAN DEFAULT true,
  is_active       BOOLEAN DEFAULT true,
  operating_hour  JSONB,                   -- {mon:{open:'09:00',close:'18:00'}, ...}
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### `agent`

```sql
CREATE TABLE agent (
  agent_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organization(organization_id),
  profile_id      BIGINT NOT NULL REFERENCES profile(profile_id),
  branch_id       BIGINT REFERENCES branch(branch_id),
  agent_type      TEXT NOT NULL,           -- 'sales'|'installer'|'consultant'|'manager'
  employee_number TEXT,
  commission_rate NUMERIC(5,4) DEFAULT 0,  -- 0.0500 = 5%
  is_active       BOOLEAN DEFAULT true,
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (organization_id, profile_id)
);
```

---

## 3. Product Catalog

### `material_type`

```sql
CREATE TABLE material_type (
  material_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id  BIGINT REFERENCES organization(organization_id),
  name             TEXT NOT NULL,          -- 'uPVC'|'Aluminium'|'Timber'|'Composite'
  slug             TEXT NOT NULL,
  description      TEXT,
  is_active        BOOLEAN DEFAULT true,
  sort_order       INT DEFAULT 0,
  meta             JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, slug)
);
```

### `profile_system`

The actual extrusion profile brand — Schuco, Rehau, Veka, etc.

```sql
CREATE TABLE profile_system (
  profile_system_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id   BIGINT REFERENCES organization(organization_id),
  material_type_id  BIGINT REFERENCES material_type(material_type_id),
  name              TEXT NOT NULL,          -- 'Schuco Corona CT 70'
  manufacturer      TEXT,                   -- 'Schuco'|'Rehau'|'Veka'
  origin_country    TEXT,                   -- 'DE'|'AT'|'CN'
  chamber_count     INT,
  wall_thickness_mm NUMERIC(5,2),
  u_value           NUMERIC(5,3),           -- W/m²K
  wind_resistance   TEXT,                   -- '250kph'
  certification     TEXT[],                 -- ['EN12608','NSCP2015']
  datasheet_url     TEXT,
  is_active         BOOLEAN DEFAULT true,
  meta              JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);
```

### `product_category`

```sql
CREATE TABLE product_category (
  product_category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT REFERENCES organization(organization_id),
  name                TEXT NOT NULL,        -- 'Window'|'Door'|'System'
  slug                TEXT NOT NULL,        -- 'windows'|'doors'|'systems' (matches frontend ProductCategory)
  icon_svg            TEXT,
  sort_order          INT DEFAULT 0,
  is_active           BOOLEAN DEFAULT true,
  UNIQUE (organization_id, slug)
);

-- Seed values (slugs match frontend ProductCategory type exactly):
-- INSERT INTO product_category (name, slug, sort_order) VALUES
--   ('Window',  'windows', 1),
--   ('Door',    'doors',   2),
--   ('System',  'systems', 3);
```

### `product_type`

```sql
CREATE TABLE product_type (
  product_type_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT REFERENCES organization(organization_id),
  product_category_id BIGINT NOT NULL REFERENCES product_category(product_category_id),
  name                TEXT NOT NULL,        -- 'Casement'|'Sliding'|'Bifold'
  slug                TEXT NOT NULL,        -- 'casement'|'sliding'|'bifold' (matches frontend icon keys)
  description         TEXT,
  icon_key            TEXT,                 -- React component lookup key: 'casement'|'awning'|'sliding'
                                            -- |'fixed'|'tilt-turn'|'bifold'|'lift-slide'
                                            -- |'french-door'|'sliding-door'|'entrance'
  icon_svg            TEXT,                 -- optional raw SVG string fallback
  opening_mechanism   TEXT,
    -- 'side_hinge'|'top_hinge'|'slide'|'fold'|'fixed'|'tilt_turn'|'lift_slide'
  is_operable         BOOLEAN DEFAULT true,
  requires_track      BOOLEAN DEFAULT false,
  panel_count_min     INT DEFAULT 1,
  panel_count_max     INT DEFAULT 1,
  sort_order          INT DEFAULT 0,
  is_active           BOOLEAN DEFAULT true,
  meta                JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, slug)
);

-- Seed values (icon_key maps to WindowIcons.tsx component names):
-- WINDOWS:
--   ('Casement',    'casement',   'casement',     'side_hinge',  cat=windows)
--   ('Awning',      'awning',     'awning',       'top_hinge',   cat=windows)
--   ('Sliding',     'sliding',    'sliding',      'slide',       cat=windows)
--   ('Fixed',       'fixed',      'fixed',        'fixed',       cat=windows)
--   ('Tilt & Turn', 'tilt-turn',  'tilt-turn',    'tilt_turn',   cat=windows)
-- DOORS:
--   ('Sliding Door','sliding-door','sliding-door', 'slide',       cat=doors)
--   ('Bifold',      'bifold',     'bifold',       'fold',        cat=doors)
--   ('Lift & Slide','lift-slide', 'lift-slide',   'lift_slide',  cat=doors)
--   ('French Door', 'french-door','french-door',  'side_hinge',  cat=doors)
--   ('Entrance',    'entrance',   'entrance',     'side_hinge',  cat=doors)
```

### `product`

```sql
CREATE TABLE product (
  product_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  product_type_id     BIGINT NOT NULL REFERENCES product_type(product_type_id),
  profile_system_id   BIGINT REFERENCES profile_system(profile_system_id),
  sku_prefix          TEXT,                 -- 'CAS-70'
  name                TEXT NOT NULL,        -- 'Casement 70 Series'
  slug                TEXT NOT NULL,        -- 'casement-70' (matches frontend product.id)
  tagline             TEXT,
  short_description   TEXT,                 -- maps to frontend Product.shortDescription
  description         TEXT,
  technical_summary   TEXT,
  thumbnail_url       TEXT,
  gallery_url         TEXT[],
  min_width_mm        INT,
  max_width_mm        INT,
  min_height_mm       INT,
  max_height_mm       INT,
  size_step_mm        INT DEFAULT 50,       -- configurator increment step (matches frontend sizeConstraints.step)
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

-- Slug convention matches frontend product IDs exactly:
--   'casement-70', 'sliding-85', 'fixed-panel',
--   'french-door', 'sliding-door', 'bifold-system',
--   'entrance-system', 'curtain-wall'
```

### `finish`

```sql
CREATE TABLE finish (
  finish_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES organization(organization_id),
  name            TEXT NOT NULL,            -- 'White'|'Jet Black'|'Charcoal Gray'|'Matte Quartz'|'Oak Light'|'Walnut'|etc.
  slug            TEXT NOT NULL,            -- 'white'|'jet-black'|'charcoal-gray'|'oak-light'|'walnut'|etc.
  code            TEXT,                     -- RAL code if applicable
  finish_type     TEXT,                     -- 'solid'|'wood-grain'
  hex_color       TEXT,                     -- matches FRAME_FINISHES in fourlinq-data.ts
  texture_url     TEXT,
  is_standard     BOOLEAN DEFAULT true,
  surcharge_pct   NUMERIC(5,4) DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  meta            JSONB DEFAULT '{}',
  UNIQUE (organization_id, slug)
);

-- Seed values — 11 verified finishes from physical uPVC profile sample bars
-- Must match FRAME_FINISHES in src/data/fourlinq-data.ts
-- INSERT INTO finish (name, slug, hex_color, finish_type, sort_order) VALUES
--   ('Oak Light',      'oak-light',      '#D6C4A1', 'wood-grain', 1),
--   ('Oak Malt',       'oak-malt',       '#B89A6A', 'wood-grain', 2),
--   ('Woodgray',       'woodgray',       '#8C8680', 'wood-grain', 3),
--   ('2 Wood Black',   '2-wood-black',   '#2E2A27', 'wood-grain', 4),
--   ('Dark Oak',       'dark-oak',       '#5C3A1E', 'wood-grain', 5),
--   ('Walnut',         'walnut',         '#6B4226', 'wood-grain', 6),
--   ('Golden Oak',     'golden-oak',     '#C8820A', 'wood-grain', 7),
--   ('White',          'white',          '#F5F5F5', 'solid', 8),
--   ('Jet Black',      'jet-black',      '#1A1A1A', 'solid', 9),
--   ('Charcoal Gray',  'charcoal-gray',  '#4A4A4A', 'solid', 10),
--   ('Matte Quartz',   'matte-quartz',   '#9E9E9E', 'solid', 11);
```

### `glass_type`

```sql
CREATE TABLE glass_type (
  glass_type_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES organization(organization_id),
  name            TEXT NOT NULL,            -- 'Clear Float'|'Low-E Coated'|'Frosted Privacy'|'Tinted Bronze'
  slug            TEXT NOT NULL,            -- 'clear'|'low-e'|'frosted'|'tinted' (matches frontend configurator)
  glass_category  TEXT,                     -- 'single'|'double'|'triple'|'laminated'|'tempered'
  thickness_mm    TEXT,                     -- '4mm'|'4+12+4mm'
  u_value         NUMERIC(5,3),
  shgc            NUMERIC(4,3),             -- solar heat gain coefficient
  vlt             NUMERIC(4,3),             -- visible light transmittance
  acoustic_db     INT,
  is_safety_glass BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  meta            JSONB DEFAULT '{}',
  UNIQUE (organization_id, slug)
);

-- Seed values (names match frontend product.glassOptions strings):
-- INSERT INTO glass_type (name, slug, sort_order) VALUES
--   ('Clear Float',       'clear',     1),
--   ('Low-E Coated',      'low-e',     2),
--   ('Frosted Privacy',   'frosted',   3),
--   ('Tinted Bronze',     'tinted-bronze', 4),
--   ('Tinted Grey',       'tinted-grey',   5),
--   ('Laminated Safety',  'laminated', 6),
--   ('Decorative Lead',   'decorative-lead', 7),
--   ('Reflective',        'reflective', 8),
--   ('Obscure Pattern',   'obscure-pattern', 9);
```

### `hardware_option`

```sql
CREATE TABLE hardware_option (
  hardware_option_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id    BIGINT REFERENCES organization(organization_id),
  name               TEXT NOT NULL,         -- 'Roto NT Multipoint Lock'
  hardware_type      TEXT,                  -- 'handle'|'lock'|'hinge'|'actuator'|'seal'|'threshold'
  manufacturer       TEXT,
  finish             TEXT,                  -- 'silver'|'gold'|'black'|'chrome'
  is_standard        BOOLEAN DEFAULT true,
  unit_price         NUMERIC(12,2),
  meta               JSONB DEFAULT '{}',
  is_active          BOOLEAN DEFAULT true
);
```

### `product_variant`

The actual orderable SKU. Combines product × finish × glass × size.

```sql
CREATE TABLE product_variant (
  product_variant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id    BIGINT NOT NULL REFERENCES organization(organization_id),
  product_id         BIGINT NOT NULL REFERENCES product(product_id),
  finish_id          BIGINT REFERENCES finish(finish_id),
  glass_type_id      BIGINT REFERENCES glass_type(glass_type_id),
  sku                TEXT NOT NULL,          -- 'CAS70-MBLK-CLR-1200x1400'
                                             -- format: {product_sku_prefix}-{finish_slug}-{glass_slug}-{WxH}
  name               TEXT,                   -- auto-generated: 'Casement 70 — Matte Black / Clear Float (1200×1400)'
  width_mm           INT DEFAULT 0,          -- 0 = custom
  height_mm          INT DEFAULT 0,
  panel_count        INT DEFAULT 1,
  base_price         NUMERIC(12,2),
  is_custom          BOOLEAN DEFAULT false,
  is_active          BOOLEAN DEFAULT true,
  meta               JSONB DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, sku)
);
```

### `product_feature`

Structured technical specs — feeds spec sheets and AI chatbot.

```sql
CREATE TABLE product_feature (
  product_feature_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id         BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  feature_type       TEXT,  -- 'thermal'|'acoustic'|'security'|'weather'|'aesthetic'|'compliance'
  label              TEXT NOT NULL,          -- 'Wind Resistance'
  value              TEXT NOT NULL,          -- '250kph Typhoon Grade'
  unit               TEXT,                   -- 'kph'|'dB'|'W/m²K'
  sort_order         INT DEFAULT 0
);
```

### `product_certification`

```sql
CREATE TABLE product_certification (
  product_certification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id               BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  certification_name       TEXT NOT NULL,    -- 'NSCP 2015'|'EN 12608'
  issuing_body             TEXT,
  certificate_number       TEXT,
  issued_at                DATE,
  expires_at               DATE,
  document_url             TEXT
);
```

### `product_hardware`

```sql
CREATE TABLE product_hardware (
  product_hardware_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id          BIGINT NOT NULL REFERENCES product(product_id) ON DELETE CASCADE,
  hardware_option_id  BIGINT NOT NULL REFERENCES hardware_option(hardware_option_id),
  is_included         BOOLEAN DEFAULT true,
  is_required         BOOLEAN DEFAULT false,
  sort_order          INT DEFAULT 0
);
```

---

## 4. Pricing

### `price_list`

```sql
CREATE TABLE price_list (
  price_list_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organization(organization_id),
  name            TEXT NOT NULL,            -- 'Standard 2026'|'Partner Rate'|'Expo Promo Q1'
  currency        TEXT DEFAULT 'PHP',
  is_default      BOOLEAN DEFAULT false,
  valid_from      DATE,
  valid_until     DATE,
  created_by      BIGINT REFERENCES profile(profile_id),
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `price_list_item`

```sql
CREATE TABLE price_list_item (
  price_list_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  price_list_id      BIGINT NOT NULL REFERENCES price_list(price_list_id) ON DELETE CASCADE,
  product_variant_id BIGINT NOT NULL REFERENCES product_variant(product_variant_id),
  unit_price         NUMERIC(12,2) NOT NULL,
  unit_price_per     TEXT DEFAULT 'sqm',    -- 'sqm'|'unit'|'linear_meter'
  min_qty            INT DEFAULT 1,
  note               TEXT,
  UNIQUE (price_list_id, product_variant_id)
);
```

### `discount_rule`

```sql
CREATE TABLE discount_rule (
  discount_rule_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id  BIGINT NOT NULL REFERENCES organization(organization_id),
  name             TEXT NOT NULL,
  discount_type    TEXT NOT NULL,           -- 'percentage'|'fixed_amount'|'free_item'
  discount_value   NUMERIC(12,4),
  applies_to       TEXT,                    -- 'all'|'product_category'|'product_type'|'customer_type'
  applies_to_id    BIGINT,
  condition_type   TEXT,                    -- 'min_order_value'|'min_qty'|'customer_tag'|'promo_code'
  condition_value  TEXT,
  promo_code       TEXT UNIQUE,
  is_stackable     BOOLEAN DEFAULT false,
  max_use_count    INT,
  use_count        INT DEFAULT 0,
  valid_from       TIMESTAMPTZ,
  valid_until      TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT true,
  created_by       BIGINT REFERENCES profile(profile_id)
);
```

---

## 5. Customer & CRM

### `customer_type`

```sql
CREATE TABLE customer_type (
  customer_type_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id       BIGINT REFERENCES organization(organization_id),
  name                  TEXT NOT NULL,      -- 'Homeowner'|'Developer'|'Architect'|'Contractor'|'OFW'
  slug                  TEXT NOT NULL,
  description           TEXT,
  default_price_list_id BIGINT REFERENCES price_list(price_list_id),
  default_discount_pct  NUMERIC(5,4) DEFAULT 0,
  is_active             BOOLEAN DEFAULT true,
  sort_order            INT DEFAULT 0,
  UNIQUE (organization_id, slug)
);
```

### `company`

B2B parent entity.

```sql
CREATE TABLE company (
  company_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id   BIGINT NOT NULL REFERENCES organization(organization_id),
  name              TEXT NOT NULL,
  industry          TEXT,                   -- 'real_estate'|'architecture'|'construction'|'hospitality'
  website           TEXT,
  tin               TEXT,
  billing_address   TEXT,
  is_active         BOOLEAN DEFAULT true,
  assigned_agent_id BIGINT REFERENCES agent(agent_id),
  meta              JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
```

### `customer`

```sql
CREATE TABLE customer (
  customer_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id    BIGINT NOT NULL REFERENCES organization(organization_id),
  profile_id         BIGINT REFERENCES profile(profile_id),         -- null if not registered
  company_id         BIGINT REFERENCES company(company_id),         -- null if B2C
  customer_type_id   BIGINT REFERENCES customer_type(customer_type_id),
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL,
  nickname           TEXT,
  job_title          TEXT,
  preferred_language TEXT DEFAULT 'en',
  preferred_contact  TEXT DEFAULT 'email',  -- 'email'|'phone'|'whatsapp'|'viber'
  prc_number         TEXT,                  -- for licensed architects/engineers
  assigned_agent_id  BIGINT REFERENCES agent(agent_id),
  referred_by_id     BIGINT REFERENCES customer(customer_id),       -- self-ref
  source_id          BIGINT REFERENCES lead_source(lead_source_id),
  note               TEXT,
  is_vip             BOOLEAN DEFAULT false,
  is_subscribed      BOOLEAN DEFAULT true,
  lifetime_value     NUMERIC(15,2) DEFAULT 0,
  meta               JSONB DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  deleted_at         TIMESTAMPTZ,
  created_by         BIGINT REFERENCES profile(profile_id)
);
```

### `customer_address`

```sql
CREATE TABLE customer_address (
  customer_address_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id         BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  address_type        TEXT,                 -- 'home'|'billing'|'project'|'office'
  label               TEXT,                 -- 'Alabang House'|'BGC Project Site'
  line_1              TEXT NOT NULL,
  line_2              TEXT,
  city                TEXT NOT NULL,
  province            TEXT,
  region              TEXT,
  postal_code         TEXT,
  country             TEXT DEFAULT 'PH',
  lat                 NUMERIC(10,7),
  lng                 NUMERIC(10,7),
  is_default          BOOLEAN DEFAULT false
);
```

### `customer_phone`

```sql
CREATE TABLE customer_phone (
  customer_phone_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id       BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  phone_type        TEXT,                   -- 'mobile'|'landline'|'whatsapp'|'viber'
  number            TEXT NOT NULL,
  is_primary        BOOLEAN DEFAULT false,
  is_verified       BOOLEAN DEFAULT false
);
```

### `customer_email`

```sql
CREATE TABLE customer_email (
  customer_email_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id       BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  email_type        TEXT,                   -- 'personal'|'work'|'billing'
  is_primary        BOOLEAN DEFAULT false,
  is_verified       BOOLEAN DEFAULT false
);
```

### `customer_social`

```sql
CREATE TABLE customer_social (
  customer_social_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id        BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  platform           TEXT NOT NULL,         -- 'facebook'|'instagram'|'linkedin'|'viber'|'youtube'
  handle             TEXT,
  profile_url        TEXT,
  is_verified        BOOLEAN DEFAULT false
);
```

### `tag`

```sql
CREATE TABLE tag (
  tag_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organization(organization_id),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  color           TEXT,                     -- '#3B82F6'
  entity_type     TEXT,                     -- 'customer'|'lead'|'project'|'product'
  UNIQUE (organization_id, slug, entity_type)
);
```

### `customer_tag`

```sql
CREATE TABLE customer_tag (
  customer_tag_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id     BIGINT NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  tag_id          BIGINT NOT NULL REFERENCES tag(tag_id) ON DELETE CASCADE,
  tagged_by       BIGINT REFERENCES profile(profile_id),
  tagged_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (customer_id, tag_id)
);
```

---

## 6. Lead Management

### `lead_source`

```sql
CREATE TABLE lead_source (
  lead_source_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES organization(organization_id),
  name            TEXT NOT NULL,            -- 'Facebook Ads'|'Website Form'|'Expo'|'Referral'|'Walk-in'
  channel         TEXT,                     -- 'social'|'organic'|'paid'|'referral'|'direct'|'event'
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0
);
```

### `lead`

```sql
CREATE TABLE lead (
  lead_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id   BIGINT NOT NULL REFERENCES organization(organization_id),
  customer_id       BIGINT REFERENCES customer(customer_id),
  lead_source_id    BIGINT REFERENCES lead_source(lead_source_id),
  assigned_agent_id BIGINT REFERENCES agent(agent_id),
  branch_id         BIGINT REFERENCES branch(branch_id),

  -- Raw contact before customer record exists
  first_name        TEXT NOT NULL,
  last_name         TEXT,
  email             TEXT,
  phone             TEXT,

  -- Inquiry
  inquiry_type      TEXT,  -- 'window'|'door'|'both'|'general'|'quotation'
  project_type      TEXT,  -- 'new_build'|'renovation'|'replacement'|'commercial'
  budget_range      TEXT,  -- '100k-300k'|'300k-500k'|'500k+'
  timeline          TEXT,  -- 'immediate'|'3_months'|'6_months'|'1_year'
  location_city     TEXT,
  location_province TEXT,
  product_interest  TEXT[],
  message           TEXT,

  -- Pipeline
  status            TEXT NOT NULL DEFAULT 'new',
    -- 'new'|'contacted'|'qualified'|'site_visit_scheduled'|'site_visit_done'
    -- |'quotation_sent'|'negotiation'|'won'|'lost'|'unqualified'
  lost_reason       TEXT,
  priority          TEXT DEFAULT 'normal',  -- 'low'|'normal'|'high'|'urgent'
  follow_up_at      TIMESTAMPTZ,
  won_at            TIMESTAMPTZ,
  lost_at           TIMESTAMPTZ,

  -- AI
  ai_score          SMALLINT,               -- 0-100
  ai_summary        TEXT,

  meta              JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  created_by        BIGINT REFERENCES profile(profile_id)
);
```

### `lead_activity`

```sql
CREATE TABLE lead_activity (
  lead_activity_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id          BIGINT NOT NULL REFERENCES lead(lead_id) ON DELETE CASCADE,
  agent_id         BIGINT REFERENCES agent(agent_id),
  activity_type    TEXT NOT NULL,
    -- 'call'|'sms'|'email'|'whatsapp'|'site_visit'|'showroom_visit'
    -- |'quotation_sent'|'follow_up'|'note'|'status_change'
  subject          TEXT,
  body             TEXT,
  outcome          TEXT,                    -- 'reached'|'voicemail'|'no_answer'
  duration_min     INT,
  next_action      TEXT,
  next_action_at   TIMESTAMPTZ,
  attachment_url   TEXT[],
  created_at       TIMESTAMPTZ DEFAULT now(),
  created_by       BIGINT REFERENCES profile(profile_id)
);
```

### `lead_assignment`

```sql
CREATE TABLE lead_assignment (
  lead_assignment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lead_id            BIGINT NOT NULL REFERENCES lead(lead_id) ON DELETE CASCADE,
  agent_id           BIGINT NOT NULL REFERENCES agent(agent_id),
  assigned_by        BIGINT REFERENCES profile(profile_id),
  assigned_at        TIMESTAMPTZ DEFAULT now(),
  unassigned_at      TIMESTAMPTZ,
  reason             TEXT
);
```

---

## 7. Referral

### `referral_program`

```sql
CREATE TABLE referral_program (
  referral_program_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  name                TEXT NOT NULL,
  description         TEXT,
  reward_type         TEXT,               -- 'cash'|'discount'|'gift_card'|'store_credit'
  referrer_reward     NUMERIC(12,2),
  referee_discount    NUMERIC(5,4),
  min_order_value     NUMERIC(12,2),
  reward_trigger      TEXT,               -- 'lead_qualified'|'quotation_accepted'|'project_completed'
  is_active           BOOLEAN DEFAULT true,
  valid_from          DATE,
  valid_until         DATE,
  terms_url           TEXT,
  meta                JSONB DEFAULT '{}'
);
```

### `referral`

```sql
CREATE TABLE referral (
  referral_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id      BIGINT NOT NULL REFERENCES organization(organization_id),
  referral_program_id  BIGINT REFERENCES referral_program(referral_program_id),
  referrer_customer_id BIGINT NOT NULL REFERENCES customer(customer_id),
  referee_customer_id  BIGINT REFERENCES customer(customer_id),
  referee_lead_id      BIGINT REFERENCES lead(lead_id),
  referral_code        TEXT NOT NULL UNIQUE,  -- app-generated, e.g. 'REF-ABCD1234'
  status               TEXT DEFAULT 'pending', -- 'pending'|'qualified'|'rewarded'|'expired'
  referrer_reward      NUMERIC(12,2),
  referee_discount     NUMERIC(5,4),
  rewarded_at          TIMESTAMPTZ,
  note                 TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Quotation

### `quotation`

```sql
CREATE TABLE quotation (
  quotation_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  quotation_number    TEXT NOT NULL UNIQUE,   -- 'FLQ-2026-00142' (app-generated)
  revision            SMALLINT DEFAULT 1,
  customer_id         BIGINT NOT NULL REFERENCES customer(customer_id),
  lead_id             BIGINT REFERENCES lead(lead_id),
  agent_id            BIGINT NOT NULL REFERENCES agent(agent_id),
  branch_id           BIGINT REFERENCES branch(branch_id),
  price_list_id       BIGINT REFERENCES price_list(price_list_id),

  project_name        TEXT,
  project_address_id  BIGINT REFERENCES customer_address(customer_address_id),
  project_type        TEXT,
  note                TEXT,
  internal_note       TEXT,

  subtotal            NUMERIC(15,2),
  discount_total      NUMERIC(15,2) DEFAULT 0,
  tax_total           NUMERIC(15,2) DEFAULT 0,
  grand_total         NUMERIC(15,2),
  currency            TEXT DEFAULT 'PHP',
  payment_term        TEXT,               -- '50_50'|'30_70'|'full_upfront'
  validity_day        SMALLINT DEFAULT 30,

  status              TEXT DEFAULT 'draft',
    -- 'draft'|'sent'|'viewed'|'accepted'|'rejected'|'expired'|'converted'
  sent_at             TIMESTAMPTZ,
  viewed_at           TIMESTAMPTZ,
  accepted_at         TIMESTAMPTZ,
  rejected_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  expires_at          TIMESTAMPTZ,
  converted_project_id BIGINT,            -- set when quotation → project

  pdf_url             TEXT,
  signature_url       TEXT,
  signed_at           TIMESTAMPTZ,

  meta                JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  deleted_at          TIMESTAMPTZ,
  created_by          BIGINT REFERENCES profile(profile_id),
  updated_by          BIGINT REFERENCES profile(profile_id)
);
```

### `quotation_item`

```sql
CREATE TABLE quotation_item (
  quotation_item_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quotation_id       BIGINT NOT NULL REFERENCES quotation(quotation_id) ON DELETE CASCADE,
  product_variant_id BIGINT REFERENCES product_variant(product_variant_id),
  sort_order         SMALLINT DEFAULT 0,
  location_label     TEXT,               -- 'Master Bedroom'|'Living Room'
  description        TEXT,
  width_mm           INT,
  height_mm          INT,
  quantity           NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit               TEXT DEFAULT 'unit', -- 'unit'|'sqm'|'linear_meter'
  unit_price         NUMERIC(12,2) NOT NULL,
  discount_pct       NUMERIC(5,4) DEFAULT 0,
  discount_amount    NUMERIC(12,2) DEFAULT 0,
  line_total         NUMERIC(15,2),
  note               TEXT,
  is_optional        BOOLEAN DEFAULT false,
  meta               JSONB DEFAULT '{}'
);
```

### `quotation_discount`

```sql
CREATE TABLE quotation_discount (
  quotation_discount_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quotation_id          BIGINT NOT NULL REFERENCES quotation(quotation_id) ON DELETE CASCADE,
  discount_rule_id      BIGINT REFERENCES discount_rule(discount_rule_id),
  label                 TEXT,
  discount_type         TEXT,
  discount_value        NUMERIC(12,4),
  amount_applied        NUMERIC(12,2)
);
```

### `quotation_status_log`

```sql
CREATE TABLE quotation_status_log (
  quotation_status_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quotation_id            BIGINT NOT NULL REFERENCES quotation(quotation_id) ON DELETE CASCADE,
  from_status             TEXT,
  to_status               TEXT NOT NULL,
  changed_by              BIGINT REFERENCES profile(profile_id),
  note                    TEXT,
  changed_at              TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. Project & Installation

### `project`

```sql
CREATE TABLE project (
  project_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id      BIGINT NOT NULL REFERENCES organization(organization_id),
  project_number       TEXT NOT NULL UNIQUE,  -- 'PRJ-2026-00089'
  quotation_id         BIGINT REFERENCES quotation(quotation_id),
  customer_id          BIGINT NOT NULL REFERENCES customer(customer_id),
  agent_id             BIGINT REFERENCES agent(agent_id),
  branch_id            BIGINT REFERENCES branch(branch_id),
  project_name         TEXT NOT NULL,
  address_id           BIGINT REFERENCES customer_address(customer_address_id),
  status               TEXT DEFAULT 'confirmed',
    -- 'confirmed'|'in_production'|'ready_for_delivery'|'delivery_scheduled'
    -- |'delivered'|'installation_scheduled'|'installing'|'snagging'|'completed'|'cancelled'
  contracted_value     NUMERIC(15,2),
  paid_amount          NUMERIC(15,2) DEFAULT 0,
  balance              NUMERIC(15,2),
  confirmed_at         DATE,
  target_delivery_date DATE,
  actual_delivery_date DATE,
  target_install_date  DATE,
  actual_install_date  DATE,
  completed_at         TIMESTAMPTZ,
  warranty_expires_at  DATE,
  note                 TEXT,
  internal_note        TEXT,
  meta                 JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  deleted_at           TIMESTAMPTZ,
  created_by           BIGINT REFERENCES profile(profile_id)
);
```

### `project_milestone`

```sql
CREATE TABLE project_milestone (
  project_milestone_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id           BIGINT NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,     -- 'Deposit Received'|'Fabrication Start'|'QC Passed'
  status               TEXT DEFAULT 'pending', -- 'pending'|'in_progress'|'completed'|'blocked'
  due_date             DATE,
  completed_at         TIMESTAMPTZ,
  note                 TEXT,
  sort_order           SMALLINT DEFAULT 0
);
```

### `project_document`

```sql
CREATE TABLE project_document (
  project_document_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id          BIGINT NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
  document_type       TEXT,
    -- 'contract'|'permit'|'floor_plan'|'photo_before'|'photo_after'|'delivery_receipt'|'warranty_certificate'
  name                TEXT NOT NULL,
  file_url            TEXT NOT NULL,
  uploaded_by         BIGINT REFERENCES profile(profile_id),
  uploaded_at         TIMESTAMPTZ DEFAULT now()
);
```

### `installation_schedule`

```sql
CREATE TABLE installation_schedule (
  installation_schedule_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id               BIGINT NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
  lead_installer_id        BIGINT REFERENCES agent(agent_id),
  scheduled_date           DATE NOT NULL,
  time_slot                TEXT,          -- 'morning'|'afternoon'|'full_day'
  estimated_duration_hr    SMALLINT,
  actual_start_at          TIMESTAMPTZ,
  actual_end_at            TIMESTAMPTZ,
  status                   TEXT DEFAULT 'scheduled',
    -- 'scheduled'|'in_progress'|'completed'|'rescheduled'|'cancelled'
  note                     TEXT,
  created_at               TIMESTAMPTZ DEFAULT now()
);
```

---

## 10. Communication

### `message_template`

```sql
CREATE TABLE message_template (
  message_template_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  name                TEXT NOT NULL,
  template_type       TEXT,               -- 'email'|'sms'|'whatsapp'|'push'
  trigger_event       TEXT,               -- 'lead.created'|'quotation.sent'|'project.completed'
  subject             TEXT,
  body_html           TEXT,               -- {{variable}} placeholders
  body_text           TEXT,
  variables           TEXT[],             -- ['customer_name','quotation_number','agent_name']
  is_active           BOOLEAN DEFAULT true,
  meta                JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
```

### `email_log`

```sql
CREATE TABLE email_log (
  email_log_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  template_id         BIGINT REFERENCES message_template(message_template_id),
  to_email            TEXT NOT NULL,
  to_name             TEXT,
  from_email          TEXT NOT NULL,
  subject             TEXT NOT NULL,
  body_html           TEXT,
  status              TEXT DEFAULT 'queued',
    -- 'queued'|'sent'|'delivered'|'opened'|'clicked'|'bounced'|'failed'
  provider            TEXT,               -- 'resend'|'sendgrid'|'postmark'
  provider_message_id TEXT,
  opened_at           TIMESTAMPTZ,
  clicked_at          TIMESTAMPTZ,
  entity_type         TEXT,               -- 'lead'|'quotation'|'project'|'customer'
  entity_id           BIGINT,
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

### `sms_log`

```sql
CREATE TABLE sms_log (
  sms_log_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  to_number           TEXT NOT NULL,
  body                TEXT NOT NULL,
  status              TEXT DEFAULT 'queued',
  provider            TEXT,               -- 'semaphore'|'globe'|'twilio'
  provider_message_id TEXT,
  entity_type         TEXT,
  entity_id           BIGINT,
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

### `notification`

```sql
CREATE TABLE notification (
  notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organization(organization_id),
  profile_id      BIGINT NOT NULL REFERENCES profile(profile_id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
    -- 'lead_assigned'|'quotation_accepted'|'project_milestone'|'follow_up_due'
  title           TEXT NOT NULL,
  body            TEXT,
  action_url      TEXT,
  entity_type     TEXT,
  entity_id       BIGINT,
  is_read         BOOLEAN DEFAULT false,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 11. AI Chatbot & Knowledge Base

### `knowledge_base`

```sql
CREATE TABLE knowledge_base (
  knowledge_base_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id   BIGINT NOT NULL REFERENCES organization(organization_id),
  name              TEXT NOT NULL,
    -- 'Product Facts'|'Why uPVC'|'FAQ'|'Pricing Guide'|'Objection Handling'
  description       TEXT,
  kb_type           TEXT,  -- 'faq'|'product'|'policy'|'educational'|'objection'
  is_active         BOOLEAN DEFAULT true,
  version           SMALLINT DEFAULT 1,
  meta              JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  created_by        BIGINT REFERENCES profile(profile_id)
);
```

### `knowledge_chunk`

The actual content the AI retrieves via semantic search.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_chunk (
  knowledge_chunk_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  knowledge_base_id   BIGINT NOT NULL REFERENCES knowledge_base(knowledge_base_id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  content_type        TEXT,
    -- 'fact'|'faq'|'objection_response'|'product_spec'|'comparison'|'process'
  tags                TEXT[],
  embedding           vector(1536),         -- pgvector, OpenAI text-embedding-3-small
  product_id          BIGINT REFERENCES product(product_id),
  is_active           BOOLEAN DEFAULT true,
  version             SMALLINT DEFAULT 1,
  source_url          TEXT,
  reviewed_by         BIGINT REFERENCES profile(profile_id),
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
```

### `chatbot_session`

```sql
CREATE TABLE chatbot_session (
  chatbot_session_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id    BIGINT NOT NULL REFERENCES organization(organization_id),
  customer_id        BIGINT REFERENCES customer(customer_id),
  lead_id            BIGINT REFERENCES lead(lead_id),
  session_token      TEXT NOT NULL UNIQUE,  -- nanoid generated at app layer
  channel            TEXT DEFAULT 'website', -- 'website'|'facebook'|'instagram'|'whatsapp'
  visitor_id         TEXT,                   -- anonymous browser fingerprint
  ip_address         INET,
  user_agent         TEXT,
  utm_source         TEXT,
  utm_campaign       TEXT,
  started_at         TIMESTAMPTZ DEFAULT now(),
  ended_at           TIMESTAMPTZ,
  message_count      SMALLINT DEFAULT 0,
  model_used         TEXT,                   -- 'claude-sonnet-4-6'
  tokens_used        INT,
  lead_captured      BOOLEAN DEFAULT false,
  handoff_requested  BOOLEAN DEFAULT false,
  handoff_at         TIMESTAMPTZ,
  meta               JSONB DEFAULT '{}'
);
```

### `chatbot_message`

```sql
CREATE TABLE chatbot_message (
  chatbot_message_id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chatbot_session_id    BIGINT NOT NULL REFERENCES chatbot_session(chatbot_session_id) ON DELETE CASCADE,
  role                  TEXT NOT NULL,       -- 'user'|'assistant'|'system'
  content               TEXT NOT NULL,
  intent                TEXT,
    -- 'product_inquiry'|'pricing'|'lead_capture'|'complaint'|'general'
  product_mentioned     TEXT[],
  knowledge_chunk_id    BIGINT[],            -- which chunks were retrieved
  confidence            NUMERIC(4,3),
  created_at            TIMESTAMPTZ DEFAULT now()
);
```

### `chatbot_feedback`

```sql
CREATE TABLE chatbot_feedback (
  chatbot_feedback_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chatbot_session_id  BIGINT NOT NULL REFERENCES chatbot_session(chatbot_session_id) ON DELETE CASCADE,
  chatbot_message_id  BIGINT REFERENCES chatbot_message(chatbot_message_id),
  rating              SMALLINT CHECK (rating BETWEEN 1 AND 5),
  feedback_type       TEXT,                  -- 'thumbs_up'|'thumbs_down'|'written'
  comment             TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

---

## 12. Configuration

### `setting`

```sql
CREATE TABLE setting (
  setting_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organization(organization_id),
  key             TEXT NOT NULL,
    -- 'quotation.validity_days'|'lead.auto_assign'|'chatbot.greeting'
  value           TEXT NOT NULL,
  value_type      TEXT DEFAULT 'string',     -- 'string'|'number'|'boolean'|'json'
  description     TEXT,
  is_public       BOOLEAN DEFAULT false,
  updated_by      BIGINT REFERENCES profile(profile_id),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, key)
);
```

### `feature_flag`

```sql
CREATE TABLE feature_flag (
  feature_flag_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id BIGINT REFERENCES organization(organization_id),  -- null = global
  key             TEXT NOT NULL,
    -- 'chatbot_enabled'|'referral_program'|'online_quotation'
  is_enabled      BOOLEAN DEFAULT false,
  rollout_pct     SMALLINT DEFAULT 100,
  description     TEXT,
  updated_by      BIGINT REFERENCES profile(profile_id),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, key)
);
```

### `webhook_endpoint`

```sql
CREATE TABLE webhook_endpoint (
  webhook_endpoint_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id     BIGINT NOT NULL REFERENCES organization(organization_id),
  name                TEXT NOT NULL,
  url                 TEXT NOT NULL,
  secret              TEXT,                  -- HMAC signing secret
  event_filter        TEXT[],               -- ['lead.created','quotation.accepted']
  is_active           BOOLEAN DEFAULT true,
  last_triggered_at   TIMESTAMPTZ,
  last_status_code    SMALLINT,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

---

## 13. RLS Policies (Portable Pattern)

No platform-specific functions. Uses session variables set by the app layer.

```sql
-- Enable RLS
ALTER TABLE lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunk ENABLE ROW LEVEL SECURITY;
-- (repeat for all tables)

-- Org isolation — every table with organization_id
CREATE POLICY "org_isolation" ON lead
  USING (organization_id = current_setting('app.current_org_id')::BIGINT);

-- Agents see only their assigned leads (unless admin/manager)
CREATE POLICY "agent_lead_access" ON lead
  USING (
    assigned_agent_id = (
      SELECT agent_id FROM agent
      WHERE profile_id = current_setting('app.current_user_id')::BIGINT
    )
    OR current_setting('app.current_role') IN ('admin', 'super_admin', 'manager')
  );

-- Customers see only their own data
CREATE POLICY "customer_own_quotation" ON quotation
  FOR SELECT
  USING (
    customer_id = (
      SELECT customer_id FROM customer
      WHERE profile_id = current_setting('app.current_user_id')::BIGINT
    )
  );

-- Knowledge chunks: public read if active, restricted write
CREATE POLICY "kb_public_read" ON knowledge_chunk
  FOR SELECT USING (is_active = true);

CREATE POLICY "kb_admin_write" ON knowledge_chunk
  FOR ALL
  USING (current_setting('app.current_role') IN ('admin', 'super_admin'));
```

---

## 14. Indexes

```sql
-- Lead pipeline
CREATE INDEX idx_lead_status     ON lead(organization_id, status, deleted_at);
CREATE INDEX idx_lead_agent      ON lead(assigned_agent_id, status);
CREATE INDEX idx_lead_created    ON lead(organization_id, created_at DESC);
CREATE INDEX idx_lead_source     ON lead(lead_source_id);
CREATE INDEX idx_lead_follow_up  ON lead(follow_up_at) WHERE follow_up_at IS NOT NULL AND status NOT IN ('won','lost');

-- Customer lookup
CREATE INDEX idx_customer_email  ON customer_email(email) WHERE is_primary = true;
CREATE INDEX idx_customer_phone  ON customer_phone(number) WHERE is_primary = true;
CREATE INDEX idx_customer_org    ON customer(organization_id, deleted_at);
CREATE INDEX idx_customer_agent  ON customer(assigned_agent_id);

-- Quotation
CREATE INDEX idx_quotation_status   ON quotation(organization_id, status, deleted_at);
CREATE INDEX idx_quotation_customer ON quotation(customer_id, status);
CREATE INDEX idx_quotation_number   ON quotation(quotation_number);
CREATE INDEX idx_quotation_expires  ON quotation(expires_at) WHERE status = 'sent';

-- Product catalog
CREATE INDEX idx_product_type    ON product(product_type_id, is_active);
CREATE INDEX idx_product_org     ON product(organization_id, is_active, sort_order);
CREATE INDEX idx_variant_sku     ON product_variant(sku, organization_id);
CREATE INDEX idx_variant_product ON product_variant(product_id, is_active);

-- AI semantic search
CREATE INDEX idx_kb_embedding ON knowledge_chunk
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_kb_active    ON knowledge_chunk(knowledge_base_id, is_active);
CREATE INDEX idx_kb_tags      ON knowledge_chunk USING GIN(tags);

-- Chatbot
CREATE INDEX idx_chatbot_session_token    ON chatbot_session(session_token);
CREATE INDEX idx_chatbot_session_customer ON chatbot_session(customer_id, started_at DESC);

-- Notifications
CREATE INDEX idx_notification_profile ON notification(profile_id, is_read, created_at DESC);

-- Communication logs
CREATE INDEX idx_email_log_entity ON email_log(entity_type, entity_id);
CREATE INDEX idx_email_log_status ON email_log(status, sent_at);
```

---

## 15. Materialized Views

```sql
-- Agent lead funnel (refresh daily or on demand)
CREATE MATERIALIZED VIEW mv_agent_lead_summary AS
SELECT
  agent_id,
  organization_id,
  COUNT(*) FILTER (WHERE status = 'new')            AS new_count,
  COUNT(*) FILTER (WHERE status = 'contacted')      AS contacted_count,
  COUNT(*) FILTER (WHERE status = 'quotation_sent') AS quoted_count,
  COUNT(*) FILTER (WHERE status = 'won')            AS won_count,
  COUNT(*) FILTER (WHERE status = 'lost')           AS lost_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'won')::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 2
  ) AS win_rate_pct
FROM lead
WHERE deleted_at IS NULL
GROUP BY agent_id, organization_id;

CREATE UNIQUE INDEX ON mv_agent_lead_summary(organization_id, agent_id);

-- Product demand from quotations
CREATE MATERIALIZED VIEW mv_product_demand AS
SELECT
  pv.product_id,
  p.organization_id,
  COUNT(qi.quotation_item_id) AS quote_count,
  SUM(qi.quantity)            AS total_qty_quoted,
  AVG(qi.unit_price)          AS avg_unit_price
FROM quotation_item qi
JOIN product_variant pv USING (product_variant_id)
JOIN product p USING (product_id)
JOIN quotation q USING (quotation_id)
WHERE q.deleted_at IS NULL
GROUP BY pv.product_id, p.organization_id;

CREATE UNIQUE INDEX ON mv_product_demand(organization_id, product_id);
```

---

## 16. Naming Conventions

| Rule           | Correct                                  | Wrong                                    |
| -------------- | ---------------------------------------- | ---------------------------------------- |
| Table          | `customer`                               | `customers`, `tbl_customer`              |
| PK             | `customer_id`                            | `id`, `cust_id`, `customerId`            |
| FK             | `customer_id`                            | `customer`, `cid`                        |
| Boolean        | `is_active`, `is_verified`               | `active`, `enabled`, `verified`          |
| Timestamp      | `created_at`, `updated_at`, `deleted_at` | `createdAt`, `date_created`, `timestamp` |
| Status enum    | `status TEXT`                            | `status_id BIGINT` → lookup table        |
| Soft delete    | `deleted_at IS NOT NULL`                 | `is_deleted BOOLEAN`                     |
| JSONB field    | `meta`                                   | `data`, `extra`, `misc`, `info`          |
| Junction table | `customer_tag` (alphabetical)            | `tag_customer`, `customer_tags`          |
| Audit columns  | `created_by`, `updated_by`               | `creator_id`, `modified_by`              |
| Public tokens  | `TEXT` in app layer                      | BIGINT PKs in URLs                       |

---

## 17. Migration Strategy (Supabase → Any PostgreSQL)

```bash
# Export from Supabase (or any host)
pg_dump \
  --no-owner \
  --no-acl \
  --schema=public \
  --exclude-table=auth.* \
  "postgresql://user:pass@host/db" \
  > fourlinq_backup.sql

# Restore to any PostgreSQL instance
psql "postgresql://user:pass@newhost/db" < fourlinq_backup.sql

# Re-run RLS policies (they're in your migration files, not the dump)
psql "postgresql://user:pass@newhost/db" < migrations/rls_policies.sql
```

The only thing that changes between hosts is the connection string. Nothing else.

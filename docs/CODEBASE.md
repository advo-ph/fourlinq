# FourlinQ Codebase Reference

> Full-stack e-commerce site for FourlinQ, a premium uPVC windows & doors manufacturer in the Philippines.
> Last updated: 2026-05-24

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.3 + TypeScript 5.8 + Vite 5.4 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix primitives) |
| Animation | Framer Motion 12.34 |
| 3D | Three.js 0.184 + React Three Fiber 8.18 + Drei 9.122 |
| State | React Query (TanStack) 5.83 + lifted useState |
| Forms | React Hook Form 7.61 + Zod 3.25 |
| Routing | React Router v6.30 (lazy-loaded pages) |
| Backend | Express 5.2 (dev) / Vercel Functions (prod) |
| Database | PostgreSQL 15+ via Neon Serverless (`@neondatabase/serverless`) + `pg` pool |
| AI Chat | Google Gemini 2.5 Flash (`@google/generative-ai`) with pgvector RAG |
| Auth | JWT in httpOnly cookies (`jsonwebtoken`) |
| Deploy | Vercel (frontend + serverless) |

---

## Directory Structure

```
fourlinq-fork/
├── index.html                    # HTML entry (fonts, OG meta, #root)
├── package.json                  # 120 deps, scripts: dev/dev:api/dev:all/build
├── vite.config.ts                # port 8080, proxy /api→3001, @→./src
├── tailwind.config.ts            # Marvin design tokens, editorial scale
├── tsconfig.json                 # @/* alias, strict: false
├── vercel.json                   # rewrites, redirects, cache headers
├── postcss.config.js
├── eslint.config.js
├── vitest.config.ts
│
├── src/
│   ├── main.tsx                  # createRoot → <App />
│   ├── App.tsx                   # BrowserRouter + QueryClient + all routes
│   ├── index.css                 # CSS variables (--canvas, --accent, --ink-*)
│   ├── theme.config.ts           # Design tokens (colors, motion, layout)
│   │
│   ├── pages/                    # Route components (lazy-loaded)
│   │   ├── Index.tsx             # Home: VideoHero → Intro → Authority → Tiles → 3D → CTA
│   │   ├── Products.tsx          # Catalog: filter tabs + grid + ProductDrawer sidebar
│   │   ├── WindowSystems.tsx     # Category landing (delegates to SystemBucket)
│   │   ├── DoorSystems.tsx       # Category landing (delegates to SystemBucket)
│   │   ├── SpecialistSystems.tsx # Category landing (delegates to SystemBucket)
│   │   ├── DesignTool.tsx        # 4-step configurator: type → finish → glass → dims
│   │   ├── Finishes.tsx          # Interactive finish explorer with photo cross-fade
│   │   ├── WhatsNew.tsx          # Blog/news feed with category filters
│   │   ├── Inspiration.tsx       # Project gallery grid with category filters
│   │   ├── ProjectDetail.tsx     # Single project: /projects/:slug
│   │   ├── ForArchitects.tsx     # Spec sheets, CAD downloads, project support
│   │   ├── Brand.tsx             # Company story, certifications, showroom locator
│   │   ├── WhyUpvc.tsx           # Material education + comparison table
│   │   ├── HowToChoose.tsx       # 3-question decision quiz → system recommendation
│   │   ├── Care.tsx              # Maintenance guide
│   │   ├── Warranty.tsx          # 10-year warranty breakdown
│   │   ├── FAQ.tsx               # Searchable accordion, sidebar category rail
│   │   ├── Legal.tsx             # Privacy policy, terms
│   │   ├── Admin.tsx             # Dashboard: inquiries, chat logs, analytics
│   │   └── NotFound.tsx          # 404
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx            # Navbar + <main> + Footer + useAnalytics
│   │   │   ├── QuietNavbar.tsx       # Header navigation
│   │   │   └── EditorialFooter.tsx   # Footer with links, certifications
│   │   ├── home/
│   │   │   ├── VideoHero.tsx         # Background video + fallback carousel
│   │   │   ├── HeroCarousel.tsx      # Image slides
│   │   │   ├── EditorialIntro.tsx    # Brand intro text
│   │   │   ├── AuthorityStrip.tsx    # Trust indicators (certs, warranty)
│   │   │   ├── SystemsTiles.tsx      # Product type cards grid
│   │   │   ├── InspirationStrip.tsx  # Project gallery teaser
│   │   │   ├── WhatsNew.tsx          # News section (home variant)
│   │   │   └── BrandCTA.tsx          # Call-to-action banner
│   │   ├── shared/
│   │   │   ├── ContactForm.tsx       # Name/email/phone/subject/message → POST /api/contact
│   │   │   ├── ConsultationForm.tsx  # Extended contact for Brand page
│   │   │   ├── QuoteModal.tsx        # Slide-in sidebar form → POST /api/quote-request
│   │   │   ├── PageHeader.tsx        # Breadcrumb + eyebrow + H1 + subtitle
│   │   │   ├── ProjectPhotoSwitcher.tsx # Cursor-switching photo gallery
│   │   │   ├── FinishSwatch.tsx      # Wood-grain pill / solid circle swatch
│   │   │   ├── CookieBanner.tsx      # GDPR consent (localStorage)
│   │   │   ├── ScrollToTop.tsx       # Auto-scroll on route change
│   │   │   ├── CTABanner.tsx         # Generic CTA section
│   │   │   ├── UPVCAdvantageStrip.tsx# 7 benefits strip
│   │   │   └── Logo.tsx              # Brand mark
│   │   ├── primitives/
│   │   │   ├── Section.tsx           # tone (canvas/soft/dark) + size (sm-xl) wrapper
│   │   │   ├── Container.tsx         # Max-width container
│   │   │   ├── Button.tsx            # Primary/secondary/ghost button
│   │   │   ├── EyebrowHeading.tsx    # Small label above headings
│   │   │   ├── FeatureLink.tsx       # Styled link with icon
│   │   │   ├── CapizDivider.tsx      # Decorative divider
│   │   │   └── Spacer.tsx            # Vertical spacing
│   │   ├── 3d/
│   │   │   ├── Window3D.tsx          # Three.js interactive window (drag, click-open, finish swap)
│   │   │   └── window-system.ts      # 22-system registry: measured numbers, model path, grille pairs
│   │   ├── configurator/
│   │   │   └── WindowPreview.tsx     # Live preview in DesignTool
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx         # AI chatbot wrapper
│   │   │   ├── ChatBubble.tsx        # Message bubble
│   │   │   └── ChatMessage.tsx       # Message display
│   │   ├── icons/
│   │   │   └── WindowIcons.tsx       # SVG icons for all window/door types
│   │   └── ui/                       # 50+ shadcn/ui components (accordion, dialog, form, etc.)
│   │
│   ├── data/                         # Static data (verified from brochures)
│   │   ├── fourlinq-data.ts          # CANONICAL: BRAND, CONTACT, BRANCHES, ADVANTAGES,
│   │   │                             #   PRODUCT_TYPES, FRAME_FINISHES (11), MATERIALS,
│   │   │                             #   UPVC_PROFILE_FEATURES, DIMENSION_CONSTRAINTS
│   │   ├── products.ts               # 14 products with specs, finishes, glass options
│   │   ├── projects.ts               # 6 portfolio entries (minimal until client confirms)
│   │   ├── configurator.ts           # 10 product types, 11 finishes, 6 glass types, defaults
│   │   ├── benefits.ts               # 7 advantages + uPVC vs aluminum vs timber comparison
│   │   ├── brand.ts                  # Re-exports BRAND/CONTACT/BRANCHES + certifications
│   │   ├── faq.ts                    # 20 verified Q&As across 6 categories
│   │   ├── finish-scenes.ts          # Scene → finish photo mapping
│   │   └── whats-new.ts             # 3 news/blog entries
│   │
│   ├── hooks/
│   │   ├── useProducts.ts            # Returns static product data, filter by category
│   │   ├── useProjects.ts            # Returns static project data
│   │   ├── useConfigurator.ts        # Product types, finishes, glass types for DesignTool
│   │   ├── useAnalytics.ts           # Page views, scroll depth, clicks → POST /api/analytics
│   │   ├── use-toast.ts              # Toast notifications (Sonner)
│   │   └── use-mobile.tsx            # Mobile breakpoint detection
│   │
│   ├── lib/
│   │   ├── gemini-chat.ts            # Gemini streaming client (SSE)
│   │   └── utils.ts                  # cn() (clsx + twMerge)
│   │
│   └── test/
│       ├── setup.ts
│       └── example.test.ts
│
├── server/                           # Express backend (dev + reference)
│   ├── index.ts                      # Express 5 entry: CORS, helmet, cookie-parser, routes
│   ├── db.ts                         # pg Pool (DATABASE_URL, max: 10)
│   ├── routes/
│   │   ├── chat-lite.ts              # POST /api/chat/stream (Gemini SSE + knowledge base)
│   │   ├── admin-chat.ts             # POST /api/admin/chat/stream (protected, context-aware)
│   │   ├── inquiries.ts              # POST /api/contact, /api/quote-request, /api/save-configuration
│   │   │                             # GET /api/admin/inquiries, PATCH /api/admin/inquiries/:id
│   │   ├── analytics.ts              # POST /api/analytics, GET /api/admin/analytics/summary
│   │   ├── catalog.ts                # Product catalog endpoints
│   │   └── products.ts               # Product detail endpoints
│   └── migrations/
│       ├── 001_schema.sql            # Core tables (see Database Schema below)
│       ├── 002_seed.sql              # Org, categories, types, finishes, glass, products, projects, roles
│       ├── 003_chatbot.sql           # pgvector, knowledge_base, knowledge_chunk, chatbot_session/message/feedback
│       └── 004_knowledge_seed.sql    # RAG knowledge base seed data
│
├── api/                              # Vercel serverless functions (production)
│   ├── _db.ts                        # Neon serverless connection
│   └── [endpoint].ts                 # Mirrors server/routes/* for Vercel
│
├── public/                           # Static assets (~300 files)
│   ├── favicon.svg, favicon.ico, apple-touch-icon.png
│   ├── hero-bg.jpg, brand-story.jpg
│   ├── videos/hero-loop.mp4
│   ├── models/animated-window-systems.glb    # Licensed (makinwhat) — 6 systems still drawn from it
│   ├── models/system/*.glb                   # 20 per-system GLBs FourlinQ owns, baked from scripts/handoff/
│   ├── wp-export/                    # 200+ product/project photos from WordPress
│   ├── wp-export-originals/          # High-res originals
│   ├── generated/                    # AI-generated hero images + benefit illustrations
│   ├── icons/                        # Product type PNGs
│   ├── finishes/                     # Finish swatch images
│   └── textures/finishes/            # 3D texture maps
│
├── docs/                             # Architecture & design docs
│   ├── BACKEND_SCHEMA.md
│   ├── DESIGN_SYSTEM.md
│   ├── REDESIGN_ROADMAP.md
│   ├── UI_AUDIT_2026-05-24.md
│   ├── competitor-audit-*.md         # 8 competitor audits
│   └── ...
│
├── scripts/                          # Utility scripts (Gemini image gen, etc.)
└── refs/                             # Reference materials
```

---

## Routes

| Path | Page Component | Purpose |
|------|---------------|---------|
| `/` | Index | Home: video hero, intro, systems, 3D window, CTA |
| `/products` | Products | Full product catalog with filter/drawer |
| `/products/windows` | WindowSystems | Windows category landing |
| `/products/doors` | DoorSystems | Doors category landing |
| `/products/specialist` | SpecialistSystems | Specialist systems landing |
| `/design-tool` | DesignTool | 4-step window configurator |
| `/finishes` | Finishes | Interactive finish explorer |
| `/whats-new` | WhatsNew | News/blog feed |
| `/inspiration` | Inspiration | Project gallery |
| `/projects/:slug` | ProjectDetail | Individual project page |
| `/for-architects` | ForArchitects | Spec sheets, CAD, BIM |
| `/brand` | Brand | Company story, showrooms, consultation |
| `/why-upvc` | WhyUpvc | Material education + comparison |
| `/help-me-choose` | HowToChoose | 3-question quiz → recommendation |
| `/care` | Care | Maintenance guide |
| `/warranty` | Warranty | 10-year warranty breakdown |
| `/faq` | FAQ | Searchable Q&A accordion |
| `/legal` | Legal | Privacy, T&Cs, cookies |
| `/admin` | Admin | Dashboard (inquiries, chat logs, analytics) |
| `*` | NotFound | 404 |

---

## Database Schema (PostgreSQL 15+ / Neon)

### Auth & Identity

```
auth_user
  auth_user_id    BIGINT PK (identity)
  email           TEXT NOT NULL UNIQUE
  phone           TEXT UNIQUE
  password_hash   TEXT NOT NULL
  is_verified     BOOLEAN DEFAULT false
  is_active       BOOLEAN DEFAULT true
  last_login_at   TIMESTAMPTZ
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

organization
  organization_id BIGINT PK (identity)
  name            TEXT NOT NULL
  slug            TEXT NOT NULL UNIQUE
  logo_url        TEXT
  website         TEXT
  tax_id          TEXT
  currency        TEXT DEFAULT 'PHP'
  timezone        TEXT DEFAULT 'Asia/Manila'
  locale          TEXT DEFAULT 'en-PH'
  meta            JSONB DEFAULT '{}'
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ

role
  role_id         BIGINT PK (identity)
  organization_id BIGINT FK → organization
  name            TEXT NOT NULL
  label           TEXT
  is_system       BOOLEAN DEFAULT false
  meta            JSONB DEFAULT '{}'
  created_at      TIMESTAMPTZ
  UNIQUE(organization_id, name)

permission
  permission_id   BIGINT PK (identity)
  key             TEXT NOT NULL UNIQUE
  label           TEXT
  resource        TEXT NOT NULL
  action          TEXT NOT NULL

role_permission (junction)
  role_id         BIGINT FK → role (CASCADE)
  permission_id   BIGINT FK → permission (CASCADE)
  UNIQUE(role_id, permission_id)

profile
  profile_id      BIGINT PK (identity)
  auth_user_id    BIGINT FK → auth_user (CASCADE)
  organization_id BIGINT FK → organization
  role_id         BIGINT FK → role
  first_name      TEXT NOT NULL
  last_name       TEXT NOT NULL
  display_name    TEXT
  avatar_url      TEXT
  phone           TEXT
  is_active       BOOLEAN DEFAULT true
  last_seen_at    TIMESTAMPTZ
  meta            JSONB DEFAULT '{}'
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
  deleted_at      TIMESTAMPTZ (soft delete)
  UNIQUE(auth_user_id, organization_id)
```

### Organization & Venue

```
branch
  branch_id       BIGINT PK (identity)
  organization_id BIGINT FK → organization
  name            TEXT NOT NULL
  code            TEXT
  address_line_1  TEXT
  address_line_2  TEXT
  city            TEXT
  province        TEXT
  region          TEXT
  postal_code     TEXT
  country         TEXT DEFAULT 'PH'
  lat             NUMERIC(10,7)
  lng             NUMERIC(10,7)
  phone           TEXT
  email           TEXT
  is_showroom     BOOLEAN DEFAULT true
  is_active       BOOLEAN DEFAULT true
  operating_hour  JSONB
  meta            JSONB DEFAULT '{}'
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
  deleted_at      TIMESTAMPTZ (soft delete)

agent
  agent_id        BIGINT PK (identity)
  organization_id BIGINT FK → organization
  profile_id      BIGINT FK → profile
  branch_id       BIGINT FK → branch
  agent_type      TEXT NOT NULL
  employee_number TEXT
  commission_rate NUMERIC(5,4) DEFAULT 0
  is_active       BOOLEAN DEFAULT true
  meta            JSONB DEFAULT '{}'
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
  deleted_at      TIMESTAMPTZ (soft delete)
  UNIQUE(organization_id, profile_id)
```

### Product Catalog

```
material_type
  material_type_id  BIGINT PK (identity)
  organization_id   BIGINT FK → organization
  name              TEXT NOT NULL
  slug              TEXT NOT NULL
  description       TEXT
  is_active         BOOLEAN DEFAULT true
  sort_order        INT DEFAULT 0
  meta              JSONB DEFAULT '{}'
  UNIQUE(organization_id, slug)

profile_system
  profile_system_id BIGINT PK (identity)
  organization_id   BIGINT FK → organization
  material_type_id  BIGINT FK → material_type
  name              TEXT NOT NULL
  manufacturer      TEXT
  origin_country    TEXT
  chamber_count     INT
  wall_thickness_mm NUMERIC(5,2)
  u_value           NUMERIC(5,3)
  wind_resistance   TEXT
  certification     TEXT[]
  datasheet_url     TEXT
  is_active         BOOLEAN DEFAULT true
  meta              JSONB DEFAULT '{}'

product_category
  product_category_id BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  name                TEXT NOT NULL
  slug                TEXT NOT NULL
  icon_svg            TEXT
  sort_order          INT DEFAULT 0
  is_active           BOOLEAN DEFAULT true
  UNIQUE(organization_id, slug)

product_type
  product_type_id     BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  product_category_id BIGINT FK → product_category
  name                TEXT NOT NULL
  slug                TEXT NOT NULL
  description         TEXT
  icon_key            TEXT
  icon_svg            TEXT
  opening_mechanism   TEXT
  is_operable         BOOLEAN DEFAULT true
  requires_track      BOOLEAN DEFAULT false
  panel_count_min     INT DEFAULT 1
  panel_count_max     INT DEFAULT 1
  sort_order          INT DEFAULT 0
  is_active           BOOLEAN DEFAULT true
  meta                JSONB DEFAULT '{}'
  UNIQUE(organization_id, slug)

product
  product_id          BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  product_type_id     BIGINT FK → product_type
  profile_system_id   BIGINT FK → profile_system (nullable)
  sku_prefix          TEXT
  name                TEXT NOT NULL
  slug                TEXT NOT NULL
  tagline             TEXT
  short_description   TEXT
  description         TEXT
  technical_summary   TEXT
  thumbnail_url       TEXT
  gallery_url         TEXT[]
  min_width_mm        INT
  max_width_mm        INT
  min_height_mm       INT
  max_height_mm       INT
  size_step_mm        INT DEFAULT 50
  is_custom_size      BOOLEAN DEFAULT true
  lead_time_day       INT
  warranty_year       INT DEFAULT 10
  is_featured         BOOLEAN DEFAULT false
  is_active           BOOLEAN DEFAULT true
  sort_order          INT DEFAULT 0
  meta                JSONB DEFAULT '{}'
  created_at          TIMESTAMPTZ
  updated_at          TIMESTAMPTZ
  deleted_at          TIMESTAMPTZ (soft delete)
  created_by          BIGINT FK → profile
  UNIQUE(organization_id, slug)

finish
  finish_id           BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  name                TEXT NOT NULL
  slug                TEXT NOT NULL
  code                TEXT
  finish_type         TEXT (solid/wood-grain/metallic)
  hex_color           TEXT
  texture_url         TEXT
  is_standard         BOOLEAN DEFAULT true
  surcharge_pct       NUMERIC(5,4) DEFAULT 0
  is_active           BOOLEAN DEFAULT true
  sort_order          INT DEFAULT 0
  meta                JSONB DEFAULT '{}'
  UNIQUE(organization_id, slug)

glass_type
  glass_type_id       BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  name                TEXT NOT NULL
  slug                TEXT NOT NULL
  glass_category      TEXT (single/double/laminated)
  thickness_mm        TEXT
  u_value             NUMERIC(5,3)
  shgc                NUMERIC(4,3)
  vlt                 NUMERIC(4,3)
  acoustic_db         INT
  is_safety_glass     BOOLEAN DEFAULT false
  is_active           BOOLEAN DEFAULT true
  sort_order          INT DEFAULT 0
  meta                JSONB DEFAULT '{}'
  UNIQUE(organization_id, slug)

hardware_option
  hardware_option_id  BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  name                TEXT NOT NULL
  hardware_type       TEXT
  manufacturer        TEXT
  finish              TEXT
  is_standard         BOOLEAN DEFAULT true
  unit_price          NUMERIC(12,2)
  meta                JSONB DEFAULT '{}'
  is_active           BOOLEAN DEFAULT true

product_variant
  product_variant_id  BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  product_id          BIGINT FK → product
  finish_id           BIGINT FK → finish
  glass_type_id       BIGINT FK → glass_type
  sku                 TEXT NOT NULL
  name                TEXT
  width_mm            INT DEFAULT 0
  height_mm           INT DEFAULT 0
  panel_count         INT DEFAULT 1
  base_price          NUMERIC(12,2)
  is_custom           BOOLEAN DEFAULT false
  is_active           BOOLEAN DEFAULT true
  meta                JSONB DEFAULT '{}'
  UNIQUE(organization_id, sku)

product_feature
  product_feature_id  BIGINT PK (identity)
  product_id          BIGINT FK → product (CASCADE)
  feature_type        TEXT (thermal/weather/aesthetic/security)
  label               TEXT NOT NULL
  value               TEXT NOT NULL
  unit                TEXT
  sort_order          INT DEFAULT 0

product_certification
  product_certification_id BIGINT PK (identity)
  product_id               BIGINT FK → product (CASCADE)
  certification_name       TEXT NOT NULL
  issuing_body             TEXT
  certificate_number       TEXT
  issued_at                DATE
  expires_at               DATE
  document_url             TEXT

product_hardware (junction)
  product_id          BIGINT FK → product (CASCADE)
  hardware_option_id  BIGINT FK → hardware_option
  is_included         BOOLEAN DEFAULT true
  is_required         BOOLEAN DEFAULT false
  sort_order          INT DEFAULT 0

product_finish (junction)
  product_id          BIGINT FK → product (CASCADE)
  finish_id           BIGINT FK → finish (CASCADE)
  UNIQUE(product_id, finish_id)

product_glass (junction)
  product_id          BIGINT FK → product (CASCADE)
  glass_type_id       BIGINT FK → glass_type (CASCADE)
  UNIQUE(product_id, glass_type_id)
```

### Projects (Portfolio)

```
project
  project_id          BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  project_number      TEXT NOT NULL UNIQUE
  name                TEXT NOT NULL
  location            TEXT
  image_url           TEXT
  gallery_url         TEXT[]
  is_featured         BOOLEAN DEFAULT true
  sort_order          INT DEFAULT 0
  meta                JSONB DEFAULT '{}'
  created_at          TIMESTAMPTZ
  updated_at          TIMESTAMPTZ
  deleted_at          TIMESTAMPTZ (soft delete)
```

### Chatbot & Knowledge Base (requires pgvector)

```
knowledge_base
  knowledge_base_id   BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  name                TEXT NOT NULL
  description         TEXT
  kb_type             TEXT (faq/product/policy/educational/objection)
  is_active           BOOLEAN DEFAULT true
  version             SMALLINT DEFAULT 1
  meta                JSONB DEFAULT '{}'

knowledge_chunk
  knowledge_chunk_id  BIGINT PK (identity)
  knowledge_base_id   BIGINT FK → knowledge_base (CASCADE)
  title               TEXT NOT NULL
  content             TEXT NOT NULL
  content_type        TEXT (fact/faq/objection_response/product_spec/comparison/process)
  tags                TEXT[]
  embedding           vector(768)  -- Gemini gemini-embedding-001
  product_id          BIGINT FK → product (nullable)
  is_active           BOOLEAN DEFAULT true
  version             SMALLINT DEFAULT 1
  source_url          TEXT

chatbot_session
  chatbot_session_id  BIGINT PK (identity)
  organization_id     BIGINT FK → organization
  session_token       TEXT NOT NULL UNIQUE
  channel             TEXT DEFAULT 'website'
  visitor_id          TEXT
  ip_address          INET
  user_agent          TEXT
  started_at          TIMESTAMPTZ
  ended_at            TIMESTAMPTZ
  message_count       SMALLINT DEFAULT 0
  model_used          TEXT DEFAULT 'gemini-2.0-flash'
  tokens_used         INT DEFAULT 0
  lead_captured       BOOLEAN DEFAULT false
  meta                JSONB DEFAULT '{}'

chatbot_message
  chatbot_message_id    BIGINT PK (identity)
  chatbot_session_id    BIGINT FK → chatbot_session (CASCADE)
  role                  TEXT NOT NULL (user/assistant/system)
  content               TEXT NOT NULL
  intent                TEXT
  knowledge_chunks_used BIGINT[]
  confidence            NUMERIC(4,3)
  created_at            TIMESTAMPTZ

chatbot_feedback
  chatbot_feedback_id   BIGINT PK (identity)
  chatbot_session_id    BIGINT FK → chatbot_session (CASCADE)
  chatbot_message_id    BIGINT FK → chatbot_message (nullable)
  rating                SMALLINT CHECK (1–5)
  feedback_type         TEXT (thumbs_up/thumbs_down)
  comment               TEXT
  created_at            TIMESTAMPTZ
```

### Indexes

```sql
-- Product lookups
idx_product_type      ON product(product_type_id, is_active)
idx_product_org       ON product(organization_id, is_active, sort_order)
idx_product_slug      ON product(slug)
idx_product_featured  ON product(is_featured) WHERE is_featured = true
idx_variant_sku       ON product_variant(sku, organization_id)
idx_variant_product   ON product_variant(product_id, is_active)
idx_project_org       ON project(organization_id, is_featured, sort_order)

-- Knowledge base / RAG
idx_kb_embedding      ON knowledge_chunk USING ivfflat(embedding vector_cosine_ops) WITH (lists=10)
idx_kb_active         ON knowledge_chunk(knowledge_base_id, is_active)
idx_kb_tags           ON knowledge_chunk USING GIN(tags)

-- Chat
idx_chatbot_session_token   ON chatbot_session(session_token)
idx_chatbot_message_session ON chatbot_message(chatbot_session_id, created_at)
```

### Entity Relationship Summary

```
Organization (1)
├── Branch (n)
├── Role (n) ←→ Permission (m:n via role_permission)
├── Profile (n) → auth_user, role
│   └── Agent (1) → branch
├── MaterialType (n)
│   └── ProfileSystem (n)
├── ProductCategory (n)
│   └── ProductType (n)
│       └── Product (n) → profile_system
│           ├── ProductVariant (n) → finish, glass_type
│           ├── ProductFeature (n)
│           ├── ProductCertification (n)
│           ├── Finish (m:n via product_finish)
│           ├── GlassType (m:n via product_glass)
│           └── HardwareOption (m:n via product_hardware)
├── Finish (n)
├── GlassType (n)
├── HardwareOption (n)
├── Project (n)
├── KnowledgeBase (n)
│   └── KnowledgeChunk (n) → product (optional)
└── ChatbotSession (n)
    ├── ChatbotMessage (n)
    └── ChatbotFeedback (n)
```

---

## API Endpoints

### Public

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/chat/stream` | Gemini SSE chat (`{ message, history[], sessionId? }`) |
| POST | `/api/contact` | Contact form (`{ name, email, phone?, subject?, message }`) |
| POST | `/api/quote-request` | Quote request with product context |
| POST | `/api/save-configuration` | Save design tool config (JSON blob) |
| POST | `/api/analytics` | Event tracking (`{ sessionId, event, page, target?, data? }`) |
| GET | `/api/health` | Health check |

### Admin Auth

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/login` | Login (password → JWT cookie `__flq_admin`, 8h) |
| POST | `/api/admin/logout` | Logout (clear cookie) |
| GET | `/api/admin/check` | Check auth status |

### Admin Protected (requireAdmin middleware)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/inquiries` | List inquiries (filter: type, status, limit, offset) |
| PATCH | `/api/admin/inquiries/:id` | Update status/notes |
| GET | `/api/admin/chat-logs` | List chat sessions + metrics |
| GET | `/api/admin/chat-logs/:sessionId` | Single conversation |
| POST | `/api/admin/chat/stream` | Admin chat endpoint |
| GET | `/api/admin/analytics/summary` | Analytics dashboard data |

---

## Environment Variables

```bash
DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>   # Neon Postgres
GEMINI_API_KEY=<key>                                   # Google Gemini API
NODE_ENV=production|development
API_PORT=3001                                          # Express port (default)
ADMIN_JWT_SECRET=<secret>                              # Auto-generated per process if unset
                                                       # (so restarts log admins out — set in prod)
VITE_API_URL=                                          # Frontend API base; empty = same-origin

# Inquiry notification email. Unset = mailer no-ops, inquiries still save to DB.
SMTP_HOST= / SMTP_PORT= / SMTP_USER= / SMTP_PASS= / SMTP_SECURE=
MAIL_TO=sales@fourlinq.com                             # default
MAIL_FROM= / MAIL_BCC=

# Bootstrap script only (server/scripts/create-admin.ts), NOT read at runtime.
# create-admin exits with an error if ADMIN_PASSWORD is unset — there is no default.
ADMIN_EMAIL=<email>
ADMIN_PASSWORD=<password>
```

---

## Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--canvas` | `#FFFFFF` | Page background |
| `--canvas-soft` | `#F8F8F8` | Alternate section bg |
| `--canvas-dark` | `#242424` | Dark sections |
| `--accent` | `#C8102E` | FourlinQ red (CTAs, links) |
| `--ink-primary` | `#242424` | Body text |
| `--ink-secondary` | `#444444` | Subheadings |
| `--ink-muted` | `#686868` | Captions, metadata |
| `--rule-soft` | `#DFDFDF` | Dividers |

### Typography

| Scale | Size | Font | Weight |
|-------|------|------|--------|
| Display | 88px / 5.5rem | Fraunces | 400 |
| H1 | 64px / 4rem | Fraunces | 400 |
| H2 | 48px / 3rem | Fraunces | 400 |
| H3 | 36px / 2.25rem | Fraunces | 400 |
| H4 | 28px / 1.75rem | Fraunces | 400 |
| H5 | 22px / 1.375rem | Fraunces | 400 |
| Body | 16px / 1rem | Inter | 400 |
| Eyebrow | 12-14px | Inter | 500, 0.10-0.15em tracking |

### Motion

- Easing: `cubic-bezier(.68, 0, .33, 1)` (Marvin curve)
- Durations: quick (200ms), base (300ms), slow (500ms), cinematic (1200ms)
- Library: Framer Motion (AnimatePresence, layout animations, slide-ins, cross-fades)

### Layout

- Container max: 1400px
- Reading max: 840px (`.container-editorial`)
- Section padding: 48px (mobile) / 72px (tablet) / 120px (desktop)
- Breakpoints: sm 576 / md 768 / lg 992 / xl 1200 / 2xl 1400

---

## Seed Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Organization | 1 | FourlinQ Windows & Doors |
| Product Categories | 3 | Window, Door, System |
| Product Types | 10 | 5 windows + 5 doors |
| Products | 8 | Seeded from frontend data |
| Finishes (DB) | 6 | Matte Black, Dark Grey, Bronze, Sand, White, Anthracite |
| Finishes (Frontend) | 11 | 7 wood-grain + 4 solid (canonical source: `fourlinq-data.ts`) |
| Glass Types | 10 | Clear, Low-E, Frosted, Tinted (2), Laminated, Decorative, Reflective, Obscure, Sidelight |
| Projects | 6 | Minimal entries (pending client confirmation) |
| Roles | 6 | super_admin, admin, agent, customer, partner, viewer |
| FAQ | 20 | Across 6 categories |
| Branches | 4 | Main office, Ortigas, Alabang, Cebu |

---

## Key Patterns

- **Data source**: Frontend uses static TS files (`src/data/*`), not DB queries. DB is for backend operations (inquiries, chat, analytics).
- **Forms**: Controlled inputs + fetch POST to Express/Vercel endpoints. Success/error states with icon feedback.
- **Animation**: All motion uses Framer Motion with the brand easing curve. No GSAP.
- **Images**: First image eager, rest lazy + `decoding="async"`. Photos from `/public/wp-export/`.
- **Responsive**: Mobile-first Tailwind with `md:` and `lg:` breakpoints.
- **Accessibility**: Skip-to-content link, ARIA labels, semantic HTML, keyboard Escape for modals.
- **Analytics**: `useAnalytics()` auto-tracks page views, scroll depth, and click targets via `data-track` attributes.

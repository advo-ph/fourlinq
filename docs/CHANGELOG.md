# Changelog

All notable changes to the FourlinQ website are recorded in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Because this is a website (not a versioned package), entries are dated rather than versioned. The `[Unreleased]` section at the top accumulates work that has been merged but not yet deployed to production.

For the planned work behind these changes, see [ROADMAP.md](./ROADMAP.md).

---

## How to use this file

When you ship a change, add an entry under `[Unreleased]` in the appropriate category:

- **Added** — new features, pages, components, endpoints
- **Changed** — modifications to existing behavior, copy, or design
- **Deprecated** — features still present but slated for removal
- **Removed** — features deleted from the codebase
- **Fixed** — bug fixes
- **Security** — fixes for vulnerabilities or hardening changes

When the site is deployed to production, rename `[Unreleased]` to a dated heading (e.g. `## [2026-05-12]`) and start a fresh `[Unreleased]` block at the top.

Keep entries concise — one line per change, written in past tense, focused on the user-visible or developer-visible impact rather than implementation details. Link to files or PRs where helpful.

---

## [Unreleased]

### Session: 2026-08-08 — closing the open gaps: honest a11y gate, reachable door automation

#### Added

- **Interactive 3D window viewer, on a page for the first time** — mounted in the Design Tool behind a Drawing/3D toggle, offered only for the five configurator types the licensed model honestly depicts (casement, awning, sliding, fixed, bifold). Lazy-loaded, so three/fiber/drei stay out of the page's chunk: DesignTool 47 kB, Window3D 1.08 MB. [src/pages/DesignTool.tsx](../src/pages/DesignTool.tsx), [src/components/3d/Window3D.tsx](../src/components/3d/Window3D.tsx).
- **Nine animated systems wired instead of four** — added casement 2-lite, sliding 4-panel, **louvre** (narrow and wide blade) and **fixed**, all already inside the licensed GLB. Louvre replaces a schematic placeholder on a shipped product, and `fixed` supplies the art for the picture/direct-glaze gap. [src/components/3d/window-system.ts](../src/components/3d/window-system.ts) (new).
- **`npm run probe:glb`** — dependency-free GLB prober that measures each system's rest-pose bounding box, fit scale and open-pose clip time, so the viewer's pinned numbers are derived rather than hand-tuned. [scripts/probe-window-glb.mjs](../scripts/probe-window-glb.mjs) (new).
- **[docs/3D_ASSET_BRIEF.md](./3D_ASSET_BRIEF.md)** — the contract a new asset must meet to drop into the viewer unchanged (node naming, material names, one 4 s `Scene` clip), plus per-system modelling briefs and matched image-prompt fallbacks for the six systems the licensed model does *not* cover.
- **`automated-door` / Automated Door Access** under **doors** — digital access (keypad, card, fob, app) and motorised door-leaf operation. Reachable from `/products?filter=doors`. [src/data/products.ts](../src/data/products.ts), [server/migrations/020_automated_door_split.sql](../server/migrations/020_automated_door_split.sql) (new), schematic placeholder in [public/images/products/schematic/](../public/images/products/schematic/).
- **Detector self-check in the a11y gate** — each run injects an unnamed link, an unnamed icon button, and a correctly-named image link, and fails if the detector gets any of the three wrong. Verified by mutation: blinding the name computation exits 1 rather than passing silently. [scripts/rm17-a11y-scan.mjs](../scripts/rm17-a11y-scan.mjs).

#### Fixed

- **The 3D viewer rendered an invisible speck, and was mounted nowhere** — its per-system `center` values were the source FBX's centimetre node translations (casement `[-225, 552, -12]`) while the component applies them against loaded-scene coordinates, which already carry the root scale `0.0035960085` = 1/278.09. Centering was off by 278×, and `scale: 0.0014` drew the model at ~0.1% of frame height. The code comment claimed the values were tuned to fill ~80% of the canvas; they were not, and no test or page referenced the component. Re-measured every system in the correct space and verified in a browser.
- **The viewer used one global open-time for every system** — `OPEN_TIME = 2.0`, but the louvre fins peak at 0.93 s and a revolving door at 4.0 s, so a shared constant showed the louvre swinging back toward shut. `openTime` is now per system.
- **Subtree visibility matched on name prefixes** — `"fixed"` also matches `fixed_lattice`, and `"Jalousie_narrow_fin1"` matches `fin10`–`fin18`, so selecting one system could reveal another's meshes. Now matches exact top-level node names.
- **The finish picker did nothing on louvre and pivot** — only materials `frame1`/`frame2` were recoloured, but those systems also carry `frame3`.
- **The viewer's status badge was white text on a near-white gradient** — `bg-[color:var(--ink-primary)]/90` cannot take an opacity modifier on an arbitrary colour value, so Tailwind dropped the declaration and the background computed to `rgba(0,0,0,0)`. Replaced with an inline `color-mix`. **The same broken pattern remains on three modal scrims** (`QuoteModal`, `Products`, `SystemBucket`) — see Notes.
- **`qa:a11y` reported 124 false failures** — every "unnamed control" on home was an image-only link whose `<img>` had a real alt. `accessibleName` used `textContent`, which skips replaced elements; it now follows the accname spec (img/area alt, input value, svg title, aria-hidden subtrees excluded). Controls hidden from the accessibility tree are skipped at collection, not reported as unnamed. **124 → 0**, and `qa:a11y` passes for the first time.
- **Door automation was unreachable from the doors filter** — migration 019 answered two distinct client asks ("automate your door / digital access", `00:20:47`; "window opening devices", `00:21:11`) with one windows-category product, marking both ✅ while the door half was filed under windows. Split into two products; `automated-window` copy narrowed so it no longer claims door scope. [docs/MEETING_INSTRUCTION_INVENTORY.md](./MEETING_INSTRUCTION_INVENTORY.md).

#### Notes

- **`hung`, `pivot` and `revolving` are measured and renderable but withheld from the viewer's tab rail** — the licensed model contains all three (and `sliding_vertical` is a genuine double-hung, one of the Marvin gaps), but FourlinQ has no such product yet and a viewer tab advertises one. Promoting any of them is a one-line edit to `CATALOGUE_SYSTEM` once the client confirms. Asserted by test so it cannot happen by accident.
- **Three modal scrims still carry the dropped-background bug** — `bg-[color:var(--ink-primary)]/30` in [QuoteModal.tsx](../src/components/shared/QuoteModal.tsx), [Products.tsx](../src/pages/Products.tsx) and [SystemBucket.tsx](../src/pages/SystemBucket.tsx) compiles to an invalid colour, so those modals likely open with no dimming backdrop. Found while fixing the viewer badge; **not yet verified in a browser and not fixed** — out of scope for this change, but it is the same one-line `color-mix` fix.
- Migration 020 is hand-applied on the VPS like 019 — explicit no-down, no `DELETE`/`DROP`, asserted by test. **Until it is applied, `automated-door` will not appear on the live site** (`USE_API=true` means `/api/products` reads Postgres and the static catalog is fallback-only).

### Session: 2026-08-07 — catalog lane: four Aug-7 products (glass-railing, sc-door, louvre, automated-window)

Client feedback products that had no `/products` home. Glass stays a product line under specialist (not a fourth type card). Static catalog + hand-run migration 019 seed both halves so `USE_API=true` can serve them after apply.

#### Added

- **Four catalog products** — `glass-railing` (specialist), `sc-door` / SC-Door System Sliding Casement Door (doors), `louvre` / Louvre Windows (windows), `automated-window` / Automated Windows (windows). Full product shape: description, shortDescription, specs, finishes, glassOptions. [src/data/products.ts](../src/data/products.ts).
- **Migration 019** — idempotent `product_type` + `product` seeds with finish/glass/spec labels; explicit no-down header. [server/migrations/019_aug07_product_additions.sql](../server/migrations/019_aug07_product_additions.sql) (new).
- **Schematic hero placeholders** + client shot list — [public/images/products/schematic/](../public/images/products/schematic/), [docs/AUG07_ASSET_REQUEST.md](./AUG07_ASSET_REQUEST.md) (new).
- **Integrity + taxonomy + migration-parity tests** for the four fixed ids. [src/test/data-integrity.test.ts](../src/test/data-integrity.test.ts), [src/test/taxonomy.test.ts](../src/test/taxonomy.test.ts).
### Session: 2026-08-07 — design-tool lane: door colour, outward open, F-S-S-S-S-F

#### Added

- **Live door recolour on `/finishes`** — SVG casement-door preview driven by `WindowPreview`; every finish swatch paints the frame and solid lower panel (no photo-asset pipeline). [src/pages/Finishes.tsx](../src/pages/Finishes.tsx), [src/data/finish-scenes.ts](../src/data/finish-scenes.ts).
- **Fixed · 4-panel slide · Fixed layout** — named preset `fixed-slide-slide-slide-slide-fixed` on the sliding-door family; generic sequence drawing with even panel widths. [src/data/configurator.ts](../src/data/configurator.ts), [src/components/configurator/WindowPreview.tsx](../src/components/configurator/WindowPreview.tsx), [src/pages/DesignTool.tsx](../src/pages/DesignTool.tsx).

#### Fixed

- **Casement door solid lower panel** now fills with the active `frameColor` (not outline-only).
- **Outward-only opening cues on every swing type** — awning, casement, casement door (`entrance`), and french-door. The previous guard test asserted no preview renders `data-opening="inward"`; nothing in the codebase emits that attribute, so it could not fail. Replaced with an explicit swing-type list asserted positively. [src/test/configurator.test.tsx](../src/test/configurator.test.tsx).

#### Open question

- **Tilt & Turn contradicts "never inward"** — [src/data/glossary.ts](../src/data/glossary.ts) describes it tilting and swinging *inward* while flagged `is_fourlinq_offering: true`. That is what the product physically is, so it is not a copy fix. Ask the client whether FourlinQ sells tilt & turn at all. The "never inward" row in [MEETING_INSTRUCTION_INVENTORY.md](./MEETING_INSTRUCTION_INVENTORY.md) is ⚠️ partial, not ✅.
### Session: 2026-08-07 — Project area axis on /inspiration + slim-door audit

#### Added

- **Geographic area axis on `/inspiration`** — second filter rail (Metro Manila, Cebu, …) and section groups driven by structured `ProjectArea`; empty regions stay hidden; projects without a confirmed `region_code` land in **Area to be confirmed**. Card and detail labels use one derivation helper (`Amara — Cebu` em dash). [src/data/project-area.ts](../src/data/project-area.ts), [src/pages/Inspiration.tsx](../src/pages/Inspiration.tsx), [src/test/project-area.test.ts](../src/test/project-area.test.ts).
- **Client area request doc** — one row per project with blank village/city/province/region columns, Anvaya Cove Batangas-vs-Bataan question open, slim-door shot list. [docs/AUG07_PROJECT_AREA_REQUEST.md](./AUG07_PROJECT_AREA_REQUEST.md).

#### Changed

- **Defendable `area` on catalog projects only** — 38 projects get structured parts from verified Facebook location/caption (plus showroom-verified Mandaue→Cebu); 23 Philippines-only rows stay unknown. No invented places. [src/data/projects.ts](../src/data/projects.ts).

#### Notes

- Slim-door product photography still missing after full image search; `/aluminium` keeps the single existing slim-frame hero. See CLIENT_PHOTO_INVENTORY slim-door audit.
- **The area axis shipped is geographic, not the one she asked for.** Her words name a room/occupancy axis — *"Kaya, MBR, Living"* / *"pwede residential, commercial"* (`00:23:14`). Benchmark **D-B1** keeps its original pass condition and stays expected-red; the geographic axis is recorded as a separate **D-B4**. Do not present the region filter to the client as the area feature she requested. [docs/ROADMAP.md](./ROADMAP.md).

### Session: 2026-07-21 — Prince's UI punch list: Marvin-grade header, embedded design tool, page de-texting

Twenty-item UI pass from Prince's review, targeting the "big change Imie will look for". The header is the flagship: image-rich mega-panels with the frame-open hover animation, plus site search copied from marvin.com's real pattern.

#### Added

- **Header mega-panels with imagery** — Systems shows the three type tiles playing their 53-frame opening animation on hover/unhover (`NavFrameTile`) plus a By-material column with photos; Our Projects shows four photo cards (Windows/Doors/Interior/Exterior); What's New shows three (Products/Projects/Events). Panels are state-driven with a 160ms close-grace timer and full-bar hover zones, fixing the "unhover instantly hides the popup" bug. [src/components/layout/QuietNavbar.tsx](../src/components/layout/QuietNavbar.tsx), [src/components/layout/NavFrameTile.tsx](../src/components/layout/NavFrameTile.tsx) (new).
- **Site search** (`NavSearch`) — magnifier in the header opens a full-width flyout patterned on marvin.com's Algolia search (researched from their live implementation): autofocus input, search-as-you-type, "Suggested" page/document links + "Suggested products" and "Projects" image cards with see-all links, popular-search chips, no-results tips, Esc/outside-click close. Client-side over the site's own static data. [src/components/layout/NavSearch.tsx](../src/components/layout/NavSearch.tsx) (new).
- **Design tool embedded on the homepage** — the real configurator (left picker, right live preview) renders in place of the old teaser card via a new `embedded` prop, with an "Open Design Tool" button beside Continue. [src/pages/Index.tsx](../src/pages/Index.tsx), [src/pages/DesignTool.tsx](../src/pages/DesignTool.tsx).
- **Multi-category project tags** — `InspirationTag` (windows/doors/interior/exterior, multi-valued per project, derived from the FB captions) replaces the sparse single-category filters that left Sliding/Specialist empty. Filters live in the URL so the nav deep-links them. [src/data/projects.ts](../src/data/projects.ts), [src/pages/Inspiration.tsx](../src/pages/Inspiration.tsx).
- **Catalog PDF imagery** — cover photo, per-type product renders (the approved /products images), real profile cut-section photos, and the seven wood-grain textures, sharp-compressed to keep the file at 1.2 MB. [scripts/generate-system-catalog.ts](../scripts/generate-system-catalog.ts).

#### Changed

- **Book a Consultation** is now a red button (arrow removed).
- **Homepage browse** — By type + By material merged into one five-item "Browse products" section; explainer paragraphs cut.
- **Heading de-texting** — subtitle/lede paragraphs removed from What's New, Our Projects, Systems, Design Tool; statement sections removed from Brand and For Architects; "we don't extrude" line removed from Why uPVC.
- **Why uPVC** — hero profile image contained and sized down; the 500vh pinned texture scroll replaced with a 12-finish grid (real textures for wood grains).
- **For Architects hero** — new photo + headline ("Drawings, samples, and a spec team.").
- **Hero scrim strengthened globally** (black/45→black/75 gradient) — fixes unreadable text on the Brand and For Architects heroes and FullBleed captions.
- **/inspiration cards** now 4:3 to match the source photos (was 4:5 portrait).
- **/products landing cards** — description block fixed to three lines so item lists start at the same height; What's New page filters moved to the URL (`?filter=`).

### Session: 2026-07-20 — /for-architects technical library goes CMS-backed with real downloads

The technical library on /for-architects was a hardcoded list where nearly every row said "Available on request". It now renders from a new `cms_document` table, ships with an actual downloadable System Catalog PDF, and every slot is uploadable from the admin — no code change needed when the real DWGs/manuals arrive.

#### Added

- **`cms_document` table + `document` CMS kind** — migration 013 creates the table (`slug`, `title`, `doc_type` badge, `description`, `file_path`, `link_url`, `note`, `display_order`, `is_published`) and seeds the eight previously hardcoded library rows. Status is derived on the page, not stored: `file_path` → Download, `link_url` → Available now, else `note` ?? "Available on request". Editable via `/admin → Content → Documents`. [server/migrations/013_cms_document.sql](../server/migrations/013_cms_document.sql) (new), [server/cms-config.ts](../server/cms-config.ts). Note: migration already applied to the shared DB on 2026-07-20.
- **Generated System Catalog PDF** — `scripts/generate-system-catalog.ts` renders a 7-page on-brand catalog (Fraunces/red editorial) via Playwright, strictly from the brochure-verified `fourlinq-data.ts` (advantages, profile cut-section features, product types, materials, profile systems, all 12 finishes + aluminium powder-coats, warranty, branches; `DIMENSION_CONSTRAINTS` deliberately excluded as unverified). Output lands in `public/docs/` so it deploys with dist. [scripts/generate-system-catalog.ts](../scripts/generate-system-catalog.ts) (new), [public/docs/fourlinq-system-catalog.pdf](../public/docs/fourlinq-system-catalog.pdf) (new).
- **Document upload pipeline** — new `file` field type in the cms-rag package with a `FilePicker` (drop-zone, extension-validated: PDF, DWG, RFA, ZIP, DOC, 50 MB cap) posting to a second upload mount `/api/admin/cms/docs` → `uploads/docs/`. The upload router factory gained `allowedExtension` (extension check instead of mime — browsers report DWG/RFA as octet-stream). Media grid filters document extensions out of its thumbnail view. [packages/cms-rag/client/FilePicker.tsx](../packages/cms-rag/client/FilePicker.tsx) (new), [packages/cms-rag/server/routes-upload.ts](../packages/cms-rag/server/routes-upload.ts), [server/index.ts](../server/index.ts).
- **`useDocument` hook + test** — React Query with the migration-seed mirrored as static fallback so the page never renders empty. [src/hooks/useDocument.ts](../src/hooks/useDocument.ts) (new), [src/test/useDocument.test.ts](../src/test/useDocument.test.ts) (new).

#### Changed

- **/for-architects technical library renders from the CMS** — same card design (type badge, status chip, serif title, description), but rows come from `/api/cms/document`; a row with an uploaded file links it with a download arrow and a dark "Download" chip. [src/pages/ForArchitects.tsx](../src/pages/ForArchitects.tsx).

### Session: 2026-05-29 — Phase-1-through-7 backlog close, CMS safeguards, deploy hardening

Three-batch session under the rolling deploy chain (`cms-rag-multiuser` → `supafinal` → `main`, with `./deploy.sh` rsync to advo VPS at https://fourlinq.ph). Roadmap reconciled with code reality: Phases 4 + 7 were quietly already-shipped via the `cms-rag` package and just undocumented; Phase 1 + Phase 5 got pipes-wired + cutover. Closing trailing CMS editability gaps so Tita can edit products / aluminium / page body copy without breaking the art-directed homepage hero, scroll-frame animation, or Brand house-photo hero — those stay code-controlled.

#### Added

- **`/aluminium` page** at the new route — Tita's explicit ask from 2026-05-25 (*"we carry two types of windows: uPVC system and aluminium system (thermal break, non-thermal break, alu slim)"*). PageHeader + three system cards + "when we'd specify aluminium" framing + dark CTA. Linked in the Systems nav dropdown as "Aluminium Line". Today renders from `cms_aluminium_system` table via React Query with the original static array as on-error fallback. [src/pages/Aluminium.tsx](../src/pages/Aluminium.tsx) (new), [src/App.tsx](../src/App.tsx), [src/components/layout/QuietNavbar.tsx](../src/components/layout/QuietNavbar.tsx).
- **`cms_aluminium_system` table + CMS kind** — migration 010 creates the table with `slug`, `name`, `summary`, `best_for`, `hero_image_url`, `spec_sheet_url`, `display_order`, `is_published`. Seeds the three brochure systems. Registered in `cms-config.ts` as the `aluminium` entity with image upload + KB sync. Tita edits via `/admin → Content → Aluminium`. [server/migrations/010_cms_aluminium_system.sql](../server/migrations/010_cms_aluminium_system.sql) (new), [server/cms-config.ts](../server/cms-config.ts).
- **`youtube_id` column on product** — migration 008. Slide & Fold backfilled with Tita's reference video `-8XwIKAtAAc` (from her 2026-05-28 chat: https://youtu.be/-8XwIKAtAAc). YouTube embed renders in the product detail panel for any product carrying the id. Now editable in the product CMS form. [server/migrations/008_product_youtube.sql](../server/migrations/008_product_youtube.sql) (new), [src/pages/Products.tsx](../src/pages/Products.tsx), [src/data/products.ts](../src/data/products.ts).
- **Editable product list fields** (`finish_labels`, `glass_labels`, `spec_labels` text[]) — migration 011 adds the columns and backfills from the existing `product_finish` / `product_glass` / `product_feature` joins. Route prefers the new columns when populated; falls back to joins when null. Trade-off acknowledged: lose referential integrity in exchange for one-screen editing without building a related-rows UI. [server/migrations/011_product_editable_lists.sql](../server/migrations/011_product_editable_lists.sql) (new), [server/routes/products.ts](../server/routes/products.ts), [server/cms-config.ts](../server/cms-config.ts).
- **`/admin → Content` editing banner** — explicitly lists what Tita can edit (projects, news, pages, products with all sub-lists, aluminium, media) vs what's design-locked in code (homepage video hero, scroll-window 340-frame canvas, SystemsTiles per-tile sequences, Brand hero photo, Why uPVC profile-image hero, FeaturedTextureScroll). Reduces the "can I change the scroll thing?" question loop. [src/pages/Admin.tsx](../src/pages/Admin.tsx).
- **`<PageBody route="..." />` component** — fetches `cms_page.body` from `/api/cms/pages/:route` via React Query, renders markdown into a quietly-styled section between the existing layout and the dark CTA on `/brand` and `/why-upvc`. Empty body = nothing renders, so pages are visually unchanged unless Tita adds prose. Custom react-markdown component overrides map h1-h3 / p / ul / ol / a / strong / hr to on-brand Marvin typography (no `@tailwindcss/typography` dep needed). [src/components/shared/PageBody.tsx](../src/components/shared/PageBody.tsx) (new), [src/pages/Brand.tsx](../src/pages/Brand.tsx), [src/pages/WhyUpvc.tsx](../src/pages/WhyUpvc.tsx), [server/migrations/012_seed_cms_pages.sql](../server/migrations/012_seed_cms_pages.sql) (new).
- **Phase 2 mailer scaffolding** — new `server/lib/mailer.ts` wraps nodemailer. No-op + warn when SMTP credentials are missing so dev and pre-credential prod don't fail; sends plain-HTML inquiry email with reply-to set to the inquirer the moment `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` land in env. Wired into `/api/contact`, `/api/quote-request`, `/api/save-configuration` as fire-and-forget (mail failure never breaks the DB insert). `express-rate-limit` on all three: contact 3/min, quote 10/hr, save-configuration 20/min, all per-IP. [server/lib/mailer.ts](../server/lib/mailer.ts) (new), [server/routes/inquiries.ts](../server/routes/inquiries.ts).
- **`/api/products` DB-backed route mounted** + React Query hook — `GET /api/products` and `GET /api/products/:slug` were implemented but never wired into `server/index.ts`. Now mounted at `app.use("/api/products", productsRouter)`. `useProducts` uses `@tanstack/react-query` against it. After migration 008 + 009 + the `seed-products.ts` cutover ran on prod (2026-05-29), `USE_API=true` was flipped — `/products` reads from the DB as source of truth, with the bundled static catalog as on-error fallback only. [server/index.ts](../server/index.ts), [server/routes/products.ts](../server/routes/products.ts), [src/hooks/useProducts.ts](../src/hooks/useProducts.ts).
- **`server/scripts/seed-products.ts`** — idempotent reseed of `finish` table from `FRAME_FINISHES` (12 brochure-verified rows, 5 solid + 7 wood-grain), then clears `product_*` tables and reseeds 14 products from `src/data/products.ts`. Nulls `knowledge_chunk.product_id` FK before clearing (chunks remain for kb-sync to re-index later). Used DELETE not TRUNCATE so the app user can run without sequence ownership. Ran on prod successfully — 14/14 inserted, 12 finishes + 3-4 glass options + 4 specs per product. [server/scripts/seed-products.ts](../server/scripts/seed-products.ts) (new), [server/migrations/009_product_types_for_cutover.sql](../server/migrations/009_product_types_for_cutover.sql) (new).
- **Phase 3 — typecheck script + CI workflow** — new `typecheck` npm script runs `tsc --build` (the previously-used bare `tsc --noEmit` did zero work because the root tsconfig has `files: []`). Three real type bugs surfaced and fixed: `useRef<HTMLDivElement>` on a `<li>` in SystemsTiles, JSX intrinsic narrowing on `HeadingTag` in EyebrowHeading (was collapsing against drei `<Image>`'s required props), framer-motion `onDrag` type collision in Section. New `.github/workflows/ci.yml` runs lint + typecheck + test + build on push/PR to main, cms-rag-multiuser, supafinal. [package.json](../package.json), [.github/workflows/ci.yml](../.github/workflows/ci.yml) (new), [src/components/home/SystemsTiles.tsx](../src/components/home/SystemsTiles.tsx), [src/components/primitives/EyebrowHeading.tsx](../src/components/primitives/EyebrowHeading.tsx), [src/components/primitives/Section.tsx](../src/components/primitives/Section.tsx).
- **17 tests** (was 1) — `src/test/useProducts.test.ts` verifies the hook returns full catalog, filters by category, surfaces Slide & Fold `youtubeId`, returns the fixed `casement-door` id, errors on unknown slug. `src/test/data-integrity.test.ts` verifies product ids are unique + kebab-case, every product has a known category, image paths under `/images/`, youtube ids match 11-char format, no stale `entrance-door` id remains, `FRAME_FINISHES` is 12 (5 solid + 7 wood-grain), comparison rows have all three columns. [src/test/useProducts.test.ts](../src/test/useProducts.test.ts) (new), [src/test/data-integrity.test.ts](../src/test/data-integrity.test.ts) (new).
- **Slide & Fold reference video embed** — `youtubeId?: string` field on `Product` interface; when set, the product detail panel renders a 16:9 youtube-nocookie iframe above the body copy. Tita's reference asset from 2026-05-28. [src/data/products.ts](../src/data/products.ts), [src/pages/Products.tsx](../src/pages/Products.tsx).
- **Deploy hardening — branch guard + audit trail** — `deploy.sh` refuses to ship from anything other than `main` / `supafinal` / `cms-rag-multiuser` and refuses to ship with an uncommitted working tree (both bypassable via `FORCE_DEPLOY=1`, which is logged as `forced:1` in the trail). After each successful deploy, writes `/opt/fourlinq/deployed-from.txt` with SHA, short SHA, branch, subject, author, timestamp, deployer identity (`whoami@hostname`), and the FORCE flag. Answers "what's actually live, who shipped it, when?" via `cat`. [deploy.sh](../deploy.sh).
- **Pull-based auto-deploy (opt-in)** — `scripts/vps-auto-deploy.sh` for cron on the VPS. Tracks `origin/main`, pulls + rebuilds + restarts pm2 when HEAD moves. Catches the case where someone pushed to main but nobody ran the local deploy script. Includes setup instructions in the script header (deploy key, `/opt/fourlinq-repo` clone, crontab entry). Not yet enabled — push-based stays primary until the deploy key is provisioned on the VPS. [scripts/vps-auto-deploy.sh](../scripts/vps-auto-deploy.sh) (new).
- **Deploy helper npm scripts** — `npm run deploy` (alias for `./deploy.sh`), `npm run deploy:status` (SSHes + cats `deployed-from.txt`), `npm run deploy:log` (tails the auto-deploy cron log or shows a friendly note if it's not enabled). [package.json](../package.json).

#### Changed

- **`/products` page — Curtain Wall card spans 2 grid columns** — Imie 2026-05-28 chat: *"curtain wall should be tall and wide"*. Conditional `sm:col-span-2` on the curtain-wall card makes the tile both wider and taller (image is `w-full h-auto` so doubling width doubles height). [src/pages/Products.tsx](../src/pages/Products.tsx).
- **`/brand` hero copy** — "Custom-made for Philippine homes." → "European engineering. Philippine projects." Tita 2026-05-28: *"made it seem like just a local fabricator with local standard and market... dapat may international feel despite being a local fabricator"*. Gestures international standards while keeping the PH grounding. [src/pages/Brand.tsx](../src/pages/Brand.tsx).
- **International-feel copy sweep** beyond the hero — AuthorityStrip (*"Engineered for Philippine homes — not imported into them"* → *"European engineering, fabricated for tropical climate"*), Warranty page (*"Engineered for Philippine homes"* → *"European-spec systems, fabricated for Philippine conditions"*), Finishes provenance copy. Uses "European-spec" / "European fenestration standards" framing throughout. [src/components/home/AuthorityStrip.tsx](../src/components/home/AuthorityStrip.tsx), [src/pages/Warranty.tsx](../src/pages/Warranty.tsx), [src/pages/Finishes.tsx](../src/pages/Finishes.tsx).
- **Product id rename**: `entrance-door` → `casement-door`. Stale data bug — the product had `id: "entrance-door"` but `name: "Casement Door"` and the `FinishExplorer` already referenced the `casement-door` id. [src/data/products.ts](../src/data/products.ts).
- **Image upload safeguards on `createUploadRouter`** — `maxSizeBytes` 15 MB → 8 MB (a phone photo is ~3-5 MB; 15 MB was accidental-upload territory). Mime allowlist tightened to JPEG / PNG / WebP / AVIF / GIF only — SVG explicitly excluded (script-injection vector). New `resize: { maxWidth: 1600, thumbWidth: 480, quality: 82 }` config triggers sharp-based downscale on upload + writes a `{stem}-thumb{ext}` thumbnail next to the main file. New `aspectRatioRange: [0.5, 3.0]` rejects extreme portraits / panoramas (returns 400 with explanatory message). Sharp lazy-imported and failures are non-fatal (log + serve original) so upload never breaks because of post-processing issues. EXIF orientation honored via `.rotate()` before resize. [packages/cms-rag/server/routes-upload.ts](../packages/cms-rag/server/routes-upload.ts), [server/cms-config.ts](../server/cms-config.ts).
- **`/api/products` empty-array fallback** — if Tita blanks a product's `finish_labels` / `glass_labels` / `spec_labels` in the CMS, the route falls back to the static catalog values for that slug (via a `STATIC_BY_SLUG` map). No empty sections on the page. Plus a second-fallback for finish colors so admin-typed labels that don't match a `finish.name` row still get a `#cccccc` swatch instead of breaking the render. [server/routes/products.ts](../server/routes/products.ts).
- **`/aluminium` page now CMS-backed** — replaced the hardcoded `ALUMINIUM_SYSTEMS` array with a React Query fetch against `/api/cms/aluminium`, falling back to the same static array on error or empty response. Each card supports optional `hero_image_url` + `spec_sheet_url` Tita can add from the editor. [src/pages/Aluminium.tsx](../src/pages/Aluminium.tsx).
- **ConsultationForm Back / Continue buttons** — bumped `pt-2` → `pt-6 lg:pt-8` on the nav strip so buttons have breathing room below the hairline divider. [src/components/shared/ConsultationForm.tsx](../src/components/shared/ConsultationForm.tsx).
- **Lint config** — exclude vendored shadcn `src/components/ui/**` + `packages/cms-rag/**` from lint (their style is upstream convention, not ours to maintain). Per-file override: `tailwind.config.ts` allows `require()` (Tailwind plugin API). Per-dir override: `server/**` allows explicit `any` (DB row adapters are polymorphic; tightening is a separate refactor). Fixed `Admin.tsx:99` empty catch with an explanatory comment. Result: `npm run lint` exits 0 with 0 warnings. [eslint.config.js](../eslint.config.js), [src/pages/Admin.tsx](../src/pages/Admin.tsx).

#### Deployed

- Push-based via `./deploy.sh` (hardened). Multiple deploys this session as the work shipped in batches. Final tip on prod: `1378871` on branch `supafinal` (audit trail in `/opt/fourlinq/deployed-from.txt`).
- **`main` fast-forwarded to `supafinal`** (and to `cms-rag-multiuser`) at `1378871`. All three branches now in sync. Fresh `git clone` will land on the actual current codebase instead of the 30-day-stale tree.
- Migrations applied on prod (as `sudo -u postgres psql fourlinq`): 008, 009, 010, 011, 012. Plus `npx tsx server/scripts/seed-products.ts` for the catalog cutover.

#### Honest open-items

- **Phase 2 mailer is dormant until SMTP credentials land in `/opt/fourlinq/.env`** (Gmail app password or Resend API key). The code path is exercised; the mailer is a no-op + `console.warn` until then. Auto-email to `sales@fourlinq.com` for new inquiries is the highest-leverage thing blocked on Tita's side.
- **Pull-based auto-deploy (`scripts/vps-auto-deploy.sh`) is not yet enabled.** Needs a one-time setup: generate ed25519 deploy key on the VPS, register the `.pub` as a Deploy key on GitHub, configure `~/.ssh/config` for the `github-fourlinq` alias, clone to `/opt/fourlinq-repo`, add the cron entry. Setup steps live in the script header.
- **Test coverage is unit-only.** 17 tests against data hooks + static catalog integrity. Server-side surfaces still untested: mailer (no-op when SMTP missing, sends when configured), `/api/contact` / `/api/quote-request` / `/api/save-configuration` endpoint shape, `/api/cms/*` CRUD, upload sharp resize + aspect rejection, `PageBody` fallback when `cms_page.body` is empty. CI runs them but proves nothing about regressions on those surfaces.
- **`/aluminium` per-system spec sheets + hero photos** still need Tita's brochure data per system. The DB column is wired; the CMS editor surfaces both fields; the page renders them when set. Waiting on Imie to supply.
- **Round-2 client requests still blocked on Imie input** (full list in [ROADMAP.md §Open client requests round 2](./ROADMAP.md)): sliding door photo (looks like 2-panel fixed), french sliding door category clarification, "special designs" photo, photo cleanup flags + objects to remove, which specific design names she thinks are wrong.
- **3D interactive open/close on `/products`** (Tita ask) — planned, deferred as a separate session. Three.js or animated SVG, 1-2 day lift.
- **Bundle size warning at build** — `dist/assets/index-*.js` is 634 kB / 203 kB gzip. Above Vite's 500 kB warning threshold. Code-splitting via `manualChunks` or further dynamic imports would fix it. Not user-visible problem yet (prod loads fine), but should land before adding more.

### Branch: `cms_final` (LIVE — Vercel production, 2026-05-24 night session)

Tita demo pass. Merge of `cms-rag-multiuser` (CMS + chat work + design tweaks) into `cms_final` (Prince's `redesign-marvin2` = the branch Vercel is pointed at). Fast-forward push at HEAD `3d86347`. Theme: strip "AI generated" surface flourishes and tighten the warranty story for the live preview Tita reviewed before sleep.

#### Added

- [RESTRAINT.md](../RESTRAINT.md) at the repo root — external anti-pattern rulebook explicitly forbidding the surface tells that read as AI-generated: stacked gradient overlays on hero photos, `font-serif italic` display words inside serif headlines (the most identifiable tell), scroll cues, Ken-Burns hero zoom, 88vh "cinematic" heroes, numbered eyebrows (`01 ·`, `02 ·`), decorative hairlines flanking centered text, "by the numbers" dark stat strips, `border-2` accents, custom `@keyframes` in page files, and `ScrollReveal` on every block. Includes a 10-question pre-ship self-check. Reference brands: marvin.com, apple.com/mac. Per user: *"i dont want any of your ai design shinanigans and i want proper front end sleek minimalist design… why upvc was redesigned using your internal design skull and completely ruined the look / i tlooks ugly / ai generated / not marvin-esuqe / apple-esque"*.
- New CSS keyframe `marquee` + `.animate-marquee` utility in [src/index.css](../src/index.css). 28s linear infinite, honors `prefers-reduced-motion` via the existing global rule. Currently used only by the warranty band on /brand.

#### Changed

- **/why-upvc page rewritten** against [RESTRAINT.md](../RESTRAINT.md). Cut 10 sections → 6. White canvas throughout plus one dark CTA. Removed: dual-gradient hero stack, italic "uPVC" word inside the headline, slow-zoom keyframes, scroll cue, dark "By the numbers" stat strip, hairline-flanked centered quote, all numbered eyebrows (`01 · Attractive`, etc.), `border-2` "Default" badge on the materials comparison card. Two layout patterns total — hero/feature (photo + caption beside heading) and 3×2 photo-grid for the remaining six advantages. Repetition IS the design. [src/pages/WhyUpvc.tsx](../src/pages/WhyUpvc.tsx).
- **/why-upvc materials comparison table** iterated through ~10 commits to a final treatment: 4-column hairline table with the uPVC column visually emphasized — white canvas background, hairline left/right borders in ink-primary, larger serif "uPVC" header, **bold** body text in ink-primary. Aluminum and Timber columns stay flat in secondary ink. uPVC header reads `uPV` + red `C` (mirrors the FourlinQ wordmark Q-treatment but on the "C" per user correction). Body cells deliberately black bold, not red — user-tested and rolled back: *"dont make the text inside table red"*. Recommended-material signal is unmistakable without a "Default" badge. [src/pages/WhyUpvc.tsx](../src/pages/WhyUpvc.tsx), [src/data/benefits.ts](../src/data/benefits.ts).
- **/finishes simplified to display-only**. Per user during Tita-prep crunch: *"can u just show the finishes there but no more changing of stuff there, like pressing wont do anything"*. Removed the interactive scene preview (click swatch → window cross-fades), the All/Wood/Solid filter tabs, the "Tap a finish. Watch the window change." heading. Page now shows the 12 brochure-verified swatches in a 6×2 grid with name + Wood Grain/Solid caption, plus the existing provenance and CTA sections. No clicks change state. [src/pages/Finishes.tsx](../src/pages/Finishes.tsx).
- **/brand warranty section** rebuilt as a thin dark band. Was: `size="md"` two-column layout with `h2`-scale headline and a 4-column `gap-px bg-white/10` mosaic of warranty scope items (pixel-fake-divider, template-y). Now: `size="sm"` band; "10" as a giant serif numeral (up to 9rem on xl) and "YEAR WARRANTY." inline beside it on the same baseline, the caption fully in FourlinQ red. Promise prose sits as quiet body-sm in white/65 in a right column. Below the anchor, a full-bleed marquee band (`-mx-12`, hairline top/bottom borders) scrolls the warranty-scope items separated by red `·` dots. List is duplicated in markup so the loop is seamless. Single visual anchor + a moving detail band — reads closer to a luxury-watch product page than a marketing tile. [src/pages/Brand.tsx](../src/pages/Brand.tsx), [src/index.css](../src/index.css).
- **/brand top story-grid card** swapped from a duplicate "10-Year Warranty / Covering corrosion resistance…" card to a Showrooms card ("Manila and Cebu."). The warranty story now lives exclusively in the highlighted black band directly below, no duplication. [src/pages/Brand.tsx](../src/pages/Brand.tsx).
- **/brand warranty band copy** overridden locally (not via `BRAND.promise`): *"Built to last in Philippine conditions. Backed by FourlinQ in writing."* The data file's `BRAND.promise = "A Lifetime of Satisfaction and Peace of Mind."` reads as title-case marketing voice and contradicts the 10-year warranty sitting next to it, but the value is brochure-verified so it stays in the data file for other consumers. [src/pages/Brand.tsx](../src/pages/Brand.tsx).
- **Navbar primary CTA**: "Visit a Showroom" → "Book a Consultation" (desktop link + mobile drawer button). Now points at `/brand#contact` (where `ConsultationForm` lives) instead of `/brand#showrooms`. Lead capture beats a drive-to-showroom ask as the primary conversion — most first-time visitors won't get in a car, but they will fill a form. Showroom link stays in the footer as a secondary entry. [src/components/layout/QuietNavbar.tsx](../src/components/layout/QuietNavbar.tsx).
- **ConsultationForm notes field → boxed input**. The underline-only style worked for single-line inputs but the textarea read as floating prose. Now: 1px hairline border + `canvas-soft` background + focus state goes white with dark border. Other fields keep the underline style — the textarea is the only visually-distinct field, matching its longer-content expectation. [src/components/shared/ConsultationForm.tsx](../src/components/shared/ConsultationForm.tsx).

#### Removed

- DesignToolPreview / FinishExplorer swap on `/` (homepage): a merge conflict from `origin/cms_final` offered Prince's FinishExplorer-in-place-of-DesignToolPreview ordering. Kept the local version (SystemsTiles → ProjectReels → DesignToolPreview → InspirationStrip) — preserves DesignTool surfacing on the homepage. [src/pages/Index.tsx](../src/pages/Index.tsx).

#### Deployed

- `cms-rag-multiuser` fast-forward pushed to `cms_final` at `3d86347`. Push was confirmed fast-forward (Prince's last commit `9b69459` is an ancestor of the new tip) — no force, no Prince commits lost.
- Prince then merged `cms_final` into his `redesign-marvin2` and pushed as `origin/supafinal` at `17510f0`. **`supafinal` is now the deploy branch.** Our work is preserved in the merge — `3d86347` is an ancestor of `17510f0`.

#### Honest open-items

- DesignTool 500 on `/api/analytics` POST in local dev — non-blocking telemetry endpoint, page renders fine. Production has the real backend so it won't 500 there, but the dev-only failure is noise during demos.
- `RESTRAINT.md` is not yet linked from `DESIGN.md` or `CLAUDE.md` / project orientation. Cross-link if you want future sessions to discover it without being told.
- The `EyebrowHeading` primitive still adds a `before:content-['']` hairline prefix on left-aligned eyebrows — that violates RESTRAINT.md's "no decorative hairline prefixes on eyebrows" rule but the primitive is used across many pages. Rippling the fix is a separate batch.
- `BRAND.promise = "A Lifetime of Satisfaction and Peace of Mind."` in `src/data/fourlinq-data.ts` is still the value any other page would render. Only the warranty band on /brand overrides it locally. If we want a sitewide rewrite, do that as a separate copy pass with client sign-off (the line is brochure-verified).

### Branch: `redesign-marvin` (NOT YET MERGED — under client review)

The Marvin-direction redesign is shipping on a feature branch separate from `main`. Vercel auto-deploys it to a preview URL that's distinct from production. All entries in this sub-block live only on that branch until Tita signs off and we merge. Detailed phase-by-phase log lives in [REDESIGN_ROADMAP.md §14 Implementation log](./REDESIGN_ROADMAP.md) — this is the user-visible-impact summary.

#### Added
- New [src/theme.config.ts](../src/theme.config.ts) — single documented source of truth for design tokens. Explains the three-mirror system between this file, `tailwind.config.ts`, and the `:root` CSS variables in `src/index.css`. Client-driven design changes (button shape, brand color, motion timing) now have one canonical entry point. Per user request during the P0 sweep: *"i just want a config file, i dont want hard coded values in the code, so if ever the client doesnt like the button, etc."*.
- Editorial primitive component library at [src/components/primitives/](../src/components/primitives/): `Section`, `Container`, `EyebrowHeading`, `FeatureLink`, `AccentStripe`, `Spacer`, `Button` (exported as `EditorialButton`). Replaces shadcn-style page composition for everything except internal form controls.
- Marvin signature easing curve `cubic-bezier(.68, 0, .33, 1)` exposed as `ease-marvin` Tailwind class and `--ease-marvin` CSS var. Grep'd from Marvin's production CSS during deep-research — replaces the easeOutCubic approximation site-wide. [tailwind.config.ts](../tailwind.config.ts), [src/index.css](../src/index.css)
- Global `*:focus-visible` ring (2px accent, 3px offset) — every interactive element now has a visible keyboard-focus indicator. Replaces the previous `outline:none` on `EditorialButton`. [src/index.css](../src/index.css)
- Skip-to-content link in [src/components/layout/Layout.tsx](../src/components/layout/Layout.tsx) for keyboard navigation.
- `prefers-reduced-motion` handling — disables animations and the Ken Burns hero zoom for users who request reduced motion. [src/index.css](../src/index.css)
- Escape-to-close on `ChatPanel`, `ProductDrawer`, and `QuoteModal`.
- §13 deep-research addendum in [REDESIGN_ROADMAP.md](./REDESIGN_ROADMAP.md) — 230+ lines documenting every Marvin design token extracted from 156 production CSS bundles + 14 page templates (full type scale, spacing scale, motion curves, breakpoints, color ramps, component naming conventions). The branch's design contract is now backed by actual production values rather than estimates.

#### Changed
- **Navigation rebuild**: 80px → 72px height (matches Marvin desktop); 5 nav items → 4 (Design Tool moved to footer-only per the §11 design decision); all hover transitions migrated to `duration-300 ease-marvin`. [src/components/layout/QuietNavbar.tsx](../src/components/layout/QuietNavbar.tsx)
- **Type scale recalibrated** to match Marvin's hjumbo ramp: display 88px / h1 64px / h2 56px (were 112 / 80 / 64). [tailwind.config.ts](../tailwind.config.ts)
- **Hero**: cross-fade easing migrated to the Marvin signature curve; two-layer scrim simplified to single bottom-up gradient; `100vh` → `100dvh` to fix iOS Safari address-bar jump; pagination dots changed from `h-px` (invisible 1px target) to a visible 2px bar on a 44px-tall button. [src/components/home/HeroCarousel.tsx](../src/components/home/HeroCarousel.tsx)
- **Editorial motion across all sections**: image hover-scale slowed from `duration-500 ease-out` to `duration-700 ease-marvin`. Card hover shadow lightened from `shadow-lg` to `shadow-depth-6`. SystemsTiles + InspirationStrip + WhatsNew all on the new pattern.
- **`/products` page rebuilt**: shadcn card-with-border-shadow grid → editorial image-led 3-column grid matching home `SystemsTiles`. Filter pill row → hairline-underlined tab row with red active underline. Product drawer is now a full-height right-side panel matching the chat panel shape (red accent stripe + serif title + hairline-divided spec list + arrow-translate hovers). [src/pages/Products.tsx](../src/pages/Products.tsx)
- **`/brand` page rebuilt**: Story / Warranty / Certifications / Contact / Showrooms / CTA all on the `Section` primitive with tone alternation (`canvas` → `dark` → `soft` → `canvas` → `soft` → `dark`). New `ContactRow` hairline-list component. Certifications + warranty scope rendered as 1px-gap mosaic instead of bordered cards. [src/pages/Brand.tsx](../src/pages/Brand.tsx)
- **`/why-upvc` page rebuilt**: editorial comparison table with charcoal top rule + eyebrow column heads + no zebra striping. Climate factors as 3-up hairline mosaic. Icon colors muted to gray. [src/pages/WhyUpvc.tsx](../src/pages/WhyUpvc.tsx)
- **`/legal` page**: removed old `Navbar` + `Footer` imports, swapped to `Layout` + new editorial `PageHeader`. Body uses serif h-styles + `container-reading` (840px max). [src/pages/Legal.tsx](../src/pages/Legal.tsx)
- **`/404`**: shadcn `text-4xl font-bold` → full editorial layout with breadcrumb-style eyebrow and primary/ghost CTA pair. [src/pages/NotFound.tsx](../src/pages/NotFound.tsx)
- **`/design-tool`**: page header updated to editorial voice; configurator option-buttons + form inputs swept to hairline pattern. Configurator interaction logic unchanged. [src/pages/DesignTool.tsx](../src/pages/DesignTool.tsx)
- **Forms (`ContactForm`, `QuoteModal`, `CookieBanner`)**: all rewritten off shadcn chrome. `ContactForm` uses underline inputs with uppercase eyebrow labels. `QuoteModal` is now a right-side panel matching `ChatPanel` / `ProductDrawer`. `CookieBanner` is a flat editorial card with hairline Decline + solid charcoal Accept buttons (both enforce 44px tap-height floor). [src/components/shared/](../src/components/shared/)
- **Chat window**: charcoal 48px icon dot (was loud-red 56px glassmorphism) hidden until user scrolls past 120px and 4s elapse. Panel rebuilt with 3px red accent stripe + serif "LinQ" header + soft-cream message area + hairline-bordered assistant bubbles + solid-red user bubbles. Editorial palette throughout but bubbles preserved as the standard chat affordance — see the §14 lesson in REDESIGN_ROADMAP after a slide-in sidebar variant was rejected with *"i dont like this, its not even a chat window anymore"*. [src/components/chat/](../src/components/chat/)
- **Color contrast pass**: `--ink-faint` `#909090` (3.0:1 — failed WCAG AA) → `#767676` (4.5:1 — passes AA). New `--ink-on-dark-{primary,secondary,muted,faint}` scale documented for dark sections. [src/index.css](../src/index.css)
- **`PageHeader` rewritten**: shadcn breadcrumb component → hairline-uppercase trail with `ChevronRight` separator. Title uses serif display with responsive scale; optional `eyebrow` prop with signature hairline-prefix. Used on every non-home page. [src/components/shared/PageHeader.tsx](../src/components/shared/PageHeader.tsx)
- **`EditorialFooter`**: all hover transitions migrated to `duration-300 ease-marvin`. Eyebrow color tokens swapped to the new on-dark scale.

#### Removed
- 9 unused / replaced files in this branch: home components `HeroSection.tsx`, `DesignToolTeaser.tsx`, `WhyUpvcCards.tsx`, `ProductsPreview.tsx`, `TrustBar.tsx`, `InspirationGallery.tsx`; layout components `Navbar.tsx`, `Footer.tsx`, `NavLink.tsx`. Net –338 LOC after the pages-revamp commit, with additional cleanup in the subsequent P0 sweep.

#### Open questions for the client (specific to this branch)
- **Hero copy direction** — current placeholder is still the old "Precision. Performance. Perfection." style. Three editorial options to propose to Tita.
- **Product spec confirmation** — does FourlinQ actually offer Large Panel up to 6m, 90 Series, Lift & Slide, Curtain Wall? Catalog held on the [project_fourlinq_verified_data.md](../../.claude/projects/-Users-angelonrevelo-Antigravity-fourlinq/memory/project_fourlinq_verified_data.md) rule (brochure-verified only) until she answers.
- **Photo strategy** — Scenario A (current photos) / B (hi-res from her photographer) / C (commissioned shoot)? Phase 4 work (project gallery, finish switcher) is blocked on this answer.
- **Tablet 992–1199 audit** — flagged in red-team analysis but not executed; the dominant Marvin breakpoint is 992px so this zone needs explicit testing.
- **Carry-overs from round 1** — LinkedIn page status; 22-year founding date confirmation.

### Honest open-items on this branch
- Zero test coverage on any new component (PageHeader, ChatPanel, ChatMessage, ContactForm, QuoteModal, CookieBanner, editorial primitives, page revamps). The repo had only a placeholder `src/test/example.test.ts` before this branch as well — **not a regression**, but the redesign is large enough that Playwright smoke tests for the 4 critical flows (home → hero → CTA / `/products` filter + drawer / contact form submit / chat open + send) would meaningfully de-risk a future merge. Deferred until Phase 6+ stabilizes the design.
- `Admin` page still on shadcn chrome — internal-only, deliberately skipped in the P0 brand-consistency sweep.
- DesignTool live configurator preview SVG (`src/components/configurator/WindowPreview.tsx`) was not touched. Existing `case "special-shapes"` gap from round 1 still stands.

### Fixed (main branch — predates redesign-marvin)
- Products page: removed orphaned **Systems** filter pill that always produced an empty grid. The catalog has no `category: "systems"` products — the historical Entrance Prestige + Curtain Wall System entries were intentionally dropped during the 2026-03-23 verified-data pass because their specs and images were not brochure-backed. The pill stayed behind from that cleanup. Page title remains "All Systems" so the unfiltered view still reads naturally. ([products.ts:6](../src/data/products.ts#L6) keeps `"systems"` in the type union for forward-compat if/when the client confirms a real specialist-systems lineup.)

### Infrastructure
- DNS cutover from old Contabo nginx to Vercel via Namecheap (apex `A` → `76.76.21.21`, `www` `CNAME` → `cname.vercel-dns.com`). Site is now served from Vercel with auto-provisioned SSL.
- Added 301 redirects in [vercel.json](../vercel.json) for legacy WordPress URLs (`/index.php/contact-us/` etc.) so Google's indexed links resolve to the right new pages instead of dumping users on the homepage.

---

## [2026-04-26] — Client review round 1

Addresses all 10 items in `WEBSITE-COMMENTS.docx`, plus several adjacent polish fixes that surfaced during the review pass.

### Added

- `<ScrollToTop>` component mounted at the router level. On every route change, the page scrolls to the top (or smooth-scrolls to a hash anchor if one is present in the URL). For lazy-loaded routes, the hash-anchor lookup retries up to 5× over 500ms so it works even when the target page is still loading. Replaced an ad-hoc per-page hash handler in [src/pages/Brand.tsx](../src/pages/Brand.tsx) (deleted) so there's now a single source of truth. Use `scroll-mt-28` on any new anchor target to clear the sticky navbar. Per client comment #10 in WEBSITE-COMMENTS.docx. [src/components/shared/ScrollToTop.tsx](../src/components/shared/ScrollToTop.tsx), [src/App.tsx](../src/App.tsx)
- Footer email and phone now render as clickable links (previously plain text). Email opens a Gmail compose draft in a new tab; phone uses `tel:`. [src/components/layout/Footer.tsx](../src/components/layout/Footer.tsx)
- New `SpecialShapesIcon` SVG: a Palladian-style arch-top window with radial muntins fanning from the springline + vertical mullion in the rectangular section. Replaces the generic `FixedIcon` previously used for the "Special Shapes" product. Wired into Products page, Design Tool icon map, and Navbar mega-menu icon map. Per client comment #8 in WEBSITE-COMMENTS.docx. [src/components/icons/WindowIcons.tsx](../src/components/icons/WindowIcons.tsx), [src/pages/Products.tsx](../src/pages/Products.tsx), [src/pages/DesignTool.tsx](../src/pages/DesignTool.tsx), [src/components/layout/Navbar.tsx](../src/components/layout/Navbar.tsx). **Known gap:** the configurator's live preview ([src/components/configurator/WindowPreview.tsx](../src/components/configurator/WindowPreview.tsx)) has no `case "special-shapes"` and will fall through to the default render. If users pick Special Shapes in the Design Tool, the preview won't draw an arch — flagged for a follow-up if the client wants the configurator to support custom geometry.

### Changed

- Replaced homepage hero background with an actual FourlinQ project photo (sourced from the official Facebook page via the ADVO scrape: `WWWCQcpX.jpg`, mirrored horizontally for better composition). The previous image was a generic stock/rendered architectural shot. Per client comment #1 in WEBSITE-COMMENTS.docx. [public/images/hero-bg.jpg](../public/images/hero-bg.jpg). **Note:** new file is 1275×720 (a horizontal upgrade over the previous 1024×1024 square). A higher-resolution original from the client would still be preferred long-term — flagged for follow-up.
- Hero image `object-position` shifted from `center` to `center 70%` to give the building more breathing room on tall viewports. [src/components/home/HeroSection.tsx](../src/components/home/HeroSection.tsx)
- Email link on the Brand page Contact section now opens a Gmail compose draft in a new tab (was a plain `mailto:` which depended on the visitor having a default mail client configured). Per client comment #3 in WEBSITE-COMMENTS.docx. **Tradeoff:** users who don't use Gmail will be taken to Gmail's web compose anyway — chosen because the client explicitly requested Gmail behavior and FourlinQ's audience is predominantly Gmail. If we ever want to respect the visitor's preferred mail client universally, switch back to `mailto:`. [src/pages/Brand.tsx](../src/pages/Brand.tsx)
- LinQ chatbot system prompt updated to explicitly require bullet formatting for frame finish lists (uPVC and Aluminum). Previously the bot would sometimes render Aluminum's four solid finishes as inline prose. Per client comment #2 in WEBSITE-COMMENTS.docx. [server/routes/chat-lite.ts](../server/routes/chat-lite.ts)
- French Door icon now shows muntin bars — a 2×3 grid of glass lites per panel — to match the traditional divided-light French door style. Previously the panels were undivided rectangles. Per client comment #6 in WEBSITE-COMMENTS.docx. [src/components/icons/WindowIcons.tsx](../src/components/icons/WindowIcons.tsx)
- "Visit a Showroom" links in the navbar utility bar and footer now target `/brand#showrooms` instead of `/brand#contact`, landing on the "Our Locations" section directly. Added `id="showrooms"` to the heading and `scroll-mt-28` (= 112px) to all three Brand-page anchors (`#certifications`, `#contact`, `#showrooms`) so smooth-scroll lands below the sticky navbar. Per client comment #9 in WEBSITE-COMMENTS.docx. [src/pages/Brand.tsx](../src/pages/Brand.tsx), [src/components/layout/Navbar.tsx](../src/components/layout/Navbar.tsx), [src/components/layout/Footer.tsx](../src/components/layout/Footer.tsx)
- Product label "Entrance Door" renamed to "Casement Door" across the catalog page, the Doors mega menu, the Design Tool, and the homepage products preview. Internal IDs (`entrance`, `entrance-door`, `EntranceIcon` component) were intentionally NOT renamed to avoid touching every consumer; only user-visible labels and prose changed. The unrelated "Entrance Prestige" product in [server/migrations/002_seed.sql](../server/migrations/002_seed.sql) and [server/migrations/004_knowledge_seed.sql](../server/migrations/004_knowledge_seed.sql) is a different higher-security door system not currently surfaced in the UI — deferred until catalog migrates to the DB (ROADMAP Phase 1). Per client comment #7 in WEBSITE-COMMENTS.docx. [src/data/products.ts](../src/data/products.ts), [src/data/configurator.ts](../src/data/configurator.ts), [src/components/layout/Navbar.tsx](../src/components/layout/Navbar.tsx), [src/components/home/ProductsPreview.tsx](../src/components/home/ProductsPreview.tsx)
- Trust bar stat changed from "15 Years Of Precision" to "22 Years Of Precision". Per client comment #4 in WEBSITE-COMMENTS.docx. **Source for the new number:** the original "15 Years" appears to have been written ~2019 and never updated. Web research (Philippine Star, business listings) places FourlinQ's introduction at 2004, making the 2026-relative figure 22 years. The client should confirm 2004 as the correct anchor — if a different milestone is the brand's intended start (e.g. showroom opening, separate product line launch), update accordingly. [src/components/home/TrustBar.tsx](../src/components/home/TrustBar.tsx)
- Brand page Story section image swapped from a generic showroom reception shot (`Company-Profile.jpg`) to an actual FourlinQ-equipped home in the Philippines (sourced from the official Facebook scrape: `tjvvAChI.jpg`). New file at [public/images/brand-story.jpg](../public/images/brand-story.jpg). [src/pages/Brand.tsx](../src/pages/Brand.tsx)

### Fixed

- Footer Facebook link now points to the official page `FourlinQofficial` (was pointing to a non-existent `/fourlinq` handle, which is why it appeared not to open). Per client comment #5 in WEBSITE-COMMENTS.docx. [src/components/layout/Footer.tsx](../src/components/layout/Footer.tsx)
- Footer Instagram link canonicalized to `https://www.instagram.com/fourlinq/`. Per client comment #5 in WEBSITE-COMMENTS.docx. [src/components/layout/Footer.tsx](../src/components/layout/Footer.tsx)
- Floating chat bubble no longer overlaps footer content. When the footer enters the viewport (IntersectionObserver) AND the chat panel is closed, the bubble lifts via GPU-accelerated `transform: translateY(-100px)` (smooth 500ms ease-out). Lift is suppressed when the panel is open so the close-button (X) stays anchored at its base position and doesn't drift into the panel's input row. Wrapping the lift on a parent `<div>` keeps it from conflicting with the button's own `hover:scale` transforms. The footer-lookup retries up to 10× over 1s so lazy-loaded pages (which mount their footer after Suspense resolves) still get the observer attached. `rootMargin: "0px 0px 100px 0px"` triggers the lift slightly before the footer is fully visible for smoother UX. [src/components/chat/ChatBubble.tsx](../src/components/chat/ChatBubble.tsx)
- Inspiration Gallery card hover animation no longer "drops" the title text on un-hover. The inner caption div had `transition-opacity` only, so the `translate-y` change snapped instantly while opacity faded. Switched to `transition-[opacity,transform]` so both properties animate together in both directions. [src/components/home/InspirationGallery.tsx](../src/components/home/InspirationGallery.tsx)
- Why uPVC page benefit cards, comparison table rows, climate cards, and Brand page certification + branch cards no longer use Framer Motion's default spring transition (which produced a noticeable bounce/overshoot). Switched all of them to explicit `tween` with `easeOut` and `duration: 0.4s` for a calm, professional fade-up. [src/pages/WhyUpvc.tsx](../src/pages/WhyUpvc.tsx), [src/pages/Brand.tsx](../src/pages/Brand.tsx)

### Removed

- Footer LinkedIn link. FourlinQ does not currently have a LinkedIn company page (`/company/fourlinq` returns 404). Will be re-added when the client provides a real URL. [src/components/layout/Footer.tsx](../src/components/layout/Footer.tsx)
- Team photo banner from the Brand page. It was a near-duplicate of the showroom reception shot (same lobby, slightly different angle) and added no real content. The page now flows Story → Warranty → Certifications → Contact, which reads cleaner. The orphaned image file `public/images/wp-export/Company_Profile1.jpg` is intentionally left on disk in case the client wants to reinstate or reuse it. [src/pages/Brand.tsx](../src/pages/Brand.tsx)

### Open questions for the client

- **22 Years of Precision** — derived from a 2004 founding year inferred from public sources. Client should confirm or correct.
- **LinkedIn page** — does FourlinQ want one created, or stay off LinkedIn? Footer link is removed pending decision.
- **Hi-res hero photo** — current hero is a 720p Facebook download. A 4K original from the client's archive would noticeably improve sharpness on retina displays.
- **Special Shapes preview in the Design Tool** — should the live SVG preview support arch-top / circular / trapezoidal shapes too, or is the icon update enough?

---

## [2026-04-26] — Documentation baseline

### Added

- [docs/ROADMAP.md](./ROADMAP.md) — phased plan for codebase migrations and platform upgrades.
- [docs/CHANGELOG.md](./CHANGELOG.md) — this file.

### Notes

This is the starting point for tracking changes. Earlier development history lives in `git log` and is not retroactively backfilled here. Treat this entry as the baseline; all future changes should be logged under `[Unreleased]` as they merge.

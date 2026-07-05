# FourlinQ Roadmap

**Last updated: 2026-07-05** (Imie chat round 3 — `/products` layout rebuild to Marvin-style category cards, blocked on a meeting; see "chat round 3" below. Prior refresh 2026-06-16.)

This document tracks planned and in-progress improvements to the FourlinQ codebase beyond day-to-day client requests. It is a living document. Update phase status as work lands, and move completed phases to the bottom under "Shipped."

For a record of what has actually changed and when, see [CHANGELOG.md](./CHANGELOG.md).

---

## Current state (snapshot)

- **Live URL:** https://fourlinq.ph
- **Deploy branch:** `cms-rag-multiuser` on origin (`./deploy.sh` rsyncs to advo VPS, pm2-managed)
- **Vercel:** removed entirely as of 2026-05-25. No `vercel.json`, no `api/` directory, no `@vercel/node` dep.
- **Tita demo round:** completed 2026-05-25. Hero locked at *"Built to Last. Designed to Inspire."* (her exact wording). Most surface-level revisions shipped. Remaining work captured below.

---

## Open client requests (from Tita 2026-05-25)

These came in after the redesign demo. Status reflects current state.

| # | Request | Status | Phase |
|---|---|---|---|
| 1 | Hero headline = "Built to Last. Designed to Inspire." | Shipped 2026-05-25 | n/a |
| 2 | Drop "10-year warranty" from front-page hero (some customers opt out) | Shipped 2026-05-25 | n/a |
| 3 | Acknowledge both uPVC AND aluminium product lines | Shipped 2026-05-29 (dedicated `/aluminium` page + Systems nav dropdown link). Spec sheets per sub-product still pending — see Phase 6. | Phase 6 |
| 4 | Auto-email new inquiries to sales@fourlinq.com | Scaffolding shipped 2026-05-29; goes live the moment SMTP creds land in `.env`. See Phase 2. | Phase 2 |
| 5 | CMS lets Tita upload photos directly via /admin | Shipped (verified 2026-05-29 — `MediaLibrary` in `/admin → Content`, drag-drop + paste + batch + alt-text + soft-delete + size cap). | Phase 7 |
| 6 | Photo cleanup on project sites (manual edit) | Waiting on Tita to send specific photos + objects to remove | Manual, no code |
| 7 | "Installed across the Philippines" reads too local | Shipped 2026-05-25 (now "Custom-fabricated to architect specifications") | n/a |
| 8 | "Twelve finishes" product card misplaced in projects feed | Shipped 2026-05-25 (filtered off homepage) | n/a |
| 9 | Public site sign-in confusion | n/a (no wall exists; clarified to Tita the sign-in is only `/admin`) | n/a |

---

## Open client requests (from Imie/Tita 2026-05-28 chat round 2)

Second round of feedback after the demo. Mostly visual/photo work — deferred until Imie supplies the specific assets.

| # | Request | Status | Notes |
|---|---|---|---|
| 10 | Sliding door photo looks like a 2-panel fixed | Blocked on Imie | Current `slidingdoor.jpeg` and `Sliding-Door.jpg` both show static panels with no sliding cue. Needs a proper product render or photo with track / offset / arrows. |
| 11 | French sliding door — wants this as a category | Blocked on Imie | Currently we have separate "French Door" + "Sliding Door". Unclear if she wants a combined "French Sliding Door" product (sliding instead of swinging) or just a rename. |
| 12 | "Special designs" visual unclear | Blocked on Imie | She marked a photo 🖼 with that label but didn't say what's wrong. |
| 13 | Curtain wall display "tall and wide" | Shipped 2026-05-29 (card spans 2 grid columns on /products) | n/a |
| 14 | 3D interactive open/close on window/door designs | Planned (large effort — Three.js or animated SVG) | Apply to /products. Schedule as its own phase. |
| 15 | Slide & Fold reference video — https://youtu.be/-8XwIKAtAAc | Shipped 2026-05-29 | YouTube embed renders in the Slide & Fold product detail panel on /products. Schema now supports `youtubeId` on any product. |
| 16 | "International feel despite being a local fabricator" | Shipped 2026-05-29 (Brand hero + AuthorityStrip + Warranty + Finishes provenance copy). | Remaining copy uses "European-spec" / "European fenestration standards" framing. |
| 17 | Design names — "Mali yung design niyo, check internet for meaning of each" | Blocked on Imie | She didn't enumerate which products. The brochure-verified names should stay until she points at specific ones. One certain bug fixed: `id="entrance-door"` → `casement-door` (matched the `name` field and FinishExplorer reference). |
| 18 | AI photo cleanup (remove objects on project sites) | Blocked on Imie | Needs her to flag specific photos + objects. |

---

## Open client requests (from Imie 2026-07-02 / 07-05 chat round 3) — ⚠️ /products LAYOUT REBUILD

Round 3, after the 2026-06-19 delivery (window animations + thermal-break feature). On 2026-07-05 the team shipped a **uPVC / Aluminium material toggle** on `/products` and messaged Imie it was done. She reviewed on her phone and replied: *"Can we meet? It's not according to intended layout of the site 😭."* **The toggle did not match her intended layout and is superseded — see below.**

Grounded in her Jul 2 diagram (`attachments/photo_2026-07-02_14-20-32.jpg`), the Marvin "Collections" reference she captioned *"should have something like this"* (`photo_2026-05-19_05-31-13.jpg`), and a full visual review of her sent screenshots — not OCR.

**⚠️ Blocked on a meeting** (she requested it 2026-07-05; time TBD). Do NOT build until the data-model question (#21) is answered — a second wrong build would be costly with this at-risk client.

### Intended `/products` — Marvin-style category cards (NOT tabs, NOT a material toggle)

Four full-bleed **photo-cards** in a row, each a real project photo + name + item list. Replaces the current thin `All Systems · Windows · Doors · Specialist` tab bar. (The v1 site's own "Our Systems" 3-card section was already this pattern; she wants it back, plus a 4th card.)

| Card | Items |
|---|---|
| Window Systems | Casement, Sliding, Awning, Special Shapes |
| Door Systems | Slide & Fold, Large Panel, Lift & Slide, 90 Series |
| Specialist Systems | Arch, Curtain Wall, Custom Shapes |
| Aluminium Line | Thermal Break, Non-Thermal Break, Alu Slim |

| # | Request | Status | Notes |
|---|---|---|---|
| 19 | Rebuild `/products` as a 4-card Marvin-Collections layout | Blocked on meeting | Aluminium Line is a peer 4th card, not a material toggle. Supersedes the 2026-07-05 toggle. |
| 20 | Use REAL project photography on the cards, not synthetic 3D renders | Blocked on Imie assets | She rejects the white-bg renders — sliding door "looks like a 2-panel fixed," curtain wall doesn't read "tall and wide." Benchmark = kennethandmock real photography. Overlaps items #10, #13. |
| 21 | **Data model:** is Aluminium a material option *per* window/door, OR a separate 4th catalog? | Blocked on meeting | Her diagram = separate category; her words (Jul 2) = "both are profile systems." **Decides the entire build — confirm first.** |
| 22 | Add 3 door products: Large Panel, Lift & Slide, 90 Series | Blocked on Imie assets | Exist as names/icons in `configurator.ts`; need brochure-verified photos + specs. |
| 23 | Why uPVC page too sparse — "just showed one photo, a cut section" | Planned | Build out; extend the interactive "zero leaks" style to alu thermal break (her 2026-05-31 ask). |
| 24 | Confirm product re-assignments: Slide & Fold → Doors, Awning → Windows | Blocked on meeting | Per her Jul 2 diagram. |

---

## Status legend

- **Planned** — agreed scope, not started
- **In progress** — actively being worked on
- **Blocked** — waiting on a decision, dependency, or client signal
- **Deferred** — intentionally postponed; revisit trigger noted
- **Shipped** — complete (move to the "Shipped" section with a date)

---

## Guiding principles

1. **Ship in phases.** Each phase below is independently shippable. Do not bundle phases unless they share a migration step.
2. **ROI over alphabetical order.** Phases are ordered by impact ÷ effort, not by topic.
3. **Don't build for hypothetical needs.** Phases marked "Deferred" stay deferred until a real trigger appears (client ask, scaling pain, etc.).
4. **Preserve the design system.** All work must comply with [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). No emojis, no off-palette colors, no bouncy animations.
5. **Document as you go.** Every shipped phase gets a CHANGELOG entry on the day it merges.

---

## 2026-06-16 Whole-project roadmap refresh

**Scope:** whole project, current dirty working tree on `codex/tesla-marvin-design`.
**Discovery inputs:** current code, `docs/ROADMAP.md`, `docs/HANDOFF.md`, `docs/FIX_ROADMAP.md`, `docs/REDESIGN_ROADMAP.md`, competitor research under `docs/competitor-*`, three read-only subagent audits, bounded external research for premium window/door sites, and the current local browser feedback loop.
**Validation rule:** no row below counts as a roadmap item unless it has a falsifiable benchmark in [roadmap-benchmarks/2026-06-16-whole-project.md](./roadmap-benchmarks/2026-06-16-whole-project.md). Rejected or not-yet-decidable items live in [roadmap-rejected.md](./roadmap-rejected.md).

### P0 — Prove current reality before adding new visual work

These are small or foundational. They stop the site from drifting while the design polish continues.

| Item | What it closes | Effort | Benchmark | Status |
|---|---|---|---|---|
| **Viewport visual QA gate** for home/global chrome at 375, 560, 768, 992, 1100, 1199, and 1440px | Recent feedback around tablet hero layout, footer alignment, chat/social collisions, and centered vs. left/right composition currently depends on eyeballing screenshots | ~0.5-1 day | **B1** | Shipped 2026-06-16 (`npm run qa:visual`) |
| **Fixed-layer collision policy** for chat, cookie banner, footer socials, and mobile controls | Chat blocked Facebook/Instagram in the footer and can also collide with the cookie banner | ~0.5 day | **B2** | Shipped 2026-06-16 |
| **Docs reality sync** across ROADMAP, FIX_ROADMAP, REDESIGN_ROADMAP, HANDOFF, BACKEND_SCHEMA, README | Several docs still claim Vercel/no-code/15MB+SVG/old auth/pending UI items after code has moved on | ~0.5 day | **B3** | Planned |
| **Design-token truth table** for active FourlinQ red/black/white identity, fonts, radius, and button grammar | The branch drifted between Tesla-ish, Marvin-ish, and original FourlinQ identity; docs and code disagree on Inter vs Manrope/Cormorant, pill vs square-ish buttons, and red hexes | ~0.5 day | **B4** | Planned |
| **Admin media upload truthfulness** | UI still says SVG and 15 MB while server rejects SVG and caps at 8 MB; upload failures are mostly console-only | ~0.5 day | **B5** | Shipped 2026-06-16 |

### P1 — Fix correctness gaps that can mislead Tita or sales

These are real product/backend issues, not just taste.

| Item | What it closes | Effort | Benchmark | Status |
|---|---|---|---|---|
| **Product detail API parity** (`GET /api/products/:slug` respects editable `finish_labels`, `glass_labels`, `spec_labels`) | List endpoint honors CMS edits, single-product endpoint still reads join tables; product drawer/detail can show stale specs after admin edits | ~0.5 day | **B6** | Planned |
| **Hardcoded internal route audit** for chat/page-map/knowledge links | Runtime content references `/window-systems`, `/door-systems`, `/specialist-systems`, but the router does not define them | ~0.5 day | **B7** | Planned |
| **Design Tool save failure state** | The UI can imply a quote request was saved even if `/api/save-configuration` fails | ~0.5 day | **B8** | Planned |
| **CMS page-field clarity** | Admin Pages expose hero fields that public pages currently ignore, inviting edits that appear to do nothing | ~0.5 day | **B9** | Planned |
| **Finish-count consistency** | Copy and data drift between 11 and 12 finishes; this is exactly the kind of small product-detail mismatch clients notice | ~0.5 day | **B10** | Planned |
| **Unverified numeric-claim sweep** on `/why-upvc` and benefit data | Past restraint pass removed unsupported stats, but numeric claims reappear in copy/data without source labels | ~0.5 day | **B11** | Planned |

### P2 — Design polish with measurable acceptance

These are the current design objections translated into pass/fail checks.

| Item | What it closes | Effort | Benchmark | Status |
|---|---|---|---|---|
| **Hero first-paint and CTA decision** | Current hero has no poster/caption, preloads a large video, and still uses two button CTAs. It can look too centered/tall depending on slide/video and viewport | ~0.5-1 day | **B12** | Planned |
| **Tablet nav and mega-menu keyboard support** | Desktop nav starts at 992px, a historically weak range; Systems dropdown is hover-driven and not keyboard-complete | ~1 day | **B13** | Planned |
| **Reduced-motion and data-budget path for frame-heavy home** | Home can load hero video plus scroll/system frame sequences; reduced-motion currently needs a proof path, not hope | ~1 day | **B14** | Planned |
| **Home Design Tool preview restraint pass** | The preview uses rounded/shadowed card chrome that clashes with the editorial restraint rules | ~0.5 day | **B15** | Planned |
| **Homepage What's New rule** | Home intentionally filters to event/press, which can omit the latest product/project updates Tita asked for | ~0.5 day | **B16** | Planned |

### P3 — Product/content depth once assets exist

These are genuine but should not block the current visual cleanup.

| Item | What it closes | Effort | Benchmark | Status |
|---|---|---|---|---|
| **Real systems bucket pages** (`/products/windows`, `/products/doors`, `/products/specialist`) | `SystemBucket` exists but current routes redirect to query-filtered `/products`; the editorial bucket IA from Tita/competitor research is not actually visible | ~1-2 days | **B17** | Planned |
| **Product-level project galleries and finish visuals** | Competitor research and Tita both point to project photos + finish variation per product, but drawers show mostly one image + swatches | ~2-4 days once assets are selected | **B18** | Planned |
| **Aluminium spec/photo completion** | `/aluminium` exists, but sub-product specs/photos/spec sheets are still placeholders | ~0.5-1 day after Imie data | **B19** | Blocked on Imie |
| **Architect resources surface** for spec sheets/CAD/BIM/downloads | Schüco/Milgard/Pella-style pro sites expose technical resources; FourlinQ cannot credibly do this until real documents exist | ~1-2 days after docs | **B20** | Blocked on assets |
| **3D product open/close** | Tita asked for interactive open/close; this remains a larger signature surface and should not be faked with generic geometry | ~2-4 days once target systems are chosen | **B21** | Deferred |

### P4 — Operational hardening

These reduce production surprises when the CMS/backend is used for real work.

| Item | What it closes | Effort | Benchmark | Status |
|---|---|---|---|---|
| **Backend integration test layer** for products, inquiries, CMS CRUD, media upload, auth roles | Current tests mostly cover static data/hooks; server surfaces are the real risk now | ~1-2 days | **B22** | Planned |
| **Deploy migration guard** | Deploy hardens branch/dirty state but does not prove DB migrations are applied before code expects new columns/tables | ~1 day | **B23** | Planned |
| **Aluminium CMS knowledge sync adapter** | Aluminium CMS declares KB sync tags, but no adapter means updates do not reliably refresh chatbot knowledge | ~0.5-1 day | **B24** | Planned |
| **CI trigger/doc alignment** | CI docs imply broad PR coverage; actual workflow only runs PRs into `main`/`supafinal`, not `cms-rag-multiuser` | ~0.25 day | **B25** | Planned |
| **SMTP credential go-live checklist** | Email code is scaffolded, but sales notifications stay no-op until credentials land | ~15 min after credentials | **B26** | Blocked on credentials |

## Phase 1 — Move product catalog to DB

**Status:** Shipped 2026-05-29 — `/api/products` is now the source of truth on prod. Admin CRUD UI deferred.
**Effort estimate (remaining):** ~1 day for the admin CRUD UI when needed.

### What landed

- ✅ Schema: `product`, `product_finish`, `product_glass`, `product_feature`, `finish`, `glass_type`, `product_type`, `product_category` (all from migration 001).
- ✅ `GET /api/products` + `GET /api/products/:slug` (joined for specs/finishes/glass).
- ✅ Route mounted at `app.use("/api/products", productsRouter)` in `server/index.ts`.
- ✅ `useProducts` hook uses React Query + `/api/products`, with the static catalog as on-error fallback. The site stays renderable if the API ever goes down.
- ✅ Migration 008: `ALTER TABLE product ADD COLUMN youtube_id text` + backfill for Slide & Fold.
- ✅ Migration 009: adds 9 missing `product_type` rows + `specialist` category so all 14 static products map to a real `product_type_id`. Plus GRANT to the app user.
- ✅ `server/scripts/seed-products.ts`: reseeds the `finish` table from `FRAME_FINISHES` (12 rows, 5 solid + 7 wood-grain), clears stale `product_*` rows, reseeds 14 products from `src/data/products.ts`. Idempotent. Run on prod 2026-05-29 — 14/14 inserted, 12 finishes + 3-4 glass options + 4 specs per product, Slide & Fold has the YouTube ID.
- ✅ `USE_API=true` in `useProducts.ts` — the hook now reads from `/api/products` first, static catalog only on error.

### Deferred

- Admin CRUD UI for products. The CMS package's `ContentManager` could host this once `product` is registered as a CMS kind, or a bespoke admin panel.
- React Query revalidation strategy on admin edits (`queryClient.invalidateQueries(["products"])` after mutations).

### Out of scope

- Multi-tenant catalogs.
- Product variants beyond the existing finish/glass dimensions.
- Pricing in the DB (intentional — pricing is custom-quoted).

---

## Phase 2 — Email notifications + rate limiting

**Status:** Scaffolding shipped 2026-05-29. Mailer is wired into all three POST endpoints; rate limiters are live. Notifications will start sending the moment SMTP credentials land in env vars — no further code work needed.
**Effort estimate (remaining):** 0 dev hours. ~15 min to drop credentials into `.env` on the VPS.
**Blocker:** Need either a Gmail app password for `sales@fourlinq.com` OR a Resend API key (free tier). Waiting on Tita's pick.

### Scope

- Pick transport: Resend (recommended — simpler, free 3k/mo) OR nodemailer + Gmail SMTP.
- New `server/lib/mailer.ts` with `sendInquiryNotification(inquiry)` helper. No-op + log warning if credentials missing.
- Wire into `server/routes/inquiries.ts` POST handlers: `/contact`, `/quote-request`, `/save-configuration`. Send-after-DB-insert pattern so a mail failure never loses the lead.
- Email template: plain HTML, lead details (name, email, phone, message, ref ID, timestamp, source page), reply-to set to the inquirer's email so Tita can reply directly.
- `express-rate-limit` on public POST endpoints (1 req/min/IP for contact, 5/hour for quote, 10/min for save-configuration). Protects from spam.
- Env vars: `MAIL_FROM`, `MAIL_TO` (default `sales@fourlinq.com`), `RESEND_API_KEY` OR `SMTP_HOST` + `SMTP_USER` + `SMTP_PASS`.

### Out of scope

- Customer-facing confirmation emails (Phase 5 candidate).
- Drip campaigns or marketing automation.
- BCC chain (Tita asked about BCC/forwarding — direct email to sales@ covers it; we can add a comma-separated `MAIL_BCC` if requested).

---

## Phase 3 — Tighten TypeScript + add CI

**Status:** Shipped 2026-05-29.

### What landed

- New `typecheck` script in `package.json` runs `tsc --build`, which walks project references (`tsconfig.app.json`, `tsconfig.node.json`). Previously the project's bare `tsc --noEmit` did zero work because the root tsconfig has `files: []`. Three real bugs surfaced and fixed: `useRef<HTMLDivElement>` on `<li>` (SystemsTiles), JSX intrinsic narrowing on `HeadingTag` (EyebrowHeading), framer-motion drag-event type collision (Section).
- New `.github/workflows/ci.yml` runs lint + typecheck + test + build on push/PR to main, cms-rag-multiuser, supafinal.

### Deferred

- Flipping `strict: true` and `strictNullChecks: true` on the app tsconfig. The current codebase surfaces zero additional errors at those flags (verified), but the change should ship as its own PR with a `[ci]` label to confirm CI catches regressions cleanly.
**Effort estimate:** 1 day for strict mode, half-day for CI
**Why before bigger changes:** Safety net for everything that follows. Cheap to do, expensive to skip.

### Scope

- Flip `strictNullChecks: true` in [tsconfig.app.json](../tsconfig.app.json) and fix the fallout (expected to be under 50 sites).
- GitHub Action: `lint` + `typecheck` + `test` on every PR.
- Add Vitest tests for the highest-leverage targets first: data hooks, form validators, the configurator state machine.

### Out of scope

- E2E tests (Cypress/Playwright). Defer until a flow breaks in production.
- 100 percent coverage. Aim for confidence on critical paths only.

---

## Phase 4 — Real admin auth

**Status:** Shipped (verified 2026-05-29 — was already built via the `cms-rag` package's `createAuthKit`, just undocumented here).

### What landed

- ✅ Per-user accounts backed by `auth_user` / `profile` / `role` / `permission` tables (migration 001).
- ✅ bcryptjs password hashing (`packages/cms-rag/server/auth.ts`).
- ✅ JWT in httpOnly cookie, configurable secret via `ADMIN_JWT_SECRET`.
- ✅ Role-based access middleware: `requireRole(["admin", "editor", "media"])`. CMS routes already use it.
- ✅ Bootstrap script: `npx tsx server/scripts/create-admin.ts` with `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars (idempotent — re-running updates the password).
- ✅ Admin login UI accepts email + password (`/admin` page).
- ✅ `UsersPanel` in `/admin → Team` for admin role to manage other users.

### Deferred follow-up

- Self-service password reset flow.
- Email-based user invitations (currently users are bootstrapped via the script and added by admin in UsersPanel).

---

## Phase 5 — Move static copy to DB

**Status:** Partial — `/brand` and `/why-upvc` got editable body sections 2026-05-29. Rest deferred.

### What landed

- ✅ Migration 012 seeds `cms_page` rows for `/brand` and `/why-upvc` (body empty by default).
- ✅ New `<PageBody route="..." />` component fetches `cms_page.body` from `/api/cms/pages/:route` and renders markdown into a quietly-styled section between the existing layout and the dark CTA. Empty body = nothing renders, so the page is visually unchanged unless Tita adds prose.
- ✅ React-Markdown renderer maps headings / paragraphs / lists / links / hr into Marvin-style typography so output stays on-brand even if Tita pastes plain markdown.
- ✅ Tita edits content via `/admin → Content → Pages` (already wired pageEntity).

### Out of scope (intentionally — design-locked)

- Homepage video hero, scroll-window 340-frame animation, SystemsTiles per-tile sequences, Brand hero house photo, Why uPVC profile-image hero, FeaturedTextureScroll cross-fade. These are art-directed and must not be CMS-editable.

### Deferred

- Branches list as a CMS-editable table (`branch` rows). Trigger: client opens a new showroom location.
- `site_content` key-value snippets table (for footer copy, contact phone, etc.). Trigger: those values change more than once per quarter.

---

## Phase 6 — Aluminium systems subsection

**Status:** Partial — landing page + nav shipped 2026-05-29, sub-product spec sheets still pending.
**Effort estimate (remaining):** Half a day once Imie supplies brochure photos + specs.
**Trigger:** Tita's note: *"there are two types of windows that we carry: 1. uPVC system, 2. aluminium system (thermal break, non-thermal break, alu slim). these have been mentioned to you when you visited the showrooms."*

### Scope

- ✅ Dedicated landing area at `/aluminium` (own page, parallel to `/products/windows` filter).
- ✅ Nav update: "Aluminium Line" entry in the Systems dropdown.
- ✅ Three sub-products written as cards on the landing page (thermal break, non-thermal break, alu slim) with summary + "best for" guidance.
- ❌ Hero image per sub-product. Currently text-only cards.
- ❌ Spec sheet per sub-product (dimensions, max spans, finishes, glass options).
- ❌ Material comparison table on `/why-upvc` → "See Aluminium systems →" deep link.
- ✅ Hero lede on `/` acknowledges both lines (since 2026-05-25).

### Out of scope

- Pricing tables (custom per project per existing policy).
- Standalone aluminium configurator. The Design Tool can add aluminium options later as a Phase 6.5.

### Blockers

- Brochure-verified product names, dimensions, max spans, and at least one hero photo per sub-product (still needed to complete the page).

---

## Phase 7 — CMS photo upload via admin

**Status:** Shipped (verified 2026-05-29 — was already built via the `cms-rag` package, just undocumented here).

### What landed

- ✅ `POST /api/admin/cms/media/upload` (multer-backed via `packages/cms-rag/server/routes-upload.ts`), accepts JPEG/PNG/WebP/GIF/AVIF/SVG up to 15MB, stores to `/opt/fourlinq/uploads/cms/` on the VPS, writes a `cms_media_asset` row, returns the public path.
- ✅ Static-serve at `app.use("/uploads", express.static(...))` in `server/index.ts`.
- ✅ Admin UI — `MediaLibrary` component (`packages/cms-rag/client/MediaLibrary.tsx`) lives in the Content tab as a sub-panel. Drag-drop, paste-from-clipboard, batch upload, alt-text/tags edit, soft-delete.
- ✅ `MediaPicker` exists to attach existing library images to other CMS entities.

### Deferred follow-up

- `sharp` server-side resize to 1600px wide + 480px thumbnail. Touches the shared `cms-rag` package; ship as its own change with thumbnail-storage strategy decided.

### Out of scope

- CDN integration (Cloudflare Images / Bunny). The VPS can serve the volumes Tita generates.
- Bulk import from Facebook scrape. The existing scrape pipeline still works for those.

---

## Explicitly out of scope (not on the roadmap)

These have been considered and intentionally rejected. Reopen only if the business context changes.

- **i18n / multi-language.** Adds complexity to every component for no current market need.
- **Online payments / checkout.** The lead-capture model is intentional; quotes are custom and human-mediated.
- **Replacing shadcn/ui or restyling.** The current design system is solid and documented.
- **Inventory tracking.** Products are made-to-order, not stocked.

---

## Shipped

### Tita demo round (design + copy pass)
**Shipped:** 2026-05-24 → 2026-05-25
Removed AI-generated surface tells across the site per Tita's explicit feedback. Hero locked at *"Built to Last. Designed to Inspire."* (her exact wording). Page-by-page restraint pass on /why-upvc, /finishes, /brand, /. Mobile drawer rebuilt with red CTA box at top. ScrollWindow gets a stacked mobile layout. Footer mobile density pass. Marquee warranty band on /brand. All invented brand-statement lines stripped or replaced with brochure-verified BRAND values. RESTRAINT.md added at repo root as the external anti-pattern rulebook (no stacked gradients, no italic display words, no numbered eyebrows, no by-the-numbers strips). See CHANGELOG `[Unreleased]` section for the full list.

### Vercel removal
**Shipped:** 2026-05-25
Cut all Vercel surface area (`vercel.json`, `.vercel/`, `api/` directory, `@vercel/node` dep, deploy-script Vercel references). Production runs on advo VPS via `./deploy.sh` → rsync → pm2. The branch-tangle problem that made Vercel deploys serve stale builds (productionBranch pointed at a deleted branch) is gone for good.

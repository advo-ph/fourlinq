# FourlinQ Roadmap

**Last updated: 2026-05-29** (unblocked-items sweep — Phase 1 pipes wired, Phase 3 shipped, Phase 7 confirmed shipped, plus aluminium subsection, hero copy, curtain-wall, Slide & Fold video, mailer scaffolding)

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
| 4 | Auto-email new inquiries to sales@fourlinq.com | Pending (needs SMTP creds) | Phase 2 |
| 5 | CMS lets Tita upload photos directly via /admin | Pending | Phase 7 |
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

## Phase 4 — Real admin auth (conditional)

**Status:** Deferred
**Trigger to revisit:** Client adds a second admin user, or a security review requires per-user audit trails.
**Effort estimate:** 1–2 days

### Scope (when triggered)

- Replace the shared password with per-user accounts (bcrypt for password hashing, JWT unchanged).
- Wire the existing `auth_user`, `role`, and `permission` tables in [server/migrations/001_schema.sql](../server/migrations/001_schema.sql).
- Login page UI swap (email + password instead of password-only).
- Admin UI for inviting and disabling users.

### Why deferred

The shared password works fine for a one-person ops team. Building this now is YAGNI.

---

## Phase 5 — Move static copy + branches to DB

**Status:** Deferred
**Trigger to revisit:** Phase 1 ships and the client demonstrates appetite for self-service content editing, OR copy edit requests start arriving more than once a month.
**Effort estimate:** 1–2 days

### Scope (when triggered)

- `site_content` key-value table for hero, about, why-uPVC, and legal copy.
- `branch` table.
- Admin UI for editing both.

### Why deferred

Copy changes are infrequent today. Premature migration adds maintenance cost without payoff.

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

# Session Handoff

## Current checkpoint — 2026-07-18

- Branch: `feat/rm17-a11y-fixed-layer`; starting HEAD `31e485038aafec791d45f95c249a218df24860b4`.
- Scope: Marvin parity remediation from the 33-row Figma build reference plus a final Design Tool embed/UI pass. No commit, push, migration application, or deployment has been performed.
- Green checkpoints: (1) San Lorenzo `aluminium`/`aluminum` canonical route, CMS-over-fallback project merge, settled unknown-slug redirect, accessible variable-count gallery, and unpublished/incomplete CMS-only project safeguards; (2) truthful Brand/FAQ/chooser/configurator behavior, including server-confirmed-only configuration success, confirmation-only glass, illustrative-dimension caveats, accessible dialog/preview/disclosure state, corrected finish counts, and explicit compatibility/source caveats; (3) source-bounded warranty/care/architect/material/finish/legal/news/project/product/quote/404 content, empty-until-verified product option matrices, fail-closed transactional knowledge seeding, and truthful reel controls/posters; (4) fail-closed viewport/visual/a11y infrastructure plus stacked modal/drawer focus and shared scroll-lock behavior; (5) exact 33-row local parity closure at mobile and desktop; (6) isolated Design Tool embed without global cookie/nav/footer/chat layers, grouped product-family controls, compact responsive preview, honest glass state, and an explicit final review action.
- Verification: `npm run build`, `npm run typecheck`, `npm run lint`, `npm test` (89/89), `npm run qa:viewport`, `npm run qa:a11y`, `npm run qa:visual` (280 screenshots plus a zero-finding `report.json` in `.visual-qa/run-2026-07-18T18-01-02-334Z`), `npm run qa:parity` (33 × 2), and `git diff --check` all exit 0. Unreachable-server and blank/incomplete-shell controls for all three browser runners exit 2; an intentionally drifted rendered-app assertion and an intentionally drifted parity-row contract exit 1.
- Data boundary: production `/api/products` still exposes the pre-remediation catalog. Migration `013_source_bound_public_content.sql` and the bounded knowledge seeder are authored but have not been applied or run. The local list and detail routes ignore historical join rows, which remain recoverable; the seeder deactivates old retrieval before transactionally reconciling the replacement corpus and reactivates only after success.
- Next: independent review, then a separately authorized migration/reseed/deploy sequence with live API, assistant, route-status, and served-bundle proof. Production still has the original defects until that reviewed deployment occurs.

---

## Historical checkpoint — 2026-05-29

The historical record below was last updated at **~14:30 GMT+8** during the backlog-close and deploy-hardening session. The 2026-07-18 checkpoint above supersedes its current-state claims.

---

## Branch state (current)

All three working branches in sync at **`1378871`** (deploy hardening + Phase 5 page body + sharp resize):

- `origin/main` ← FF-merged from supafinal so fresh clones land on the actual codebase (was 150 commits stale)
- `origin/supafinal` ← deploy branch (what `./deploy.sh` ships)
- `origin/cms-rag-multiuser` ← working branch (where day-to-day commits land before merging up)

**Prod is on `1378871`** at https://fourlinq.ph. Verify with `npm run deploy:status` (SSHes + cats `/opt/fourlinq/deployed-from.txt`).

Tell collaborators: `git fetch && git checkout main` to sync.

---

## What was done this session (May 29, ~9 AM → 2 PM)

Theme: **close the backlog**. Phase-by-phase work that had been outstanding from the post-Tita-demo punch list. Outcome: roadmap reconciled with code reality, CMS editable surface expanded with safeguards so Tita can edit without breaking visuals, deploy pipeline hardened with branch guard + audit trail + opt-in pull-based fallback.

### 1. Phase 1 — Product catalog → DB (full cutover) — [server/scripts/seed-products.ts](../server/scripts/seed-products.ts), [src/hooks/useProducts.ts](../src/hooks/useProducts.ts)

- Mounted `/api/products` route (was implemented but unmounted).
- `useProducts` converted to React Query with the static catalog as on-error fallback.
- Migration 008 adds `youtube_id` column + backfills Slide & Fold with Tita's reference video `-8XwIKAtAAc`.
- Migration 009 adds 9 missing `product_type` rows + the `specialist` category so all 14 static products map 1:1.
- `seed-products.ts` cuts the DB seed over to the static catalog — reseeds `finish` from `FRAME_FINISHES` (12 brochure rows), nulls `knowledge_chunk.product_id` FK to allow product DELETE, reseeds 14 products with their finishes / glass / specs joined.
- `USE_API=true` flipped — `/products` reads from DB on prod. Static catalog is the on-error safety net only.
- Bugs caught + fixed during cutover: `product_category_id` is `GENERATED ALWAYS` (switched to slug-JOIN), `product_feature` has separate label + value NOT NULL columns, TRUNCATE requires sequence ownership (switched to DELETE).

### 2. Phase 2 — Mailer + rate limiting (scaffolding) — [server/lib/mailer.ts](../server/lib/mailer.ts), [server/routes/inquiries.ts](../server/routes/inquiries.ts)

- New `mailer.ts` with `sendInquiryNotification()`. No-op + `console.warn` when SMTP credentials missing so dev and pre-credential prod don't fail.
- Plain-HTML email with reply-to set to inquirer so Tita can reply directly. Configurable `MAIL_TO` (default `sales@fourlinq.com`), `MAIL_FROM`, `MAIL_BCC`.
- Wired into `/contact`, `/quote-request`, `/save-configuration` as fire-and-forget after DB insert. Mail failure never breaks the inquiry flow.
- `express-rate-limit`: contact 3/min, quote 10/hr, save-configuration 20/min, all per-IP. Returns 429 with explanatory body on hit.
- **Blocker**: needs `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` in `/opt/fourlinq/.env` (Gmail app password or Resend API key). Goes live the moment they land — no further code work.

### 3. Phase 3 — Typecheck + CI — [package.json](../package.json), [.github/workflows/ci.yml](../.github/workflows/ci.yml)

- New `npm run typecheck` runs `tsc --build` (the previously-used bare `tsc --noEmit` did zero work — root tsconfig has `files: []`).
- 3 real type bugs surfaced and fixed: `useRef<HTMLDivElement>` on a `<li>` in SystemsTiles, JSX intrinsic narrowing on `HeadingTag` in EyebrowHeading collapsing against drei `<Image>` required props, framer-motion `onDrag` type collision in Section.
- `.github/workflows/ci.yml` runs `lint + typecheck + test + build` on push/PR to main, supafinal, cms-rag-multiuser.
- Lint config tightened: excludes vendored shadcn `ui/**` + `packages/cms-rag/**`, allows `require()` in tailwind config, allows explicit `any` in `server/**` (DB row adapters).

### 4. Phase 4 — Confirmed already-shipped (doc cleanup)

- Real admin auth (bcryptjs + JWT in httpOnly cookie + per-user accounts in `auth_user` / `profile` / `role` tables + `server/scripts/create-admin.ts` bootstrap) was already wired via the `cms-rag` package. Roadmap was just stale.

### 5. Phase 5 — Page body to DB (Brand + Why uPVC, MVP) — [src/components/shared/PageBody.tsx](../src/components/shared/PageBody.tsx)

- Migration 012 seeds `cms_page` rows for `/brand` and `/why-upvc` (body empty by default).
- New `<PageBody route="..." />` fetches `cms_page.body` via React Query, renders markdown into a quietly-styled section between the existing layout and the dark CTA. Empty body = renders nothing = page is visually unchanged.
- Custom react-markdown overrides map h1-h3 / p / ul / ol / a / strong / hr to Marvin typography. No `@tailwindcss/typography` dep needed.
- **The homepage hero, scroll-window 340-frame animation, SystemsTiles per-tile sequences, Brand hero photo, and Why uPVC profile-image hero are intentionally NOT editable** — they're art-directed and tied to timed frame sequences. Locked to code by design, documented in the admin banner (see 7 below).

### 6. Phase 6 (partial) — Aluminium subsection + CMS kind — [src/pages/Aluminium.tsx](../src/pages/Aluminium.tsx)

- New `/aluminium` page covering Thermal Break / Non-Thermal Break / Alu Slim. Tita's explicit ask from 2026-05-25: *"there are two types of windows that we carry: 1. uPVC system, 2. aluminium system (thermal break, non-thermal break, alu slim)."*
- Migration 010 creates `cms_aluminium_system` table; registered as the `aluminium` CMS entity with hero image upload + spec sheet URL + display order + published flag.
- Page renders from `/api/cms/aluminium` with the same static array as on-error fallback.
- **Blocker**: per-system spec sheets + hero photos still need Imie's brochure data.

### 7. Phase 7 — Confirmed already-shipped (doc cleanup)

- CMS photo upload (drag-drop, paste, batch, alt-text, soft-delete) was already wired via `MediaLibrary` from `cms-rag`. Roadmap was stale.

### 8. CMS editability gaps (close the rest) — [server/cms-config.ts](../server/cms-config.ts)

- `youtube_id` added to product CMS form. Tita can attach videos to any product.
- Product `finish_labels` / `glass_labels` / `spec_labels` text[] columns (migration 011, backfilled from joins). Route prefers these when populated; falls back to joins when null. Trade-off: lose referential integrity in exchange for one-screen editing.
- `aluminium` CMS kind exposes 8 editable fields.

### 9. CMS safeguards — [src/pages/Admin.tsx](../src/pages/Admin.tsx), [server/routes/products.ts](../server/routes/products.ts), [packages/cms-rag/server/routes-upload.ts](../packages/cms-rag/server/routes-upload.ts)

- **Admin banner** in `/admin → Content` spells out what's editable vs design-locked. Reduces "can I change the scroll thing?" questions.
- **Empty-array fallback** on `/api/products` — Tita blanks a product's finish list → page falls back to original static values for that slug. No empty sections.
- **Upload size cap** 15 MB → 8 MB.
- **Mime allowlist** tightened to JPEG / PNG / WebP / AVIF / GIF — SVG removed (script-injection vector).
- **Sharp post-processing** — resize to 1600px wide if larger, generate 480px-wide thumbnail, EXIF orientation honored, sharp failures non-fatal.
- **Aspect-ratio guard** — reject uploads outside `[0.5, 3.0]` width/height with 400 + explanatory message.

### 10. Deploy hardening — [deploy.sh](../deploy.sh), [scripts/vps-auto-deploy.sh](../scripts/vps-auto-deploy.sh)

- `deploy.sh` refuses to ship from non-canonical branches (`main` / `supafinal` / `cms-rag-multiuser`) or with a dirty working tree. `FORCE_DEPLOY=1` bypasses both (logged as `forced:1`).
- Writes `/opt/fourlinq/deployed-from.txt` after each deploy: SHA, branch, subject, author, timestamp, deployer identity.
- `scripts/vps-auto-deploy.sh` — pull-based deploy for VPS cron (opt-in, not yet enabled). Tracks `origin/main`, rebuilds + restarts pm2 when HEAD moves. Setup steps in the script header.
- `npm run deploy` / `deploy:status` / `deploy:log` helpers.

### 11. Roadmap reconciliation — [docs/ROADMAP.md](./ROADMAP.md)

- Phase 1 + 3 + 7 + Phase 4 flipped from Planned/Deferred to Shipped (4 was already-shipped, just undocumented).
- Phase 5 marked Partial — page-body work landed; static-copy-snippets layer + branches table stay deferred.
- Phase 6 still Partial — page + nav + CMS kind shipped; spec sheets blocked on Imie.

### 12. Tests — [src/test/useProducts.test.ts](../src/test/useProducts.test.ts), [src/test/data-integrity.test.ts](../src/test/data-integrity.test.ts)

- 17 tests pass (was 1). Hook returns full catalog, filters by category, surfaces Slide & Fold youtubeId, returns the fixed casement-door id, errors on unknown slug. Data integrity: ids unique + kebab-case, every product has a known category, image paths under `/images/`, youtube ids match 11-char format, no stale `entrance-door` id, FRAME_FINISHES is 12 (5 solid + 7 wood-grain).

### 13. Misc copy + visual fixes

- Brand hero: *"Custom-made for Philippine homes."* → *"European engineering. Philippine projects."* (Tita: *"made it seem like just a local fabricator... dapat may international feel"*).
- International-feel copy sweep on AuthorityStrip, Warranty, Finishes.
- `/products` Curtain Wall card now spans 2 grid columns (Imie: *"curtain wall should be tall and wide"*).
- `casement-door` id fix — was `entrance-door` with `name: "Casement Door"`.
- Slide & Fold reference video embed renders in product detail panel.
- ConsultationForm Back / Continue buttons get breathing room (`pt-2` → `pt-6 lg:pt-8`).

---

## Honest open-items (carry into next session)

- **SMTP credentials for `/opt/fourlinq/.env`** — Tita to supply. Blocks auto-email to `sales@fourlinq.com`.
- **Pull-based auto-deploy setup** — script is ready but cron + deploy key need provisioning on the VPS.
- **Server-side test coverage** — 17 unit tests don't exercise: mailer behavior with SMTP set, `/api/contact` `/quote-request` `/save-configuration` endpoint shape, `/api/cms/*` CRUD, upload sharp + aspect rejection, PageBody fallback. CI proves nothing about these.
- **Round-2 visual asks** — sliding door photo, french sliding door category, "special designs" photo, photo cleanup, design name corrections — all blocked on Imie supplying the assets / clarifying.
- **Aluminium spec sheets** — Imie's brochure data per system needed.
- **3D interactive on `/products`** — Tita ask, deferred. Three.js or animated SVG, 1-2 day lift.
- **Bundle size at build** — `dist/assets/index-*.js` at 634 kB / 203 kB gzip, over Vite's 500 kB warning. `manualChunks` cleanup before adding more features.

---

## Previous sessions

<details>
<summary>2026-05-24 ~11 PM GMT+8 — Tita demo prep (cms_final branch)</summary>

## Branch state (then-current)

`supafinal` was the deploy branch (Prince merged our `cms_final` into his `redesign-marvin2` and pushed as `origin/supafinal` at HEAD `17510f0`). Our session work (`3d86347`) preserved as an ancestor — no force, no lost commits.

Branch chain at the time:
- `cms_final` `3d86347` ← night-session push (ours)
- `supafinal` `17510f0` ← Prince's merge commit on top of `3d86347`

## What was done this session (May 24, ~9 PM → 11 PM)

Theme: **strip "AI generated" surface tells**, simplify under deadline pressure for Tita's bedtime demo. Tita's relationship is at-risk; the brief was *"ship over discuss."*

### 1. RESTRAINT.md — external design rulebook ([RESTRAINT.md](../RESTRAINT.md))
- Net-new doc at the repo root. Negative-space companion to `DESIGN.md`: lists the things forbidden because they read as AI-generated (stacked gradients, italic display words inside serif headlines, scroll cues, Ken-Burns hero zoom, numbered eyebrows, hairline-flanked centered text, "by the numbers" stat strips, `border-2`, custom `@keyframes` in page files, ScrollReveal on every block). 10-question pre-ship self-check. Reference brands: marvin.com, apple.com/mac.

### 2. /why-upvc full rewrite — [src/pages/WhyUpvc.tsx](../src/pages/WhyUpvc.tsx)
- Cut 10 sections → 6. White canvas + one dark CTA. Two layout patterns total (hero+feature, 3×2 photo grid) — repetition IS the design.
- Removed: dual-gradient hero, italic "uPVC", slow-zoom keyframes, scroll cue, dark stat strip, hairline-flanked quote, all `01 · / 02 ·` numbered eyebrows, the "Default" badge with `border-2` accent on the materials card.
- Materials table iterated heavily on user direction. Final state: 4-col hairline table; **uPVC column = white canvas bg, ink-primary hairline left/right borders, larger serif header, bold ink-primary body text. Header reads `uPV` + red `C`.** Aluminum + Timber columns flat secondary ink, regular weight.

### 3. /finishes simplified to display-only — [src/pages/Finishes.tsx](../src/pages/Finishes.tsx)
- Per user: *"can u just show the finishes there but no more changing of stuff there."*
- Removed the interactive scene preview, filter tabs, "Tap a finish" headline. Now: 12 swatches in a 6×2 grid, captioned, no interactivity. Provenance + CTA sections preserved.

### 4. /brand warranty band — [src/pages/Brand.tsx](../src/pages/Brand.tsx)
- Replaced the top story-grid's duplicate "10-Year Warranty / Covering corrosion resistance…" card with a Showrooms card ("Manila and Cebu."). The warranty story now lives exclusively in the dark band below.
- Dark band rebuilt as a thin `size="sm"` editorial moment: serif "10" up to 9rem inline with red "YEAR WARRANTY." caption beside it on the same baseline. Promise prose sits quietly in white/65. Below: full-bleed marquee scroll band of warranty-scope items (Corrosion resistance · Long-lasting performance · Weather resistance · Sound insulation), separated by red `·` dots, list duplicated in markup for a seamless loop.
- Marquee keyframe added to [src/index.css](../src/index.css) as `.animate-marquee` (28s linear infinite). Honors `prefers-reduced-motion`.
- Copy overridden locally (not via `BRAND.promise`): *"Built to last in Philippine conditions. Backed by FourlinQ in writing."* Replaces brochure-verified `"A Lifetime of Satisfaction and Peace of Mind."` which contradicts the 10-year warranty next to it.

### 5. Nav CTA: "Visit a Showroom" → "Book a Consultation" — [src/components/layout/QuietNavbar.tsx](../src/components/layout/QuietNavbar.tsx)
- Desktop + mobile drawer. Points at `/brand#contact` (ConsultationForm). Lead capture beats a drive-to-showroom ask as the primary CTA.
- Showroom link stays in footer as secondary.

### 6. ConsultationForm notes textarea → boxed input — [src/components/shared/ConsultationForm.tsx](../src/components/shared/ConsultationForm.tsx)
- The underline-only style worked for inputs but the textarea read as floating prose. Now 1px hairline border + `canvas-soft` background + white-on-focus.

### 7. Merge + push
- Committed local DesignTool + CMS/chat WIP in two snapshot commits before merging `origin/cms_final` (Prince's `redesign-marvin2` work). One merge conflict on `Index.tsx` (Prince's FinishExplorer-in-place-of-DesignToolPreview ordering vs local) — resolved keeping the local ordering: SystemsTiles → ProjectReels → DesignToolPreview → InspirationStrip.
- Fast-forward push to `cms_final`: `9b69459` → `3d86347`. Vercel rebuild triggered.

---

## What is NOT done / needs attention

1. **DesignTool 500 on `/api/analytics` POST** in local dev — non-blocking telemetry. Page renders fine. Production has the real backend so it won't 500 there.
2. **`RESTRAINT.md` not cross-linked from `DESIGN.md` / `CLAUDE.md`** — future sessions need to be told about it manually until that link exists.
3. **`EyebrowHeading` primitive still adds `before:content-['']` hairline prefix** to left-aligned eyebrows — violates RESTRAINT.md but used across many pages. Ripple fix is a separate batch.
4. **`BRAND.promise = "A Lifetime of Satisfaction and Peace of Mind."`** in `src/data/fourlinq-data.ts` is brochure-verified and still rendered by any page that uses it. Only the /brand warranty band overrides locally. A sitewide rewrite needs client sign-off.
5. **Vercel preview verification of the marquee** — confirmed in localhost screenshots but not on the deployed URL yet. Give Vercel 1–3 min after the push then check.

---

## Previous session — 2026-05-24 ~4:40 PM (Prince's `redesign-marvin2` initial push)

> Branch state below describes Prince's pre-merge state. Everything below has since been committed and merged into `cms_final` along with the night-session work above.

### Prior branch state

Branch `redesign-marvin2` is based on a merge of `upstream/redesign-marvin` into a local fork. There are **uncommitted changes** across ~15 source files and 3 video files. Nothing has been pushed yet.

---

## What was done this session (May 24)

### 1. ScrollWindow — removed scroll lock
- `src/components/home/ScrollWindow.tsx`: removed the body scroll-locking behavior so the page scrolls normally while the window animation plays.

### 2. ProjectReels — fixed frozen video playback
- `src/components/home/ProjectReels.tsx`: videos were not autoplaying. Fixed with IntersectionObserver-based play/pause and explicit `video.load()` call.
- `public/videos/reels/reel-1.mp4`, `reel-2.mp4`, `reel-3.mp4`: re-encoded with ffmpeg fast-start (`-movflags +faststart`) and ~94% smaller file sizes.

### 3. SystemsTiles — copy rewrite (kept structure)
- Rewrote section heading to "Products / Collections." with concrete body copy.
- Added `FeatureLink` to "/why-upvc".
- Removed the "Every system, eleven ways" finishes teaser block (finishes content moved to the 3D viewer section in Index.tsx).
- Uses **scroll-based frame animations** — each tile's 53-frame sequence at `/images/systems/{window,door,specialist}/` advances as the tile travels through the viewport. Frames are preloaded via `useFramePreloader` with IntersectionObserver lazy-loading. NOT auto-looping.

### 4. InspirationStrip — intro frame animation (scroll-based, one-time)
- Renamed section from "Inspiration" to "Our Projects" throughout nav and homepage.
- `src/components/home/InspirationStrip.tsx`: added a 53-frame intro animation at top of section. Uses `useFramePreloader` to load `/images/reels-intro/frame-{index}.jpg`. Plays once on scroll trigger (idle → playing → done), does NOT reverse on scroll-up.
- After animation completes, shows a grid of project cards from `projects` data.
- Section is removed from `<Section>` wrapper in Index.tsx to control its own padding.

### 5. Navigation — "Our Projects" rename + dropdown fix
- `src/components/layout/QuietNavbar.tsx`: renamed "Inspiration" link to "Our Projects". Fixed Systems dropdown hover interaction — child links were unclickable because the dropdown closed on mouseLeave prematurely. Added proper hover zones.

### 6. useScrollFrames — reliability fixes
- `src/hooks/useScrollFrames.ts`: added `isFinite`/null/zero-division guards. Replaced aggressive catch-up speed (20% of delta) with phase-aware stepping (max 1 frame/tick within a phase, accelerates only across phase boundaries). Prevents crashes and speed issues.

### 7. Finishes — texture migration
- `src/data/fourlinq-data.ts`: rebuilt `FRAME_FINISHES` array. Added "Silica Cream" solid color. Replaced placeholder wood finish entries with real texture image paths from `/images/finishes/textures/`.
- `src/data/configurator.ts`, `src/pages/DesignTool.tsx`, `src/components/configurator/WindowPreview.tsx`, `src/components/3d/Window3D.tsx`: updated default finish ID from `"white"` to `"silica-cream"`.
- `src/pages/Finishes.tsx`: updated editorial descriptions for each finish.

### 8. WhatsNew — layout adjustment
- `src/components/home/WhatsNew.tsx`: minor layout/copy changes.

---

## What is NOT done / needs attention

1. **SystemsTiles** — scroll-based frame animations are active using 53-frame sequences. Scroll formula tuned so the animation fully opens when the tile center reaches the viewport center (not earlier).
2. **InspirationStrip intro animation** — works but may need tuning for timing/speed on different viewport sizes.
3. **Video assets** — the 3 reel videos were re-encoded smaller. Original large files are gone from working tree (overwritten). If originals are needed, they're recoverable from git history.
4. **No commits made this session** — all changes are uncommitted. Review before committing.

---

## Key architecture notes

| Component | File | What it does |
|---|---|---|
| ScrollWindow | `src/components/home/ScrollWindow.tsx` | Scroll-driven 3D window open/close animation (uses `useScrollFrames`) |
| useScrollFrames | `src/hooks/useScrollFrames.ts` | Hook that maps scroll position to frame index across multiple phases |
| InspirationStrip | `src/components/home/InspirationStrip.tsx` | "Our Projects" section with optional intro frame animation + project grid |
| ProjectReels | `src/components/home/ProjectReels.tsx` | Horizontal video reel cards with autoplay |
| SystemsTiles | `src/components/home/SystemsTiles.tsx` | 3-column product category tiles (static images) |
| useFramePreloader | `src/hooks/useFramePreloader.ts` | Preloads numbered image sequences into `HTMLImageElement[]` |

---

## Home page section order (Index.tsx)

1. VideoHero — fullscreen video with fallback photo carousel
2. ScrollWindow — scroll-driven window animation (lazy)
3. SystemsTiles — product categories (Section tone="soft")
4. ProjectReels — video reels
5. 3D Window + Finishes — interactive 3D configurator (Section tone="canvas")
6. InspirationStrip — "Our Projects" gallery
7. WhatsNew — news/updates
8. BrandCTA — dark CTA

---

## Rules for future sessions

- **Do not add features that weren't requested.** If unused assets exist, note them but don't wire them up without being asked.
- **Do not change copy** without running it through the /writenobs skill or checking with the user.
- **Scroll-based animations for SystemsTiles** — frames advance with scroll position, fully open at viewport center. Don't change to auto-looping or static images.
- **Update this file** at the end of every session with what changed and what's pending.

</details>

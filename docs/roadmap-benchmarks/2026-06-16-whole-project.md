# Whole-project roadmap benchmarks — 2026-06-16

Every roadmap row in `docs/ROADMAP.md` points here. A row is not considered shippable until its benchmark has a concrete pass/fail result.

## Discovery Summary

- **Project signals:** current code, docs, dirty working tree, local browser screenshots/user feedback, and three read-only subagent audits.
- **Competitor signals:** existing Marvin/Schuco/Milgard/Pella/Andersen/Vitrocsa research under `docs/competitor-*` and `docs/references/design-systems/*`.
- **External pass:** bounded web/GitHub discovery was used only to validate the direction already visible in local competitor docs: premium window/door sites pair editorial photography with technical resource surfaces for architects/professionals. It did not justify cloning any one competitor or importing a generic configurator repo.

## Benchmarks

### B1 — Viewport visual QA gate

Run Playwright against `/`, `/products?filter=specialist`, `/brand`, and `/whats-new` at `375x667`, `560x720`, `768x1024`, `992x768`, `1100x800`, `1199x900`, and `1440x900`.

Pass iff:
- `document.documentElement.scrollWidth <= window.innerWidth` on every route/viewport.
- Hero heading, lede, CTAs, nav, footer, and chat button bounding boxes do not overlap.
- Footer brand/contact/social content stays visually aligned: left identity block, right contact block on tablet/desktop; readable single-column stack on phone.
- Screenshots are saved for review and diffable between runs.

### B2 — Fixed-layer collision policy

With fresh `localStorage`, render the cookie banner and chat button on `/` and the footer on `/brand`.

Pass iff:
- Chat, cookie actions, footer Instagram/Facebook links, and mobile hamburger all have non-intersecting bounding boxes at `375`, `390`, `430`, `560`, and `768px`.
- Every fixed element remains clickable by Playwright.
- Opening the chat panel does not hide cookie accept/decline controls.

### B3 — Docs reality sync

Pass iff:
- `rg "Vercel|15MB|15 MB|SVG|no code changes yet|ADMIN_PASSWORD|redesign-marvin" README.md docs` returns only historical sections explicitly marked as historical.
- `docs/FIX_ROADMAP.md` rows that are shipped/stale are either checked off, moved to a shipped note, or linked to this roadmap refresh.
- `docs/BACKEND_SCHEMA.md` reflects real per-user auth and the current upload policy.

### B4 — Design-token truth table

Pass iff:
- One source-of-truth doc names the active FourlinQ identity: charcoal/white, FourlinQ red, current serif/sans stack, button radius, and logo exception rules.
- `theme.config.ts`, `tailwind.config.ts`, `src/index.css`, and `src/components/shared/Logo.tsx` either match that table or document an intentional exception.
- No new one-off red hexes appear outside the exception list.

### B5 — Admin media upload truthfulness

Pass iff:
- Media UI copy says JPEG, PNG, WebP, GIF, AVIF and 8 MB.
- SVG upload and 12 MB JPEG upload both show visible UI errors.
- A valid large JPEG is resized and gets a thumbnail, or the UI explains if processing falls back to original.

### B6 — Product detail API parity

Using a test DB or mocked pool, seed one product with edited `spec_labels`, `glass_labels`, and `finish_labels` that differ from join-table rows.

Pass iff:
- `GET /api/products` and `GET /api/products/:slug` return identical specs, glass options, finishes, and `youtubeId`.
- Empty editable arrays fall back to static catalog values on both endpoints.

### B7 — Hardcoded internal route audit

Pass iff:
- A script extracts internal paths from chat page maps, knowledge seeding, nav/footer links, and static data.
- Every path either matches a React Router route, redirects intentionally, or is listed in a documented allowlist.
- `/window-systems`, `/door-systems`, and `/specialist-systems` do not 404 silently.

### B8 — Design Tool save failure state

Mock `/api/save-configuration` as `500`, network failure, and success.

Pass iff:
- Failure states do not say the sales team received the configuration.
- The user gets a visible retry or "saved locally only" state.
- Success still tracks the existing inquiry path.

### B9 — CMS page-field clarity

Pass iff either:
- Admin `cms_page` hero fields are hidden/read-only when they do not affect public pages, or
- Editing `hero_heading`/`hero_subheading` in admin visibly changes `/brand` and `/why-upvc`.

### B10 — Finish-count consistency

Pass iff:
- `FRAME_FINISHES.length`, configurator options, finish page display count, warranty copy, and product copy agree on one number.
- `rg "11 finishes|eleven finishes|12 finishes|twelve finishes" src docs` has no contradictory active copy.

### B11 — Unverified numeric-claim sweep

Pass iff:
- Every numeric performance claim in `src/pages` and `src/data` has a local citation/comment pointing to brochure/client source, or it is removed/rephrased.
- The sweep includes percentages, decibel claims, years, locations/showroom counts, warranty terms, and span/width claims.

### B12 — Hero first-paint and CTA decision

Pass iff:
- The homepage hero has an explicit poster or intentional no-poster decision that avoids black flash in Playwright screenshot at first paint.
- CTA hierarchy is documented: one primary plus either one secondary button or one tertiary text link.
- At `375`, `768`, `992`, and `1440px`, hero content sits in the chosen composition without overlapping nav/chat.
- Under mobile data-saver emulation, the hero does not preload a large video before a usable still is visible.

### B13 — Tablet nav and mega-menu keyboard support

Pass iff:
- At `992`, `1100`, and `1199px`, desktop nav does not wrap or overflow.
- Keyboard-only users can tab to Systems, open child links, activate all children, and close the menu with Escape or blur.
- `aria-haspopup` and `aria-expanded` reflect menu state.

### B14 — Reduced-motion and data-budget path

Pass iff:
- With `prefers-reduced-motion: reduce`, hero video/frame sequence animations do not run, and the page remains visually complete with still images.
- Before first scroll on Fast 3G/mobile emulation, transferred bytes stay under an agreed budget documented in the test.
- Frame preloading begins only when the relevant section is near viewport.

### B15 — Home Design Tool preview restraint pass

Pass iff:
- Home editorial sections do not use generic `rounded-xl`, nested cards, or default `shadow-sm` chrome unless listed as an intentional exception.
- At `375px`, the design preview does not force horizontal scroll and does not exceed the agreed viewport-height cap.

### B16 — Homepage What's New rule

Pass iff either:
- Home shows the three most recent `whatsNew` entries across product/project/event/press/insight, or
- The filtering rule is documented and tested, and hidden categories are intentional.

### B17 — Real systems bucket pages

Pass iff:
- `/products/windows`, `/products/doors`, and `/products/specialist` render editorial bucket pages, not query redirects.
- Each page has bucket intro copy, relevant systems, and a route-level smoke screenshot.

### B18 — Product-level project galleries and finish visuals

Pass iff:
- Each product drawer/detail has at least three verified project photos or an explicit blocked-by-assets state.
- Finish visuals are not just color dots: each system has either a render/photo variant per finish or a documented fallback.

### B19 — Aluminium spec/photo completion

Pass iff:
- Thermal Break, Non-Thermal Break, and Alu Slim each have verified hero photo, summary, best-for, dimensions/max-span/spec data, and spec sheet link if available.
- Missing client data remains marked blocked, not filled with invented specs.

### B20 — Architect resources surface

Pass iff:
- `/for-architects` exposes only real downloads: spec sheets, CAD/BIM/installation PDFs, or a clear "request technical pack" path.
- No fake CAD/BIM links or placeholder resource cards ship.

### B21 — 3D product open/close

Pass iff:
- One selected system has a demonstrable open/close interaction with verified geometry or a clearly stylized prototype label.
- Desktop and mobile screenshots prove the 3D/canvas surface is visible, interactive, and nonblank.
- The implementation does not increase initial homepage bundle beyond the budget without code splitting.

### B22 — Backend integration test layer

Pass iff CI covers:
- `/api/products` list/detail parity.
- Inquiry POST validation/rate-limit behavior.
- CMS CRUD auth/role boundaries.
- Media upload MIME/size/aspect policy.
- Anonymous protected writes fail.

### B23 — Deploy migration guard

Pass iff:
- Deploy either runs migrations idempotently or fails early with a clear "migration required" message naming missing migrations/columns.
- A fresh DB smoke proves required tables and columns for current code exist.

### B24 — Aluminium CMS knowledge sync adapter

Pass iff:
- Updating an aluminium CMS row creates/updates an active `knowledge_chunk` with `cms://aluminium/{id}`.
- No "No KB adapter registered" message appears for aluminium updates.

### B25 — CI trigger/doc alignment

Pass iff:
- CI either runs for PRs targeting `cms-rag-multiuser`, or docs explicitly say it runs only for pushes to that branch.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` remain the required gate.

### B26 — SMTP credential go-live checklist

Pass iff:
- `.env` on production has required SMTP vars or the docs name the exact no-op state.
- A test inquiry reaches `MAIL_TO`, preserves reply-to, and stores the DB inquiry even if mail send fails.

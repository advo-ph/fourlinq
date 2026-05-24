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

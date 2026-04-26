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

### Fixed
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

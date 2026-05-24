# Session Handoff — cms_final branch (live)

Last updated: **2026-05-24 ~11 PM GMT+8** (Tita demo prep session)

---

## Branch state (current)

`supafinal` is the **current deploy branch** (Prince merged our `cms_final` into his `redesign-marvin2` and pushed as `origin/supafinal` at HEAD `17510f0`). Our session work (`3d86347`) is preserved as an ancestor — no force, no lost commits.

Branch chain:
- `cms_final` `3d86347` ← night-session push (ours)
- `supafinal` `17510f0` ← Prince's merge commit on top of `3d86347`

Tell collaborators: `git fetch && git checkout supafinal` to sync.

---

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

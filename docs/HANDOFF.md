# Session Handoff — redesign-marvin2 branch

Last updated: **2026-05-24 ~4:40 PM GMT+8**

---

## Branch state

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

# ScrollWindow Homepage Performance Fix
**Plan:** scrollwindow-load-perf_PLAN_08-09-26.md  
**Date:** 2026-09-08  
**Complexity:** SIMPLE (two independently executable parts; Part 2 is asset-pipeline work, not a multi-phase program)  
**Status:** READY FOR EXECUTE

---

## Overview

The homepage "Engineered / Systems that Last Forever." section renders as an empty gap for several seconds after the rest of the page has painted. Five root causes were confirmed during diagnosis:

1. `useFramePreloader.ts:23` — `batchSize = 50` fires 50 concurrent `new Image()` requests, starving the poster frame.
2. `ScrollWindow.tsx:127–141` — `IntersectionObserver` with `rootMargin: "300px"` triggers while the user is still on the hero, competing with `/videos/hero-loop.mp4`.
3. `Index.tsx:50` — `<Suspense fallback={null}>` creates a zero-height hole until the lazy chunk loads.
4. `index.html` — no `<link rel="preload">` for `frame_0001.webp`.
5. `ScrollWindow.tsx:768` — `part2-alu.webp` (1.0 MB) is mounted as soon as `nearViewport` is true, adding contention.

The fix is split into two parts:
- **Part 1:** Code changes only — loading order, placeholder, poster preload, alu still gating.
- **Part 2:** Asset pipeline — re-encode the 186-frame sequence at two breakpoint sizes, create new directories (to beat stale-while-revalidate), update code references, archive the 1920px originals.

---

## Goals

- Poster frame (`frame_0001.webp`) paints within 500 ms of page load on a typical 4G connection.
- No layout shift (zero CLS contribution) from the `<Suspense>` fallback.
- The 6.5 MB 1920px set is not deployed to production.
- Scroll-scrub animation smoothness is not regressed on desktop (frames must be arriving before the user can scroll into the section).
- The aluminium still is not fetched until the thermal part is actually active.

---

## Scope

### In scope
- `index.html` — poster preload link.
- `src/hooks/useFramePreloader.ts` — batch size, priority, deferred start, poster-first logic.
- `src/pages/Index.tsx` — `<Suspense>` placeholder.
- `src/components/home/ScrollWindow.tsx` — alu still render gate.
- `src/data/scroll-window-phases.ts` — `FRAME_PATH_TEMPLATE` and still image paths updated to point at new directories.
- `scripts/encode-scroll-frames.sh` (new) — reproducible re-encode script.
- `public/images/scroll-window-1280/` (new) — desktop frame set.
- `public/images/scroll-window-720/` (new) — mobile frame set.
- `public/images/scroll-window-stills-1280/` (new) — desktop stills.
- `public/images/scroll-window-stills-720/` (new) — mobile stills.
- `assets/source-frames/scroll-window-webp/` (new archive location) — the original 1920px frames moved here.
- `assets/source-frames/scroll-window-stills/` (new archive location) — the original 1920px stills moved here.

### Out of scope
- Changes to `useSegmentedFrames.ts` or the animation playback engine.
- Changes to the mobile swipe engine.
- Any server-side or CDN configuration.

---

## Touchpoints (every file that changes and what changes)

| File | Change |
|---|---|
| `index.html` | Add two `<link rel="preload">` tags (desktop + mobile poster) with `media` queries and `fetchpriority="high"` |
| `src/hooks/useFramePreloader.ts` | Add `posterPath` option; load frame 1 first and flip `isLoaded` from that; defer batch with `requestIdleCallback`/`window` load fallback; reduce default `batchSize` 50 → 12; set `fetchPriority = "low"` on batch images; preserve 4 s hard timeout |
| `src/pages/Index.tsx:50` | Replace `fallback={null}` with a sized placeholder `<div>` matching the section's minimum height |
| `src/components/home/ScrollWindow.tsx:768–780` | Change render gate from `nearViewport` to `thermalActive` (i.e. `effectiveActive === THERMAL_INDEX`) for the alu still `<img>`, giving the image lead time to download before the cross-fade begins |
| `src/data/scroll-window-phases.ts` | Update `FRAME_PATH_TEMPLATE` to use responsive paths (desktop: `/images/scroll-window-1280/frame_{index}.webp`, mobile: `/images/scroll-window-720/frame_{index}.webp`); update `WINDOW_MATERIALS[].image` paths to new stills directories |
| `scripts/encode-scroll-frames.sh` (new) | Reproducible shell script to produce both frame sets and both stills sets from the archived 1920px originals using `cwebp` |
| `public/images/scroll-window-1280/` (new) | 186 re-encoded WebP frames at 1280×720 |
| `public/images/scroll-window-720/` (new) | 186 re-encoded WebP frames at 720×405 |
| `public/images/scroll-window-stills-1280/` (new) | `part2-upvc.webp`, `part2-alu.webp` at 1280×720 |
| `public/images/scroll-window-stills-720/` (new) | `part2-upvc.webp`, `part2-alu.webp` at 720×405 |
| `assets/source-frames/scroll-window-webp/` (new, git-tracked) | Original 1920×1080 frames moved from `public/` (removed from build output) |
| `assets/source-frames/scroll-window-stills/` (new, git-tracked) | Original 1920px stills moved from `public/` |

---

## Public Contracts

- `FRAME_PATH_TEMPLATE` in `scroll-window-phases.ts` is consumed only by `useFramePreloader` via `buildPath`. No other runtime code imports it. Changing it is safe as long as the new directories exist at build time.
- `WINDOW_MATERIALS[].image` is consumed only by `ScrollWindow.tsx` (via `ALU_IMAGE` constant at line 54 and `activeMaterial.image` for the uPVC still). Safe to update.
- The `useFramePreloader` public interface (`{ images, progress, isLoaded }`) does not change — callers are unaffected.
- The `<ScrollWindow>` component's external API (no props) does not change.

---

## Blast Radius

- `scroll-window-webp` path is referenced in exactly one place: `src/data/scroll-window-phases.ts:10`. Confirmed by grep — no other source files, no index.html references, no script files reference this path.
- `scroll-window-stills` paths are referenced only in `src/data/scroll-window-phases.ts:128,139`.
- Moving the 1920px originals out of `public/` removes them from the Vite build output entirely. No other build scripts reference `public/images/scroll-window-webp/` (verified: `prebuild` script calls `generate-project-thumbs.mjs` and `generate-anim-versions.mjs` — neither references this directory).
- `useFramePreloader` is imported only by `ScrollWindow.tsx`. Default `batchSize` change is safe; the component passes no `batchSize` override (line 673 confirms only `enabled` and `padLength` are passed).

---

## Before / After Byte Budget

| Asset | Before | After (desktop, 1280px) | After (mobile, 720px) |
|---|---|---|---|
| Frame sequence (186 frames) | 6.2 MB (1920×1080) | ~2.8 MB estimated | ~0.9 MB estimated |
| `part2-upvc.webp` | 984 KB (1920px) | ~440 KB estimated | ~140 KB estimated |
| `part2-alu.webp` | 1.0 MB (1920px) | ~440 KB estimated | ~140 KB estimated |
| **Total frames + stills** | **8.1 MB** | **~3.7 MB** | **~1.2 MB** |

Estimates use area-ratio scaling (1280×720 / 1920×1080 = 0.444; 720×405 / 1920×1080 = 0.141) at equivalent WebP quality. Actual output may vary ±15% depending on frame content complexity. The encode script should be run and actual sizes recorded before the plan is marked complete.

The 1920px originals (6.2 MB frames + 2.0 MB stills = 8.1 MB) are removed from `public/` and therefore from the Vite build output. They remain in `assets/source-frames/` in the repo for future re-encodes.

---

## Risks

### Mobile quality trade-off (document this prominently)
The mobile media box uses `aspect-[4/3]` with `object-cover` on a 16:9 source. At a typical mobile width of 390 CSS px and DPR 3, the device pixel demand is 390 × 3 = 1170 px — well above the 720 px frame width. The 720px mobile set is a **deliberate quality-for-bandwidth trade**: the animation will appear slightly soft on high-DPR phones. If the client finds the result unacceptable on device, the breakpoint for mobile/desktop selection can be raised (e.g. use 1280px frames for both and add a future 480px set for narrow phones), or the mobile set can be encoded at 900px. This decision is explicitly deferred and must be re-evaluated after on-device QA.

### `requestIdleCallback` browser support
`requestIdleCallback` is not available in Safari. The implementation must use a bounded timeout fallback: if `requestIdleCallback` is not available, fall back to `setTimeout(fn, 0)` after `window` load event. This is already the standard pattern and must be explicit in code.

### Suspense placeholder height
The placeholder must not introduce its own layout shift. It must match the section's minimum rendered height. The desktop scroll track height is `PART0_VH + PANEL_VH * 3 + TRAILING_VH = 78 + 198 + 40 = 316vh`. The mobile track is `2.6 * 100lvh`. The placeholder should use `min-h-[316vh] lg:min-h-[316vh] max-lg:min-h-[260lvh]` (conservative underestimate is safer than overestimate for CLS — it will expand to content once hydrated). The `bg-[color:var(--canvas)]` background must be applied to prevent a white flash.

### Hard timeout interaction
The existing 4 s hard timeout fires `setIsLoaded(true)` regardless of load state. The new poster-first approach means `isLoaded` will flip very quickly (as soon as frame 1 loads, typically < 200 ms on fast connections). The hard timeout remains as a safety net for the batch — it is unchanged.

### Alu still cross-fade timing
`thermalSettled` is `thermalActive && settled` — it becomes true at the exact instant the 500 ms `opacity-100` cross-fade is supposed to start. Mounting the `<img>` at that same instant means the network fetch starts when the element should already be painted, producing a blank or hard pop instead of a smooth fade.

The mount gate must therefore be `thermalActive` (i.e. `effectiveActive === THERMAL_INDEX`), not `thermalSettled`. `thermalActive` fires when the animation engine first commits to the thermal part, before `settled` flips — giving the browser the full animation-settle window (typically 300–600 ms depending on scroll speed) to fetch and decode the image before the `opacity-100` class is applied. The `opacity`/cross-fade logic driven by `thermalSettled && material === "alu"` inside the block is unchanged; only the outer mount condition changes.

Verification: in the DevTools Network waterfall, `part2-alu.webp` must have its response end timestamp earlier than the moment `thermalSettled` first becomes true (observable as the frame number stopping its advance in the `?fqdebug` HUD). If the response end falls after `thermalSettled`, the lead time is insufficient and the mount gate should be moved one part earlier to `effectiveActive >= THERMAL_INDEX - 1` (i.e. when the weather part is active).

### uPVC still mount timing
The uPVC still (`activeMaterial.image`) is passed as a prop into `PhaseCalloutMarkers` and `PhaseCalloutLines`, both of which are only mounted when the thermal part is active. The uPVC still does not have a separately gated `<img>` element at the top of the JSX tree — it is fetched naturally as part of those child components' render. This means it is already deferred to the thermal part and does not share the alu still's mount-timing problem. No change to uPVC still gating is required.

### Git history for moved files
Moving the 1920px originals from `public/images/scroll-window-webp/` to `assets/source-frames/scroll-window-webp/` using `git mv` preserves history. The plan calls for `git mv`, not a copy-delete. If git detects a rename correctly, history is preserved.

---

## Implementation Checklist

### Part 1 — Code changes (no asset pipeline work required first)

**Step 1: Update `useFramePreloader.ts` — poster-first load, deferred batch, low priority**

File: `src/hooks/useFramePreloader.ts`

Changes:
- Add `posterPath?: string` to `UseFramePreloaderOptions`.
- Add `deferBatch?: boolean` to options (default `true`).
- In the `useEffect`: before starting `loadBatch(0)`, if `posterPath` is provided, create a dedicated `new Image()` for it with no `fetchPriority` override (browser treats it as normal priority). On its `onload`, flip `isLoaded = true` immediately (treat the poster as the "ready" signal independent of `readyThreshold`). Then start the batch.
- If `posterPath` is not provided, keep existing behaviour (batch starts immediately, `readyThreshold` governs `isLoaded`).
- Change default `batchSize` from `50` to `12` in the destructuring at line 23.
- In `loadBatch`, assign `img.fetchPriority = "low"` on each batch image element (note: this is a DOM property, not an HTML attribute — assign after `new Image()`).
- Defer the `loadBatch(0)` call: wrap it so it executes after the `window` `load` event fires (or immediately if `document.readyState === "complete"`). If `requestIdleCallback` is available, further defer inside a `requestIdleCallback` with `timeout: 2000`. If not, use `setTimeout(fn, 0)` inside the load handler.
- Preserve: the 4 s `hardTimeout` still fires unconditionally on mount (before batch start) — it covers the case where the page is slow and nothing has loaded.
- Preserve: the `loadBatch` recursive batch structure, `imagesRef`, `progress` state, `onerror` fallback.

**Step 2: Update `ScrollWindow.tsx:670–674` — pass `POSTER` as `posterPath`**

File: `src/components/home/ScrollWindow.tsx`

Change at line 670–674:
```
const { images, progress, isLoaded } = useFramePreloader(
  TOTAL_FRAMES,
  FRAME_PATH_TEMPLATE,
  { enabled: nearViewport, padLength: FRAME_PAD_LENGTH, posterPath: POSTER },
);
```
Note: `POSTER` is already defined at line 53 as `FRAME_PATH_TEMPLATE.replace("{index}", "0001")`. After Part 2 updates `FRAME_PATH_TEMPLATE` to be responsive, `POSTER` will automatically resolve to the correct breakpoint poster. During Part 1 (before Part 2), `POSTER` still points to the 1920px frame — that is acceptable for Part 1 testing.

**Step 3: Update `ScrollWindow.tsx:768` — gate alu still on `thermalActive`**

File: `src/components/home/ScrollWindow.tsx`

Change line 768 from:
```
{nearViewport && (
```
to:
```
{thermalActive && (
```

Rationale: `thermalActive` is `effectiveActive === THERMAL_INDEX` (line 682). It becomes true the moment the animation engine commits to the thermal part, before `settled` flips. This gives the browser the full animation-settle window to fetch and decode `part2-alu.webp` before the `opacity-100` class is applied by the `thermalSettled && material === "alu"` expression inside the block.

Do NOT use `thermalSettled` as the mount gate. `thermalSettled` is `thermalActive && settled` (line 683) — it becomes true at the exact instant the cross-fade opacity transition is supposed to start. Mounting the `<img>` at that moment means the network fetch starts when the element should already be painted, producing a blank or hard pop instead of a smooth 500 ms fade. Using `thermalActive` as the mount gate while keeping `thermalSettled && material === "alu"` as the opacity condition is the correct split.

The `matFade` / `material === "alu"` opacity logic inside the block is unchanged — it continues to control the cross-fade. Only the outer mount condition changes.

uPVC still: not affected. The uPVC still (`activeMaterial.image`) is consumed only as a prop by `PhaseCalloutMarkers` and `PhaseCalloutLines`, which are themselves mounted under the thermal-active guard. No separate gating change is needed for the uPVC still.

**Step 4: Update `Index.tsx:50` — replace `fallback={null}` with sized placeholder**

File: `src/pages/Index.tsx`

Change:
```tsx
<Suspense fallback={null}>
  <ScrollWindow />
</Suspense>
```
to:
```tsx
<Suspense
  fallback={
    <div
      aria-hidden="true"
      className="w-full bg-[color:var(--canvas)] max-lg:min-h-[calc(var(--fq-lvh)*2.6)] lg:min-h-[316vh]"
    />
  }
>
  <ScrollWindow />
</Suspense>
```

Rationale: `316vh` = `PART0_VH(78) + PANEL_VH(66)*3 + TRAILING_VH(40)`. Mobile uses `2.6 * --fq-lvh` matching the existing `max-lg:h-[calc(var(--fq-lvh)*2.6)]` on the container. Background color matches the section's `bg-[color:var(--canvas)]` to prevent any flash.

**Step 5: Add poster preload to `index.html`**

File: `index.html`

Add two `<link rel="preload">` tags inside `<head>`, after the favicon links and before the font preconnects:

```html
<!-- Preload ScrollWindow poster frame — desktop (1280px) -->
<link
  rel="preload"
  as="image"
  href="/images/scroll-window-1280/frame_0001.webp"
  type="image/webp"
  fetchpriority="high"
  media="(min-width: 1024px)"
/>
<!-- Preload ScrollWindow poster frame — mobile (720px) -->
<link
  rel="preload"
  as="image"
  href="/images/scroll-window-720/frame_0001.webp"
  type="image/webp"
  fetchpriority="high"
  media="(max-width: 1023px)"
/>
```

Important: these paths reference the Part 2 directories. Step 5 must be executed after Part 2 assets exist (i.e. after Step 9 below). Until Part 2 is complete, the preload tags must point to the 1920px originals — or Step 5 can be deferred entirely to after Part 2. Plan ordering: implement Steps 1–4 first (they are safe independently), then execute Part 2 (Steps 6–11), then do Step 5 last.

Reorder the implementation: 1 → 2 → 3 → 4 → [verify Part 1] → 6 → 7 → 8 → 9 → 10 → 11 → 5 → [final verify].

---

### Part 2 — Asset re-encode and path migration

**Step 6: Create `assets/source-frames/` directory structure**

```
assets/source-frames/
  scroll-window-webp/     ← original 1920px frames will be moved here
  scroll-window-stills/   ← original 1920px stills will be moved here
```

This directory is inside the repo but outside `public/`, so Vite does not include it in the build output. Confirm by checking `vite.config.ts` — `publicDir` is not set, so it defaults to `public/`. Any directory at the project root other than `public/` is excluded from the build.

**Step 7: Move the 1920px originals out of `public/`**

```bash
mkdir -p assets/source-frames/scroll-window-webp
mkdir -p assets/source-frames/scroll-window-stills
git mv public/images/scroll-window-webp/frame_0001.webp assets/source-frames/scroll-window-webp/frame_0001.webp
# ... (all 186 frames)
git mv public/images/scroll-window-stills/part2-upvc.webp assets/source-frames/scroll-window-stills/part2-upvc.webp
git mv public/images/scroll-window-stills/part2-alu.webp assets/source-frames/scroll-window-stills/part2-alu.webp
```

In practice, use a shell loop to move all 186 frames. The execute agent should run:
```bash
mkdir -p assets/source-frames/scroll-window-webp assets/source-frames/scroll-window-stills
for i in $(seq -w 1 186); do
  git mv "public/images/scroll-window-webp/frame_${i}.webp" "assets/source-frames/scroll-window-webp/frame_${i}.webp"
done
git mv public/images/scroll-window-stills/part2-upvc.webp assets/source-frames/scroll-window-stills/part2-upvc.webp
git mv public/images/scroll-window-stills/part2-alu.webp assets/source-frames/scroll-window-stills/part2-alu.webp
```

Note: `seq -w` zero-pads on Linux but not on macOS (Darwin). On macOS, use `printf '%04d'` instead:
```bash
for i in $(seq 1 186); do
  f=$(printf '%04d' $i)
  git mv "public/images/scroll-window-webp/frame_${f}.webp" "assets/source-frames/scroll-window-webp/frame_${f}.webp"
done
```

After this step, `public/images/scroll-window-webp/` will be empty and can be removed, and `public/images/scroll-window-stills/` will be empty.

```bash
rmdir public/images/scroll-window-webp
rmdir public/images/scroll-window-stills
```

**Step 8: Create the encode script at `scripts/encode-scroll-frames.sh`**

Create this file as an executable shell script. It reads from `assets/source-frames/` and writes to `public/images/`. It is idempotent (can be re-run to regenerate).

Exact commands:

```bash
#!/usr/bin/env bash
# encode-scroll-frames.sh
# Encodes the 1920x1080 WebP frame sequence into two breakpoint sets.
# Requires: cwebp (brew install webp), ffmpeg
# Usage: bash scripts/encode-scroll-frames.sh
set -euo pipefail

SRC_FRAMES="assets/source-frames/scroll-window-webp"
SRC_STILLS="assets/source-frames/scroll-window-stills"
OUT_1280="public/images/scroll-window-1280"
OUT_720="public/images/scroll-window-720"
OUT_STILLS_1280="public/images/scroll-window-stills-1280"
OUT_STILLS_720="public/images/scroll-window-stills-720"
QUALITY=82

mkdir -p "$OUT_1280" "$OUT_720" "$OUT_STILLS_1280" "$OUT_STILLS_720"

echo "Encoding frames — 1280x720..."
for i in $(seq 1 186); do
  f=$(printf '%04d' $i)
  cwebp -q $QUALITY -resize 1280 720 \
    "$SRC_FRAMES/frame_${f}.webp" \
    -o "$OUT_1280/frame_${f}.webp" -quiet
done

echo "Encoding frames — 720x405..."
for i in $(seq 1 186); do
  f=$(printf '%04d' $i)
  cwebp -q $QUALITY -resize 720 405 \
    "$SRC_FRAMES/frame_${f}.webp" \
    -o "$OUT_720/frame_${f}.webp" -quiet
done

echo "Encoding stills — 1280px..."
cwebp -q $QUALITY -resize 1280 720 \
  "$SRC_STILLS/part2-upvc.webp" \
  -o "$OUT_STILLS_1280/part2-upvc.webp" -quiet
cwebp -q $QUALITY -resize 1280 720 \
  "$SRC_STILLS/part2-alu.webp" \
  -o "$OUT_STILLS_1280/part2-alu.webp" -quiet

echo "Encoding stills — 720px..."
cwebp -q $QUALITY -resize 720 405 \
  "$SRC_STILLS/part2-upvc.webp" \
  -o "$OUT_STILLS_720/part2-upvc.webp" -quiet
cwebp -q $QUALITY -resize 720 405 \
  "$SRC_STILLS/part2-alu.webp" \
  -o "$OUT_STILLS_720/part2-alu.webp" -quiet

echo "Done. Verifying output counts..."
echo "  1280 frames: $(ls $OUT_1280 | wc -l | tr -d ' ')"
echo "  720 frames:  $(ls $OUT_720 | wc -l | tr -d ' ')"
echo "  stills-1280: $(ls $OUT_STILLS_1280 | wc -l | tr -d ' ')"
echo "  stills-720:  $(ls $OUT_STILLS_720 | wc -l | tr -d ' ')"

echo "Total sizes:"
du -sh "$OUT_1280" "$OUT_720" "$OUT_STILLS_1280" "$OUT_STILLS_720"
```

Quality setting: `q=82`. This is slightly above the typical default of 75, chosen to preserve detail in the fine mechanical frame cross-sections visible in the thermal part. If the resulting sizes are larger than expected (>4 MB for the 1280 set), lower to `q=78`.

WebP dimensions: `cwebp -resize W H` performs a simple bilinear resize before encoding. The stills are square-cropped 1920×1080 sources; `-resize 1280 720` and `-resize 720 405` preserve the 16:9 aspect ratio exactly.

Expected output file counts: 186 frames per directory, 2 stills per directory.

**Step 9: Run the encode script and verify output**

```bash
bash scripts/encode-scroll-frames.sh
```

After running, verify:
- `ls public/images/scroll-window-1280/ | wc -l` → 186
- `ls public/images/scroll-window-720/ | wc -l` → 186
- `du -sh public/images/scroll-window-1280/` → target ~2.5–3.2 MB
- `du -sh public/images/scroll-window-720/` → target ~0.7–1.1 MB
- `du -sh public/images/scroll-window-stills-1280/` → target ~0.8–1.0 MB
- `du -sh public/images/scroll-window-stills-720/` → target ~0.25–0.35 MB
- Visual check: open `public/images/scroll-window-1280/frame_0001.webp` and `frame_0100.webp` in Preview to confirm no encode artifacts.

Record the actual sizes in this plan's notes section before closing.

**Step 10: Update `scroll-window-phases.ts` to use responsive paths**

File: `src/data/scroll-window-phases.ts`

This file currently has a single `FRAME_PATH_TEMPLATE` string. The selection between desktop (1280) and mobile (720) must happen at runtime, not at import time, because the same JS bundle runs on both device classes.

Two approaches are possible. Use Approach A (simpler, no breaking change to the hook interface):

**Approach A:** Export two path template constants and select between them inside `ScrollWindow.tsx`.

Changes to `scroll-window-phases.ts`:
```ts
// Replace line 10:
export const FRAME_PATH_TEMPLATE_DESKTOP = "/images/scroll-window-1280/frame_{index}.webp";
export const FRAME_PATH_TEMPLATE_MOBILE  = "/images/scroll-window-720/frame_{index}.webp";
// Keep backward compat alias (used by POSTER derivation — will be updated below):
export const FRAME_PATH_TEMPLATE = FRAME_PATH_TEMPLATE_DESKTOP; // resolved at init, overridden in component
```

Also update the still paths:
```ts
// WINDOW_MATERIALS upvc image (line 128):
image: "/images/scroll-window-stills-1280/part2-upvc.webp",  // desktop default
// WINDOW_MATERIALS alu image (line 139):
image: "/images/scroll-window-stills-1280/part2-alu.webp",   // desktop default
```

Wait — the still path also needs to be responsive. Handle this in `ScrollWindow.tsx` instead: derive the active material image from `isDesktop` state rather than the static constant.

Revised plan for still path responsiveness:

In `scroll-window-phases.ts`, add `imageMobile` to `WindowMaterial`:
```ts
export interface WindowMaterial {
  id: MaterialId;
  label: string;
  image: string;       // desktop (1280px)
  imageMobile: string; // mobile (720px)
  callouts: Callout[];
}
```

Update `WINDOW_MATERIALS`:
- upvc: `image: "/images/scroll-window-stills-1280/part2-upvc.webp"`, `imageMobile: "/images/scroll-window-stills-720/part2-upvc.webp"`
- alu: `image: "/images/scroll-window-stills-1280/part2-alu.webp"`, `imageMobile: "/images/scroll-window-stills-720/part2-alu.webp"`

In `ScrollWindow.tsx`, update `ALU_IMAGE` and the uPVC still reference to select by `isDesktop`:
```ts
// Replace line 54:
const ALU_IMAGE_DESKTOP = WINDOW_MATERIALS.find((m) => m.id === "alu")?.image ?? "";
const ALU_IMAGE_MOBILE  = WINDOW_MATERIALS.find((m) => m.id === "alu")?.imageMobile ?? "";
```
Then inside the component, derive:
```ts
const aluImage = isDesktop ? ALU_IMAGE_DESKTOP : ALU_IMAGE_MOBILE;
```
And use `aluImage` in the JSX at line 770.

For the uPVC still (used as the canvas backdrop in the thermal part), `activeMaterial.image` is used in `PhaseCalloutMarkers` and `PhaseCalloutLines` via the `activeMaterial` memo. Update `activeMaterial` selection to use `imageMobile` when `!isDesktop`. In `ScrollWindow.tsx`:
```ts
const activeMaterial = useMemo(
  () => {
    const m = WINDOW_MATERIALS.find((mat) => mat.id === material) ?? WINDOW_MATERIALS[0];
    return { ...m, image: isDesktop ? m.image : m.imageMobile };
  },
  [material, isDesktop],
);
```
This ensures both `activeMaterial.image` (uPVC) and the separately derived `aluImage` respect the breakpoint.

**Step 11: Update frame path selection in `ScrollWindow.tsx`**

The `useFramePreloader` hook call at line 670 takes a single `pathTemplate`. Update it to select between desktop and mobile templates:

```ts
const framePath = isDesktop ? FRAME_PATH_TEMPLATE_DESKTOP : FRAME_PATH_TEMPLATE_MOBILE;

const { images, progress, isLoaded } = useFramePreloader(
  TOTAL_FRAMES,
  framePath,
  { enabled: nearViewport, padLength: FRAME_PAD_LENGTH, posterPath: POSTER },
);
```

Where `POSTER` must also be computed from the active path template:
```ts
// Replace line 53 (was: const POSTER = FRAME_PATH_TEMPLATE.replace("{index}", "0001");)
// Move POSTER derivation inside the component, after isDesktop is known:
const POSTER = (isDesktop ? FRAME_PATH_TEMPLATE_DESKTOP : FRAME_PATH_TEMPLATE_MOBILE)
  .replace("{index}", "0001");
```

Since `POSTER` is now inside the component rather than a module-level constant, remove line 53 from the module-level block and add it inside `ScrollWindow` before the `useFramePreloader` call.

**Step 5 (deferred, now executable): Add poster preload to `index.html`**

After Step 9 has produced the frame directories, add:
```html
<link rel="preload" as="image" href="/images/scroll-window-1280/frame_0001.webp"
      type="image/webp" fetchpriority="high" media="(min-width: 1024px)" />
<link rel="preload" as="image" href="/images/scroll-window-720/frame_0001.webp"
      type="image/webp" fetchpriority="high" media="(max-width: 1023px)" />
```

Place these after the favicon links and before the font `<link rel="preload">` tags in `index.html`.

---

## Verification Evidence

### Pass Criteria (all must be met)

| Metric | Pass Threshold | Method |
|---|---|---|
| Poster painted | ≤ 500 ms after navigation start | DevTools Network waterfall: `frame_0001.webp` response end timestamp |
| Section blank gap | 0 ms (no empty space visible) | Manual scroll at page load; Suspense placeholder fills the space |
| CLS contribution from Suspense | 0 (placeholder reserves correct height) | Lighthouse CLS score; or Chrome DevTools Performance panel Layout Shifts |
| Total bytes transferred before section scrolls into view | < 4 MB (desktop) | DevTools Network → filter `scroll-window` requests, check loaded bytes when user has scrolled 0–50% |
| `part2-alu.webp` fetch timing | Starts when thermal part becomes active, completes before cross-fade begins | DevTools Network → `part2-alu` request appears when `thermalActive` first becomes true (weather→thermal transition); response end must precede the moment `thermalSettled` flips (frame advance stops in `?fqdebug` HUD) |
| Alu still paint at thermal settle | No blank or pop — image is painted when `opacity-100` is applied | Manual: scroll slowly to thermal part, switch material to alu; the cross-fade must show the alu still image, not a white or transparent rectangle |
| Frame animation smoothness | No visible stutter at 36 fps | Manual scroll-through on desktop Chrome; `?fqdebug` HUD shows frame numbers advancing without gaps |
| TypeScript | `npm run typecheck` exits 0 | CLI |
| Vitest unit tests | `npm run test` exits 0 | CLI |

### Measurement Method

**Network waterfall (primary):**
1. Open Chrome DevTools → Network tab → disable cache.
2. Navigate to `http://localhost:8080/`.
3. Filter by "scroll-window" in the filter box.
4. Observe: `frame_0001.webp` should start loading immediately at page start (the `<link rel="preload">` causes early fetch). Its response end time should be < 500 ms.
5. Remaining batch frames (`frame_0002` through `frame_0186`) should appear after the `window` load event fires (typically 1–3 s after navigation start on local), and their request headers should show `Priority: Low` in the request details.
6. `part2-alu.webp` should appear in the network log when the weather→thermal transition begins (before `thermalSettled`), and its response end should precede the `opacity-100` paint. If the response end timestamp is later than the `thermalSettled` moment (visible as a frame-advance pause in the `?fqdebug` HUD), the mount gate is too late and should be moved to `effectiveActive >= THERMAL_INDEX - 1`.

**Playwright / visual QA (secondary):**
The repo has `scripts/visual-qa.mjs` (`npm run qa:visual`). Use this to take screenshots at page load and at 50% scroll depth. Confirm no blank section in the 0%-scroll screenshot.

**CLS check:**
Run `npm run qa:viewport` which runs `scripts/rm5-viewport-scan.mjs` (the existing viewport scan). If Lighthouse is available via the QA scripts, CLS must be < 0.1.

---

## Type-Check and Test Commands

```bash
# Type-check (both web and server)
npm run typecheck

# Unit tests
npm run test

# Visual QA
npm run qa:visual

# Viewport / a11y scan
npm run qa:viewport
```

No new Vitest tests are required for this change. The `useFramePreloader` changes are runtime-behavior changes that are best validated via the network waterfall and `?fqdebug` HUD rather than unit tests (the hook depends on `Image` loading, which is not meaningfully testable in jsdom). If a unit test is desired, it should assert that when `posterPath` is provided, only one image is created before the batch starts — but this is optional and not blocking.

---

## Rollback Notes

### Part 1 rollback
All Part 1 changes are reversible by reverting the four files touched:
- `src/hooks/useFramePreloader.ts` — restore `batchSize = 50`, remove `posterPath`/`deferBatch` logic, remove `fetchPriority` assignment.
- `src/pages/Index.tsx` — restore `fallback={null}`.
- `src/components/home/ScrollWindow.tsx` — restore alu still gate to `nearViewport` (the original) and `POSTER` to module-level constant.
- `index.html` — remove the two preload link tags.

No database changes, no API changes, no server changes. Rollback is a `git revert` or a `git checkout` of the four files.

### Part 2 rollback
Part 2 is more involved:
- If the new directories look wrong or cause issues, the `FRAME_PATH_TEMPLATE_DESKTOP` / `FRAME_PATH_TEMPLATE_MOBILE` constants in `scroll-window-phases.ts` can be temporarily pointed back at the original paths.
- The 1920px originals remain in `assets/source-frames/` and can be moved back to `public/images/scroll-window-webp/` with `git mv` in reverse.
- The encode script is idempotent — it can be re-run with different quality settings.

**Caching risk:** because the new directories have never been served before, there is no stale-while-revalidate concern for the new paths. If Part 2 is deployed and later needs to be reverted (rolling back to the 1920px originals), a new directory would be needed again — do NOT reuse `scroll-window-1280/` as an overwrite path.

---

## Dependencies and Sequencing

```
Step 1 (useFramePreloader)
  └── Step 2 (ScrollWindow — posterPath wiring)        [depends on Step 1]
Step 3 (alu still gate)                                [independent]
Step 4 (Suspense placeholder)                          [independent]
Step 6 (create assets/source-frames dirs)              [independent]
  └── Step 7 (git mv originals out of public/)         [depends on Step 6]
      └── Step 8 (encode script)                       [depends on Step 7 — sources must be in place]
          └── Step 9 (run encode script)               [depends on Step 8]
              └── Step 10 (update scroll-window-phases.ts paths)  [depends on Step 9]
                  └── Step 11 (update ScrollWindow.tsx path selection)  [depends on Step 10]
                      └── Step 5 (add preload to index.html)            [depends on Step 9]
```

Parts 1 (Steps 1–4) and 2 (Steps 6–11, then Step 5) are independent of each other until Step 11 updates the path template in `ScrollWindow.tsx`. Part 1 can be implemented and verified first; Part 2 then follows.

---

## Resume and Execution Handoff

**Plan file:** `/Users/princewagan/fourlinq-1/process/general-plans/active/scrollwindow-load-perf_PLAN_08-09-26.md`

**Execute agent receives:**
- This plan file path.
- No other plan files are relevant.

**First action for execute agent:**
Implement Steps 1–4 (Part 1 code changes) in order. Run `npm run typecheck && npm run test` after Step 4. If both pass, proceed to Step 6.

**Stopping point between parts:**
After Steps 1–4 pass type-check and tests, it is safe to commit Part 1 independently before starting Part 2 (the encode script run can take several minutes).

**Environment requirements for Part 2:**
- `cwebp` must be available: `which cwebp` → `/opt/homebrew/bin/cwebp` (confirmed on this machine).
- `ffmpeg` is available but not required for the encode script (cwebp handles resize natively).
- The encode script must be run locally (it produces binary assets — not a CI-only step).

**Files the execute agent will touch:**
- `src/hooks/useFramePreloader.ts`
- `src/components/home/ScrollWindow.tsx`
- `src/pages/Index.tsx`
- `index.html`
- `src/data/scroll-window-phases.ts`
- `scripts/encode-scroll-frames.sh` (new)
- `public/images/scroll-window-1280/` (new, 186 files)
- `public/images/scroll-window-720/` (new, 186 files)
- `public/images/scroll-window-stills-1280/` (new, 2 files)
- `public/images/scroll-window-stills-720/` (new, 2 files)
- `assets/source-frames/scroll-window-webp/` (186 files moved from public/)
- `assets/source-frames/scroll-window-stills/` (2 files moved from public/)
- `public/images/scroll-window-webp/` (directory removed after move)
- `public/images/scroll-window-stills/` (directory removed after move)

---

## Notes / Post-Encode Actuals

*(Fill in after Step 9 runs)*

| Directory | Actual size | Frame count |
|---|---|---|
| `public/images/scroll-window-1280/` | TBD | TBD |
| `public/images/scroll-window-720/` | TBD | TBD |
| `public/images/scroll-window-stills-1280/` | TBD | TBD |
| `public/images/scroll-window-stills-720/` | TBD | TBD |

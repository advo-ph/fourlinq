# ScrollWindow Mobile Sticky Scrollytelling — Implementation Plan
**Date:** 23-07-26
**Complexity:** SIMPLE (single-session, ~20 atomic steps across 2 files)
**Plan file:** `process/general-plans/active/scrollwindow-mobile-sticky_PLAN_23-07-26.md`

---

## Overview

Rework `ScrollWindow.tsx` for mobile so it uses native CSS sticky scrollytelling instead of JS engagement-pin-snap machinery. Scroll-progress drives step changes and text fades via framer-motion. The chat bubble (`ChatBubble.tsx`) fades out while the section covers the viewport on mobile. Desktop behavior (`min-width: 1024px`) is strictly unchanged.

---

## Goals

1. Eliminate scroll-hijacking (`window.scrollBy`, `touchmove preventDefault`, `touchAction: none`, `snap`, `exit`) on mobile.
2. Tie text fades to swipe position using framer-motion `useScroll` + `useTransform`.
3. Fix dead-zone layout: text higher up the screen, image occupying the lower region.
4. Fade + disable the chat FAB while the ScrollWindow section covers the viewport on mobile.
5. `fq-hide-header` must still fire correctly on mobile with the new sticky structure.

---

## Scope

**In scope:**
- `src/components/home/ScrollWindow.tsx` — mobile logic and layout only
- `src/components/chat/ChatBubble.tsx` — listen for new CustomEvent on mobile only

**Out of scope:**
- Desktop path (`isDesktop === true` branches) — zero changes
- `src/hooks/useSegmentedFrames.ts` — frame playback hook unchanged
- `src/hooks/useFramePreloader.ts` — unchanged
- `src/data/scroll-window-phases.ts` — unchanged
- `QuietNavbar.tsx` — unchanged (still receives `fq-hide-header`)
- Pre-existing lint error in `server/scripts/sync-product-content.ts` — unrelated, do not touch
- The known `isDesktop`/Tailwind `lg` breakpoint mismatch (1024px vs 992px) — preserve as-is

---

## Touchpoints

| File | Location | Nature of Change |
|---|---|---|
| `src/components/home/ScrollWindow.tsx` | lines 1–6 (imports) | Add framer-motion imports |
| `src/components/home/ScrollWindow.tsx` | lines 46–49 (constants) | Remove `SWIPE_THRESHOLD`, `STEP_COOLDOWN_MS`, `ENGAGE_EPSILON`; add `TRACK_EXTRA_VH` |
| `src/components/home/ScrollWindow.tsx` | lines 51–69 (state) | Remove `engaged`, `engagedRef`; add `trackRef`; keep `step`, `stepRef` but drive them from scroll-progress |
| `src/components/home/ScrollWindow.tsx` | lines 141–276 (mobile useEffect) | Delete entire mobile engagement block |
| `src/components/home/ScrollWindow.tsx` | lines 279–283 (header hide useEffect) | Rework: track-inview IntersectionObserver drives header hide + new CustomEvent |
| `src/components/home/ScrollWindow.tsx` | lines 285–286 (effectiveActive) | Keep unchanged (still uses `step - 1`) |
| `src/components/home/ScrollWindow.tsx` | lines 350–356 (stepClass) | Replace CSS class flip with framer-motion `style` props — opacity + y driven by per-step motion values |
| `src/components/home/ScrollWindow.tsx` | lines 358–363 (outer container + sticky div) | Add `trackRef` on outer wrapper with explicit height; remove `touchAction` inline style; keep `sticky top-0` |
| `src/components/home/ScrollWindow.tsx` | lines 363 (sticky class) | Change mobile spacing: `items-end pb-[6vh]` → `items-start pt-0` (mobile only) |
| `src/components/home/ScrollWindow.tsx` | lines 437 (text overlay) | `stepClass()` replaced by framer-motion animated divs |
| `src/components/chat/ChatBubble.tsx` | lines 1–19 | Add listener for `fq-scrollwindow-inview` CustomEvent |
| `src/components/chat/ChatBubble.tsx` | lines 25–46 | Add opacity + pointer-events transition on FAB div when scrollwindow is in view and panel is closed |

---

## Public Contracts

### New CustomEvent: `fq-scrollwindow-inview`
- **Dispatched by:** `ScrollWindow.tsx` on mobile only
- **Payload:** `CustomEvent<{ inView: boolean }>`
- **Timing:** fired from an `IntersectionObserver` on the outer `containerRef` with `threshold: 0.9` (section covers >90% of viewport = in-view)
- **Consumer:** `ChatBubble.tsx`
- **Desktop guard:** event is only dispatched when `!isDesktop`; ChatBubble must also guard with a media-query check before hiding (belt + suspenders; see step 18)

### Existing `fq-hide-header` contract — preserved
- Still dispatched from the mobile IntersectionObserver callback (same `inView` boolean)
- Desktop useEffect at lines 101–139 continues dispatching it via scroll/resize listener — no change

---

## Implementation Checklist

### 1. Add framer-motion imports to ScrollWindow.tsx
**File:** `src/components/home/ScrollWindow.tsx` line ~1-6

Add to the existing import block:
```
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
```
(`motion` element is NOT needed — we use `useTransform` values applied via React `style` props on plain divs using `MotionValue` only if we wrap them in `motion.div`; see step 7 for element decision.)

Correction: The animated divs must be `motion.div` to accept `MotionValue` style props. Add `motion` to the import as well:
```
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
```

### 2. Remove mobile-only constants
**File:** `src/components/home/ScrollWindow.tsx` lines 47–49

Delete:
- `SWIPE_THRESHOLD = 48`
- `STEP_COOLDOWN_MS = 400`
- `ENGAGE_EPSILON = 2`

Add:
- `const TRACK_EXTRA_VH = 0.6;` — fractional extra viewport-heights of scroll track per step boundary (tuning value). Total track height = `(STEP_COUNT + TRACK_EXTRA_VH) * 100dvh`. With `STEP_COUNT = 4` this gives `4.6 * 100dvh` total outer height. The 0.6 adds a comfortable "settle" zone at the bottom so the last step doesn't require pixel-perfect scroll position. Adjustable in execute if feel needs tuning.

### 3. Add trackRef; remove engaged state
**File:** `src/components/home/ScrollWindow.tsx` lines 53–68

- Add `const trackRef = useRef<HTMLDivElement>(null);` alongside existing refs
- Remove `const [engaged, setEngaged] = useState(false);`
- Remove `const engagedRef = useRef(false);`
- Keep `const [step, setStep] = useState(0);` and `const stepRef = useRef(0);` — they are still updated (by scroll progress now instead of touch events)

### 4. Delete the entire mobile engagement useEffect
**File:** `src/components/home/ScrollWindow.tsx` lines 145–276

Delete the entire block:
```
useEffect(() => {
  if (isDesktop) return;
  // ... snap(), exit(), stepBy(), onScroll, onTouchStart, onTouchMove, onTouchEnd, onWheel, onResize
  window.addEventListener(...)
  ...
  return () => { ... }
}, [isDesktop]);
```
This removes: `snap`, `exit`, `stepBy`, the engagement-scroll listener, the `touchmove preventDefault` listener, and the wheel accumulator. All mobile event listeners in this block are gone.

### 5. Add framer-motion useScroll hook for the track
**File:** `src/components/home/ScrollWindow.tsx` — new block inserted after the isDesktop matchMedia useEffect (~line 95)

```
const { scrollYProgress } = useScroll({
  target: trackRef,
  offset: ["start start", "end end"],
});
```

This produces a MotionValue from 0.0 (track top at viewport top) to 1.0 (track bottom at viewport bottom). Only used on mobile; the desktop path ignores it (no branching needed in the hook — it's just unused on desktop).

### 6. Drive step state from scroll progress
**File:** `src/components/home/ScrollWindow.tsx` — immediately after step 5

Use `useMotionValueEvent` to update `step` and `stepRef` from `scrollYProgress`:

```
useMotionValueEvent(scrollYProgress, "change", (latest) => {
  if (isDesktop) return;
  // Map [0, 1] progress to discrete step index [0, STEP_COUNT-1]
  const next = Math.min(STEP_COUNT - 1, Math.floor(latest * STEP_COUNT));
  if (next !== stepRef.current) {
    stepRef.current = next;
    setStep(next);
  }
});
```

Boundary behavior:
- `latest = 0.0` → step 0 (intro)
- `latest = 0.25` → step 1 (weather) [for STEP_COUNT=4]
- `latest = 0.5` → step 2 (thermal)
- `latest = 0.75` → step 3 (sound)
- `latest = 1.0` → clamped to STEP_COUNT-1 = 3

`effectiveActive = step - 1` is unchanged; `useSegmentedFrames` receives it as before.

### 7. Build per-step opacity and translateY MotionValues
**File:** `src/components/home/ScrollWindow.tsx` — after step 6

For each step `i` in `[0, STEP_COUNT-1]`, define:
- `stepStart_i = i / STEP_COUNT` — progress when step i begins to enter
- `stepPeak_i = (i + 0.5) / STEP_COUNT` — progress at step i center (fully visible)
- `stepEnd_i = (i + 1) / STEP_COUNT` — progress when step i begins to exit

Per-step opacity MotionValue: `useTransform(scrollYProgress, [stepStart, stepPeak, stepEnd], [0, 1, 0])`
Per-step translateY MotionValue: `useTransform(scrollYProgress, [stepStart, stepPeak, stepEnd], [24, 0, -24])` (px)

**Implementation note:** `useTransform` cannot be called conditionally (Rules of Hooks). All 4 steps' values must be declared unconditionally at the top of the component (not inside a map). Declare as parallel arrays:

```
const stepOpacities = [
  useTransform(scrollYProgress, [0/4, 0.5/4, 1/4], [0, 1, 0]),
  useTransform(scrollYProgress, [1/4, 1.5/4, 2/4], [0, 1, 0]),
  useTransform(scrollYProgress, [2/4, 2.5/4, 3/4], [0, 1, 0]),
  useTransform(scrollYProgress, [3/4, 3.5/4, 4/4], [0, 1, 0]),  // last clamps at 1.0
];
const stepYs = [
  useTransform(scrollYProgress, [0/4, 0.5/4, 1/4], [24, 0, -24]),
  useTransform(scrollYProgress, [1/4, 1.5/4, 2/4], [24, 0, -24]),
  useTransform(scrollYProgress, [2/4, 2.5/4, 3/4], [24, 0, -24]),
  useTransform(scrollYProgress, [3/4, 3.5/4, 4/4], [24, 0, -24]),
];
```

`STEP_COUNT` is a constant (4), so the array length is fixed at compile-time and the hook call count is stable. On desktop these values are computed but never consumed.

**Last-step behavior:** The last step's exit range `[3/4, 1.0]` maps progress through a fade-out. With `TRACK_EXTRA_VH = 0.6`, actual scroll progress at track bottom = 1.0 only after extra scroll; the last step will appear fully visible (opacity 1) well before the track ends, which is the desired "settled" feel.

### 8. Rework the outer container: add trackRef and track height
**File:** `src/components/home/ScrollWindow.tsx` line 359

Current:
```jsx
<div ref={containerRef} className="relative bg-[color:var(--canvas)]">
```

Change to:
```jsx
<div ref={trackRef} className="relative bg-[color:var(--canvas)]"
  style={!isDesktop ? { height: `${(STEP_COUNT + TRACK_EXTRA_VH) * 100}dvh` } : undefined}
>
```

`containerRef` must be preserved for the IntersectionObserver (preload gate, still in use). Assign `trackRef` on the same element (same div serves both purposes — the outer container IS the scroll track).

**Correction:** Two refs cannot be assigned to the same element via JSX `ref={}` without a callback ref. Use a callback ref that assigns both:
```
ref={(el) => { (trackRef as React.MutableRefObject<HTMLDivElement | null>).current = el; (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el; }}
```
Or restructure: keep `containerRef` on the outer div (for IntersectionObserver preload), and wrap the sticky element in a new inner element that becomes the scroll track target for `useScroll`. Because `useScroll` needs the element whose scroll-container relationship is measured, the outer div (the track) is the right target. Use the callback-ref pattern.

**Exact JSX attribute:**
```jsx
ref={(el) => {
  containerRef.current = el;
  trackRef.current = el;
}}
```

### 9. Fix mobile sticky container: layout and remove engaged-dependent inline style
**File:** `src/components/home/ScrollWindow.tsx` line 363

Current:
```jsx
<div
  ref={stickyRef}
  className="sticky top-0 flex h-screen w-full items-end pb-[6vh] overflow-hidden bg-[color:var(--canvas)] lg:items-center lg:pb-0"
  style={!isDesktop ? { height: "100dvh", touchAction: engaged ? "none" : undefined } : undefined}
>
```

Change to:
```jsx
<div
  ref={stickyRef}
  className="sticky top-0 flex h-screen w-full overflow-hidden bg-[color:var(--canvas)] items-end pb-[3vh] lg:items-center lg:pb-0"
  style={!isDesktop ? { height: "100dvh" } : undefined}
>
```

Key changes:
- Remove `touchAction: engaged ? "none" : undefined` — engagement state is gone
- Mobile spacing: `items-end pb-[6vh]` → `items-end pb-[3vh]` (image stays bottom-anchored, but less gap)

**Note on text position:** The text overlay lives inside the sticky div and currently starts at `pt-[12vh]`. Moving it higher is done in step 10. The media box moves further down by reducing `pb` here, so image sits lower.

### 10. Fix text overlay: move text higher (reduce pt)
**File:** `src/components/home/ScrollWindow.tsx` — the `stepClass` function lines 350–356 and the mobile text overlay divs

The current `pt-[12vh]` in `stepClass` places text 12% down from sticky-top. Change to `pt-[4vh]` on mobile. Since the step divs are `absolute inset-x-0 top-0`, `pt-[4vh]` moves text 4% from the top of the sticky viewport — near the top, well away from mid-screen dead zone.

In step 11 below `stepClass` is replaced by `motion.div` with style props. The `pt-[4vh]` must be the class on those divs.

### 11. Replace stepClass CSS-flip text overlays with motion.div + MotionValue styles
**File:** `src/components/home/ScrollWindow.tsx` lines 350–356 and 436–477

Delete `stepClass()` function entirely.

In the mobile text overlay section (currently `{!isDesktop && (...)}` at line 436), replace each step div:

**Before (step 0):**
```jsx
<div className={stepClass(0)} aria-hidden={step !== 0}>
```

**After (step 0):**
```jsx
<motion.div
  className="absolute inset-x-0 top-0 px-6 pt-[4vh] pointer-events-auto"
  style={{ opacity: stepOpacities[0], y: stepYs[0] }}
  aria-hidden={step !== 0}
>
```

Apply same pattern for steps 1–3 (`stepOpacities[i+1]` for part step i+1... wait: step 0 = index 0, WINDOW_PARTS[i] = step i+1):
- Step 0 (intro): `stepOpacities[0]`, `stepYs[0]`
- Step 1 (weather, i=0): `stepOpacities[1]`, `stepYs[1]`
- Step 2 (thermal, i=1): `stepOpacities[2]`, `stepYs[2]`
- Step 3 (sound, i=2): `stepOpacities[3]`, `stepYs[3]`

Remove `pointer-events-none` from the parent overlay div (`className="pointer-events-none absolute inset-0 z-10"`) because we need individual step divs to handle pointer events when visible. Change parent to `className="pointer-events-none absolute inset-0 z-10"` but add `pointer-events-auto` only on the individual step divs (already in pattern above).

**Note on `aria-hidden`:** Keep `aria-hidden={step !== i}` — this is still driven by discrete `step` state which updates via useMotionValueEvent. Accessibility is correct.

**Note on `transition-[opacity,transform]` removal:** The CSS transition class was on `stepClass`. Since framer-motion now drives opacity/y via MotionValues (which update per animation frame, not per discrete class flip), no CSS `transition` class is needed. Framer-motion's motion values animate by their own interpolation path.

### 12. Rework mobile header-hide + dispatch fq-scrollwindow-inview
**File:** `src/components/home/ScrollWindow.tsx` lines 279–283

Current block:
```
useEffect(() => {
  if (isDesktop) return;
  window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: engaged }));
  return () => { window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: false })); };
}, [engaged, isDesktop]);
```

Delete this useEffect.

Replace with a new IntersectionObserver useEffect that fires both events:
```
useEffect(() => {
  if (isDesktop) return;
  const el = containerRef.current;   // same outer div as trackRef
  if (!el) return;
  const dispatch = (inView: boolean) => {
    window.dispatchEvent(new CustomEvent("fq-hide-header", { detail: inView }));
    window.dispatchEvent(new CustomEvent("fq-scrollwindow-inview", { detail: { inView } }));
  };
  const io = new IntersectionObserver(
    ([entry]) => dispatch(entry.intersectionRatio >= 0.9),
    { threshold: [0, 0.9] }
  );
  io.observe(el);
  return () => {
    io.disconnect();
    dispatch(false);   // cleanup: always unhide header + restore chat bubble
  };
}, [isDesktop]);
```

**Behavior:**
- When `>= 90%` of the track covers the viewport → `inView: true` → header hides, chat bubble fades
- When `< 90%` → `inView: false` → header shows, chat bubble restores
- On unmount → cleanup fires `false` for both

**Why 0.9 threshold:** The track is `4.6 * 100dvh` tall. The viewport is 1 * 100dvh. The section covers 100% of the viewport as soon as the sticky inner div is pinned, which happens as soon as the track's top scrolls past the viewport top. `intersectionRatio >= 0.9` robustly catches this on all devices. Using `isIntersecting` alone would trigger too early (when even 1px is visible).

**Alternative if 0.9 misses scroll-up-from-below edge case:** The IntersectionObserver approach fires correctly for both scrolling down into and up into the section because it measures the outer track element (which has full `4.6dvh` height), and the track's intersection with the viewport changes symmetrically regardless of scroll direction. Confirmed correct.

### 13. Remove unused state and refs related to engagement
**File:** `src/components/home/ScrollWindow.tsx`

After deleting the engagement useEffect (step 4) and replacing the header-hide useEffect (step 12), the following are unused and must be removed:
- `const [engaged, setEngaged] = useState(false);` (line ~65)
- `const engagedRef = useRef(false);` (line ~67)

These were only referenced in the deleted engagement useEffect and the deleted header-hide useEffect.

`stepRef` remains (used by `useMotionValueEvent` callback in step 6).

### 14. Remove desktop touchmove listener warning risk
**File:** `src/components/home/ScrollWindow.tsx`

After step 4, all window-level touch/wheel listeners on the mobile path are removed. Verify the desktop useEffect (lines 101–139) does NOT add any touch listeners — it does not (only `scroll` and `resize`). No action needed here; checklist item is a verification gate.

### 15. Update ChatBubble: add inView state and listener
**File:** `src/components/chat/ChatBubble.tsx` lines 7–19

Add new state:
```
const [scrollWindowInView, setScrollWindowInView] = useState(false);
```

Add new useEffect alongside the existing `fourlinq:cookie-visibility` listener:
```
useEffect(() => {
  // Only respond to the event on mobile viewports
  const mq = window.matchMedia("(min-width: 1024px)");
  const onInView = (event: Event) => {
    if (mq.matches) return;   // desktop: ignore
    const detail = (event as CustomEvent<{ inView: boolean }>).detail;
    setScrollWindowInView(detail?.inView === true);
  };
  window.addEventListener("fq-scrollwindow-inview", onInView);
  return () => window.removeEventListener("fq-scrollwindow-inview", onInView);
}, []);
```

### 16. Update ChatBubble: apply opacity + pointer-events to FAB
**File:** `src/components/chat/ChatBubble.tsx` lines 25–46

The outer `<div data-chat-bubble ...>` currently handles cookie-offset via `className`. Add opacity and pointer-events based on `scrollWindowInView && !isOpen`:

Change the outer div:
```jsx
<div
  data-chat-bubble
  className={cn(
    "fixed right-6 z-[61] transition-[bottom,opacity] duration-300 ease-marvin",
    cookieVisible ? "bottom-[13rem] sm:bottom-[11.5rem] md:bottom-[10rem] lg:bottom-6" : "bottom-6",
    scrollWindowInView && !isOpen ? "opacity-0 pointer-events-none" : "opacity-100",
  )}
>
```

Key decisions:
- `scrollWindowInView && !isOpen`: if the panel is OPEN, do NOT force-hide it. User already opened it; hiding mid-conversation is rude. Only hide the FAB when closed.
- `transition-[bottom,opacity]`: extend the existing transition to also animate opacity
- `pointer-events-none` when hidden: prevents accidental tap through the invisible button
- `lg:bottom-6` cookie class is preserved untouched — desktop cookie offset still works
- If `isOpen` is true when scrollWindowInView becomes true, the button stays visible (user sees the X to close). The open chat panel (`ChatPanel`) is positioned separately (`fixed`) and is unaffected.

### 17. Verify no SSR issues
**File:** `src/components/home/ScrollWindow.tsx`

- `window.matchMedia` in `useState` initializer (line 61) — already guarded by existing code; no change
- `useScroll` from framer-motion with `target: trackRef` — safe on server (ref.current is null, framer-motion handles this gracefully, produces a static MotionValue of 0)
- `useMotionValueEvent` — no-ops on server
- `IntersectionObserver` in useEffect — already client-only
- No new window access outside useEffect — confirmed safe

### 18. Verify desktop path untouched
**File:** `src/components/home/ScrollWindow.tsx`

Confirm each desktop-guarded block is unchanged:
- `useEffect([isDesktop])` at lines 101–139 — active when `isDesktop === true`, untouched
- `{isDesktop && <PhaseCalloutLines ... />}` — untouched
- `{isDesktop && (<div className="relative z-10 -mt-[100vh]">...</div>)}` — untouched
- `panelRefs`, `itemRefs`, `activeIndex` — untouched
- `effectiveActive = isDesktop ? activeIndex : step - 1` — unchanged

The new `scrollYProgress` / `stepOpacities` / `stepYs` arrays are computed on desktop too (framer-motion hooks run unconditionally) but their values are never consumed in the desktop JSX. This is acceptable — no performance concern with 4 idle MotionValues.

### 19. Smoke-check TypeScript types
- `trackRef`: `useRef<HTMLDivElement>(null)` — matches the callback-ref target
- `stepOpacities`: `MotionValue<number>[]` of length 4 — `style={{ opacity: stepOpacities[i] }}` on `motion.div` accepts `MotionValue<number>` for opacity
- `stepYs`: `MotionValue<number>[]` of length 4 — `style={{ y: stepYs[i] }}` on `motion.div` accepts `MotionValue<number>` for y
- `CustomEvent<{ inView: boolean }>` — matches dispatch site and consumer cast
- `setScrollWindowInView(detail?.inView === true)` returns `boolean` — matches `useState(false)`

### 20. Build and type-check
```
npm run build
```
Expected: no TypeScript errors in `ScrollWindow.tsx` or `ChatBubble.tsx`. The pre-existing lint error in `server/scripts/sync-product-content.ts` is unrelated and may still appear — do not suppress or fix it.

---

## Spacing Spec Summary (mobile only)

| Element | Before | After | Reasoning |
|---|---|---|---|
| Sticky div `pb` | `pb-[6vh]` | `pb-[3vh]` | Image moves lower; less empty space below image |
| Sticky div `items-` | `items-end` | `items-end` (keep) | Image stays bottom-anchored |
| Step text `pt` | `pt-[12vh]` | `pt-[4vh]` | Text starts near top of sticky viewport |
| Track outer height | not set (height = content) | `(STEP_COUNT + TRACK_EXTRA_VH) * 100dvh = 460dvh` | Native scroll drives progress |

Desktop Tailwind classes (`lg:items-center`, `lg:pb-0`) are untouched throughout.

---

## Data Flow

```
Native scroll position
       │
       ▼
useScroll({ target: trackRef, offset: ["start start","end end"] })
       │ → scrollYProgress MotionValue [0.0 .. 1.0]
       │
       ├── useTransform → stepOpacities[0..3] MotionValues
       ├── useTransform → stepYs[0..3] MotionValues
       │        │
       │        └── applied to motion.div style={{ opacity, y }}
       │            (continuous, frame-level updates, tied to finger)
       │
       └── useMotionValueEvent("change") → setStep(discrete 0..3)
                │
                ├── step - 1 → effectiveActive → useSegmentedFrames
                │   (frame range playback unchanged)
                │
                └── aria-hidden updates on step divs
```

```
IntersectionObserver (trackRef element, threshold 0.9)
       │
       ├── fq-hide-header CustomEvent → QuietNavbar (existing consumer)
       └── fq-scrollwindow-inview CustomEvent → ChatBubble
                │
                └── scrollWindowInView && !isOpen → opacity-0 + pointer-events-none on FAB
```

---

## Failure Modes and Edge Cases

| Scenario | Behavior | Mitigation |
|---|---|---|
| Scroll UP from below section into section | `scrollYProgress` tracks correctly because framer-motion measures track-top vs viewport-top symmetrically. Step will land at STEP_COUNT-1 when track bottom enters viewport from below. IntersectionObserver fires `inView: true` at 90% threshold. | No special handling needed; native. |
| Fast fling past section | Browser momentum scroll passes through — no JS tries to stop it. Steps advance discretely per progress. Frame playback follows `effectiveActive` changes normally. If user flings past in under one `useMotionValueEvent` fire, they may see only the end frame — acceptable; no jump or teleport. | TRACK_EXTRA_VH=0.6 gives room at end so last step is visible long enough. |
| Orientation change / resize | sticky+native reflows automatically. `scrollYProgress` recomputes based on new layout. IntersectionObserver fires again from layout recalc. | No special handler needed. |
| Chat panel OPEN when section enters view | `scrollWindowInView && !isOpen` is `false` when `isOpen` is `true` — FAB stays visible. | Covered in step 16. |
| framer-motion useScroll on desktop | `scrollYProgress` is computed but `stepOpacities`/`stepYs` never appear in desktop JSX. No rendering cost. | Confirmed in step 18. |
| Preload gate IntersectionObserver (existing, line 72–86) | Uses `containerRef` which is now dual-assigned to `trackRef` as well — no conflict; IO only needs the element for observation, not exclusive ref ownership. | Callback-ref pattern in step 8. |
| SSR/hydration | framer-motion produces static MotionValue(0) on server. No window access outside useEffect. | Confirmed in step 17. |
| `fq-hide-header` fires on mount | Old engaged useEffect fired it only on `engaged` state change. New IntersectionObserver fires it when track enters viewport. Before section scrolls into view, `intersectionRatio < 0.9` so `inView: false` dispatched on cleanup only. No spurious hide on mount. | Verified by threshold + cleanup logic. |

---

## Blast Radius

**High confidence — contained:**
- Mobile visual behavior of ScrollWindow section
- Chat FAB visibility on mobile while ScrollWindow is in view

**Zero risk:**
- Desktop layout, desktop frame playback, desktop text scroll behavior
- `useSegmentedFrames` hook (no changes)
- `useFramePreloader` hook (no changes)
- `QuietNavbar` (existing `fq-hide-header` contract preserved, same semantics)
- Cookie-banner offset on ChatBubble (existing `fourlinq:cookie-visibility` logic untouched)
- Any page other than the home page

---

## Verification Evidence

### Build verification
```
npm run build
```
Pass criteria: zero TypeScript errors in `src/components/home/ScrollWindow.tsx` and `src/components/chat/ChatBubble.tsx`.

### Manual mobile verification checklist (Chrome DevTools — device emulation, iPhone SE or similar 375px)

1. **No scroll jump on enter (scroll down):** Scroll down to ScrollWindow section from above. Viewport smoothly scrolls into the section. No teleport. No jump. Page scrolls naturally.
2. **No scroll jump on enter (scroll up from below):** Scroll down past the section, then scroll back up. Same — no teleport.
3. **Fades track finger:** Scroll slowly through the section. Each text block fades in and out proportionally as finger moves. Opacity visibly tied to position, not triggered only on release.
4. **Step discrete state updates:** Verify `step` changes at each 25% progress boundary (use React DevTools or add temporary `console.log` to useMotionValueEvent callback, remove before final).
5. **Frame playback per step:** Step 0 (intro) → frame 1. Step 1 (weather) → frames 1–58 play. Step 2 (thermal) → frames 59–116 play. Step 3 (sound) → frames 118–186 play. Verify via visual observation.
6. **Thermal toggle works:** Advance to step 2 (thermal). Wait for `settled` = true (toggle enables). Toggle material uPVC ↔ Aluminium. Callout pins and ALU image cross-fade correctly.
7. **Header hides while in-view:** QuietNavbar disappears when >90% of track covers viewport. Reappears when scrolling out of section above or below.
8. **Chat bubble fades on mobile:** While scrolling through the section (>90% in view), the chat FAB is invisible and untappable. When scrolling out of the section, FAB reappears.
9. **Chat panel open case:** Open chat panel (scroll to section edge where FAB is visible, tap it). Then scroll so section covers viewport. Panel stays open; FAB button shows X (close) and remains visible.
10. **Desktop unchanged:** At >= 1024px viewport width, DevTools shows no change: scroll-driven text highlighting, active part cursor, frame playback, callout lines, no chat bubble change.
11. **Spacing on mobile:** Text starts near top (~4vh from sticky-top). Image is bottom-anchored with minimal bottom padding (~3vh). No visible dead zone mid-screen.
12. **Preload bar still works:** On first load before frames are ready, the loading bar appears at bottom of sticky area. Disappears when frames loaded.

---

## Dependencies

- `framer-motion ^12.34.3` — already installed, used in `HeroScroll3D.tsx` and `EditorialImage.tsx`. No new installation needed.
- No new npm packages.
- No schema changes, no API changes, no env var changes.

---

## Rollback

This is a self-contained component change. To rollback:
1. `git revert` the commit touching `ScrollWindow.tsx` and `ChatBubble.tsx`
2. The engagement JS machinery is fully defined in the reverted file; no external state dependencies

There is no database migration, no API contract change, and no other component touched, so rollback is safe and complete.

---

## Resume and Execution Handoff

**Execute this plan as a single pass.** No phases needed.

Steps to hand to vc-execute-agent:
1. Open `src/components/home/ScrollWindow.tsx`
2. Execute steps 1–14 in order (all within ScrollWindow.tsx)
3. Open `src/components/chat/ChatBubble.tsx`
4. Execute steps 15–16
5. Execute steps 17–20 (verification)

The plan file path for vc-execute-agent:
`process/general-plans/active/scrollwindow-mobile-sticky_PLAN_23-07-26.md`

# Mobile Auto-Play System Animation — PLAN

**Date:** 03-09-26  
**Complexity:** SIMPLE (single-session, one primary file + two call-site touches)  
**Status:** Active

---

## Goal

On mobile (touch/non-fine-pointer devices) only, the WebP frame-scrub animation inside
`SystemCardMedia` must auto-play forward, hold, then reverse once — triggered either by a
product card scrolling into view (once per mount) or by a drawer opening. Desktop hover
behavior must remain identical. `prefers-reduced-motion: reduce` disables auto-play entirely.

---

## Touchpoints

| File | Location | What changes |
|---|---|---|
| `src/components/shared/SystemCardMedia.tsx` | Props interface (lines 4–23) | Add `autoPlayInView` and `autoPlayOnMount` boolean props |
| `src/components/shared/SystemCardMedia.tsx` | `AnimatedMedia` inner function signature (lines 63–77) | Accept both new props |
| `src/components/shared/SystemCardMedia.tsx` | New `playOnce` logic block (insert after line 197) | `playOnce()` function + guard ref |
| `src/components/shared/SystemCardMedia.tsx` | Viewport observer `useEffect` (insert after line 197 block) | In-view auto-play observer |
| `src/components/shared/SystemCardMedia.tsx` | Mount auto-play `useEffect` (insert after viewport observer) | Delayed mount auto-play for drawer case |
| `src/components/shared/SystemCardMedia.tsx` | Cleanup `useEffect` (lines 220–228) | Add `clearTimeout` for auto-play timers |
| `src/pages/Products.tsx` | `ProductDrawer` → `SystemCardMedia` (line 110) | Add `autoPlayOnMount` |
| `src/pages/Products.tsx` | Card grid → `SystemCardMedia` (line 343) | Add `autoPlayInView` |
| `src/pages/SystemBucket.tsx` | `ProductPeek` → `SystemCardMedia` (line 209) | Add `autoPlayOnMount` |
| `src/pages/SystemBucket.tsx` | Card grid → `SystemCardMedia` (line 102) | Add `autoPlayInView` |

---

## Public Contract — New Props

Added to the outer `Props` interface and threaded through to `AnimatedMedia`:

```
autoPlayInView?: boolean   // default: false
autoPlayOnMount?: boolean  // default: false
```

Both default to `false` so every existing call site is unaffected until explicitly opted in.

`autoPlayInView` wires a one-shot viewport IntersectionObserver.  
`autoPlayOnMount` fires after a 400 ms mount delay (matching drawer slide-in duration).

Both are no-ops when `canHover` is true (desktop) or when `prefers-reduced-motion: reduce` is
set (guarded inside `playOnce`).

---

## The `playOnce()` Sequence

```
playOnce():
  1. Guard: if canHover → return (desktop, skip)
  2. Guard: if window.matchMedia("(prefers-reduced-motion: reduce)").matches → return
  3. Guard: if playOnceCalledRef.current === true → return  (prevent overlap/double-fire)
  4. Set playOnceCalledRef.current = true
  5. Wait for frames to be preloaded:
       poll/await preloadedRef.current (see "Frame Readiness" section below)
  6. Call playForward()
  7. setTimeout(holdTimer, FORWARD_MS + 300)   // 600 + 300 = 900 ms after step 6
       → inside timeout: call playReverse()
  8. Store both timeout IDs in refs for cleanup
```

Total visible duration: 600 ms forward + 300 ms hold + 440 ms reverse = 1340 ms.

---

## Frame Readiness

`preloadedRef.current` (line 85) becomes `true` only after the sequential decode loop
completes (lines 103–119). Auto-play must not call `playForward()` before this is `true`,
otherwise `showFrame()` will fall back to uncached URLs and may flicker or fail under memory
pressure.

Strategy: before calling `playForward()`, check `preloadedRef.current`. If it is already
`true`, proceed immediately. If not (card entered view before the preload IntersectionObserver
fired — unlikely given rootMargin 300px, but possible for cards already on-screen at mount),
poll with a short interval (e.g. `setInterval` every 50 ms, max 20 attempts = 1 s) until
`preloadedRef.current === true`, then proceed.

Store the interval ID in a ref and clear it in the cleanup `useEffect`.

---

## New Refs Required (add inside `AnimatedMedia`)

| Ref | Type | Purpose |
|---|---|---|
| `playOnceCalledRef` | `useRef<boolean>(false)` | Prevents double-fire if both mount and in-view triggers overlap |
| `holdTimerRef` | `useRef<ReturnType<typeof setTimeout> \| null>(null)` | Hold-phase timeout — cleared on unmount |
| `readyPollRef` | `useRef<ReturnType<typeof setInterval> \| null>(null)` | Readiness poll interval — cleared on unmount |

---

## Viewport Observer (for `autoPlayInView`)

```
useEffect:
  condition: autoPlayInView && !canHover
  create IntersectionObserver:
    threshold: 0.5         // fires when ≥50% of element is visible
    rootMargin: "0px"      // no early-fire; must actually be in view
    callback: on first intersecting entry → io.disconnect() → playOnce()
  observe wrapRef.current
  cleanup: io.disconnect()
```

This is a SEPARATE observer from the existing preload observer (lines 121–129). The preload
observer fires at rootMargin 300px and disconnects after preloading. The playback observer
uses threshold 0.5 and disconnects after the first play fires. Both can coexist safely because
they are created in separate `useEffect` calls with separate `IntersectionObserver` instances.

---

## Mount Auto-Play (for `autoPlayOnMount`)

```
useEffect:
  condition: autoPlayOnMount && !canHover
  mountTimerId = setTimeout(() => playOnce(), 400)  // 400 ms = drawer slide-in duration
  cleanup: clearTimeout(mountTimerId)
```

The 400 ms aligns with both drawers' Framer Motion `duration: 0.4`. `playOnce()` still
checks its own guard ref, so if somehow both `autoPlayOnMount` and `autoPlayInView` are
passed together and both fire, the second call is silently ignored.

---

## Cleanup — Updated `useEffect` (lines 220–228)

The existing cleanup effect only cancels `rafRef`. Extend it to also clear:

```
if (holdTimerRef.current != null) clearTimeout(holdTimerRef.current);
if (readyPollRef.current != null) clearInterval(readyPollRef.current);
```

No change needed to the `framesImgsRef.current = []` line — that stays as-is.

---

## Call Site Changes

### `src/pages/Products.tsx`

Line 110 — `ProductDrawer` (drawer, trigger="click"):
```
<SystemCardMedia
  ...existing props...
  trigger="click"
  autoPlayOnMount    // ADD THIS
/>
```

Line 343 — card grid (default trigger, no trigger prop):
```
<SystemCardMedia
  ...existing props...
  autoPlayInView    // ADD THIS
/>
```

### `src/pages/SystemBucket.tsx`

Line 209 — `ProductPeek` (drawer, trigger="click"):
```
<SystemCardMedia
  ...existing props...
  trigger="click"
  autoPlayOnMount    // ADD THIS
/>
```

Line 102 — card grid:
```
<SystemCardMedia
  ...existing props...
  autoPlayInView    // ADD THIS
/>
```

---

## Gating Logic Summary

| Condition | `autoPlayInView` | `autoPlayOnMount` |
|---|---|---|
| Desktop (`canHover === true`) | No-op | No-op |
| `prefers-reduced-motion: reduce` | No-op | No-op |
| Already played once (`playOnceCalledRef.current`) | No-op | No-op |
| Mobile, reduced-motion off, first mount/view | Plays once | Plays once |

`canHover` is evaluated at render time from `window.matchMedia("(hover: hover) and (pointer: fine)")` — the existing module-level const on line 235. `playOnce()` re-checks it at call time so SSR/hydration edge cases are safe.

---

## Blast Radius

- **Zero risk to desktop**: both new props default to `false`; no existing call site passes them.
- **Zero risk to `trigger="click"` toggle behavior**: `playOnce()` uses its own guard ref and does not mutate `openRef`.
- **Animation state**: `playOnce()` calls the existing `playForward()` and `playReverse()` functions — no rAF logic is duplicated.
- **Other components**: `SystemCardMedia` is a leaf component. No parent re-renders are triggered.

---

## Implementation Checklist

1. Open `src/components/shared/SystemCardMedia.tsx`.
2. Add `autoPlayInView?: boolean` and `autoPlayOnMount?: boolean` to the outer `Props` interface (after line 22).
3. Thread both props through the `SystemCardMedia` wrapper → `AnimatedMedia` (add to `AnimatedMedia` props destructure and the JSX call on lines 52–60).
4. Inside `AnimatedMedia`, add three new refs after line 93: `playOnceCalledRef`, `holdTimerRef`, `readyPollRef`.
5. Write the `playOnce()` function (after `playReverse()`, before `handleEnter`) implementing: canHover guard, reduced-motion guard, `playOnceCalledRef` guard, frame-readiness poll, `playForward()`, hold timeout, `playReverse()`.
6. Write the viewport-observer `useEffect` (after the preload observer effect, before the interaction handlers) conditional on `autoPlayInView && !canHover`.
7. Write the mount auto-play `useEffect` conditional on `autoPlayOnMount && !canHover`.
8. Extend the existing cleanup `useEffect` (lines 220–228) to clear `holdTimerRef` and `readyPollRef`.
9. In `src/pages/Products.tsx` line 110 (`ProductDrawer`): add `autoPlayOnMount` prop.
10. In `src/pages/Products.tsx` line 343 (card grid): add `autoPlayInView` prop.
11. In `src/pages/SystemBucket.tsx` line 209 (`ProductPeek`): add `autoPlayOnMount` prop.
12. In `src/pages/SystemBucket.tsx` line 102 (card grid): add `autoPlayInView` prop.

---

## Verification Checklist

| Test | Device/Condition | Expected |
|---|---|---|
| Card scroll-in | Mobile emulation (Chrome DevTools, no fine pointer) | Animation plays forward once, holds ~300 ms, reverses. Does NOT replay on scroll away and back. |
| Card scroll-in — second mount | Navigate away and back so card remounts | Animation plays again (new mount = new component instance, guard ref is fresh). |
| Drawer open | Mobile emulation, tap a product card | After ~400 ms delay (drawer fully in), animation plays forward, holds, reverses. No flicker at drawer open. |
| Desktop hover — unchanged | Desktop Chrome (fine pointer) | Hover plays forward; pointer leave reverses. No auto-play on scroll or mount. |
| Reduced motion | Any device, `prefers-reduced-motion: reduce` enabled in OS/DevTools | No auto-play fires. Desktop hover also already skips (existing guard). |
| Double-fire guard | Mobile, card visible immediately at mount (top of page) | Auto-play fires only once even if both `autoPlayInView` observer and `autoPlayOnMount` could theoretically fire. |
| Frame readiness | Throttle network to Slow 3G; scroll card into view | Animation waits for frames to decode before playing (no blank/flicker frames). |
| Unmount cleanup | Rapidly navigate away during hold phase | No "Can't call setState on unmounted component" warning; timeouts and observer cleanly cancelled. |

---

## Dependencies

- No new npm packages.
- No schema or API changes.
- Relies entirely on existing `playForward()`, `playReverse()`, `preloadedRef`, `canHover`, and `wrapRef` — all confirmed present in the current file.

---

## Resume and Execution Handoff

Primary execute file: `process/general-plans/active/mobile-autoplay-system-anim_PLAN_03-09-26.md`

Pass to `vc-execute-agent` with:
- Plan file path above
- `src/components/shared/SystemCardMedia.tsx` (primary implementation file)
- `src/pages/Products.tsx` (two call-site edits)
- `src/pages/SystemBucket.tsx` (two call-site edits)

Checklist items 1–8 must complete before items 9–12 (call sites depend on the new props existing).

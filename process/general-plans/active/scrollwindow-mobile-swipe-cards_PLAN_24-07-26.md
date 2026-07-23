# ScrollWindow Mobile Swipe Cards — Implementation Plan (v2)

**Date:** 24-07-26
**Complexity:** SIMPLE (single-session, ~25 atomic steps, 1 primary file + 1 verify-only file)
**Plan file:** `process/general-plans/active/scrollwindow-mobile-swipe-cards_PLAN_24-07-26.md`

> **SUPERSEDES** `process/general-plans/active/scrollwindow-mobile-sticky_PLAN_23-07-26.md`
> v1 was fully executed (scroll-progress + `useScroll`/`useTransform` approach). User
> feedback rejected it as laggy / low-framerate on iOS Safari. v2 replaces the entire
> mobile gesture layer with native touch events writing directly to MotionValues.

---

## Overview

Replace the scroll-progress-driven mobile text fades with a touch-driven swipe-card
engine. Each "step" is a single full-screen card. The user swipes up/down to navigate;
the active card tracks the finger 1:1 and fades proportionally. On release past
threshold, the card commits out and the next one springs in. The section is a single
static screen (`100lvh`), immune to Safari toolbar resize. Navigation to/from the
section uses a settle-based scroll-alignment engine (no hijacking). Header visibility
uses a scroll-settle engagement state machine instead of IntersectionObserver.

Desktop behavior is **strictly unchanged**.

---

## Goals

1. Touch events write directly to MotionValues — 60fps on iOS Safari, no React re-renders per move.
2. Swipe-card commit/spring-back with physics feel.
3. Section height uses `100lvh` on mobile — immune to Safari toolbar expand/collapse.
4. Image media box bottom-anchored to the physical screen bottom (remove `pb-[3vh]`).
5. Header hide/show based on scroll-settle detection, not IntersectionObserver threshold.
6. No scroll teleporting or hijacking on entry/exit (pass-through at first/last step).
7. All v1 scroll-progress machinery deleted.

---

## Scope

**In scope:**
- `src/components/home/ScrollWindow.tsx` — mobile logic, layout, imports, and gesture engine

**Out of scope (zero changes expected):**
- `src/components/chat/ChatBubble.tsx` — listener contract unchanged; verify only
- `src/components/layout/QuietNavbar.tsx` — `fq-hide-header` listener unchanged; verify only
- `src/hooks/useSegmentedFrames.ts` — `activeIndex = step - 1` contract preserved; unchanged
- `src/hooks/useFramePreloader.ts` — unchanged
- `src/data/scroll-window-phases.ts` — unchanged
- Desktop code paths (`isDesktop === true` branches) — zero changes

---

## Touchpoints

| File | Current Location | Nature of Change |
|---|---|---|
| `ScrollWindow.tsx` | Line 2 (imports) | Replace `useScroll, useTransform, useMotionValueEvent` with `useMotionValue, animate` |
| `ScrollWindow.tsx` | Line 48 (constant) | Delete `TRACK_EXTRA_VH = 0.6` |
| `ScrollWindow.tsx` | Line 57 (`trackRef`) | Delete `trackRef` ref; delete the dual-assignment on containerRef/trackRef (line 258-259) |
| `ScrollWindow.tsx` | Lines 64-65 (`step`, `stepRef`) | Keep both; `step` now driven by touch commit, not scroll-progress |
| `ScrollWindow.tsx` | Lines 98-125 (scroll hooks) | Delete `useScroll`, all `useMotionValueEvent`, all 8 `useTransform` arrays (`stepOpacities`, `stepYs`) |
| `ScrollWindow.tsx` | Lines 171-190 (mobile IO block) | Delete entire `useEffect` IntersectionObserver block for `fq-hide-header` / `fq-scrollwindow-inview` on mobile |
| `ScrollWindow.tsx` | New hook additions (after line 93) | Add `cardY = useMotionValue(0)`, `cardOpacity = useMotionValue(1)` |
| `ScrollWindow.tsx` | New useEffect (after IO removal) | Add scroll-settle engagement state machine (`sectionEngaged`) |
| `ScrollWindow.tsx` | New useEffect (after above) | Add native touch gesture engine (`touchstart`, `touchmove`, `touchend`, `touchcancel`) |
| `ScrollWindow.tsx` | Line 261 (outer container style) | Remove inline `{ height: ... dvh }` style; replace className with `max-lg:h-[100lvh]` (keep `h-screen` as base) |
| `ScrollWindow.tsx` | Line 266 (sticky/layout div) | Remove `sticky top-0`; change `pb-[3vh]` → `pb-0`; keep `lg:items-center lg:pb-0`; layout div becomes `flex h-[100lvh] max-lg:h-[100lvh]` on mobile or simply part of non-sticky normal flow |
| `ScrollWindow.tsx` | Lines 342-388 (mobile step overlays) | Replace `style={{ opacity: stepOpacities[i], y: stepYs[i] }}` with card engine bindings; inactive cards get `style={{ opacity: 0 }}` + `aria-hidden` + `pointer-events-none` |

---

## Public Contracts

| Contract | Direction | Shape | Change? |
|---|---|---|---|
| `fq-hide-header` CustomEvent | ScrollWindow → QuietNavbar | `detail: boolean` | Dispatch logic changes (scroll-settle replaces IO) — shape unchanged |
| `fq-scrollwindow-inview` CustomEvent | ScrollWindow → ChatBubble | `detail: { inView: boolean }` | Dispatch logic changes — shape unchanged |
| `effectiveActive = step - 1` | ScrollWindow → useSegmentedFrames | `number` | Unchanged |
| `step` state | Internal mobile card state | `0..STEP_COUNT-1` | Now driven by touch commit, not scroll-progress |

---

## Blast Radius

- **ScrollWindow.tsx**: significant rewrite of mobile logic block; desktop untouched.
- **QuietNavbar.tsx**: receives same event shape — no code change, but must be verified to hide/show correctly with new dispatch.
- **ChatBubble.tsx**: receives same event shape — no code change, must be verified FAB fades correctly.
- **useSegmentedFrames.ts**: no change; `effectiveActive` contract preserved.
- **iOS Safari layout**: `100lvh` is the large viewport unit (stable — does not resize on toolbar change). If the browser does not support lvh, `h-screen` fallback is retained.

---

## v1 Code to Delete (grep-proof terms)

Execute must verify NONE of these survive in the mobile code paths after the edit:

| Symbol / string | Location in v1 | Action |
|---|---|---|
| `useScroll` | Line 2 import, line 98 call | Delete from import and from hook call |
| `useTransform` | Line 2 import, lines 114-124 | Delete from import and all 8 `useTransform(...)` calls |
| `useMotionValueEvent` | Line 2 import, lines 104-111 | Delete from import and hook call |
| `TRACK_EXTRA_VH` | Line 48 declaration, line 261 usage | Delete constant and the inline style that uses it |
| `scrollYProgress` | Lines 98-124 | Delete (returned by `useScroll`) |
| `stepOpacities` | Lines 114-118, lines 344, 374 | Delete array and all array-index usages |
| `stepYs` | Lines 120-124, lines 344, 374 | Delete array and all array-index usages |
| `trackRef` | Line 57 declaration, lines 258-259 dual-assign, line 99 `useScroll` target | Delete all three locations |
| IntersectionObserver (mobile IO block) | Lines 171-190 | Delete entire useEffect block |

---

## Implementation Checklist

### Phase A — Imports and Constants

1. **ScrollWindow.tsx line 2**: Change framer-motion import line. Remove `useScroll`, `useTransform`, `useMotionValueEvent`. Add `useMotionValue`, `animate`. Keep `motion`. Result: `import { motion, useMotionValue, animate } from "framer-motion";`

2. **ScrollWindow.tsx line 48**: Delete the line `const TRACK_EXTRA_VH = 0.6;` and its comment block entirely.

### Phase B — Ref and Hook Removals

3. **ScrollWindow.tsx line 57**: Delete `const trackRef = useRef<HTMLDivElement>(null);` entirely.

4. **ScrollWindow.tsx lines 98-125**: Delete the entire block from `// ── framer-motion scroll progress` comment through the closing `];` of `stepYs`. This removes `useScroll`, `useMotionValueEvent`, `stepOpacities[0..3]`, and `stepYs[0..3]`.

### Phase C — New MotionValues

5. **ScrollWindow.tsx** (insert after `stepRef` declaration, ~line 65): Add two unconditional MotionValue declarations:
   ```
   const cardY = useMotionValue(0);
   const cardOpacity = useMotionValue(1);
   ```
   These must be unconditional (Rules of Hooks). Both are used only on mobile but declared at top level.

### Phase D — Delete v1 Mobile IntersectionObserver Block

6. **ScrollWindow.tsx lines 171-190**: Delete the entire `// ── Mobile: IntersectionObserver fires...` useEffect block (the one with `io.observe(el)` checking `intersectionRatio >= 0.9`). The replacement dispatch logic will be inside the new scroll-settle useEffect in Phase E.

### Phase E — Scroll-Settle Engagement State Machine

7. **ScrollWindow.tsx** (insert new `useEffect` after the desktop scroll-poll useEffect, roughly where line 169 ends): Add mobile engagement state machine.

   The logic (no code in plan — executor implements from this spec):
   - Guard: `if (isDesktop) return;`
   - Local mutable state (inside useEffect, via refs — no extra useState): `armedRef` (starts `true`), `prevSectionTopRef` (tracks last known top for entry-direction detection), `settleTimerRef`.
   - Cache section height once on mount: `cachedHeight = containerRef.current.getBoundingClientRect().height`. Do NOT re-read on toolbar resize.
   - `dispatchInSection(flag: boolean)`: dispatches `fq-hide-header` (detail = flag) and `fq-scrollwindow-inview` (detail: { inView: flag }).
   - Scroll handler (passive, on `window`): reads `top = containerRef.current.getBoundingClientRect().top`. Re-arms: if `Math.abs(top) > 80`, set `armedRef = true`. Clears and restarts `settleTimer` (120ms debounce, with `scrollend` event as preferred trigger when `'onscrollend' in window`).
   - On settle (timer fires): if `armedRef && Math.abs(top) <= 48`: align with `window.scrollTo({ top: window.scrollY + top, behavior: 'smooth' })`, set `armedRef = false`, set `step` to `prevSectionTopRef > 0 ? 0 : STEP_COUNT - 1` (approaching from above → step 0; from below → last step), dispatch `dispatchInSection(true)`, reset `cardY` and `cardOpacity` to resting values (0 and 1).
   - On settle: if `|top| > 48` and section is not covering the screen: `dispatchInSection(false)`.
   - Cleanup: `dispatchInSection(false)`.

### Phase F — Touch Gesture Engine

8. **ScrollWindow.tsx** (insert new `useEffect` after the scroll-settle useEffect): Add native touch gesture engine.

   The logic spec (executor implements from this spec):

   **Refs needed (declare as `useRef` at top of component, unconditionally):**
   - `animatingRef` — boolean, prevents new gesture during commit animation
   - `touchStartYRef` — number
   - `touchLastYRef` — number
   - `touchSamplesRef` — `Array<{y: number, t: number}>` (last ~3 samples for velocity)
   - `gestureDirectionRef` — `'up' | 'down' | null` (locked after first 6px movement)
   - `gestureCapturedRef` — boolean (whether we called preventDefault)

   Add these ref declarations near the other refs at the top of the component (unconditionally).

   **useEffect guard:** `if (isDesktop) return;` Attach to `containerRef.current`. Cleanup removes all listeners.

   **touchstart handler** (passive — never call preventDefault here):
   - If `animatingRef.current` is true: ignore (but do not call preventDefault — event must propagate).
   - Record `touchStartYRef = e.touches[0].clientY`, `touchLastYRef = same`, clear `touchSamplesRef`, clear `gestureDirectionRef` to null, `gestureCapturedRef = false`.

   **touchmove handler** (registered with `{ passive: false }`):
   - If `animatingRef.current`: return (do not preventDefault — let it scroll).
   - Compute `dy = e.touches[0].clientY - touchStartYRef`.
   - If `gestureDirectionRef.current === null && Math.abs(dy) > 6`: lock direction. Then:
     - If `dy < 0` (swipe up) and `step === STEP_COUNT - 1`: set `gestureCapturedRef = false` (pass-through). Emit `dispatchInSection(false)` so header re-appears and chat bubble restores while user scrolls out.
     - If `dy > 0` (swipe down) and `step === 0`: set `gestureCapturedRef = false` (pass-through). Emit `dispatchInSection(false)`.
     - Otherwise: set `gestureCapturedRef = true`. Call `e.preventDefault()`.
   - If `gestureCapturedRef` is false: return (let native scroll happen).
   - Call `e.preventDefault()`.
   - Update `touchLastYRef = e.touches[0].clientY`. Push `{ y: currentDy, t: Date.now() }` to `touchSamplesRef` (keep last 3).
   - `cardY.set(currentDy)`.
   - `cardOpacity.set(Math.max(0, 1 - Math.abs(currentDy) / 260))`.

   **touchend handler**:
   - If not `gestureCapturedRef`: return.
   - Compute `dy = touchLastYRef - touchStartYRef`.
   - Compute velocity from last 2-3 samples: `v = (y_last - y_first) / (t_last - t_first)` in px/ms. Default 0 if not enough samples.
   - **Commit condition:** `Math.abs(dy) > 60 || Math.abs(v) > 0.5` AND direction matches dy.
   - If commit: call `commitCard(dy < 0 ? 'up' : 'down')`.
   - Else: spring back — `animate(cardY, 0, { type: 'spring', stiffness: 380, damping: 32 })`, `animate(cardOpacity, 1, { duration: 0.18 })`.

   **touchcancel handler**: spring back (same as not-commit path above).

   **commitCard(direction: 'up' | 'down')** (define inside useEffect or as a stable ref callback):
   - Set `animatingRef.current = true`.
   - Animate card out: `animate(cardY, direction === 'up' ? -140 : 140, { duration: 0.16, ease: 'easeOut' })`, `animate(cardOpacity, 0, { duration: 0.14 })`.
   - On animation complete callback:
     - Compute `next = direction === 'up' ? step + 1 : step - 1` (clamped to `[0, STEP_COUNT-1]`; guards prevent out-of-range commits but clamp anyway).
     - `setStep(next)` (React re-render will swap which card is "active").
     - Set entry pose for incoming card: `cardY.set(direction === 'up' ? 36 : -36)`, `cardOpacity.set(0)`.
     - Spring in: `animate(cardY, 0, { type: 'spring', stiffness: 300, damping: 30 })`, `animate(cardOpacity, 1, { duration: 0.28 })`.
     - On spring complete: `animatingRef.current = false`.

   **Note on `step` in touchmove/touchend**: The gesture useEffect reads `step` but must not close over a stale value. Use a `stepRef` (already exists in the component) to read the current step inside event handlers.

### Phase G — Container Layout

9. **ScrollWindow.tsx line 261**: Remove the outer container's `style={!isDesktop ? { height: ... } : undefined}` prop entirely. The outer `<div>` is now a static `relative bg-[color:var(--canvas)]` with no inline height override. On mobile `max-lg:h-[100lvh]` on the inner layout div provides the height.

10. **ScrollWindow.tsx lines 258-260**: Remove the dual-assignment `ref` callback that assigned both `containerRef.current` and `trackRef.current`. Replace with a single `ref={containerRef}`.

### Phase H — Inner Layout and Media Box

11. **ScrollWindow.tsx lines 264-268** (the `stickyRef` div — currently the sticky layout wrapper): On mobile, this div is no longer sticky; it just fills the section height. Change:
    - Remove `sticky top-0` classes from the mobile path. Simplest approach: keep `sticky top-0` in the className but add `max-lg:static max-lg:relative` to override, OR restructure using `isDesktop` conditional rendering for the wrapper classname. Choose whichever produces the smallest diff. If using conditional classname: `className={cn(!isDesktop ? "flex w-full h-[100lvh] overflow-hidden bg-[color:var(--canvas)] items-end" : "sticky top-0 flex h-screen w-full overflow-hidden bg-[color:var(--canvas)] items-end pb-[3vh] lg:items-center lg:pb-0")}`.
    - Remove `pb-[3vh]` on mobile (the safe-area padding keeping media above the Safari toolbar). Desktop `lg:pb-0` stays. The media box should sit flush with the physical screen bottom on mobile.
    - Remove the inline `style={!isDesktop ? { height: "100dvh" } : undefined}` (now handled by Tailwind `h-[100lvh]` in the className).

    **Exact target for mobile path:** `flex w-full h-[100lvh] overflow-hidden bg-[color:var(--canvas)] items-end`
    **Exact target for desktop path (lg+):** `sticky top-0 flex h-screen w-full overflow-hidden bg-[color:var(--canvas)] lg:items-center lg:pb-0`

### Phase I — Mobile Card Overlay Bindings

12. **ScrollWindow.tsx lines 339-389** (mobile step text overlay block): Rewrite the step motion.div bindings.

    **Active card (step === i):** `style={{ y: cardY, opacity: cardOpacity }}`. Keep `className`, keep `aria-hidden={step !== i}`.
    **Inactive cards (step !== i):** `style={{ opacity: 0 }}` + add `className` token `pointer-events-none` (or inline style `pointerEvents: 'none'`) + `aria-hidden={true}`. Remove any `stepOpacities` / `stepYs` style references.
    **`will-change` hint:** Add `style` property `willChange: 'transform, opacity'` to the active card's style object (or include it always — it's cheap). Framer-motion may apply it automatically via `layout` or `animate` props but explicit is safer here since we're using raw MotionValues.

    Concrete structure for step 0 (intro card), applying the pattern:
    ```
    <motion.div
      className="absolute inset-x-0 top-0 px-6 pt-[4vh] pointer-events-auto"
      aria-hidden={step !== 0}
      style={step === 0
        ? { y: cardY, opacity: cardOpacity, willChange: 'transform, opacity', pointerEvents: 'auto' }
        : { opacity: 0, pointerEvents: 'none' }}
    >
    ```
    Same pattern for each of the `WINDOW_PARTS.map` steps (i+1). Note: the `pointer-events-auto` Tailwind class on the className is fine for the active card but will be overridden by the inline `pointerEvents: 'none'` on inactive cards — the inline style wins.

13. **ScrollWindow.tsx**: Verify `aria-hidden` attribute logic is correct on all step cards: `aria-hidden={step !== i}` for parts, `aria-hidden={step !== 0}` for intro.

### Phase J — Ref Declarations Audit

14. **ScrollWindow.tsx refs block (~lines 51-57)**: Add the new gesture refs declared unconditionally:
    - `const animatingRef = useRef(false);`
    - `const touchStartYRef = useRef(0);`
    - `const touchLastYRef = useRef(0);`
    - `const touchSamplesRef = useRef<Array<{ y: number; t: number }>>([]);`
    - `const gestureDirectionRef = useRef<'up' | 'down' | null>(null);`
    - `const gestureCapturedRef = useRef(false);`

    Delete `const trackRef = useRef<HTMLDivElement>(null);` from this block (already called out in step 3 — confirm it's gone).

### Phase K — Orientation Change

15. **ScrollWindow.tsx** (inside the scroll-settle useEffect from Phase E): Add `orientationchange` event listener on `window` that re-reads section top and re-dispatches `dispatchInSection(false)` to release the header and chat bubble; also resets card to resting state (`cardY.set(0)`, `cardOpacity.set(1)`, `setStep(0)`). This prevents stale layout assumptions after rotation.

---

## Edge Cases — Must Be Handled

| Edge Case | Handling |
|---|---|
| Multi-touch | In `touchstart`, if `e.touches.length > 1` (detected in `touchmove`): if `gestureCapturedRef` is true, do spring-back and release gesture (do not `preventDefault` on multi-touch). |
| Touch starts on MaterialToggle / interactive element | Only capture gesture after 6px movement with `gestureDirectionRef` lock. Never call `preventDefault` on `touchstart`. Tap targets remain fully interactive. |
| New touch during commit animation | `animatingRef.current === true` → touchstart and touchmove handlers return early without preventing default — native scroll or tap proceeds normally. |
| Fast fling past the section (never settles in zone) | Settle timer never fires with `|top| <= 48` → section never engages → native scroll exits natively. |
| Re-entry from below | `prevSectionTopRef` was negative (bottom of page) → on settle `step = STEP_COUNT - 1` (last step shown). |
| Safari toolbar expand/collapse | `100lvh` is the large viewport unit — does not change when toolbar collapses. `cachedHeight` read once on mount; not re-read on resize. Inner layout does not depend on `window.innerHeight`. |
| Orientation change | Phase K handles: resets step, card state, and dispatches `inSection: false`. |
| Rapid swipes (commit before spring finishes) | `animatingRef.current` blocks new gesture during commit animation sequence (including the spring-in phase). A new touch after spring completes works normally. |
| Section not visible (nearViewport = false) | Touch engine is still attached but has nothing to navigate (step stays 0). Scroll-settle won't fire because section is not near the viewport. No harm. |

---

## What Stays Untouched (Proof Boundaries)

- `isDesktop` branch code from line 131 onward (desktop scroll poll, desktop text panels, desktop trailing div) — not touched.
- `effectiveActive = isDesktop ? activeIndex : step - 1` — preserved exactly. The `step` variable (now touch-driven) feeds `useSegmentedFrames` via the same `-1` offset.
- `useFramePreloader`, canvas drawing effect, material fade, ALU image cross-fade — untouched.
- `PhaseCalloutLines`, `PhaseCalloutMarkers`, `MaterialToggle` — untouched.
- `PartBody` sub-component — untouched.
- `QuietNavbar.tsx` line 329 (`onHide` handler expecting `detail: boolean`) — no change needed; new dispatch matches existing contract.
- `ChatBubble.tsx` lines 22-31 (`fq-scrollwindow-inview` listener expecting `detail: { inView: boolean }`) — no change needed.

---

## Dependencies

- `framer-motion` already installed; `useMotionValue` and `animate` (imperative) are available in the installed version — no new packages.
- `100lvh` (`h-[100lvh]` Tailwind arbitrary value) — supported in Safari 15.4+; `h-screen` fallback covers older browsers (the `h-screen` base class is kept in the desktop/fallback path).
- `scrollend` event — used when `'onscrollend' in window`; timer fallback covers Safari where it is not yet available.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `animate` imperative function creates conflicting animations if called twice in quick succession | `animatingRef` blocks new gestures during commit; spring-back uses a single `animate` call so double-calls are unlikely; framer-motion cancels prior animations on the same target automatically |
| `step` closure stale value in touch handlers | Use `stepRef.current` (already exists) inside touch event handlers; `stepRef` is updated in the same `setStep` call chain via a `useEffect` that syncs it |
| `scrollend` not firing on some browsers | 120ms `setTimeout` fallback covers all cases |
| `100lvh` not supported (Safari < 15.4) | `h-screen` fallback retained in all paths |
| `dispatchInSection(false)` not firing on unmount / route change | Cleanup function in both scroll-settle and gesture useEffects dispatches false |
| Gesture refs stale between isDesktop changes | Both useEffects guard on `isDesktop` and re-run when it changes (it's in the dep array) |

---

## Verification Strategy

### Build Check

- Run `npm run build` (or `tsc --noEmit`) — must produce zero TypeScript errors.
- Confirm no references to deleted symbols remain: search for `TRACK_EXTRA_VH`, `scrollYProgress`, `stepOpacities`, `stepYs`, `trackRef`, `useScroll`, `useTransform`, `useMotionValueEvent` in `ScrollWindow.tsx` after the edit — must return zero results.

### Manual Verification Checklist (Mobile — iOS Safari preferred)

1. **Single screen, no extra scroll**: The ScrollWindow section occupies exactly one screen on mobile. There is no extra scroll track below the section within it.
2. **Toolbar immunity**: Expand and collapse the Safari toolbar while inside the section — the layout must not reflow or stutter.
3. **Swipe up**: Drag upward on the text area. The active card follows the finger 1:1 in Y; it fades as displacement increases. Release below threshold → springs back smoothly.
4. **Commit forward**: Swipe up past threshold (or with velocity) → card flies off upward, next card springs in from below. Step indicator advances by 1. Image frames update (useSegmentedFrames fires new segment).
5. **Commit backward**: Swipe down past threshold → card flies off downward, previous card springs in from above. Step decrements.
6. **Last step pass-through**: At step 3 (last), swipe up — card does NOT animate; native scroll exits the section downward. Header restores and chat bubble restores.
7. **First step pass-through**: At step 0, swipe down — native scroll exits the section upward. Header restores.
8. **Header hide**: Settle into the section → header slides up (hidden). Scroll out → header slides back.
9. **Chat bubble**: While in section (step > 0 or settled at step 0), chat FAB is hidden. Scroll out or commit past last step → FAB restores.
10. **Tap on thermal toggle**: On step 3 (thermal part), tap MaterialToggle — toggle fires correctly. No unintended swipe capture.
11. **Image media box**: The canvas / poster sits flush with the physical bottom of the screen — no gap from the Safari bottom bar.
12. **Desktop unchanged**: On viewport >= 1024px, all desktop scroll panels, connector lines, and sticky media behave identically to before.
13. **Orientation change**: Rotate to landscape → section resets to step 0, header restores, no layout breakage.

### Regression Guard

- Desktop: scroll through the full section, verify all three parts animate correctly and the header hides/shows on the desktop logic path.
- ChatBubble on desktop: verify FAB is NOT hidden on desktop when ScrollWindow is in view (ChatBubble has a `mq.matches` guard — confirm it still works).

---

## Resume and Execution Handoff

**Plan path (exact):** `process/general-plans/active/scrollwindow-mobile-swipe-cards_PLAN_24-07-26.md`

**Single file to implement:** `src/components/home/ScrollWindow.tsx`

**Files to verify (no changes):** `src/components/chat/ChatBubble.tsx`, `src/components/layout/QuietNavbar.tsx`

**Execution order:** Phases A → B → C → D → E → F → G → H → I → J → K (sequential — each phase's deletions and additions are prerequisites for the next).

**Superseded plan:** `process/general-plans/active/scrollwindow-mobile-sticky_PLAN_23-07-26.md` — archive to `process/general-plans/completed/` after this plan executes successfully.

---

## Amendment 1 — Bug Fixes (2026-07-24)

Applied two post-execution bug fixes to `src/components/home/ScrollWindow.tsx`. Both were pre-approved by the orchestrator before EXECUTE entered.

### Bug A (critical): touch capture had no engagement gate

**Root cause:** The gesture engine's `onTouchMove` direction-lock block evaluated `gestureCapturedRef` and called `e.preventDefault()` regardless of whether the section was fully settled in view. A user whose page had partially scrolled the section into view would have native scroll hijacked on any touch landing on the element.

**Fix — 5 changes across 2 useEffects:**

1. Added `const engagedRef = useRef(false)` at component top level (line 59), unconditional, alongside other gesture refs.
2. Scroll-settle `onSettle` (line 178): `engagedRef.current = true` in the `armedRef && |top| <= 48` branch — marks the section as engaged when the snap-align fires.
3. Scroll-settle `onScroll` (line 214): `engagedRef.current = false` in the `Math.abs(top) > 80` re-arm block — disengages when the user scrolls away.
4. Scroll-settle `onOrientationChange` (line 230): `engagedRef.current = false` — disengages on rotation.
5. Scroll-settle cleanup (line 247): `engagedRef.current = false` — disengages on unmount or `isDesktop` change.
6. Touch engine `onTouchMove` direction-lock (lines 348-352): when `!engagedRef.current`, lock `gestureDirectionRef` to a non-null sentinel and set `gestureCapturedRef = false`, then return — the whole gesture becomes pass-through with no further re-evaluation.
7. Touch engine pass-through branches at first/last step (lines 359, 371): set `engagedRef.current = false` so that a swipe-out immediately disengages the section rather than leaving it falsely engaged for the next touch.

### Bug B (moderate): stale gesture refs across a commit animation caused card teleport

**Root cause:** `onTouchStart` returned early when `animatingRef.current` was true without resetting the gesture refs. A new touch during the ~450ms commit animation inherited the previous gesture's `gestureCapturedRef = true`, stale `touchStartYRef`, stale `gestureDirectionRef`, and stale `touchSamplesRef`. When the animation completed mid-gesture, the next `onTouchMove` computed `dy` from the stale start position and called `cardY.set(hugeDy)` — the card teleported. Rapid successive swipes (the primary interaction) triggered this on almost every second swipe.

**Fix — restructured `onTouchStart` (lines 302-324):**

Ref resets (`touchStartYRef`, `touchLastYRef`, `touchSamplesRef`, `gestureDirectionRef = null`, `gestureCapturedRef = false`) now happen unconditionally before any early return. The multi-touch early-return still fires after resetting. The `animatingRef.current` early return still fires after resetting — but now the refs are clean, so when `onTouchMove` eventually gets its first post-animation move event, `dy` is measured from the correct current finger position and the direction-lock evaluates correctly from a clean slate.

**Behavioral note on rapid swiping (confirmed correct):** With Bug B fixed, `touchStartYRef` is captured at touchstart time (which may be mid-animation). `onTouchMove` returns early while `animatingRef` is true so no capture happens. Once the animation ends and `animatingRef` becomes false, the next `onTouchMove` computes `dy = currentY - touchStartYRef` from the captured touchstart — which is the correct delta since the finger last landed. The direction-lock then fires normally from that delta. This is the intended behavior.

### Verification

- `npm run build` — zero TypeScript errors.
- `npm test` — 109/109 tests pass.
- Grep confirmed `engagedRef.current` is written in all 4 required locations (engage, re-arm, orientation, cleanup) plus 2 pass-through exit points.
- Grep confirmed `onTouchStart` has no path that reaches an early return before the ref resets.

---

## Amendment 2 — Runtime Bug Fixes (2026-07-24)

Applied two runtime bug fixes discovered via browser verification (headless Chrome, 390x844 touch emulation). Pre-approved by orchestrator before EXECUTE entered.

### Failure 1 — Capture race (critical): `preventDefault` too late

**Root cause:** The prior approach registered `touchmove` with `{ passive: false }` and called `e.preventDefault()` only after the 6 px direction-lock fired. By that time the browser had already started native scrolling for the gesture. Subsequent `touchmove` events had `cancelable = false`, producing "Ignored attempt to cancel a touchmove" warnings (×6 per test run). On iOS Safari the behavior is worse: one of three sequential card swipes was silently swallowed and the page scrolled instead.

**Fix A — Deterministic capture via `touch-action` CSS (replaces race-prone pass-through model):**

The fix shifts gesture ownership to the CSS `touch-action` property so the browser never starts native scroll while the section is engaged.

1. **Fix A1 (line 185):** On engage (settle branch), set `el.style.touchAction = "none"` on the container element alongside `engagedRef.current = true`. Browser will not initiate native scroll for any subsequent touch while this is set.
2. **Fix A2 (line 220):** Restore `el.style.touchAction = ""` in `onScroll` re-arm block (`|top| > 80`).
3. **Fix A3 (line 237):** Restore `el.style.touchAction = ""` in `onOrientationChange`.
4. **Fix A4 (line 255):** Restore `el.style.touchAction = ""` in scroll-settle cleanup.
5. **Fix A5 (lines 374, 388):** Boundary exits (swipe-up at last step / swipe-down at step 0) now use an EXIT GLIDE instead of pass-through. With `touch-action: none` in effect the browser won't scroll, so the code calls `window.scrollBy({ top: ±(window.innerHeight * 0.55), behavior: "smooth" })` to programmatically exit the section. Both paths restore `el.style.touchAction = ""` and set `engagedRef.current = false` before firing `dispatchInSection(false)`. `gestureDirectionRef` is locked non-null so the glide fires at most once per gesture.
6. **Fix A6 (line 456):** Restore `el.style.touchAction = ""` in touch gesture engine cleanup.
7. The `!engagedRef.current` early-decision gate from Amendment 1 is preserved unchanged: not-engaged touches never capture (touchAction is "" at that point, so native scroll is untouched).
8. `e.preventDefault()` in the captured path is kept as belt-and-braces (harmless now that touch-action prevents the race).

**touchAction restore path count: 6** (A2, A3, A4, A5×2, A6) — covers every disengage path.

### Failure 2 — Sub-pixel engagement flap: strict `coversScreen` false-disengages on fractional scroll positions

**Root cause:** Section top computed as `928.39px`. `window.scrollTo` aligns to integer `928` → residual top = `+0.39 px`. The settle handler's `coversScreen = top <= 0 && bottom >= vh` condition was strict: `0.39 > 0` made it evaluate as "not covering screen". Every subsequent settle dispatched `fq-hide-header:false` / `fq-scrollwindow-inview:{inView:false}` while still engaged → chat FAB never hid, header flapped on every micro-scroll.

**Fix B — Epsilon + hysteresis + dedupe:**

6. **Fix B1 (lines 193–197):** Replace strict `coversScreen` check in the `onSettle` else-branch with loose bounds: `const stillIn = top <= 56 && top + cachedHeight >= window.innerHeight - 56;` — 56 px epsilon tolerates sub-pixel and minor toolbar-induced drift.
7. **Fix B2 (lines 168–171, 273–276):** Dedupe dispatches in both `dispatchInSection` closures (scroll-settle useEffect and touch gesture useEffect). Each closure tracks `let lastDispatchFlag: boolean | null = null` and returns early when `flag === lastFlag`. Keeps the event stream clean since `QuietNavbar` and `ChatBubble` listeners are stateful.
8. **Fix B3 (lines 179–182):** Skip the smooth-align glide in the engage branch when `Math.abs(top) < 1` — avoids a no-op smooth scroll from kicking off settle churn when the section is already pixel-aligned.

### Verification

- `npm run build` — zero TypeScript errors; built in 4.04 s.
- `npm test` — 109/109 tests pass.
- Grep confirmed `touchAction = "none"` set at engage (line 185); `touchAction = ""` restored on 6 disengage paths (lines 220, 237, 255, 374, 388, 456).
- Grep confirmed `stillIn` loose bounds present (line 194).
- Grep confirmed both `dispatchInSection` closures deduped with `lastDispatchFlag` (lines 168–171 and 273–276).
- Grep confirmed `Math.abs(top) >= 1` skip-glide guard present (line 180).

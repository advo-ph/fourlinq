# ScrollWindow Mobile Sticky-Catch — Implementation Plan (v3)

**Date:** 24-07-26
**Complexity:** SIMPLE (single-session, ~30 atomic steps, 1 primary file)
**Plan file:** `process/general-plans/active/scrollwindow-mobile-sticky-catch_PLAN_24-07-26.md`

> **SUPERSEDES** `process/general-plans/active/scrollwindow-mobile-swipe-cards_PLAN_24-07-26.md`
> v2 was fully executed and verified (native touch + scroll-settle engagement machine, Amendments 1 and 2 applied).
> User feedback on v2 drives these four v3 changes.

---

## User Feedback (v2 Post-Verification, All Pre-Approved)

1. **Section doesn't catch** — scrolling through just passes it by. The 48px settle window is too weak against real momentum. Wants it to "act like it's sticky — naturally stays on the screen as I scroll."
2. **Media box 4:3 landscape** instead of 1:1 square — shorter height, center-cropped.
3. **Text fades out faster** — less swipe distance before it disappears/commits.
4. **No debounce between card swipes** — mid-commit touches currently ignored for ~500ms; wants instant rapid-fire swipe.

---

## Overview

v3 replaces the scroll-settle engagement machine entirely with CSS `sticky` geometry on
mobile. The outer container becomes a 260lvh scroll track; the inner layout div is made
`sticky top-0` on mobile so CSS naturally pins the section while the track's scroll
height is consumed. Engagement is now derived from the track's bounding rect, not a
settle timer. Commits become synchronous and interruptible — no onComplete chaining, no
animatingRef debounce. Media box changes from `aspect-square` to `aspect-[4/3]`. Fade
and commit constants tighten. Desktop is strictly unchanged.

---

## Goals

1. CSS sticky pin provides natural "catch" — no JS scroll alignment, no settle timer.
2. Fast deliberate flings (> ~160lvh momentum) pass through; everything else stays pinned.
3. Media box is 4:3 (landscape), bottom-flush, center-cropped via `object-cover`.
4. Pin markers remain correctly positioned (no coordinate adjustment — see analysis below).
5. Text fade visible at 100px displacement (opacity ~0.17 instead of ~0.62).
6. 50px slow drag commits (down from 60px); velocity threshold 0.35px/ms (down from 0.5).
7. Rapid successive swipes all land with no missed inputs.
8. Desktop behavior strictly unchanged.

---

## Scope

**In scope:**
- `src/components/home/ScrollWindow.tsx` — all four changes

**Out of scope (no changes):**
- `src/components/chat/ChatBubble.tsx` — verify only
- `src/components/layout/QuietNavbar.tsx` — verify only
- `src/hooks/useSegmentedFrames.ts` — unchanged
- `src/hooks/useFramePreloader.ts` — unchanged
- `src/data/scroll-window-phases.ts` — unchanged
- `src/components/home/PhaseCalloutMarkers.tsx` — unchanged (see pin analysis)
- `src/components/home/PhaseCalloutLines.tsx` — unchanged (desktop only)
- Desktop code paths (`isDesktop === true` branches) — zero changes

---

## Pin Coordinate Analysis (Why No Adjustment Is Needed)

The existing pin wrapper inside the media box (ScrollWindow.tsx line 577) is:

```
<div className="pointer-events-none absolute left-1/2 top-0 h-full aspect-[1920/1080] -translate-x-1/2">
```

This wrapper is always 16:9 (`aspect-[1920/1080]`), always fills the full box height (`h-full`),
and is centered. The `PhaseCalloutMarkers` places pins at `left: anchor.x%` / `top: anchor.y%`
within this 16:9 wrapper — they map directly onto the rendered image coordinates, regardless of
the outer box aspect ratio.

**With `aspect-square` (v2):** `object-cover` scales the 16:9 source to fill height H. Rendered
image is (16/9)H wide × H tall. The 16:9 wrapper is also (16/9)H × H — an exact match. Pins map
correctly.

**With `aspect-[4/3]` (v3):** Box is W × (3W/4). `object-cover` again scales to fill height:
rendered image is (4W/3) × (3W/4). The 16:9 wrapper at full height is (16/9)(3W/4) = (4W/3) wide
— still an exact match to the rendered image. Pins still map correctly.

All current callout anchors (x: 36–55%, y: 47–76%) fall within the central 75% of the image
width that is visible in a 4:3 box — none are clipped. **No pin coordinate adjustment required.**

**Canvas draw path:** `ctx.drawImage(img, 0, 0)` at the canvas's native image dimensions, then
CSS `object-cover` applies the crop. The canvas element itself carries `object-cover` so the
center-crop happens at the CSS rendering stage, not in the draw call. No change to canvas code.

---

## Touchpoints

| File | Lines (current tree) | Nature of Change |
|---|---|---|
| `ScrollWindow.tsx` | 42–47 (mobile swipe step constants block) | Add 3 named constants: `FADE_DISTANCE_PX`, `COMMIT_DISTANCE_PX`, `COMMIT_VELOCITY` |
| `ScrollWindow.tsx` | 49 (`const ScrollWindow = ()`) — ref block lines 50–55 | Remove `animatingRef` (line 58) if confirmed fully replaced; keep all others |
| `ScrollWindow.tsx` | 58 (`animatingRef`) | Delete `const animatingRef = useRef(false);` — no longer needed |
| `ScrollWindow.tsx` | 150–263 (mobile scroll-settle useEffect) | Delete entire useEffect; replace with new sticky-pin engagement useEffect |
| `ScrollWindow.tsx` | 286–295 (`commitCard` closure) | Rewrite: synchronous step advance, synchronous entry pose, spring in; drop onComplete chain |
| `ScrollWindow.tsx` | 314–335 (`onTouchStart`) | Add `cardY.stop(); cardOpacity.stop();` at top; remove `animatingRef` early-return; capture `dragBaseY` for mid-spring drag |
| `ScrollWindow.tsx` | 338–414 (`onTouchMove`) | Remove `animatingRef` early-return; change drag computation to use `dragBaseY + dy`; update opacity formula to use `FADE_DISTANCE_PX` |
| `ScrollWindow.tsx` | 416–437 (`onTouchEnd`) | Update commit condition to use `COMMIT_DISTANCE_PX` / `COMMIT_VELOCITY`; use `dragBaseY + dy` for displacement |
| `ScrollWindow.tsx` | 527 (outer container `<div>`) | Add `max-lg:h-[260lvh]` to className |
| `ScrollWindow.tsx` | 529–533 (inner layout `<div>` — `stickyRef`) | Restore `sticky top-0` on mobile: change non-desktop className to `"flex w-full h-[100lvh] overflow-hidden bg-[color:var(--canvas)] items-end sticky top-0"` |
| `ScrollWindow.tsx` | 537 (media box `<div>`) | Change `aspect-square` → `aspect-[4/3]` |

---

## Public Contracts (Unchanged)

| Contract | Direction | Shape | Change? |
|---|---|---|---|
| `fq-hide-header` CustomEvent | ScrollWindow → QuietNavbar | `detail: boolean` | Shape unchanged; dispatch source changes to sticky-pin engagement |
| `fq-scrollwindow-inview` CustomEvent | ScrollWindow → ChatBubble | `detail: { inView: boolean }` | Shape unchanged |
| `effectiveActive = step - 1` | ScrollWindow → useSegmentedFrames | `number` | Unchanged |
| `step` state | Internal mobile card state | `0..STEP_COUNT-1` | Still touch-driven; now interruptible |

---

## Blast Radius

- **ScrollWindow.tsx**: mobile-only changes; desktop branches untouched.
- **QuietNavbar.tsx**: receives same event shape from new dispatch — no code change, must verify.
- **ChatBubble.tsx**: receives same event shape — no code change, must verify.
- **iOS Safari layout**: `260lvh` outer track + `sticky top-0` inner; `100lvh` stable against toolbar.
- **4:3 media box**: taller than before on narrow phones — verify text cards do not overlap the image at any reasonable phone width.
- **Pin markers**: proved above that no coordinate change is needed.

---

## DELETE List (grep-proof — verify NONE survive in mobile code paths after edit)

| Symbol / string | Current location | Action |
|---|---|---|
| `armedRef` | Line 163 declaration, line 163 init, lines 178, 214, 217, 243 usages | Delete: variable exists only in the settle useEffect being removed |
| `settleTimer` | Line 165 declaration, lines 200–210 schedule/clear | Delete: settle useEffect removed |
| `scrollend` | Lines 230, 247, 257, 259 | Delete: listener lives in the settle useEffect being removed |
| `stillIn` | Line 194 | Delete: in the settle useEffect being removed |
| `animatingRef` | Line 58 declaration; lines 287, 304, 332, 339 usages | Delete ref and all usages (replaced by synchronous commit) |
| `aspect-square` (mobile) | Line 537 | Replace with `aspect-[4/3]`; confirm `lg:aspect-[1920/1080]` remains |
| `onSettle` | Lines 176–198 | Deleted as part of settle useEffect removal |
| `scheduleSettle` | Lines 208–211 | Deleted as part of settle useEffect removal |
| `prevSectionTopRef` | Lines 164, 215 | Deleted as part of settle useEffect removal |
| `cachedHeight` | Lines 161–162 | Deleted as part of settle useEffect removal |

---

## Named Constants (Add Before Component)

Add to the mobile swipe constants block (after line 47, before `const ScrollWindow`):

```
FADE_DISTANCE_PX = 120     // was 260; cardOpacity = max(0, 1 - |dy| / 120)
COMMIT_DISTANCE_PX = 44    // was 60; displacement threshold for commit
COMMIT_VELOCITY = 0.35     // was 0.5; px/ms threshold for velocity commit
```

These must be declared as `const` block-level constants, not inlined in the gesture logic.

---

## New Drag Baseline Ref

Add `const dragBaseYRef = useRef(0);` to the unconditional ref block (alongside `touchStartYRef` etc.).

Purpose: when `onTouchStart` fires mid-spring, `cardY.stop()` freezes the card at its
current animated position. `dragBaseYRef.current = cardY.get()` captures that position at
direction-lock time, so the card drags from its current visual position rather than from 0
or from the raw touch delta.

---

## Implementation Checklist

### Phase A — Named Constants

1. **ScrollWindow.tsx lines 42–47** (mobile swipe step constants block): After the `STEP_COUNT` declaration, add three named constants on separate lines:
   - `const FADE_DISTANCE_PX = 120;`
   - `const COMMIT_DISTANCE_PX = 44;`
   - `const COMMIT_VELOCITY = 0.35;`
   Add a brief comment: `// Swipe feel tuning — v3`

### Phase B — Remove animatingRef

2. **ScrollWindow.tsx line 58**: Delete `const animatingRef = useRef(false);` and its comment `// true only while section is fully settled in-view`. The engagement comment belongs on `engagedRef` (line 59) which stays.

3. **ScrollWindow.tsx ref block**: Add `const dragBaseYRef = useRef(0);` after `gestureCapturedRef` (currently last gesture ref). This ref holds the card's Y position at the moment of direction-lock, enabling mid-spring drag capture.

### Phase C — Replace Settle useEffect with Sticky-Pin Engagement useEffect

4. **ScrollWindow.tsx lines 154–263** (the entire `// ── Mobile: scroll-settle engagement state machine` useEffect and its closing `}, [isDesktop, cardY, cardOpacity]);`): Delete this entire block.

5. **ScrollWindow.tsx** (insert new `useEffect` in the same position, guarded `if (isDesktop) return;`): Add the sticky-pin engagement useEffect.

   Full logic spec:

   **Setup:**
   - Guard: `if (isDesktop) return;`
   - `el = containerRef.current`. If null, return.
   - Cache `lastDispatchFlag: boolean | null = null` (dedupe, same pattern as v2).
   - `dispatchInSection(flag: boolean)`: same shape as v2 — emits `fq-hide-header` (detail = flag) and `fq-scrollwindow-inview` (detail: { inView: flag }); early-returns when `flag === lastDispatchFlag`.
   - `consecutivePinCount = 0` — counts consecutive rAF evaluations where the track confirms "pinned" before engaging. Requires 2 consecutive to prevent fling-through flicker.
   - `raf = 0` — rAF handle for cancellation.

   **Pin geometry test (called from rAF):**
   ```
   function isPinned(): boolean {
     const rect = el.getBoundingClientRect();
     return rect.top <= -8 && rect.bottom >= window.innerHeight + 8;
   }
   function isFullyOut(): boolean {
     const rect = el.getBoundingClientRect();
     return rect.top > 0 || rect.bottom < window.innerHeight;
   }
   ```
   These are evaluated relative to the outer container (containerRef = the 260lvh track). When the
   sticky inner div is pinned, the track's top is negative (scrolled past) and track's bottom is
   still below the viewport bottom.

   **Entry direction:** At engage time, read `el.getBoundingClientRect().top`. If the top was last
   seen > 0 (approaching from above) → step 0. If top was < 0 → STEP_COUNT - 1. Track the last
   known `prevTop` on every rAF tick before checking engage.

   **rAF scroll loop:**
   ```
   function tick() {
     const rect = el.getBoundingClientRect();
     if (!engagedRef.current) {
       if (isPinned()) {
         consecutivePinCount++;
         if (consecutivePinCount >= 2) {
           // engage
           engagedRef.current = true;
           el.style.touchAction = "none";
           const entryStep = prevTop > 0 ? 0 : STEP_COUNT - 1;
           setStep(entryStep);
           stepRef.current = entryStep;
           cardY.set(0);
           cardOpacity.set(1);
           dispatchInSection(true);
         }
       } else {
         consecutivePinCount = 0;
         prevTop = rect.top;
       }
     } else {
       if (isFullyOut()) {
         engagedRef.current = false;
         el.style.touchAction = "";
         dispatchInSection(false);
         consecutivePinCount = 0;
       }
     }
     raf = requestAnimationFrame(tick);
   }
   ```
   Start the loop: `raf = requestAnimationFrame(tick);`

   **Orientation change handler** (same as v2, updated to re-read cached track metrics):
   - `engagedRef.current = false`
   - `el.style.touchAction = ""`
   - `dispatchInSection(false)`
   - `cardY.set(0)`; `cardOpacity.set(1)`
   - `setStep(0)`; `stepRef.current = 0`
   - `consecutivePinCount = 0`
   - `prevTop = el.getBoundingClientRect().top` (re-read after rotation to reset baseline)
   - Register: `window.addEventListener("orientationchange", onOrientationChange)`

   **Cleanup:**
   - `cancelAnimationFrame(raf)`
   - `engagedRef.current = false`
   - `el.style.touchAction = ""`
   - `dispatchInSection(false)`
   - `window.removeEventListener("orientationchange", onOrientationChange)`

   **Dependency array:** `[isDesktop, cardY, cardOpacity]` — same as the deleted settle useEffect.

### Phase D — Rewrite commitCard (Synchronous, Interruptible)

6. **ScrollWindow.tsx lines 286–311** (the `commitCard` closure inside the gesture useEffect): Rewrite entirely.

   New logic spec (no onComplete chain, synchronous step advance):
   ```
   function commitCard(direction: "up" | "down") {
     const current = stepRef.current;
     const next = Math.max(0, Math.min(STEP_COUNT - 1, direction === "up" ? current + 1 : current - 1));
     // 1. Advance step synchronously — React binds the new card immediately
     stepRef.current = next;
     setStep(next);
     // 2. Set entry pose for incoming card (old card becomes inactive → opacity 0 via style binding)
     const entryY = direction === "up" ? 36 : -36;
     cardY.set(entryY);
     cardOpacity.set(0);
     // 3. Spring in
     animate(cardY, 0, { type: "spring", stiffness: 300, damping: 30 });
     animate(cardOpacity, 1, { duration: 0.28 });
   }
   ```
   No `animatingRef` usage. The old card becomes inactive instantly when `setStep(next)` fires — its
   `motion.div` gets `style={{ opacity: 0, pointerEvents: "none" }}` via the existing conditional
   style binding. No separate exit animation needed.

### Phase E — Rewrite onTouchStart (Stop + Clean, Capture dragBaseY at lock)

7. **ScrollWindow.tsx `onTouchStart` handler (lines 314–336)**: Apply two changes:

   a. At the very top of the handler body (before any early return), add:
      ```
      cardY.stop();
      cardOpacity.stop();
      ```
      This immediately freezes mid-spring animation so the card is at a known visual position.

   b. Remove the `animatingRef.current` early-return block (lines 332–335):
      ```
      // DELETE this block:
      if (animatingRef.current) {
        return;
      }
      ```
      The ref no longer exists; the stop() calls above replace the need for the early-return.

   The multi-touch early-return block (which resets refs then returns) stays unchanged.

### Phase F — Rewrite onTouchMove (Remove animatingRef gate, use dragBaseY)

8. **ScrollWindow.tsx `onTouchMove` handler — animatingRef early-return (lines 339–342)**:
   Remove the block:
   ```
   // DELETE:
   if (animatingRef.current) {
     return;
   }
   ```

9. **ScrollWindow.tsx `onTouchMove` — direction-lock block**: At the point where direction is
   locked (after `gestureDirectionRef.current === null && Math.abs(dy) > 6`), capture the
   drag baseline:
   ```
   // After locking direction (inside the block, before gesture-specific branching):
   dragBaseYRef.current = cardY.get();
   ```
   This records the card's current visual Y (which may be partway through a spring) so drag
   displacement is measured from there, not from Y=0.

10. **ScrollWindow.tsx `onTouchMove` — card position update (line 412–413)**:
    Change:
    ```
    // OLD:
    cardY.set(currentDy);
    cardOpacity.set(Math.max(0, 1 - Math.abs(currentDy) / 260));

    // NEW:
    const effectiveDy = dragBaseYRef.current + currentDy;
    cardY.set(effectiveDy);
    cardOpacity.set(Math.max(0, 1 - Math.abs(effectiveDy) / FADE_DISTANCE_PX));
    ```
    `currentDy` = `e.touches[0].clientY - touchStartYRef.current` (the delta since finger landed).
    `effectiveDy` offsets that from the card's position at direction-lock time.

### Phase G — Update onTouchEnd (New Constants, dragBaseY Displacement)

11. **ScrollWindow.tsx `onTouchEnd` (lines 416–437)**: Two changes:

    a. Change displacement used for commit decision: replace `dy = touchLastYRef - touchStartYRef`
       with `const effectiveDy = dragBaseYRef.current + (touchLastYRef.current - touchStartYRef.current);`
       Use `effectiveDy` for the `Math.abs(dy) > COMMIT_DISTANCE_PX` check and for the direction
       passed to `commitCard`.

    b. Update commit thresholds:
       ```
       // OLD:
       const shouldCommit = (Math.abs(dy) > 60 || Math.abs(v) > 0.5);

       // NEW:
       const shouldCommit = (Math.abs(effectiveDy) > COMMIT_DISTANCE_PX || Math.abs(v) > COMMIT_VELOCITY);
       ```
    c. Pass direction to `commitCard` based on `effectiveDy < 0 ? "up" : "down"`.

### Phase H — Boundary Exit Glides (Retarget to Track)

12. **ScrollWindow.tsx `onTouchMove` — exit-up glide (line 368–375)** (swipe up at last step):
    Change the `window.scrollBy` call to a track-anchored `window.scrollTo`:
    ```
    // OLD:
    window.scrollBy({ top: window.innerHeight * 0.55, behavior: "smooth" });

    // NEW (compute trackTopAbs at gesture time):
    const trackRect = el.getBoundingClientRect();
    const trackTopAbs = trackRect.top + window.scrollY;
    const trackHeight = trackRect.height;
    window.scrollTo({ top: trackTopAbs + trackHeight - window.innerHeight * 0.5, behavior: "smooth" });
    ```
    The disengage sequence (`engagedRef.current = false`, `el.style.touchAction = ""`,
    `dispatchInSection(false)`) stays at the same point.

13. **ScrollWindow.tsx `onTouchMove` — exit-down glide (lines 382–390)** (swipe down at step 0):
    Change the `window.scrollBy` call to a track-anchored `window.scrollTo`:
    ```
    // OLD:
    window.scrollBy({ top: -(window.innerHeight * 0.55), behavior: "smooth" });

    // NEW:
    const trackRect = el.getBoundingClientRect();
    const trackTopAbs = trackRect.top + window.scrollY;
    window.scrollTo({ top: trackTopAbs - window.innerHeight * 0.5, behavior: "smooth" });
    ```
    Disengage sequence identical to exit-up.

### Phase I — Outer Container: Add 260lvh Track Height

14. **ScrollWindow.tsx line 524–527** (outer `<div ref={containerRef}>`): Add `max-lg:h-[260lvh]`
    to the className. Current className is `"relative bg-[color:var(--canvas)]"`. Result:
    ```
    className="relative bg-[color:var(--canvas)] max-lg:h-[260lvh]"
    ```
    Desktop: no height change (desktop layout is driven by the normal-flow text panels below).

### Phase J — Inner Layout Div: Restore sticky top-0 on Mobile

15. **ScrollWindow.tsx lines 529–535** (the `stickyRef` layout div — currently uses
    `isDesktop`-conditional className): Update the non-desktop path to include `sticky top-0`.

    Current non-desktop className:
    ```
    "flex w-full h-[100lvh] overflow-hidden bg-[color:var(--canvas)] items-end"
    ```
    New non-desktop className:
    ```
    "sticky top-0 flex w-full h-[100lvh] overflow-hidden bg-[color:var(--canvas)] items-end"
    ```
    Desktop className (`sticky top-0 flex h-screen w-full overflow-hidden bg-[color:var(--canvas)] lg:items-center lg:pb-0`) — unchanged.

### Phase K — Media Box: 4:3 Aspect Ratio

16. **ScrollWindow.tsx line 537** (the media box `<div ref={mediaBoxRef}>`):
    Change `aspect-square` to `aspect-[4/3]`. The `lg:aspect-[1920/1080]` desktop class stays.
    ```
    // OLD:
    className="relative w-full aspect-square lg:aspect-[1920/1080]"

    // NEW:
    className="relative w-full aspect-[4/3] lg:aspect-[1920/1080]"
    ```

### Phase L — Cleanup and Verification Grep

17. **ScrollWindow.tsx** — grep/search for each DELETE list item and confirm zero remaining hits:
    - `armedRef` → 0 results
    - `settleTimer` → 0 results
    - `scrollend` → 0 results (the word, anywhere in mobile code)
    - `stillIn` → 0 results
    - `animatingRef` → 0 results
    - `aspect-square` → 0 results (on the media box line; confirm it is now `aspect-[4/3]`)

18. **ScrollWindow.tsx** — confirm positive hits exist for all new elements:
    - `FADE_DISTANCE_PX` → at least 2 hits (declaration + usage in onTouchMove)
    - `COMMIT_DISTANCE_PX` → at least 2 hits (declaration + usage in onTouchEnd)
    - `COMMIT_VELOCITY` → at least 2 hits (declaration + usage in onTouchEnd)
    - `dragBaseYRef` → at least 3 hits (declaration + onTouchStart assignment + direction-lock capture + onTouchMove usage + onTouchEnd usage)
    - `consecutivePinCount` → hits inside the new engagement useEffect
    - `isPinned` → at least 1 hit
    - `max-lg:h-[260lvh]` → 1 hit (outer container)
    - `sticky top-0` in `stickyRef` className → 1 hit in the non-desktop branch
    - `aspect-[4/3]` → 1 hit

### Phase M — Build Check

19. Run `npm run build` (or `npx tsc --noEmit`). Must produce zero TypeScript errors.

20. Run `npm test`. Must pass all tests (currently 109/109).

---

## Edge Cases — Must Be Handled

| Edge Case | Handling |
|---|---|
| **Fling-through flicker guard** | `consecutivePinCount >= 2` before engaging: two consecutive rAF ticks must confirm pinned state. A fast fling crosses the track bottom quickly — the consecutive check prevents a momentary pinned reading from engaging the section mid-fling. |
| **Orientation change re-measure** | `onOrientationChange`: re-reads `el.getBoundingClientRect().top` after rotation to reset `prevTop` baseline; resets `consecutivePinCount`; re-evaluates geometry on next rAF tick. |
| **Gesture starting mid-spring** | `onTouchStart` calls `cardY.stop(); cardOpacity.stop()` immediately, freezing the card. `dragBaseYRef` captured at direction-lock reflects the frozen position. Drag then moves relative to where the card stopped. |
| **Entry from below (last card)** | When track's `rect.top` is last known negative (user scrolled down, re-enters from bottom), `prevTop < 0` → engage sets `step = STEP_COUNT - 1`. |
| **Interactive elements / taps** | Touch engine: `touchstart` always passive, gesture only captured after 6px direction-lock. Tap targets (MaterialToggle, links) remain fully functional; `touchAction = "none"` is set on the container but does not block `click` events — only prevents native scrolling. |
| **rAF loop accumulation** | `raf` handle cancelled on cleanup. If `isDesktop` changes (e.g. rotate to very wide), `isDesktop` triggers the useEffect to rerun, cleanup cancels the rAF, new guard `if (isDesktop) return` exits. |
| **Sticky + 260lvh on short content pages** | If page total scroll height < 260lvh, the outer container's height will just extend the page — acceptable. ScrollWindow is never a short-page risk (it follows hero + brand panels). |
| **Stale `step` in gesture handlers** | All step reads in touch handlers use `stepRef.current` (not `step`). `stepRef.current` is updated synchronously in `commitCard` before `setStep(next)`. |
| **3 rapid swipes < 200ms** | No `animatingRef` gate. Each `onTouchStart` stops the spring, sets `dragBaseYRef`, and begins fresh. `commitCard` advances `stepRef.current` synchronously — by the time the next `onTouchStart` fires, `stepRef.current` already reflects the correct next step. |

---

## What Stays Untouched (Proof Boundaries)

- All desktop branches (`isDesktop === true`) — not touched anywhere.
- `effectiveActive = isDesktop ? activeIndex : step - 1` — preserved.
- `useFramePreloader`, `useSegmentedFrames` — unchanged contracts.
- Canvas draw effect (lines 499–521) — unchanged; `object-cover` CSS handles 4:3 crop.
- ALU image cross-fade — unchanged.
- Pin wrapper div (`aspect-[1920/1080]`, `h-full`, `left-1/2 -translate-x-1/2`) — unchanged.
- `PhaseCalloutMarkers.tsx` — not touched; pin positions proved correct for 4:3 (see analysis).
- `PartBody` sub-component — unchanged.
- `QuietNavbar.tsx` / `ChatBubble.tsx` — event shape unchanged; no code change.
- `springBack` helper — unchanged.

---

## Dependencies

- No new packages. `framer-motion` `animate`, `useMotionValue` already imported.
- `max-lg:h-[260lvh]` — Tailwind responsive arbitrary value; Tailwind v3 supports this. `lvh` supported Safari 15.4+; on older browsers the element has no height from this class but `h-[100lvh]` on the inner sticky div still provides the viewport fill.
- `sticky top-0` on mobile — standard CSS sticky; Safari 13+.
- `requestAnimationFrame` loop — replaces scroll event; more reliable on iOS where passive scroll events fire infrequently.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| rAF loop running always (not just during scroll) | Acceptable: rAF is cheap when the track is fully outside the viewport (geometry reads are fast). Loop exits on cleanup. |
| `consecutivePinCount` wrongly blocks legitimate slow-entry | 2-frame hysteresis is ~33ms at 60fps — imperceptible. A real slow-scroll pinning event is detected on frame 2 or 3. |
| `cardY.stop()` + `dragBaseYRef` mis-sync if stop hasn't settled in the same microtask | `MotionValue.stop()` is synchronous — the next `get()` returns the value at stop. No async gap. |
| 260lvh adds page length; jumps in surrounding layout | The sticky inner fills exactly 100lvh; the extra height is padding/runway. Sections below will be pushed down. Verify visually that footer spacing is acceptable on test device. |
| `touchAction = "none"` blocks pinch-to-zoom while engaged | Intentional: section is fullscreen, pinch-to-zoom is not expected here. On disengage, `touchAction` is restored. |
| Synchronous `setStep` + `cardY.set` causes a React render before the entry pose is set | `cardY.set` and `cardOpacity.set` are MotionValue mutations — they do not go through React render. `setStep(next)` triggers a React render on next flush, which by then the entry pose is already set on the MotionValue. No visible flash. |

---

## Verification Evidence

### Build and Tests

1. `npm run build` (or `npx tsc --noEmit`) → zero TypeScript errors.
2. `npm test` → 109/109 pass (or current baseline).

### DELETE List Grep (automated, before browser test)

```
grep -n "armedRef\|settleTimer\|scrollend\|stillIn\|animatingRef\|aspect-square" \
  src/components/home/ScrollWindow.tsx
```
Expected: zero results on the media box `aspect-square` usage; zero results for all other terms.

### Browser Verification Checklist (mobile, iOS Safari / 390×844 touch emulation)

**A. Sticky catch behavior:**
- A1. Scroll to the section from above at normal speed → section pins to screen, does not pass through.
- A2. Scroll to the section from below at normal speed → section pins, first card shows as last step.
- A3. Fast fling past the section (fast drag covering > ~2 screens in < 200ms) → section is NOT engaged; page scrolls past. No flicker of section engagement.
- A4. While pinned, attempt to scroll up/down with a slow drag — page does not move (touchAction: none).
- A5. Confirm engage fires after ~2 rAF frames (no immediate engage on first frame to avoid fling-through).

**B. 4:3 media box:**
- B1. Media box is landscape (wider than tall) — not square.
- B2. Window frame image is center-cropped, not stretched or pillarboxed.
- B3. Media box is bottom-flush with screen bottom — no gap below it.
- B4. Poster image and canvas both show 4:3 correctly (`object-cover` on both).
- B5. Pin markers (callout pins) appear at expected positions on the thermal still.

**C. Fade constants (approximate visual check):**
- C1. Drag card 20px → opacity visually ~0.83 (1 - 20/120 = 0.83).
- C2. Drag card 100px → opacity visually ~0.17 (1 - 100/120 = 0.17). Noticeably faded.
- C3. Drag card 120px+ → card is invisible (opacity = 0).

**D. Commit thresholds:**
- D1. Slow drag of exactly 50px → card commits (50 > COMMIT_DISTANCE_PX=44). Step advances.
- D2. Slow drag of exactly 40px → card springs back (40 < 44).
- D3. Fast flick (< 44px displacement but velocity > 0.35 px/ms) → card commits.

**E. Rapid swipes (no debounce):**
- E1. Execute 3 rapid swipes up within 200ms total → all 3 land; step advances by 3 total (or to max STEP_COUNT-1). No missed swipes.
- E2. Swipe during mid-spring: drag while spring animation in progress → card immediately follows finger from its mid-spring position.

**F. Exit glides:**
- F1. At last step (step 3), swipe up → page scrolls smoothly to just past the track bottom. Section is no longer pinned. Header restores.
- F2. At step 0, swipe down → page scrolls smoothly to just above the track top. Section is no longer pinned.
- F3. Confirm exit glide targets the track, not a relative scroll (glide does not over- or under-shoot by > ~50px from expected position).

**G. Event dispatches:**
- G1. On engage: `fq-hide-header` fires with `true`, header hides. `fq-scrollwindow-inview` fires with `{ inView: true }`, chat FAB hides.
- G2. On disengage: both events fire with `false`/`{ inView: false }`. Header and FAB restore.
- G3. No duplicate dispatches (dedupe working) — verify in DevTools console with event listener logging.

**H. Interactive elements:**
- H1. While engaged at thermal step, tap MaterialToggle → toggle fires, material cross-fade occurs. No unintended swipe capture.

**I. Desktop unchanged:**
- I1. At viewport width >= 1024px, all scroll panels work identically to pre-v3. Connector lines, sticky media, frame animation, header hide — unchanged.
- I2. Desktop media box shows `lg:aspect-[1920/1080]` (16:9), not 4:3.

**J. Orientation change:**
- J1. While engaged, rotate to landscape → section disengages, header restores, step resets to 0. On re-entry the section can be re-engaged normally.

---

## Resume and Execution Handoff

**Plan path (exact):** `process/general-plans/active/scrollwindow-mobile-sticky-catch_PLAN_24-07-26.md`

**Single file to implement:** `src/components/home/ScrollWindow.tsx`

**Files to verify (no changes):**
- `src/components/chat/ChatBubble.tsx`
- `src/components/layout/QuietNavbar.tsx`

**Execution order:** Phases A → B → C → D → E → F → G → H → I → J → K → L → M (sequential).
Phases C (delete settle useEffect, add sticky-pin engagement) and D (rewrite commitCard) are the highest-risk steps — implement and build-check after each before continuing.

**Superseded plan:** `process/general-plans/active/scrollwindow-mobile-swipe-cards_PLAN_24-07-26.md` — archive to `process/general-plans/completed/` after this plan executes successfully.

---

## Execution Note

**Executed:** 2026-07-24 by vc-execute-agent.

**Phases completed:** A B C D E F G H I J K L M (all sequential, zero deviations).

**Touched file:** `src/components/home/ScrollWindow.tsx` only.

**Verification:**
- Phase L DELETE grep: zero hits for `armedRef`, `settleTimer`, `scrollend`, `stillIn`, `animatingRef`, `aspect-square`.
- Phase L positive grep: all new symbols confirmed (`FADE_DISTANCE_PX` ×2+, `COMMIT_DISTANCE_PX` ×2+, `COMMIT_VELOCITY` ×2+, `dragBaseYRef` ×4+, `consecutivePinCount` ×5+, `isPinned` ×2+, `max-lg:h-[260lvh]` ×1, `sticky top-0` in non-desktop branch ×1, `aspect-[4/3]` ×1).
- `preventDefault`: exactly 1 call (captured touchmove path, line 371).
- `npm run build`: zero TypeScript errors, 2357 modules transformed.
- `npm test`: 109/109 passed.

**Status:** Ready for UPDATE PROCESS archival (browser verification still pending per plan section H browser checklist).

---

## Amendment: iOS gesture arbitration fix

**Date:** 2026-07-25 by vc-execute-agent.

**Root cause addressed:** Real iOS Safari arbitrates scroll-vs-JS at the first `touchmove`. Because our `el.style.touchAction = "none"` is set from a rAF tick (async), iOS's cached touch-action region does not reflect it in time, so iOS claims the scroll. Additionally, iOS cancels in-progress programmatic `window.scrollTo({ behavior:"smooth" })` calls while a touch is active, so boundary-exit glides fired mid-gesture were silently ignored.

**Changes applied to `src/components/home/ScrollWindow.tsx`:**

1. **Change 1 — Early preventDefault (line 404):** `if (engagedRef.current || pendingExitRef.current !== null)` — prevents iOS from claiming the scroll on the first touchmove. The `pendingExitRef` branch covers the window between direction-lock (engagedRef cleared) and touchend (glide fires).

2. **Change 2 — Defer boundary-exit glides to touchend:** Added `const pendingExitRef = useRef<null | "down" | "up">(null)` (line 99). Direction-lock boundary branches now set `pendingExitRef.current` instead of calling `window.scrollTo` inline. `onTouchEnd` and `onTouchCancel` both check `pendingExitRef.current` first (before `!gestureCapturedRef` early-return), compute the track-relative glide target, fire `window.scrollTo`, and return. `onTouchStart` resets `pendingExitRef.current = null` in both the multi-touch and single-touch reset paths.

3. **Change 3 — Relaxed pin thresholds (line 215):** `isPinned()` now uses `rect.top <= -2 && rect.bottom >= window.innerHeight + 2` (was -8/+8). Allows engagement when the track rests exactly at the pin edge.

4. **Change 4 — fqdebug HUD (already present from prior session):** Mobile-only debug overlay gated on `?fqdebug` URL param, using direct DOM writes (zero overhead when flag absent).

**Grep-proofs:**
- `pendingExitRef`: present at ref declaration (×1), touchstart reset (×2), direction-lock (×2), touchmove condition (×1), touchend handler (×3), touchcancel handler (×3).
- Engaged-preventDefault appears before direction lock at line 404.
- `-2` thresholds in `isPinned` at line 215.
- `fqdebug` read once at module level with `typeof window` SSR guard.

**Verification:**
- `npm run build`: zero TypeScript errors.
- `npm test`: 109/109 passed.
- `node .claude/chrome-devtools/tmp/verify-sticky-catch.mjs`: ALL 13 verdicts PASS (TRACK_AND_ASPECT_OK, PINNED_THROUGHOUT_TRACK, FLUSH, ENGAGED_STEP0, FADES_FAST, COMMITS_AT_50PX, NO_DEBOUNCE_ALL_LAND, GLIDES_OUT_DOWN, ENGAGED_LAST_STEP, GLIDES_OUT_UP, NATIVE, NO_STUCK_HEADER, UNCHANGED; consoleErrors 0).
- `node .claude/chrome-devtools/tmp/probe-rapid.mjs`: full ladder clean (3 rapid-ups land steps 1→2→3, all settle to activeY:0).

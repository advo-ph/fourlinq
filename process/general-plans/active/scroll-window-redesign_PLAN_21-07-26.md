# ScrollWindow Redesign — Text-Gated Segmented Animation + Marvin Side-Text + Part-2 Callouts

**Status:** IMPLEMENTED & browser-verified (2026-07-21). Remaining: optional anchor fine-tuning, mobile visual pass, legacy-PNG cleanup.
**Date:** 2026-07-21
**Owner request:** Prince

---

## 1. Goal

Replace the current scroll-position→frame scrub with a **text-gated, segmented auto-play**
animation, Marvin-style static side text, animated callout lines on Part 2, and a
uPVC/Aluminium material toggle.

Core model: **scroll decides which text is highlighted → highlighted text decides which
frame segment auto-plays → each segment plays to its stop frame and rests on a hi-res still.**
Frames are NOT scrubbed by scroll.

---

## 2. Frame inventory (staging: `~/Downloads/scroll-frames-new/`)

Source video: `ScrollVideo NewAnimation2.mp4` (1920×1080, 30fps, 186 frames).

Current staged state after Prince's edits:
- `frame_0001`–`frame_0115` — webp
- `frame_0116` — **custom PNG** (1672×941, hi-res uPVC cutaway = Part-2 stop still)
- `frame_0117` — **DELETED**
- `frame_0118`–`frame_0186` — webp

### Frame handling in EXECUTE
- Convert `frame_0116.png` → `frame_0116.webp` **lossless** (`cwebp -lossless`) to keep hero quality + pipeline uniformity.
- Create `frame_0117.webp` = copy of `frame_0118.webp` (filler so preloader array stays contiguous; 117 is never a display target).
- Re-encode stop frames 58 & 186 at higher quality (lossless) — "keep stop frames high quality".
- Copy `frame_0001`–`frame_0186` into `public/images/scroll-window-webp/`, **removing old 187–340**.
- `TOTAL_FRAMES = 186`.

---

## 3. Parts, ranges, stop frames

| Part | Text | Start frame | Stop frame (hi-res rest) |
|---|---|---|---|
| 1 | Weather Resistance | 1 | **58** |
| 2 | Internal design (uPVC⇄Alu) | 59 | **116** (custom hi-res) |
| 3 | Sound Reduction | 118* | **186** |

\*Part 3 start is "frame after Part-2 stop" = 117, but 117 was deleted, so effective start = 118.

---

## 4. Playback engine rules (replaces useScrollFrames scrub)

- Active part = scroll zone whose text is fully shown. On active-part change, auto-play that
  part's segment **start→stop** (fast), then hold on stop frame.
- **Forward** to later part: jump to its start, play forward to stop.
- **Backward** (general): jump to target part's start, play forward to stop (skips frames).
- **SPECIAL CASE — Part 2 → Part 1 backward:** reverse-play `116 → 83`, then jump to `1`,
  play forward `1 → 58`. (Only this transition reverses.)
- Segment playback is **very fast** (auto-play, decoupled from scroll speed). Tunable speed const.

---

## 5. Layout — scrollytelling (revised 2026-07-21 per Prince)

Two-column was rejected. Final layout:
- **Full-width image, sticky/pinned** (`sticky top-0 h-screen`, media `w-full aspect-[1920/1080]`).
- **Text in normal document flow (NOT locked)** — each part is a `min-h-screen` panel that scrolls
  over the pinned media. Active part = the panel centered in the viewport (IntersectionObserver,
  `rootMargin: -50% 0 -50%`). That drives `useSegmentedFrames` (which now takes `activeIndex`).
- Text uses the **app's existing list design**: `<li className="border-t border-[color:var(--rule-soft)] py-3">`
  (thin dividers + spacing), same pattern as `UPVCAdvantageStrip.tsx` / `ForArchitects.tsx`.
- Text sits left over the frame's white margin. No top-rule/zoneProgress anymore.

---

## 6. Finalized text content (all sourced from repo data)

### Part 1 — Weather Resistance (rain; no callout lines)
- Eyebrow: **Weather Resistance**
- Headline: **Zero leaks through the frame.**
- Lede: Every joint is sealed and drained, so tropical rain and wind stay outside.
- Bullets:
  - **EPDM gaskets** seal every joint against air and water
  - **Drainage channels** route water out before it reaches the interior
  - **Galvanized steel reinforcement** holds firm under heavy wind loads
  - **Tested against Signal No. 3** storm conditions

### Part 2 — Internal design (uPVC cutaway; callout lines + toggle)
List items double as callout labels; lines point to image anchors.
- Eyebrow: **Inside the Frame**
- Headline: **Where the performance lives.**
- uPVC list (default):
  1. **Weather-seal gasket** — EPDM seal that locks out air and water → *left gasket*
  2. **Steel reinforcement** — galvanized core for rigidity and security → *gray reinforcement*
  3. **Multi-chamber profile** — sealed cells across the whole frame → *anywhere on profile*
  4. **Thermal & sound insulation** — trapped air in the chambers does the work → *biggest hole*
- Aluminium list (on toggle → Aluminium Thermal Break):
  1. **Weather-seal gasket** — same EPDM weather seal
  2. **Polyamide thermal break** — non-conductive bar splits the metal, blocking heat *(hero)*
  3. **Outer aluminium profile** — powder-coated, weather-facing
  4. **Inner aluminium profile** — stays cooler even in direct sun

### Part 3 — Sound Reduction (soundproof; no callout lines)
- Eyebrow: **Sound Reduction**
- Headline: **You hear less of what's outside.**
- Lede: Sealed frames and thick glass drop the noise floor of a whole room.
- Bullets:
  - **EPDM-sealed frames** close the gaps sound leaks through
  - **Glass 6–12 mm thick**; laminated options damp noise further
  - Multi-chamber uPVC typically cuts **24–32 dB**
  - **Up to ~40 dB** with heavier glazing

**Open text decision:** dB reconciliation — using "24–32 dB typical, up to ~40 dB". Confirm or pick one.

---

## 7. Part-2 callout line system (Part 2 only)

- SVG overlay. Each line: one end anchored to the **list item** (live `getBoundingClientRect`),
  other end to an **image anchor point** (% of the displayed image box). Recomputed on scroll/resize
  so lines follow the text if it shifts while the image stays put.
- Trigger: when Part 2 **settles on stop frame 116**, lines animate from list item → image anchor.
- **Random speeds, small variation** (different finish times, subtle). Lines **thin (1px), gray
  (`var(--ink-faint)`), no anchor dot** (revised per Prince 2026-07-21 — was black/thick/red-dot).
- Provisional anchors (% of Part-2 image, to be visually tuned after build):
  - Weather-seal gasket: **(43%, 41%)**
  - Steel reinforcement: **(44%, 59%)**
  - Multi-chamber profile: **(33%, 66%)**
  - Thermal & sound insulation: **(46%, 70%)**
- Aluminium anchors: TBD once aluminium image is provided.

---

## 8. Material toggle (Part 2 stop only)

- Buttons: **[uPVC]** (default) · **[Aluminium Thermal Break]**.
- Press swaps: shown image + the 4 list items + line anchors.
- **Temporary:** leaving Part 2 always resets to uPVC.
- Aluminium image: **PENDING from Prince** — wire path + anchors, stub until asset arrives.

---

## 9. Files to touch (EXECUTE)

- `src/data/scroll-window-phases.ts` — rewrite: 3 parts, new fields (`lede`, `bullets`, `callouts[]` w/ anchors), `TOTAL_FRAMES=186`, per-part start/stop, playback consts, material variants.
- `src/hooks/useScrollFrames.ts` — replace with text-gated segmented playback (active-part detection + segment auto-play + reverse special case). New name candidate: `useSegmentedFrames`.
- `src/components/home/ScrollWindow.tsx` — Marvin static text column, top-rule fill, canvas playback, Part-2 callout overlay + toggle wiring.
- `src/components/home/PhaseCalloutLines.tsx` — NEW SVG overlay.
- `src/components/home/ThermalSystemToggle.tsx` — adapt for uPVC/Aluminium.
- `public/images/scroll-window-webp/` — replace frames (1–186), incl. converted 116 + filler 117.

---

## 10. Blockers / open items before/within EXECUTE

1. **Aluminium cutaway image** — pending. Toggle stubbed until provided.
2. **Text sign-off** — Section 6 (esp. dB claim).
3. **Callout anchor coordinates** — provisional; visual tuning pass after build (preview/screenshot).
4. Confirm segment playback speed feel ("very fast") — tune const after first build.

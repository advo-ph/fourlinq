# 3D asset brief — the systems the licensed model does not cover

Nine systems already animate in `Window3D` from the licensed makinwhat GLB
(see [LICENSES.md](LICENSES.md)). This document briefs only what that model
**cannot** supply, so nobody commissions art we already own.

Run `npm run probe:glb` before commissioning anything. If a system appears in
that output, it needs wiring, not modelling.

## Already covered — do not commission

| System | Status |
| --- | --- |
| Casement (plain, 2-lite) | animated, live |
| Awning | animated, live |
| Sliding (2-panel, 4-panel) | animated, live |
| Slide & Fold | animated, live |
| Louvre (narrow, wide blade) | animated, live — replaced a schematic placeholder |
| Fixed / Picture / Direct Glaze | rendered, non-operable (correct) |
| Hung, Pivot, Revolving | measured and renderable, withheld pending confirmation FourlinQ sells them |

Lattice/grille variants of fixed, sliding, awning and pivot also exist in the
binary, unwired. Grille is arguably a per-system option rather than its own
system; decide that before treating it as missing art.

---

## The contract

**Read this before writing any modelling prompt.** `Window3D` is not generic —
it makes specific assumptions, all inherited from the licensed model. An asset
that follows them drops in by adding one `SYSTEMS` entry. One that does not
needs component changes.

1. **Format** — single binary `.glb`, Y-up, real-world metres. Target under
   2 MB per system; the current 5.1 MB file covers seventeen assemblies.
2. **One top-level node per moving part**, each with a unique name prefixed by
   the system id: `scdoor_frame`, `scdoor_panelL`, `scdoor_panelR`. These names
   are the visibility contract — `visibleRoot` lists them exactly.
   - **No name may be a prefix of another.** `fin1` vs `fin10` and `fixed` vs
     `fixed_lattice` are the traps that forced exact-name matching. Zero-pad
     (`fin01`) if parts are numbered.
3. **Materials, named exactly:**
   - `frame1`, `frame2`, `frame3` — take the frame finish; recoloured at
     runtime from `FRAME_FINISHES` and optionally texture-mapped.
   - `glass` — glazing; left alone.
   - `parts`, `parts2` — hardware, handles, brackets; left alone, so model
     hardware in its own real colour rather than the frame colour.
4. **Animation** — exactly one clip, named `Scene`, spanning 0 → 4 s at 30 fps.
   Closed at t=0, fully open at the system's peak, returning toward closed by
   t=4. The viewer scrubs `action.time` toward a pinned `openTime` rather than
   playing the clip, so the open pose must be a single instant, not a loop.
   Record that instant; it becomes `openTime`. Non-operable systems ship with
   no channels and get `openTime: 0`.
5. **After delivery** — run `npm run probe:glb` to read `center`, `scale` and
   `openTime`, paste them into `SYSTEMS`, and add the system id to
   `SYSTEM_ROOT` in the probe script. `src/test/window-3d.test.ts` fails if the
   two drift. **Never hand-tune the numbers** — that produced the 278× unit bug
   the probe script exists to prevent.

---

## Per-system briefs

Each has a **3D brief** (preferred — the ask was "an actual moving thing") and
an **image prompt** fallback. Image fallbacks are specified as a matched set:
same camera, same light, same framing, transparent background, so a swapped
type does not shift on the page.

### Shared image-prompt constraints

Append to every image prompt:

> Isolated on a fully transparent background, no ground plane, no shadow baked
> in, no backdrop, no props, no people. Straight-on three-quarter view, camera
> at frame-centre height, 35 mm equivalent, no perspective distortion. Soft
> even daylight from upper left, no hard speculars on the glass. Frame in matte
> white RAL 9016. Glazing lightly reflective, ~15% opacity, no visible scene
> reflected. Product-catalogue rendering, photorealistic, neutral colour,
> square aspect, subject occupying 80% of frame height, centred.

Fixing camera, light, finish and framing across all six is what makes them
iterable and swappable. Vary only the subject sentence.

---

### 1. Glass Railing — `glass-railing`

Live now as a schematic placeholder. Specialist category, not a window.

**3D brief**
> Model a frameless structural glass balustrade, 3 000 mm run, 1 100 mm high.
> Three 12 mm toughened laminated glass panels with 15 mm shadow gaps, held by
> a continuous floor-mounted aluminium base channel. Round 50 mm brushed
> stainless top handrail spanning all panels. Include the base channel's cover
> trim and two visible spigot fixings per panel.
> Nodes: `railing_base`, `railing_glassL`, `railing_glassC`, `railing_glassR`,
> `railing_handrail`. Base and handrail `frame1`; spigots and cover trim
> `parts`; panels `glass`.
> **Non-operable** — no animation channels, `openTime: 0`.

**Image prompt**
> A frameless glass balustrade of three tall clear tempered glass panels in a
> slim brushed aluminium floor channel, with a round brushed stainless steel
> top handrail running across them. Slim shadow gaps between panels. [shared
> constraints]

### 2. SC-Door (Sliding Casement Door) — `sc-door`

Live now as a schematic placeholder. Named "Sliding Casement" in all copy —
never "glider" (guarded by `data-integrity.test.ts`).

**3D brief**
> Model a two-leaf sliding casement door, 1 800 mm wide × 2 100 mm high, in a
> uPVC outer frame with a low 20 mm threshold. Each leaf is a fully glazed
> casement panel on a concealed bottom-running track. Leaves slide
> horizontally past one another — they do **not** swing. Include the
> interlocking centre stile, a full-height flush pull handle on each leaf, and
> the head track.
> Nodes: `scdoor_frame`, `scdoor_panelL`, `scdoor_panelR`.
> Animation: `scdoor_panelL` translates +600 mm along X between t=0 and t≈1.9 s,
> then returns by t=4. `scdoor_panelR` stays fixed.

**Image prompt**
> A two-leaf sliding patio door in a slim white uPVC frame, both leaves fully
> glazed with a narrow interlocking centre stile and full-height flush pull
> handles, set on a low flat threshold. Leaves aligned closed and flush. [shared
> constraints]

### 3. Automated Door Access — `automated-door`

Live now as a schematic placeholder. Answers the 2026-07-10 "automate your
door / digital access" ask. Scope is project-specified, so the model should
read as *representative*, not as one SKU.

**3D brief**
> Model a single outward-opening entrance door leaf, 1 000 mm × 2 100 mm, in a
> uPVC frame. Upper two-thirds glazed, solid lower panel. On the frame at
> 1 050 mm height, a slim wall-mounted keypad/card reader, 76 × 110 mm. A
> concealed overhead swing operator housed in the head frame, its arm visible
> where it meets the leaf. Lever handle with a multi-point lock keep visible in
> the jamb.
> Nodes: `autodoor_frame`, `autodoor_leaf`, `autodoor_reader`, `autodoor_arm`.
> Reader and arm `parts`; frame and leaf `frame1`/`frame2`.
> Animation: `autodoor_leaf` rotates **outward** 90° about its hinge edge
> between t=0 and t≈1.9 s, `autodoor_arm` tracking it, then returns by t=4.
> Outward is not cosmetic — "never inward" is a standing client instruction.

**Image prompt**
> A single white uPVC entrance door, glazed upper two-thirds with a solid lower
> panel, a slim black keypad card reader mounted on the frame beside it at hand
> height, and a lever handle. Door closed, flush in frame. [shared constraints]

### 4. Automated Windows — `automated-window`

Live now as a schematic placeholder. This one is a **composite, not a new
model**: it is a casement plus an actuator, and the casement already animates.

**Cheapest correct route:** author only the actuator as a small add-on node set
that can be shown alongside the existing `casement` subtree, rather than
commissioning a whole window.

**3D brief**
> Model only a chain or linear-rod window actuator: a 300 × 40 × 40 mm white
> housing that mounts on the frame head, with an extending arm that reaches
> 250 mm. Include the wall switch as a separate 80 × 80 mm plate.
> Nodes: `autowin_actuator`, `autowin_arm`, `autowin_switch`, all `parts`.
> Animation: `autowin_arm` extends 250 mm along Y between t=0 and t≈1.9 s in
> step with the casement's own opening, then retracts by t=4.
>
> Wiring this needs one component change: a system whose `visibleRoot` spans
> two source subtrees (the existing casement plus the actuator). Worth
> confirming the actuator's mounting geometry against the real hardware
> FourlinQ installs before modelling.

**Image prompt**
> A white uPVC casement window standing open about 30 degrees, with a slim
> white electric chain actuator mounted on the top frame and its arm extended
> to the sash. A small square white wall switch plate beside the frame. [shared
> constraints]

### 5. Corner Window — no product id yet

A Marvin-catalogue gap. **Confirm FourlinQ fabricates these before
commissioning** — a structural corner needs a specific mullion detail, and if
they do not make it, this is wasted spend.

**3D brief**
> Model a two-plane corner window meeting at 90°, each plane 1 200 mm ×
> 1 400 mm. The defining feature is the corner joint: model a butt-glazed
> post-free corner where the two glass planes meet directly, with a slim
> concealed structural post behind. Each plane is one fixed lite over one
> operable casement.
> Nodes: `corner_frameL`, `corner_frameR`, `corner_post`, `corner_panelL`,
> `corner_panelR`.
> Animation: both `corner_panel*` rotate outward 60° between t=0 and t≈1.9 s.

**Image prompt**
> A corner window where two glazed planes meet at a right angle with no visible
> corner post, glass butting directly to glass, in slim white uPVC frames. Each
> plane has a fixed upper lite and a lower opening casement. Shown as a
> free-standing corner unit. [shared constraints]

### 6. Bay / Bow Window — no product id yet

A Marvin-catalogue gap, and the most expensive to model — a multi-unit
assembly with a roof, not a single window. **Confirm demand first.**

**3D brief**
> Model a three-facet bay window projecting 600 mm from a 2 400 mm wall
> opening. Centre facet 1 200 mm fixed; two 30° angled flanking facets each
> 600 mm, each an operable casement. Include the head board and a sloped lead-
> finish roof over the projection, plus the seat board below. Bow variant: five
> facets on a shallow arc, all equal width.
> Nodes: `bay_frameC`, `bay_frameL`, `bay_frameR`, `bay_panelL`, `bay_panelR`,
> `bay_roof`, `bay_seat`. Roof and seat `parts`.
> Animation: `bay_panelL` and `bay_panelR` rotate outward 60° between t=0 and
> t≈1.9 s.

**Image prompt**
> A three-panel bay window projecting outward from a flat wall, with a wide
> fixed centre panel and two angled side casements, slim white uPVC frames, a
> sloped grey metal roof over the projection and a wooden seat board beneath.
> [shared constraints]

---

## Priority

1. **Nothing** — wire the nine already-licensed systems and confirm hung/pivot.
2. **Automated Windows** — actuator only, smallest asset, kills a live placeholder.
3. **Glass Railing** and **SC-Door** — real products, live placeholders, self-contained.
4. **Automated Door** — real product, live placeholder, more parts.
5. **Corner**, then **Bay/Bow** — only after confirming FourlinQ fabricates them.

Four of the six above are placeholder-replacement for products already on the
site. The two Marvin gaps are the only ones that add a product, and both are
blocked on a client answer, not on art.

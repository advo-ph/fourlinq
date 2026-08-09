# 3D asset brief — what still needs making

> **Updated 2026-08-09.** A Claude Design handoff supplied procedural builders
> for twelve more systems, all now baked to GLB and live (`npm run
> handoff:export`). That removed **corner** and **bay/bow** from this document's
> commission list — they were already modelled. What remains below is genuinely
> unmade.


Twenty-nine systems animate or render in `Window3D`, from two sources: the
licensed makinwhat GLB and twelve GLBs FourlinQ owns outright, baked from the
handoff builders (see [LICENSES.md](LICENSES.md)). This document briefs only
what neither supplies, so nobody commissions art we already have.

Run `npm run probe:glb` before commissioning anything. If a system appears in
that output, it needs wiring, not modelling.

## Already covered — do not commission

Every assembly in the licensed binary is wired — `npm run probe:glb --
--unclaimed` reports **0 unclaimed top-level nodes**, and a test keeps it that
way.

### From the handoff builders — FourlinQ-owned

| System | Answers configurator type | Status |
| --- | --- | --- |
| Sliding Door | `sliding-door` | animated |
| Lift & Slide | `lift-slide` | animated |
| Large Panel · multislide | `large-panel-doors` | animated, 4-panel |
| Casement Door | `entrance` (labelled "Casement Door") | animated |
| 90 Series | `90-series` | animated |
| Curtain Wall | `curtain-wall` | animated vent insert |
| Arch / Round-top | `arch-shapes` | non-operable |
| Triangle Gable | — | non-operable |
| French Door | **none — see below** | animated |
| Bay · Bow · Corner | — | assembly view, casements not animated |

**French Door is deliberately unmapped.** The configurator's `french-door` is
"French *Sliding* Door"; the baked model is a hinged pair from
`buildSwingDoor`. Right name, wrong mechanism, so it stays in the viewer's rail
but must not stand in for that product. Asserted by test.

`special-shapes` and `custom-shapes` stay unmapped too — they are catch-alls,
and any single model claims a geometry the customer did not choose.

### From the licensed makinwhat model

| System | Status |
| --- | --- |
| Casement (plain, 2-lite) | animated, live |
| Awning | animated, live · grille option |
| Sliding (2-panel, 4-panel) | animated, live · grille option on the 2-panel |
| Slide & Fold | animated, live |
| Louvre (narrow, wide blade) | animated, live — replaced a schematic placeholder |
| Fixed / Picture / Direct Glaze | rendered, non-operable (correct) · grille option |
| Hung | animated, live · grille option — this is the Marvin double-hung gap |
| Pivot | animated, live · grille option |
| Revolving | animated, live |

**Grilles are an option, not a system.** The model ships each as a complete
alternate assembly, so each has its own entry in `SYSTEMS` with its own
measured numbers — but the UI surfaces them as a Grille toggle beside the
finish picker, never as their own tab. "Sliding" and "Sliding · grille" side by
side in the rail would read as two products.

Every grille bar is material `frame3`, so grilles take the frame finish along
with everything else. Run `npm run probe:glb -- --material` to see which
materials each system carries.

**Hung, Pivot and Revolving are exposed on instruction, not on confirmation.**
They render correctly, but a tab is a shop window: if FourlinQ does not
fabricate one, remove its line from `CATALOGUE_SYSTEM` in
`src/components/3d/window-system.ts`. Nothing else needs to change.

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

### If the asset is a builder rather than a file

A procedural three.js builder is the better delivery, and the pipeline already
takes them. Export a `build*(opts)` returning `{ group, setOpen(t) }` where `t`
runs 0 (closed) to 1 (open), drop it in `scripts/handoff/model/`, add an entry
to the registry in `scripts/handoff/export-glb.mjs`, then:

```
npm run handoff:export    # bakes the clip and writes public/models/system/<id>.glb
npm run handoff:verify    # fails if the clip exists but nothing actually moves
npm run probe:glb         # measures center / scale / openTime
```

The bake samples `setOpen` and keeps only channels that move, so points 2 and 4
above are handled for you — you do not author the clip, and node names only
need to be unique within the file. Material names still matter: map them in
`MATERIAL_AS`.

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

### 5. Corner, Bay and Bow — retired 2026-08-09

**Do not commission.** These were briefed here as Marvin-catalogue gaps blocked
on a client answer. The handoff builders already model all three
(`combination_corner`, `combination_bay`, `combination_bow`), and they are
live in the viewer. The remaining question is a product one — does FourlinQ
fabricate them — not an art one.

One genuine limitation: the combination assemblies are static. A bay’s flanking
lites are casements and do open; the model does not animate them, which is why
the viewer says "Assembly view — casements not animated" rather than claiming
the unit is fixed. Animating them is a change to
`scripts/handoff/model/combination-model.js`, not a new commission.

---

## Priority

1. **Automated Windows** — actuator only, smallest asset, kills a live placeholder.
2. **Glass Railing** and **SC-Door** — real products, live placeholders, self-contained.
3. **Automated Door** — real product, live placeholder, more parts.

All four remaining items are placeholder-replacement for products already on
the site. Nothing on this list adds a product, and nothing is blocked on a
client answer — corner and bay/bow, which were, are now modelled.

**Two things that are not commissions but are still open:**

- **`tilt-turn` has no 3D anywhere** — not in the licensed model, not in the
  handoff builders. It is a real configurator type, so it is the last honest
  gap in the type list. A tilt-turn is a casement plus a bottom-hung tilt
  position; `window-model.js` is the natural place to add it, which makes it a
  builder change rather than an asset commission.
- **Bay, bow and corner are static.** Their flanking lites are casements that
  open in reality. Animating them is a change to `combination-model.js`.

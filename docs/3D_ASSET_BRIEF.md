# 3D asset brief — what still needs making

> **Updated 2026-08-10.** The per-system briefs below are now **builder-first**:
> every sheet asks for a `build*(opts)` in `scripts/handoff/model/` rather than
> a delivered GLB, and states its own mechanism, `opts` surface, material names
> and `handoff:verify` threshold. Two sheets were added for products the client
> named on 2026-08-07 — **louvre / jalousie** (§6, the last licence blocker) and
> **slim doors** (§7, mechanism unconfirmed). Tilt & turn is explicitly *not*
> briefed; see the closing section for why.
>
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

Eight more systems — casement, casement 2-lite, awning, sliding, fixed, the
fixed grille, hung and slide & fold — were **moved off** the licensed model onto
these builders on 2026-08-09. Same tabs, same ids, owned geometry.

### Still from the licensed makinwhat model

Only six assemblies still render from it, and clearing them is what ends the
attribution requirement:

| System | Blocker |
| --- | --- |
| **Louvre, narrow and wide** | **no builder — and it is a shipped product.** Briefed at §6 |
| Sliding · 4-panel | `slider-model.js` is 2-panel only |
| Sliding / hung / awning grilles | only `fixed` has a builder grid option |

`pivot` and `revolving` were withdrawn from the rail: neither is a confirmed
FourlinQ product and a revolving door is not a uPVC window, so they were the
cheapest two to give up.

### Historical — the licensed model's full contents

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

Each has a **builder brief** (preferred — the ask was "an actual moving thing")
and an **image prompt** fallback. Image fallbacks are specified as a matched
set: same camera, same light, same framing, transparent background, so a
swapped type does not shift on the page.

**Every sheet below asks for a builder, not a GLB drop, and the reason is the
same each time:** the bake authors the animation clip itself by sampling
`setOpen(t)`, so contract points 2 and 4 — one top-level node per moving part,
no name a prefix of another, one 4 s `Scene` clip with the open pose at a
recorded instant — stop being the asset author's problem. Node names only have
to be unique inside the file. What survives is source: a builder is diffable,
re-bakeable when a dimension changes, and parameterised, so narrow and wide
louvre are one file rather than two commissions. A delivered GLB is a binary
nobody can correct. Material names are the one contract a builder does **not**
escape — see each sheet's material line, and `MATERIAL_AS` in
`scripts/handoff/export-glb.mjs` for the full map.

### The palette to draw from

Take materials from `makeMaterials()` in `window-model.js`, or
`makeCladMaterials()` in `fixed-model.js` when a part needs the third frame
slot. Authored name → viewer slot:

| Authored name | Slot | Recoloured by the finish picker |
| --- | --- | --- |
| `upvc_white_matte` | `frame1` | yes |
| `upvc_white_rebate` | `frame2` | yes |
| `alu_clad_graphite` / `alu_pressure_cap` | `frame3` | yes |
| `glass_clear` | `glass` | no |
| `hardware_matte_black` | `parts` | no |
| `hinge_steel` | `parts2` | no |
| `epdm_gasket_black` | `gasket` | no |

Anything given a name outside that map bakes to an unmapped material and the
finish picker will silently not reach it. If a part should take the frame
finish, it must end up `frame1`, `frame2` or `frame3` — there is no fourth.

### The acceptance test, stated once

Every sheet below is accepted on the same three commands, in order:

```
npm run handoff:export    # writes public/models/system/<id>.glb
npm run handoff:verify    # PASSES only if something really moves
npm run probe:glb         # emits center / scale / openTime to paste into SYSTEMS
```

`handoff:verify` is the hard gate: `MIN_TRANSLATION_MM = 40` and
`MIN_ROTATION_DEG = 8` in `scripts/handoff/verify-glb.mjs`. A clip that exists
but whose peak channel travels less than 40 mm or turns less than 8° **fails**
— which is the trap for the small mechanisms on this list (an actuator arm, a
louvre fin, a slim-door leaf). Each sheet states the travel it must clear, and
where a real mechanism moves less than the threshold the sheet says how to
model it honestly rather than exaggerating the motion.

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

Live now as a schematic placeholder. Specialist category, not a window. Client
asked for it by name, 2026-08-07.

**Deliver as** `scripts/handoff/model/railing-model.js`, exporting
`buildGlassRailing(opts)` → `{ group, setOpen(t) }`. Builder over GLB for the
reason above, and with extra force here: a railing is a **run**, and run length
and panel count are exactly the things a client changes late. As a builder that
is an `opts` change and a re-bake; as a GLB it is a new commission.

**Mechanism**
> The balustrade itself does not move, and the brief must not pretend it does.
> A frameless structural glass balustrade is a 3 000 mm run at 1 100 mm above
> finished floor: three 12 mm toughened laminated panels with 15 mm shadow gaps,
> seated in a continuous floor-mounted aluminium base channel, capped by a round
> 50 mm brushed stainless top handrail spanning all three, with a cover trim on
> the channel and two spigot fixings visible per panel. The only honest moving
> part is the optional **gate leaf**: one panel hung on two patch fittings at
> the stile, rotating about the vertical (Y) axis of that stile edge, 0 → 90°
> outward, in ~1.9 s. Outward, not inward — "everything opens out" is a standing
> client instruction and applies to a gate as much as a sash.

**opts surface**
> `{ run: 3.0, height: 1.1, panel: 3, glassThickness: 0.012, gap: 0.015,
> handrail: true, gate: false, gateIndex: 0, materials }`
> — `run` in metres and `panel` the count across it (panel widths derived, not
> hand-listed, the way `dividePanelWidth` does it in the 2D preview).
> `handrail: false` gives the frameless-with-no-cap variant. `gate` is what
> turns the asset operable. `materials` accepts an injected palette, matching
> every existing builder's `opts.materials || makeMaterials()` line.

**Materials**
> Base channel and cover trim → `upvc_white_matte` (`frame1`); the handrail →
> `upvc_white_rebate` (`frame2`), so the rail and the channel read apart under a
> dark finish. Panels → `glass_clear` (`glass`). Spigots, patch fittings and gate
> hinges → `hinge_steel` (`parts2`); a gate latch or pull → `hardware_matte_black`
> (`parts`). Do not put the handrail on `parts` — it is a finish-bearing part and
> `parts` is never recoloured.

**Acceptance**
> With `gate: false` the builder ships **zero animation channels** and
> `openTime: 0`; `handoff:verify` has no clip to judge, and that is the correct
> outcome for a fixed balustrade — do not invent a wobble to satisfy the gate.
> With `gate: true` the leaf's 90° rotation clears `MIN_ROTATION_DEG = 8` by an
> order of magnitude. Bake the gate variant if the viewer entry is to be
> interactive; bake the plain run if it is a render. Then `npm run probe:glb`
> for `center` / `scale` / `openTime` — never hand-typed.

**Image prompt** *(fallback only, if geometry is not viable)*
> A frameless glass balustrade of three tall clear tempered glass panels in a
> slim brushed aluminium floor channel, with a round brushed stainless steel
> top handrail running across them. Slim shadow gaps between panels. [shared
> constraints]

### 2. Sliding Casement Door — `sliding-casement-door`

Builder delivered (`scripts/handoff/model/sliding-casement-door-model.js`,
previously `sc-door-model.js`). Assets inherited from the former `sc-door`
entry per client instruction 2026-08-16. Named "Sliding Casement" in all copy —
never "glider" (guarded by `data-integrity.test.ts`).

**Deliver as** `scripts/handoff/model/sliding-casement-door-model.js`, exporting
`buildSlidingCasementDoor(opts)` → `{ group, setOpen(t) }`. Builder over GLB:
the Sliding Casement Door shares most of its section with `sliding-door-model.js`,
so authoring it as source lets it borrow that file's track, interlock and threshold
helpers instead of a modeller redrawing them — and the bake writes the slide clip
from `setOpen`, so nobody hand-keys a translation and nobody has to obey the node
naming rules.

**Mechanism**
> Two leaves in a uPVC outer frame, 1 800 × 2 100 mm overall, over a low 20 mm
> threshold. Each leaf is a fully glazed casement panel — casement *section*,
> sliding *action* — carried on a concealed bottom-running track with a head
> track for guidance only. The active leaf translates **horizontally along X**,
> 0 → 600 mm, reaching full open at t = 1.9 s and returning by t = 4; the
> passive leaf never moves. Nothing rotates: the leaves pass one another, they
> do not swing, and a swing here would misdescribe the product. The interlocking
> centre stile is the detail that sells it — one leaf's stile laps the other's
> when shut and the lap opens as the leaf runs. Full-height flush pull on each
> leaf; the pull travels with its leaf.

**opts surface**
> `{ width: 1.8, height: 2.1, panel: 2, active: "left", travel: 0.6,
> threshold: 0.02, materials }`
> — `active` picks which leaf runs, so a mirrored install is an opt not a second
> model. `panel: 3` should be accepted later (XOX), but bake `2` first; do not
> ship a `panel` value the geometry does not actually handle, which is the bug
> `multislide-model.js` has today at its `panels === 3 ? 3 : 4` clamp.

**Materials**
> Outer frame and threshold → `upvc_white_matte` (`frame1`). Leaf sections,
> interlock stile and glazing bead → `upvc_white_rebate` (`frame2`). Glazing →
> `glass_clear` (`glass`). Flush pulls and the lock keep → `hardware_matte_black`
> (`parts`). Track, rollers and guides → `hinge_steel` (`parts2`). Weatherseal
> at the interlock and jambs → `epdm_gasket_black` (`gasket`). All three frame
> slots are optional here but at least `frame1` and `frame2` must be present, or
> the finish picker recolours a flat single-tone slab.

**Acceptance**
> Peak translation is 600 mm against `MIN_TRANSLATION_MM = 40` — fifteen times
> the floor, so `handoff:verify` is not close to the edge. Watch instead that
> the pull handle and the interlock are **children of the moving leaf group**;
> if they are parented to the root they stay put while the leaf slides and the
> bake still passes, because one channel moved. Verify passing is not the same
> as the door looking right.

**Image prompt** *(fallback only, if geometry is not viable)*
> A two-leaf sliding patio door in a slim white uPVC frame, both leaves fully
> glazed with a narrow interlocking centre stile and full-height flush pull
> handles, set on a low flat threshold. Leaves aligned closed and flush. [shared
> constraints]

### 3. Automated Door Access — `automated-door`

Live now as a schematic placeholder. Answers the 2026-07-10 "automate your
door / digital access" ask. Scope is project-specified, so the model should
read as *representative*, not as one SKU.

**Deliver as** an `opts` branch on the existing
`scripts/handoff/model/swing-door-model.js` — `buildSwingDoor({ type:
"automated-door", operator: true, reader: true })` — not a new file and
certainly not a GLB. `buildSwingDoor` already serves `casement-door`,
`french-door` and `ninety-series` from one function; an automated door is that
same leaf plus two hardware add-ons, and the swing sign convention there is
already correct (outswing is its default). Re-using it means the operator arm
gets solved against the *same* leaf angle the door actually uses, which a
separately modelled arm cannot guarantee, and the bake writes both channels
from one `setOpen`.

**Mechanism**
> A single outward-opening entrance leaf, 1 000 × 2 100 mm, in a uPVC frame:
> upper two-thirds glazed, solid lower panel. The leaf rotates about the
> **vertical (Y) axis through its hinge stile**, 0 → 90°, peaking at t = 1.9 s
> and returning by t = 4. Outward is `swing: "out"`, which in this file's
> convention (interior = +Z) carries the leaf toward −Z, away from the viewer's
> camera. That is not a styling choice — "everything opens out, never inward" is
> a standing client instruction. Two additions over a plain casement door: a
> concealed overhead swing operator in the head frame whose arm is visible where
> it meets the leaf, the arm solved as a two-bar linkage tracking the leaf angle
> (the pattern `awning-model.js` already uses for its stay arms — anchor point,
> pin point, `placeBone`); and a slim keypad/card reader, 76 × 110 mm, mounted on
> the frame at 1 050 mm above floor. The reader **does not move**; it is on the
> frame, not the leaf. A lever handle and a visible multi-point lock keep in the
> jamb complete it.

**opts surface**
> `{ type: "automated-door", swing: "out", handing: "RH", lite: "twoThirds",
> operator: true, reader: true, readerHeight: 1.05, maxAngleDeg: 90, materials }`
> — keep `swing` and `handing` on the names `swing-door-model.js` already uses
> rather than inventing parallel ones. `operator` and `reader` default **false**
> so the existing three door ids bake unchanged; the automated id is the only
> one that turns them on.

**Materials**
> Frame → `upvc_white_matte` (`frame1`); leaf section, solid lower panel and
> glazing bead → `upvc_white_rebate` (`frame2`). Glazing → `glass_clear`
> (`glass`). Reader body, lever handle and lock keep → `hardware_matte_black`
> (`parts`) — the reader is meant to read as black hardware, and `parts` is
> never recoloured, so it stays black under an oak or anthracite frame instead
> of turning into a wood-grain box. Operator housing and linkage arm →
> `hinge_steel` (`parts2`). Perimeter seal → `epdm_gasket_black` (`gasket`).

**Acceptance**
> The 90° leaf rotation clears `MIN_ROTATION_DEG = 8` easily. The risk is the
> **arm**: if the linkage is modelled as a short stroke it can land under both
> thresholds, and `handoff:verify` will still pass on the leaf channel alone
> while the arm channel is silently dropped by the bake's does-it-vary filter.
> Size the visible arm travel so its own peak exceeds 40 mm — an overhead
> operator's arm genuinely sweeps far more than that, so this is honesty, not
> exaggeration. Confirm the arm geometry against the operator FourlinQ actually
> installs before this is treated as final.

**Image prompt** *(fallback only, if geometry is not viable)*
> A single white uPVC entrance door, glazed upper two-thirds with a solid lower
> panel, a slim black keypad card reader mounted on the frame beside it at hand
> height, and a lever handle. Door closed, flush in frame. [shared constraints]

### 4. Automated Windows — `automated-window`

Live now as a schematic placeholder. This one is a **composite, not a new
model**: it is a casement plus an actuator, and the casement already animates.

**Cheapest correct route:** author only the actuator as a small add-on node set
that can be shown alongside the existing `casement` subtree, rather than
commissioning a whole window.

**Deliver as** an `opts` branch on `scripts/handoff/model/awning-model.js` —
`buildAwning({ variant: "vent", actuator: true })` — baked to its own id
`automated-window`. This is the strongest builder-over-GLB case on the list.
A separately delivered actuator GLB would have to be *composited* with the
existing casement at runtime, which means a `visibleRoot` spanning two source
subtrees and therefore a component change in `Window3D`; worse, the arm's
extension would have to be hand-keyed to match a sash angle authored in a
different file, and the two would drift the moment either changed. Authored as
an `opts` branch, one `setOpen(t)` drives both the sash and the arm, the bake
emits one clip, and the composite problem disappears entirely.

**Mechanism**
> An awning sash, top-hinged, rotating about the **horizontal (X) axis at the
> head**, 0 → 32° — the motion `buildAwning` already implements. The addition is
> a chain or linear-rod actuator: a 300 × 40 × 40 mm housing fixed to the frame
> head (or the sill, for a rod type — confirm which FourlinQ fits), with an arm
> that **extends up to 250 mm** and whose free end is pinned to the sash rail.
> The arm is not free to be animated independently: solve its length and
> orientation from the sash angle each frame, exactly as `solveArm` /
> `placeBone` already do for the stay arms in that file, so the pin stays on the
> sash at every `t`. A separate 80 × 80 mm wall switch plate sits beside the
> frame and never moves. When `actuator: true`, drop or hide the manual cam
> handle — a motorised vent with a lever on it is a contradiction a fabricator
> will notice.

**opts surface**
> `{ variant: "vent" | "wide", actuator: false, actuatorType: "chain" | "rod",
> stroke: 0.25, mount: "head" | "sill", switchPlate: true, handle: true,
> materials }`
> — `actuator` defaults false so `awning` bakes exactly as it does today and the
> existing GLB is unchanged. `stroke` is the real hardware figure and is what
> the acceptance test below keys off.

**Materials**
> Actuator housing, arm and the switch plate → `hardware_matte_black` (`parts`)
> if the real hardware is black, `hinge_steel` (`parts2`) if it is mill/silver;
> pick one and say which in a comment. Both are left alone by the finish picker,
> which is right — an actuator does not change colour with the frame. Sash,
> frame and beads keep the awning builder's existing `upvc_white_matte` /
> `upvc_white_rebate` (`frame1` / `frame2`), glazing `glass_clear`, seals
> `epdm_gasket_black`. Nothing new needs adding to `MATERIAL_AS`.

**Acceptance**
> Two channels must survive the bake: the sash pivot at 32° (clears
> `MIN_ROTATION_DEG = 8`) and the arm at 250 mm (clears
> `MIN_TRANSLATION_MM = 40`). **This is the sheet where the gate can genuinely
> bite** — if the arm is modelled as a scaled bone rather than a translated
> node, the bake may record scale rather than translation and the arm
> contributes no qualifying channel. That still passes overall on the sash, so
> check `npm run handoff:verify` output per-channel rather than reading only the
> exit code. Confirm mounting position and stroke against the real actuator
> before this is final; 250 mm is a plausible figure, not a measured one.

**Image prompt** *(fallback only, if geometry is not viable)*
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

### 6. Louvre / jalousie — `louvre`, `louvre-wide`

Real product, confirmed: the client named louvre windows on 2026-08-07 and the
catalogue carries `louvre` today. This is the **last shipped product still
drawn from the licensed makinwhat model**, so an owned builder is what ends the
attribution requirement — see the Priority section.

> **A builder is being authored this run.** This sheet is deliberately written
> anyway, as the spec that builder is measured against and as the fallback if it
> does not land or does not pass `handoff:verify`. If a `louvre-model.js` exists
> when you read this, treat this sheet as the acceptance criteria, not as a
> commission.

**Deliver as** `scripts/handoff/model/louvre-model.js`, exporting
`buildLouvre(opts)` → `{ group, setOpen(t) }`. Builder over GLB, and here the
argument is close to decisive: a louvre is *n* identical fins driven by one
parameter. As a builder, narrow (~18 fins) and wide (~9 fins) are the same
function called twice with a different `fin` count, and a change to blade pitch
is one line re-baked. As a GLB it is two binaries, eighteen hand-named nodes
each, and the exact prefix trap the contract warns about — `fin1` vs `fin10` is
literally the collision that forced exact-name matching, and today's licensed
louvre is the only system in `window-system.ts` still relying on
`visibleRootPrefix` because of it. A builder retires that special case.

**Mechanism**
> A stack of glass blades in a uPVC frame, each blade held at its two ends in a
> clip carrier. Every fin rotates about its own **horizontal (X) axis through
> the blade's mid-chord**, and all fins rotate **in unison** — one angle drives
> the whole stack, because in reality they are linked by a vertical control arm
> down one jamb. Closed is roughly 15° off horizontal (blades overlapping,
> shedding water outward); fully open is ~85–90°, i.e. the blade face turned to
> vertical. Call it **0 → 70° of travel** per fin, peaking at t ≈ 1.9 s and
> returning by t = 4. The control arm itself translates **vertically along Y**,
> ~45–60 mm over the same interval, and the fin carriers pin to it — solve the
> arm from the fin angle rather than animating it separately. Narrow variant:
> ~18 fins, blade ~100 mm deep. Wide variant: ~9 fins, blade ~200 mm deep. Same
> overall opening height in both, which is what makes `fin` count and blade
> depth two views of one number.

**opts surface**
> `{ variant: "narrow" | "wide", width: 0.6, height: 1.2, fin: 18,
> bladeDepth: 0.1, closedAngleDeg: 15, openAngleDeg: 85, controlArm: true,
> screen: false, materials }`
> — `variant` sets sensible `fin` / `bladeDepth` defaults the way
> `buildAwning`'s `variant` sets `W` / `H` today; explicit `fin` overrides it.
> Derive fin pitch from `height` and `fin`, never list positions. `screen` is
> for the insect screen a tropical-market louvre usually carries — leave it
> `false` and unmodelled unless the client confirms it is supplied.

**Materials**
> Frame, jamb channels and head/sill → `upvc_white_matte` (`frame1`); the fin
> carriers/clips that read as part of the frame section → `upvc_white_rebate`
> (`frame2`). Blades → `glass_clear` (`glass`). Control arm, operator crank and
> the linkage pins → `hardware_matte_black` (`parts`); carrier pivots, if
> modelled as separate metal, → `hinge_steel` (`parts2`). If a blade variant is
> ever aluminium rather than glass, it must be `alu_clad_graphite` (`frame3`)
> and not `parts`, or the finish picker will leave the blades white while the
> frame goes anthracite — a visible fault.

**Acceptance**
> 70° of fin rotation clears `MIN_ROTATION_DEG = 8` nearly nine times over, so
> the gate is comfortable **provided the fins are separate animated nodes**. The
> failure mode to avoid: baking the whole fin stack as one rigid group that
> rotates — it passes `handoff:verify` and looks wrong. Each fin needs its own
> pivot group. Also check the control arm's ~50 mm travel individually; at
> `MIN_TRANSLATION_MM = 40` it is only just over the floor, and rounding the
> stroke down to 35 mm would drop that channel from the bake. After baking both
> ids, `npm run probe:glb` and replace the licensed-model entries in `SYSTEMS`
> (the two that use `visibleRootPrefix`) with `MODEL_SYSTEM("louvre")` and
> `MODEL_SYSTEM("louvre-wide")` plus plain `visibleRoot`. **Do not carry the
> existing `center` / `scale` / `openTime` numbers across** — they describe the
> licensed geometry and will be wrong for owned geometry. Re-probe.

**Image prompt** *(fallback only, if geometry is not viable)*
> A white uPVC louvre (jalousie) window with a vertical stack of horizontal
> clear glass blades held at each end in white clip carriers, blades tilted
> about forty degrees open so the gaps between them are clearly visible, a slim
> operator crank at the lower right of the frame. [shared constraints]

### 7. Slim doors — `slim-door`

Client instruction, 2026-08-07: *"slim doors photos..you need to add."*

> **Read this before building.** The instruction is confirmed; the *product
> definition* is not. "Slim" names a sightline, not a mechanism — a slim-profile
> door could be a hinged single leaf, a slim-framed slider, or a
> minimal-sightline pivot, and the meeting record does not say which. The
> geometry below therefore models the one thing that is certainly true — a
> narrow-sightline glazed leaf — on the least-committal mechanism, a single
> outward-hinged leaf. **Confirm the mechanism with the client before this is
> exposed as its own tab**, and until then do not let the site assert that
> FourlinQ sells a specific slim-door type. Modelling it is safe; naming it in
> the catalogue is a product claim.

**Deliver as** an `opts` branch on `scripts/handoff/model/swing-door-model.js`
— `buildSwingDoor({ type: "slim-door", sightline: 0.045 })` — or, if the
client's answer turns out to be a slider, on `sliding-door-model.js` instead.
Builder over GLB is what makes that *survivable*: the whole product is a
dimension change to profile face widths, so as source it is one parameter and a
re-bake in either host file, while as a delivered GLB a wrong mechanism guess
is a wasted commission and a wrong sightline is unfixable.

**Mechanism**
> A single fully glazed leaf, 900 × 2 100 mm, in a slim uPVC/aluminium-look
> frame: the defining number is the **sightline**, the visible face width of
> frame and leaf section — 45 mm against the 62 mm the existing builders use
> (`FACE = 0.062` in `awning-model.js` and its siblings), giving roughly 30 %
> more glass in the same opening. That contrast is the product, so if the asset
> is ever shown beside a standard door, show them at the same overall size. The
> leaf rotates about the **vertical (Y) axis through its hinge stile**, 0 → 90°
> **outward** (interior = +Z, so the leaf travels toward −Z), peaking at
> t ≈ 1.9 s and returning by t = 4. Concealed hinges, flush with the frame face
> — an exposed butt hinge undoes the slim read. A slim lever or a flush pull,
> no wide backplate.

**opts surface**
> `{ type: "slim-door", width: 0.9, height: 2.1, sightline: 0.045,
> leaf: 1, swing: "out", handing: "RH", hinge: "concealed", threshold: 0.02,
> materials }`
> — `sightline` is the one that matters and must actually drive the profile
> geometry, not just a comment. `leaf: 2` for a slim double. Keep `swing` and
> `handing` on the existing names.

**Materials**
> Outer frame → `upvc_white_matte` (`frame1`); leaf section and glazing bead →
> `upvc_white_rebate` (`frame2`). If the product is specified as
> aluminium-look rather than uPVC, use `alu_clad_graphite` (`frame3`) for the
> exterior face — all three still take the finish, so the picker reaches every
> visible profile either way. Glazing → `glass_clear` (`glass`). Lever or flush
> pull and the lock keep → `hardware_matte_black` (`parts`). Concealed hinges →
> `hinge_steel` (`parts2`) even though they are barely visible; giving them
> `parts` would blacken them against the pale hinges every other builder uses.
> Perimeter seal → `epdm_gasket_black` (`gasket`).

**Acceptance**
> 90° of leaf rotation clears `MIN_ROTATION_DEG = 8` comfortably. The specific
> risk here is the opposite of a gate failure: a slim door is mostly glass, and
> if the profile geometry is authored thin enough it is easy to end up with a
> leaf whose only frame-slot material is a hairline — visually the finish picker
> then appears not to work. Check with `npm run probe:glb -- --material` that
> both `frame1` and `frame2` are present and carry real surface area.

**Image prompt** *(fallback only, if geometry is not viable)*
> A single full-height fully glazed door with an unusually narrow white frame
> and leaf profile — sightlines about half the width of a standard door — with
> concealed hinges flush to the frame, a slim lever handle, and a low flat
> threshold. Door closed, flush in frame. [shared constraints]

---

## Priority

1. **Louvre / jalousie** (§6) — the one that ends the licence dependency. It is
   the last shipped product still drawn from the licensed model, so it is the
   only real blocker to removing the makinwhat attribution, and it retires the
   `visibleRootPrefix` special case at the same time. A builder is being
   authored this run; §6 is its acceptance spec. A panel-count option on
   `slider-model.js` and grille options on the sliding / hung / awning builders
   finish the licence job after it.
2. **Automated Windows** (§4) — an `opts` branch on an existing builder, the
   smallest change on the list, kills a live placeholder.
3. **Glass Railing** (§1) and **Sliding Casement Door** (§2) — real products,
   builder delivered (`sliding-casement-door-model.js`); real photo and
   slide→swing frame set still outstanding.
4. **Automated Door** (§3) — real product, live placeholder, more parts.
5. **Slim doors** (§7) — confirmed as an instruction, unconfirmed as a
   mechanism. Model it if there is capacity; do not give it a catalogue tab
   until the client says which mechanism it is.

Everything from 1 to 4 is placeholder-replacement for products already on the
site. Nothing there adds a product, and nothing is blocked on a client answer.
Item 5 is not blocked on an answer to *build*, only to *name*.

**Two more that are not commissions but are still open:**

- **Bay, bow and corner are static.** Their flanking lites are casements that
  open in reality. Animating them is a change to `combination-model.js`.
- **6-panel FSSSSF sliding run.** It ships in the 2D configurator
  (`src/data/configurator.ts`, id `fixed-slide-slide-slide-slide-fixed`) but
  has no 3D counterpart: `multislide-model.js` clamps to 3 or 4 panels and
  fixes only the last one, so there is no fixed leaf at both ends. That is a
  builder change plus a bake entry, not a commission.

## Not commissioned: tilt & turn

**`tilt-turn` has no 3D anywhere** — not in the licensed model, not in the
handoff builders — and it must stay that way for now. It is a real
configurator type and a real entry in `src/data/glossary.ts` flagged
`is_fourlinq_offering: true`, but that entry describes a sash that *tilts
inward and swings inward like a door*, which is the exact motion the client
corrected on the record: *"Everything is going out. Never inward."*
(`MEETING_INSTRUCTION_INVENTORY.md`, `00:12:32`).

That is not a copy problem. A tilt & turn genuinely opens inward — it is what
the hardware does — so the contradiction cannot be written away, and any asset
built for it would have to either show inward motion the client has ruled out
or show outward motion the product does not have. Both are false.

**No asset should be commissioned, and no builder branch added, until the
client confirms whether FourlinQ sells tilt & turn at all.** If the answer is
no, the fix is deleting the glossary entry and the configurator type, not
modelling anything. If the answer is yes, this document gains a §8 and the
"never inward" instruction gains a documented exception. Deliberately, there
is no prompt sheet for it above.

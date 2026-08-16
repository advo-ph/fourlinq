# Sliding Casement Door — asset prompt

> **Self-contained.** Everything needed to build this one asset is in this file:
> the brief, the contract it must satisfy, the material palette, and the test it
> is accepted on. Nothing to cross-reference. Hand this file to Claude Design, to
> a 3D contractor, or to whoever writes the builder.
>
> Generated from [3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md) by
> `node scripts/_split-brief.mjs` — edit the brief, not this file, and re-run.

---

### 2. Sliding Casement Door — `sliding-casement-door`

Builder delivered (`scripts/handoff/model/sliding-casement-door-model.js`,
previously `sc-door-model.js`). Assets inherited from the former `sc-door`
entry per client instruction 2026-08-16. Named "Sliding Casement" in all copy —
never "glider" (guarded by `data-integrity.test.ts`).

**Deliver as** `scripts/handoff/model/sliding-casement-door-model.js`, exporting
`buildSlidingCasementDoor(opts)` → `{ group, setOpen(t) }`. Builder over GLB: the
Sliding Casement Door shares most of its section with `sliding-door-model.js`, so
authoring it as source lets it borrow that file's track, interlock and threshold
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

---

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

---

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

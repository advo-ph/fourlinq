# Automated Door Access — asset prompt

> **Self-contained.** Everything needed to build this one asset is in this file:
> the brief, the contract it must satisfy, the material palette, and the test it
> is accepted on. Nothing to cross-reference. Hand this file to Claude Design, to
> a 3D contractor, or to whoever writes the builder.
>
> Generated from [3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md) by
> `node scripts/_split-brief.mjs` — edit the brief, not this file, and re-run.

---

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

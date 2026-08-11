# Automated Windows — asset prompt

> **Self-contained.** Everything needed to build this one asset is in this file:
> the brief, the contract it must satisfy, the material palette, and the test it
> is accepted on. Nothing to cross-reference. Hand this file to Claude Design, to
> a 3D contractor, or to whoever writes the builder.
>
> Generated from [3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md) by
> `node scripts/_split-brief.mjs` — edit the brief, not this file, and re-run.

---

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

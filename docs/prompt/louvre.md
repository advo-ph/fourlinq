# Louvre / jalousie — asset prompt

> **Self-contained.** Everything needed to build this one asset is in this file:
> the brief, the contract it must satisfy, the material palette, and the test it
> is accepted on. Nothing to cross-reference. Hand this file to Claude Design, to
> a 3D contractor, or to whoever writes the builder.
>
> Generated from [3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md) by
> `node scripts/_split-brief.mjs` — edit the brief, not this file, and re-run.

---

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

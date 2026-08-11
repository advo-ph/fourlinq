# Slim doors — asset prompt

> **Self-contained.** Everything needed to build this one asset is in this file:
> the brief, the contract it must satisfy, the material palette, and the test it
> is accepted on. Nothing to cross-reference. Hand this file to Claude Design, to
> a 3D contractor, or to whoever writes the builder.
>
> Generated from [3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md) by
> `node scripts/_split-brief.mjs` — edit the brief, not this file, and re-run.

---

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

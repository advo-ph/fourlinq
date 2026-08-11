# Glass Railing — asset prompt

> **Self-contained.** Everything needed to build this one asset is in this file:
> the brief, the contract it must satisfy, the material palette, and the test it
> is accepted on. Nothing to cross-reference. Hand this file to Claude Design, to
> a 3D contractor, or to whoever writes the builder.
>
> Generated from [3D_ASSET_BRIEF.md](../3D_ASSET_BRIEF.md) by
> `node scripts/_split-brief.mjs` — edit the brief, not this file, and re-run.

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

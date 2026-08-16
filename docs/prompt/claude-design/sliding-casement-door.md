# Claude Design prompt — Sliding Casement Door

> Paste everything below the line into Claude Design as one prompt. It is
> self-contained: it does not assume access to the FourlinQ repo.

---

Build a procedural three.js model of a **sliding casement door** for FourlinQ, a
uPVC and aluminium windows-and-doors fabricator in the Philippines.

Deliver it as `sliding-casement-door-model.js`, exporting `buildSlidingCasementDoor(opts)`.

## The product

FourlinQ's "SC-Door System". A casement-proportioned door leaf that **slides on
a track rather than swinging on hinges** — the client's own description is "a
casement door that slides rather than swings".

This is the distinction that matters and the one most likely to be got wrong:
it must not look like a hinged casement door, and it must not look like a
standard two-panel patio slider. It is a single tall leaf with casement
proportions — a visible stile-and-rail frame around a large glass lite — running
on a track.

**Geometry.** Opening 1800 × 2400 mm. One operable leaf ~900 mm wide with a
~100 mm stile and rail width, and one fixed lite of the same width beside it.
A slim head track and a matching floor track, both visible. The leaf sits on the
interior track, the fixed lite on the exterior one, so they pass in different
planes with roughly 60 mm between them.

**Motion.** `motion: "translate_x"`. The operable leaf translates along +X (or
−X, your choice — state it in the spec) by ~820 mm, clearing most of the fixed
lite. Straight linear travel, no lift, no tilt. Two visible rollers per leaf
bottom.

## opts

`{ width: 1.8, height: 2.4, openRatio: 0.9, handing: "RH", materials }`

## Materials for this asset

Frame, leaf stiles and rails, and the fixed lite's surround → `upvc_white_matte`,
with rebates and glazing beads on `upvc_white_rebate`. Glazing → `glass_clear`.
Head and floor tracks → `hinge_steel`. Handle and lock → `hardware_matte_black`.
Weather seal between leaf and jamb → `epdm_gasket_black`.

## What to deliver

Two files.

**1. `<name>-model.js`** — a single ES module, `import * as THREE from 'three'`,
no other dependency. It exports one builder:

```js
export function build<Name>(opts = {}) {
  // ...
  return { group, setOpen(t) };   // t: 0 = fully closed, 1 = fully open
}
```

- `group` is a `THREE.Group` containing the whole assembly.
- `setOpen(t)` is called with any `t` in 0..1 and must move the mechanism
  smoothly and monotonically. It is sampled 61 times to bake an animation clip,
  so it must be a pure function of `t` — no internal "current state", no
  tweening, no timers, no `requestAnimationFrame`.
- Anything that moves must be its own `THREE.Group` with a stable `name`, and
  `setOpen` moves the GROUP, not the mesh inside it. A mesh whose geometry is
  rebuilt per frame cannot be baked.

**2. `<id>.json`** — a spec sidecar in this vocabulary (use only the keys that
apply): `id`, `motion`, `units`, `size_mm`, `panel_count`, `max_angle_deg`,
`open_ratio`, `handing`, `hardware`, `meshes`, `clip`, `note`.

## Hard conventions — an asset that breaks these does not drop in

- **Units are real metres.** A 900 mm wide sash is `0.9`. Never centimetres.
- **Y up. +Z is the interior**, the side the viewer's camera sits on. Anything
  that opens outward rotates or translates toward **−Z**. FourlinQ's standing
  instruction is that everything opens *out*, never inward — apply it to sashes,
  door leaves and gates alike.
- **Origin at the centre of the opening**, so the assembly is roughly symmetric
  about x=0 and y=0. Do not model a floor, a wall, a room, a ground plane, a
  human figure, or a backdrop. The assembly only.
- **Every mesh gets a `name`.** Use lowercase_with_underscores, and number
  repeated parts (`fin_01`, `fin_02`). Names are how the animation is bound.
- **Real profile detail, not boxes.** Frames and sashes are mitred rectangular
  rings extruded in Z — build them with `THREE.Shape` + a rectangular hole +
  `ExtrudeGeometry`, ~62 mm face width and ~70 mm depth for uPVC. Add glazing
  beads and a gasket line. This is what makes it read as a fenestration product
  rather than a cardboard cutout.
- **Low poly count.** `curveSegments: 1` on straight extrusions. The whole
  assembly should land under ~400 kB when exported to GLB.

## Materials — use these exact names or the finish picker cannot reach the part

Create them once in a `makeMaterials()` helper and share the instances.

| `material.name` | What it is | Use for |
|---|---|---|
| `upvc_white_matte` | white uPVC, roughness 0.62 | outer frame, sash faces, any finish-bearing profile |
| `upvc_white_rebate` | slightly darker uPVC, roughness 0.7 | rebates, inner faces, glazing beads, muntin bars |
| `alu_clad_graphite` | dark anodised aluminium | aluminium cladding or capping, where the product has it |
| `glass_clear` | transparent, opacity 0.28, DoubleSide | glazing, glass blades, glass panels |
| `epdm_gasket_black` | matte black rubber | gaskets and weather seals |
| `hardware_matte_black` | dark metal, some metalness | handles, cranks, latches, actuator bodies |
| `hinge_steel` | light steel, metalness 0.35 | hinges, spigots, patch fittings, rollers, arms |

**The first three are the only ones that recolour with the finish.** If a part
is finish-bearing — a frame, a rail, a cap — it must be `upvc_white_matte`,
`upvc_white_rebate` or `alu_clad_graphite`. Putting a frame part on
`hardware_matte_black` means it stays black while the customer changes the
colour around it. That bug has shipped here before; do not reintroduce it.

## Acceptance

The asset is accepted when, sampling `setOpen(0)` against `setOpen(1)`:

- something **translates ≥ 40 mm** or **rotates ≥ 8°** — whichever the mechanism
  is. Real travel should exceed this by a wide margin;
- the closed pose is genuinely closed — leaves in plane, no gaps, and **nothing
  interpenetrating anything else**;
- no part passes through the frame or through another leaf at any `t`, not just
  at the endpoints;
- every moving node is named and is a group.

If the honest answer is that the product does not move — a fixed balustrade, a
static assembly — then return `setOpen` as a no-op and say so. Do not invent a
wobble to satisfy the threshold. A static asset that admits it is static is
correct; a fake mechanism is not.

/**
 * Generate copy-paste Claude Design prompts, one per unbuilt asset.
 *
 * These are NOT the engineering briefs in docs/prompt/ — those assume you can
 * read the repo. Claude Design cannot, so every prompt here restates the whole
 * contract: the module shape, the material names, the axis convention, the
 * acceptance thresholds. Each file is meant to be selected whole and pasted.
 *
 * Written as a generator so the shared contract is identical in all five. When
 * it changes it changes everywhere, which is the failure mode the first pass had.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "docs", "prompt", "claude-design");

const CONTRACT = `
## What to deliver

Two files.

**1. \`<name>-model.js\`** — a single ES module, \`import * as THREE from 'three'\`,
no other dependency. It exports one builder:

\`\`\`js
export function build<Name>(opts = {}) {
  // ...
  return { group, setOpen(t) };   // t: 0 = fully closed, 1 = fully open
}
\`\`\`

- \`group\` is a \`THREE.Group\` containing the whole assembly.
- \`setOpen(t)\` is called with any \`t\` in 0..1 and must move the mechanism
  smoothly and monotonically. It is sampled 61 times to bake an animation clip,
  so it must be a pure function of \`t\` — no internal "current state", no
  tweening, no timers, no \`requestAnimationFrame\`.
- Anything that moves must be its own \`THREE.Group\` with a stable \`name\`, and
  \`setOpen\` moves the GROUP, not the mesh inside it. A mesh whose geometry is
  rebuilt per frame cannot be baked.

**2. \`<id>.json\`** — a spec sidecar in this vocabulary (use only the keys that
apply): \`id\`, \`motion\`, \`units\`, \`size_mm\`, \`panel_count\`, \`max_angle_deg\`,
\`open_ratio\`, \`handing\`, \`hardware\`, \`meshes\`, \`clip\`, \`note\`.

## Hard conventions — an asset that breaks these does not drop in

- **Units are real metres.** A 900 mm wide sash is \`0.9\`. Never centimetres.
- **Y up. +Z is the interior**, the side the viewer's camera sits on. Anything
  that opens outward rotates or translates toward **−Z**. FourlinQ's standing
  instruction is that everything opens *out*, never inward — apply it to sashes,
  door leaves and gates alike.
- **Origin at the centre of the opening**, so the assembly is roughly symmetric
  about x=0 and y=0. Do not model a floor, a wall, a room, a ground plane, a
  human figure, or a backdrop. The assembly only.
- **Every mesh gets a \`name\`.** Use lowercase_with_underscores, and number
  repeated parts (\`fin_01\`, \`fin_02\`). Names are how the animation is bound.
- **Real profile detail, not boxes.** Frames and sashes are mitred rectangular
  rings extruded in Z — build them with \`THREE.Shape\` + a rectangular hole +
  \`ExtrudeGeometry\`, ~62 mm face width and ~70 mm depth for uPVC. Add glazing
  beads and a gasket line. This is what makes it read as a fenestration product
  rather than a cardboard cutout.
- **Low poly count.** \`curveSegments: 1\` on straight extrusions. The whole
  assembly should land under ~400 kB when exported to GLB.

## Materials — use these exact names or the finish picker cannot reach the part

Create them once in a \`makeMaterials()\` helper and share the instances.

| \`material.name\` | What it is | Use for |
|---|---|---|
| \`upvc_white_matte\` | white uPVC, roughness 0.62 | outer frame, sash faces, any finish-bearing profile |
| \`upvc_white_rebate\` | slightly darker uPVC, roughness 0.7 | rebates, inner faces, glazing beads, muntin bars |
| \`alu_clad_graphite\` | dark anodised aluminium | aluminium cladding or capping, where the product has it |
| \`glass_clear\` | transparent, opacity 0.28, DoubleSide | glazing, glass blades, glass panels |
| \`epdm_gasket_black\` | matte black rubber | gaskets and weather seals |
| \`hardware_matte_black\` | dark metal, some metalness | handles, cranks, latches, actuator bodies |
| \`hinge_steel\` | light steel, metalness 0.35 | hinges, spigots, patch fittings, rollers, arms |

**The first three are the only ones that recolour with the finish.** If a part
is finish-bearing — a frame, a rail, a cap — it must be \`upvc_white_matte\`,
\`upvc_white_rebate\` or \`alu_clad_graphite\`. Putting a frame part on
\`hardware_matte_black\` means it stays black while the customer changes the
colour around it. That bug has shipped here before; do not reintroduce it.

## Acceptance

The asset is accepted when, sampling \`setOpen(0)\` against \`setOpen(1)\`:

- something **translates ≥ 40 mm** or **rotates ≥ 8°** — whichever the mechanism
  is. Real travel should exceed this by a wide margin;
- the closed pose is genuinely closed — leaves in plane, no gaps, and **nothing
  interpenetrating anything else**;
- no part passes through the frame or through another leaf at any \`t\`, not just
  at the endpoints;
- every moving node is named and is a group.

If the honest answer is that the product does not move — a fixed balustrade, a
static assembly — then return \`setOpen\` as a no-op and say so. Do not invent a
wobble to satisfy the threshold. A static asset that admits it is static is
correct; a fake mechanism is not.
`.trim();

const ASSET = [
  {
    slug: "glass-railing",
    subject: "frameless glass balustrade",
    name: "Glass Railing",
    fn: "buildGlassRailing",
    file: "railing-model.js",
    brief: `
## The product

A frameless structural glass balustrade, as installed on a balcony or terrace.

**Geometry.** A 3000 mm run at 1100 mm above finished floor. Three 12 mm
toughened laminated glass panels with 15 mm shadow gaps between them, seated in
a continuous floor-mounted aluminium base channel with a cover trim. A round
50 mm brushed stainless top handrail spans all three panels. Two spigot fixings
visible per panel.

**Motion — read this carefully.** The balustrade itself does not move, and the
asset must not pretend it does. The only honest moving part is an optional
**gate leaf**: one panel hung on two patch fittings at its stile, rotating about
that stile's vertical (Y) axis, 0 → 90° **outward**, over the full \`t\` range.

With \`gate: false\` the builder returns a \`setOpen\` that does nothing, and that
is the correct, accepted outcome.

## opts

\`{ run: 3.0, height: 1.1, panel: 3, glassThickness: 0.012, gap: 0.015,
   handrail: true, gate: false, gateIndex: 0, materials }\`

\`run\` is metres and \`panel\` is the count across it — derive panel widths from
those two, do not hard-code three widths. \`handrail: false\` gives the
no-cap variant.

## Materials for this asset

Base channel and cover trim → \`upvc_white_matte\`. The handrail →
\`upvc_white_rebate\`, so the rail and the channel read apart under a dark finish.
Glass panels → \`glass_clear\`. Spigots, patch fittings and gate hinges →
\`hinge_steel\`. A gate latch or pull → \`hardware_matte_black\`.

Do not put the handrail on \`hardware_matte_black\` — it is a finish-bearing part.
`.trim(),
  },
  {
    slug: "sliding-casement-door",
    subject: "sliding casement door",
    name: "Sliding Casement Door",
    fn: "buildSlidingCasementDoor",
    file: "sliding-casement-door-model.js",
    brief: `
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

**Motion.** \`motion: "translate_x"\`. The operable leaf translates along +X (or
−X, your choice — state it in the spec) by ~820 mm, clearing most of the fixed
lite. Straight linear travel, no lift, no tilt. Two visible rollers per leaf
bottom.

## opts

\`{ width: 1.8, height: 2.4, openRatio: 0.9, handing: "RH", materials }\`

## Materials for this asset

Frame, leaf stiles and rails, and the fixed lite's surround → \`upvc_white_matte\`,
with rebates and glazing beads on \`upvc_white_rebate\`. Glazing → \`glass_clear\`.
Head and floor tracks → \`hinge_steel\`. Handle and lock → \`hardware_matte_black\`.
Weather seal between leaf and jamb → \`epdm_gasket_black\`.
`.trim(),
  },
  {
    slug: "automated-window",
    subject: "chain-actuated automatic awning window",
    name: "Automated Windows",
    fn: "buildAutomatedWindow",
    file: "automated-window-model.js",
    brief: `
## The product

An awning window driven by a visible electric chain actuator, rather than by a
hand crank. The window itself is ordinary; **the actuator is the product**, so
it must be clearly readable and not a token box.

**Geometry.** Opening 1200 × 700 mm, top-hung awning sash. The actuator is a
slim extruded housing about 300 × 40 × 40 mm, mounted centred on the interior
face of the **sill**, with a chain that pays out from it up to a bracket on the
bottom rail of the sash. Sill, not head: a chain actuator for a top-hung awning
sits at the bottom and pushes the sash outward. Model the chain as a run of small
linked segments, not a single stretched box: the chain extending is the whole
visual point of an automated window.

**Motion.** \`motion: "hinge_outswing_top_hung"\` with a driven chain. The sash
rotates about the horizontal axis of its **top** rail, 0 → 35°, swinging the
bottom edge **outward** toward −Z. The chain lengthens as the sash opens and the
individual links must follow the line between the actuator and the sash bracket
at every \`t\` — a chain that stays rigid while the sash moves reads as broken.

35° is deliberate: a chain actuator does not open a sash to 70° the way a crank
does, and overstating the opening would misrepresent the product.

## opts

\`{ width: 1.2, height: 0.7, maxAngleDeg: 35, chainLink: 18, materials }\`

## Materials for this asset

Frame and sash → \`upvc_white_matte\`, rebates and beads → \`upvc_white_rebate\`.
Glazing → \`glass_clear\`. Actuator housing → \`hardware_matte_black\`. Chain links
and the sash bracket → \`hinge_steel\`. Perimeter seal → \`epdm_gasket_black\`.
`.trim(),
  },
  {
    slug: "automated-door",
    subject: "automatic sliding entrance door",
    name: "Automated Door Access",
    fn: "buildAutomatedDoor",
    file: "automated-door-model.js",
    brief: `
## The product

An automatic sliding entrance — the sensor-driven bi-parting door you walk
through at a lobby entrance.

**Geometry.** A 2400 mm wide × 2400 mm high opening. Two sliding leaves meeting
at the centre, each ~700 mm wide, with a fixed sidelite of the same width at
each end. A **header box** spans the full width above the opening, 2400 × 180 ×
150 mm — this houses the operator and is the thing that says "automatic". Mount
a small sensor housing on the interior face of the header at each end. Slim
floor guide track. Full-height glass in every leaf and sidelite, with narrow
stiles and a bottom rail.

**Motion.** \`motion: "bipart_translate_x"\`. The two leaves translate apart
symmetrically, each by ~680 mm, sliding behind their respective sidelite. Linear,
simultaneous, no lift. The header, sidelites and tracks never move.

## opts

\`{ width: 2.4, height: 2.4, openRatio: 0.97, sidelite: true, materials }\`

## Materials for this asset

Header box, leaf stiles and rails, sidelite frames → \`upvc_white_matte\`, with
rebates on \`upvc_white_rebate\`. If you clad the header, use
\`alu_clad_graphite\` — it recolours, and a header is finish-bearing. Glazing →
\`glass_clear\`. Track, rollers and floor guide → \`hinge_steel\`. Sensor housings →
\`hardware_matte_black\`. Seals → \`epdm_gasket_black\`.

Note there is no handle: an automatic door has no manual operating hardware on
the leaf, and adding one would misdescribe the product.
`.trim(),
  },
  {
    slug: "slim-door",
    subject: "minimal-sightline aluminium sliding door",
    name: "Slim doors",
    fn: "buildSlimDoor",
    file: "slim-door-model.js",
    brief: `
## The product

A minimal-sightline sliding door — the "slim" system, where the point is how
little frame you see. Whatever else this asset gets right, **the sightlines must
be visibly narrower than an ordinary patio slider**, because that is the entire
product claim.

**Geometry.** Opening 3000 × 2600 mm, two leaves. Interlocking stiles at the
meeting point no more than **25 mm** wide face-on, against the ~100 mm you would
model for a standard slider. Perimeter frame face ~40 mm. Aluminium, not uPVC —
this system is aluminium precisely because the sections can be that slim. Glass
is a 24 mm double-glazed unit, so model a visible spacer at the edge. A recessed
floor track, near flush with the finished floor.

**Motion.** \`motion: "translate_x"\`. One leaf translates by ~1400 mm on the
interior track, passing behind the fixed leaf on the exterior track, with about
60 mm between the two planes.

## opts

\`{ width: 3.0, height: 2.6, panel: 2, openRatio: 0.95, sightline: 0.025,
   materials }\`

Expose \`sightline\` as an option, since it is the defining number of the system
and a client will want to see it at different values.

## Materials for this asset

Frame and leaf sections → \`alu_clad_graphite\`, which is the finish-bearing
aluminium slot — **not** \`hardware_matte_black\`, which never recolours. Interior
rebates → \`upvc_white_rebate\`. Glazing → \`glass_clear\`. IGU spacer, track and
rollers → \`hinge_steel\`. Flush pull handle → \`hardware_matte_black\`. Seals →
\`epdm_gasket_black\`.
`.trim(),
  },
];

await mkdir(OUT, { recursive: true });

for (const a of ASSET) {
  const doc = `# Claude Design prompt — ${a.name}

> Paste everything below the line into Claude Design as one prompt. It is
> self-contained: it does not assume access to the FourlinQ repo.

---

Build a procedural three.js model of ${/^[aeiou]/i.test(a.subject) ? "an" : "a"} **${a.subject}** for FourlinQ, a
uPVC and aluminium windows-and-doors fabricator in the Philippines.

Deliver it as \`${a.file}\`, exporting \`${a.fn}(opts)\`.

${a.brief}

${CONTRACT}
`;
  await writeFile(resolve(OUT, `${a.slug}.md`), doc, "utf8");
}

const index = `# Claude Design prompts

One file per asset. Paste the whole file — each restates the full contract, so
none of them depends on the others or on repo access.

${ASSET.map((a) => `- [${a.name}](./${a.slug}.md) → \`${a.file}\``).join("\n")}

**Louvre is not here — it is already built** (\`scripts/handoff/model/louvre-model.js\`,
live in the viewer). **Tilt & turn is not here either**, and deliberately: it is an
unconfirmed product whose glossary entry says it opens inward, which contradicts
the client's "everything opens out, never inward". Settle that before commissioning it.

When a builder comes back, drop it in \`scripts/handoff/model/\`, add a registry
entry in \`scripts/handoff/export-glb.mjs\`, then run \`npm run handoff:export\`,
\`npm run handoff:verify\` and \`npm run probe:glb\` — the last one prints the
\`center\` / \`scale\` / \`openTime\` numbers to paste into \`window-system.ts\`. Never
hand-type those.
`;
await writeFile(resolve(OUT, "README.md"), index, "utf8");

console.log(`wrote ${ASSET.length} Claude Design prompts + README to docs/prompt/claude-design/`);
for (const a of ASSET) console.log(`  ${a.slug}`);

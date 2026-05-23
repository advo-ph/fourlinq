# AI Photo Generation Runbook

How to generate consistent product + project photography for the FourlinQ site using AI image tools (Midjourney v6.1+, FLUX.1 dev/pro, DALL-E 3).

**The principle (already established in [HERO_VIDEO_RUNBOOK.md](./HERO_VIDEO_RUNBOOK.md)):** we generate photography *of products we sell* — not fabricated FourlinQ projects that don't exist. The line: every prompt below describes a window or door system we actually make, shot in a generic Philippine residential context. We are not inventing client names, addresses, or actual installs.

---

## 1. The house style — one shoot, one mood

Append this style anchor to **every** prompt below. This is what keeps the photography from looking like a Pinterest dump of unrelated images.

### Style anchor (paste at end of every prompt)

```
editorial architectural photography, modern Philippine residential interior,
soft natural daylight from large windows, neutral palette of warm whites + soft
greys + pale oak, real materials: glass + matte white uPVC frames + polished
concrete or limewashed walls, tropical foliage visible through the window
(banana leaves, fiddle-leaf fig, monstera, frangipani), late afternoon golden
hour, shot on Hasselblad 80mm at f/5.6, ISO 100, sharp focus on the window
system, subtle shallow depth of field beyond the frame, no human figures, no
logos, no visible brand names, no graphic text, no fake building details,
Marvin Windows advertisement aesthetic, Architectural Digest tier, 8K, ultra
detailed, photorealistic, --ar 4:5 --style raw --v 6.1
```

### Negative prompt (paste under every prompt)

```
--no people, faces, signage, text, logos, hands, decals, graffiti, glare burn,
lens flare, blur, oversaturated colors, motion, vehicles, screens, TVs,
mirrors with reflections, cluttered shelves, plastic-looking finishes,
HDR-overcooked sky, neon, watermark, signature
```

### Universal rules (encode mentally — they shape every prompt)

| Rule | Why |
|---|---|
| Always shoot the window/door system **closed at rest** unless the variant explicitly says "open" | Catalog convention — we sell the closed pose; open is the demo |
| Always include **tropical foliage visible through the glass** | Anchors the photo to PH context, not generic Western interior |
| Always use **matte white uPVC frames** as default (unless the variant calls for wood-grain or dark) | Matches our brochure default finish |
| Always show the **floor / ceiling junction** to anchor scale | Helps architects judge proportion |
| Never include people, never include hardware brand decals | Lift the focus to the system itself |
| Aspect ratio: **4:5 portrait** for product card tiles; **16:9 landscape** for project context shots | Matches our existing tile + hero grids |

---

## 2. The variability matrix

For each system, generate **4 variants** following this matrix. This gives the cursor-switcher 4 distinct photos per system without inventing 4 fake projects.

| Variant | Framing | Room context | Lighting direction | Composition |
|---|---|---|---|---|
| **A — Product hero** | Window/door fills 75% of frame, slight 3/4 angle | Neutral wall, minimal furniture | Side-lit from the system's exterior side | Centered, clean, brochure-grade |
| **B — Living context** | Window/door at 50% of frame | Modern living room: low pale-oak bench, single armchair, ceramic vase, tropical foliage in pot | Through-window backlight (golden hour) | Off-center, lifestyle |
| **C — Bedroom context** | Window/door at 40% of frame | Modern bedroom: low platform bed glimpsed, linen drapery half-pulled, soft morning light | Through-window backlight (morning) | Asymmetric, intimate |
| **D — Detail** | Tight crop on hardware / corner / mullion | Just the system + immediate wall | Raking light at 45° | Macro-feeling, architectural-section vibe |

A + B + C + D = one product's full gallery. Each batch produces 8 generations per variant, keep the best 1.

---

## 3. Per-system prompt sheets

Each prompt has:
- **Target file** — where to save it
- **Prompt body** — paste into MJ/FLUX/DALL-E
- **Style anchor + negative prompt** appended automatically

### 3.1 Window Systems — `/products/windows`

#### 3.1.1 Casement Window

> **Target files:**
> - `/public/images/products/casement-A.jpg` (Variant A — Product hero)
> - `/public/images/products/casement-B.jpg` (B — Living)
> - `/public/images/products/casement-C.jpg` (C — Bedroom)
> - `/public/images/products/casement-D.jpg` (D — Detail)

**Variant A prompt:**
```
A single-leaf casement window in matte white uPVC, hinged on the left side,
closed at rest, mounted into a clean modern interior wall, large square glass
pane with subtle slim profile mullion, casement handle visible on the right
side, window fills three-quarters of the frame at a slight 3/4 angle from the
viewer's right, neutral wall and pale oak floor, single fiddle-leaf fig in a
matte ceramic pot to the right of frame, soft side-lit from the exterior side
showing daylight glow on the glass
```

**Variant B prompt:**
```
A casement window in matte white uPVC in a modern Philippine living room,
window centered on a side wall and at 50 percent of the frame, low pale-oak
bench beneath the window, single linen-upholstered armchair to the right with a
small side table holding a ceramic vase of dried palm fronds, polished concrete
floor, late afternoon golden hour streaming through the glass backlighting the
room, tropical garden visible outside with banana leaves and monstera, off-
center editorial composition
```

**Variant C prompt:**
```
A casement window in matte white uPVC at the head of a modern Philippine
bedroom, view from the foot of the room with a low platform bed glimpsed in
the foreground, gauzy linen drapery half-pulled aside, soft morning light
through the open glass, frangipani branches visible outside, intimate
asymmetric composition, muted oatmeal palette
```

**Variant D prompt:**
```
Tight architectural detail crop of a casement window in matte white uPVC,
showing the corner where horizontal and vertical mullion meet, the hinge
mechanism, and the matte handle, raking light at 45 degrees emphasizing the
profile depth, pale concrete wall in soft focus behind, macro section drawing
in photographic form
```

---

#### 3.1.2 Sliding Window

> **Target files:**
> - `/public/images/products/sliding-A.jpg` through `-D.jpg`

**Variant A — Product hero:**
```
A two-panel horizontal sliding window in matte white uPVC, left panel closed,
right panel open by one-third revealing a slim slider track, mounted into a
clean modern interior wall, slim profile mullion between panels, window fills
three-quarters of the frame at a slight 3/4 angle, neutral wall and pale oak
floor, low ceramic planter with a fern to the right of frame, soft side-lit
daylight glow
```

**Variant B — Living context:**
```
A wide three-panel sliding window above a low built-in pale-oak bench seat in
a modern Philippine living room, window spans the wall and is at 60 percent of
the frame, low coffee table with a single open book and a ceramic vase of
eucalyptus, polished concrete floor, golden hour light streaming through,
tropical garden with banana leaves outside, editorial off-center composition
```

**Variant C — Bedroom context:**
```
A two-panel sliding window in matte white uPVC above a desk in a modern
Philippine home office bedroom, the right panel slightly open, sheer linen
curtains pulled to one side, soft morning light through the open panel,
monstera visible outside, muted oatmeal palette
```

**Variant D — Detail:**
```
Tight architectural detail crop of a sliding window in matte white uPVC, showing
the bottom track, the meeting stile where two panels overlap, and the matte
handle, raking light at 45 degrees emphasizing the recessed track, pale concrete
sill in soft focus
```

---

#### 3.1.3 Awning Window

> **Target files:**
> - `/public/images/products/awning-A.jpg` through `-D.jpg`

**Variant A — Product hero:**
```
A single-leaf awning window in matte white uPVC, hinged at the top, opened
outward at a 30-degree angle, mounted high in a bathroom wall above a
freestanding tub, slim profile, the open pane catches a soft side daylight,
the lower wall is matte white plaster, view of frangipani leaves outside the
glass, brochure-grade product photography
```

**Variant B — Kitchen context:**
```
An awning window in matte white uPVC above a kitchen counter in a modern
Philippine home, the window is opened outward letting in a morning breeze,
pale-oak butcher block counter beneath, single ceramic teapot and a wooden
bowl of citrus, golden hour light, tropical garden visible through the window,
editorial composition
```

**Variant C — Stairwell context:**
```
A horizontal band of three awning windows in matte white uPVC mounted high on
a stairwell wall in a modern Philippine home, all three opened slightly to
ventilate, soft daylight from outside, polished concrete stair treads in the
foreground, intimate vertical composition emphasizing the climbing light
```

**Variant D — Detail:**
```
Tight architectural detail crop of an awning window in matte white uPVC, showing
the top hinge mechanism, the slim profile, and the matte stay arm that holds
the window open, raking light emphasizing the profile, pale concrete wall in
soft focus
```

---

#### 3.1.4 Special Shapes (Arch + custom geometry)

> **Target files:**
> - `/public/images/products/special-shapes-A.jpg` through `-D.jpg`

**Variant A — Curved feature wall:**
```
A curved-glass arched window in matte white uPVC mounted as a feature wall in
a modern Philippine entry foyer, the window arc spans full height, slim profile
follows the curve cleanly, polished concrete floor, single fiddle-leaf fig to
the left, golden hour light pouring through, architectural editorial composition
```

**Variant B — Triangular gable:**
```
A triangular gable window in matte white uPVC at the apex of a high vaulted
living room ceiling, the window fits the architectural triangle perfectly,
view of tropical foliage outside, daylight pouring down into a double-height
modern Philippine living room with pale-oak floors
```

**Variant C — Circle feature:**
```
A perfectly round porthole-style window in matte white uPVC mounted in a modern
Philippine corridor wall, ten meters of corridor visible with pale-oak floor
extending toward the camera, golden hour light from the circle window cast a
disc of warm light on the floor, intimate architectural composition
```

**Variant D — Detail:**
```
Tight architectural detail crop where two custom-shape window panels meet at a
diagonal mullion, matte white uPVC profile following the geometry cleanly,
raking light emphasizing the precision of the mitre, pale concrete wall in
soft focus
```

---

### 3.2 Door Systems — `/products/doors`

#### 3.2.1 Sliding Door

> **Target files:** `/public/images/products/sliding-door-A.jpg` through `-D.jpg`

**Variant A — Product hero:**
```
A three-panel horizontal sliding glass door in matte white uPVC, full-height
floor-to-ceiling, left panel closed, middle panel half-open, right panel
closed, slim profile mullions, mounted as an interior wall between a living
room and a lanai, polished concrete floor, soft side daylight, view of tropical
foliage through the glass
```

**Variant B — Lanai context:**
```
A wide three-panel sliding door in matte white uPVC opening from a modern
Philippine living room to a lanai with banana leaves and a low rattan lounge
chair, the middle panel is fully open, golden hour light streaming in, low
pale-oak coffee table in the foreground with a single ceramic vase, polished
concrete floor extending through the threshold
```

**Variant C — Bedroom-to-balcony:**
```
A two-panel sliding door in matte white uPVC from a modern Philippine bedroom
to a small balcony, viewed from inside the bedroom, the right panel open,
sheer linen drapery falling gently in a breeze, morning light, low platform
bed glimpsed at the bottom of frame
```

**Variant D — Detail:**
```
Tight architectural detail crop of a sliding door track in matte white uPVC,
showing the bottom rail, the meeting stile, the slim profile, and the recessed
handle, raking light emphasizing the precision of the rail, pale concrete in
soft focus
```

---

#### 3.2.2 Slide & Fold

> **Target files:** `/public/images/products/slide-and-fold-A.jpg` through `-D.jpg`

**Variant A — Product hero, half-open:**
```
A four-panel slide-and-fold door system in matte white uPVC, full-height
floor-to-ceiling, the four panels folded accordion-style and stacked to the
left side at 50 percent open, slim profile mullions, hinges visible between
panels, mounted as the threshold between a modern Philippine living room and a
lanai, polished concrete floor extends through, soft golden hour light
```

**Variant B — Fully open lanai context:**
```
A six-panel slide-and-fold door fully retracted to one side, the entire living
room wall now open to the lanai, banana leaves and frangipani visible across
the lanai, low rattan lounge chair on the lanai with a single open book, pale-
oak floor inside meeting polished concrete outside, golden hour wide editorial
composition
```

**Variant C — Closed at rest, monsoon context:**
```
A six-panel slide-and-fold door fully closed at rest as seen from inside a
modern Philippine living room during light afternoon rain, the slim white uPVC
mullions and glass clearly visible, water droplets on the exterior glass, warm
interior with a single soft floor lamp, contrast between the dry interior and
the wet garden outside
```

**Variant D — Hinge detail:**
```
Tight architectural detail crop of two panels of a slide-and-fold door, showing
the central hinge where the panels articulate, the matte white uPVC profile,
the slim glazing bead, raking light emphasizing the hinge mechanism, neutral
wall in soft focus
```

---

#### 3.2.3 Large Panel Doors (up to 6m wide)

> **Target files:** `/public/images/products/large-panel-A.jpg` through `-D.jpg`

**Variant A — Product hero, dramatic scale:**
```
A massive six-meter-wide single-panel glass door in matte white uPVC, full
floor-to-ceiling-to-six-meter-width, the panel is closed at rest, slim profile,
mounted as the entire lanai-facing wall of a modern Philippine living room
with a triple-height ceiling, polished concrete floor in the foreground for
scale, golden hour light, architectural editorial composition emphasizing the
size of the door
```

**Variant B — Open, indoor-outdoor flow:**
```
A six-meter-wide large panel door in matte white uPVC, fully slid open into a
recessed wall pocket, the entire wall now open between a modern Philippine
living room and an infinity-pool lanai with banana leaves and a single
hammock, low pale-oak coffee table inside, polished concrete floor extending
seamlessly through, late afternoon golden hour wide editorial composition
```

**Variant C — Closed, scaled to scenery:**
```
A six-meter-wide large panel door fully closed at rest in a modern Tagaytay
hillside home, viewed from inside, the panel revealing a dramatic ridge view
with rolling green hills, single pale-oak bench in the foreground, single
ceramic vase, warm afternoon light, intimate-yet-grand editorial composition
```

**Variant D — Mullion-free detail:**
```
Tight architectural detail crop of the corner of a large panel door where
ceiling, side wall, and door panel meet, showing the slim matte white uPVC
profile and the absence of a vertical mullion, polished concrete floor visible
at the bottom edge, raking light emphasizing the precision of the corner
```

---

#### 3.2.4 Lift & Slide

> **Target files:** `/public/images/products/lift-and-slide-A.jpg` through `-D.jpg`

**Variant A — Product hero:**
```
A wide three-panel lift-and-slide door in matte white uPVC, full-height floor-
to-ceiling, the middle panel slid open by 40 percent showing the lifted seal
mechanism at the bottom rail, slim profile mullions, mounted as the threshold
between a modern Philippine kitchen and a covered lanai, polished concrete
floor extending through, soft side daylight, clean editorial composition
```

**Variant B — Open lanai context:**
```
A three-panel lift-and-slide door fully open, all three panels stacked to the
right side, between a modern Philippine living room with a low pale-oak bench
seat and a lanai with banana leaves and a single rattan lounge chair, late
afternoon golden hour, polished concrete floor through the threshold, editorial
wide composition
```

**Variant C — Closed weather-tight detail:**
```
A three-panel lift-and-slide door fully closed at rest with the lift mechanism
engaged, viewed from inside a modern Philippine home, water droplets on the
exterior glass from rain, dry calm interior, contrast between weather outside
and sealed interior, single ceramic vase with eucalyptus on the windowsill
```

**Variant D — Track detail:**
```
Tight architectural detail crop of the bottom track of a lift-and-slide door,
showing the recessed seal channel, the meeting stile, the slim matte white uPVC
profile, and the recessed handle, raking light at 45 degrees emphasizing the
lift mechanism precision, pale concrete in soft focus
```

---

#### 3.2.5 90 Series Door

> **Target files:** `/public/images/products/90-series-A.jpg` through `-D.jpg`

**Variant A — Product hero (front-elevation):**
```
A single-leaf solid uPVC entry door in matte white, premium 90-series profile
(deeper and beefier than a standard door), mounted as a residential front
entry, slim profile, polished concrete entry porch, simple matte black brushed
handle, a single fiddle-leaf fig planter to the left, golden hour light from
the front, clean architectural composition
```

**Variant B — Interior context:**
```
A 90-series uPVC door in matte white mounted between a modern Philippine
hallway and a master bedroom, slim premium profile clearly visible, polished
concrete floor extending through the threshold, the door is half-open
revealing a glimpse of the bedroom beyond with morning light, intimate
asymmetric composition
```

**Variant C — Double-door pair:**
```
A pair of 90-series uPVC double doors in matte white as the threshold between
a modern Philippine living room and a private library, both panels closed at
rest, slim premium profile, polished concrete floor, single low pale-oak bench
in the foreground with a stack of three books, golden hour from the library
side, editorial composition
```

**Variant D — Profile detail:**
```
Tight architectural detail crop of the side of a 90-series uPVC door showing
the deeper premium profile depth in cross section, the seal gasket, the matte
white finish, raking light emphasizing the deeper profile vs a standard door,
pale concrete in soft focus
```

---

### 3.3 Specialist Systems — `/products/specialist`

#### 3.3.1 Arch Shapes

> **Target files:** `/public/images/products/arch-A.jpg` through `-D.jpg`

**Variant A — Product hero:**
```
A heritage-style arched window in matte white uPVC, semicircular top above a
rectangular lower section, mounted into a thick traditional Philippine
residential wall, the window arc following the architecture cleanly, polished
hardwood floor in the foreground, late afternoon golden hour light pouring
through the arch onto the floor in a curved shape, architectural editorial
composition
```

**Variant B — Heritage facade context:**
```
A row of three arched windows in matte white uPVC across the second floor of a
traditional Philippine residential facade, viewed from outside in the late
afternoon, the architecture is heritage with stone-textured walls and a clay-
tile roof, golden hour light skimming across the facade, tropical bougainvillea
climbing the wall to one side, editorial composition
```

**Variant C — Interior arched corridor:**
```
A long corridor in a modern Philippine home with five sequential arched windows
in matte white uPVC running down one wall, casting curved arches of golden
hour light onto a polished concrete floor, single pale-oak bench at the far
end, intimate one-point perspective composition
```

**Variant D — Arch corner detail:**
```
Tight architectural detail crop of the springing point where an arched window
transitions from vertical to curved, the matte white uPVC profile following the
curve precisely, slim glazing bead, raking light emphasizing the precision of
the curve, pale plaster wall in soft focus
```

---

#### 3.3.2 Curtain Wall

> **Target files:** `/public/images/products/curtain-wall-A.jpg` through `-D.jpg`

**Variant A — Product hero (dramatic full-bleed):**
```
A floor-to-ceiling double-height curtain wall system in matte white uPVC,
mullions and transoms in a clean modernist grid, mounted as the seaside wall
of a modern Philippine residential interior in Batangas, polished concrete
floor extending to the wall, view through the glass of palm trees and the
ocean horizon, late afternoon light, dramatic editorial composition
```

**Variant B — Three-storey atrium context:**
```
A three-storey curtain wall system in matte white uPVC mounted as the entry
atrium wall of a modern Philippine residence, viewed from inside the atrium
with the staircase visible to one side, golden hour light pouring through the
grid casting precise rectangles of warm light on the polished concrete floor,
editorial wide composition emphasizing scale
```

**Variant C — Tropical commercial context:**
```
A curtain wall system in matte white uPVC as the lobby facade of a modern
Philippine boutique hotel, viewed from inside the lobby looking out, tropical
palms and a swimming pool visible through the glass, soft golden hour light,
single low rattan lounge chair in the foreground, editorial composition
```

**Variant D — Mullion intersection detail:**
```
Tight architectural detail crop of a curtain wall mullion-transom intersection
in matte white uPVC, showing the precision of the cross joint, the slim profile
depth, the structural glazing edge, raking light emphasizing the cross detail,
neutral background in soft focus
```

---

#### 3.3.3 Custom Shapes

> **Target files:** `/public/images/products/custom-shapes-A.jpg` through `-D.jpg`

**Variant A — Hexagonal feature:**
```
A large hexagonal feature window in matte white uPVC mounted in a modern
Philippine residential gable wall, the six-sided window proportioned cleanly,
slim profile, mounted high above a pale-oak floor, late afternoon golden hour
light pouring through the hexagonal shape onto the floor as a perfect hexagon
of warm light, architectural editorial composition
```

**Variant B — Asymmetric trapezoid wall:**
```
A trapezoid-shaped window in matte white uPVC fitted into the angled gable wall
of a modernist Philippine home, the window following the architectural slope,
slim profile, polished concrete floor in the foreground, single fiddle-leaf
fig to one side, golden hour light, editorial composition emphasizing the
geometry
```

**Variant C — Triangular pinwheel feature:**
```
A pinwheel arrangement of four triangular custom-shape windows in matte white
uPVC meeting at a central point, mounted as a feature wall in a modern
Philippine entry foyer, golden hour light pouring through casting a star-shape
of warm light on the polished concrete floor, architectural editorial wide
composition
```

**Variant D — Custom geometry detail:**
```
Tight architectural detail crop of where two custom-shape window panels meet
at an unusual angle (acute angle, not 90 degrees), matte white uPVC profile
following the geometry precisely, slim glazing bead, raking light emphasizing
the precision of the mitre, neutral wall in soft focus
```

---

## 4. Project / lifestyle photography

Beyond the 60 product variants above (12 systems × 4 variants + 12 utility shots), commission **6 project hero photos** — one per existing project in `src/data/projects.ts`.

Project photos are wider (16:9), more lifestyle-led, and the system is one of several visible elements.

### 4.1 Quezon City residence

> **Target file:** `/public/images/projects/quezon-city-hero.jpg` (replaces `/public/images/wp-export/FourlinQ-Project-7.jpg`)
>
> **Variants needed:** 3 (hero, interior, exterior)

**Hero prompt:**
```
A modern three-storey white Philippine residence at golden hour, viewed from
the garden, the facade has multiple FourlinQ matte white uPVC casement windows
across all three floors and a wide sliding door at ground level opening to the
lanai, tropical landscaping in the foreground with banana leaves and a single
mature fiddle-leaf fig, polished concrete entry path, late afternoon warm
light, residential architecture editorial photography, --ar 16:9 --style raw
--v 6.1
```

(Apply universal style anchor + negative prompt.)

**Interior prompt:**
```
The double-height living room interior of a modern Philippine three-storey
residence, view from the second-floor landing looking down into the living
room, full-height casement and sliding windows along the lanai wall in matte
white uPVC, polished concrete floor, a single pale-oak coffee table with a
ceramic vase of dried palm fronds, low linen sofa, banana leaves visible
through the glass, golden hour, editorial composition --ar 16:9
```

**Exterior detail prompt:**
```
A close architectural detail of the second-floor casement windows of a modern
Philippine white residence, three windows in a row, all matte white uPVC, slim
profile, late afternoon golden hour skimming across the facade, tropical
bougainvillea climbing one side, editorial detail composition --ar 16:9
```

### 4.2 Tagaytay residence

> **Target file:** `/public/images/projects/tagaytay-hero.jpg` (replaces `/public/images/wp-export/FourlinQ-Project-8.jpg`)
>
> **Variants needed:** 3

**Hero prompt:**
```
A modern Tagaytay hillside residence at golden hour, viewed from the ridge,
the architecture features a dramatic curved-glass feature wall with custom
shaped uPVC panels in matte white, panoramic view over rolling Tagaytay hills
in the background, the home perched on the edge of the slope, tropical
landscaping, residential architecture editorial photography, --ar 16:9
```

**Interior with curved-glass prompt:**
```
The living room interior of a modern Tagaytay hillside home, the seaward wall
is a dramatic curved-glass feature in matte white uPVC following the
architectural curve, view across the rolling Tagaytay hills, polished concrete
floor, low pale-oak bench seat, single ceramic vase with eucalyptus, late
afternoon golden hour, editorial composition --ar 16:9
```

**Exterior gable prompt:**
```
The triangular gable of a modern Tagaytay home with a custom-shape uPVC window
in matte white fitting the gable geometry precisely, late afternoon light
skimming the facade, tropical foliage at the base, editorial architectural
detail --ar 16:9
```

### 4.3 Antipolo residence

> **Target file:** `/public/images/projects/antipolo-hero.jpg` (replaces `/public/images/wp-export/FQC-Project-17.jpg`)

**Hero prompt:**
```
A modern Antipolo residence interior, full-height casement and fixed-panel
windows in matte white uPVC running along the garden-facing wall of a living
room, opening onto a planted garden with banana leaves and frangipani, polished
concrete floor, low pale-oak coffee table, single fiddle-leaf fig in a matte
ceramic pot in the corner, golden hour light through the glass, editorial
residential photography, --ar 16:9
```

### 4.4 Las Piñas residence

> **Target file:** `/public/images/projects/las-pinas-hero.jpg` (replaces `/public/images/wp-export/FQC-Project-18.jpg`)

**Hero prompt:**
```
A modern Las Piñas residence living room with a wide slide-and-fold door
system in matte white uPVC fully retracted to one side, the entire living
room wall now open to a planted lanai with banana leaves and a small lap pool,
polished concrete floor extending through the threshold, low rattan lounge
chair on the lanai, golden hour light, editorial residential photography
--ar 16:9
```

### 4.5 Three-storey residence

> **Target file:** `/public/images/projects/three-storey-hero.jpg` (replaces `/public/images/brand-story.jpg`)

**Hero prompt:**
```
A modern three-storey Philippine residence viewed from the driveway at late
afternoon golden hour, the architecture features matte white uPVC casement,
sliding, and large panel doors across all three floors plus a curtain wall
at the entry, polished concrete entry path, tropical landscaping with mature
trees, residential architecture editorial photography, --ar 16:9
```

### 4.6 Makati residence

> **Target file:** `/public/images/projects/makati-hero.jpg` (replaces `/public/images/wp-export/FQC-Project-10.jpg`)

**Hero prompt:**
```
A modern Makati condominium interior detail, French double doors in matte
white uPVC between a formal entry and a private library, both doors closed,
multi-point locking visible at the meeting stile, polished hardwood floor,
warm interior lamp light from the library side, editorial residential
photography, --ar 16:9
```

---

## 5. Tool recommendation

| Tool | Pros | Cons | Best for |
|---|---|---|---|
| **Midjourney v6.1+** | Best aesthetic, best consistency with `--cref` (character reference) and `--sref` (style reference) | $30/mo, web-only | Primary tool; lock the style anchor as a `--sref` URL once you have the first successful generation |
| **FLUX.1 dev** (via fal.ai / Replicate) | Excellent realism, controllable, can run locally | Less consistent than MJ for editorial mood | Backup; particularly good for the detail shots (Variant D) |
| **DALL-E 3** (ChatGPT Plus) | Accessible inside ChatGPT, easy iteration | Lower fidelity than MJ/FLUX for architectural detail | If you need to iterate quickly during a Tita call |
| **Magnific AI** (upscaler) | Restores 4K detail in already-decent generations | $39/mo, no generation, only upscale | Always run final shortlist through this before commit |

### Workflow

1. **Generate 4-8 candidates per variant** in Midjourney. Use the prompt block + style anchor + negative prompt verbatim.
2. **Pick 1 winner.** Upscale to 4K via MJ's built-in upscaler or via Magnific.
3. **Quality-control checklist** (see §6).
4. **Save to** `/public/images/products/<system>-<variant>.jpg` at **1600×2000 (4:5 product)** or **1920×1080 (16:9 project)**.
5. **Update the file references** in `src/data/products.ts` and `src/data/projects.ts` to point at the new paths.
6. **Commit + push.** I'll wire the swap if you tell me which file paths to use; just paste the manifest.

---

## 6. Quality control checklist

Before you commit a generated image to the repo, run through this. Reject any image that fails even one rule.

- [ ] **No people, no faces, no hands** visible
- [ ] **No logos, no text, no brand decals** (especially no fake "FourlinQ" lettering on windows)
- [ ] **Frame finish matches the brochure default** — matte white uPVC unless the variant specifically called for wood-grain or dark
- [ ] **Glass is glass** — not opaque, not mirrored, no fake reflection of unreal architecture
- [ ] **Light direction is consistent** within a variant set (4 variants of the same product should look like one shoot)
- [ ] **Tropical foliage is visible** through the glass — banana leaves, fiddle-leaf, monstera, frangipani (not pine trees, not maples, not Western foliage)
- [ ] **Floor material is appropriate** — pale oak, polished concrete, or matte ceramic tile (no shag carpet, no tile patterns)
- [ ] **Proportion makes architectural sense** — door heads at 2.1-2.4m, window heads at 2.0-2.4m, mullion widths slim (not chunky aluminum-look)
- [ ] **No physics violations** — frames where they should be load-bearing, no floating glass, no impossible cantilevers
- [ ] **No AI giveaways** — extra fingers (n/a here since no people), warped reflections, garbled text on imagined wall art

---

## 7. Filename + path manifest

When you've finished generating, save files to these exact paths. The code already references them or can be flipped to in a single small commit.

### Product card tiles (Variant A — Product hero)

| System | Path |
|---|---|
| Casement Window | `/public/images/products/casement-A.jpg` |
| Sliding Window | `/public/images/products/sliding-A.jpg` |
| Awning Window | `/public/images/products/awning-A.jpg` |
| Special Shapes | `/public/images/products/special-shapes-A.jpg` |
| Sliding Door | `/public/images/products/sliding-door-A.jpg` |
| Slide & Fold | `/public/images/products/slide-and-fold-A.jpg` |
| Large Panel Doors | `/public/images/products/large-panel-A.jpg` |
| Lift & Slide | `/public/images/products/lift-and-slide-A.jpg` |
| 90 Series | `/public/images/products/90-series-A.jpg` |
| Casement Door | (we have a real one; skip generation) |
| French Door | (we have a real one; skip generation) |
| Arch Shapes | `/public/images/products/arch-A.jpg` |
| Curtain Wall | `/public/images/products/curtain-wall-A.jpg` |
| Custom Shapes | `/public/images/products/custom-shapes-A.jpg` |

### Project cursor-switcher (Variants B, C, D per system)

Used in `src/pages/{WindowSystems,DoorSystems,SpecialistSystems}.tsx` `projectPhotos` arrays. After generation, give me the manifest and I'll do the swap.

### Project hero photos

| Project ID | Path |
|---|---|
| quezon-city-residence | `/public/images/projects/quezon-city-hero.jpg` (+ `-interior.jpg`, `-exterior.jpg`) |
| tagaytay-residence | `/public/images/projects/tagaytay-hero.jpg` (+ `-interior.jpg`, `-gable.jpg`) |
| antipolo-residence | `/public/images/projects/antipolo-hero.jpg` |
| las-pinas-residence | `/public/images/projects/las-pinas-hero.jpg` |
| three-storey-residence | `/public/images/projects/three-storey-hero.jpg` |
| makati-residence | `/public/images/projects/makati-hero.jpg` |

---

## 8. Priority order — what to generate first

If you only have time for some, do them in this order:

1. **`/public/images/products/lift-and-slide-A.jpg` and `90-series-A.jpg`** — these are the duplicate-image victims on `/products/doors`. Fix this first; it's the most damaging visible bug.
2. **`/public/images/products/large-panel-A.jpg`** — currently uses a project context shot, not a clean product image.
3. **Project hero variants for Quezon City, Tagaytay, Antipolo, Las Piñas** — these break the recycle problem across home + Inspiration + project detail pages.
4. **The remaining product Variant A shots** for windows + specialist — replaces the existing wp-export catalog images with consistent editorial photography.
5. **Variants B/C/D for the cursor-switcher** — these populate the project gallery rails on `/products/{windows,doors,specialist}`.

---

## 9. License + attribution

Generated images are **commercially licensed** to FourlinQ via Midjourney/FLUX/DALL-E commercial-use terms. **Document the source tool + date** in the commit message so future audits can trace provenance. Add to `docs/LICENSES.md` after first batch ships.

---

## 10. Finish texture extraction — for the 3D viewer + Design Tool

The 3D casement-frame viewer on home and the Design Tool's WindowPreview SVG both currently render finishes as **flat hex colors + a synthetic stripe overlay**. Real photographic textures of the actual FourlinQ finish samples will read 10× more premium — and Tita has the physical sample board.

There are **two valid paths**. Pick one per finish.

### 10A — Path 1: extract from physical sample-board photograph (preferred)

Cleanest, most honest, no AI required.

**Required input:** one well-lit straight-on photo of the FourlinQ finish sample board (the one Tita showed in the May 24 message — 11 swatches in a row with labels). Save the source photo at:

```
/public/textures/source/swatchboard.jpg
```

**Steps:**

1. **Re-shoot if needed.** The reference photo Tita supplied is shot at a slight angle with mixed lighting. For texture extraction we want **perfectly straight-on, even daylight, no shadow gradient across the board.** If you can re-shoot on an overcast morning at noon — better. If not, the existing photo is workable but the wood-grain swatches may have a slight tonal gradient that telegraphs as "this was a photo, not a manufactured tile."
2. **Crop each swatch.** Each finish is roughly 110px wide × 90px tall in the source photo. Use any tool (Preview / Photoshop / Photopea / Pixlr) to extract a tight rectangle of JUST the swatch surface — no label, no shadow, no adjacent swatch bleed.
3. **Resize to 1024×1024.** Square format. JPG at quality 85 (~150 KB each).
4. **Save** to the path manifest below.

**File path manifest (one per finish):**

```
/public/textures/finishes/oak-light.jpg
/public/textures/finishes/oak-malt.jpg
/public/textures/finishes/woodgray.jpg
/public/textures/finishes/2-wood-black.jpg
/public/textures/finishes/dark-oak.jpg
/public/textures/finishes/walnut.jpg
/public/textures/finishes/golden-oak.jpg
/public/textures/finishes/white.jpg
/public/textures/finishes/jet-black.jpg
/public/textures/finishes/charcoal-gray.jpg
/public/textures/finishes/matte-quartz.jpg
```

(Filename = `FRAME_FINISHES.id` from `src/data/fourlinq-data.ts`. If "Silicia Cream" is confirmed as a 12th finish, add `silicia-cream.jpg`.)

**Optional — normal maps (only for wood-grain finishes):**

```
/public/textures/finishes/oak-light-normal.jpg
... etc
```

A normal map gives the 3D viewer the recessed/raised look of real wood grain rather than just a flat color decal. Generate from the diffuse map using:
- Photoshop > Filter > 3D > Generate Normal Map (built in)
- NormalMap-Online (free web tool — drag a diffuse JPG, get a normal map)
- Materialize (free desktop app)

Skip normal maps for solid finishes (White, Jet Black, Charcoal Gray, Matte Quartz) — they're flat surfaces in real life.

### 10B — Path 2: AI-generate per-finish texture tiles (fallback only)

Use only if Path 1's photo is unsalvageable or if you want to add finishes not on the physical sample board. AI-generated wood grain is convincing for visualization but **must be approved by Tita** before shipping since it's representing a real product finish.

#### Universal texture-tile style anchor (Gemini / Midjourney)

```
Tileable seamless texture, 1024 by 1024 pixels, perfectly square, even
diffuse daylight, no shadow gradient across the surface, photographed
straight down from above, no edges or borders visible, ready to be
used as a repeating material texture for 3D rendering, photorealistic,
8K, ultra detailed.
```

Append to every prompt below. **Aspect ratio for all tile prompts: square 1:1.** Drop the architectural-lifestyle style anchor from §1 — that's for project shots, not material tiles.

#### Per-finish tile prompts

**Oak Light** (`oak-light.jpg`):
```
Tileable seamless texture of pale Scandinavian oak veneer, fine straight grain
with subtle cream and off-white tones, sanded smooth, almost bleached,
photographed straight down, even daylight, no shadow.
```

**Oak Malt** (`oak-malt.jpg`):
```
Tileable seamless texture of medium-blonde oak veneer with warm golden-amber
tones, slightly pronounced straight grain, natural unfinished timber look,
photographed straight down, even daylight, no shadow.
```

**Woodgray** (`woodgray.jpg`):
```
Tileable seamless texture of weathered driftwood with cool gray base and
subtle brown-taupe grain lines, fine grain, slightly aged appearance,
photographed straight down, even daylight, no shadow.
```

**2 Wood Black** (`2-wood-black.jpg`):
```
Tileable seamless texture of ebonized dark wenge wood, deep espresso brown-
black with subtle perceptible wood grain visible in raking light, moody and
rich, photographed straight down, even daylight, no shadow.
```

**Dark Oak** (`dark-oak.jpg`):
```
Tileable seamless texture of classic dark Filipino narra or aged kamagong
hardwood, deep warm brown with pronounced wood grain, traditional and
grounded, photographed straight down, even daylight, no shadow.
```

**Walnut** (`walnut.jpg`):
```
Tileable seamless texture of solid American black walnut hardwood, rich
chocolate brown with strong straight grain pattern, premium feature wood,
photographed straight down, even daylight, no shadow.
```

**Golden Oak** (`golden-oak.jpg`):
```
Tileable seamless texture of warm golden oak with honey-orange tones,
pronounced wood grain, sun-drenched timber appearance, photographed straight
down, even daylight, no shadow.
```

**White** (`white.jpg`):
```
Tileable seamless texture of matte white uPVC plastic surface, perfectly
smooth with no grain or texture, subtle sheen, photographed straight down,
even diffuse daylight, no shadow.
```

**Jet Black** (`jet-black.jpg`):
```
Tileable seamless texture of matte deep black uPVC plastic surface,
perfectly smooth no grain, slight micro-texture only visible up close,
photographed straight down, even diffuse daylight, no shadow.
```

**Charcoal Gray** (`charcoal-gray.jpg`):
```
Tileable seamless texture of matte charcoal-graphite uPVC plastic surface,
deep neutral dark gray, smooth, no grain, subtle micro-texture, photographed
straight down, even diffuse daylight, no shadow.
```

**Matte Quartz** (`matte-quartz.jpg`):
```
Tileable seamless texture of matte mid-tone gray uPVC plastic surface,
architectural concrete-gray tone, perfectly smooth, no grain, photographed
straight down, even diffuse daylight, no shadow.
```

### 10C — QC checklist for textures

Before committing a texture file, run through:

- [ ] **Perfectly square** 1024×1024
- [ ] **No visible label, no swatch edge, no adjacent-swatch bleed** in the crop
- [ ] **No shadow gradient** across the tile (a tile that's lighter on one side will look like crap when tiled — visible diagonal bands)
- [ ] **Color matches the brochure swatch hex** (check `FRAME_FINISHES[i].swatchHex` in `src/data/fourlinq-data.ts` — if the texture reads obviously different, re-crop or color-correct)
- [ ] **Wood grain runs vertically** (window frames are vertical — texture should align)
- [ ] **No AI giveaways** for path-2 tiles (warped grain, impossible joint patterns, etc.)
- [ ] **File size under 200 KB** (compress JPG quality to 80-85)

### 10D — Once textures are in place

When all 11 (or 12) texture files exist at the manifest paths, tell me and I'll wire them up in one commit:

1. Add `texturePath?: string` field to `FrameFinish` in `src/data/fourlinq-data.ts`, populate for each entry.
2. `src/components/3d/Window3D.tsx` — switch the finish-swap effect from `mat.color = new Color(hex)` to `mat.map = new TextureLoader().load(texturePath)`. Add optional normalMap when present.
3. `src/components/configurator/WindowPreview.tsx` — replace `<rect fill={hex}/>` with `<rect fill="url(#finish-pattern)" />` + `<pattern>` definition referencing the texture.
4. `src/pages/Finishes.tsx` — swatch grid swaps from hex+stripe to actual texture tiles.

**The visible effect:** click "Walnut" in the home 3D viewer → the casement frame shows real walnut grain, not a flat brown rectangle. Open the Design Tool → the live preview SVG renders the same. Open `/finishes` → the swatch grid feels like a sample book, not a color picker.

This is the single highest-leverage premium-feel improvement we can ship after the photo runbook.

### 10E — Priority within Section 10

If you're working through textures one at a time, do them in this order:

1. **Walnut, Dark Oak, Oak Malt** (the 3 most-clicked wood-grains based on PH residential preference)
2. **White, Jet Black** (the 2 most-clicked solids)
3. **Golden Oak, Woodgray, 2 Wood Black** (remaining wood-grains)
4. **Charcoal Gray, Matte Quartz, Oak Light** (remaining solids + bleached oak)

The 3D viewer / Design Tool / Finishes page all fall back to the existing `swatchHex` flat color if `texturePath` is undefined — so you can ship textures one finish at a time and the rest keep working.

---

## 11. Automated batch generation — two scripts, same manifest

Manual generation in the Gemini web app works but doesn't scale: each prompt is a copy-paste + wait + right-click-save round trip. For the 11 finish textures plus the 48 product/project variants, that's 59 manual sessions.

There are **two automated paths** that share the same `scripts/image-prompts.json` manifest. Pick one:

| Path | When to use | Setup time | Speed |
|---|---|---|---|
| **§11A — API** (`scripts/generate-images.mjs`) | You can get a free API key from aistudio.google.com | 2 min | 5-15s per image |
| **§11B — Browser** (`scripts/generate-images-browser.mjs`) | You don't want an API key OR you want to use your existing Gemini web account | 5 min (Playwright install) | 30-90s per image |

The API path is faster and more reliable. The browser path uses your existing Google account session — no key needed.

---

## 11A. Automated batch generation — Gemini API

Manual generation in the Gemini web app works but doesn't scale: each prompt is a copy-paste + wait + right-click-save round trip. For the 11 finish textures plus the 48 product/project variants, that's 59 manual sessions.

Instead — one Node script that reads a manifest of `{prompt, output}` jobs and writes each generated image directly to disk via the Gemini API. Same prompts as §3/§4/§10, no DOM automation, no login state, no rate-limit theater.

### Setup (once)

1. **Get a free Gemini API key.** Visit https://aistudio.google.com/apikey — login with the same Google account you use for Gemini web, click "Create API key in new project." Copy the key.
2. **Export it.** Either:
   ```bash
   export GEMINI_API_KEY=your-key-here
   ```
   …or add to `.env.local`:
   ```
   GEMINI_API_KEY=your-key-here
   ```

### Run

From the project root:

```bash
node scripts/generate-images.mjs
```

The script:
- Reads `scripts/image-prompts.json` (default manifest — 11 finish textures + 3 priority product shots already pre-loaded)
- Generates each missing image via `gemini-2.5-flash-image-preview`
- Writes PNG bytes directly to the `output` path (relative to repo root)
- Skips any job whose output file already exists — re-runs are idempotent
- Logs status, file size, and timing per job
- Throttles politely (800ms between requests)

To re-generate a specific image:
```bash
rm public/textures/finishes/walnut.jpg
node scripts/generate-images.mjs
```

To use a different model:
```bash
GEMINI_MODEL=imagen-3.0-generate-002 node scripts/generate-images.mjs
```

To use a different manifest:
```bash
node scripts/generate-images.mjs path/to/other-manifest.json
```

### Manifest format

`scripts/image-prompts.json` is an array of jobs:

```json
[
  {
    "id": "texture-walnut",
    "output": "public/textures/finishes/walnut.jpg",
    "prompt": "Tileable seamless texture of solid American black walnut hardwood..."
  }
]
```

- `id` — for logging only
- `output` — relative path from repo root; directory will be created if missing
- `prompt` — verbatim text sent to Gemini; **paste any prompt from §3 / §4 / §10 directly**
- Optional `skip: true` — keep the job in the manifest but skip it this run

### Adding new prompts

Open `scripts/image-prompts.json`, append a new entry, run the script again. Existing files won't regenerate (idempotent), so you'll only pay for new ones.

### Cost

Gemini 2.5 Flash Image is roughly **$0.039 per generated image** (as of 2026). So:

| Batch | Cost |
|---|---|
| 11 finish textures | ~$0.43 |
| 3 priority product shots (Lift & Slide, 90 Series, Large Panel) | ~$0.12 |
| All 48 product variants (per §3 matrix) | ~$1.87 |
| All 18 project hero variants (per §4) | ~$0.70 |
| **Full site re-generation** | **~$3.50 total** |

Free tier on AI Studio includes 1500 requests/day at no charge — well above what we need.

### Quality control

Generated outputs land at the manifest path. Open each, run through the QC checklist in §6 (for product/project shots) or §10C (for textures). Reject any failures by deleting the file and re-running the script — Gemini's stochastic, second attempts usually catch up.

### Limitations

- Gemini's image output is **PNG by default**, saved with `.jpg` extension if that's what the manifest says. Browsers don't care, but a strict file inspector will flag the mismatch. If it matters, change the manifest extensions to `.png` and the path references in code accordingly.
- No `--ar 4:5` flag — the prompt has to *describe* the desired aspect ratio ("portrait orientation, 4:5 aspect ratio"). Gemini honors it most of the time; not 100%.
- No `--no` negative block — prompts use natural-language exclusion ("Without showing: people, logos, text on glass...").
- Per-image generation takes 5-15 seconds. The full 14-job default manifest runs in ~3 minutes.

### Why API is preferred over browser

If you have a choice, pick §11A over §11B:
- Deterministic JSON in/out — no DOM scraping
- 5-15s per image vs 30-90s per image (browser has UI render lag)
- No login state to maintain
- No fragile selectors that break when Google ships a Gemini redesign
- Same Gemini models (or better via Imagen 3 on Vertex)

That said — if you can't or won't get an API key, §11B is fully functional.

---

## 11B. Automated batch generation — browser (no API key)

Same `scripts/image-prompts.json` manifest, same per-job output paths. Instead of hitting the API, this script drives gemini.google.com via Playwright with a persistent browser profile that remembers your Google login.

### Setup (once)

1. **Install Playwright** (one-time, ~150 MB Chromium download):
   ```bash
   npm install -D playwright
   npx playwright install chromium
   ```

2. **First run — log in:**
   ```bash
   node scripts/generate-images-browser.mjs
   ```
   - Chromium opens to gemini.google.com
   - Log in to your Google account (the one with Gemini access)
   - Wait until you see the chat UI
   - Switch back to the terminal and press ENTER

   Session is saved to `.gemini-browser-state/` (gitignored). All future runs reuse the cookies — no re-login needed.

### Run (every time)

```bash
node scripts/generate-images-browser.mjs
```

The script:
- Opens the browser to gemini.google.com (uses saved login)
- For each manifest job: starts a new chat → types the prompt → clicks Send → waits up to 60s for the generated image to appear → extracts the blob URL via in-page fetch → decodes base64 → writes PNG to the manifest's `output` path
- Idempotent: skips jobs whose output file already exists
- Polite throttle: 2s between jobs to avoid looking like a bot

### Cost

**Zero.** Uses your existing Gemini web account. Free-tier limits apply (Gemini 1.5 Flash on the web has a daily image-generation cap — typically 50-100 images depending on your account tier).

### Fragility — read this

Google iterates gemini.google.com weekly. The DOM selectors in the script **will eventually break.** When that happens:

1. The script prints which selector failed (e.g., `prompt input not found (selectors: rich-textarea div[contenteditable="true"], textarea[aria-label*="prompt" i])`)
2. Open gemini.google.com manually
3. Inspect the prompt input via DevTools — copy the new selector
4. Update `SELECTORS` block at the top of `scripts/generate-images-browser.mjs`
5. Re-run

The four selectors that matter are at lines 47-58 of the script. Each is a comma-separated list of fallbacks — keep the old selector and prepend the new one so older Gemini builds keep working.

### Limitations

- **Headed mode required** — the browser window stays visible (Gemini's UI doesn't fully render in headless Chrome). Run on a machine you can leave alone for the duration of the batch.
- **One Gemini account per profile dir** — if you need to switch accounts, delete `.gemini-browser-state/` and re-login.
- **Image output is whatever Gemini gives you** — usually PNG. Aspect ratio is described in prompt, not flag-controlled. Sometimes Gemini ignores aspect-ratio hints; the QC checklist (§6 / §10C) catches these.
- **CAPTCHA risk** — if Google flags the activity as bot-like, you may see a "verify you're human" challenge. Solve it manually in the open browser window; the script will continue on the next prompt.
- **No bulk parallelism** — one prompt at a time. The 14-job default manifest runs in ~10-20 minutes (vs ~3 min on the API path).

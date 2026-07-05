# FourlinQ — Product image prompts (GPT-image / Imagen v2 ready)

Clean, tool-agnostic companion to [AI_PHOTO_RUNBOOK.md](./AI_PHOTO_RUNBOOK.md) §3 — same prompts, **de-Midjourney'd** (no `--ar/--v` flags) and assembled so each is copy-paste ready for GPT-image, Imagen v2, FLUX, or DALL·E.

Covers every `/products` system: **Window** (Casement · Sliding · Awning · Special Shapes), **Door** (Sliding Door · Slide & Fold · Large Panel · Lift & Slide · 90 Series), **Specialist** (Arch · Curtain Wall · Custom Shapes). Four variants each — **A = the product-card image (do first)**, B/C/D = optional gallery.

**How to use:** paste `[BODY]` + `[STYLE]` + `[NEGATIVE]` together. Save to the `Target` path. Then hand them back and the `image:` fields in `src/data/products.ts` get wired to match.

**Aspect ratio:** the live product cards render **16:9 landscape** (`aspect-video`). Generate 16:9 (or square and let object-cover crop).

**⚠️ The accuracy rule (this is what Imie rejected — "looks like a 2-panel fixed", "mali yung design"):** an *operating* system must *visibly* operate. Sliding = a panel offset open on a visible track. Folding = panels stacked accordion-style. Lift & Slide = a panel slid with the lifted seal shown. Awning = hinged open with the stay arm. Never a flat closed pane that reads as fixed. The curtain wall must read **tall AND wide** (double-height / multi-storey).

---

## [STYLE] — append to every body
```
editorial architectural photography, modern Philippine residential interior,
soft natural daylight, neutral palette of warm whites + soft greys + pale oak,
real materials: glass + matte white uPVC frames + polished concrete or
limewashed walls, tropical foliage visible through the glass (banana leaves,
fiddle-leaf fig, monstera, frangipani), late-afternoon golden hour, shot on
Hasselblad 80mm at f/5.6, ISO 100, sharp focus on the system, subtle shallow
depth of field beyond the frame, wide 16:9 landscape, photorealistic,
Architectural Digest tier, 8K, ultra detailed
```

## [NEGATIVE] — append to every body
```
no people, no faces, no hands, no signage, no text, no logos, no decals, no
watermark, no lens flare, no glare burn, no blur, no motion blur, no
oversaturation, no HDR-overcooked sky, no neon, no vehicles, no screens/TVs,
no cluttered shelves, no plastic-looking finishes
```

---

# WINDOW SYSTEMS

## Casement → `public/images/products/casement-A.jpg` (…-B/-C/-D)
- **A — Hero:** `A single-leaf casement window in matte white uPVC, hinged on the left, handle on the right, the sash cracked slightly open outward so it clearly operates (not fixed), slim profile mullion, in a clean modern interior wall, fills three-quarters of the frame at a slight 3/4 angle, neutral wall and pale-oak floor, a fiddle-leaf fig in a matte ceramic pot to the right, soft side-light glowing on the glass.`
- **B — Living:** `A casement window in matte white uPVC in a modern Philippine living room, centered on a side wall at 50% of the frame, low pale-oak bench beneath, a linen armchair and a ceramic vase of dried palm fronds, polished concrete floor, golden-hour backlight, banana leaves and monstera outside, off-center composition.`
- **C — Bedroom:** `A casement window in matte white uPVC at the head of a modern Philippine bedroom, viewed from the foot with a low platform bed in the foreground, gauzy linen drapery half-pulled, soft morning light through the open sash, frangipani outside, intimate asymmetric composition.`
- **D — Detail:** `Tight detail crop of a casement window in matte white uPVC — the mullion corner, the hinge, the matte handle — raking 45° light emphasizing profile depth, pale concrete in soft focus.`

## Sliding → `public/images/products/sliding-A.jpg` (…-B/-C/-D)  ⚠️
- **A — Hero:** `A two-panel horizontal SLIDING window in matte white uPVC shown MID-SLIDE so it cannot read as fixed: the right panel slid one-third open and offset in front of the left, riding a visible bottom track, a slim meeting stile where the panels overlap, a discreet pull handle on the moving panel, in a clean modern interior wall, three-quarters of the frame at a slight 3/4 angle, neutral wall and pale-oak floor, a fern in a low ceramic planter to the right, soft side-light.`
- **B — Living:** `A wide three-panel sliding window above a low built-in pale-oak bench in a modern Philippine living room, one panel slid open onto a garden, spanning the wall at 60% of the frame, low coffee table with a ceramic vase of eucalyptus, polished concrete floor, golden-hour light, banana leaves outside.`
- **C — Bedroom:** `A two-panel sliding window in matte white uPVC above a desk in a modern Philippine home office, the right panel clearly slid open on its track, sheer linen curtains pulled aside, soft morning light, monstera outside, muted oatmeal palette.`
- **D — Detail:** `Tight detail crop of a sliding window in matte white uPVC — the bottom track, the meeting stile, the matte handle — raking 45° light emphasizing the recessed track, pale concrete sill in soft focus.`

## Awning → `public/images/products/awning-A.jpg` (…-B/-C/-D)
- **A — Hero:** `A single-leaf awning window in matte white uPVC hinged at the top and opened outward ~30°, clearly operating, a matte stay arm holding it open, slim profile, mounted high in a bathroom wall above a freestanding tub, matte white plaster below, frangipani outside.`
- **B — Kitchen:** `An awning window in matte white uPVC above a kitchen counter in a modern Philippine home, opened outward for a breeze, pale-oak butcher-block counter beneath, a ceramic teapot and a bowl of citrus, golden-hour light, tropical garden outside.`
- **C — Stairwell:** `A horizontal band of three awning windows in matte white uPVC high on a stairwell wall, all opened slightly to ventilate, soft daylight, polished concrete stair treads in the foreground, intimate vertical composition.`
- **D — Detail:** `Tight detail crop of an awning window in matte white uPVC — the top hinge and the matte stay arm holding it open — raking light emphasizing the profile, pale concrete in soft focus.`

## Special Shapes → `public/images/products/special-shapes-A.jpg` (…-B/-C/-D)
- **A — Curved feature:** `A curved-glass arched window in matte white uPVC as a full-height feature wall in a modern Philippine entry foyer, slim profile following the arc cleanly, polished concrete floor, a fiddle-leaf fig to the left, golden-hour light pouring through.`
- **B — Triangular gable:** `A triangular gable window in matte white uPVC at the apex of a high vaulted living-room ceiling, fitting the triangle perfectly, tropical foliage outside, daylight pouring into a double-height room with pale-oak floors.`
- **C — Circle feature:** `A round porthole-style window in matte white uPVC in a modern Philippine corridor, ten meters of pale-oak corridor toward the camera, golden-hour light casting a warm disc on the floor.`
- **D — Detail:** `Tight detail crop where two custom-shape panels meet at a diagonal mullion, matte white uPVC profile following the geometry, raking light emphasizing the precise mitre.`

---

# DOOR SYSTEMS

## Sliding Door → `public/images/products/sliding-door-A.jpg` (…-B/-C/-D)  ⚠️ she flagged this one
- **A — Hero:** `A three-panel full-height floor-to-ceiling SLIDING glass door in matte white uPVC shown clearly operating: the middle panel slid half-open and offset in front of the flanking panels on a visible bottom track, slim profile mullions, mounted as the wall between a living room and a lanai, polished concrete floor, soft side daylight, tropical foliage through the glass.`
- **B — Lanai:** `A wide three-panel sliding door in matte white uPVC opening from a modern Philippine living room to a lanai with banana leaves and a low rattan lounge chair, the middle panel fully open, golden-hour light, low pale-oak coffee table with a ceramic vase, polished concrete extending through the threshold.`
- **C — Bedroom-to-balcony:** `A two-panel sliding door in matte white uPVC from a modern Philippine bedroom to a small balcony, viewed from inside, the right panel open on its track, sheer linen drapery in a breeze, morning light, a low platform bed at the bottom of frame.`
- **D — Detail:** `Tight detail crop of a sliding-door track in matte white uPVC — the bottom rail, the meeting stile, the recessed handle — raking light emphasizing the rail, pale concrete in soft focus.`

## Slide & Fold → `public/images/products/slide-and-fold-A.jpg` (…-B/-C/-D)
- **A — Hero, half-open:** `A four-panel slide-and-fold door in matte white uPVC, full-height, the panels folded accordion-style and stacked to the left at 50% open with the hinges visible between panels, slim profile mullions, as the threshold between a modern Philippine living room and a lanai, polished concrete through, golden-hour light.`
- **B — Fully open:** `A six-panel slide-and-fold door fully retracted to one side, the whole living-room wall open to a lanai with banana leaves and frangipani, a rattan lounge chair with an open book, pale-oak floor inside meeting polished concrete outside, golden-hour wide composition.`
- **C — Closed, monsoon:** `A six-panel slide-and-fold door closed at rest, seen from inside a modern Philippine living room during light rain, slim white uPVC mullions and glass, water droplets on the exterior, warm interior with a soft floor lamp.`
- **D — Hinge detail:** `Tight detail crop of two slide-and-fold panels at the central articulating hinge, matte white uPVC profile, slim glazing bead, raking light emphasizing the hinge.`

## Large Panel Doors (up to 6m) → `public/images/products/large-panel-A.jpg` (…-B/-C/-D)
- **A — Hero, scale:** `A massive six-meter-wide single-panel glass door in matte white uPVC, full floor-to-ceiling, closed at rest, slim profile, as the entire lanai-facing wall of a modern Philippine living room with a triple-height ceiling, polished concrete floor for scale, golden-hour light, composition emphasizing the size.`
- **B — Open flow:** `A six-meter-wide large panel door in matte white uPVC fully slid into a recessed wall pocket, the wall now open between a living room and an infinity-pool lanai with banana leaves and a hammock, low pale-oak coffee table inside, polished concrete extending through, golden-hour wide composition.`
- **C — Scaled to scenery:** `A six-meter-wide large panel door closed at rest in a modern Tagaytay hillside home, viewed from inside revealing rolling green hills, a pale-oak bench and a ceramic vase in the foreground, warm afternoon light, intimate-yet-grand composition.`
- **D — Mullion-free detail:** `Tight detail crop of the corner where ceiling, side wall, and a large panel door meet, slim matte white uPVC profile and the absence of a vertical mullion, polished concrete at the bottom edge, raking light.`

## Lift & Slide → `public/images/products/lift-and-slide-A.jpg` (…-B/-C/-D)
- **A — Hero:** `A wide three-panel lift-and-slide door in matte white uPVC, full-height, the middle panel slid open ~40% showing the lifted seal mechanism at the bottom rail, slim profile mullions, as the threshold between a modern Philippine kitchen and a covered lanai, polished concrete through, soft side daylight.`
- **B — Open lanai:** `A three-panel lift-and-slide door fully open, all panels stacked to the right, between a living room with a low pale-oak bench and a lanai with banana leaves and a rattan lounge chair, late-afternoon golden hour, polished concrete through the threshold.`
- **C — Weather-tight:** `A three-panel lift-and-slide door closed at rest with the lift mechanism engaged, viewed from inside a modern Philippine home, rain droplets on the exterior glass, dry calm interior, a ceramic vase of eucalyptus on the sill.`
- **D — Track detail:** `Tight detail crop of a lift-and-slide bottom track — the recessed seal channel, the meeting stile, the recessed handle — raking 45° light emphasizing the lift mechanism, pale concrete in soft focus.`

## 90 Series Door → `public/images/products/90-series-A.jpg` (…-B/-C/-D)
- **A — Hero (front elevation):** `A single-leaf solid uPVC entry door in matte white, premium 90-series profile (deeper and beefier than a standard door), as a residential front entry, slim profile, polished concrete porch, a matte black brushed handle, a fiddle-leaf fig planter to the left, golden-hour front light.`
- **B — Interior:** `A 90-series uPVC door in matte white between a modern Philippine hallway and a master bedroom, the deeper premium profile clearly visible, polished concrete through the threshold, the door half-open revealing morning light beyond, intimate asymmetric composition.`
- **C — Double-door pair:** `A pair of 90-series uPVC double doors in matte white between a living room and a private library, both closed at rest, slim premium profile, polished concrete floor, a low pale-oak bench with a stack of books, golden-hour light from the library side.`
- **D — Profile detail:** `Tight detail crop of the side of a 90-series uPVC door showing the deeper premium profile in cross section, the seal gasket, matte white finish, raking light emphasizing the deeper profile vs a standard door.`

---

# SPECIALIST SYSTEMS

## Arch Shapes → `public/images/products/arch-A.jpg` (…-B/-C/-D)
- **A — Hero:** `A heritage-style arched window in matte white uPVC, semicircular top over a rectangular lower section, in a thick traditional Philippine wall, the arc following the architecture cleanly, polished hardwood floor, golden-hour light pouring through the arch onto the floor in a curved shape.`
- **B — Heritage facade:** `A row of three arched windows in matte white uPVC across the second floor of a traditional Philippine facade, viewed from outside in late afternoon, stone-textured walls and a clay-tile roof, golden-hour light, bougainvillea climbing the wall.`
- **C — Arched corridor:** `A long corridor in a modern Philippine home with five sequential arched windows in matte white uPVC down one wall, casting curved arches of golden-hour light on polished concrete, a pale-oak bench at the far end, one-point perspective.`
- **D — Springing detail:** `Tight detail crop of the springing point where an arched window transitions from vertical to curved, matte white uPVC profile following the curve precisely, slim glazing bead, raking light.`

## Curtain Wall → `public/images/products/curtain-wall-A.jpg` (…-B/-C/-D)  ⚠️ must read "tall AND wide"
- **A — Hero (three-storey scale):** `A three-storey, double-height floor-to-ceiling curtain wall in a clean modernist grid of large glass panes with slim dark mullions and transoms, emphatically TALL AND WIDE, as the entry-atrium wall of a modern Philippine residence, the staircase and an upper gallery visible behind the glass for scale, a person-height doorway at the base (door only, no people), golden-hour light casting precise rectangles on the polished concrete floor.`
- **B — Seaside full-bleed:** `A floor-to-ceiling double-height curtain wall in a modernist grid as the seaside wall of a modern Batangas interior, polished concrete floor to the glass, palm trees and the ocean horizon beyond, late-afternoon light, dramatic wide composition.`
- **C — Boutique-hotel lobby:** `A curtain wall as the lobby facade of a modern Philippine boutique hotel, viewed from inside looking out, tropical palms and a pool beyond the glass, soft golden-hour light, a low rattan lounge chair in the foreground.`
- **D — Intersection detail:** `Tight detail crop of a curtain-wall mullion-transom cross joint, slim profile depth, structural glazing edge, raking light emphasizing the precision of the cross.`

## Custom Shapes → `public/images/products/custom-shapes-A.jpg` (…-B/-C/-D)
- **A — Hexagonal feature:** `A large hexagonal feature window in matte white uPVC in a modern Philippine gable wall, six sides proportioned cleanly, slim profile, high above a pale-oak floor, golden-hour light pouring through onto the floor as a perfect hexagon of warm light.`
- **B — Trapezoid wall:** `A trapezoid window in matte white uPVC in the angled gable wall of a modernist Philippine home, following the architectural slope, slim profile, polished concrete floor, a fiddle-leaf fig to one side, golden-hour light.`
- **C — Triangular pinwheel:** `A pinwheel of four triangular custom-shape windows in matte white uPVC meeting at a central point, as a feature wall in a modern entry foyer, golden-hour light casting a star-shape of warm light on polished concrete.`
- **D — Geometry detail:** `Tight detail crop where two custom-shape panels meet at an acute (non-90°) angle, matte white uPVC profile following the geometry precisely, slim glazing bead, raking light emphasizing the mitre.`

---

*Note: curtain-wall framing above is written "matte white uPVC" per the runbook; if FourlinQ's curtain wall is actually dark aluminium, adjust the frame color/material in the body before generating — confirm against the brochure. (Specs stay brochure-verified even though the visuals may be AI-generated.)*

# Finish Variant Generation Runbook

How to produce the 11 finish-variant photographs that power the `/finishes` interactive preview. Same handoff format as `docs/HERO_VIDEO_RUNBOOK.md`.

When the assets land in `public/images/finishes/{scene-id}/`, flip the `hasAssets` flag in [src/data/finish-scenes.ts](../../../src/data/finish-scenes.ts) and the page auto-upgrades from the "Photo previews coming soon" placeholder to the real variant swap.

---

## The deliverable

For each scene (start with `living-room` — the only one wired up), produce **11 photographs** where:

- **Everything in the frame is identical** — lighting, room contents, camera angle, background, glass reflections — EXCEPT the window frame's finish.
- The frame's finish in each photo matches one of the 11 brochure-verified finishes in `src/data/fourlinq-data.ts` → `FRAME_FINISHES`.

Final files:

```
public/images/finishes/living-room/
├── oak-light.jpg        # Wood grain · Pale Scandinavian oak
├── oak-malt.jpg         # Wood grain · Warm medium blonde
├── woodgray.jpg         # Wood grain · Cool gray driftwood
├── 2-wood-black.jpg     # Wood grain · Deep espresso brown-black
├── dark-oak.jpg         # Wood grain · Medium-dark reddish brown
├── walnut.jpg           # Wood grain · Rich chocolatey brown
├── golden-oak.jpg       # Wood grain · Honey-amber gold
├── white.jpg            # Solid · Clean bright white
├── jet-black.jpg        # Solid · Deep near-total black
├── charcoal-gray.jpg    # Solid · Mid-dark gray
└── matte-quartz.jpg     # Solid · Flat medium stone-gray
```

**Format target:** 1920×1080 (16:9) or 1600×2000 (4:5 portrait), JPEG, ~150-300KB each. Use the `aspect` in `src/data/finish-scenes.ts` to determine crop.

---

## The hard problem

Getting 11 photos that are **identical except for the frame**. AI image-to-image with inpainting is the right tool — generate one base scene, then inpaint the frame region 11 times with finish-specific prompts. Three viable workflows:

### Workflow A — Flux Inpaint (recommended)

Best for architectural detail and finish realism right now.

1. Use [Flux 1.1 Pro with image-to-image + mask](https://replicate.com/black-forest-labs/flux-1.1-pro) via Replicate or fal.ai
2. Generate ONE base scene first (text-to-image, see prompt below)
3. Open the base in Photoshop / Figma / any mask tool. **Paint a mask on just the window frame area** (NOT the glass, NOT the wall around it). Export the mask as a black-and-white PNG.
4. For each finish, run Flux Inpaint with: base image + mask + finish-specific prompt
5. Iterate 2-3 times per finish until the frame reads convincingly

Cost: ~$0.04 per generation × 11 finishes × 2-3 takes = ~$2-3 per scene.

### Workflow B — Photoshop Generative Fill + Real Texture Overlays

Best when finish realism matters more than AI novelty.

1. Generate or photograph ONE base scene at 4K
2. Use Photoshop's Generative Fill to recolor the frame to a neutral base
3. Apply each of 11 real finish-texture PNGs (heat-fused wood-grain laminate texture libraries from sites like Textures.com or industry catalogs) via masked overlay with multiply blend mode
4. Export 11 final JPGs

Cost: $0 if you already have Photoshop and texture references. Time: 2-3 hours per scene including QA.

### Workflow C — SDXL + ControlNet Inpaint (technical)

Most control, steepest learning curve. Skip unless you're already comfortable with ComfyUI / Automatic1111.

---

## The base scene

Generate or photograph this:

**Title:** Modern Filipino living room, full-height casement window

**Prompt (for Flux / Midjourney / SDXL text-to-image):**

```
Modern Filipino living room in late afternoon golden hour. A full-height
casement window dominates the left third of the frame, looking out onto
a tropical garden with palm leaves and warm sun. The window frame is
prominent but neutral charcoal gray — we will swap its finish later.
Interior is contemporary tropical: neutral wood floor, white walls,
single tan leather chair, a low coffee table with a vase. Camera is
positioned at eye level, mid-room, looking straight at the window.
Composition is 4:5 portrait. Soft shallow depth of field on the
furniture, sharp focus on the window frame. Architectural-photography
aesthetic, like Architectural Digest or Marvin.com. Anamorphic lens,
warm color grade. No people. No text. No logos.
```

**Critical constraints (negative prompt or instruction):**

- No multiple windows — exactly one large casement
- The frame must be **visible and clearly defined** — not hidden behind sheer curtains, not in deep shadow
- Frame is initially **charcoal gray** so we have a neutral starting point to recolor
- Room is **stylized but realistic** — no fantasy lighting, no exaggerated saturation
- 16:10 or 4:5 portrait aspect ratio

Iterate 5-10 times until you have one base scene that meets ALL criteria. Save the master at full resolution.

---

## The frame mask

Open the base in Photoshop / Affinity / Krita. Create a mask layer:

- **White** over the frame's wood / uPVC area (the profile that holds the glass)
- **Black** over everything else (glass, walls, furniture, window grid lines/mullions if you want those to stay charcoal as a contrast)

Export as `mask.png`, same dimensions as the base.

Save both `_base.jpg` and `mask.png` for reference; you'll re-use them every time the scene changes.

---

## The 11 finish prompts

Each prompt should describe the **frame finish only** — the rest is locked by the inpaint mask. Combine each with the base image + mask as input.

```
oak-light:        "Window frame painted in Oak Light wood grain. Pale, almost
                   bleached Scandinavian oak. Fine, straight grain with subtle
                   cream and off-white tones. Airy and minimalist. Reads
                   nearly white from a distance. Hex reference #D6C4A1."

oak-malt:         "Window frame in Oak Malt wood grain. Warm medium-blonde with
                   golden-amber tones and slightly pronounced grain. Natural,
                   raw, unfinished-timber appearance. Hex #B89A6A."

woodgray:         "Window frame in Woodgray finish. Cool gray base with subtle
                   brown-taupe grain lines, like driftwood or weathered timber.
                   A crossover finish — neither fully wood nor fully solid.
                   Hex #8C8680."

2-wood-black:     "Window frame in 2 Wood Black wood grain. Deep espresso
                   brown-black where wood grain is still perceptible in raking
                   light. Moody, ebonized oak or dark wenge. Hex #2E2A27."

dark-oak:         "Window frame in Dark Oak wood grain. Medium-dark reddish-brown
                   with clearly defined flowing grain in deep amber and brown.
                   Warm mahogany-adjacent hardwood look. Hex #5C3A1E."

walnut:           "Window frame in Walnut wood grain. Rich chocolatey brown with
                   prominent swirling grain. Bold contrast between dark base and
                   lighter streaks. The most premium timber look. Hex #6B4226."

golden-oak:       "Window frame in Golden Oak wood grain. Bright honey-amber
                   with strong open-grain pattern, almost orange-gold in direct
                   light. The most vivid wood finish. Suits Spanish-colonial
                   Filipino interiors. Hex #C8820A."

white:            "Window frame in clean White solid finish. Smooth uniform
                   surface, no grain, no texture. Bright pure white. Hex #F5F5F5."

jet-black:        "Window frame in Jet Black solid finish. Deep, near-total
                   black with a smooth matte-to-satin surface. Completely
                   uniform, no grain. High contrast and architectural.
                   Hex #1A1A1A."

charcoal-gray:    "Window frame in Charcoal Gray solid finish. Mid-dark gray,
                   softer than Jet Black with slightly cooler tone. Between
                   anthracite and concrete. Industrial but not aggressive.
                   Hex #4A4A4A."

matte-quartz:     "Window frame in Matte Quartz solid finish. Flat medium gray
                   with almost no sheen. Stone-like, understated. Closest to
                   polished concrete or quartz countertop. Hex #9E9E9E."
```

**Critical for every prompt:**
- Preserve glass, room, lighting, and composition EXACTLY
- Frame mullions (the divisions within the window) should also recolor to match the main frame
- Don't add reflections, ornaments, or hardware that weren't in the base scene

---

## QA checklist for each variant

Before committing to disk, verify each generated variant:

- [ ] The frame finish matches the description (compare to the swatch in `src/data/fourlinq-data.ts`)
- [ ] Everything outside the frame (room, glass, lighting) is **identical** to other variants
- [ ] No AI artifacts on the frame edges
- [ ] No spurious added objects, text, or logos
- [ ] The frame is clearly the dominant element — not lost in shadow or color-clashing with the room
- [ ] Compare side-by-side with the swatch chip in the FAQ swatch grid — does the photo's frame match the chip's color reasonably?

If a variant fails, regenerate. The whole interaction depends on the visitor recognizing each finish at a glance.

---

## Deployment

Once all 11 variants are in `public/images/finishes/living-room/`:

1. Open `src/data/finish-scenes.ts`
2. Change `hasAssets: false` to `hasAssets: true` for the `living-room` scene
3. Commit, push — the page auto-upgrades

If you want to add a second scene (kitchen, bedroom, exterior):

1. Repeat the workflow with a new base scene
2. Create `public/images/finishes/{new-scene-id}/`
3. Add an entry to the `FINISH_SCENES` array in `finish-scenes.ts` with `hasAssets: true`
4. (Optional) Wire a scene picker into `src/pages/Finishes.tsx` so visitors can toggle between scenes

---

## When NOT to use AI for this

If precision matters more than turnaround time:

- Commission a real photo shoot at a project home with a casement window
- Build 11 actual frames in the 11 finishes (already on the shop floor) and photograph each in the same window opening
- The result is unimpeachable; the cost is ~₱100-200k and 2-4 weeks

This is Scenario C of the photo strategy. Worth pursuing for the website's long-term anchor scene.

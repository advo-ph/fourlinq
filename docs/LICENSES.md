# Third-party Asset Licenses

## Own work — no third-party terms

### `public/models/system/*.glb` (26 files)

Baked by `npm run handoff:export` from the procedural three.js builders in
[scripts/handoff/model/](../scripts/handoff/model/), which came out of a Claude
Design handoff commissioned for FourlinQ on 2026-08-08. **FourlinQ owns this
geometry outright** — no attribution requirement, no non-commercial clause, no
domain restriction, unlike the licensed model below. The builders are committed
so the GLBs stay reproducible rather than being binary drops.

Covers every system the site shows: casement and 2-lite, awning, sliding (2- and
4-panel), fixed, hung, louvre (narrow and wide blade), slide & fold, sliding /
lift-slide / multislide doors, casement / french / 90-series swing doors, curtain
wall, arch and triangle special shapes, bay / bow / corner combinations, and the
fixed / sliding / hung / awning grille variants.

> **The reference images that came with that handoff are not in this repo, and
> must not be.** The bundle shipped ~130 Marvin product photographs used as
> modelling reference while the geometry was authored. Looking at a competitor's
> photo to model your own profile is ordinary practice; publishing their
> photography as FourlinQ's product imagery is not. Only `*-model.js` and the
> JSON specs were copied in. If the bundle is re-imported, keep `uploads/` out.

## 3D Models

### `public/models/animated-window-systems.glb`

- **Title:** Animated Window Systems
- **Author:** makinwhat ([Sketchfab profile](https://sketchfab.com/makinwhat))
- **Source URL:** https://sketchfab.com/3d-models/animated-window-systems-ffa9e879cdd04c3ba49d894f2f2ef5d3
- **Original license:** CC Attribution-NonCommercial 4.0 (CC-BY-NC)
- **Use on this site:** Commercial — granted by author on **2026-05-22** via Sketchfab DM, specifically for use on fourlinq.ph and its preview deployments.
- **Attribution rendered:** "3D model by makinwhat" with linked Sketchfab profile, shown beneath the viewer in the [Window3D component](../src/components/3d/Window3D.tsx) on every page that displays the model.
- **Subtrees used (updated 2026-08-10, third pass): NONE.** Every system the site
  exposes now renders from geometry FourlinQ owns. Louvre — the last shipped
  product drawn from this file — got its own builder
  (`scripts/handoff/model/louvre-model.js`), and with it went the 4-panel slider
  and the sliding / hung / awning grilles. The count went 17 → 6 → **0**.

  | Still configured against this file | Rendered anywhere? |
  | --- | --- |
  | `pivot`, `pivot-lattice`, `revolving` | **No** — withheld from `CATALOGUE_SYSTEM` as unconfirmed products |

  A test asserts this exact list and fails if anything reachable moves back onto
  the licence.

- **The attribution is now conditional, and that is deliberate.** The credit used
  to render under the viewer unconditionally, which was right while every system
  came from this file. It is now gated on the shown system lacking its own
  `model`, so it renders on nothing today and comes back on its own the moment a
  licensed system is re-exposed. Leaving it unconditional would have credited
  makinwhat for geometry FourlinQ authored — wrong in the opposite direction, and
  a misattribution of our own work.

- **The file is still in the repo and still ships.** It is 4.89 MB — larger than
  all twenty-six owned models combined — and nothing fetches it any more; it was
  also being *preloaded* on every visit to the Design Tool until 2026-08-10.
  Deleting it, and with it the `pivot` / `revolving` configs, is a product call
  rather than a technical one, so it is left for FourlinQ to decide. Nothing
  depends on it.

- **What the grant still means.** The 2026-05-22 permission covers commercial use
  on fourlinq.ph and its previews. Since nothing renders the model, neither the
  attribution requirement nor the fourlinq.ph-only restriction currently binds
  anything that ships — including a client's own deployment. Run
  `npm run probe:glb` to see every assembly in the binary; 62 of its 70 top-level
  nodes are now unreachable.

  Separate from the licence: showing a system is a **product claim**. Hung is
  exposed without the client having confirmed FourlinQ fabricates it — see the
  note in `window-system.ts`.

**If the model is ever replaced** with our own commissioned 3D work or manufacturer CAD files (§15.2 of REDESIGN_ROADMAP), the attribution should remain on the project changelog as historical credit, even after the asset is no longer in use.

**Backup of the commercial-use agreement** should be kept somewhere durable outside this repo (Google Drive, Notion, email archive) in case the license is ever challenged. Screenshot the Sketchfab DM thread.

---

## Fonts

### `Fraunces`

- **Source:** Google Fonts (https://fonts.google.com/specimen/Fraunces)
- **License:** SIL Open Font License 1.1
- **Usage:** Display headlines across the FourlinQ site

### `Inter`

- **Source:** Google Fonts (https://fonts.google.com/specimen/Inter)
- **License:** SIL Open Font License 1.1
- **Usage:** Body text + UI labels across the FourlinQ site

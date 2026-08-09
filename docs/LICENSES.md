# Third-party Asset Licenses

## Own work — no third-party terms

### `public/models/system/*.glb` (12 files)

Baked by `npm run handoff:export` from the procedural three.js builders in
[scripts/handoff/model/](../scripts/handoff/model/), which came out of a Claude
Design handoff commissioned for FourlinQ on 2026-08-08. **FourlinQ owns this
geometry outright** — no attribution requirement, no non-commercial clause, no
domain restriction, unlike the licensed model below. The builders are committed
so the GLBs stay reproducible rather than being binary drops.

Covers sliding, lift-slide and multislide doors, casement/french/90-series
swing doors, curtain wall, arch and triangle special shapes, and bay/bow/corner
combinations — the systems the licensed model has no art for.

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
- **Subtrees used (updated 2026-08-09):** **all of them.** Every one of the model's seventeen assemblies is now reachable — twelve systems in the viewer's tab rail (casement plain and bridged, awning, sliding 2- and 4-panel, slide-and-fold, louvre narrow and wide blade, hung, pivot, fixed, revolving) plus five grille variants reached through the Grille toggle. `npm run probe:glb -- --unclaimed` reports zero unclaimed top-level nodes, and a test keeps it there. The model file is unmodified from the original Sketchfab download.

  The 2026-05-22 grant covers commercial use of *the model* on fourlinq.ph, not a
  single subtree, so displaying all of it stays inside the grant. Two limits
  still bite: the grant names **fourlinq.ph and its preview deployments only**,
  so any other domain or a client's own site needs a fresh permission; and the
  attribution must remain rendered wherever the model shows. Run
  `npm run probe:glb` to see every assembly in the binary.

  Separate from the licence: showing a system is a **product claim**. Hung,
  pivot and revolving are exposed without the client having confirmed FourlinQ
  fabricates them — see the note in `window-system.ts`.

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

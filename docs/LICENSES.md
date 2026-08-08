# Third-party Asset Licenses

## 3D Models

### `public/models/animated-window-systems.glb`

- **Title:** Animated Window Systems
- **Author:** makinwhat ([Sketchfab profile](https://sketchfab.com/makinwhat))
- **Source URL:** https://sketchfab.com/3d-models/animated-window-systems-ffa9e879cdd04c3ba49d894f2f2ef5d3
- **Original license:** CC Attribution-NonCommercial 4.0 (CC-BY-NC)
- **Use on this site:** Commercial — granted by author on **2026-05-22** via Sketchfab DM, specifically for use on fourlinq.ph and its preview deployments.
- **Attribution rendered:** "3D model by makinwhat" with linked Sketchfab profile, shown beneath the viewer in the [Window3D component](../src/components/3d/Window3D.tsx) on every page that displays the model.
- **Subtrees used (updated 2026-08-08):** nine of the model's assemblies are now shown, not just the casement — casement (plain and bridged), awning, sliding (2- and 4-panel), slide-and-fold, louvre (narrow and wide blade), and fixed. Three more (hung, pivot, revolving) are configured in `window-system.ts` but withheld from the tab rail pending confirmation that FourlinQ sells them; they render only if deliberately promoted. The remaining lattice/grille variants stay hidden. The model file is unmodified from the original Sketchfab download.

  The 2026-05-22 grant covers commercial use of *the model* on fourlinq.ph, not a
  single subtree, so widening which assemblies are displayed stays inside it.
  Two limits still bite: the grant names **fourlinq.ph and its preview
  deployments only**, so any other domain or a client's own site needs a fresh
  permission; and the attribution must remain rendered wherever the model shows.
  Run `npm run probe:glb` to see every assembly in the binary.

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

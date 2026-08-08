# Geometry studio

Parametric three.js builders for FourlinQ window and door systems, each with a
standalone viewer that exports production assets: GLB (rest pose, open pose,
animated clip), white-background PNG still sequences, hover sprite strips, and
the motion config JSON.

Imported from the Claude Design project *FourlinQ Casement Window System*
(`289dd82f-1db4-44c9-bb40-ba4fd8effb32`) on 2026-08-08.

## Why it lives in `assets-src/`

These are **authoring tools, not site code**. They generate the assets that ship
— `public/models/animated-window-systems.glb` is exactly the kind of output this
studio produces. Vite only builds `public/`, so nothing here reaches production
or the bundle.

The viewers load three.js from unpkg through a pinned import map with SRI
hashes. That version (`0.184.0`) matches the `three` pinned in the repo's
`package.json`, so geometry authored here and geometry rendered by
`src/components/3d/Window3D.tsx` agree.

## Running a viewer

They are plain static files — serve the repo root and open one. Do **not** open
them via `file://` (ES modules and the import map need an origin), and note that
the Vite dev server transforms module scripts, which fights the import map:

```
python -m http.server 8899
# → http://127.0.0.1:8899/assets-src/geometry-studio/casement-viewer.html
```

## Verifying

`probe-viewer.mjs` drives a viewer in headless Chromium and asserts the scene is
real — mesh count, material names, and whether the open control actually moves
geometry. A page that renders an empty stage still "loads", so the mesh count
and pose delta are the assertions that matter. Run it from the repo root so it
resolves `playwright` from `node_modules`:

```
node assets-src/geometry-studio/probe-viewer.mjs \
  http://127.0.0.1:8899/assets-src/geometry-studio/casement-viewer.html
```

Exit 0 means meshes present, no console errors, no failed requests.

## Imported so far

| System | Model | Viewer | Config | Probe |
| --- | --- | --- | --- | --- |
| Casement | `window-model.js` | ✅ | `casement.json` | 21 meshes, Δ 0.44 m |
| Curtain wall | `curtainwall-model.js` | ✅ | in-viewer | 65 meshes, fixed |
| Awning | `awning-model.js` | ✅ | `awning.json` | 26 meshes, Δ 0.16 m |
| Fixed / direct-glaze | `fixed-model.js` | ✅ | in-viewer | 15 meshes, fixed |
| Hung | `hung-model.js` | ✅ | `hung.json` | 36 meshes, Δ 0.67 m |
| Slider / glider | `slider-model.js` | ✅ | `sliding.json` | 23 meshes, translates |

Two probe notes, so the numbers are not over-read:

- The slider reports `poseDelta: null` because the probe looks for a node named
  `*pivot*` and the glider's moving node is `panel_operable_carrier`. The panel
  does translate; the probe simply has no hinge to measure. Widening that
  heuristic is a small fix worth making before the remaining sliding systems
  land.
- One `hung` run reported 4 console errors; four subsequent runs reported zero.
  It coincided with two viewers probed back to back, so it reads as a CDN
  hiccup fetching the font or three.js, not a defect. Re-probe if it recurs.

All 14 motion configs are in and parse: `awning`, `casement`, `casement-door`,
`combination`, `french-door`, `hung`, `lift-and-slide`, `ninety-series`,
`slide-and-fold`, `sliding-door`, `sliding`, and the three `special-shapes-*`.

Shared: `three-d-stage.js` (the `<three-d-stage>` custom element — viewer,
studio lighting, orbit controls, OBJ/GLB export toolbar) and `support.js`
(Claude Design `dc-runtime`; no viewer imports it, kept for completeness).

## Still to import

7 models — `bifold`, `combination`, `lift-slide`, `multislide`, `sliding-door`,
`special`, `swing-door`.

9 viewers — `bifold`, `casement-door`, `combination`, `french-door`,
`lift-slide`, `multislide`, `ninety-series`, `sliding-door`, `special`.

Plus `Canvas.dc.html` (Claude Design canvas wrapper).

`swing-door-model.js` is likely shared by three of those viewers
(`casement-door`, `french-door`, `ninety-series`) — their configs differ only
in leaf count, lite, and hardware — so import it before them.

## Not imported, deliberately

The source project also holds ~100 PNG reference renders under `uploads/`. They
are Marvin product photography, they were not in the selected file list, and no
viewer references them. `docs/` records a standing policy against shipping
Marvin assets as FourlinQ's, so they were left in place.

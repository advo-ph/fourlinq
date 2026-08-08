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
and pose delta are the assertions that matter.

Motion is measured, not guessed at. An earlier version looked for a node named
`*pivot*`, which lied in both directions: the glider reported *no* motion (its
moving node is `panel_operable_carrier`) and a door reported 0.09 m for a full
90° swing (the pivot's first mesh child is a hinge leaf sitting on the swing
axis). It now snapshots every mesh's world position closed and open and reports
the largest displacement — motion-type agnostic, and immune to naming.

Run it from the repo root so it resolves `playwright` from `node_modules`:

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
| Casement door | `swing-door-model.js` | ✅ | `casement-door.json` | 42 meshes, Δ 1.04 m |
| French door | `swing-door-model.js` | ✅ | `french-door.json` | 72 meshes, Δ 1.08 m |
| 90-series entry | `swing-door-model.js` | ✅ | `ninety-series.json` | 55 meshes, Δ 1.04 m |
| Sliding patio door | `sliding-door-model.js` | ✅ | `sliding-door.json` | 29 meshes, Δ 1.20 m |

`swing-door-model.js` is shared: `buildSwingDoor({ type })` covers
`casement-door`, `french`, and `ninety` from one builder.

`maxDelta` is the largest distance any single mesh travels between the closed
and open pose; `moved` is how many meshes travel more than 1 mm. A `null`
means the viewer exposes no `#open` control at all — correct for `fixed`,
which is turntable-only. `curtainwall` reads 0 because its default variant is
all-fixed; switch on the awning insert and it moves.

One `hung` run once reported 4 console errors; every run since has reported
zero. It coincided with two viewers probed back to back, so it reads as a CDN
hiccup fetching the font or three.js, not a defect. Re-probe if it recurs.

All 14 motion configs are in and parse: `awning`, `casement`, `casement-door`,
`combination`, `french-door`, `hung`, `lift-and-slide`, `ninety-series`,
`slide-and-fold`, `sliding-door`, `sliding`, and the three `special-shapes-*`.

Shared: `three-d-stage.js` (the `<three-d-stage>` custom element — viewer,
studio lighting, orbit controls, OBJ/GLB export toolbar) and `support.js`
(Claude Design `dc-runtime`; no viewer imports it, kept for completeness).

## Still to import

Five systems, each a model + its viewer: `lift-slide`, `multislide`, `bifold`,
`combination`, `special`.

Plus `Canvas.dc.html` — the Claude Design canvas wrapper. It has **no reachable
surface in this repo** (nothing imports it, it renders nothing here); it is an
archival platform file, not a product item.

Their motion configs are already in, so each system needs only its two source
files.

## Not imported, deliberately

The source project also holds ~100 PNG reference renders under `uploads/`. They
are Marvin product photography, they were not in the selected file list, and no
viewer references them. `docs/` records a standing policy against shipping
Marvin assets as FourlinQ's, so they were left in place.

/**
 * Bake the Claude Design handoff builders into per-system GLB files.
 *
 *   node scripts/handoff/export-glb.mjs          # write public/models/system/
 *   node scripts/handoff/export-glb.mjs --list   # show the registry, write nothing
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 * `scripts/handoff/model/*.js` are procedural three.js builders that FourlinQ
 * owns outright, covering the systems the licensed makinwhat GLB does not:
 * sliding and lift-slide doors, multislide, 90-series and french entry doors,
 * curtain wall, special shapes, and bay/bow/corner combinations. Each exports a
 * `build*(opts)` returning `{ group, setOpen? }`.
 *
 * Rather than port thirteen builders into the React viewer, we bake them into
 * the same GLB shape the viewer already consumes. One file per system, so a
 * page only downloads the system it shows.
 *
 * ── Baking the animation ─────────────────────────────────────────────────────
 * The builders expose `setOpen(t)` for t in 0..1 instead of an animation clip.
 * We sample it and record every node whose transform actually moves, which is
 * generic: it works for hinges, sliders, folding chains and lift-slide lifts
 * without this script knowing anything about the mechanism.
 *
 * The output matches the contract in docs/3D_ASSET_BRIEF.md: one clip named
 * `Scene`, 0 → 4 s, closed at 0, fully open at 2 s, closed again at 4 s. The
 * viewer scrubs toward a pinned `openTime`, so the open pose must be a single
 * instant — hence the symmetric there-and-back rather than a hold.
 *
 * ── Materials ────────────────────────────────────────────────────────────────
 * The builders use descriptive material names (`upvc_white_matte`,
 * `epdm_gasket_black`). The viewer keys the finish picker off `frame1/2/3`, so
 * they are renamed on the way out — see MATERIAL_AS. Anything not renamed to a
 * frame slot keeps its own colour, which is the point for gaskets and hardware.
 *
 * ── After running ────────────────────────────────────────────────────────────
 *   npm run probe:glb          # measures every model, including these
 *   → paste center/scale/openTime into SYSTEMS, never hand-tune them
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(here, "..", "..", "public", "models", "system");

/**
 * GLTFExporter reaches for the browser's FileReader to turn its output Blob
 * into an ArrayBuffer. Node has Blob but not FileReader, and the exporter only
 * uses readAsArrayBuffer + onloadend, so this is the whole surface it needs.
 */
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buffer) => {
        this.result = buffer;
        this.onloadend?.();
      });
    }
  };
}

/* ─── Registry ─── */

/**
 * One entry per system we want as a GLB.
 *
 * Deliberately excludes casement, awning, sliding, fixed, hung and bifold: the
 * licensed model already animates those and they are live. Exporting them too
 * would put two tabs for the same product in the rail.
 *
 * `type` is the configurator product-type id this answers, where one exists —
 * that is the whole reason these are worth baking, since those types currently
 * fall back to a flat SVG.
 */
const SYSTEM = [
  {
    id: "sliding-door",
    type: "sliding-door",
    label: "Sliding Door",
    module: "sliding-door-model.js",
    build: "buildSlidingDoor",
    opts: { panels: 2 },
    openLabel: "Slide open",
    closeLabel: "Slide closed",
  },
  {
    id: "lift-slide",
    type: "lift-slide",
    label: "Lift & Slide",
    module: "lift-slide-model.js",
    build: "buildLiftSlideDoor",
    opts: { panels: 2 },
    openLabel: "Lift & slide open",
    closeLabel: "Lower & close",
  },
  {
    id: "multislide",
    type: "large-panel-doors",
    label: "Large Panel · multislide",
    module: "multislide-model.js",
    build: "buildMultiSlide",
    opts: { panels: 4 },
    openLabel: "Stack open",
    closeLabel: "Close panels",
  },
  {
    id: "casement-door",
    type: "casement-door",
    label: "Casement Door",
    module: "swing-door-model.js",
    build: "buildSwingDoor",
    opts: { type: "casement-door" },
    openLabel: "Open door",
    closeLabel: "Close door",
  },
  {
    id: "french-door",
    type: "french-door",
    label: "French Door",
    module: "swing-door-model.js",
    build: "buildSwingDoor",
    opts: { type: "french" },
    openLabel: "Open doors",
    closeLabel: "Close doors",
  },
  {
    id: "ninety-series",
    type: "90-series",
    label: "90 Series",
    module: "swing-door-model.js",
    build: "buildSwingDoor",
    // From spec/ninety-series.json: RH, outswing, half lite, 1000 x 2150.
    opts: { type: "ninety", handing: "RH", swing: "out", lite: "half" },
    openLabel: "Open door",
    closeLabel: "Close door",
  },
  {
    id: "curtain-wall",
    type: "curtain-wall",
    label: "Curtain Wall",
    module: "curtainwall-model.js",
    build: "buildCurtainWall",
    // `awning: true` adds the operable vent insert. Without it the wall is
    // entirely fixed glazing, the bake finds nothing that moves, and the
    // viewer correctly but uselessly labels a curtain wall "does not open".
    // No scale figure: a mannequin belongs in a design mock, not a product
    // viewer where the user is choosing a finish.
    opts: { variant: "standard", awning: true, figure: false },
    openLabel: "Open vents",
    closeLabel: "Close vents",
  },
  {
    id: "special-arch",
    type: "arch-shapes",
    label: "Arch / Round-top",
    module: "special-model.js",
    build: "buildSpecial",
    opts: { shape: "arch", variant: "tall" },
  },
  {
    id: "special-triangle",
    type: "special-shapes",
    label: "Triangle Gable",
    module: "special-model.js",
    build: "buildSpecial",
    opts: { shape: "triangle", variant: "isosceles" },
  },
  {
    id: "combination-bay",
    label: "Bay — 3 panel",
    module: "combination-model.js",
    build: "buildCombination",
    opts: { variant: "bay", figure: false },
  },
  {
    id: "combination-bow",
    label: "Bow — arc",
    module: "combination-model.js",
    build: "buildCombination",
    opts: { variant: "bow", figure: false },
  },
  {
    id: "combination-corner",
    label: "Corner — 90°",
    module: "combination-model.js",
    build: "buildCombination",
    opts: { variant: "corner", joint: "butt", figure: false },
  },
];

/**
 * Builder material name -> the name the viewer keys off.
 *
 * Only `frame1/2/3` are recoloured by the finish picker (FRAME_MATERIAL in
 * Window3D). Everything else keeps its authored colour, which is what we want
 * for glazing, gaskets and hardware — a black EPDM gasket turning oak would
 * look like a rendering fault.
 */
const MATERIAL_AS = {
  // Frame — takes the finish.
  upvc_white_matte: "frame1",
  upvc_white_rebate: "frame2",
  wood_pine_clear: "frame1",
  wood_pine_rebate: "frame2",
  alu_dark_anodised: "frame1",
  alu_dark_anodised_deep: "frame2",
  alu_clad_graphite: "frame3",
  alu_clad_graphite_dark: "frame3",
  alu_pressure_cap: "frame3",
  // Glazing — untouched.
  glass_clear: "glass",
  glass_igu_clear: "glass",
  glass_spandrel_backpan: "glass",
  // Hardware and seals — untouched, and deliberately distinct: hinges are pale
  // steel and gaskets are near-black, so collapsing them would blacken hinges.
  hardware_matte_black: "parts",
  hinge_steel: "parts2",
  epdm_gasket_black: "gasket",
};

/**
 * Nodes dropped before export: presentation scaffolding from the design
 * prototypes — a 1700 mm human silhouette for scale, floor slab edges. Useful
 * in a mock, wrong in a product viewer where someone is choosing a finish.
 *
 * `turntable` is NOT in this list even though it is presentation. In
 * special-model.js it is the container every mesh hangs off, so dropping it
 * exported an empty 0 kB file — which the export summary showed as `0 meshes`
 * rather than failing, hence the mesh-count assertion in main().
 */
const DROP_NODE = [
  "scale_figure",
  "scale_ghost",
  "scale_reference_1700mm",
  "slab_edges",
];

/* ─── Animation baking ─── */

/** Clip length, and the instant of the fully-open pose. Matches the contract. */
const CLIP_SECONDS = 4;
const OPEN_AT = 2;
/** Samples per half of the clip. 30 fps over 2 s. */
const STEP = 60;

const EPSILON = 1e-5;

/**
 * Sample setOpen(0..1) and emit keyframe tracks for whatever moved.
 *
 * Records position, quaternion and scale separately, and keeps a track only if
 * that channel actually varies — otherwise a hinge would carry dead position
 * tracks for every node in the assembly and the file would balloon.
 */
function bakeClip(root, setOpen) {
  const node = [];
  root.traverse((child) => {
    if (child.name) node.push(child);
  });

  const time = [];
  const sample = new Map(node.map((n) => [n, { p: [], q: [], s: [] }]));

  for (let i = 0; i <= STEP; i++) {
    const t = i / STEP;
    setOpen(t);
    time.push((t * CLIP_SECONDS) / 2);
    for (const n of node) {
      const rec = sample.get(n);
      rec.p.push(n.position.x, n.position.y, n.position.z);
      rec.q.push(n.quaternion.x, n.quaternion.y, n.quaternion.z, n.quaternion.w);
      rec.s.push(n.scale.x, n.scale.y, n.scale.z);
    }
  }
  setOpen(0);

  // Mirror 0→1 back to 1→0 so the clip returns to closed by CLIP_SECONDS.
  const mirrorTime = time.slice(0, -1).reverse().map((t) => CLIP_SECONDS - t);
  const fullTime = [...time, ...mirrorTime];

  const mirror = (values, stride) => {
    const frame = values.length / stride;
    const out = [...values];
    for (let i = frame - 2; i >= 0; i--) {
      out.push(...values.slice(i * stride, i * stride + stride));
    }
    return out;
  };

  const varies = (values, stride) => {
    for (let i = stride; i < values.length; i++) {
      if (Math.abs(values[i] - values[i % stride]) > EPSILON) return true;
    }
    return false;
  };

  const track = [];
  for (const n of node) {
    const rec = sample.get(n);
    if (varies(rec.p, 3)) {
      track.push(new THREE.VectorKeyframeTrack(`${n.name}.position`, fullTime, mirror(rec.p, 3)));
    }
    if (varies(rec.q, 4)) {
      track.push(new THREE.QuaternionKeyframeTrack(`${n.name}.quaternion`, fullTime, mirror(rec.q, 4)));
    }
    if (varies(rec.s, 3)) {
      track.push(new THREE.VectorKeyframeTrack(`${n.name}.scale`, fullTime, mirror(rec.s, 3)));
    }
  }
  return track.length ? new THREE.AnimationClip("Scene", CLIP_SECONDS, track) : null;
}

/* ─── Export ─── */

/** Every name MATERIAL_AS can produce — see the note in renameMaterial. */
const MAPPED_NAME = new Set(Object.values(MATERIAL_AS));

function renameMaterial(root, unknown) {
  root.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    for (const mat of Array.isArray(child.material) ? child.material : [child.material]) {
      const mapped = MATERIAL_AS[mat.name];
      if (mapped) mat.name = mapped;
      // The builders share one material instance across many meshes, so by the
      // time the traversal reaches the second mesh the rename has already
      // happened. Without this the summary reported every renamed material as
      // unmapped, which is exactly backwards.
      else if (mat.name && !MAPPED_NAME.has(mat.name)) unknown.add(mat.name);
    }
  });
}

function dropPresentationNode(root) {
  const doomed = [];
  root.traverse((child) => {
    if (DROP_NODE.some((n) => child.name === n || child.name.startsWith(`${n}_`))) {
      doomed.push(child);
    }
  });
  for (const node of doomed) node.parent?.remove(node);
  return doomed.length;
}

async function exportOne(entry, unknown) {
  const module = await import(`./model/${entry.module}`);
  const build = module[entry.build];
  if (typeof build !== "function") {
    throw new Error(`${entry.module} has no export ${entry.build}`);
  }

  const built = build(entry.opts ?? {});
  const inner = built.group ?? built;
  const dropped = dropPresentationNode(inner);
  renameMaterial(inner, unknown);

  const clip = typeof built.setOpen === "function" ? bakeClip(inner, built.setOpen) : null;

  // Wrap in a group named for the system, and export that.
  //
  // Without it the scene root is whatever the builder happened to name its
  // outermost group — which for combination and curtain wall is a presentation
  // group literally called `turntable`, so three separate files each claimed a
  // top-level node of the same name. The viewer's `visibleRoot` is a list of
  // node names, so that is a collision waiting to mis-render. This makes the
  // top level exactly one node, always named for the system id.
  const root = new THREE.Group();
  root.name = entry.id;
  root.add(inner);

  const binary = await new GLTFExporter().parseAsync(root, {
    binary: true,
    animations: clip ? [clip] : [],
    // The builders use ExtrudeGeometry throughout; without this every vertex
    // ships as float64-adjacent precision it does not need.
    truncateDrawRange: true,
  });

  mkdirSync(OUT_DIR, { recursive: true });
  const path = resolve(OUT_DIR, `${entry.id}.glb`);
  writeFileSync(path, Buffer.from(binary));

  let meshCount = 0;
  root.traverse((c) => { if (c.isMesh) meshCount++; });
  return {
    id: entry.id,
    bytes: binary.byteLength,
    meshCount,
    dropped,
    animated: !!clip,
    trackCount: clip?.tracks.length ?? 0,
  };
}

async function main() {
  if (process.argv.includes("--list")) {
    for (const s of SYSTEM) {
      console.log(`  ${s.id.padEnd(20)} ${s.build.padEnd(20)} ${s.type ?? "(no product type)"}`);
    }
    return;
  }

  const unknown = new Set();
  const result = [];
  for (const entry of SYSTEM) {
    result.push(await exportOne(entry, unknown));
  }

  // An empty export is the failure mode this script actually has: dropping a
  // node that turned out to be the model's container wrote a valid 0 kB GLB
  // and reported success. Fail loudly instead.
  const empty = result.filter((r) => r.meshCount === 0);
  if (empty.length) {
    console.error(`\nEMPTY EXPORT: ${empty.map((r) => r.id).join(", ")}`);
    process.exitCode = 1;
  }

  console.log(`out  ${OUT_DIR}\n`);
  console.log("system               size      meshes  dropped  clip");
  for (const r of result) {
    console.log(
      `  ${r.id.padEnd(20)} ${`${(r.bytes / 1024).toFixed(0)} kB`.padEnd(9)} ` +
        `${String(r.meshCount).padEnd(7)} ${String(r.dropped).padEnd(8)} ` +
        `${r.animated ? `${r.trackCount} tracks` : "static"}`,
    );
  }
  const total = result.reduce((sum, r) => sum + r.bytes, 0);
  console.log(`\ntotal ${(total / 1024 / 1024).toFixed(2)} MB across ${result.length} files`);

  if (unknown.size) {
    // Not fatal, but it means a material silently keeps its authored colour
    // when it might have wanted the finish. Worth seeing.
    console.error(`\nUNMAPPED MATERIALS (left untouched): ${[...unknown].sort().join(", ")}`);
    process.exitCode = 1;
  }
}

export { SYSTEM as HANDOFF_SYSTEM, MATERIAL_AS };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}

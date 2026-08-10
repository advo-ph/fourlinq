/**
 * Probe public/models/animated-window-systems.glb and print the numbers that
 * src/components/3d/Window3D.tsx hardcodes.
 *
 * WHY THIS EXISTS
 * ---------------
 * Window3D pins a `center` and `scale` per system instead of auto-fitting,
 * because bbox auto-fit raced useAnimations' time-0 pose application. Pinning
 * is the right call, but it only works if the pinned numbers are measured in
 * the SAME space the component applies them in.
 *
 * The first version of that config got this wrong. Its `center` values were the
 * raw node translations from the source FBX (centimetres, e.g. casement at
 * [-224.83, 551.89, -14.78]), but the component multiplies `center` against
 * loaded-scene coordinates, which already include the `Sketchfab_model` root
 * matrix scale of 0.0035960085 (= 1/278.09). Result: centering off by 278x and
 * a model scaled to ~0.1% of frame height. Invisible. Nobody noticed because
 * the component was imported nowhere.
 *
 * So: never hand-edit the numbers in SYSTEMS. Run this and paste.
 *
 * WHAT IT MEASURES
 * ----------------
 * Rest-pose union bounding box per system group, in loaded-scene space (root
 * matrix included), by walking the node hierarchy, accumulating transforms, and
 * unioning the eight transformed corners of each mesh's POSITION accessor box.
 * glTF requires min/max on POSITION, so no mesh data is decoded and this needs
 * no dependencies -- it runs with plain node, no node_modules.
 *
 * Rest pose is deliberate: it is the closed window, which is what gets framed.
 *
 * It also reports, per system, the clip time at which the system's animated
 * channels deviate most from their opening value -- the "fully open" pose. That
 * is NOT the same for every system (louvre peaks near 1.0s, a revolving door at
 * 4.0s, everything else near 1.95s), which is why openTime is per system rather
 * than one module constant.
 *
 * Usage:
 *   node scripts/probe-window-glb.mjs
 *   node scripts/probe-window-glb.mjs --json      # machine-readable
 *   node scripts/probe-window-glb.mjs --unclaimed # list top nodes no group owns
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = resolve(here, "..", "public", "models", "animated-window-systems.glb");

/**
 * System id -> EXACT top-level node names (children of RootNode).
 *
 * Exact names, not prefixes. Prefix matching is unsafe in this model:
 *   "fixed"                 also matches "fixed_lattice"
 *   "Jalousie_narrow_fin1"  also matches "fin10".."fin18"
 * Every mesh in the file descends from exactly one of these top-level nodes,
 * so exact-name ancestry is both unambiguous and complete.
 *
 * Keep this table in sync with SYSTEMS in src/components/3d/window-system.ts.
 * src/test/window-3d.test.ts fails if the two drift.
 */
export const SYSTEM_ROOT = {
  /* Everything the site actually shows now comes from GLBs FourlinQ owns, baked
     by scripts/handoff/export-glb.mjs. What remains here is ONLY the two systems
     that were never reachable in the first place:

       pivot, revolving      no builder, and both are unconfirmed products, so
                             both are withheld from CATALOGUE_SYSTEM

     Louvre (narrow and wide), the 4-panel slider and the sliding / hung / awning
     grilles were the last shipped assemblies drawn from the licensed file, and
     all six now have builders. Leaving a replaced id here would make it defined
     by two models, which probe() reports as a problem rather than silently
     preferring one — that check is what caught this migration mid-flight. */
  pivot: ["pivoting_frame", "pivoting_panel", "pivoting_handle"],
  revolving: ["revolving_frame", "revolving_door"],

  /* Grille ("lattice") variants. Each is a COMPLETE alternate assembly sitting
     elsewhere in the scene, not an overlay on the plain system — so each needs
     its own center, scale and openTime, and the viewer swaps the whole visible
     set rather than adding meshes. They are systems here and in SYSTEMS, but
     the UI presents them as a Grille toggle on the base system, never as their
     own tab: a grille is an option on a casement, not a tenth kind of window. */
  "pivot-lattice": [
    "pivoting_lattice_frame",
    "pivoting_lattice_panel",
    "pivoting_lattice_window",
  ],
};

/* ─── GLB container ─── */

function readGlb(path) {
  const buffer = readFileSync(path);
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error(`not a GLB: ${path}`);
  const total = buffer.readUInt32LE(8);
  let offset = 12;
  let json = null;
  let bin = null;
  while (offset < total) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (type === 0x4e4f534a) json = JSON.parse(buffer.subarray(start, start + length).toString("utf8"));
    else if (type === 0x004e4942) bin = buffer.subarray(start, start + length);
    offset = start + length;
  }
  if (!json) throw new Error("GLB has no JSON chunk");
  return { json, bin };
}

/* ─── Column-major 4x4, glTF/three convention ─── */

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function multiply(a, b) {
  const out = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function localMatrix(node) {
  if (node.matrix) return node.matrix.slice();
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  const [qx, qy, qz, qw] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];
  const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz;
  const xx = qx * x2, xy = qx * y2, xz = qx * z2;
  const yy = qy * y2, yz = qy * z2, zz = qz * z2;
  const wx = qw * x2, wy = qw * y2, wz = qw * z2;
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

function transformPoint(m, [x, y, z]) {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

/* ─── Accessor reader (floats only; enough for animation channels) ─── */

function readAccessor(json, bin, index) {
  const accessor = json.accessors[index];
  const view = json.bufferViews[accessor.bufferView];
  const componentCount = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[accessor.type];
  const base = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const out = [];
  for (let i = 0; i < accessor.count; i++) {
    const tuple = [];
    for (let c = 0; c < componentCount; c++) {
      tuple.push(bin.readFloatLE(base + (i * componentCount + c) * 4));
    }
    out.push(componentCount === 1 ? tuple[0] : tuple);
  }
  return out;
}

/* ─── Main ─── */

/**
 * Measure every group in SYSTEM_ROOT against the GLB.
 *
 * Separated from printing so src/test/window-3d.test.ts can assert against the
 * real binary — the pinned numbers in window-system.ts, and which materials
 * each system actually carries — rather than against a hand-copied fixture.
 * Importing this module for SYSTEM_ROOT alone reads nothing and prints nothing.
 */
export function probeModel(modelPath, groupSpec) {


const { json, bin } = readGlb(modelPath);
const node = json.nodes ?? [];
const mesh = json.meshes ?? [];
const material = json.materials ?? [];

// The licensed model wraps everything in a "RootNode" (an FBX import artefact)
// and each system is one of its children. The handoff exports have no such
// wrapper — the scene's own nodes are the top level, and each file holds
// exactly one system. Both shapes reduce to "a list of top-level node names".
const rootNode = node.find((n) => n.name === "RootNode");
const sceneNode = json.scenes?.[json.scene ?? 0]?.nodes ?? [];
const topIndex = rootNode ? (rootNode.children ?? []) : sceneNode;
const topName = topIndex.map((i) => node[i].name ?? "");

// Expand the generated groups, then assert every group name is a real top node.
const group = {};
for (const [id, spec] of Object.entries(groupSpec)) {
  group[id] = typeof spec === "string" && spec.startsWith("@")
    ? topName.filter((n) => n.startsWith(spec.slice(1)))
    : spec;
}

const owner = new Map();
const problem = [];
for (const [id, names] of Object.entries(group)) {
  if (!names.length) problem.push(`group "${id}" matched no top-level node`);
  for (const name of names) {
    if (!topName.includes(name)) problem.push(`group "${id}" names "${name}", which is not a top-level node`);
    if (owner.has(name)) problem.push(`"${name}" claimed by both "${owner.get(name)}" and "${id}"`);
    owner.set(name, id);
  }
}

/* Bounding boxes, inheriting group ownership down the subtree exactly the way
   the component inherits visibility. */
const box = {};
/** group id -> the set of material names its meshes reference. */
const materialOf = {};
function walk(index, parentWorld, ownedBy) {
  const n = node[index];
  const world = multiply(parentWorld, localMatrix(n));
  const key = ownedBy ?? owner.get(n.name ?? "") ?? null;

  if (key && n.mesh !== undefined) {
    const entry = (box[key] ??= {
      min: [Infinity, Infinity, Infinity],
      max: [-Infinity, -Infinity, -Infinity],
      meshCount: 0,
    });
    for (const primitive of mesh[n.mesh].primitives ?? []) {
      if (primitive.material !== undefined) {
        (materialOf[key] ??= new Set()).add(material[primitive.material]?.name ?? "");
      }
      const position = primitive.attributes?.POSITION;
      if (position === undefined) continue;
      const accessor = json.accessors[position];
      if (!accessor?.min || !accessor?.max) continue;
      for (let corner = 0; corner < 8; corner++) {
        const point = transformPoint(world, [
          corner & 1 ? accessor.max[0] : accessor.min[0],
          corner & 2 ? accessor.max[1] : accessor.min[1],
          corner & 4 ? accessor.max[2] : accessor.min[2],
        ]);
        for (let axis = 0; axis < 3; axis++) {
          if (point[axis] < entry.min[axis]) entry.min[axis] = point[axis];
          if (point[axis] > entry.max[axis]) entry.max[axis] = point[axis];
        }
      }
      entry.meshCount++;
    }
  }
  for (const child of n.children ?? []) walk(child, world, key);
}
for (const root of json.scenes?.[json.scene ?? 0]?.nodes ?? []) walk(root, IDENTITY, null);

/* Open-pose time per system: for each animated node owned by a group, find the
   keyframe whose value is furthest from the channel's first value. */
const openTime = {};
const animation = json.animations?.[0];
if (animation && bin) {
  // node index -> owning group, resolved through ancestry.
  const groupOfNode = new Map();
  const assign = (index, ownedBy) => {
    const n = node[index];
    const key = ownedBy ?? owner.get(n.name ?? "") ?? null;
    if (key) groupOfNode.set(index, key);
    for (const c of n.children ?? []) assign(c, key);
  };
  // Walk from the wrapper when there is one, otherwise from each scene root.
  if (rootNode) assign(node.indexOf(rootNode), null);
  else for (const index of sceneNode) assign(index, null);

  for (const channel of animation.channels ?? []) {
    const target = channel.target?.node;
    const key = groupOfNode.get(target);
    if (key === undefined) continue;
    const sampler = animation.samplers[channel.sampler];
    const time = readAccessor(json, bin, sampler.input);
    const value = readAccessor(json, bin, sampler.output);
    if (!Array.isArray(value[0])) continue;
    const first = value[0];
    let bestTime = time[0];
    let bestDeviation = 0;
    for (let i = 0; i < time.length; i++) {
      const deviation = Math.hypot(...value[i].map((c, k) => c - first[k]));
      if (deviation > bestDeviation) { bestDeviation = deviation; bestTime = time[i]; }
    }
    if (bestDeviation < 1e-4) continue;
    (openTime[key] ??= []).push(bestTime);
  }
}

const round = (v, p = 4) => Math.round(v * 10 ** p) / 10 ** p;

// Canvas framing target. Window3D's camera sits at z=3.4 with fov=28, so the
// visible height at the model plane is 2 * 3.4 * tan(14deg) ~= 1.70 world
// units; filling ~80% of it means fitting the larger of width/height to ~1.36.
const FRAME_TARGET = 1.36;

const report = {};
for (const id of Object.keys(group)) {
  const entry = box[id];
  if (!entry || !entry.meshCount) { report[id] = null; continue; }
  const size = [0, 1, 2].map((a) => entry.max[a] - entry.min[a]);
  const center = [0, 1, 2].map((a) => (entry.max[a] + entry.min[a]) / 2);
  const peak = openTime[id] ?? [];
  report[id] = {
    size: size.map((v) => round(v)),
    center: center.map((v) => round(v)),
    scale: round(FRAME_TARGET / Math.max(size[0], size[1]), 4),
    meshCount: entry.meshCount,
    openTime: peak.length ? round(Math.max(...peak), 2) : 0,
    isOperable: peak.length > 0,
    material: [...(materialOf[id] ?? [])].sort(),
  };
}

return {
  model: modelPath,
  report,
  problem,
  materialName: material.map((m) => m.name ?? "").sort(),
  unclaimed: topName.filter((n) => !owner.has(n)),
  stat: {
    node: node.length,
    mesh: mesh.length,
    animation: json.animations?.length ?? 0,
  },
};

}

/* ─── Aggregate across every model the viewer can load ─── */

/** Directory of the per-system GLBs baked by scripts/handoff/export-glb.mjs. */
const HANDOFF_DIR = resolve(here, "..", "public", "models", "system");

/**
 * Measure the licensed multi-system model and every baked per-system file, and
 * merge them into one report keyed by system id.
 *
 * Two shapes, one output. The licensed GLB packs seventeen assemblies into one
 * file and needs SYSTEM_ROOT to say which nodes belong to which system; a baked
 * file holds exactly one system, so its group spec is just "everything at the
 * top level". Callers — the CLI and src/test/window-3d.test.ts — do not care
 * which file a system came from, only that its numbers are measured.
 */
export function probe() {
  const base = probeModel(MODEL_PATH, SYSTEM_ROOT);
  const report = { ...base.report };
  const problem = [...base.problem];
  const materialName = new Set(base.materialName);
  const source = Object.fromEntries(Object.keys(base.report).map((id) => [id, MODEL_PATH]));

  for (const file of readdirSync(HANDOFF_DIR, { withFileTypes: true })) {
    if (!file.isFile() || !file.name.endsWith(".glb")) continue;
    const id = file.name.replace(/\.glb$/, "");
    const path = resolve(HANDOFF_DIR, file.name);

    // Whole file = one system, so claim every top-level node it has.
    const { json } = readGlb(path);
    const top = (json.scenes?.[json.scene ?? 0]?.nodes ?? []).map((i) => json.nodes[i].name ?? "");
    const one = probeModel(path, { [id]: top });

    if (report[id]) problem.push(`system "${id}" is defined by two models`);
    report[id] = one.report[id];
    problem.push(...one.problem);
    for (const m of one.materialName) materialName.add(m);
    source[id] = path;
  }

  return {
    model: MODEL_PATH,
    report,
    problem,
    source,
    materialName: [...materialName].sort(),
    unclaimed: base.unclaimed,
    stat: base.stat,
  };
}

/* ─── CLI ─── */

function main() {
const { model, report, problem, materialName, unclaimed, stat, source } = probe();

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ model, report, problem, materialName, unclaimed }, null, 2));
} else {
  console.log(`model      ${model}`);
  console.log(`nodes ${stat.node}  meshes ${stat.mesh}  animations ${stat.animation}`);
  console.log("");
  console.log("system            center (scene space)            scale    openTime  operable");
  for (const [id, r] of Object.entries(report)) {
    if (!r) { console.log(`  ${id.padEnd(16)} NO MESH MATCHED`); continue; }
    console.log(
      `  ${id.padEnd(16)} [${r.center.join(", ").padEnd(28)}] ${String(r.scale).padEnd(8)} ${String(r.openTime).padEnd(9)} ${r.isOperable ? "yes" : "no"}`,
    );
  }
  if (process.argv.includes("--material")) {
    // Which materials each system carries, so the frame-finish set in
    // Window3D can be checked against the model rather than assumed. Anything
    // outside frame1/frame2/frame3 is left in its own colour by design.
    console.log(`\nmaterials in file: ${materialName.join(", ")}`);
    console.log("\nsystem            materials");
    for (const [id, r] of Object.entries(report)) {
      if (r) console.log(`  ${id.padEnd(16)} ${r.material.join(", ")}`);
    }
  }
  if (process.argv.includes("--unclaimed")) {
    console.log(`\nunclaimed top-level nodes (${unclaimed.length}):`);
    for (const n of unclaimed) console.log(`  ${n}`);
  }
}

if (problem.length) {
  console.error("\nPROBLEMS:");
  for (const p of problem) console.error(`  - ${p}`);
  process.exit(1);
}

}

// Only probe when invoked directly, not when imported.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

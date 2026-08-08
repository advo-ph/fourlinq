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
import { readFileSync } from "node:fs";
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
  casement: ["casement_frame", "casement_panelL", "casement_panelR"],
  "casement-2lite": [
    "casement_bridged_frame",
    "casement_bridged_panelL",
    "casement_bridged_panelR",
  ],
  awning: ["awning_frame", "awning_armature"],
  sliding: [
    "sliding_horizontal_frame",
    "sliding_horizontal_windowL",
    "sliding_horizontal_windowR",
  ],
  "sliding-4panel": [
    "sliding_horizontal_4panels_frame",
    "sliding_horizontal_4panels_windowL2",
    "sliding_horizontal_4panels_windowL1",
    "sliding_horizontal_4panels_windowR1",
    "sliding_horizontal_4panels_windowR2",
  ],
  hung: [
    "sliding_vertical_frame",
    "sliding_vertical_windowT",
    "sliding_vertical_windowB",
  ],
  "slide-and-fold": ["holding_frame", "holding_panels"],
  // Louvre fins are one top-level node each (18 narrow, 9 wide) plus a frame
  // and a control arm, so these lists are generated rather than written out.
  louvre: "@Jalousie_narrow_",
  "louvre-wide": "@Jalousie_wide_",
  fixed: ["fixed"],
  pivot: ["pivoting_frame", "pivoting_panel", "pivoting_handle"],
  revolving: ["revolving_frame", "revolving_door"],
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
 * Wrapped so that importing this module for SYSTEM_ROOT (the parity test in
 * src/test/window-3d.test.ts does) neither reads the GLB nor prints a report.
 */
function main() {


const { json, bin } = readGlb(MODEL_PATH);
const node = json.nodes ?? [];
const mesh = json.meshes ?? [];

const rootNode = node.find((n) => n.name === "RootNode");
if (!rootNode) throw new Error("expected a node named RootNode");
const topName = (rootNode.children ?? []).map((i) => node[i].name ?? "");

// Expand the generated groups, then assert every group name is a real top node.
const group = {};
for (const [id, spec] of Object.entries(SYSTEM_ROOT)) {
  group[id] = typeof spec === "string" && spec.startsWith("@")
    ? topName.filter((n) => n.startsWith(spec.slice(1)))
    : spec;
}

const owner = new Map();
const problem = [];
for (const [id, names] of Object.entries(group)) {
  if (!names.length) problem.push(`group "${id}" matched no top-level node`);
  for (const name of names) {
    if (!topName.includes(name)) problem.push(`group "${id}" names "${name}", which is not a child of RootNode`);
    if (owner.has(name)) problem.push(`"${name}" claimed by both "${owner.get(name)}" and "${id}"`);
    owner.set(name, id);
  }
}

/* Bounding boxes, inheriting group ownership down the subtree exactly the way
   the component inherits visibility. */
const box = {};
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
  (function assign(index, ownedBy) {
    const n = node[index];
    const key = ownedBy ?? owner.get(n.name ?? "") ?? null;
    if (key) groupOfNode.set(index, key);
    for (const c of n.children ?? []) assign(c, key);
  })(node.indexOf(rootNode), null);

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
  };
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ model: MODEL_PATH, report, problem }, null, 2));
} else {
  console.log(`model      ${MODEL_PATH}`);
  console.log(`nodes ${node.length}  meshes ${mesh.length}  animations ${json.animations?.length ?? 0}`);
  console.log("");
  console.log("system            center (scene space)            scale    openTime  operable");
  for (const [id, r] of Object.entries(report)) {
    if (!r) { console.log(`  ${id.padEnd(16)} NO MESH MATCHED`); continue; }
    console.log(
      `  ${id.padEnd(16)} [${r.center.join(", ").padEnd(28)}] ${String(r.scale).padEnd(8)} ${String(r.openTime).padEnd(9)} ${r.isOperable ? "yes" : "no"}`,
    );
  }
  if (process.argv.includes("--unclaimed")) {
    const unclaimed = topName.filter((n) => !owner.has(n));
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

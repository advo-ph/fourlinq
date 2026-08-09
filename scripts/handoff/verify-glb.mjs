/**
 * Sanity-check the baked GLBs without a browser.
 *
 *   node scripts/handoff/verify-glb.mjs
 *
 * The bake in export-glb.mjs samples `setOpen(t)` and keeps only channels that
 * move. That means a builder whose mechanism silently failed to animate would
 * still export a perfectly valid file — with an empty clip, or worse, a clip
 * whose channels move by a millimetre. `probe:glb` would report `openTime: 2`
 * and everything would look fine right up until someone clicked "Open door"
 * and nothing happened.
 *
 * So this reads each file's animation samplers back out and reports how far
 * things actually travel: the largest translation of any node, and the largest
 * rotation. A door leaf should swing tens of degrees; a slider should move
 * hundreds of millimetres. Anything under the thresholds below is reported as
 * a failure rather than a curiosity.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(here, "..", "..", "public", "models", "system");

/** Below these, an "operable" system is not meaningfully moving. */
const MIN_TRANSLATION_MM = 40;
const MIN_ROTATION_DEG = 8;

function readGlb(path) {
  const buffer = readFileSync(path);
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
  return { json, bin };
}

const COMPONENT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function readAccessor(json, bin, index) {
  const accessor = json.accessors[index];
  const view = json.bufferViews[accessor.bufferView];
  const size = COMPONENT[accessor.type];
  const base = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const out = [];
  for (let i = 0; i < accessor.count; i++) {
    const item = [];
    for (let c = 0; c < size; c++) {
      item.push(bin.readFloatLE(base + (i * size + c) * 4));
    }
    out.push(size === 1 ? item[0] : item);
  }
  return out;
}

/** Angle between two unit quaternions, in degrees. */
function quatAngle(a, b) {
  const dot = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
  return (2 * Math.acos(Math.min(1, dot)) * 180) / Math.PI;
}

const problem = [];
console.log("system               clip   nodes  max move   max turn");

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".glb"))) {
  const id = file.replace(/\.glb$/, "");
  const { json, bin } = readGlb(resolve(DIR, file));
  const animation = json.animations?.[0];

  if (!animation) {
    console.log(`  ${id.padEnd(20)} static`);
    continue;
  }

  let maxMove = 0;
  let maxTurn = 0;
  const moved = new Set();

  for (const channel of animation.channels ?? []) {
    const sampler = animation.samplers[channel.sampler];
    const value = readAccessor(json, bin, sampler.output);
    const path = channel.target?.path;
    if (path === "translation") {
      for (const v of value) {
        const d = Math.hypot(v[0] - value[0][0], v[1] - value[0][1], v[2] - value[0][2]);
        if (d > maxMove) maxMove = d;
      }
    } else if (path === "rotation") {
      for (const v of value) {
        const a = quatAngle(value[0], v);
        if (a > maxTurn) maxTurn = a;
      }
    }
    moved.add(channel.target?.node);
  }

  const moveMm = maxMove * 1000;
  console.log(
    `  ${id.padEnd(20)} ${String(animation.channels.length).padEnd(6)} ` +
      `${String(moved.size).padEnd(6)} ${`${moveMm.toFixed(0)} mm`.padEnd(10)} ${maxTurn.toFixed(1)}°`,
  );

  if (moveMm < MIN_TRANSLATION_MM && maxTurn < MIN_ROTATION_DEG) {
    problem.push(`${id}: clip exists but nothing moves meaningfully (${moveMm.toFixed(1)} mm / ${maxTurn.toFixed(1)}°)`);
  }
}

if (problem.length) {
  console.error("\nPROBLEMS:");
  for (const p of problem) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("\nall animated systems move.");

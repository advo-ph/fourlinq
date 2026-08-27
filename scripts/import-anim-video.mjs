/**
 * Imports a supplied animation video into the 28-frame WebP set that the nav
 * and system cards scrub on hover (see src/data/systemAnimations.ts).
 *
 * This is the counterpart to `bake-system-anim.mjs`, which RENDERS frames from
 * a GLB. Use this one only when the client supplies finished animation video
 * for a system and that video is the approved look. The output is written to
 * the same place and in the same format, so the two are interchangeable from
 * the player's point of view — the difference is provenance, and it matters:
 *
 *   WARNING: `bake-system-anim.mjs` will happily overwrite anything imported
 *   here, because it re-renders every id in its MODEL_FOR map. Any system
 *   listed in IMPORTED in src/data/systemAnimations.ts is video-sourced and a
 *   bake run would silently replace it with the GLB render. Check that list
 *   before running a full bake.
 *
 *   node scripts/import-anim-video.mjs <video> <system-id> [<video> <id> ...]
 *   node scripts/import-anim-video.mjs --dry ...      # contact sheet only
 *
 * Supplied clips do not carry 28 frames. They are resampled to exactly 28 by
 * nearest-source-index, which holds the first and last frame exactly and
 * duplicates a few in between. No motion interpolation is attempted: these are
 * sub-second clips scrubbed on hover, so a duplicated frame is invisible,
 * whereas an interpolated one can smear a frame edge against the white ground.
 *
 * Frames are written 01 = first video frame … 28 = last, matching the bake
 * script's closed → open convention. If a supplied clip runs open → closed,
 * do NOT reverse it here — add the id to REVERSED in systemAnimations.ts so
 * the files on disk keep one meaning.
 */
import sharp from "sharp";
import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Matches bake-system-anim.mjs exactly, so the two sources look like one set. */
const FRAME_COUNT = 28;
const WIDTH = 640;
const HEIGHT = 360;
const QUALITY = 80;
const EFFORT = 6;

const argv = process.argv.slice(2);
const dry = argv.includes("--dry");
const rest = argv.filter((a) => a !== "--dry");

if (rest.length === 0 || rest.length % 2 !== 0) {
  console.error("usage: node scripts/import-anim-video.mjs [--dry] <video> <system-id> [...]");
  process.exit(1);
}

const jobs = [];
for (let i = 0; i < rest.length; i += 2) jobs.push({ video: rest[i], id: rest[i + 1] });

/** Even sample of `n` source indices across `total`, holding both endpoints. */
const resample = (total, n) =>
  Array.from({ length: n }, (_, i) => Math.round((i * (total - 1)) / (n - 1)));

for (const { video, id } of jobs) {
  const tmp = await mkdir(path.join(os.tmpdir(), `anim-${id}-`), { recursive: true })
    .then(() => path.join(os.tmpdir(), `anim-${id}`))
    .then(async (d) => (await mkdir(d, { recursive: true }), d));

  // Decode every frame at native resolution first. Downscaling in ffmpeg and
  // again in sharp would soften the frame edges twice.
  await run("ffmpeg", ["-y", "-v", "error", "-i", video, path.join(tmp, "src-%04d.png")]);

  const src = (await readdir(tmp)).filter((f) => f.endsWith(".png")).sort();
  if (src.length < 2) throw new Error(`${video}: decoded ${src.length} frames`);

  const pick = resample(src.length, FRAME_COUNT);
  const webp = await Promise.all(
    pick.map(async (n) =>
      sharp(await readFile(path.join(tmp, src[n])))
        .resize({ width: WIDTH, height: HEIGHT, fit: "inside" })
        .flatten({ background: "#ffffff" })
        .webp({ quality: QUALITY, effort: EFFORT })
        .toBuffer(),
    ),
  );

  const dir = path.join(ROOT, "public/systems/anim", id);
  if (!dry) {
    await mkdir(dir, { recursive: true });
    // Clear first: a shorter set would otherwise leave orphan high-numbered
    // frames behind that the registry never reads but ship in the bundle.
    for (const f of await readdir(dir).catch(() => [])) {
      if (/^\d+\.webp$/.test(f)) await rm(path.join(dir, f));
    }
    await Promise.all(
      webp.map((buf, i) =>
        writeFile(path.join(dir, `${String(i + 1).padStart(2, "0")}.webp`), buf),
      ),
    );
  }

  // Six evenly spaced frames, so the middle of the sweep can be looked at
  // before 28 new binaries are committed.
  const sheetDir = path.join(ROOT, ".qa-film");
  await mkdir(sheetDir, { recursive: true });
  const tileW = 320;
  const six = await Promise.all(
    resample(FRAME_COUNT, 6).map((n) => sharp(webp[n]).resize({ width: tileW }).toBuffer()),
  );
  const meta = await sharp(six[0]).metadata();
  await sharp({
    create: {
      width: tileW * 6,
      height: meta.height,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite(six.map((input, i) => ({ input, left: i * tileW, top: 0 })))
    .png()
    .toFile(path.join(sheetDir, `import-${id}.png`));

  await rm(tmp, { recursive: true, force: true });

  const kb = Math.round(webp.reduce((a, b) => a + b.length, 0) / 1024);
  console.log(
    `  ${id.padEnd(20)} ${src.length} src → ${FRAME_COUNT} frames  ${kb} kB  → .qa-film/import-${id}.png${dry ? "  (dry)" : ""}`,
  );
}

/**
 * generate-project-thumbs.mjs
 *
 * Generates ~640px-wide WebP thumbnail variants for every JPEG/PNG in
 * public/images/projects-fb/. Thumbnails land in a mirrored sub-directory:
 *
 *   public/images/projects-fb/thumbs/<original-basename>.webp
 *
 * Path mapping (used identically in src/lib/project-thumbs.ts):
 *   /images/projects-fb/foo.jpg  →  /images/projects-fb/thumbs/foo.webp
 *
 * Idempotent: skips any thumb that already exists AND has an mtime newer
 * than the source file. Run manually via:
 *
 *   npm run projects:thumbs
 *
 * Also runs automatically as the "prebuild" npm hook before every
 * `npm run build`, including CI. The script exits 0 even if some files
 * cannot be processed (logs a warning per failure), so a single bad source
 * image never blocks the whole build.
 *
 * VERSION MANIFEST
 * After thumb generation this script also writes:
 *   src/generated/image-versions.json
 *
 * The manifest maps each projects-fb web path (original + thumb) to an
 * 8-character MD5 content hash of the source file. The hash is derived from
 * the original JPEG/PNG bytes so that regenerating a thumb for the SAME
 * unchanged source does not change the hash (hash stability = no phantom cache
 * busts). The frontend helper src/lib/image-version.ts uses this to append
 * ?v=<hash> to image URLs, which busts cached copies whenever the underlying
 * file is genuinely replaced.
 *
 * The manifest is committed to src/generated/ so it is available at dev-server
 * startup without an extra manual step, and is regenerated automatically before
 * every build (including CI) via the prebuild hook.
 */

import { createRequire } from "module";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "public", "images", "projects-fb");
const OUT_DIR = path.join(SRC_DIR, "thumbs");
const MANIFEST_DIR = path.join(ROOT, "src", "generated");
const MANIFEST_PATH = path.join(MANIFEST_DIR, "image-versions.json");

const THUMB_WIDTH = 640;
const THUMB_QUALITY = 78;

// Dynamic import of sharp so the script can report a clean error if it is
// somehow absent, rather than a cryptic module-not-found crash.
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("[thumbs] sharp is not installed. Run: npm install sharp");
  process.exit(1);
}

// Ensure output directory exists.
fs.mkdirSync(OUT_DIR, { recursive: true });

// Ensure manifest output directory exists.
fs.mkdirSync(MANIFEST_DIR, { recursive: true });

// Collect source images (top-level JPEGs/PNGs only — skip the thumbs dir itself).
const EXTS = new Set([".jpg", ".jpeg", ".png"]);
const sources = fs.readdirSync(SRC_DIR).filter((name) => {
  const ext = path.extname(name).toLowerCase();
  return EXTS.has(ext);
});

let generated = 0;
let skipped = 0;
let failed = 0;

for (const name of sources) {
  const srcPath = path.join(SRC_DIR, name);
  const baseName = path.basename(name, path.extname(name));
  const outPath = path.join(OUT_DIR, `${baseName}.webp`);

  // Skip if thumb exists and is newer than source.
  try {
    const srcStat = fs.statSync(srcPath);
    const outStat = fs.statSync(outPath);
    if (outStat.mtimeMs > srcStat.mtimeMs) {
      skipped++;
      continue;
    }
  } catch {
    // outPath does not exist yet — fall through to generate.
  }

  try {
    await sharp(srcPath)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(outPath);
    generated++;
  } catch (err) {
    console.warn(`[thumbs] WARN: failed to convert ${name}: ${err.message}`);
    failed++;
  }
}

console.log(
  `[thumbs] Done — generated: ${generated}, skipped (up-to-date): ${skipped}, failed: ${failed} (from ${sources.length} source images)`
);
if (failed > 0) {
  console.warn(`[thumbs] ${failed} image(s) failed to convert. Check warnings above.`);
}

// ── Version manifest generation ──────────────────────────────────────────────
//
// For each source image, compute an 8-char MD5 of the file bytes. The same
// hash is assigned to BOTH the original web path (/images/projects-fb/foo.jpg)
// and the thumb path (/images/projects-fb/thumbs/foo.webp), so callers can
// look up either path and get the same version token. This ensures the original
// and its thumb always carry the same ?v= parameter, so a browser that cached
// both under the old hash will refetch both after a regeneration.

console.log("[thumbs] Building version manifest…");

/** @type {Record<string, string>} */
const manifest = {};
const FB_WEB = "/images/projects-fb/";
const THUMB_WEB = "/images/projects-fb/thumbs/";

let manifestEntries = 0;
let manifestFailed = 0;

for (const name of sources) {
  const srcPath = path.join(SRC_DIR, name);
  try {
    const bytes = fs.readFileSync(srcPath);
    const hash = crypto.createHash("md5").update(bytes).digest("hex").slice(0, 8);

    const baseName = path.basename(name, path.extname(name));
    // Original path key (e.g. /images/projects-fb/foo.jpg)
    manifest[`${FB_WEB}${name}`] = hash;
    // Thumb path key (e.g. /images/projects-fb/thumbs/foo.webp)
    manifest[`${THUMB_WEB}${baseName}.webp`] = hash;
    manifestEntries++;
  } catch (err) {
    console.warn(`[thumbs] WARN: could not hash ${name}: ${err.message}`);
    manifestFailed++;
  }
}

// Write manifest as pretty-printed JSON with a header comment embedded in a
// top-level "_note" field (JSON has no comments; this is the next-best thing).
const output = {
  _note: "Auto-generated by scripts/generate-project-thumbs.mjs (prebuild). Do not edit manually.",
  ...manifest,
};

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(
  `[thumbs] Manifest written → src/generated/image-versions.json (${manifestEntries} image pairs, ${manifestFailed} failed)`
);

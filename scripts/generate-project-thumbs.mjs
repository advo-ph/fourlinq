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
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "public", "images", "projects-fb");
const OUT_DIR = path.join(SRC_DIR, "thumbs");

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

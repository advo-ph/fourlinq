// Re-runnable script: reorder each project's images in src/data/projects.ts so
// the FIRST image is the project's best exterior image (scores.exterior >= 50).
// If no image clears the exterior threshold, the first image is instead the
// project's best interior image (any score, pure maximum). Projects with a
// single image or no analysis data are left untouched.
//
// Selection rules (per-project):
//   1. Exterior candidates: images where scores.exterior >= THRESHOLD (50).
//      Best = highest exterior score; tiebreak: highest interior score; then
//      original position in webPaths order (earlier = wins).
//   2. If no exterior candidate exists, fallback: highest scores.interior
//      (any value); tiebreak: original position.
//   3. Single-image projects and projects without analysis data: skip.
//
// Run:
//   node scripts/reorder-project-images.mjs
//
// After running, resync the derived files:
//   npm run projects:extract
//   npm run projects:images

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "server", "data", "project-image-analysis.json");
const CANON = path.join(ROOT, "server", "data", "projects-images.json");
const PROJECTS_TS = path.join(ROOT, "src", "data", "projects.ts");

const THRESHOLD = 50;

// ── Load data ────────────────────────────────────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const canon = JSON.parse(fs.readFileSync(CANON, "utf8")); // [{ id, webPaths }]

// ── Compute best-first image per project ────────────────────────────────────
//
// Returns: { id, bestPath, reason } or null if project should be left alone.
const reorders = []; // projects that need reordering
const stats = { reordered: 0, alreadyCorrect: 0, fallbackInterior: 0, noData: 0, singleImage: 0 };

for (const c of canon) {
  const rec = manifest.projects[c.id];
  if (!rec || !rec.finished) {
    stats.noData++;
    continue;
  }
  if (c.webPaths.length <= 1) {
    stats.singleImage++;
    continue;
  }

  const scored = rec.images.filter((im) => im.scores);
  if (scored.length === 0) {
    stats.noData++;
    continue;
  }

  // 1. Try best exterior (score >= THRESHOLD).
  const exteriorCandidates = scored.filter((im) => (im.scores.exterior ?? 0) >= THRESHOLD);
  let bestPath = null;
  let reason = null;

  if (exteriorCandidates.length > 0) {
    exteriorCandidates.sort((a, b) => {
      const ed = (b.scores.exterior ?? 0) - (a.scores.exterior ?? 0);
      if (ed !== 0) return ed;
      const id2 = (b.scores.interior ?? 0) - (a.scores.interior ?? 0);
      if (id2 !== 0) return id2;
      return c.webPaths.indexOf(a.path) - c.webPaths.indexOf(b.path);
    });
    bestPath = exteriorCandidates[0].path;
    reason = `exterior (score ${exteriorCandidates[0].scores.exterior})`;
  } else {
    // 2. Fallback: best interior.
    const byCopy = [...scored].sort((a, b) => {
      const id2 = (b.scores.interior ?? 0) - (a.scores.interior ?? 0);
      if (id2 !== 0) return id2;
      return c.webPaths.indexOf(a.path) - c.webPaths.indexOf(b.path);
    });
    bestPath = byCopy[0].path;
    reason = `interior-fallback (score ${byCopy[0].scores.interior})`;
  }

  const currentFirst = c.webPaths[0];
  if (bestPath === currentFirst) {
    stats.alreadyCorrect++;
    continue;
  }

  if (reason.startsWith("exterior")) {
    stats.reordered++;
  } else {
    stats.fallbackInterior++;
  }

  reorders.push({ id: c.id, allPaths: c.webPaths, bestPath, reason });
}

// ── Rewrite src/data/projects.ts ────────────────────────────────────────────
//
// Strategy: read the file as text, then for each project that needs reordering
// find the `image:` and `gallery:` fields and splice the new order in.
//
// Pattern per project (approximately):
//   id: "some-id",
//   ...
//   image: `${FB}/SOMETHING.jpg`,
//   gallery: [
//     `${FB}/A.jpg`,
//     `${FB}/B.jpg`,
//   ],
//
// We locate the project block by finding `"id"` (or `id:`) with the value,
// then scan forward to rewrite the image/gallery lines. We operate on the raw
// string to preserve all comments, whitespace, and other fields verbatim.

let src = fs.readFileSync(PROJECTS_TS, "utf8");

for (const { id, allPaths, bestPath } of reorders) {
  // Locate the id declaration for this project. It may appear as:
  //   id: "some-id",  or  id: 'some-id',
  const idPattern = new RegExp(`id:\\s*["']${escapeRegex(id)}["']`);
  const idMatch = idPattern.exec(src);
  if (!idMatch) {
    console.warn(`WARN: could not locate id "${id}" in projects.ts — skipping`);
    continue;
  }

  // From the id position, find the `image:` line that follows.
  const afterId = src.slice(idMatch.index);

  // Match the image line: image: `${FB}/FILE.jpg`,
  // (possibly with a comment before/after or inline)
  const imageLinePattern = /image:\s*`([^`]+)`/;
  const imageMatch = imageLinePattern.exec(afterId);
  if (!imageMatch) {
    console.warn(`WARN: could not find image: field after id "${id}" — skipping`);
    continue;
  }

  const currentHeroPath = imageMatch[1].replace("${FB}", "/images/projects-fb");
  const currentHeroTemplate = imageMatch[1]; // raw template literal content

  // Build new path list: [bestPath, ...remaining in original order]
  const remaining = allPaths.filter((p) => p !== bestPath);
  const newAllPaths = [bestPath, ...remaining];

  // The bestPath in template-literal form
  const toTemplateLiteral = (p) => {
    const filename = path.basename(p);
    return `\${FB}/${filename}`;
  };

  const newHeroTemplate = toTemplateLiteral(bestPath);

  // Replace the image: field
  // The absolute position in src is idMatch.index + imageMatch.index
  const imageAbsStart = idMatch.index + imageMatch.index;
  const imageAbsEnd = imageAbsStart + imageMatch[0].length;

  src =
    src.slice(0, imageAbsStart) +
    `image: \`${newHeroTemplate}\`` +
    src.slice(imageAbsEnd);

  // After the image replacement, locate the gallery: field (if any).
  // Re-find from the (now updated) id position because offsets shifted.
  const afterIdUpdated = src.slice(idMatch.index);

  const galleryBlockPattern = /gallery:\s*\[([^\]]*)\]/s;
  const galleryMatch = galleryBlockPattern.exec(afterIdUpdated);

  if (newAllPaths.length > 1) {
    // We need gallery entries = newAllPaths[1..]
    const newGalleryEntries = newAllPaths.slice(1);
    const newGalleryLines = newGalleryEntries
      .map((p) => `      \`${toTemplateLiteral(p)}\`,`)
      .join("\n");
    const newGalleryBlock = `gallery: [\n${newGalleryLines}\n    ]`;

    if (galleryMatch) {
      // Replace the existing gallery block
      const galleryAbsStart = idMatch.index + galleryMatch.index;
      const galleryAbsEnd = galleryAbsStart + galleryMatch[0].length;
      src =
        src.slice(0, galleryAbsStart) +
        newGalleryBlock +
        src.slice(galleryAbsEnd);
    } else {
      // Project had no gallery but now needs one (shouldn't happen for multi-image
      // projects, but guard anyway). Insert after image: line.
      // Re-find image: again after the id
      const afterIdFinal = src.slice(idMatch.index);
      const imgFinalMatch = imageLinePattern.exec(afterIdFinal);
      if (imgFinalMatch) {
        const insertAt = idMatch.index + imgFinalMatch.index + imgFinalMatch[0].length;
        // Find the end of that line (after the comma)
        const lineEnd = src.indexOf("\n", insertAt);
        src =
          src.slice(0, lineEnd + 1) +
          `    ${newGalleryBlock},\n` +
          src.slice(lineEnd + 1);
      }
    }
  } else {
    // New hero is the only image; remove gallery if present
    if (galleryMatch) {
      const galleryAbsStart = idMatch.index + galleryMatch.index;
      // Find the full gallery property including the trailing comma + newline
      // Adjust to remove from the line start
      const beforeGallery = src.slice(0, galleryAbsStart);
      const lastNewline = beforeGallery.lastIndexOf("\n");
      const lineStart = lastNewline + 1;
      const afterGalleryContent = src.slice(galleryAbsStart + galleryMatch[0].length);
      // Remove trailing comma if present
      const trailingCommaMatch = /^,/.exec(afterGalleryContent.trimStart());
      const afterGalleryBlock = trailingCommaMatch
        ? afterGalleryContent.replace(/,/, "")
        : afterGalleryContent;
      src = src.slice(0, lineStart) + afterGalleryBlock;
    }
  }

  console.log(`  ${id}: first image → ${path.basename(bestPath)}`);
}

// ── Write updated file ───────────────────────────────────────────────────────
fs.writeFileSync(PROJECTS_TS, src, "utf8");

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nReorder complete.`);
console.log(`  Reordered (exterior first): ${stats.reordered}`);
console.log(`  Fallback to interior first: ${stats.fallbackInterior}`);
console.log(`  Already correct:            ${stats.alreadyCorrect}`);
console.log(`  Single-image (skipped):     ${stats.singleImage}`);
console.log(`  No data (skipped):          ${stats.noData}`);
console.log(`\nNext: npm run projects:extract && npm run projects:images`);

// ── Helpers ──────────────────────────────────────────────────────────────────
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

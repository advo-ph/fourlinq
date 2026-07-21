// Deterministic generator: merge the AI image-analysis shards into a durable
// manifest, then derive the per-category "best image" + category membership
// and emit the frontend data file. NO AI here — pure transform, so re-tuning
// THRESHOLD or swapping an enhanced image at the same path only needs a re-run
// of this script (the AI scores in the manifest are the durable "embedding").
//
//   node scripts/build-project-category-images.mjs
//
// Inputs:
//   server/data/projects-images.json         (canonical id + image order)
//   server/data/_analysis/part-*.json         (AI shard outputs)  [optional if manifest exists]
//   server/data/project-image-analysis.json   (existing manifest) [optional]
// Outputs:
//   server/data/project-image-analysis.json          (merged manifest, source of truth)
//   server/data/project-image-analysis-report.md      (human spot-check report)
//   src/data/project-category-images.generated.ts     (frontend data)

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "server", "data");
const CANON = path.join(DATA, "projects-images.json");
const PARTS_DIR = path.join(DATA, "_analysis");
const MANIFEST = path.join(DATA, "project-image-analysis.json");
const REPORT = path.join(DATA, "project-image-analysis-report.md");
const GENERATED = path.join(ROOT, "src", "data", "project-category-images.generated.ts");

// A category qualifies for a project only if its best image scores at least
// this. Below it: no image for that category, project drops out of that filter.
// Tunable — re-running this script re-derives membership with zero re-analysis.
const THRESHOLD = 50;
const CATEGORIES = ["windows", "doors", "interior", "exterior"];

const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

// ── canonical project → image order ──────────────────────────────────────
const canon = readJSON(CANON); // [{ id, webPaths, diskPaths, missing }]
const canonById = new Map(canon.map((c) => [c.id, c.webPaths]));

// ── load existing manifest (incremental base) ────────────────────────────
const manifest = fs.existsSync(MANIFEST)
  ? readJSON(MANIFEST)
  : { version: 1, threshold: THRESHOLD, projects: {} };
manifest.threshold = THRESHOLD;

// ── merge shard parts over the manifest ──────────────────────────────────
const dupes = [];
const partFiles = fs.existsSync(PARTS_DIR)
  ? fs.readdirSync(PARTS_DIR).filter((f) => /^part-\d+\.json$/.test(f)).sort()
  : [];

for (const f of partFiles) {
  const part = readJSON(path.join(PARTS_DIR, f));
  for (const proj of part.projects ?? []) {
    if (!canonById.has(proj.id)) {
      dupes.push(`  UNKNOWN id "${proj.id}" in ${f} (not in catalog) — skipped`);
      continue;
    }
    if (manifest.projects[proj.id]?.finished) {
      // Already have it (earlier part or prior run) — keep first, note dupe.
      dupes.push(`  duplicate "${proj.id}" in ${f} — kept existing`);
      continue;
    }
    // Index scores by path; keep canonical order.
    const byPath = new Map(proj.images.map((im) => [im.path, im]));
    const images = canonById.get(proj.id).map((wp) => {
      const im = byPath.get(wp);
      return im
        ? { path: wp, scores: im.scores, reasoning: im.reasoning ?? "" }
        : { path: wp, scores: null, reasoning: "MISSING SCORE" };
    });
    manifest.projects[proj.id] = { finished: true, images };
  }
}

// ── merge hero-quality parts (portfolio-cover score + enhanced flag) ──────
const QUALITY_DIR = path.join(DATA, "_quality");
const qualityFiles = fs.existsSync(QUALITY_DIR)
  ? fs.readdirSync(QUALITY_DIR).filter((f) => /^part-\d+\.json$/.test(f)).sort()
  : [];
for (const f of qualityFiles) {
  const part = readJSON(path.join(QUALITY_DIR, f));
  for (const q of part.projects ?? []) {
    if (!canonById.has(q.id)) { dupes.push(`  UNKNOWN quality id "${q.id}" in ${f} — skipped`); continue; }
    const rec = manifest.projects[q.id];
    if (!rec) { dupes.push(`  quality "${q.id}" in ${f} has no analysis record — skipped`); continue; }
    if (rec.quality) { dupes.push(`  duplicate quality "${q.id}" in ${f} — kept existing`); continue; }
    rec.quality = {
      heroImage: q.heroImage,
      heroScore: q.heroScore ?? 0,
      enhanced: !!q.enhanced,
      enhancedConfidence: q.enhancedConfidence ?? 0,
      notes: q.notes ?? "",
    };
  }
}
const missingQuality = canon
  .filter((c) => manifest.projects[c.id]?.finished && !manifest.projects[c.id]?.quality)
  .map((c) => c.id);

// ── coverage check against the catalog ───────────────────────────────────
const missing = canon.filter((c) => !manifest.projects[c.id]?.finished).map((c) => c.id);
const unscored = []; // project/image pairs the AI never scored
for (const c of canon) {
  const rec = manifest.projects[c.id];
  if (!rec) continue;
  for (const im of rec.images) if (!im.scores) unscored.push(`${c.id} → ${im.path}`);
}

// ── derive best-image-per-category + membership ──────────────────────────
const bestImages = {};
const derivedTags = {};
const keptScore = {}; // id -> { cat: score of the chosen image } — used for per-category ordering
const reportRows = [];

for (const c of canon) {
  const rec = manifest.projects[c.id];
  if (!rec) continue;
  const per = {};
  const tags = [];
  for (const cat of CATEGORIES) {
    let best = null;
    for (const im of rec.images) {
      if (!im.scores) continue;
      const s = im.scores[cat] ?? 0;
      if (!best || s > best.score) best = { path: im.path, score: s };
    }
    if (best && best.score >= THRESHOLD) {
      per[cat] = best.path;
      tags.push(cat);
      (keptScore[c.id] ??= {})[cat] = best.score;
      reportRows.push({ id: c.id, cat, file: best.path.split("/").pop(), score: best.score, kept: true });
    } else if (best) {
      reportRows.push({ id: c.id, cat, file: best.path.split("/").pop(), score: best.score, kept: false });
    }
  }
  bestImages[c.id] = per;
  derivedTags[c.id] = tags;
}

// ── write manifest ───────────────────────────────────────────────────────
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

// ── write generated frontend data ────────────────────────────────────────
const covered = canon.filter((c) => manifest.projects[c.id]?.finished);
const ci = {};
const dt = {};
for (const c of covered) {
  ci[c.id] = bestImages[c.id];
  dt[c.id] = derivedTags[c.id];
}

// ── ordering: best pictures first ────────────────────────────────────────
const heroScore = (id) => manifest.projects[id]?.quality?.heroScore ?? 0;
const isEnhanced = (id) => (manifest.projects[id]?.quality?.enhanced ? 1 : 0);
const origIdx = new Map(canon.map((c, i) => [c.id, i])); // stable tiebreak

// "All projects" view: best hero photo first, enhanced wins ties.
const projectOrder = covered
  .map((c) => c.id)
  .sort((a, b) => heroScore(b) - heroScore(a) || isEnhanced(b) - isEnhanced(a) || origIdx.get(a) - origIdx.get(b));

// Each category view: the project's best image FOR THAT category first,
// hero quality breaks ties.
const projectCategoryOrder = {};
for (const cat of CATEGORIES) {
  projectCategoryOrder[cat] = covered
    .map((c) => c.id)
    .filter((id) => derivedTags[id]?.includes(cat))
    .sort(
      (a, b) =>
        (keptScore[b]?.[cat] ?? 0) - (keptScore[a]?.[cat] ?? 0) ||
        heroScore(b) - heroScore(a) ||
        origIdx.get(a) - origIdx.get(b)
    );
}

const ts = `// AUTO-GENERATED by scripts/build-project-category-images.mjs — DO NOT EDIT.
// Source of truth: server/data/project-image-analysis.json (AI vision scores).
// Regenerate: node scripts/build-project-category-images.mjs
//
// Per-category "best image" and image-derived category membership for the
// /inspiration gallery. A category is present for a project only when its best
// image scored >= ${THRESHOLD}/100 for that category.
import type { InspirationTag } from "./projects";

export type CategoryImages = Partial<Record<InspirationTag, string>>;

/** projectId -> best image path for each category the project qualifies for. */
export const projectCategoryImages: Record<string, CategoryImages> = ${JSON.stringify(ci, null, 2)};

/** projectId -> categories the project belongs to (derived from its images). */
export const projectDerivedTags: Record<string, InspirationTag[]> = ${JSON.stringify(dt, null, 2)};

/** "All projects" order — best hero photo first (AI hero-quality score, enhanced wins ties). */
export const projectOrder: string[] = ${JSON.stringify(projectOrder, null, 2)};

/** Per-category order — each project's best image FOR THAT category first. */
export const projectCategoryOrder: Record<InspirationTag, string[]> = ${JSON.stringify(projectCategoryOrder, null, 2)};
`;
fs.writeFileSync(GENERATED, ts);

// ── write spot-check report ──────────────────────────────────────────────
let md = `# Project image analysis — spot check\n\n`;
md += `Threshold: **${THRESHOLD}/100** (a category is kept only if its best image clears this).\n\n`;
md += `Projects analyzed: **${covered.length}/${canon.length}**`;
if (missing.length) md += ` — MISSING (fell back to hand tags): ${missing.join(", ")}`;
md += `\n`;
md += `Hero-quality rated: **${covered.length - missingQuality.length}/${covered.length}**`;
if (missingQuality.length) md += ` — MISSING quality (ordered last): ${missingQuality.join(", ")}`;
md += `\n\n`;

// Gallery order (best hero first) — the "All projects" ordering.
md += `## Gallery order — "All projects" (best hero first)\n\n`;
md += `| # | Project | Hero score | Enhanced | Notes |\n|---:|---|---:|:--:|---|\n`;
projectOrder.forEach((id, i) => {
  const q = manifest.projects[id]?.quality;
  md += `| ${i + 1} | ${id} | ${q?.heroScore ?? "—"} | ${q?.enhanced ? "✨" : "—"} | ${q?.notes ?? ""} |\n`;
});
md += `\n## Per-category selection\n\n`;
md += `| Project | Category | Chosen file | Score | Kept? |\n|---|---|---|---:|:--:|\n`;
for (const r of reportRows.sort((a, b) => a.id.localeCompare(b.id) || a.cat.localeCompare(b.cat))) {
  md += `| ${r.id} | ${r.cat} | ${r.file} | ${r.score} | ${r.kept ? "✅" : "—"} |\n`;
}
if (dupes.length) md += `\n## Merge notes\n\n${dupes.map((d) => "- " + d.trim()).join("\n")}\n`;
if (unscored.length) md += `\n## Unscored images\n\n${unscored.map((u) => "- " + u).join("\n")}\n`;
fs.writeFileSync(REPORT, md);

// ── console summary ──────────────────────────────────────────────────────
console.log(`Manifest:  ${MANIFEST}`);
console.log(`Generated: ${GENERATED}`);
console.log(`Report:    ${REPORT}`);
console.log(`Covered: ${covered.length}/${canon.length} projects`);
console.log(`Hero-quality: ${covered.length - missingQuality.length}/${covered.length} rated`);
if (dupes.length) console.log(`Merge notes: ${dupes.length} (see report)`);
if (missing.length) {
  console.log(`MISSING analysis (${missing.length}): ${missing.join(", ")}`);
  process.exitCode = 2;
}
if (missingQuality.length) {
  console.log(`MISSING quality (${missingQuality.length}): ${missingQuality.join(", ")}`);
  process.exitCode = 2;
}
if (unscored.length) console.log(`UNSCORED IMAGES (${unscored.length}): see report`);

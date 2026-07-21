// One-off: emit a machine-readable map of project -> image paths for the
// AI image-analysis fan-out. Reads the canonical project catalog so the
// image lists are never hand-transcribed.
//
//   npx tsx scripts/extract-project-images.ts
//
// Output: server/data/projects-images.json
//   [{ id, webPaths: string[], diskPaths: string[], missing: string[] }]
// preserving projects.ts file order.

import fs from "node:fs";
import path from "node:path";
import { projects } from "../src/data/projects.ts";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "server", "data");
const OUT_FILE = path.join(OUT_DIR, "projects-images.json");

fs.mkdirSync(OUT_DIR, { recursive: true });

const rows = projects.map((p) => {
  const webPaths = [p.image, ...(p.gallery ?? [])];
  const diskPaths = webPaths.map((w) => path.join(ROOT, "public", w));
  const missing = webPaths.filter((w) => !fs.existsSync(path.join(ROOT, "public", w)));
  return { id: p.id, webPaths, diskPaths, missing };
});

fs.writeFileSync(OUT_FILE, JSON.stringify(rows, null, 2) + "\n");

const totalImages = rows.reduce((n, r) => n + r.webPaths.length, 0);
const missing = rows.flatMap((r) => r.missing);
console.log(`Wrote ${OUT_FILE}`);
console.log(`Projects: ${rows.length}  Images: ${totalImages}  Missing on disk: ${missing.length}`);
if (missing.length) {
  console.log("MISSING FILES:");
  for (const m of missing) console.log("  " + m);
}

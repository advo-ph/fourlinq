/**
 * derive-project-ratios.mjs
 *
 * Measures every project image from server/data/project-image-analysis.json
 * using sharp, derives an aspect-ratio vote per project, and (with --apply)
 * writes project_ratio + image_flagged overrides to the production DB via the
 * admin API.
 *
 * Classification spec:
 *   - Portrait (height > width) → image_flagged; EXCLUDED from ratio vote.
 *   - Landscape/square: r = width/height.
 *     16:9 if |ln(r) − ln(16/9)| < |ln(r) − ln(4/3)|, else 4:3.
 *   - Project ratio = majority vote among landscape images.
 *     Tie or zero landscape images → '4:3'.
 *
 * Usage:
 *   node scripts/derive-project-ratios.mjs             # dry-run (no network)
 *   BASE_URL=https://fourlinq.ph \
 *     ADMIN_EMAIL=dev@fourlinq.ph \
 *     ADMIN_PASSWORD=advodeveloper2026 \
 *     node scripts/derive-project-ratios.mjs --apply   # write to prod DB
 *
 * npm script: projects:ratios
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "server", "data", "project-image-analysis.json");
const PUBLIC_DIR = path.join(ROOT, "public");

const APPLY = process.argv.includes("--apply");

// ── sharp ─────────────────────────────────────────────────────────────────────

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("[ratios] sharp is not installed. Run: npm install sharp");
  process.exit(1);
}

// ── Classification helpers ────────────────────────────────────────────────────

const LN_16_9 = Math.log(16 / 9);
const LN_4_3 = Math.log(4 / 3);

/**
 * Classify a landscape/square image ratio as '16:9' or '4:3'.
 * Nearest neighbour in log-ratio space.
 */
function classifyRatio(width, height) {
  const r = width / height;
  const lnR = Math.log(r);
  return Math.abs(lnR - LN_16_9) < Math.abs(lnR - LN_4_3) ? "16:9" : "4:3";
}

// ── Measure images ────────────────────────────────────────────────────────────

async function measureImage(webPath) {
  const filePath = path.join(PUBLIC_DIR, webPath);
  const { width, height } = await sharp(filePath).metadata();
  return { width, height };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const projects = manifest.projects;

  console.log(`[ratios] Loaded ${Object.keys(projects).length} projects from manifest.`);
  if (APPLY) {
    const base = process.env.BASE_URL;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!base || !email || !password) {
      console.error("[ratios] --apply requires BASE_URL, ADMIN_EMAIL, and ADMIN_PASSWORD env vars.");
      process.exit(1);
    }
  }

  // ── Results accumulator ────────────────────────────────────────────────────

  /** @type {Array<{slug:string, ratio:'16:9'|'4:3', votes169:number, votes43:number, portrait:string[]}>} */
  const results = [];

  // Two locally-modified images to report explicitly
  const FLAGGED_LOCALS = new Set([
    "/images/projects-fb/mbArIDA5.jpg",
    "/images/projects-fb/yDrxH9L-.jpg",
  ]);
  const localDims = {};

  for (const [slug, rec] of Object.entries(projects)) {
    let votes169 = 0;
    let votes43 = 0;
    const portrait = [];

    for (const im of rec.images) {
      let dims;
      try {
        dims = await measureImage(im.path);
      } catch (err) {
        console.warn(`[ratios] WARN: cannot measure ${im.path}: ${err.message}`);
        continue;
      }

      // Track locally-modified images
      if (FLAGGED_LOCALS.has(im.path)) {
        localDims[im.path] = dims;
      }

      const { width, height } = dims;
      if (height > width) {
        // Portrait — flag, exclude from ratio vote
        portrait.push(im.path);
      } else {
        // Landscape or square — vote
        const bucket = classifyRatio(width, height);
        if (bucket === "16:9") votes169++;
        else votes43++;
      }
    }

    // Majority vote; tie or zero landscape → 4:3
    let ratio;
    if (votes169 > votes43) {
      ratio = "16:9";
    } else {
      ratio = "4:3";
    }

    results.push({ slug, ratio, votes169, votes43, portrait });
  }

  // ── Print table ────────────────────────────────────────────────────────────

  console.log(
    "\n" +
    "slug".padEnd(45) +
    "ratio".padEnd(8) +
    "16:9-v".padEnd(8) +
    "4:3-v".padEnd(8) +
    "portrait images"
  );
  console.log("-".repeat(120));

  let total169 = 0;
  let total43 = 0;
  let totalPortrait = 0;

  for (const r of results) {
    if (r.ratio === "16:9") total169++;
    else total43++;
    totalPortrait += r.portrait.length;

    const portraitList = r.portrait.length > 0
      ? r.portrait.map((p) => path.basename(p)).join(", ")
      : "";

    console.log(
      r.slug.padEnd(45) +
      r.ratio.padEnd(8) +
      String(r.votes169).padEnd(8) +
      String(r.votes43).padEnd(8) +
      portraitList
    );
  }

  console.log("-".repeat(120));
  console.log(
    `TOTALS: ${results.length} projects — ${total169} × 16:9, ${total43} × 4:3 | ${totalPortrait} portrait images flagged`
  );

  // ── Report locally-modified images ────────────────────────────────────────

  console.log("\n[ratios] Locally-modified images (vs prod):");
  for (const [p, dims] of Object.entries(localDims)) {
    const orientation = dims.height > dims.width ? "PORTRAIT" : classifyRatio(dims.width, dims.height);
    console.log(`  ${p}: ${dims.width}x${dims.height} → ${orientation}`);
  }
  for (const p of FLAGGED_LOCALS) {
    if (!localDims[p]) {
      console.log(`  ${p}: NOT FOUND in manifest (not listed in any project)`);
    }
  }

  if (!APPLY) {
    console.log(
      "\n[ratios] Dry-run complete. Re-run with --apply (and env vars) to write to DB."
    );
    return;
  }

  // ── Apply: login and write overrides ─────────────────────────────────────

  const BASE_URL = process.env.BASE_URL.replace(/\/$/, "");
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  console.log(`\n[ratios] Logging in to ${BASE_URL} ...`);

  // Login — retrieve session cookie
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.error(`[ratios] Login failed: ${loginRes.status} ${text}`);
    process.exit(1);
  }

  // Extract Set-Cookie header
  const setCookieHeaders = loginRes.headers.getSetCookie
    ? loginRes.headers.getSetCookie()
    : [loginRes.headers.get("set-cookie")].filter(Boolean);

  if (setCookieHeaders.length === 0) {
    console.error("[ratios] Login succeeded but no session cookie returned.");
    process.exit(1);
  }

  // Build a cookie string with just the name=value pairs (strip attributes)
  const cookieStr = setCookieHeaders
    .map((h) => h.split(";")[0].trim())
    .join("; ");

  console.log(`[ratios] Login OK. Writing overrides...`);

  let ratioOk = 0;
  let ratioFail = 0;
  let flagOk = 0;
  let flagFail = 0;

  const OVERRIDES_URL = `${BASE_URL}/api/admin/project-images/overrides`;

  async function postOverride(body) {
    const res = await fetch(OVERRIDES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStr,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text}`);
    }
    return res.json();
  }

  // Write project_ratio for every project
  console.log(`\n[ratios] Writing ${results.length} project_ratio overrides...`);
  for (const r of results) {
    try {
      await postOverride({
        project_id: r.slug,
        image_path: "__project__",
        override_type: "project_ratio",
        value_text: r.ratio,
      });
      console.log(`  OK  project_ratio  ${r.slug} → ${r.ratio}`);
      ratioOk++;
    } catch (err) {
      console.error(`  FAIL project_ratio  ${r.slug}: ${err.message}`);
      ratioFail++;
    }
  }

  // Write image_flagged for every portrait image
  const portraitEntries = results.flatMap((r) =>
    r.portrait.map((imgPath) => ({ slug: r.slug, imgPath }))
  );
  console.log(`\n[ratios] Writing ${portraitEntries.length} image_flagged overrides...`);
  for (const { slug, imgPath } of portraitEntries) {
    try {
      await postOverride({
        project_id: slug,
        image_path: imgPath,
        override_type: "image_flagged",
      });
      console.log(`  OK  image_flagged  ${slug} : ${path.basename(imgPath)}`);
      flagOk++;
    } catch (err) {
      console.error(`  FAIL image_flagged  ${slug} : ${imgPath}: ${err.message}`);
      flagFail++;
    }
  }

  console.log(`
[ratios] Apply summary:
  project_ratio : ${ratioOk} written, ${ratioFail} failed
  image_flagged : ${flagOk} written, ${flagFail} failed
`);

  if (ratioFail > 0 || flagFail > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[ratios] Fatal:", err);
  process.exit(1);
});

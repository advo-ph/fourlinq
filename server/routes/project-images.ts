/**
 * project-images.ts — public merged API + admin override CRUD for /inspiration.
 *
 * Exports:
 *   projectImagesPublic  → mounted at /api/project-images (no auth)
 *   projectImagesAdmin   → mounted at /api/admin/project-images (requireRole gated in index.ts)
 *
 * Public endpoint:
 *   GET /api/project-images/merged
 *     Returns the file-based AI baseline merged with DB overrides.
 *     On DB failure: falls back to pure baseline (never returns 5xx).
 *     Cache-Control: public, max-age=30, stale-while-revalidate=300
 *
 * Admin endpoints:
 *   GET    /api/admin/project-images/overrides   — all override rows + stale flags
 *   POST   /api/admin/project-images/overrides   — UPSERT a single override
 *   DELETE /api/admin/project-images/overrides/:id — delete one override row
 *   GET    /api/admin/project-images/baseline     — full baseline with AI scores/reasoning
 */

import { Router } from "express";
import { resolve } from "path";
import fs from "fs";
import pool from "../db.js";

// ── SYNC: must match THRESHOLD in scripts/build-project-category-images.mjs ──
const THRESHOLD = 50;
const CATEGORIES = ["windows", "doors", "interior", "exterior"] as const;
type Category = typeof CATEGORIES[number];

// ── Types ─────────────────────────────────────────────────────────────────────

interface ImageScore {
  windows: number;
  doors: number;
  interior: number;
  exterior: number;
}

interface ManifestImage {
  path: string;
  scores: ImageScore | null;
  reasoning?: string;
}

interface ManifestQuality {
  heroImage: string;
  heroScore: number;
  enhanced: boolean;
  enhancedConfidence: number;
  notes: string;
}

interface ManifestProject {
  finished: boolean;
  images: ManifestImage[];
  quality?: ManifestQuality;
}

interface ManifestJson {
  version: number;
  threshold: number;
  projects: Record<string, ManifestProject>;
}

interface CanonEntry {
  id: string;
  webPaths: string[];
}

interface BaselineData {
  manifest: ManifestJson;
  canon: CanonEntry[];
  projectCategoryImages: Record<string, Partial<Record<Category, string>>>;
  projectDerivedTags: Record<string, Category[]>;
  projectOrder: string[];
  projectCategoryOrder: Record<Category, string[]>;
}

export interface MergedResponse {
  projectCategoryImages: Record<string, Partial<Record<Category, string>>>;
  projectDerivedTags: Record<string, Category[]>;
  projectOrder: string[];
  projectCategoryOrder: Record<Category, string[]>;
  hiddenImages: Record<string, string[]>;
  replacedImages: Record<string, Record<string, string>>;
  overrideCount: number;
  flaggedProjects: string[];
  hiddenProjects: string[];
  deletedProjects: string[];
  projectRatios: Record<string, string>;
}

interface OverrideRow {
  project_image_override_id: number;
  organization_id: number;
  project_id: string;
  image_path: string;
  override_type: string;
  category: string | null;
  value_text: string | null;
  value_int: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

// ── Baseline loader (module-level singleton with 60 s TTL) ───────────────────

const MANIFEST_PATH = resolve("server/data/project-image-analysis.json");
const CANON_PATH = resolve("server/data/projects-images.json");

let baselineCache: BaselineData | null = null;
let baselineCacheAt = 0;
const BASELINE_TTL_MS = 60_000;

function loadBaseline(forceRefresh = false): BaselineData {
  const now = Date.now();
  if (!forceRefresh && baselineCache && now - baselineCacheAt < BASELINE_TTL_MS) {
    return baselineCache;
  }

  const manifest: ManifestJson = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const canon: CanonEntry[] = JSON.parse(fs.readFileSync(CANON_PATH, "utf8"));

  const canonById = new Map(canon.map((c) => [c.id, c.webPaths]));

  // ── Derive best-image-per-category + membership (mirrors build-project-category-images.mjs) ──
  const projectCategoryImages: Record<string, Partial<Record<Category, string>>> = {};
  const projectDerivedTags: Record<string, Category[]> = {};
  const keptScore: Record<string, Partial<Record<Category, number>>> = {};

  const covered = canon.filter((c) => manifest.projects[c.id]?.finished);

  for (const c of covered) {
    const rec = manifest.projects[c.id];
    const per: Partial<Record<Category, string>> = {};
    const tags: Category[] = [];

    for (const cat of CATEGORIES) {
      let best: { path: string; score: number } | null = null;
      for (const im of rec.images) {
        if (!im.scores) continue;
        const s = im.scores[cat] ?? 0;
        if (!best || s > best.score) best = { path: im.path, score: s };
      }
      if (best && best.score >= THRESHOLD) {
        per[cat] = best.path;
        tags.push(cat);
        (keptScore[c.id] ??= {})[cat] = best.score;
      }
    }

    projectCategoryImages[c.id] = per;
    projectDerivedTags[c.id] = tags;
  }

  // ── Ordering (mirrors build-project-category-images.mjs) ──
  const heroScore = (id: string) => manifest.projects[id]?.quality?.heroScore ?? 0;
  const isEnhanced = (id: string) => (manifest.projects[id]?.quality?.enhanced ? 1 : 0);
  const origIdx = new Map(canon.map((c, i) => [c.id, i]));

  const projectOrder: string[] = covered
    .map((c) => c.id)
    .sort(
      (a, b) =>
        heroScore(b) - heroScore(a) ||
        isEnhanced(b) - isEnhanced(a) ||
        (origIdx.get(a) ?? 0) - (origIdx.get(b) ?? 0)
    );

  const projectCategoryOrder: Record<Category, string[]> = {} as Record<Category, string[]>;
  for (const cat of CATEGORIES) {
    projectCategoryOrder[cat] = covered
      .map((c) => c.id)
      .filter((id) => projectDerivedTags[id]?.includes(cat))
      .sort(
        (a, b) =>
          (keptScore[b]?.[cat] ?? 0) - (keptScore[a]?.[cat] ?? 0) ||
          heroScore(b) - heroScore(a) ||
          (origIdx.get(a) ?? 0) - (origIdx.get(b) ?? 0)
      );
  }

  baselineCache = { manifest, canon, projectCategoryImages, projectDerivedTags, projectOrder, projectCategoryOrder };
  baselineCacheAt = now;
  return baselineCache;
}

// ── Score override helper ──────────────────────────────────────────────────────

function getEffectiveScore(
  projectId: string,
  imagePath: string,
  cat: Category,
  baseScores: ImageScore | null,
  scoreOverrideMap: Map<string, Map<string, number>>
): number {
  const override = scoreOverrideMap.get(`${projectId}|${imagePath}`)?.get(cat);
  return override !== undefined ? override : (baseScores?.[cat] ?? 0);
}

// ── Merge algorithm ───────────────────────────────────────────────────────────

function buildMergedResponse(baseline: BaselineData, overrides: OverrideRow[]): MergedResponse {
  const { manifest, canon, projectCategoryImages, projectDerivedTags, projectOrder, projectCategoryOrder } = baseline;

  // Build override lookup maps
  const hiddenSet = new Set<string>(); // "projectId|imagePath"
  const replacedMap = new Map<string, string>(); // "projectId|imagePath" → newURL
  const bestForCategoryMap = new Map<string, string>(); // "projectId|category" → imagePath
  const projectOrderMap = new Map<string, number>(); // projectId → value_int
  const categoryOrderMap = new Map<string, Map<string, number>>(); // category → projectId → value_int
  const imageOrderMap = new Map<string, Map<string, number>>(); // projectId → imagePath → value_int
  const flaggedSet = new Set<string>(); // projectIds with project_flagged override
  const hiddenProjectSet = new Set<string>(); // projectIds with project_hidden override
  const deletedProjectSet = new Set<string>(); // projectIds with project_deleted override
  const projectRatioMap = new Map<string, string>(); // projectId → value_text ('16:9' | '4:3')
  const scoreOverrideMap = new Map<string, Map<string, number>>(); // "projectId|imagePath" → category → value_int

  for (const row of overrides) {
    switch (row.override_type) {
      case "hidden":
        hiddenSet.add(`${row.project_id}|${row.image_path}`);
        break;
      case "replaced":
        if (row.value_text) replacedMap.set(`${row.project_id}|${row.image_path}`, row.value_text);
        break;
      case "best_for_category":
        if (row.category) bestForCategoryMap.set(`${row.project_id}|${row.category}`, row.image_path);
        break;
      case "project_order":
        if (row.value_int !== null) projectOrderMap.set(row.project_id, row.value_int);
        break;
      case "category_order":
        if (row.category && row.value_int !== null) {
          if (!categoryOrderMap.has(row.category)) categoryOrderMap.set(row.category, new Map());
          categoryOrderMap.get(row.category)!.set(row.project_id, row.value_int);
        }
        break;
      case "image_order":
        if (row.value_int !== null) {
          if (!imageOrderMap.has(row.project_id)) imageOrderMap.set(row.project_id, new Map());
          imageOrderMap.get(row.project_id)!.set(row.image_path, row.value_int);
        }
        break;
      case "project_flagged":
        flaggedSet.add(row.project_id);
        break;
      case "project_hidden":
        hiddenProjectSet.add(row.project_id);
        break;
      case "project_deleted":
        deletedProjectSet.add(row.project_id);
        break;
      case "project_ratio":
        if (row.value_text) projectRatioMap.set(row.project_id, row.value_text);
        break;
      case "score_override":
        if (row.category && row.value_int !== null) {
          const key = `${row.project_id}|${row.image_path}`;
          if (!scoreOverrideMap.has(key)) scoreOverrideMap.set(key, new Map());
          scoreOverrideMap.get(key)!.set(row.category, row.value_int);
        }
        break;
      // image_flagged: no server-side action needed; purely a visual marker for admin
    }
  }

  // Resolve effective per-project data
  const effectiveCategoryImages: Record<string, Partial<Record<Category, string>>> = {};
  const effectiveDerivedTags: Record<string, Category[]> = {};
  const hiddenImages: Record<string, string[]> = {};
  const replacedImages: Record<string, Record<string, string>> = {};

  const coveredIds = canon.filter((c) => manifest.projects[c.id]?.finished).map((c) => c.id);

  // For public response: exclude deleted + hidden projects
  const publicCoveredIds = coveredIds.filter(
    (id) => !deletedProjectSet.has(id) && !hiddenProjectSet.has(id)
  );

  for (const projectId of coveredIds) {
    const baseImages = projectCategoryImages[projectId] ?? {};
    const baseTags = projectDerivedTags[projectId] ?? [];

    // Track hidden and replaced for this project (for admin response)
    const projHidden: string[] = [];
    const projReplaced: Record<string, string> = {};

    // Determine effective images (after hiding/replacing)
    const per: Partial<Record<Category, string>> = {};
    const tags: Category[] = [];

    for (const cat of CATEGORIES) {
      const overridePath = bestForCategoryMap.get(`${projectId}|${cat}`);

      if (overridePath) {
        // Admin explicitly set this image as best for this category
        // Apply hidden/replaced on top
        if (hiddenSet.has(`${projectId}|${overridePath}`)) {
          // The override image itself is hidden — fall back to base
          const basePath = baseImages[cat];
          if (basePath && !hiddenSet.has(`${projectId}|${basePath}`)) {
            per[cat] = replacedMap.get(`${projectId}|${basePath}`) ?? basePath;
            tags.push(cat);
          }
        } else {
          per[cat] = replacedMap.get(`${projectId}|${overridePath}`) ?? overridePath;
          tags.push(cat);
        }
      } else if (baseTags.includes(cat)) {
        const basePath = baseImages[cat];
        if (basePath) {
          if (!hiddenSet.has(`${projectId}|${basePath}`)) {
            per[cat] = replacedMap.get(`${projectId}|${basePath}`) ?? basePath;
            tags.push(cat);
          }
          // If best image is hidden, the project drops from that category
        }
      }
    }

    effectiveCategoryImages[projectId] = per;
    effectiveDerivedTags[projectId] = tags;

    // Collect hidden/replaced for admin response
    const rec = manifest.projects[projectId];
    if (rec) {
      for (const im of rec.images) {
        if (hiddenSet.has(`${projectId}|${im.path}`)) {
          projHidden.push(im.path);
        }
        const replURL = replacedMap.get(`${projectId}|${im.path}`);
        if (replURL) {
          projReplaced[im.path] = replURL;
        }
      }
    }

    if (projHidden.length > 0) hiddenImages[projectId] = projHidden;
    if (Object.keys(projReplaced).length > 0) replacedImages[projectId] = projReplaced;
  }

  // ── Sort projectOrder with overrides (public: exclude hidden + deleted) ──────
  // Projects with explicit position override land at their value_int slot;
  // the rest fill in the remaining slots in baseline order.
  const publicIdSet = new Set(publicCoveredIds);
  const basePublicOrder = projectOrder.filter((id) => publicIdSet.has(id));
  // Also filter the override map so deleted/hidden projects with project_order
  // overrides cannot be re-inserted into the public order by applyOrderOverrides.
  const publicProjectOrderMap = new Map([...projectOrderMap.entries()].filter(([id]) => publicIdSet.has(id)));
  const effectiveProjectOrder = applyOrderOverrides(basePublicOrder, publicProjectOrderMap);

  // ── Sort projectCategoryOrder with overrides (public: exclude hidden + deleted) ──
  const effectiveProjectCategoryOrder: Record<Category, string[]> = {} as Record<Category, string[]>;
  for (const cat of CATEGORIES) {
    const baseOrder = (projectCategoryOrder[cat] ?? []).filter((id) => publicIdSet.has(id));
    const overMap = categoryOrderMap.get(cat);
    const publicCatOverMap = overMap
      ? new Map([...overMap.entries()].filter(([id]) => publicIdSet.has(id)))
      : undefined;
    effectiveProjectCategoryOrder[cat] = publicCatOverMap
      ? applyOrderOverrides(baseOrder, publicCatOverMap)
      : baseOrder;
  }

  // Build projectRatios for public payload
  const projectRatios: Record<string, string> = {};
  for (const [id, ratio] of projectRatioMap.entries()) {
    projectRatios[id] = ratio;
  }

  return {
    projectCategoryImages: effectiveCategoryImages,
    projectDerivedTags: effectiveDerivedTags,
    projectOrder: effectiveProjectOrder,
    projectCategoryOrder: effectiveProjectCategoryOrder,
    hiddenImages,
    replacedImages,
    overrideCount: overrides.length,
    flaggedProjects: [...flaggedSet],
    hiddenProjects: [...hiddenProjectSet],
    deletedProjects: [...deletedProjectSet],
    projectRatios,
  };
}

/**
 * Applies integer position overrides to a base ordering.
 * Items with an explicit value_int are inserted at those positions (0-based).
 * Remaining items fill the gaps in their original relative order.
 */
function applyOrderOverrides(baseOrder: string[], overrideMap: Map<string, number>): string[] {
  if (overrideMap.size === 0) return baseOrder;

  const overriddenIds = new Set(overrideMap.keys());
  const unranked = baseOrder.filter((id) => !overriddenIds.has(id));
  const ranked = [...overrideMap.entries()].sort((a, b) => a[1] - b[1]);

  // Build result: insert overridden items at their target positions,
  // filling gaps with unranked items.
  const result: string[] = [...unranked];
  for (const [id, pos] of ranked) {
    const insertAt = Math.min(pos, result.length);
    result.splice(insertAt, 0, id);
  }
  return result;
}

// ── Stale detection ────────────────────────────────────────────────────────────

function isStale(baseline: BaselineData, row: OverrideRow): boolean {
  const { manifest } = baseline;
  const rec = manifest.projects[row.project_id];
  if (!rec) return true; // project not in baseline at all

  // Project-level override types use the '__project__' sentinel — only check project exists
  if (row.image_path === "__project__") return false;

  // Image-level: check that image_path exists in the project's image list
  return !rec.images.some((im) => im.path === row.image_path);
}

// ── Public Router ──────────────────────────────────────────────────────────────

export const projectImagesPublic = Router();

projectImagesPublic.get("/merged", async (req, res) => {
  const forceRefresh = req.query._r === "1";

  try {
    const baseline = loadBaseline(forceRefresh);

    let overrides: OverrideRow[] = [];
    try {
      const { rows } = await pool.query<OverrideRow>(
        `SELECT * FROM project_image_override WHERE organization_id = 1 ORDER BY project_id, override_type, value_int`
      );
      overrides = rows;
    } catch (dbErr) {
      // DB unreachable — log and fall through with empty overrides (pure baseline)
      console.error("[project-images] DB error on /merged — serving pure baseline:", dbErr instanceof Error ? dbErr.message : dbErr);
    }

    const merged = buildMergedResponse(baseline, overrides);

    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
    res.json(merged);
  } catch (err) {
    console.error("[project-images] /merged error:", err instanceof Error ? err.message : err);
    // Even baseline loading failed — return 500 (nothing we can serve)
    res.status(500).json({ error: "Failed to load project image data" });
  }
});

// ── Admin Router ───────────────────────────────────────────────────────────────

export const projectImagesAdmin = Router();

/**
 * GET /api/admin/project-images/overrides
 * Returns all override rows for org 1, with stale detection.
 */
projectImagesAdmin.get("/overrides", async (_req, res) => {
  try {
    const baseline = loadBaseline();
    const { rows } = await pool.query<OverrideRow>(
      `SELECT * FROM project_image_override
       WHERE organization_id = 1
       ORDER BY project_id, override_type, value_int NULLS LAST, project_image_override_id`
    );

    const withStale = rows.map((row) => ({
      ...row,
      stale: isStale(baseline, row),
    }));

    res.json({ overrides: withStale, total: withStale.length });
  } catch (err) {
    console.error("[project-images] GET /overrides error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Failed to load overrides" });
  }
});

/**
 * POST /api/admin/project-images/overrides
 * UPSERT a single override row.
 * Body: { project_id, image_path, override_type, category?, value_text?, value_int? }
 */
projectImagesAdmin.post("/overrides", async (req, res) => {
  try {
    const { project_id, image_path, override_type, category = null, value_text = null, value_int = null } = req.body ?? {};

    if (!project_id || !image_path || !override_type) {
      return res.status(400).json({ error: "project_id, image_path, and override_type are required" });
    }

    const validTypes = [
      "hidden", "replaced", "best_for_category",
      "project_order", "category_order", "image_order",
      "project_flagged", "project_hidden", "project_deleted",
      "project_ratio", "score_override", "image_flagged",
    ];
    if (!validTypes.includes(override_type)) {
      return res.status(400).json({ error: `Invalid override_type: ${override_type}` });
    }

    const validCategories = ["windows", "doors", "interior", "exterior", null];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    // Get the requesting user's ID from req.user (set by requireRole middleware)
    const createdBy = (req as { user?: { auth_user_id?: number } }).user?.auth_user_id ?? null;

    const { rows } = await pool.query<OverrideRow>(
      `INSERT INTO project_image_override
         (organization_id, project_id, image_path, override_type, category, value_text, value_int, created_by)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (organization_id, project_id, image_path, override_type, COALESCE(category, ''))
       DO UPDATE SET
         value_text = EXCLUDED.value_text,
         value_int  = EXCLUDED.value_int,
         updated_at = NOW()
       RETURNING *`,
      [project_id, image_path, override_type, category, value_text, value_int, createdBy]
    );

    res.json({ override: rows[0] });
  } catch (err) {
    console.error("[project-images] POST /overrides error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Failed to save override" });
  }
});

/**
 * DELETE /api/admin/project-images/overrides/:id
 * Hard-delete a single override row (restores baseline for that slot).
 */
projectImagesAdmin.delete("/overrides/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const { rowCount } = await pool.query(
      `DELETE FROM project_image_override WHERE project_image_override_id = $1 AND organization_id = 1`,
      [id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Override not found" });
    }

    res.json({ deleted: id });
  } catch (err) {
    console.error("[project-images] DELETE /overrides/:id error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Failed to delete override" });
  }
});

/**
 * DELETE /api/admin/project-images/overrides (bulk)
 * Body: { ids: number[] }
 */
projectImagesAdmin.delete("/overrides", async (req, res) => {
  try {
    const { ids } = req.body ?? {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array is required" });
    }

    const numIds = ids.map(Number).filter((n) => !isNaN(n));
    if (numIds.length === 0) {
      return res.status(400).json({ error: "No valid ids provided" });
    }

    const { rowCount } = await pool.query(
      `DELETE FROM project_image_override WHERE project_image_override_id = ANY($1::bigint[]) AND organization_id = 1`,
      [numIds]
    );

    res.json({ deleted: rowCount ?? 0 });
  } catch (err) {
    console.error("[project-images] DELETE /overrides (bulk) error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Failed to delete overrides" });
  }
});

/**
 * GET /api/admin/project-images/baseline
 * Returns the current baseline with all image paths, AI scores, and reasoning.
 * Also includes per-project flag/hidden/deleted/ratio state and per-image
 * effective scores (baseline scores merged with score_override rows).
 * Used by the admin UI to display AI context alongside overrides.
 */
projectImagesAdmin.get("/baseline", async (req, res) => {
  try {
    const forceRefresh = req.query._r === "1";
    const baseline = loadBaseline(forceRefresh);

    const { manifest, canon, projectCategoryImages, projectDerivedTags, projectOrder, projectCategoryOrder } = baseline;

    // Load all override rows to build project-level state maps and score overrides
    const { rows: overrideRows } = await pool.query<OverrideRow>(
      `SELECT * FROM project_image_override WHERE organization_id = 1`
    );

    // Build lookup maps from override rows
    const baselineFlaggedSet = new Set<string>();
    const baselineHiddenProjectSet = new Set<string>();
    const baselineDeletedProjectSet = new Set<string>();
    const baselineProjectRatioMap = new Map<string, string>();
    const baselineScoreOverrideMap = new Map<string, Map<string, number>>();

    for (const row of overrideRows) {
      switch (row.override_type) {
        case "project_flagged":
          baselineFlaggedSet.add(row.project_id);
          break;
        case "project_hidden":
          baselineHiddenProjectSet.add(row.project_id);
          break;
        case "project_deleted":
          baselineDeletedProjectSet.add(row.project_id);
          break;
        case "project_ratio":
          if (row.value_text) baselineProjectRatioMap.set(row.project_id, row.value_text);
          break;
        case "score_override":
          if (row.category && row.value_int !== null) {
            const key = `${row.project_id}|${row.image_path}`;
            if (!baselineScoreOverrideMap.has(key)) baselineScoreOverrideMap.set(key, new Map());
            baselineScoreOverrideMap.get(key)!.set(row.category, row.value_int);
          }
          break;
      }
    }

    // Build enriched project list with all images + scores + reasoning + new fields
    const projects = canon
      .filter((c) => manifest.projects[c.id]?.finished)
      .map((c) => {
        const rec = manifest.projects[c.id];
        return {
          id: c.id,
          images: rec.images.map((im) => ({
            path: im.path,
            scores: im.scores,
            reasoning: im.reasoning ?? "",
            effectiveScores: im.scores
              ? Object.fromEntries(
                  CATEGORIES.map((cat) => [
                    cat,
                    baselineScoreOverrideMap.get(`${c.id}|${im.path}`)?.get(cat)
                      ?? im.scores![cat] ?? 0,
                  ])
                ) as ImageScore
              : null,
          })),
          quality: rec.quality ?? null,
          categoryImages: projectCategoryImages[c.id] ?? {},
          derivedTags: projectDerivedTags[c.id] ?? [],
          flagged: baselineFlaggedSet.has(c.id),
          hidden: baselineHiddenProjectSet.has(c.id),
          deleted: baselineDeletedProjectSet.has(c.id),
          ratio: baselineProjectRatioMap.get(c.id) ?? "16:9",
        };
      });

    // 'private, no-cache' tells the browser to always revalidate with the server
    // before serving this response. The server has its own 60-second in-memory
    // cache (loadBaseline TTL), so revalidation is fast and override changes
    // (flag/hide/delete/ratio) are reflected immediately when the admin panel
    // invalidates and re-fetches. max-age=300 was causing the browser to serve
    // a stale cached response for 5 minutes, silently ignoring invalidation.
    res.setHeader("Cache-Control", "private, no-cache");
    res.json({
      projects,
      projectOrder,
      projectCategoryOrder,
    });
  } catch (err) {
    console.error("[project-images] GET /baseline error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Failed to load baseline" });
  }
});

/**
 * POST /api/admin/project-images/apply-exterior-first
 * Computes best-exterior-first image order for each project and bulk-UPSERTs
 * image_order override rows — only for projects that have no existing manual
 * image_order rows (to respect user reorders from the drag UI).
 */
projectImagesAdmin.post("/apply-exterior-first", async (_req, res) => {
  try {
    const baseline = loadBaseline();
    const { manifest, canon } = baseline;

    // Find which projects already have any image_order overrides (manual reorders)
    const { rows: existingOrder } = await pool.query<{ project_id: string }>(
      `SELECT DISTINCT project_id FROM project_image_override
       WHERE organization_id = 1 AND override_type = 'image_order'`
    );
    const alreadyOrdered = new Set(existingOrder.map((r) => r.project_id));

    let applied = 0;
    let skipped = 0;

    for (const c of canon) {
      if (alreadyOrdered.has(c.id)) { skipped++; continue; }
      const rec = manifest.projects[c.id];
      if (!rec?.finished || c.webPaths.length <= 1) continue;

      const scored = rec.images.filter((im) => im.scores);
      if (scored.length === 0) continue;

      // Compute best-exterior-first order (mirrors reorder-project-images.mjs logic)
      const exteriorCandidates = scored.filter((im) => (im.scores!.exterior ?? 0) >= THRESHOLD);
      let bestFirst: string | null = null;
      if (exteriorCandidates.length > 0) {
        bestFirst = exteriorCandidates.reduce((a, b) => {
          const extA = a.scores!.exterior ?? 0, extB = b.scores!.exterior ?? 0;
          if (extB !== extA) return extB > extA ? b : a;
          const intA = a.scores!.interior ?? 0, intB = b.scores!.interior ?? 0;
          return intB > intA ? b : a;
        }).path;
      } else {
        // Fallback: highest interior
        const byInterior = [...scored].sort((a, b) => (b.scores!.interior ?? 0) - (a.scores!.interior ?? 0));
        if (byInterior.length > 0) bestFirst = byInterior[0].path;
      }

      if (!bestFirst) continue;

      // Build ordered path list: bestFirst first, then remaining in original order
      const otherPaths = c.webPaths.filter((p) => p !== bestFirst);
      const orderedPaths = [bestFirst, ...otherPaths];

      // Bulk UPSERT image_order rows for this project
      const values = orderedPaths
        .map((p, idx) => `(1, '${c.id.replace(/'/g, "''")}', '${p.replace(/'/g, "''")}', 'image_order', NULL, NULL, ${idx})`)
        .join(",\n");

      await pool.query(
        `INSERT INTO project_image_override
           (organization_id, project_id, image_path, override_type, category, value_text, value_int)
         VALUES ${values}
         ON CONFLICT (organization_id, project_id, image_path, override_type, COALESCE(category, ''))
         DO UPDATE SET value_int = EXCLUDED.value_int, updated_at = NOW()`
      );
      applied++;
    }

    res.json({ applied, skipped, message: `Applied exterior-first order to ${applied} projects; skipped ${skipped} already-ordered projects.` });
  } catch (err) {
    console.error("[project-images] apply-exterior-first error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Failed to apply exterior-first order" });
  }
});

# Project Images Admin — Extended Controls

**Plan:** `project-images-admin-controls_PLAN_23-07-26.md`
**Complexity:** COMPLEX (4 independent, sequentially verifiable phases)
**Status:** ACTIVE
**Predecessor:** `project-images-admin_PLAN_22-07-26.md` (COMPLETE — all 4 phases of that plan are live)

---

## Overview

The `/inspiration` admin overlay (Phase 1–4 of the predecessor plan) is fully operational.
This plan extends it with:

- **A. Project-level actions**: Flag, Hide, Delete (soft tombstone), Change ratio
- **B. Per-image controls**: Aspect ratio indicator, per-image Flag, replace Set-best UI with an editable score popup
- **C. Bug fix**: Image drag-reorder reverts when switching projects (wrong initial state)
- **D. One-time batch**: Best-exterior-first image order applied to all projects via an admin endpoint

None of these require touching `src/components/home/InspirationStrip.tsx` or `src/pages/Index.tsx`.

---

## WIP Constraint

`src/components/home/InspirationStrip.tsx` and `src/pages/Index.tsx` have uncommitted user changes.
**No file in this plan touches either of those files.**

---

## Architecture State (verified)

- Migration 014: `project_image_override` table live, 64 rows in prod.
- `server/routes/project-images.ts`: all 6 override types handled (hidden, replaced, best_for_category, project_order, category_order, image_order).
- `src/pages/admin/ProjectImagesPanel.tsx`: fully built — ImageRow, ProjectDetailView, drag-order, lightbox, uploader, stale detection, toast all working.
- `src/pages/Admin.tsx`: "images" tab already wired.
- `src/lib/project-thumbs.ts`: `toThumbPath()` in use across admin grids.
- `server/data/project-image-analysis.json`: no width/height stored.

---

## Key Decisions (INNOVATE summary)

| Decision | Choice | Rejected alternatives |
|---|---|---|
| Schema for project-level controls (Flag/Hide/Delete/Ratio) | Extend `override_type` CHECK in migration 015; use `__project__` sentinel (established pattern) | New `project_override` table (2× query surface, more migration complexity); separate tombstone table |
| Score overrides storage | One `project_image_override` row per (image, category) with `override_type = 'score_override'`, `value_int = 0-100` | JSON blob in `value_text` (harder to query) |
| Image dimension display | Client-side `naturalWidth/naturalHeight` from `<img onLoad>` in admin only | Extend AI pipeline (re-run all 60+ projects); `sharp` server probe (new dependency) |
| Drag-reorder bug fix | Apply `image_order` overrides from the existing `overrides` prop to compute initial `imageOrderIds` | Re-fetch on project switch (extra network round-trip); store in baseline API (leaks override concern into baseline) |
| Best-exterior-first mechanism | New admin endpoint `POST /api/admin/project-images/apply-exterior-first` (in-process, works on prod immediately) | Node script + SSH to VPS; migration SQL with computed data |

---

## Data Model Changes

### Migration 015 — Extend override_type CHECK + add new types

**File to create:** `server/migrations/015_project_override_types.sql`

New `override_type` values:
- `'project_flagged'` — project is flagged (visual marker, no automation). `image_path = '__project__'`, no value needed.
- `'project_hidden'` — project hidden from public site and default admin list. `image_path = '__project__'`. Toggleable.
- `'project_deleted'` — soft tombstone. `image_path = '__project__'`. Project excluded from public AND admin default lists; only visible in a "deleted" admin view. Must survive `sync-cms.yml` re-sync (the sync/prune logic only touches `cms_project` rows; `project_image_override` rows are never pruned by CMS sync).
- `'project_ratio'` — aspect ratio override for public project cards. `image_path = '__project__'`, `value_text = '16:9' | '4:3'`.
- `'score_override'` — per-image per-category score override. `image_path = <actual path>`, `category = 'windows'|'doors'|'interior'|'exterior'`, `value_int = 0-100`.

**Why tombstone survives sync:** `sync-cms.yml` runs `server/sync-cms.ts` which prunes `cms_project` rows (per commit 7cbf0fe). `project_image_override` is a separate table never touched by that sync. The `project_deleted` row lives here, so it is immune to CMS re-sync resurrection.

```sql
-- server/migrations/015_project_override_types.sql

BEGIN;

-- 1. Drop the existing CHECK constraint (named inline — no explicit name in migration 014).
--    PostgreSQL assigns a generated name: project_image_override_override_type_check.
--    We drop and recreate with the expanded value list.

ALTER TABLE project_image_override
  DROP CONSTRAINT project_image_override_override_type_check;

ALTER TABLE project_image_override
  ADD CONSTRAINT project_image_override_override_type_check
    CHECK (override_type IN (
      'hidden',
      'replaced',
      'best_for_category',
      'project_order',
      'category_order',
      'image_order',
      'project_flagged',
      'project_hidden',
      'project_deleted',
      'project_ratio',
      'score_override'
    ));

-- 2. Index: project-level type lookups (project_flagged/hidden/deleted/ratio) are frequent.
--    The existing idx_pio_type already covers override_type. No new index needed.

-- 3. Document new types.
COMMENT ON COLUMN project_image_override.override_type IS
  'hidden | replaced | best_for_category | project_order | category_order | image_order '
  '| project_flagged | project_hidden | project_deleted | project_ratio | score_override';

COMMIT;
```

Apply locally:
```bash
psql fourlinq -f server/migrations/015_project_override_types.sql
```

Apply on VPS (before code deploy):
```bash
ssh advo
sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/015_project_override_types.sql
```

**Verify constraint name before running on prod:**
```bash
psql fourlinq -c "SELECT conname FROM pg_constraint WHERE conrelid = 'project_image_override'::regclass AND contype = 'c';"
```
If the name differs from `project_image_override_override_type_check`, adjust the DROP line.

---

## Server-Side Changes

### A. Extend `server/routes/project-images.ts`

#### 1. Add new override_type values to the validation set (POST /overrides)

In the `validTypes` array (line ~434), add:
```typescript
const validTypes = [
  "hidden", "replaced", "best_for_category",
  "project_order", "category_order", "image_order",
  "project_flagged", "project_hidden", "project_deleted",
  "project_ratio", "score_override",
];
```

#### 2. Extend `buildMergedResponse` to handle new types

New fields to add to `MergedResponse`:
```typescript
export interface MergedResponse {
  // ... existing fields ...
  flaggedProjects: string[];                    // projectIds with project_flagged override
  hiddenProjects: string[];                     // projectIds with project_hidden override
  deletedProjects: string[];                    // projectIds with project_deleted override
  projectRatios: Record<string, string>;        // projectId → '16:9' | '4:3'
}
```

New lookup maps in `buildMergedResponse`:
```typescript
const flaggedSet = new Set<string>();
const hiddenProjectSet = new Set<string>();
const deletedProjectSet = new Set<string>();
const projectRatioMap = new Map<string, string>(); // projectId → value_text
const scoreOverrideMap = new Map<string, Map<string, number>>(); // "projectId|imagePath" → category → value_int
```

Add to the `switch (row.override_type)` block:
```typescript
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
```

**Public payload exclusions (hidden + deleted projects)**:

In the `coveredIds` loop in `buildMergedResponse`, skip deleted and hidden projects for the public response:
```typescript
// For public response: exclude deleted + hidden projects
const publicCoveredIds = coveredIds.filter(id =>
  !deletedProjectSet.has(id) && !hiddenProjectSet.has(id)
);
```
Use `publicCoveredIds` when building `effectiveCategoryImages`, `effectiveDerivedTags`, and the two order arrays in the public `/merged` response.

**Score override application** in category best-image derivation:

When the server re-derives category membership (the merge algorithm section of `buildMergedResponse` for the admin `/baseline` endpoint), effective scores must check `scoreOverrideMap` first:
```typescript
function getEffectiveScore(
  projectId: string, imagePath: string, cat: Category,
  baseScores: ImageScore | null,
  scoreOverrideMap: Map<string, Map<string, number>>
): number {
  const override = scoreOverrideMap.get(`${projectId}|${imagePath}`)?.get(cat);
  return override !== undefined ? override : (baseScores?.[cat] ?? 0);
}
```

Apply `getEffectiveScore` when computing per-category best images in `buildMergedResponse`, so score overrides propagate naturally to category membership and ordering without separate logic.

#### 3. Update `/baseline` response to include new fields

`GET /api/admin/project-images/baseline` response additions:
```typescript
// Include per-project flag/hidden/deleted/ratio state (for admin display)
// and per-image effective scores (baseline + score_override merged)
const projects = canon
  .filter(c => manifest.projects[c.id]?.finished)
  .map(c => {
    const rec = manifest.projects[c.id];
    return {
      id: c.id,
      images: rec.images.map(im => ({
        path: im.path,
        scores: im.scores,             // base scores from manifest
        reasoning: im.reasoning ?? "",
        // effectiveScores computed by merging scoreOverrides on top
        effectiveScores: im.scores
          ? Object.fromEntries(
              CATEGORIES.map(cat => [
                cat,
                scoreOverrideMap.get(`${c.id}|${im.path}`)?.get(cat)
                  ?? im.scores![cat] ?? 0
              ])
            ) as ImageScore
          : null,
      })),
      quality: rec.quality ?? null,
      categoryImages: projectCategoryImages[c.id] ?? {},
      derivedTags: projectDerivedTags[c.id] ?? [],
      // New fields:
      flagged: flaggedSet.has(c.id),
      hidden: hiddenProjectSet.has(c.id),
      deleted: deletedProjectSet.has(c.id),
      ratio: projectRatioMap.get(c.id) ?? "16:9",
    };
  });
```

Note: to compute `scoreOverrideMap` before building the project list, the baseline handler must load overrides from DB (it currently doesn't). Add a DB query at the top of the `/baseline` handler:
```typescript
const { rows: overrideRows } = await pool.query<OverrideRow>(
  `SELECT * FROM project_image_override WHERE organization_id = 1`
);
// Build flaggedSet, hiddenProjectSet, deletedProjectSet, projectRatioMap, scoreOverrideMap
// from overrideRows (same switch logic as buildMergedResponse)
```

#### 4. New endpoint: `POST /api/admin/project-images/apply-exterior-first`

Implements Feature D. Computes best-exterior-first order for each project and bulk-UPSERTs `image_order` override rows — **only for projects that have no existing manual `image_order` rows** (to respect user reorders from Feature C fix).

```typescript
projectImagesAdmin.post("/apply-exterior-first", async (req, res) => {
  try {
    const baseline = loadBaseline();
    const { manifest, canon } = baseline;

    // 1. Find which projects already have any image_order overrides (manual reorders)
    const { rows: existingOrder } = await pool.query<{ project_id: string }>(
      `SELECT DISTINCT project_id FROM project_image_override
       WHERE organization_id = 1 AND override_type = 'image_order'`
    );
    const alreadyOrdered = new Set(existingOrder.map(r => r.project_id));

    const THRESHOLD = 50;
    let applied = 0;
    let skipped = 0;

    for (const c of canon) {
      if (alreadyOrdered.has(c.id)) { skipped++; continue; }
      const rec = manifest.projects[c.id];
      if (!rec?.finished || c.webPaths.length <= 1) continue;

      const scored = rec.images.filter(im => im.scores);
      if (scored.length === 0) continue;

      // Compute best-exterior-first order (mirrors reorder-project-images.mjs logic)
      const exteriorCandidates = scored.filter(im => (im.scores!.exterior ?? 0) >= THRESHOLD);
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
      const otherPaths = c.webPaths.filter(p => p !== bestFirst);
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
    console.error("[project-images] apply-exterior-first error:", err);
    res.status(500).json({ error: "Failed to apply exterior-first order" });
  }
});
```

**Security note:** This endpoint is already gated by `requireRole(["admin","editor"])` via the admin router mount in `server/index.ts`.

---

## Client-Side Changes

### B. Extend `ProjectImagesPanel.tsx`

#### 1. Update TypeScript types

```typescript
// Extend BaselineImage with effectiveScores
interface BaselineImage {
  path: string;
  scores: ScoreMap | null;
  effectiveScores: ScoreMap | null;  // NEW: merged with score_override rows
  reasoning: string;
}

// Extend BaselineProject with new fields
interface BaselineProject {
  id: string;
  images: BaselineImage[];
  quality: { heroImage: string; heroScore: number; enhanced: boolean } | null;
  categoryImages: Partial<Record<Category, string>>;
  derivedTags: Category[];
  flagged: boolean;       // NEW
  hidden: boolean;        // NEW
  deleted: boolean;       // NEW
  ratio: string;          // NEW: '16:9' | '4:3', default '16:9'
}
```

#### 2. Fix Bug C — image drag-reorder doesn't persist across project switches

**Root cause:** `imageOrderIds` initializes from `project.images.map(im => im.path)` (baseline order) without applying existing `image_order` DB override rows. When the user switches to another project and back, the state is reset to baseline order, losing the drag result.

**Fix:** Extract a helper and use it in both the useState initializer and the project-switch reset:

```typescript
// Pure helper: apply image_order overrides to produce correct initial path order
function computeImageOrder(
  baseImages: BaselineImage[],
  projectOverrides: OverrideRow[],
): string[] {
  const orderOverrides = projectOverrides
    .filter(r => r.override_type === "image_order")
    .sort((a, b) => (a.value_int ?? 0) - (b.value_int ?? 0));

  if (orderOverrides.length === 0) return baseImages.map(im => im.path);

  // Build ordered set: overridden paths in their value_int positions,
  // unordered paths appended in original order at the end.
  const overriddenPaths = new Set(orderOverrides.map(r => r.image_path));
  const unordered = baseImages.map(im => im.path).filter(p => !overriddenPaths.has(p));
  return [
    ...orderOverrides.map(r => r.image_path).filter(p => baseImages.some(im => im.path === p)),
    ...unordered,
  ];
}
```

In `ProjectDetailView`:

```typescript
// Replace line 650:
const [imageOrderIds, setImageOrderIds] = useState<string[]>(() =>
  computeImageOrder(project.images, overrides.filter(r => r.project_id === project.id))
);

// Replace line 662 (project switch reset):
if (prevProjectId !== project.id) {
  setPrevProjectId(project.id);
  setImageOrderIds(computeImageOrder(
    project.images,
    overrides.filter(r => r.project_id === project.id)
  ));
}
```

**Dependency note:** `overrides` prop is already available in `ProjectDetailView`. No new props needed.

#### 3. Feature A — Project-level action buttons in ProjectDetailView header

Add four action buttons to the project detail header section (below the project name/stats line):

```tsx
{/* Project-level action bar */}
<div className="flex items-center gap-2 flex-wrap mt-3">
  {/* Flag toggle */}
  <button
    type="button"
    onClick={() => project.flagged
      ? handleDeleteProjectOverride("project_flagged")
      : handleAddProjectOverride("project_flagged")
    }
    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
      project.flagged
        ? "bg-orange-500/15 text-orange-700 hover:bg-orange-500/25"
        : "bg-muted text-muted-foreground hover:bg-border"
    }`}
  >
    <Flag size={13} /> {project.flagged ? "Flagged" : "Flag"}
  </button>

  {/* Hide toggle */}
  <button
    type="button"
    onClick={() => project.hidden
      ? handleDeleteProjectOverride("project_hidden")
      : handleAddProjectOverride("project_hidden")
    }
    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
      project.hidden
        ? "bg-muted border border-border text-foreground"
        : "bg-muted text-muted-foreground hover:bg-border"
    }`}
  >
    {project.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
    {project.hidden ? "Unhide" : "Hide project"}
  </button>

  {/* Ratio toggle */}
  <button
    type="button"
    onClick={() => handleAddProjectOverride("project_ratio",
      project.ratio === "4:3" ? "16:9" : "4:3"
    )}
    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-border transition-colors"
  >
    <RatioIcon size={13} /> {project.ratio === "4:3" ? "4:3 → 16:9" : "16:9 → 4:3"}
  </button>

  {/* Delete / Restore */}
  {project.deleted ? (
    <button
      type="button"
      onClick={() => handleDeleteProjectOverride("project_deleted")}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-green-500/10 text-green-700 hover:bg-green-500/20 transition-colors"
    >
      <RotateCcw size={13} /> Restore
    </button>
  ) : (
    <button
      type="button"
      onClick={() => {
        if (!window.confirm(`Soft-delete "${project.id.replace(/-/g, ' ')}"? It will disappear from public site and admin default view. You can restore it from the Deleted tab.`)) return;
        handleAddProjectOverride("project_deleted");
      }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-auto"
    >
      <Trash2 size={13} /> Delete project
    </button>
  )}
</div>
```

**Helper handlers in ProjectDetailView** (call `onAddOverride` / `onDeleteOverride` from props):

```typescript
async function handleAddProjectOverride(
  type: string,
  valueText: string | null = null
) {
  await onAddOverride({
    project_id: project.id,
    image_path: "__project__",
    override_type: type,
    value_text: valueText,
  });
}

async function handleDeleteProjectOverride(type: string) {
  const row = projectOverrides.find(r =>
    r.override_type === type && r.image_path === "__project__"
  );
  if (row) await onDeleteOverride(row.project_image_override_id);
}
```

**Flagged badge in ProjectListView and ProjectOrderRow:**

In `ProjectListView`, add a Flag icon badge to project cards with `proj.flagged === true`:
```tsx
{proj.flagged && (
  <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
    <Flag size={9} /> Flagged
  </span>
)}
```

In `ProjectOrderRow`, show a small Flag icon next to the project name if `flagged`:
```tsx
{/* Pass flagged prop to ProjectOrderRow */}
{flagged && <Flag size={10} className="text-orange-500 shrink-0" />}
```

**Hidden/Deleted project visibility in admin:**

`ProjectListView` receives `baselineData` (which now includes `flagged/hidden/deleted` per project).

Add a view-mode selector:
```tsx
type ViewMode = "active" | "hidden" | "deleted";
const [viewMode, setViewMode] = useState<ViewMode>("active");
```

Filter `orderedProjects` by `viewMode`:
- `"active"`: exclude `proj.deleted || proj.hidden`
- `"hidden"`: include only `proj.hidden && !proj.deleted`
- `"deleted"`: include only `proj.deleted`

Show 3 filter tabs at the top of the project list: **Active | Hidden | Deleted**.

#### 4. Feature B1 — Aspect ratio indicator on ImageRow

Add a `naturalRatio` state to `ImageRow` component, captured on image load:

```typescript
const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

// In the <img> element:
onLoad={(e) => {
  const img = e.currentTarget;
  if (img.naturalWidth && img.naturalHeight) {
    setNaturalRatio(img.naturalWidth / img.naturalHeight);
  }
}}
```

Display near the filename:
```tsx
{naturalRatio !== null && (
  <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">
    {naturalRatio.toFixed(2)}
  </span>
)}
```

#### 5. Feature B2 — Per-image Flag button on ImageRow

Add `flagged: boolean` and `onFlag: () => void` / `onUnflag: () => void` to `ImageRow` props.

Compute per-image flagged state in `ProjectDetailView`:
```typescript
const imageFlaggedSet = new Set(
  projectOverrides
    .filter(r => r.override_type === "image_flagged" && r.image_path !== "__project__")
    .map(r => r.image_path)
);
```

Note: `image_flagged` requires adding it to the CHECK constraint in migration 015 as well.

Add to migration 015 CHECK constraint list: `'image_flagged'`

Add flag button to `ImageRow` controls bar (alongside Hide/Replace):
```tsx
<button
  onClick={flagged ? onUnflag : onFlag}
  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors ${
    flagged
      ? "bg-orange-500/15 text-orange-700 hover:bg-orange-500/25"
      : "bg-muted text-muted-foreground hover:bg-border"
  }`}
>
  <Flag size={13} /> {flagged ? "Flagged" : "Flag"}
</button>
```

Wire in `ProjectDetailView`'s `imageOrderIds.map(...)` render:
```tsx
flagged={imageFlaggedSet.has(image.path)}
onFlag={async () => {
  await onAddOverride({ project_id: project.id, image_path: image.path, override_type: "image_flagged" });
}}
onUnflag={async () => {
  const row = projectOverrides.find(r => r.override_type === "image_flagged" && r.image_path === image.path);
  if (row) await onDeleteOverride(row.project_image_override_id);
}}
```

#### 6. Feature B3 — Replace "Set best" UI with "Modify values" score popup

**Remove** the existing `<select>` + "Set best" button from `ImageRow`.

**Add** a "Modify values" button that opens an inline popup (not a modal — inline expansion below the controls bar, similar to the uploader).

`ImageRow` new state:
```typescript
const [showScoreEditor, setShowScoreEditor] = useState(false);
const [editScores, setEditScores] = useState<Record<Category, number>>(
  () => CATEGORIES.reduce((acc, cat) => ({
    ...acc,
    [cat]: image.effectiveScores?.[cat] ?? 0,
  }), {} as Record<Category, number>)
);
```

Replace the Set-best section with:
```tsx
<button
  onClick={() => setShowScoreEditor(!showScoreEditor)}
  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-muted hover:bg-border text-muted-foreground transition-colors"
>
  <Sliders size={13} /> Modify values
</button>
```

Score editor popup (inline expansion):
```tsx
{showScoreEditor && (
  <div className="mt-2 border-t border-border/40 pt-2">
    <p className="text-[11px] text-muted-foreground mb-2 font-medium">
      Override category scores for this image (0–100). Category "best" re-derives automatically.
    </p>
    <div className="grid grid-cols-2 gap-2 mb-3">
      {CATEGORIES.map(cat => (
        <label key={cat} className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-foreground">{CATEGORY_LABELS[cat]}</span>
          <input
            type="number"
            min={0}
            max={100}
            value={editScores[cat]}
            onChange={e => setEditScores(prev => ({ ...prev, [cat]: parseInt(e.target.value, 10) || 0 }))}
            className="border border-border rounded px-2 py-1 text-xs bg-background text-foreground w-full outline-none focus:border-primary"
          />
          {image.scores?.[cat] !== editScores[cat] && (
            <span className="text-[10px] text-muted-foreground">
              base: {image.scores?.[cat] ?? 0}
            </span>
          )}
        </label>
      ))}
    </div>
    <div className="flex gap-2">
      <button
        onClick={async () => {
          // Save one score_override row per category
          await Promise.all(
            CATEGORIES.map(cat =>
              onAddOverride({
                project_id: projectId,
                image_path: image.path,
                override_type: "score_override",
                category: cat,
                value_int: editScores[cat],
              })
            )
          );
          setShowScoreEditor(false);
        }}
        className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      >
        Save scores
      </button>
      <button
        onClick={() => setShowScoreEditor(false)}
        className="text-xs px-2.5 py-1.5 rounded bg-muted text-muted-foreground hover:bg-border transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
)}
```

**ImageRow props changes:**
- Remove: `onSetBestFor: (category: Category) => void`
- Add: `effectiveScores` (from `BaselineImage.effectiveScores`), `flagged`, `onFlag`, `onUnflag`

#### 7. Feature D — "Apply exterior-first" button in ProjectListView

Add an "Apply best exterior first" action button to the `ProjectListView` header area:

```tsx
const [applyingExterior, setApplyingExterior] = useState(false);

async function handleApplyExteriorFirst() {
  if (!window.confirm(
    "Apply best-exterior-first image order to all projects that haven't been manually reordered? " +
    "This cannot be undone automatically — you can manually reorder afterward."
  )) return;
  setApplyingExterior(true);
  try {
    const res = await fetch("/api/admin/project-images/apply-exterior-first", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
    queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
    showToast(`Done: ${data.message}`);
  } catch (e) {
    showToast(`Error: ${String(e)}`);
  } finally {
    setApplyingExterior(false);
  }
}
```

Display in `ProjectListView` header:
```tsx
<button
  onClick={handleApplyExteriorFirst}
  disabled={applyingExterior}
  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-border transition-colors disabled:opacity-50"
>
  {applyingExterior ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpDown size={13} />}
  Apply exterior-first order
</button>
```

**Note:** `handleApplyExteriorFirst` needs access to `queryClient` and `showToast` — these live in the main `ProjectImagesPanel` component. Pass them down as props to `ProjectListView`, or (simpler) move this button up to the `ProjectImagesPanel` level and show it only when `!selectedProject`.

#### 8. New Lucide icons to import

Add to the existing lucide-react import in `ProjectImagesPanel.tsx`:
- `Flag`
- `Trash2`
- `RotateCcw`
- `Sliders`
- `ArrowUpDown`

Check if `RatioIcon` exists in lucide-react; if not, use a text label `"16:9"` / `"4:3"` with `LayoutTemplate` icon.

---

## Public Page Changes (`src/pages/Inspiration.tsx`)

**Carry ratio through the public payload:**

`MergedResponse` already returns to `Inspiration.tsx` via `GET /api/project-images/merged`. Add `projectRatios` to the merged response:
```typescript
// In MergedResponse (server/routes/project-images.ts):
projectRatios: Record<string, string>;  // projectId → '16:9' | '4:3'
```

In `Inspiration.tsx`, when rendering a project card, pass the ratio to `CardImage` or the card container:
```tsx
// Inside the map over filtered projects:
const ratio = mergedData?.projectRatios?.[proj.id] ?? "16:9";
// Use ratio to set the aspect ratio class on the card thumbnail container:
// ratio === "4:3" → "aspect-[4/3]"   ratio === "16:9" → "aspect-[16/9]" (existing default)
```

**Excluded projects (hidden + deleted):**

Already handled by server-side merge: `publicCoveredIds` excludes `hidden` and `deleted` projects before computing all order arrays. No additional client changes needed.

**Constraint reminder:** Do NOT touch `src/components/home/InspirationStrip.tsx` or `src/pages/Index.tsx`.

---

## Touchpoints

| File | Change type | Notes |
|---|---|---|
| `server/migrations/015_project_override_types.sql` | New file | ALTER TABLE to expand CHECK constraint; apply before code deploy |
| `server/routes/project-images.ts` | Modified | New override_type handling, new `/apply-exterior-first` endpoint, baseline includes score_override + project state, MergedResponse has `projectRatios`/`flaggedProjects`/`hiddenProjects`/`deletedProjects` |
| `src/pages/admin/ProjectImagesPanel.tsx` | Modified | Bug C fix, project action buttons (A), ratio indicator (B1), image flag (B2), score popup (B3), apply-exterior button (D), view mode filter (hidden/deleted view), new icon imports |
| `src/pages/Inspiration.tsx` | Modified | Read `projectRatios` from merged API; apply ratio to card aspect ratio — minimal change |

**Not touched:**
- `src/components/home/InspirationStrip.tsx`
- `src/pages/Index.tsx`
- Any migration before 014
- `server/index.ts` (routes already mounted)
- `server/data/project-image-analysis.json` (read-only)

---

## Public Contracts

| Contract | Owner | Consumer | Change |
|---|---|---|---|
| `GET /api/project-images/merged` → `MergedResponse` | `server/routes/project-images.ts` | `src/pages/Inspiration.tsx` | ADD `projectRatios`, `flaggedProjects`, `hiddenProjects`, `deletedProjects`; all additive |
| `GET /api/admin/project-images/baseline` | server admin router | `ProjectImagesPanel.tsx` | ADD `flagged`, `hidden`, `deleted`, `ratio`, `effectiveScores` fields to each project/image |
| `POST /api/admin/project-images/overrides` | server admin router | `ProjectImagesPanel.tsx` | ADD validation for 6 new override_type values |
| `POST /api/admin/project-images/apply-exterior-first` | server admin router | `ProjectImagesPanel.tsx` | NEW endpoint |
| `project_image_override` CHECK constraint | migration 015 | all server UPSERTs | EXPANDED — drop and recreate |
| Tombstone row `project_deleted` | `project_image_override` | `buildMergedResponse` | Survives `sync-cms.yml` because CMS sync never touches `project_image_override` |

---

## Blast Radius

**Medium risk:**
- `server/routes/project-images.ts`: adding new override_type handling and a new endpoint. The `buildMergedResponse` function is well-tested by the existing 64 override rows; new switch cases are additive. The baseline handler gains a DB query — adds ~1-2ms latency, cached for 5 min.
- `src/pages/Inspiration.tsx`: reading `projectRatios` from merged API. This is a new optional field — if `mergedData` doesn't have it yet (before deploy), `?? "16:9"` defaults mean zero regression.
- `src/pages/admin/ProjectImagesPanel.tsx`: the Bug C fix and new UI additions are localized to `ProjectDetailView` and `ProjectListView`. The mutation flow (addOverride/deleteOverride) is unchanged.

**Low risk:**
- `server/migrations/015_project_override_types.sql`: only ALTERs a CHECK constraint, no schema structural changes. The 64 existing rows are unaffected.
- New lucide icons: additive import.

**No risk:**
- `server/index.ts`: no changes needed (admin router already mounted).
- `server/data/project-image-analysis.json`: read-only.

---

## Sync-CMS Safety

`sync-cms.yml` calls `server/sync-cms.ts`, which prunes `cms_project` rows whose slugs are not in the source data (commit 7cbf0fe). `project_image_override` is a separate table with no foreign key to `cms_project`. The sync script does NOT touch `project_image_override`. Therefore:

- `project_deleted` tombstone rows CANNOT be resurrected by re-sync.
- `project_hidden` rows CANNOT be cleared by re-sync.
- Score override, flag, ratio rows CANNOT be pruned by re-sync.

This guarantee holds as long as `sync-cms.ts` is not modified to also truncate/prune `project_image_override`.

---

## Verification Evidence

### Phase 1 — Migration + Server

```bash
# 1. Check constraint name before altering
psql fourlinq -c "SELECT conname FROM pg_constraint WHERE conrelid = 'project_image_override'::regclass AND contype = 'c';"

# 2. Apply migration locally
psql fourlinq -f server/migrations/015_project_override_types.sql

# 3. TypeScript compiles
npm run typecheck

# 4. Test new override types via curl (after dev server starts)
# POST a project_flagged override
curl -s -X POST http://localhost:3001/api/admin/project-images/overrides \
  -H "Content-Type: application/json" \
  -b "<admin-cookie>" \
  -d '{"project_id":"las-pinas-residence","image_path":"__project__","override_type":"project_flagged"}' \
  | python3 -m json.tool
# Expected: { "override": { ... "override_type": "project_flagged" ... } }

# POST a project_deleted override
curl -s -X POST ... -d '{"project_id":"las-pinas-residence","image_path":"__project__","override_type":"project_deleted"}' | python3 -m json.tool

# Verify merged endpoint excludes deleted project
curl -s http://localhost:3001/api/project-images/merged | python3 -c \
  "import json,sys; d=json.load(sys.stdin); print('las-pinas-residence' not in d['projectOrder'])"
# Expected: True

# Clean up
psql fourlinq -c "DELETE FROM project_image_override WHERE project_id='las-pinas-residence' AND override_type IN ('project_flagged','project_deleted');"

# 5. Test score_override
curl -s -X POST ... -d '{"project_id":"las-pinas-residence","image_path":"/images/projects-fb/las-pinas-residence.jpg","override_type":"score_override","category":"exterior","value_int":95}' | python3 -m json.tool
# Expected: saved row with category=exterior, value_int=95

# Verify baseline reflects effective score
curl -s http://localhost:3001/api/admin/project-images/baseline -b "<cookie>" | python3 -c \
  "import json,sys; d=json.load(sys.stdin); p=next(x for x in d['projects'] if x['id']=='las-pinas-residence'); print(p['images'][0]['effectiveScores'])"
# Expected: {'windows':72,'doors':10,'interior':50,'exterior':95}

# 6. Test apply-exterior-first endpoint
curl -s -X POST http://localhost:3001/api/admin/project-images/apply-exterior-first -b "<cookie>" | python3 -m json.tool
# Expected: { "applied": N, "skipped": 0, "message": "Applied exterior-first order to N projects..." }
```

### Phase 2 — Admin UI

```bash
npm run typecheck && npm run build
# Expected: zero TypeScript errors; dist/ produced
```

Manual browser flow:
1. Visit `http://localhost:5173/admin` → Project Images tab
2. Project list shows **Active** / **Hidden** / **Deleted** tabs
3. Click a project → project detail shows Flag / Hide / Change ratio / Delete buttons
4. Click **Flag** → project card in list shows orange "Flagged" badge
5. Click **Hide project** → project disappears from Active list; appears in Hidden tab; `/inspiration` excludes it within 30s
6. Click **Change ratio** (16:9 → 4:3) → `/inspiration` card renders in 4:3 ratio within 30s
7. Click **Delete project** (confirm dialog) → project appears in Deleted tab; admin Active list and `/inspiration` both exclude it
8. In Deleted tab, click **Restore** → project returns to Active list and `/inspiration`
9. Open any image row → click **Modify values** → score popup opens, edit exterior score, click Save → baseline re-fetches; project's effective exterior score updates → category membership may change
10. Drag images within a project to reorder → switch to another project and back → **order is preserved** (Bug C fix)
11. Click **Apply exterior-first order** → all projects show best exterior image first; toast confirms count

### Phase 3 — Production Rollout

Sequence:
1. Apply migration 015 on VPS BEFORE deploying code:
   ```bash
   ssh advo
   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/015_project_override_types.sql
   ```
2. `git push origin main` → GitHub Actions deploy
3. Smoke test: `curl https://fourlinq.ph/api/project-images/merged | python3 -m json.tool`
4. Visit `/inspiration` — no regressions (zero new overrides of new types yet)
5. Log into prod `/admin` → Project Images → click a project → confirm new action buttons appear
6. Click **Apply exterior-first order** on prod → confirm toast with applied count
7. Visit `/inspiration` → confirm first image in each project card is now the best exterior (or best interior fallback)

---

## Implementation Checklist

Steps are ordered for safe, phase-gated execution.

### Phase 1 — Migration + Server (verify before Phase 2)

1. **Verify constraint name** on local DB:
   ```bash
   psql fourlinq -c "SELECT conname FROM pg_constraint WHERE conrelid = 'project_image_override'::regclass AND contype = 'c';"
   ```
   Adjust migration 015 DROP line if name differs.

2. **Create** `server/migrations/015_project_override_types.sql` with the ALTER TABLE DDL above.
   - CHECK constraint expanded to include: `project_flagged`, `project_hidden`, `project_deleted`, `project_ratio`, `score_override`, `image_flagged`.
   - Add COMMENT ON COLUMN.

3. **Apply migration locally:**
   ```bash
   psql fourlinq -f server/migrations/015_project_override_types.sql
   ```

4. **Update `server/routes/project-images.ts`:**
   a. Expand `validTypes` array (POST /overrides validation) to include all 6 new types.
   b. Add `getEffectiveScore()` helper function.
   c. Add new override lookup maps in `buildMergedResponse`: `flaggedSet`, `hiddenProjectSet`, `deletedProjectSet`, `projectRatioMap`, `scoreOverrideMap`.
   d. Add new switch cases in `buildMergedResponse` for all 6 new types.
   e. Add `publicCoveredIds` filter (excludes `project_hidden` + `project_deleted`) for public merged response.
   f. Extend `MergedResponse` interface: add `flaggedProjects`, `hiddenProjects`, `deletedProjects`, `projectRatios`.
   g. Add new fields to the return object of `buildMergedResponse`.
   h. Update `/baseline` handler: add DB query for override rows; build lookup maps; include `flagged`, `hidden`, `deleted`, `ratio`, `effectiveScores` in each project/image.
   i. Add `POST /apply-exterior-first` endpoint (full implementation above).

5. **Run `npm run typecheck`** — must pass zero errors.

6. **Start dev server** (`npm run dev:api`) and run Phase 1 curl verification checks above.

### Phase 2 — Admin UI + Bug C Fix (verify before Phase 3)

7. **Update TypeScript types in `ProjectImagesPanel.tsx`:**
   - Extend `BaselineImage` with `effectiveScores`.
   - Extend `BaselineProject` with `flagged`, `hidden`, `deleted`, `ratio`.

8. **Fix Bug C:** Add `computeImageOrder()` helper above `ProjectDetailView`. Replace `imageOrderIds` useState initializer and project-switch reset block to call `computeImageOrder(project.images, overrides.filter(...))`.

9. **Add project-level action buttons** (Feature A):
   - Add `handleAddProjectOverride` and `handleDeleteProjectOverride` helpers inside `ProjectDetailView`.
   - Add action bar below the project header stats line: Flag, Hide, Change ratio, Delete/Restore buttons.
   - Import new icons: `Flag`, `Trash2`, `RotateCcw`, `Sliders`, `ArrowUpDown` from lucide-react (check `LayoutTemplate` for ratio icon if `RatioIcon` unavailable).

10. **Add flagged badge to `ProjectListView`** project cards (orange badge if `proj.flagged`).

11. **Add flagged icon to `ProjectOrderRow`** (small Flag icon if `flagged` prop is true). Update `ProjectOrderRow` props + callers to pass `flagged`.

12. **Add view mode filter to `ProjectListView`** (Active / Hidden / Deleted tabs). Filter `orderedProjects` accordingly.

13. **Add "Apply exterior-first" button** to `ProjectImagesPanel` (not inside `ProjectListView` — keep `queryClient` and `showToast` in scope). Show button only when `!selectedProject`.

14. **Feature B1 — aspect ratio indicator:** In `ImageRow`, add `naturalRatio` state, capture via `onLoad`, display near filename.

15. **Feature B2 — per-image Flag:** Add `flagged`, `onFlag`, `onUnflag` props to `ImageRow`. Compute `imageFlaggedSet` in `ProjectDetailView`. Wire toggle buttons in `ImageRow` controls bar.

16. **Feature B3 — Replace Set-best UI with Modify values popup:**
    - Remove `<select>` + "Set best" button from `ImageRow`.
    - Remove `onSetBestFor` prop from `ImageRow`.
    - Add `showScoreEditor` state + `editScores` state to `ImageRow`.
    - Add "Modify values" button → inline score editor popup.
    - Wire "Save scores" to call `onSaveScores(editScores: Record<Category, number>)` → parent calls `onAddOverride` for each category.
    - Rename existing prop to `onSaveScores`; update callers in `ProjectDetailView`.

17. **Update `/inspiration` ratio handling** in `src/pages/Inspiration.tsx`:
    - Read `projectRatios` from `mergedData`.
    - Pass ratio to card aspect ratio class (default `"16:9"`).
    - NOTE: Make minimal changes. Do not touch `InspirationStrip.tsx` or `Index.tsx`.

18. **Run `npm run typecheck`** — must pass zero errors.

19. **Run `npm run build`** — must produce clean `dist/`.

20. **Manual browser verification** — all Phase 2 flows above.

### Phase 3 — Production Rollout

21. **Apply migration 015 on VPS** (BEFORE pushing code):
    ```bash
    ssh advo
    sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/015_project_override_types.sql
    ```
    Verify success: `psql fourlinq -c "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='project_image_override'::regclass AND contype='c';"`

22. **Push to main:** `git push origin main` → wait for GitHub Actions deploy to complete.

23. **Production smoke test:**
    ```bash
    curl https://fourlinq.ph/api/project-images/merged | python3 -m json.tool
    ```
    Expected: valid JSON, no 500, existing overrides still present.

24. **Visit prod `/admin`** → Project Images → confirm new action buttons visible.

25. **Trigger `POST /apply-exterior-first` via admin UI** → toast confirms applied count.

26. **Visit `/inspiration`** → verify no regressions; first image per project card is best exterior.

27. **Run `gh workflow run sync-cms.yml`** after all the above to apply any pending CMS migrations (standard push-to-live checklist). Verify deleted/hidden project exclusions still hold after re-sync.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CHECK constraint name differs between local and prod | Low | High | Step 1 verifies name before migration; migration can be adjusted per environment |
| `apply-exterior-first` runs on projects with existing manual reorders | Low | Medium | Endpoint filters out projects with any existing `image_order` rows; `skipped` count reported in response |
| Score overrides cause unexpected category membership changes on prod | Low | Medium | Overrides only apply in server merge; original `project-image-analysis.json` scores unchanged; admin can delete score_override rows to revert |
| `projectRatios` field missing from old merged API cache (30s window) | Very Low | Low | Client uses `?? "16:9"` default; old cache returns ratio-less response gracefully |
| Per-image Flag (`image_flagged`) has no automation — purely visual | Intentional | None | Documented as visual marker only in UI tooltip |
| Tombstone resurrection via sync-cms | Very Low | High | `project_image_override` is not touched by sync script; confirmed by code audit |
| `naturalWidth/naturalHeight` = 0 before image fully loads | Low | Low | `if (img.naturalWidth && img.naturalHeight)` guard; ratio shows only after load |

---

## Open Questions

1. **Ratio rendering on `/inspiration`:** The current `CardImage` component probably uses a fixed aspect-ratio container class. Confirm the exact class that controls card height in `Inspiration.tsx` before checklist item 17 — the executor should read that file's card rendering block to identify the exact tailwind class to swap.

2. **`RatioIcon` in lucide-react:** If `RatioIcon` doesn't exist in the installed version, use `LayoutTemplate` or a plain text label. The executor should check `import { ... } from "lucide-react"` auto-complete or the installed version's exports.

3. **Batch size for `apply-exterior-first`:** With ~61 projects and 5-20 images each, the bulk UPSERT could be ~600-1200 rows in one transaction. Test locally to ensure no timeout on the admin request (target <5s). If slow, add pagination or chunking.

---

## Resume and Execution Handoff

**Plan file:** `/Users/princewagan/fourlinq/process/general-plans/active/project-images-admin-controls_PLAN_23-07-26.md`

**Execute agent start point:** Checklist item 1 (verify constraint name). Phases must be verified before proceeding to next phase.

**Files to pass to vc-execute-agent (Phase 1):**
- This plan file (primary).
- `server/migrations/014_project_image_overrides.sql` (shape reference).
- `server/routes/project-images.ts` (full file — modify in place).
- `server/index.ts` (first 80 lines — confirm routes already mounted, no changes needed).

**Files to pass to vc-execute-agent (Phase 2):**
- This plan file (primary).
- `src/pages/admin/ProjectImagesPanel.tsx` (full file — modify in place).
- `src/pages/Inspiration.tsx` (full file — minimal ratio change only; do NOT touch `InspirationStrip.tsx` or `Index.tsx`).

**Files to pass to vc-execute-agent (Phase 3):**
- This plan file (primary, Phase 3 section).
- Current `process/context/all-context.md` equivalent (push-to-live checklist from MEMORY.md).

**Phase completion tokens:**
- Phase 1 complete when: `npm run typecheck` passes + all Phase 1 curl checks pass.
- Phase 2 complete when: `npm run build` passes + all Phase 2 browser flows verified manually.
- Phase 3 complete when: prod smoke test passes + apply-exterior-first button works on prod + sync-cms still holds tombstone exclusions.

---

## Addendum — `project_checked` increment (2026-07-23)

### What was added

A **Check** toggle button was added to each project's control row in the admin "Project Images" tab, and a green check icon was added to the "Project Order in Gallery" sortable list. This mirrors the existing `project_flagged` pattern 1:1.

**Requirement:** Button row order is now: **Check, Flag, Ratio, Hide, Delete**.

- Button label: `Check` when unchecked; `Marked as Checked` (green) when checked.
- Green check icon (`Check size={10} className="text-green-600"`) appears next to flagged-project icons in the `ProjectOrderRow` sortable list.
- `project_checked` is a **purely visual marker** — it has no effect on the public `/inspiration` page, project ordering, or any filtering logic.
- Persisted to `project_image_override` table (`image_path = '__project__'`, no value needed).

### Files touched

| File | Change |
|---|---|
| `server/migrations/016_project_checked.sql` | New migration — expands CHECK constraint to include `project_checked` |
| `server/routes/project-images.ts` | `MergedResponse`: added `checkedProjects: string[]`; `buildMergedResponse`: added `checkedSet`, switch case, return field; `validTypes`: added `"project_checked"`; `/baseline` handler: added `baselineCheckedSet`, switch case, `checked` field per project |
| `src/types/project-images.d.ts` | Added `checkedProjects?: string[]` with doc comment |
| `src/pages/admin/ProjectImagesPanel.tsx` | Imported `Check` from lucide-react; added `checked: boolean` to `BaselineProject`; added `checked` + `Check` icon to `ProjectOrderRow`; added Check toggle button (first in action bar); added `"project_checked"` to `PROJECT_LEVEL_TYPES`; wired `checked={p?.checked ?? false}` at both `ProjectOrderRow` call sites |

### Local migration status

Migration 016 was applied to local `fourlinq` DB (PG16). Constraint verified:

```
project_image_override_override_type_check includes 'project_checked'
```

### Verification

- `npm run typecheck` — PASSED (0 errors)
- `npm run test` (vitest) — PASSED (109/109 tests)

### Follow-up required before prod deploy

Migration 016 must be wired into `.github/workflows/sync-cms.yml` as a guarded block (matching the pattern used for migration 015 in that workflow) before pushing to production. Without this, inserting a `project_checked` override on prod will fail with a CHECK constraint violation.

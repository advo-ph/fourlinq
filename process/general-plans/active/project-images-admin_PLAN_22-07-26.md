# Project Images Admin — Postgres Overrides Layer

**Plan:** `project-images-admin_PLAN_22-07-26.md`
**Complexity:** COMPLEX (4 independent, sequentially verifiable phases)
**Status:** ACTIVE

---

## Overview

The `/inspiration` gallery currently resolves project images entirely at build-time:
`scripts/build-project-category-images.mjs` reads `server/data/project-image-analysis.json` and
emits `src/data/project-category-images.generated.ts` (imported by Vite, baked into `dist/`).
`server/data/` is wiped on every deploy rsync, and there is no admin surface for these images.

This plan adds a durable, deploy-proof override layer:

1. A Postgres table stores per-slot overrides (hide, replace URL, best-image swap, project order).
2. A public runtime API merges overrides onto the file-based baseline and serves the merged result.
3. The `/inspiration` frontend switches from the baked TS import to a live API call (with an
   immediate file-based fallback so the page never breaks).
4. A new "Project Images" tab in `/admin` lets authorized users (admin, editor) manage all four
   override types with a visual drag-and-drop interface.

---

## Assumptions and Dependencies

| Item | Value |
|---|---|
| Parallel task (external) | `scripts/reorder-project-images.mjs` is in flight; it updates `projects.ts` image order so first image = best exterior (fallback interior). This sets the baseline that overrides sit on top of. Plan assumes this script runs before or concurrently, and overrides start empty. |
| Baseline source of truth | `server/data/project-image-analysis.json` + `src/data/project-category-images.generated.ts` (61 projects, AI vision scores + reasoning, threshold 50). |
| Migration numbering | Last migration is `013_cms_document.sql`. New migration is `014_project_image_overrides.sql`. |
| No DnD library currently installed | `package.json` has no `dnd`, `drag`, or `sortable` dependency. Plan uses `@dnd-kit/core` + `@dnd-kit/sortable` (accessible, lightweight, works with Radix/shadcn). |
| Auth reuse | `requireRole(["admin","editor"])` already exported from `server/auth.ts`. Applies to all admin write endpoints without any new role. |
| Upload persistence | `/uploads/cms/` is served at `/uploads/cms/` and is NOT touched by deploy rsync — existing mechanism for replaced images. |
| Build-time baseline still ships | The generated TS file continues to be built and deployed so the page loads instantly on first render. The runtime API overlay is additive. |
| Key stable identifier | `projectId` (string slug, e.g. `"las-pinas-residence"`) + `imagePath` (relative URL, e.g. `"/images/projects-fb/abc.jpg"` or `/uploads/cms/abc.jpg`). |

---

## Goals

1. Give admin/editor users visual control over every aspect of the project image gallery without
   touching the codebase or re-running AI pipelines.
2. All admin changes take effect on prod immediately (no build/deploy required).
3. Overrides survive any number of deploys and pipeline re-runs.
4. The /inspiration page degrades gracefully: zero-override state and API failure both fall back
   to the baked TS baseline.
5. Stale overrides (referencing image paths no longer in the baseline) are surfaced in admin as
   warnings, not silently corrupting the view.

---

## Scope

### In Scope

- Postgres `project_image_override` table (migration 014)
- Public API: `GET /api/project-images/merged` (no auth, cacheable)
- Admin API: `GET/POST/DELETE /api/admin/project-images/overrides`
- Runtime merge in `/inspiration` (replaces static import for ordering + override data)
- New "Project Images" tab in `src/pages/Admin.tsx`
- New component `src/pages/admin/ProjectImagesPanel.tsx`
- @dnd-kit install for drag ordering within admin UI
- Stale override detection (read-only warning in admin)

### Out of Scope

- Editing AI scores or reasoning (display read-only)
- Direct score editing (explicitly rejected by user)
- Adding new projects via this UI (handled by CMS projects entity)
- `projects:reorder` script (parallel task, external)
- Any changes to the AI analysis pipeline

---

## Data Model

### Overrides Table — `project_image_override`

**File:** `server/migrations/014_project_image_overrides.sql`

Every row represents one named override for one image slot in one project. Multiple override
`type` values can coexist for the same `(project_id, image_path)`.

```
project_image_override
  project_image_override_id  BIGINT IDENTITY PK
  organization_id            BIGINT NOT NULL REFERENCES organization(organization_id)
  project_id                 TEXT NOT NULL          -- slug, e.g. "las-pinas-residence"
  image_path                 TEXT NOT NULL          -- original path key (may be NULL for project-level overrides)
  override_type              TEXT NOT NULL          -- 'hidden' | 'replaced' | 'best_for_category' | 'project_order' | 'category_order' | 'image_order'
  category                   TEXT                   -- 'windows'|'doors'|'interior'|'exterior'; NULL for project-level types
  value_text                 TEXT                   -- replacement URL for 'replaced'; NULL for 'hidden'
  value_int                  INTEGER                -- 0-based position for order overrides
  created_by                 BIGINT REFERENCES auth_user(auth_user_id) ON DELETE SET NULL
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()

  UNIQUE (organization_id, project_id, image_path, override_type, category)
```

**Override type semantics:**

| override_type | project_id | image_path | category | value_text | value_int | Meaning |
|---|---|---|---|---|---|---|
| `hidden` | project slug | original path | NULL | NULL | NULL | Hide this image from all views |
| `replaced` | project slug | original path | NULL | new URL | NULL | Swap this image slot to a different URL |
| `best_for_category` | project slug | path to use | category name | NULL | NULL | Override AI best-image pick for this project+category |
| `project_order` | project slug | `'__project__'` | NULL | NULL | 0-based position | Override sort position in "All projects" view |
| `category_order` | project slug | `'__project__'` | category name | NULL | 0-based position | Override sort position in a category view |
| `image_order` | project slug | image path | NULL | NULL | 0-based position | Override within-project image sequence |

Notes:
- `image_path = '__project__'` is a sentinel for project-level (not image-level) overrides to
  satisfy the NOT NULL constraint and keep the UNIQUE index clean.
- `hidden` and `replaced` are mutually exclusive per slot (UNIQUE constraint handles it via
  `override_type` differentiation).
- Multiple `category_order` rows per project (one per category they appear in) are all valid.

### Indexes

```sql
CREATE INDEX idx_pio_org_project ON project_image_override (organization_id, project_id);
CREATE INDEX idx_pio_type ON project_image_override (override_type);
```

---

## Data Flow

### Write path (admin)

```
Admin UI drag/button action
  → POST /api/admin/project-images/overrides
      { project_id, image_path, override_type, category?, value_text?, value_int? }
  → server UPSERT into project_image_override
  → 200 OK
  → Admin UI re-fetches (TanStack Query invalidate)
```

### Read path — public merged response

```
Browser requests /inspiration
  → immediate paint from baked TS baseline (static import)

Parallel: useEffect calls GET /api/project-images/merged
  → Express handler queries project_image_override (all rows for org 1)
  → Merges overrides onto baseline JSON (order: DB overrides win over file baseline)
  → Returns JSON: { projectCategoryImages, projectDerivedTags, projectOrder, projectCategoryOrder, hidden, replaced }
  → React state updates → CardImage crossfades to new src

On API failure:
  → catch() no-ops → baked baseline stays rendered
```

### Merge algorithm (server-side, stateless)

1. Load baseline from `server/data/project-image-analysis.json` (lazy-loaded, cached in module
   scope with a 60-second TTL to avoid re-reading on every request).
2. Load all override rows from DB for `organization_id = 1`.
3. Build effective `hidden` set: all `(project_id, image_path)` with `override_type = 'hidden'`.
4. Build effective `replaced` map: `(project_id, image_path) → value_text`.
5. Build effective `best_for_category` map: `(project_id, category) → image_path`.
6. Build effective order maps from `project_order`, `category_order`, `image_order` rows
   (grouped by project, sorted by `value_int`).
7. For each project in the baseline:
   a. Resolve each image: if hidden, exclude it. If replaced, swap its URL.
   b. Determine `categoryImages` per category: if `best_for_category` override exists for that
      project+category, use it. Else use the AI-derived best (applying hidden/replace).
   c. Derive effective image list for the project (after hiding/replacing), sorted by `image_order`
      if overrides exist, else original baseline order.
8. Sort `projectOrder`: apply `project_order` overrides as explicit positions; remaining projects
   keep their baseline rank (baseline `projectOrder` from generated TS is embedded in the baseline
   JSON as the AI quality order).
9. Sort `projectCategoryOrder` per category: apply `category_order` overrides; rest keep baseline.
10. Return merged payload as JSON.

**Response shape:**

```typescript
{
  projectCategoryImages: Record<string, Partial<Record<InspirationTag, string>>>;
  projectDerivedTags: Record<string, InspirationTag[]>;
  projectOrder: string[];
  projectCategoryOrder: Record<InspirationTag, string[]>;
  hiddenImages: Record<string, string[]>;  // projectId → [imagePaths]  (admin read; /inspiration ignores)
  replacedImages: Record<string, Record<string, string>>;  // projectId → { origPath: newURL }  (admin read)
  overrideCount: number;  // total active overrides (for admin badge)
}
```

---

## Phase Plan

### Phase 1 — Database + Admin API + Public API

Goal: Overrides table exists, all API endpoints work, zero frontend changes.
Verification gate: curl checks against running dev server; TypeScript compiles.

### Phase 2 — Runtime Merge on /inspiration

Goal: /inspiration reads the merged API at runtime; falls back to baked TS if API fails.
Verification gate: dev browser test with zero overrides (identical to baseline); with one manual
DB override row (via psql INSERT) the page reflects it without rebuilding.

### Phase 3 — Admin UI (Project Images Tab)

Goal: Full visual management UI in `/admin` > Project Images tab.
Verification gate: full admin flow — view AI scores, hide image, replace image, drag order,
see stale warning.

### Phase 4 — Polish, Stale Override Detection, Verification

Goal: Production hardening, error states, stale-key warnings, final QA.
Verification gate: all acceptance criteria pass; deploy smoke test.

---

## Phase 1 — Database + Admin API + Public API

### 1.1 Migration

**File to create:** `server/migrations/014_project_image_overrides.sql`

```
BEGIN;

CREATE TABLE project_image_override (
  project_image_override_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organization_id            BIGINT NOT NULL REFERENCES organization(organization_id) ON DELETE CASCADE,
  project_id                 TEXT NOT NULL,
  image_path                 TEXT NOT NULL,
  override_type              TEXT NOT NULL
                               CHECK (override_type IN ('hidden','replaced','best_for_category',
                                                        'project_order','category_order','image_order')),
  category                   TEXT CHECK (category IN ('windows','doors','interior','exterior')),
  value_text                 TEXT,
  value_int                  INTEGER,
  created_by                 BIGINT REFERENCES auth_user(auth_user_id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, project_id, image_path, override_type, category)
);

CREATE INDEX idx_pio_org_project ON project_image_override (organization_id, project_id);
CREATE INDEX idx_pio_type        ON project_image_override (override_type);

COMMENT ON TABLE project_image_override IS
  'Admin overrides for the /inspiration project-image gallery. Rows win over the file-based AI baseline. Soft-delete not needed: DELETE removes an override (restores baseline).';

GRANT ALL ON project_image_override TO fourlinq;
GRANT ALL ON SEQUENCE project_image_override_project_image_override_id_seq TO fourlinq;

COMMIT;
```

Apply on VPS:
```
sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/014_project_image_overrides.sql
```

### 1.2 Server Route File

**File to create:** `server/routes/project-images.ts`

This file exports two Express Routers:
- `projectImagesPublic` — mounted at `/api/project-images` (no auth)
- `projectImagesAdmin` — mounted at `/api/admin/project-images` (requireRole)

#### Baseline loader (module-level singleton)

```
const MANIFEST_PATH = resolve("server/data/project-image-analysis.json");
const GENERATED_PATH = resolve("src/data/project-category-images.generated.ts");

let baselineCache: BaselineData | null = null;
let baselineCacheAt = 0;
const BASELINE_TTL_MS = 60_000;

function loadBaseline(): BaselineData { ... }
```

`BaselineData` type:
```typescript
type BaselineData = {
  manifest: ManifestJson;                                    // project-image-analysis.json
  projectOrder: string[];                                    // from generated TS (embedded)
  projectCategoryOrder: Record<string, string[]>;            // from generated TS (embedded)
  projectCategoryImages: Record<string, Record<string, string>>; // from generated TS (embedded)
  projectDerivedTags: Record<string, string[]>;              // from generated TS (embedded)
};
```

Because the generated TS is a module, not JSON, the baseline loader reads the JSON manifest
directly and derives `projectOrder` and `projectCategoryOrder` inline (same algorithm as
`build-project-category-images.mjs`) rather than importing a TS module at runtime. This avoids
requiring a separate baseline-JSON export. See "baseline embedding" note below.

**Baseline embedding note:** The generated TS file is only readable as a Node module if tsx is
in the process. The server bundle is compiled by esbuild (CJS). To avoid this coupling, the
public API derives its own merged output from:
- `server/data/project-image-analysis.json` (manifest with per-image scores)
- `server/data/projects-images.json` (canonical project+image order)
- `server/data/_quality/` shard files (if present, for hero order scoring)

This mirrors the exact inputs of `build-project-category-images.mjs`. The THRESHOLD constant
(50) is duplicated into the server route as a named constant. If the threshold changes, both
the script and this route must be updated together (explicitly noted as a risk in Phase 4).

#### Public endpoint: `GET /api/project-images/merged`

- No auth.
- Reads DB overrides for `organization_id = 1`.
- Runs merge algorithm (section "Merge algorithm" above).
- Returns merged payload JSON.
- Response header: `Cache-Control: public, max-age=30, stale-while-revalidate=300`
  (30-second cache — fast invalidation after an admin save, but still CDN-friendly).
- Error: if DB unreachable, fall through to 200 with pure baseline (no 500) so /inspiration
  never sees an error state from this endpoint.

#### Admin endpoint group: `/api/admin/project-images/overrides`

```
GET    /api/admin/project-images/overrides
         → all rows for org 1, ordered by project_id, override_type, value_int
         → also returns stale flags: for each row, check whether image_path is still in baseline

POST   /api/admin/project-images/overrides
         body: { project_id, image_path, override_type, category?, value_text?, value_int? }
         → UPSERT ON CONFLICT (org, project_id, image_path, override_type, category)
           DO UPDATE SET value_text=EXCLUDED.value_text, value_int=EXCLUDED.value_int, updated_at=NOW()
         → returns saved row

DELETE /api/admin/project-images/overrides/:id
         → hard-delete by primary key (restores baseline for that slot)

DELETE /api/admin/project-images/overrides (bulk)
         body: { ids: number[] }
         → delete multiple rows

GET    /api/admin/project-images/baseline
         → returns the current merged baseline (same as public endpoint but auth-gated)
         → includes all image paths per project with scores + reasoning from manifest
         → used by admin UI to display AI context alongside overrides
```

#### Stale override detection (GET /overrides response field)

For each override row, add `stale: boolean` to the response:
- `stale = true` when `image_path` is not in `manifest.projects[project_id]?.images` (for
  image-level override types) or `project_id` is not in the manifest (for any type).
- Admin UI renders stale rows with a warning badge. They do not crash the merge (ignored when
  computing the public response).

### 1.3 Register Routes in server/index.ts

Two mount points to add after the existing CMS admin routes:

```typescript
import { projectImagesPublic, projectImagesAdmin } from "./routes/project-images.js";

// after app.use("/api/cms", cmsPublic):
app.use("/api/project-images", projectImagesPublic);

// after app.use("/api/admin/users", ...):
app.use("/api/admin/project-images",
  ...requireRole(["admin", "editor"]),
  projectImagesAdmin);
```

### 1.4 Phase 1 Verification Evidence

```bash
# 1. TypeScript compiles
npm run typecheck

# 2. Migration applied locally (requires local Postgres)
psql fourlinq -f server/migrations/014_project_image_overrides.sql

# 3. Dev server starts without error
npm run dev:api

# 4. Public endpoint returns baseline with zero overrides
curl http://localhost:3001/api/project-images/merged | python3 -m json.tool | head -30
# Expected: JSON with projectOrder, projectCategoryOrder, projectCategoryImages, overrideCount: 0

# 5. Admin endpoint rejects unauthenticated
curl http://localhost:3001/api/admin/project-images/overrides
# Expected: 401 or redirect (cookie not present)

# 6. Insert a test override via psql and verify it appears in merged response
psql fourlinq -c "INSERT INTO project_image_override
  (organization_id, project_id, image_path, override_type)
  VALUES (1, 'las-pinas-residence', '/images/projects-fb/1624zR2K.jpg', 'hidden');"
curl http://localhost:3001/api/project-images/merged | python3 -c \
  "import json,sys; d=json.load(sys.stdin); print('hidden' in str(d['hiddenImages']))"
# Expected: True

# 7. Clean up test row
psql fourlinq -c "DELETE FROM project_image_override WHERE project_id='las-pinas-residence';"
```

---

## Phase 2 — Runtime Merge on /inspiration

### 2.1 Baseline fallback JSON file

The frontend cannot import the server's derived data directly at runtime. Instead, we extract
the four export arrays from the generated TS into a companion JSON file that the frontend also
ships in `dist/` and uses as an instant fallback:

**File to create:** `src/data/project-category-images.baseline.json` (auto-generated alongside
the existing TS; generated by `build-project-category-images.mjs` in the same run).

This file contains: `{ projectOrder, projectCategoryOrder, projectCategoryImages, projectDerivedTags }`.

Modify `scripts/build-project-category-images.mjs` to also write this JSON file (one extra
`fs.writeFileSync` call at the end of the script). The JSON is committed alongside the TS.

**Reason:** The TS file stays for type-checking and IDE support. The JSON is what the runtime
fallback reads.

### 2.2 Inspiration.tsx Changes

**Objective:** Replace the baked static import for order + override data with a live API call.
Keep the static import as the immediate fallback. The display-critical image data (categoryImages
per card) is also served from the API, not the static file, so any admin edits propagate
immediately.

**Changes to `src/pages/Inspiration.tsx`:**

1. Keep the existing static imports from `project-category-images.generated` as the
   `BASELINE` constants (renamed with `BASELINE_` prefix or used as default arg values).
2. Add a new `useState` for `mergedData` initialized from the static baseline.
3. Add a `useEffect` that calls `GET /api/project-images/merged`:
   - On success: update `mergedData` state.
   - On failure: leave `mergedData` as-is (static baseline stays).
   - AbortController for cleanup.
4. Replace all four references in `filtered` computation and `toView`:
   - `projectCategoryImages[p.id]` → `mergedData.projectCategoryImages[p.id]`
   - `projectDerivedTags[p.id]` → `mergedData.projectDerivedTags[p.id]`
   - `projectOrder` → `mergedData.projectOrder`
   - `projectCategoryOrder[active]` → `mergedData.projectCategoryOrder[active]`
5. No loading spinner on the merge fetch — the baseline renders immediately; the update is a
   silent replacement (same UX as the existing CMS projects fetch).

**Data flow:**

```
Component mounts
  → renders with BASELINE_ static data (instant paint)
  → useEffect fires, fetches /api/project-images/merged
  → on success: setMergedData(apiData)
    → filtered recomputes
    → CardImage crossfades (existing mechanism handles smooth swap)
  → on failure: no state change, static baseline stays
```

**Type additions** to `src/types/project-images.d.ts` (new file):
```typescript
export interface MergedProjectImagesResponse {
  projectCategoryImages: Record<string, Partial<Record<InspirationTag, string>>>;
  projectDerivedTags: Record<string, InspirationTag[]>;
  projectOrder: string[];
  projectCategoryOrder: Record<InspirationTag, string[]>;
  hiddenImages: Record<string, string[]>;
  replacedImages: Record<string, Record<string, string>>;
  overrideCount: number;
}
```

### 2.3 Phase 2 Verification Evidence

```bash
# 1. TypeScript compiles with new types and modified Inspiration.tsx
npm run typecheck

# 2. Build succeeds (JSON file ships in dist/)
npm run build

# 3. Dev browser smoke test — zero overrides
# Visit http://localhost:5173/inspiration
# Open DevTools Network tab
# Confirm: request to /api/project-images/merged returns 200
# Confirm: gallery renders identically to pre-change behavior

# 4. Zero-override idempotency test
# Insert no rows; confirm mergedData matches static baseline exactly (log both in console)

# 5. Live override test (without admin UI)
psql fourlinq -c "INSERT INTO project_image_override
  (organization_id, project_id, image_path, override_type, value_int)
  VALUES (1, 'las-pinas-residence', '__project__', 'project_order', 0);"
# Reload /inspiration — las-pinas-residence should now appear first in All view
# (it was ranked ~27th in the baseline)
psql fourlinq -c "DELETE FROM project_image_override WHERE project_id='las-pinas-residence';"
# Reload — should revert to baseline order

# 6. API failure fallback test
# Temporarily point /api/project-images/merged to a 500 route
# Confirm /inspiration still renders with baseline data (no blank page, no console errors)
```

---

## Phase 3 — Admin UI (Project Images Tab)

### 3.1 Install @dnd-kit

Add to dependencies (no DnD library currently exists in package.json):

```
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**@dnd-kit is chosen because:**
- Accessible (ARIA live regions, keyboard support built-in)
- Works with React 18 concurrent mode
- No global DOM side effects (Radix/shadcn compatible)
- Sortable preset covers all three drag use-cases (project order, category order, within-project image order)

### 3.2 Admin.tsx Changes

**Add tab:** `"images"` added to the tab union type and the tab bar.

```typescript
// Add to the tab type
type AdminTab = "leads" | "chats" | "content" | "team" | "images";

// Tab bar button (after Content, before Team)
<button onClick={() => setTab("images")} className={tabClass(tab === "images")}>
  <ImageIcon size={14} /> Project Images
</button>
```

The tab is visible to roles `admin` and `editor` (not `media`). Use the existing `isMediaOnly`
guard: `!isMediaOnly` gates the new tab button.

Tab render:
```typescript
{tab === "images" && !isMediaOnly && <ProjectImagesPanel />}
```

Import:
```typescript
import ProjectImagesPanel from "./admin/ProjectImagesPanel";
```

Add `ImageIcon` to the lucide-react import (check if already imported; if not, add it).

### 3.3 ProjectImagesPanel Component

**File to create:** `src/pages/admin/ProjectImagesPanel.tsx`

This is a self-contained panel using TanStack Query v5 (`useQuery`, `useMutation`).

#### Sub-views

The panel has two sub-views toggled by internal state:

1. **Project List view** — grid of all projects with their hero image, showing override badge counts.
2. **Project Detail view** — for one selected project, shows:
   - All images for that project (from API baseline response) with AI scores and reasoning.
   - Per-image controls: hide/unhide, replace (opens upload flow), mark as best for a category.
   - Per-category order drag list (which project should rank first in a category).
   - Within-project image order drag list.
   - Stale override warnings.

#### Data queries

```typescript
// All overrides (for badges and stale detection)
const overridesQuery = useQuery({
  queryKey: ["admin", "project-images", "overrides"],
  queryFn: () => fetch("/api/admin/project-images/overrides", { credentials: "include" })
              .then(r => r.json()),
});

// Baseline (project list + AI scores) — cached aggressively, rarely changes
const baselineQuery = useQuery({
  queryKey: ["admin", "project-images", "baseline"],
  queryFn: () => fetch("/api/admin/project-images/baseline", { credentials: "include" })
              .then(r => r.json()),
  staleTime: 5 * 60 * 1000,  // 5 minutes
});
```

#### Mutations (all invalidate `["admin", "project-images", "overrides"]` on success)

```typescript
const addOverride = useMutation({ mutationFn: (body) =>
  fetch("/api/admin/project-images/overrides", {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) });

const deleteOverride = useMutation({ mutationFn: (id: number) =>
  fetch(`/api/admin/project-images/overrides/${id}`, { method: "DELETE", credentials: "include" }) });
```

#### UI Sections in Project Detail view

**A. Image gallery with AI context (read-only AI data)**

For each image of the selected project (from baseline API):
- `<img>` thumbnail (64px)
- Four category score pills: Windows 82, Doors 0, Interior 91, Exterior 12
  (color-coded: ≥70 green, 50-69 yellow, <50 gray)
- Reasoning text (collapsed, expand on click)
- Override badges: "Hidden", "Replaced → /uploads/cms/xyz.jpg", "Best for: Interior"
- Action buttons: Hide / Unhide | Replace | Set as best for [category dropdown]
- Stale warning icon if override row is stale

**B. Hide image**

Button: "Hide" → calls `addOverride({ project_id, image_path, override_type: 'hidden' })`
Existing hidden images show "Unhide" button → calls `deleteOverride(row.id)`.

**C. Replace image**

Button: "Replace" → opens the existing CMS media upload widget or a file input wired to
`POST /api/admin/cms/media/upload` (existing endpoint, writes to `/uploads/cms/`).
On upload success (returns `{ url: "/uploads/cms/..." }`):
→ calls `addOverride({ project_id, image_path, override_type: 'replaced', value_text: url })`.

Re-use the existing `MediaLibrary` component from `packages/cms-rag/client/index` if it exposes
a file-picker-only mode. If not, use a plain `<input type="file">` wired to the upload endpoint.
Check `packages/cms-rag/client/index` exports during execution for available primitives.

**D. Set as best for category**

Select dropdown: [Windows / Doors / Interior / Exterior] + "Set as best" button.
→ calls `addOverride({ project_id, image_path, override_type: 'best_for_category', category })`.

**E. Project order drag (All view)**

`@dnd-kit/sortable` vertical list of all project IDs in current `projectOrder`.
On drag-end, compute new positions and call `addOverride` for each moved project (bulkable: loop
through changed positions). Show project name + hero thumbnail in each drag handle row.

**F. Per-category project order drag**

Category tab selector (Windows / Doors / Interior / Exterior) above the sortable list.
Each category has its own `projectCategoryOrder[cat]` drag list.
On drag-end, same UPSERT pattern for `category_order` rows.

**G. Within-project image order drag**

Sortable list of all images for the selected project.
On drag-end, UPSERT `image_order` rows with sequential `value_int` for changed positions.

**H. Stale overrides warning section**

If any override has `stale: true`, render a collapsible section:
"X stale override(s) found — these reference image paths no longer in the baseline."
Lists stale rows with a "Remove" button each (calls `deleteOverride`).

#### Loading and error states

- Skeleton cards while `baselineQuery.isLoading` or `overridesQuery.isLoading`.
- Error banner if either query errors (`baselineQuery.isError || overridesQuery.isError`).
- Optimistic UI is NOT used (mutations re-fetch after settle — keeps UI consistent with DB).

### 3.4 Phase 3 Verification Evidence

```bash
# 1. TypeScript compiles
npm run typecheck

# 2. Build succeeds
npm run build

# 3. Browser: admin UI loads Project Images tab
# Visit http://localhost:5173/admin, log in as admin
# Click "Project Images" tab
# Confirm: project grid loads, project thumbnails visible

# 4. Hide an image
# Click a project → click "Hide" on an image
# Confirm: override row appears in overrides list (check via admin GET overrides)
# Open /inspiration — confirm that image no longer shows in "All" view for that project
# Click "Unhide" — confirm image returns on /inspiration

# 5. Replace an image
# Click "Replace" → upload a test image
# Confirm: upload goes to /uploads/cms/; override row saved
# Confirm: /inspiration shows new URL for that slot

# 6. Set best-for-category override
# Select project, pick Windows category, click "Set as best" on a different image
# Confirm: /inspiration > Windows filter shows the newly selected image for that project

# 7. Drag project order
# Drag a project to position 1 in the "All projects" order list
# Confirm: /inspiration All tab shows it first

# 8. Stale override detection
# Manually INSERT an override with a non-existent image_path:
#   psql fourlinq -c "INSERT INTO project_image_override
#     (organization_id, project_id, image_path, override_type)
#     VALUES (1, 'las-pinas-residence', '/images/projects-fb/STALE_PATH.jpg', 'hidden');"
# Open admin Project Images, select las-pinas-residence
# Confirm: stale warning badge visible, "Remove" removes the row
```

---

## Phase 4 — Polish, Error Handling, and Final Verification

### 4.1 Error handling hardening

**Server:**
- All admin route handlers: wrap DB calls in try/catch, return `{ error: message }` + 4xx/5xx.
- Public `/merged` endpoint: if DB fails, log error and return pure baseline (not 500). This is
  the critical "graceful fallback" guarantee.
- Baseline TTL: add `forceRefresh` query param (`?_r=1`) that skips TTL for admin-triggered
  refreshes without restarting the server.

**Client (ProjectImagesPanel):**
- Mutation error toast using `@radix-ui/react-toast` (already installed, used elsewhere in admin).
- Show last-sync timestamp in panel header.

### 4.2 THRESHOLD synchronization note

The `THRESHOLD = 50` constant used for baseline derivation exists in:
1. `scripts/build-project-category-images.mjs`
2. `server/routes/project-images.ts` (new)

These must match. If the threshold is tuned, both files must be updated together. Add a comment
to both files: `// SYNC: must match THRESHOLD in [other file]`.

### 4.3 Pipeline re-run safety

When `npm run projects:images` re-runs (e.g., after new AI analysis), it re-writes:
- `server/data/project-image-analysis.json` — baseline TTL cache invalidates within 60 seconds
- `src/data/project-category-images.generated.ts` — baked into next deploy's `dist/`
- `src/data/project-category-images.baseline.json` — new file, also baked

Overrides in Postgres are unaffected. On next public API call:
- The new baseline is loaded (TTL expired or server restarted).
- Overrides are re-merged on top.
- If a baseline change removed an image that an override references, `stale: true` is returned
  in the admin GET — visible immediately in admin UI.

### 4.4 Deploy safety

Sequence for production deploy after this feature ships:

1. Apply migration 014 on VPS before deploying new code:
   ```
   ssh advo
   sudo -u postgres psql fourlinq -f /opt/fourlinq/server/migrations/014_project_image_overrides.sql
   ```
2. Push to main (GitHub Actions: build → rsync → pm2 restart).
3. Smoke test: `curl https://fourlinq.ph/api/project-images/merged | python3 -m json.tool | head -10`
4. Visit `/inspiration` — verify identical to pre-deploy (zero overrides state).
5. Visit `/admin` — verify Project Images tab loads.

**Rollback plan:** If the new route causes issues, revert is:
- Remove the two `app.use(...)` lines added to `server/index.ts`.
- Revert `src/pages/Inspiration.tsx` to static imports only.
- The `project_image_override` table can stay (no harm if unused).
- Deploy takes effect on next rsync + pm2 restart.

### 4.5 Phase 4 Verification Evidence

```bash
# 1. Full TypeScript build
npm run typecheck && npm run build
# Expected: zero errors, dist/ produced

# 2. Existing tests pass
npm run test
# Expected: zero regressions

# 3. /inspiration with zero overrides = identical to pre-change
# Load /inspiration in a browser side-by-side with a git-stash of the old code
# Order, images, and filtering must be pixel-identical

# 4. API failure recovery
# Kill the dev API server while /inspiration is open
# Confirm: page still renders (static baseline), no white screen, no JS error in console
# Restart API server — no page reload needed; next navigation to /inspiration fetches fresh

# 5. Production smoke (post-deploy)
curl https://fourlinq.ph/api/project-images/merged | python3 -m json.tool
# Expected: valid JSON, overrideCount: 0, projectOrder array non-empty

# 6. End-to-end override round-trip on prod
# Log into prod /admin, set one project_order override
# Visit /inspiration — project should appear at the chosen position
# Remove the override — /inspiration reverts within 30 seconds (cache-control max-age=30)
```

---

## Implementation Checklist

Steps are ordered for safe, phase-gated execution. Phases must be verified before proceeding.

### Phase 1 — DB + API

1. Create `server/migrations/014_project_image_overrides.sql` with table, indexes, GRANT, comment.
2. Apply migration locally: `psql fourlinq -f server/migrations/014_project_image_overrides.sql`.
3. Create `server/routes/project-images.ts`:
   a. `BaselineData` type and `loadBaseline()` with 60-second TTL.
   b. Merge algorithm function `buildMergedResponse(baseline, overrides)`.
   c. `projectImagesPublic` router with `GET /merged`.
   d. `projectImagesAdmin` router with `GET /overrides`, `POST /overrides`, `DELETE /overrides/:id`, `GET /baseline`.
   e. Stale detection in `GET /overrides`.
4. Add to `server/index.ts`: import both routers and mount at `/api/project-images` and `/api/admin/project-images`.
5. Run `npm run typecheck` — must pass zero errors.
6. Run `npm run dev:api` and execute all Phase 1 curl checks above.

### Phase 2 — Runtime Merge on /inspiration

7. Modify `scripts/build-project-category-images.mjs` to also write `src/data/project-category-images.baseline.json` (same four exports serialized as JSON).
8. Run `npm run projects:images` to generate the baseline JSON file.
9. Create `src/types/project-images.d.ts` with `MergedProjectImagesResponse` interface.
10. Modify `src/pages/Inspiration.tsx`:
    a. Add `useState<MergedProjectImagesResponse>` initialized from static `BASELINE_` imports.
    b. Add `useEffect` calling `GET /api/project-images/merged` with AbortController.
    c. Replace four static references with `mergedData.*` equivalents.
    d. Keep static imports as the baseline initial state value (renamed `BASELINE_*`).
11. Run `npm run typecheck` — must pass.
12. Run `npm run build` — must produce clean `dist/`.
13. Execute all Phase 2 browser verification steps above (including manual DB override test).

### Phase 3 — Admin UI

14. Install DnD library: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
15. Add `"images"` tab to `Admin.tsx`:
    a. Extend tab union type.
    b. Add tab button (gated to `!isMediaOnly`).
    c. Add `ImageIcon` to lucide-react import.
    d. Add `{tab === "images" && !isMediaOnly && <ProjectImagesPanel />}` render.
    e. Add import of `ProjectImagesPanel`.
16. Create `src/pages/admin/ProjectImagesPanel.tsx`:
    a. Project List view with `baselineQuery` and `overridesQuery`.
    b. Project Detail view triggered by project selection.
    c. Section A: image gallery with AI scores + reasoning (read-only display).
    d. Section B: Hide / Unhide controls (`hidden` override type).
    e. Section C: Replace image (file input → upload → `replaced` override).
    f. Section D: Set best for category dropdown + button.
    g. Section E: All-projects order drag list (`project_order` overrides).
    h. Section F: Per-category order drag list (`category_order` overrides).
    i. Section G: Within-project image order drag list (`image_order` overrides).
    j. Section H: Stale overrides warning section.
    k. Loading skeletons and error banner.
17. Run `npm run typecheck` — must pass.
18. Run `npm run build` — must pass.
19. Execute all Phase 3 browser verification steps above.

### Phase 4 — Polish and Final Verification

20. Harden server route error handling: try/catch on all DB calls, graceful fallback in `/merged`.
21. Add `forceRefresh` query param to bypass baseline TTL.
22. Add `Cache-Control: public, max-age=30, stale-while-revalidate=300` header to `/merged`.
23. Add THRESHOLD sync comment to both `build-project-category-images.mjs` and `project-images.ts`.
24. Add mutation error toast in `ProjectImagesPanel.tsx` using `@radix-ui/react-toast`.
25. Run `npm run typecheck && npm run build && npm run test` — all must pass.
26. Execute all Phase 4 verification steps above.
27. Apply migration 014 on VPS (before deploying code — see deploy sequence in Phase 4.4).
28. Deploy: `git push origin main` (triggers GitHub Actions auto-deploy).
29. Production smoke test (curl + browser).

---

## Touchpoints

| File | Change type | Notes |
|---|---|---|
| `server/migrations/014_project_image_overrides.sql` | New file | One-way; apply before deploy |
| `server/routes/project-images.ts` | New file | Exports two routers |
| `server/index.ts` | Modified | 2 new `app.use(...)` mount lines + 1 import |
| `server/data/project-image-analysis.json` | Read only | Baseline input; never written by this feature |
| `server/data/projects-images.json` | Read only | Canonical project+image order |
| `scripts/build-project-category-images.mjs` | Modified | Add JSON sidecar write at end |
| `src/data/project-category-images.baseline.json` | New file (generated) | Written by projects:images script; committed |
| `src/data/project-category-images.generated.ts` | Unchanged | Still built, still ships in dist/ |
| `src/types/project-images.d.ts` | New file | MergedProjectImagesResponse type |
| `src/pages/Inspiration.tsx` | Modified | Replace 4 static refs with mergedData.*; add fetch effect |
| `src/pages/Admin.tsx` | Modified | Add "images" tab + import |
| `src/pages/admin/ProjectImagesPanel.tsx` | New file | Full panel component |
| `package.json` | Modified | Add @dnd-kit/* dependencies |

---

## Public Contracts

| Contract | Owner | Consumer |
|---|---|---|
| `GET /api/project-images/merged` → `MergedProjectImagesResponse` | `server/routes/project-images.ts` | `src/pages/Inspiration.tsx` |
| `GET /api/admin/project-images/overrides` | server admin router | `ProjectImagesPanel.tsx` |
| `POST /api/admin/project-images/overrides` | server admin router | `ProjectImagesPanel.tsx` |
| `DELETE /api/admin/project-images/overrides/:id` | server admin router | `ProjectImagesPanel.tsx` |
| `GET /api/admin/project-images/baseline` | server admin router | `ProjectImagesPanel.tsx` |
| `UNIQUE (org, project_id, image_path, override_type, category)` | DB schema | all server route UPSERTs |
| `THRESHOLD = 50` | `build-project-category-images.mjs` + `project-images.ts` | both must stay in sync |

---

## Blast Radius

**High risk:**
- `src/pages/Inspiration.tsx` — core visitor-facing page. The static baseline guards against
  API failure, but the refactor touches the filtering/sorting logic. Must be tested with zero
  overrides to confirm no regression.

**Medium risk:**
- `server/index.ts` — adding two mount lines; incorrect path ordering could shadow existing routes.
  The new `/api/project-images` and `/api/admin/project-images` prefixes do not conflict with
  any existing routes (verified: no existing `/api/project-images*` routes).
- `scripts/build-project-category-images.mjs` — adding a JSON sidecar write is additive; the
  TS output is unchanged. Risk: the JSON path must be correct (`src/data/project-category-images.baseline.json`).

**Low risk:**
- `server/migrations/014_project_image_overrides.sql` — new table, no FK changes to existing tables.
- `src/pages/Admin.tsx` — new tab added; existing tabs unaffected.
- `src/pages/admin/ProjectImagesPanel.tsx` — new file; no existing component tree changed.
- `package.json` + @dnd-kit — additive install; no shared code modified.

**No risk:**
- `server/data/project-image-analysis.json` — read-only.
- `src/data/project-category-images.generated.ts` — unchanged content; still built.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| /inspiration performance regression from API fetch | Medium | High | Static baseline renders immediately; API fetch is background; no waterfall |
| THRESHOLD drift between script and server route | Low | Medium | Add SYNC comment to both files; document in Phase 4 checklist |
| `project-category-images.baseline.json` not committed | Low | Low | Script writes it; CI build imports the TS version; baseline JSON is for runtime only |
| Stale overrides accumulate silently | Medium | Low | Stale detection in GET /overrides + admin UI warning; cleanup button per stale row |
| DnD reorder race condition (concurrent admins) | Low | Low | UPSERT semantics + "last writer wins" for order; fine for internal dev tool |
| projects:images re-run clears a replaced image from baseline | Low | Medium | Admin sees `stale: true` for replaced override; can re-upload and re-override |
| Upload endpoint returns error during Replace flow | Low | Low | Upload error is surfaced in admin UI; no override is saved on failed upload |
| Migration applied after code deploy | Medium | High | Deploy sequence in Phase 4.4 explicitly puts migration first; document in team wiki |

---

## Acceptance Criteria (testable)

All of the following must be true before this feature is considered complete:

1. `server/migrations/014_project_image_overrides.sql` applies cleanly on a fresh Postgres instance.
2. `GET /api/project-images/merged` returns valid JSON with `overrideCount: 0` when the DB table
   is empty, and the `projectOrder` array matches the baseline generated file.
3. `GET /api/project-images/merged` with DB rows present returns overrides correctly merged.
4. `GET /api/admin/project-images/overrides` returns 401 for unauthenticated requests.
5. Inserting a `hidden` override for an image causes that image to disappear from the merged
   response for that project.
6. Inserting a `replaced` override causes the public merged response to return the new URL for
   that slot.
7. Inserting a `project_order` override with `value_int = 0` causes the project to appear first
   in `projectOrder` in the public merged response.
8. `/inspiration` renders identically with zero overrides compared to the pre-change baseline
   (pixel check or manual side-by-side at minimum).
9. `/inspiration` reflects admin overrides within 30 seconds of the override being saved (or
   immediately on page reload).
10. API failure on `/api/project-images/merged` leaves `/inspiration` rendering normally from
    static baseline — no blank screen, no console error.
11. `/admin` > Project Images tab loads for admin and editor roles; is hidden for media role.
12. All four admin operations (hide, replace, set-best-for-category, drag-order) complete without
    TypeScript errors and produce correct DB rows.
13. Stale overrides are flagged with `stale: true` in the admin API response and with a visual
    warning in the admin UI.
14. `npm run typecheck` exits 0.
15. `npm run build` exits 0.
16. `npm run test` exits 0 (no regressions in existing test suite).

---

## Integration Notes

- **Parallel task dependency:** `scripts/reorder-project-images.mjs` (in flight) will update
  `src/data/projects.ts` and re-derive `projects-images.json`. This plan's server route reads
  `projects-images.json` for canonical image order. The plan is safe to execute before or after
  that script settles; the baseline loader picks up the latest version whenever the TTL expires.
- **CMS projects entity:** `cms_project` rows in Postgres are a separate concern (project metadata
  for the CMS). The overrides table uses the same `project_id` slug but does not FK to `cms_project`
  to avoid coupling to CMS migration state.
- **Admin upload endpoint:** `POST /api/admin/cms/media/upload` already exists and writes to
  `/uploads/cms/`. The Replace flow in admin re-uses this endpoint directly; no new upload endpoint
  is needed.
- **org_id = 1:** All override queries hard-code `organization_id = 1`. This matches every other
  CMS table usage in this codebase.

---

## Verification Evidence Summary

| Phase | Gate | Evidence |
|---|---|---|
| 1 | DB + API working | curl checks; test INSERT → merged response includes it; 401 on unauthed admin |
| 2 | /inspiration live merge | browser: zero-override identical; manual psql INSERT changes visible; API failure → baseline |
| 3 | Admin UI full flow | browser: all four override types work end-to-end; stale detection visible |
| 4 | Production ready | typecheck + build + test pass; prod smoke test; deploy sequence correct |

---

## Resume and Execution Handoff

**Plan file:** `/Users/princewagan/fourlinq/process/general-plans/active/project-images-admin_PLAN_22-07-26.md`

**Execute agent start point:** Step 1 (create migration file). Execute one phase at a time;
verify each phase gate before proceeding to the next phase.

**Files to pass to vc-execute-agent (Phase 1):**
- This plan file (primary).
- `server/index.ts` (mount points; lines 56-67 area for insert position).
- `server/auth.ts` (requireRole import reference).
- `server/db.ts` (pool import pattern).
- `server/migrations/013_cms_document.sql` (migration file format reference).
- `server/data/projects-images.json` (baseline image order format — first 5 lines to understand shape).
- `server/data/project-image-analysis.json` (manifest format — first 30 lines).

**Files to pass to vc-execute-agent (Phase 2):**
- This plan file (primary).
- `scripts/build-project-category-images.mjs` (to add JSON sidecar write).
- `src/pages/Inspiration.tsx` (full file — the static import section and filtered useMemo).
- `src/data/project-category-images.generated.ts` (first 15 lines — to understand export shape for types).

**Files to pass to vc-execute-agent (Phase 3):**
- This plan file (primary).
- `src/pages/Admin.tsx` (full file — tab pattern, role guards, import section).
- `src/pages/admin/UsersPanel.tsx` (pattern reference for admin sub-panel components).
- `packages/cms-rag/client/index` exports list (check for upload primitive; pass if found).

**Files to pass to vc-execute-agent (Phase 4):**
- This plan file (primary).
- All four files modified in Phases 1-3 (their current state at that point).

**Phase completion tokens:**
- Phase 1 complete when: `npm run typecheck` passes + all Phase 1 curl checks pass.
- Phase 2 complete when: `npm run build` passes + Phase 2 live override browser test passes.
- Phase 3 complete when: `npm run build` passes + all Phase 3 browser flow verifications pass.
- Phase 4 complete when: all 16 Acceptance Criteria are checked.

**No prior conflicting plan.** The `ai-project-image-selection_PLAN_22-07-26.md` plan is now
COMPLETE (it built the baseline this plan sits on top of); it should not be modified.

# Project image analysis (per-category "best image")

The `/inspiration` gallery decides **which categories a project belongs to**,
**which image to show in each category view**, and **what order to show
projects in (best pictures first)** — all from the project's actual photos,
scored by AI vision. A project appears under a category only if its best image
for that category clears the threshold — "best image, or no image".

Two AI signals, both stored in `project-image-analysis.json`:
- **Per-image category scores** (windows/doors/interior/exterior, 0–100) → best
  image per category + category membership.
- **Per-project hero quality** (`quality.heroScore` 0–100 + `quality.enhanced`)
  → gallery ordering. Enhanced (professionally graded/high-res) heroes rank
  above raw phone/Facebook snapshots.

## Files

| File | Role | Commit? |
|---|---|---|
| `projects-images.json` | Canonical project → image-path map, extracted from `src/data/projects.ts`. Regenerable. | yes |
| `project-image-analysis.json` | **Source of truth.** AI vision scores (0–100 per category) + reasoning, keyed by image path, with a per-project `finished` flag. This is the durable "embedding". | yes |
| `project-image-analysis-report.md` | Human spot-check table: project → category → chosen file → score → kept? | yes |
| `../../src/data/project-category-images.generated.ts` | Generated frontend data the gallery imports. **Never hand-edit.** | yes |

## How selection works

`build-project-category-images.mjs` reads the manifest and, for each project and
each of windows/doors/interior/exterior, picks the highest-scoring image. If that
best score is `>= THRESHOLD` (currently **50**, a constant in the script) the
category is kept and its best image is recorded; otherwise the project drops out
of that category. No AI runs here — it is a pure transform.

It also emits the gallery ordering into `project-category-images.generated.ts`:
- `projectOrder` — all projects by `quality.heroScore` desc (enhanced wins ties);
  used by the "All projects" view.
- `projectCategoryOrder` — per category, the qualifying projects ordered by their
  best image's score FOR THAT category; used by each filter view.

## First-image convention (best exterior → best interior)

The first image of each project (the `image` field in `src/data/projects.ts`) is
kept in the following priority order by `scripts/reorder-project-images.mjs`:

1. **Best exterior image** — the image with the highest `scores.exterior` that
   also clears the threshold (≥ 50). Tiebreak: highest interior score, then
   earlier original position.
2. **Best interior image** (fallback) — if no exterior image clears the threshold,
   use the image with the highest `scores.interior` (any value).
3. **Untouched** — projects with a single image, or no analysis data, keep their
   current order.

Re-run after adding new images or after adjusting analysis scores:

```
npm run projects:reorder
npm run projects:extract
npm run projects:images
```

The `projects:reorder` script is idempotent: running it twice produces the same
result.

## Re-tuning the threshold (no re-analysis)

Edit `THRESHOLD` in `scripts/build-project-category-images.mjs`, then:

```
npm run projects:images
```

Scores already live in the manifest, so membership re-derives instantly.

## Swapping an enhanced image (same path → no re-analysis)

Replace the file at the same `/images/projects-fb/<name>.jpg` path. The manifest
is keyed by path, so its score carries over. Nothing to run (optionally
`npm run projects:images` to be safe). If the **path changes**, re-analyze that
project (below).

## Adding a new project, or new photos to an existing one

1. Add/extend the entry in `src/data/projects.ts` (new image files in `public/images/projects-fb/`).
2. Regenerate the image map:  `npm run projects:extract`
3. Have Claude score ONLY the new/changed project(s) in a session, writing into
   `project-image-analysis.json` under the project id with `"finished": true`:
   - `images[].scores` — the 0–100 per-category rubric (windows/doors/interior/exterior).
   - `quality` — `{ heroScore 0–100, enhanced bool, enhancedConfidence 0–100, notes }`
     for the hero image (index 0), so the project can be ordered.
   Unanalyzed projects are reported by step 4 as MISSING (analysis and/or quality)
   and fall back to their hand tags / sort last until scored.
4. Rebuild:  `npm run projects:images`  — prints coverage (`Covered: N/M`,
   `Hero-quality: N/M`) and flags any MISSING project so nothing is silently skipped.

> Tip: the fan-out that first built this used one Claude subagent per batch of
> projects reading the real images. Contiguous index ranges are more reliable to
> shard than modulo — but either way, the generator's MISSING check is the
> backstop that catches any gap for a quick re-run.

The `finished: true` flag is how a project is marked done; new projects are not
finished until they have scores, so re-runs only touch new work.

# Project Detail — Immersive Gallery Redesign
**Plan:** project-detail-immersive-gallery_PLAN_25-07-26.md
**Complexity:** SIMPLE (one session)
**Date:** 25-07-26

---

## Overview

Redesign the project detail page hero area into a full-screen-height immersive gallery with a vertical thumbnail rail on the right. The title is overlaid on the large photo with a single scrim. Location caption is removed entirely. A parallel fix tightens server-side Cache-Control for `/images/` so regenerated/replaced images propagate to returning visitors within one hour instead of thirty days.

---

## Goals

1. Full-screen-height hero (left panel, large photo) + fixed-width vertical thumbnail rail (right panel) on desktop.
2. Mobile: stacked — hero image `68svh` + horizontal/grid thumbnail strip below.
3. Title overlaid bottom-left on the large photo behind a single bottom-up gradient scrim; no location text anywhere in the hero.
4. Delete `ProjectPhotoSwitcher.tsx` after replacing it with `ProjectHeroGallery.tsx`.
5. Expire stale static images within one hour (not thirty days) via `setHeaders` in `server/index.ts`.

---

## Scope

### In scope
- `src/components/shared/ProjectHeroGallery.tsx` — new file (create)
- `src/components/shared/ProjectPhotoSwitcher.tsx` — delete after migration
- `src/pages/ProjectDetail.tsx` — replace switcher, remove `PageHeader`, drop captions, adjust following section padding
- `server/index.ts` — add `setHeaders` to `express.static` call at line 92

### Out of scope (explicit non-goals)
- All other 13 consumers of `PageHeader` — untouched
- `projectRatios` fetch in `ProjectDetail.tsx` — keep as-is (ratio prop removed from hero, but the fetch itself may still exist; do not break it)
- Claude-vision re-scoring of `server/data/project-image-analysis.json` (optional follow-up, NOT this session)
- Any other page, route, or component

---

## Touchpoints (exact files)

| File | Change |
|---|---|
| `src/components/shared/ProjectHeroGallery.tsx` | CREATE — new immersive gallery component |
| `src/components/shared/ProjectPhotoSwitcher.tsx` | DELETE — after zero remaining consumers confirmed |
| `src/pages/ProjectDetail.tsx` | MODIFY — swap component, remove PageHeader, drop captions, fix padding |
| `server/index.ts` | MODIFY — `setHeaders` for `/images/` Cache-Control |

Supporting read-only references (no modification):
- `src/components/primitives/AccentStripe.tsx` — imported into new component
- `src/components/layout/Layout.tsx` — confirms nav spacer height (72px)
- `src/components/WhyUpvc.tsx` line 104 — full-height precedent pattern

---

## Blast Radius

- **`ProjectPhotoSwitcher.tsx` deletion**: ProjectDetail.tsx is its ONLY consumer (confirmed by research). Deletion is safe once ProjectDetail no longer imports it. Run `grep -r "ProjectPhotoSwitcher" src/` before deleting to confirm zero remaining references.
- **`PageHeader` removal from ProjectDetail**: 13 other consumers are untouched; this change is local to ProjectDetail.tsx only.
- **`server/index.ts` cache fix**: The `setHeaders` guard checks `req.path.startsWith('/images/')`. All other paths fall through to the existing `maxAge: "30d", immutable: true` behavior, which is correct for hashed bundle assets (JS/CSS with content-hash filenames). Images served from `/images/` are NOT content-hashed (replaced in-place), so they must NOT carry `immutable`. Verify with curl after deploy.
- **No schema changes, no new dependencies, no auth surface touched.**

---

## Design Tokens Reference (encode in component)

| Token | Value |
|---|---|
| Nav height | 72px (fixed, spacer injected by Layout) |
| Hero section height | `calc(100dvh - 72px)` |
| Mobile hero height | `h-[68svh]` |
| Section padding | `p-3 lg:p-4` |
| Gap between panels | `gap-3 lg:gap-4` |
| Right rail width | `w-[280px] xl:w-[320px]` |
| Thumbnail aspect | `aspect-[4/3]` |
| Thumb grid (≤6 photos) | `grid-cols-1 gap-3` |
| Thumb grid (>6 photos) | `grid-cols-2 gap-2` |
| Scrim gradient | `bg-gradient-to-t from-black/65 via-black/25 to-transparent` |
| Scrim height coverage | bottom 45% (`h-[45%]` absolute positioned) |
| Title overlay padding | `p-8 lg:p-12` |
| Title font | `font-serif` (Fraunces) |
| Title size | `text-h3 lg:text-h2 xl:text-h1` |
| Title color | `text-white` + `drop-shadow` |
| Title tracking | `tracking-tight` |
| AccentStripe | ~~`<AccentStripe width="sm" color="accent" />` above title~~ **[USER AMENDED 2026-07-25: removed — overlay is scrim + serif white title only; no AccentStripe in hero]** |
| Active thumb ring | `ring-1 ring-[color:var(--accent)] opacity-100` |
| Inactive thumb ring | `ring-1 ring-[color:var(--rule-soft)] opacity-70 hover:opacity-100` |
| Transition | `duration-500 ease-marvin` |
| ease-marvin | `cubic-bezier(.68,0,.33,1)` |
| Mobile thumb strip | `grid-cols-4 gap-2` (below hero, full-width) |

Design rules enforced:
- ONE scrim, no stacked gradients
- `ring-1` only (NOT ring-2 from old switcher)
- ~~Accent red once per fold (AccentStripe above title only)~~ **[USER AMENDED 2026-07-25: AccentStripe removed from hero entirely]**
- No `border-2`, no `shadow-xl`
- `prefers-reduced-motion` handled globally by CSS — no JS needed in component

---

## Implementation Checklist

### Step 1 — Create `ProjectHeroGallery.tsx`

**File:** `src/components/shared/ProjectHeroGallery.tsx`

Create the component with these exact behaviors:

**Props interface:**
```
interface ProjectHeroGalleryProps {
  photos: Array<{ src: string; alt: string }>  // no caption field
  title: string
  className?: string
}
```

**State:** `hoveredIdx: number | null`, `pinnedIdx: number` (both initialized same as old switcher).

**activeIdx logic:** `activeIdx = hoveredIdx ?? pinnedIdx`

**Hover gating:** Use `matchMedia('(hover: hover)')` check on `onMouseEnter`/`onMouseLeave` so touch devices skip hover state. Reference the existing convention from `ProjectPhotoSwitcher.tsx` — wrap `setHoveredIdx` calls with the hover-media check.

**Desktop layout (lg+):**
- Outer `<section>`: `h-[calc(100dvh-72px)] p-3 lg:p-4 flex flex-row gap-3 lg:gap-4`
- Left panel: `relative flex-1 overflow-hidden` — photos stacked `absolute inset-0 w-full h-full object-cover`, toggled by `opacity-100`/`opacity-0`, transition `duration-500 ease-marvin`
- Title scrim: `absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none`
- Title content: `absolute bottom-0 left-0 p-8 lg:p-12` — `<h1 className="font-serif text-h3 lg:text-h2 xl:text-h1 tracking-tight text-white drop-shadow">{title}</h1>` **[USER AMENDED 2026-07-25: AccentStripe removed — no red stripe in hero overlay]**
- Right rail: `w-[280px] xl:w-[320px] h-full overflow-y-auto` with custom scrollbar hidden but scroll functional (`scrollbar-width: none` / `::-webkit-scrollbar { display: none }`  — inline style or Tailwind plugin as already used in project); thumbnails `<button>` wrapping `<img>` with `w-full aspect-[4/3] object-cover`; grid class switches on `photos.length > 6`: `grid-cols-1 gap-3` vs `grid-cols-2 gap-2`; active thumb: `ring-1 ring-[color:var(--accent)] opacity-100`; inactive: `ring-1 ring-[color:var(--rule-soft)] opacity-70 hover:opacity-100 transition-opacity duration-300 ease-marvin`

**Mobile layout (<lg):**
- Outer section: `lg:hidden` variant — `flex flex-col p-3 gap-3`
- Hero image: `relative h-[68svh] overflow-hidden w-full` — same photo stack + title overlay (identical scrim + h1 as desktop; **[USER AMENDED 2026-07-25: no AccentStripe in hero overlay]**)  
- Thumbnail strip below: `grid grid-cols-4 gap-2 w-full` — same button/img pattern, no hover state (tap = setPinnedIdx only; `onMouseEnter` guard prevents touch hover pollution); active/inactive ring same as desktop

**Export:** `export default ProjectHeroGallery` and `export type { ProjectHeroGalleryProps }`

---

### Step 2 — Modify `ProjectDetail.tsx`

**File:** `src/pages/ProjectDetail.tsx`

Changes in order:

1. **Replace import** — remove `ProjectPhotoSwitcher, { type ProjectPhoto }` import; add `import ProjectHeroGallery from "@/components/shared/ProjectHeroGallery"`. Remove `import PageHeader from "@/components/shared/PageHeader"`.

2. **Update `galleryPhotos`** (lines 107–114) — rename to `galleryPhotos` or keep name; drop `caption` fields entirely. New shape: `Array<{ src: string; alt: string }>`. Specifically:
   ```
   Line 108: { src: selectedProject.image, alt: selectedProject.name }   // no caption
   Line 111: { src, alt: `${selectedProject.name} detail ${i + 1}` }     // no caption
   ```

3. **Remove `<PageHeader>` block** (lines 118–121) entirely, including any surrounding blank lines.

4. **Remove the switcher wrapper `<div className="mb-20 lg:mb-28">` and its `<ProjectPhotoSwitcher .../>` child** (lines 126–132). Replace with `<ProjectHeroGallery photos={galleryPhotos} title={selectedProject.name} />` — placed OUTSIDE the `container-editorial` div, directly inside `<Layout>`, so it is full-width (matches full-screen intent).

5. **Adjust the following section** — the `<section className="pb-section-mobile ...">` at line 123 that wraps `container-editorial` currently relied on `PageHeader` providing top spacing. Add `pt-section-mobile md:pt-section-tablet lg:pt-section-desktop` to this section's className so the meta grid has breathing room below the hero.

6. **Keep `projectRatios` fetch** as-is — do not remove it; it is not the hero's concern anymore but may be used elsewhere or simply left inert to avoid churn.

7. **Keep `ratio` prop removed** from the `ProjectPhotoSwitcher` call (it's gone) — no `ratio` prop on `ProjectHeroGallery`.

---

### Step 3 — Delete `ProjectPhotoSwitcher.tsx`

Before deleting, run:
```
grep -r "ProjectPhotoSwitcher" /Users/princewagan/fourlinq/src/
```
Expected output: zero matches (after Step 2 import removal). If zero matches confirmed, delete the file:
```
rm /Users/princewagan/fourlinq/src/components/shared/ProjectPhotoSwitcher.tsx
```

---

### Step 4 — Fix Cache-Control in `server/index.ts`

**File:** `server/index.ts` — line 92

Current:
```ts
app.use(express.static(distPath, { maxAge: "30d", immutable: true }));
```

Replace with:
```ts
app.use(
  express.static(distPath, {
    maxAge: "30d",
    immutable: true,
    setHeaders(res, filePath) {
      if (filePath.includes("/images/")) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=3600, stale-while-revalidate=86400"
        );
      }
    },
  })
);
```

Rationale: Hashed bundle assets (JS/CSS files with content-hash in their filenames) are safe with `immutable` because a new deploy produces a new filename. Images are served from `/images/` without content-hash (replaced in-place by the image regen pipeline), so they must NOT be immutable. `max-age=3600` + `stale-while-revalidate=86400` means: serve fresh within 1 hour, serve stale for up to 24 hours while revalidating in background. This is compliant with the push-to-live checklist (sync CMS → images refresh within the hour after deploy).

Note: `setHeaders` is called with `(res, filePath)` where `filePath` is the absolute filesystem path to the file being served. Using `.includes("/images/")` is robust since the images directory is at `dist/images/`.

---

## Verification Steps

Run all of the following before marking this plan complete:

### 1. TypeScript typecheck
```bash
cd /Users/princewagan/fourlinq && npx tsc --noEmit
```
Expected: zero errors.

### 2. Unit + component test suite
```bash
cd /Users/princewagan/fourlinq && npm test
```
Or if vitest is the runner:
```bash
cd /Users/princewagan/fourlinq && npx vitest run
```
Check `package.json` `"scripts"."test"` to confirm runner. Expected: `src/test/project-detail-route.test.tsx` and `project-routing.test.ts` pass. Zero regressions.

### 3. Dev-server visual check
Start dev server:
```bash
cd /Users/princewagan/fourlinq && npm run dev
```
Open a project URL: `http://localhost:5173/inspiration/<any-slug>` (e.g. the first slug from `src/data/projects.ts`).

Checklist:
- [ ] Hero fills full-screen height (approximately viewport - 72px) on desktop
- [ ] Large photo occupies left ~75-80% of the hero
- [ ] Right thumbnail rail is visible, fixed width, scrollable if many photos
- [ ] Title appears overlaid bottom-left with a visible gradient scrim behind it
- [ ] AccentStripe (red, 48px) appears above the title
- [ ] NO location text visible anywhere in the hero area
- [ ] Thumbnail click changes large photo (crossfade)
- [ ] Thumbnail hover previews photo on desktop, tap pins on mobile
- [ ] At >6 photos: rail switches to 2-column grid (spot-check with a project that has 7+ images)
- [ ] Active thumbnail shows red ring; inactive shows soft gray ring
- [ ] Mobile: stacked layout — hero image at 68svh, 4-column thumbnail strip below
- [ ] Below hero: meta grid, description, systems, quote, CTA all still present and padded correctly

### 4. Cache-Control header verification (production or local with NODE_ENV=production)
```bash
curl -I http://localhost:8080/images/<any-image-filename>.webp
```
Expected header: `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`

```bash
curl -I http://localhost:8080/assets/<any-bundle-hash>.js
```
Expected header: `Cache-Control: public, max-age=2592000, immutable` (or similar 30d + immutable from express.static default serialization).

---

## Dependencies

- `AccentStripe` at `src/components/primitives/AccentStripe.tsx` — must exist (confirmed in research). Import path: `@/components/primitives/AccentStripe`.
- `cn` utility from `@/lib/utils` — already used in old switcher, carry it into new component.
- No new npm packages required.
- `express` `setHeaders` option is built-in — no new server dependencies.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `dvh`/`svh` units unsupported in old browsers | These units are supported in all evergreen browsers (Chrome 108+, Safari 15.4+, Firefox 101+). FourlinQ's audience is modern; WhyUpvc already uses `100vh` as a fallback — acceptable. |
| Scrollbar hiding removes accessibility affordance | Scrollbar is hidden visually but scroll is still functional. Keyboard navigation (Tab into rail, arrow keys on thumb buttons) must still work. Verify in Step 3. |
| `setHeaders` filePath check misses some images | `filePath.includes("/images/")` matches the dist output directory. Confirm by running the curl check in Step 4. |
| TypeScript strict: new `photos` prop type (no caption) conflicts with existing `ProjectPhoto` | The `ProjectPhoto` type from `ProjectPhotoSwitcher.tsx` is deleted. New inline type in `ProjectHeroGallery.tsx` has no `caption`. `ProjectDetail.tsx` must not import `ProjectPhoto` anymore. Confirmed by checking imports (Step 2, item 1). |
| Deleting ProjectPhotoSwitcher while grep misses a reference | Run `grep -r "ProjectPhotoSwitcher" src/` explicitly in Step 3 before deletion. |

---

## Public Contracts

- `ProjectHeroGallery` default export + `ProjectHeroGalleryProps` named export (for any future consumer or test file)
- `ProjectPhoto` type is DELETED along with `ProjectPhotoSwitcher.tsx` — no other file should depend on it after this change

---

## Optional Follow-up (NOT in scope for this session)

Claude-vision re-scoring of the 25 recently regenerated hero images: re-run `npm run projects:extract` and `npm run projects:score` then sync `server/data/project-image-analysis.json`. This is a standalone pipeline step and does not block this UI change.

---

## Resume and Execution Handoff

- **Plan file:** `/Users/princewagan/fourlinq/process/general-plans/active/project-detail-immersive-gallery_PLAN_25-07-26.md`
- **Execution order:** Steps 1 → 2 → 3 → 4 in sequence (Step 3 depends on Step 2 removing the import; Step 4 is independent and can be done any time)
- **No prior work to reconcile** — this is a net-new component; the plan starts from a clean slate
- **Key confirmed line numbers:** `ProjectDetail.tsx` lines 107–114 (galleryPhotos), 118–121 (PageHeader), 126–132 (switcher wrapper); `server/index.ts` line 92 (express.static call)
- **Test files to watch:** `src/test/project-detail-route.test.tsx`, `src/test/project-routing.test.ts`

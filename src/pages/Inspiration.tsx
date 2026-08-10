import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { projects as fallbackProject, tagFromCategory, type InspirationTag, type Project } from "@/data/projects";
import {
  groupProjectByArea,
  populatedRegionFilter,
  projectLocationLabel,
  UNKNOWN_REGION_CODE,
  type ProjectArea,
  type RegionCode,
} from "@/data/project-area";
import {
  projectCategoryImages as BASELINE_projectCategoryImages,
  projectDerivedTags as BASELINE_projectDerivedTags,
  projectOrder as BASELINE_projectOrder,
  projectCategoryOrder as BASELINE_projectCategoryOrder,
  type CategoryImages,
} from "@/data/project-category-images.generated";
import { fetchProjects, mergeProject } from "@/lib/cms-api";
import { cn } from "@/lib/utils";
import type { MergedProjectImagesResponse } from "@/types/project-images";
import { toThumbPath } from "@/lib/project-thumbs";
import { versionedImage } from "@/lib/image-version";
import { fetchMergedProjectImages, fetchMergedProjectImagesFresh } from "@/lib/merged-project-images";

type Filter = "all" | InspirationTag;
type AreaFilter = "all" | RegionCode | typeof UNKNOWN_REGION_CODE;

// The initial merged state comes from the baked static baseline. The runtime API
// fetch in the component's useEffect updates this with live DB overrides.
const BASELINE_MERGED: MergedProjectImagesResponse = {
  projectCategoryImages: BASELINE_projectCategoryImages,
  projectDerivedTags: BASELINE_projectDerivedTags,
  projectOrder: BASELINE_projectOrder,
  projectCategoryOrder: BASELINE_projectCategoryOrder,
  hiddenImages: {},
  replacedImages: {},
  overrideCount: 0,
};

// Normalize a merged Project to the view shape used by this page. The merge
// (not a replace) happens in mergeProject so a CMS response that omits a
// project cannot delete it from the gallery, and so every card links to the
// canonical slug rather than whichever spelling the CMS happens to store.
// mergedData is passed explicitly so the function always uses the current
// runtime state (baseline or live API result) rather than module-level imports.
type ViewProject = {
  id: string;
  name: string;
  location: string;
  /** Derived card label (village — city convention). */
  locationLabel: string;
  area?: ProjectArea;
  image: string;
  caption?: string;
  tag: InspirationTag[];
  categoryImages: CategoryImages;
};
function toView(p: Project, mergedData: MergedProjectImagesResponse): ViewProject {
  return {
    id: p.id,
    // An admin rename wins over the static/CMS name; everything else falls through.
    name: mergedData.projectNames?.[p.id] ?? p.name,
    location: p.location,
    locationLabel: projectLocationLabel(p.area, p.location),
    area: p.area,
    image: p.image,
    caption: p.caption,
    // Category membership is derived from what the project's images actually
    // show (AI vision analysis in server/data/project-image-analysis.json),
    // merged with any live DB overrides. Analyzed projects use that; anything
    // not yet analyzed falls back to hand tags, then the legacy single category.
    // `??` (not `?.length`) so an analyzed project with zero qualifying categories is honored.
    tag: mergedData.projectDerivedTags[p.id] ?? (p.tag?.length ? p.tag : tagFromCategory(p.category)),
    // Per-category best image from merged data; empty {} for projects without analysis.
    categoryImages: mergedData.projectCategoryImages[p.id] ?? {},
  };
}

const filters: { label: string; value: Filter }[] = [
  { label: "All projects", value: "all" },
  { label: "Windows", value: "windows" },
  { label: "Doors", value: "doors" },
  { label: "Interior", value: "interior" },
  { label: "Exterior", value: "exterior" },
];

const isFilter = (v: string | null): v is Filter =>
  v !== null && filters.some((f) => f.value === v);

// ---------------------------------------------------------------------------
// CardImage — keeps the currently-painted src visible while a new src decodes
// in the background. On decode completion the displayed src swaps atomically,
// so the tile never shows a blank or half-loaded state during a category switch.
//
// Cards render the thumbnail variant (640px WebP) for fast initial paint.
// If the thumbnail is missing (e.g. a newly added image whose thumb hasn't
// been generated yet), onError falls back to the original full-res path.
// ---------------------------------------------------------------------------
interface CardImageProps {
  src: string;       // full-resolution path (used for fallback and decoding)
  alt: string;
  className: string;
}

function CardImage({ src, alt, className }: CardImageProps) {
  // thumbSrc is the preferred small variant; falls back to src on error.
  // versionedImage appends ?v=<hash> so browsers bypass stale cached copies.
  const thumbSrc = versionedImage(toThumbPath(src));

  // displayedSrc is what the <img> actually renders; it trails the target by
  // one async decode cycle so the tile always shows a complete image.
  // We start with the thumb so the initial paint is fast.
  const [displayedSrc, setDisplayedSrc] = useState(thumbSrc);
  // Track current thumb target so we update displayedSrc when src changes.
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    const target = versionedImage(toThumbPath(src));
    // Nothing to do when the target matches what's already painted.
    if (target === displayedSrc) return;

    // Mark which src this decode is racing for, so a stale decode that resolves
    // after a newer target has already been set can be discarded.
    pendingRef.current = target;

    const img = new window.Image();
    img.src = target;

    const commit = () => {
      // Discard if a newer target arrived while we were decoding.
      if (pendingRef.current !== target) return;
      setDisplayedSrc(target);
    };

    const fallback = () => {
      // Thumb failed (missing variant) — decode the full-res instead and display that.
      if (pendingRef.current !== target) return;
      setDisplayedSrc(versionedImage(src));
    };

    // img.decode() returns a Promise; fall back to onload for environments
    // (e.g. old Safari) that reject immediately on every call.
    if (typeof img.decode === "function") {
      img.decode().then(commit).catch(() => {
        // decode() rejected — this can mean network error OR browser limitation.
        // Attempt a plain load; if the image already cached it fires immediately.
        const fallbackImg = new window.Image();
        fallbackImg.src = versionedImage(src);
        fallbackImg.onload = () => commit();
        fallbackImg.onerror = () => commit(); // show something rather than staying stale
      });
    } else {
      img.onload = commit;
      img.onerror = fallback; // thumb missing → use full-res
    }

    return () => {
      // Unmount or newer effect: orphan the in-flight decode by clearing the
      // pending marker. The decode may still complete but commit() will no-op.
      pendingRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]); // displayedSrc intentionally excluded — it is the output, not an input (adding it would cause an infinite loop)

  return (
    <img
      src={displayedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(e) => {
        // If the displayed thumb fails to load (e.g. cleared dist), swap to full-res.
        const vSrc = versionedImage(src);
        if (displayedSrc !== vSrc) {
          (e.currentTarget as HTMLImageElement).src = vSrc;
        }
      }}
    />
  );
}

const Inspiration = () => {
  // Filters live in the URL (?filter=windows&area=cebu) so the nav can
  // deep-link a category/area and the back button restores the previous view.
  const [searchParams, setSearchParams] = useSearchParams();
  const paramFilter = searchParams.get("filter");
  const active: Filter = isFilter(paramFilter) ? paramFilter : "all";
  const paramArea = searchParams.get("area");

  const writeParams = (next: { filter?: Filter; area?: AreaFilter }) => {
    const filter = next.filter ?? active;
    const area = next.area ?? (paramArea as AreaFilter | null) ?? "all";
    const params: Record<string, string> = {};
    if (filter !== "all") params.filter = filter;
    if (area !== "all") params.area = area;
    setSearchParams(params);
  };
  const setActive = (f: Filter) => writeParams({ filter: f });
  const setArea = (a: AreaFilter) => writeParams({ area: a });

  // mergedReady tracks whether the live merged fetch has resolved at least once.
  // Cards are NOT rendered until mergedReady is true — skeleton grid shows instead.
  // This prevents stale baked-baseline images (hidden projects, wrong covers) from
  // ever painting in the user's browser.
  const [mergedReady, setMergedReady] = useState(false);
  // mergedData starts null; once the live fetch resolves it is set to the live
  // result. If the live fetch fails after retries, we fall back to BASELINE_MERGED
  // so the page is never permanently blank. The baked baseline is never painted
  // first — it only appears as the last-resort fallback on network failure.
  const [mergedData, setMergedData] = useState<MergedProjectImagesResponse>(BASELINE_MERGED);
  const [items, setItems] = useState<ViewProject[]>([]);

  // CMS projects fetch (project names, locations, hero images).
  // Only runs once mergedReady is true so items are NEVER built from the
  // baked-baseline fallback. Category membership and hidden-set are always
  // derived from the live mergedData resolved on this page-load.
  useEffect(() => {
    if (!mergedReady) return;
    let live = true;
    fetchProjects()
      .then((row) => {
        if (!live) return;
        // Exclude projects the admin has hidden or deleted so they never appear
        // on the public gallery even when re-derived from the CMS waterfall.
        const hiddenSet = new Set([
          ...(mergedData.hiddenProjects ?? []),
          ...(mergedData.deletedProjects ?? []),
        ]);
        setItems(
          mergeProject(fallbackProject, row)
            .filter((p) => !hiddenSet.has(p.id))
            .map((p) => toView(p, mergedData))
        );
      })
      .catch(() => { /* keep items already set from merged fetch */ });
    return () => { live = false; };
  }, [mergedReady, mergedData]);

  // Primary live-data fetch — runs once on mount and bypasses ALL caches so the
  // page always reflects the current DB state (hidden images/projects, cover
  // overrides, category best-images). On success: sets mergedData + builds items
  // from fallbackProject filtered by the live hidden set, then mergedReady = true
  // → cards paint. On failure: one retry with the shared (possibly cached) fetch,
  // then fall back to BASELINE_MERGED so the page is never permanently blank.
  useEffect(() => {
    let live = true;

    function applyLiveData(data: MergedProjectImagesResponse) {
      if (!live) return;
      setMergedData(data);
      const hiddenSet = new Set([
        ...(data.hiddenProjects ?? []),
        ...(data.deletedProjects ?? []),
      ]);
      // Build initial items from fallbackProject with live merged overrides.
      // CMS names/images will be layered on top by the fetchProjects effect above.
      setItems(
        fallbackProject
          .filter((p) => !hiddenSet.has(p.id))
          .map((p) => toView(p, data))
      );
      setMergedReady(true);
    }

    fetchMergedProjectImagesFresh()
      .then(applyLiveData)
      .catch(() => {
        if (!live) return;
        // One retry using the shared (possibly cached) fetch before falling back.
        fetchMergedProjectImages()
          .then(applyLiveData)
          .catch(() => {
            if (!live) return;
            // Network failure — fall back to baked baseline so the page isn't blank.
            console.warn(
              "[Inspiration] /api/project-images/merged fetch failed after retry. " +
              "Falling back to baked baseline — some hidden images may be visible."
            );
            applyLiveData(BASELINE_MERGED);
          });
      });

    return () => { live = false; };
  }, []);

  // Idle preload of thumbnail variants for category-switch images.
  // Only fires after mergedReady so we preload the live-correct URLs, not stale
  // baked-baseline ones that may point to hidden images.
  // Re-fires if mergedData updates (e.g. CMS refresh later in the session).
  //
  // We preload the THUMB variants (640px WebP) since those are what the cards
  // actually render — preloading full-res would waste bandwidth on card views.
  useEffect(() => {
    if (!mergedReady) return;
    // Collect all category-variant thumbnail URLs from mergedData directly so
    // we don't have to wait for the items/CMS waterfall to resolve.
    const urls = new Set<string>();
    for (const catImages of Object.values(mergedData.projectCategoryImages)) {
      for (const url of Object.values(catImages)) {
        if (url) urls.add(versionedImage(toThumbPath(url)));
      }
    }
    if (urls.size === 0) return;

    // Use requestIdleCallback when available (Chrome/FF); setTimeout(0) on
    // Safari which still lacks rIC as of mid-2026.
    const schedule = typeof window.requestIdleCallback === "function"
      ? (fn: () => void) => window.requestIdleCallback(fn)
      : (fn: () => void) => setTimeout(fn, 0);

    const id = schedule(() => {
      for (const url of urls) {
        const img = new window.Image();
        img.src = url;
      }
    });

    return () => {
      if (typeof window.cancelIdleCallback === "function" && typeof id === "number") {
        window.cancelIdleCallback(id);
      }
    };
  }, [mergedReady, mergedData]); // fires once merged data is live; re-primes on updates

  const areaOption = useMemo(() => populatedRegionFilter(items), [items]);
  const activeArea: AreaFilter = useMemo(() => {
    if (!paramArea) return "all";
    if (paramArea === UNKNOWN_REGION_CODE) return UNKNOWN_REGION_CODE;
    if (areaOption.some((o) => o.code === paramArea)) return paramArea as AreaFilter;
    return "all";
  }, [paramArea, areaOption]);

  const filtered = useMemo(() => {
    let base = active === "all" ? items : items.filter((p) => p.tag.includes(active));
    if (activeArea !== "all") {
      base = base.filter((p) =>
        activeArea === UNKNOWN_REGION_CODE
          ? !p.area?.region_code
          : p.area?.region_code === activeArea,
      );
    }
    // Best pictures first: "All projects" orders by AI hero-quality (or admin override);
    // a category view orders by each project's best image FOR THAT category.
    // Unranked projects (e.g. a CMS-only entry not yet analyzed) sort to the end, stably.
    const order = active === "all"
      ? mergedData.projectOrder
      : mergedData.projectCategoryOrder[active];
    const rank = new Map((order ?? []).map((id, i) => [id, i]));
    const rankOf = (id: string) => rank.get(id) ?? Number.MAX_SAFE_INTEGER;
    return [...base].sort((a, b) => rankOf(a.id) - rankOf(b.id));
  }, [active, activeArea, items, mergedData]);

  // When no specific area is selected, render one section per populated region
  // (empty client-named regions never appear — groupProjectByArea omits them).
  const areaGroup = useMemo(
    () => (activeArea === "all" ? groupProjectByArea(filtered) : null),
    [activeArea, filtered],
  );

  const cardImageSrc = (p: ViewProject) =>
    active !== "all"
      ? (p.categoryImages[active] ?? p.image)
      : (mergedData.projectCoverImages?.[p.id] ?? p.image);

  const renderCard = (p: ViewProject) => (
    <li key={p.id}>
      <Link to={`/projects/${p.id}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)]">
          {/* In a category view, show that project's best image for
              the active category; "All projects" uses the admin-set
              cover if one exists, otherwise the baseline hero.
              Category views keep the per-category best image logic
              (cover override only applies to the All-projects view).
              CardImage decodes in the background before swapping so
              the tile never flashes blank during a category switch. */}
          <CardImage
            src={cardImageSrc(p)}
            alt={p.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-3">
          <p className="eyebrow mb-1">{p.locationLabel}</p>
          <h3 className="font-serif text-body text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
            {p.name}
          </h3>
        </div>
      </Link>
    </li>
  );

  return (
    <Layout>
      <PageHeader title="Our Projects" />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          {/* Tag filter rail (existing axis) */}
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-[color:var(--rule-soft)] mb-6 overflow-x-auto no-scrollbar">
            {filters.map((f) => {
              const isActive = active === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActive(f.value)}
                  className={cn(
                    "pb-4 text-body-sm font-medium whitespace-nowrap transition-colors duration-300 ease-marvin border-b-2 -mb-px min-h-[44px] flex items-end",
                    isActive
                      ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                      : "text-[color:var(--ink-muted)] border-transparent hover:text-[color:var(--ink-primary)]"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Area filter rail — only regions that actually have ≥1 project */}
          <div
            className="flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-[color:var(--rule-soft)] mb-12 lg:mb-16 overflow-x-auto no-scrollbar"
            role="navigation"
            aria-label="Filter projects by area"
          >
            <button
              type="button"
              onClick={() => setArea("all")}
              className={cn(
                "pb-4 text-body-sm font-medium whitespace-nowrap transition-colors duration-300 ease-marvin border-b-2 -mb-px min-h-[44px] flex items-end",
                activeArea === "all"
                  ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                  : "text-[color:var(--ink-muted)] border-transparent hover:text-[color:var(--ink-primary)]"
              )}
            >
              All areas
            </button>
            {areaOption.map((o) => {
              const isActive = activeArea === o.code;
              return (
                <button
                  key={o.code}
                  type="button"
                  onClick={() => setArea(o.code)}
                  className={cn(
                    "pb-4 text-body-sm font-medium whitespace-nowrap transition-colors duration-300 ease-marvin border-b-2 -mb-px min-h-[44px] flex items-end",
                    isActive
                      ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                      : "text-[color:var(--ink-muted)] border-transparent hover:text-[color:var(--ink-primary)]"
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Skeleton grid — shown while the live merged fetch is in-flight.
              18 placeholders ≈ 3 rows × 6 cols (desktop) so the page height
              is stable and there is no layout shift when cards paint. */}
          {!mergedReady ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10" aria-busy="true" aria-label="Loading projects">
              {Array.from({ length: 18 }).map((_, i) => (
                <li key={i} aria-hidden="true">
                  <div className="animate-pulse">
                    <div className="aspect-[4/3] bg-[color:var(--canvas-soft)] rounded-sm" />
                    <div className="mt-3 h-4 w-2/3 bg-[color:var(--canvas-soft)] rounded-sm" />
                  </div>
                </li>
              ))}
            </ul>
          ) : filtered.length === 0 ? (
            <p className="text-body text-[color:var(--ink-muted)]">No projects in this category yet.</p>
          ) : areaGroup ? (
            <div className="space-y-14 lg:space-y-16">
              {areaGroup.map((g) => (
                <section key={g.region_code} aria-labelledby={`area-${g.region_code}`}>
                  <h2
                    id={`area-${g.region_code}`}
                    className="font-serif text-h4 tracking-tight text-[color:var(--ink-primary)] mb-6 lg:mb-8"
                  >
                    {g.label}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                    {g.project.map(renderCard)}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map(renderCard)}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Inspiration;

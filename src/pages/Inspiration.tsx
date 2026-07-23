import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { projects as fallbackProject, tagFromCategory, type InspirationTag, type Project } from "@/data/projects";
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

type Filter = "all" | InspirationTag;

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
type ViewProject = { id: string; name: string; location: string; image: string; caption?: string; tag: InspirationTag[]; categoryImages: CategoryImages };
function toView(p: Project, mergedData: MergedProjectImagesResponse): ViewProject {
  return {
    id: p.id,
    name: p.name,
    location: p.location,
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
  const thumbSrc = toThumbPath(src);

  // displayedSrc is what the <img> actually renders; it trails the target by
  // one async decode cycle so the tile always shows a complete image.
  // We start with the thumb so the initial paint is fast.
  const [displayedSrc, setDisplayedSrc] = useState(thumbSrc);
  // Track current thumb target so we update displayedSrc when src changes.
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    const target = toThumbPath(src);
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
      setDisplayedSrc(src);
    };

    // img.decode() returns a Promise; fall back to onload for environments
    // (e.g. old Safari) that reject immediately on every call.
    if (typeof img.decode === "function") {
      img.decode().then(commit).catch(() => {
        // decode() rejected — this can mean network error OR browser limitation.
        // Attempt a plain load; if the image already cached it fires immediately.
        const fallbackImg = new window.Image();
        fallbackImg.src = src;
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
        if (displayedSrc !== src) {
          (e.currentTarget as HTMLImageElement).src = src;
        }
      }}
    />
  );
}

const Inspiration = () => {
  // Filter lives in the URL (?filter=windows) so the nav can deep-link a
  // category and the back button restores the previous view.
  const [searchParams, setSearchParams] = useSearchParams();
  const paramFilter = searchParams.get("filter");
  const active: Filter = isFilter(paramFilter) ? paramFilter : "all";
  const setActive = (f: Filter) => setSearchParams(f === "all" ? {} : { filter: f });

  // mergedData starts from the baked baseline (instant paint); the runtime fetch
  // below replaces it with the live merged result (overrides applied).
  const [mergedData, setMergedData] = useState<MergedProjectImagesResponse>(BASELINE_MERGED);
  const [items, setItems] = useState<ViewProject[]>(() => fallbackProject.map((p) => toView(p, BASELINE_MERGED)));

  // CMS projects fetch (project names, locations, hero images) — unchanged
  useEffect(() => {
    let live = true;
    fetchProjects()
      .then((row) => {
        if (live) setItems(mergeProject(fallbackProject, row).map((p) => toView(p, mergedData)));
      })
      .catch(() => { /* keep fallback */ });
    return () => { live = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedData]);

  // Runtime merge fetch — background; on success updates ordering and category images;
  // on failure the baked BASELINE_MERGED stays in place (no blank screen, no error UI).
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/project-images/merged", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<MergedProjectImagesResponse>;
      })
      .then((data) => {
        setMergedData(data);
        // Re-derive items with new merged category images and derived tags
        setItems((prev) =>
          prev.map((vp) => ({
            ...vp,
            tag: data.projectDerivedTags[vp.id] ?? vp.tag,
            categoryImages: data.projectCategoryImages[vp.id] ?? vp.categoryImages,
          }))
        );
      })
      .catch(() => {
        // Swallow — baseline already rendered, nothing to do
      });
    return () => { controller.abort(); };
  }, []);

  // Idle preload of thumbnail variants for category-switch images. Fires
  // immediately using the baked BASELINE_MERGED data (via mergedData initial
  // state) so preloading starts before the CMS/overrides fetches complete.
  // Re-fires when mergedData updates with live overrides, priming any new URLs.
  //
  // We preload the THUMB variants (640px WebP) since those are what the cards
  // actually render — preloading full-res would waste bandwidth on card views.
  useEffect(() => {
    // Collect all category-variant thumbnail URLs from mergedData directly so
    // we don't have to wait for the items/CMS waterfall to resolve.
    const urls = new Set<string>();
    for (const catImages of Object.values(mergedData.projectCategoryImages)) {
      for (const url of Object.values(catImages)) {
        if (url) urls.add(toThumbPath(url));
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
  }, [mergedData]); // fires on baseline immediately, re-primes when live overrides arrive

  const filtered = useMemo(() => {
    const base = active === "all" ? items : items.filter((p) => p.tag.includes(active));
    // Best pictures first: "All projects" orders by AI hero-quality (or admin override);
    // a category view orders by each project's best image FOR THAT category.
    // Unranked projects (e.g. a CMS-only entry not yet analyzed) sort to the end, stably.
    const order = active === "all"
      ? mergedData.projectOrder
      : mergedData.projectCategoryOrder[active];
    const rank = new Map((order ?? []).map((id, i) => [id, i]));
    const rankOf = (id: string) => rank.get(id) ?? Number.MAX_SAFE_INTEGER;
    return [...base].sort((a, b) => rankOf(a.id) - rankOf(b.id));
  }, [active, items, mergedData]);

  return (
    <Layout>
      <PageHeader title="Our Projects" breadcrumbLabel="Our Projects" />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          {/* Filter rail */}
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-[color:var(--rule-soft)] mb-12 lg:mb-16 overflow-x-auto no-scrollbar">
            {filters.map((f) => {
              const isActive = active === f.value;
              return (
                <button
                  key={f.value}
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

          {filtered.length === 0 ? (
            <p className="text-body text-[color:var(--ink-muted)]">No projects in this category yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filtered.map((p) => {
                // Apply admin-set ratio override; default is 4:3 (source photo crop)
                const ratio = mergedData.projectRatios?.[p.id] ?? "4:3";
                const aspectClass = ratio === "16:9" ? "aspect-[16/9]" : "aspect-[4/3]";
                return (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className="group block">
                    {/* Aspect ratio: 4:3 by default (source photos); admin can override to 16:9. */}
                    <div className={`relative ${aspectClass} overflow-hidden bg-[color:var(--canvas-soft)]`}>
                      {/* In a category view, show that project's best image for
                          the active category; "All projects" keeps the hero.
                          CardImage decodes in the background before swapping so
                          the tile never flashes blank during a category switch. */}
                      <CardImage
                        src={active !== "all" ? (p.categoryImages[active] ?? p.image) : p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-3">
                      <h3 className="font-serif text-body text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {p.location && p.location !== "Philippines" && !p.name.toLowerCase().includes(p.location.toLowerCase())
                          ? `${p.name}, ${p.location}`
                          : p.name}
                      </h3>
                    </div>
                  </Link>
                </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Inspiration;

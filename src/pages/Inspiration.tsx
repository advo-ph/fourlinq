import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { projects as fallbackProject, tagFromCategory, type InspirationTag, type Project } from "@/data/projects";
import { fetchProjects, mergeProject } from "@/lib/cms-api";
import { cn } from "@/lib/utils";

type Filter = "all" | InspirationTag;

// Normalize a merged Project to the view shape used by this page. The merge
// (not a replace) happens in mergeProject so a CMS response that omits a
// project cannot delete it from the gallery, and so every card links to the
// canonical slug rather than whichever spelling the CMS happens to store.
type ViewProject = { id: string; name: string; location: string; image: string; caption?: string; tag: InspirationTag[] };
function toView(p: Project): ViewProject {
  return {
    id: p.id,
    name: p.name,
    location: p.location,
    image: p.image,
    caption: p.caption,
    // Multi-category: an install is usually windows AND doors. CMS rows that
    // only carry the legacy single category get a derived tag.
    tag: p.tag?.length ? p.tag : tagFromCategory(p.category),
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

const Inspiration = () => {
  // Filter lives in the URL (?filter=windows) so the nav can deep-link a
  // category and the back button restores the previous view.
  const [searchParams, setSearchParams] = useSearchParams();
  const paramFilter = searchParams.get("filter");
  const active: Filter = isFilter(paramFilter) ? paramFilter : "all";
  const setActive = (f: Filter) => setSearchParams(f === "all" ? {} : { filter: f });
  const [items, setItems] = useState<ViewProject[]>(() => fallbackProject.map(toView));

  useEffect(() => {
    let live = true;
    fetchProjects()
      .then((row) => { if (live) setItems(mergeProject(fallbackProject, row).map(toView)); })
      .catch(() => { /* keep fallback */ });
    return () => { live = false; };
  }, []);

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((p) => p.tag.includes(active))),
    [active, items]
  );

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
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
              {filtered.map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`} className="group block">
                    {/* Source photos are 4:3 — match the crop to the material. */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)]">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-5">
                      <p className="eyebrow mb-3">{p.location}</p>
                      <h3 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {p.name}
                      </h3>
                      {p.caption && (
                        <p className="mt-3 text-body-sm text-[color:var(--ink-secondary)] leading-[1.6] max-w-md">
                          {p.caption}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Inspiration;

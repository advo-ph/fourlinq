import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { projects as fallbackProjects, type ProjectCategory } from "@/data/projects";
import { fetchProjects, type CmsProject } from "@/lib/cms-api";
import { cn } from "@/lib/utils";

type Filter = "all" | ProjectCategory;

// Normalize API row (DB shape) to the view shape used by this page
type ViewProject = { id: string; name: string; location: string; image: string; caption?: string; category: string };
function normalize(p: CmsProject): ViewProject {
  return {
    id: p.slug,
    name: p.title,
    location: p.location ?? "",
    image: p.cover_path ?? "",
    caption: p.caption ?? undefined,
    category: p.category ?? "interior",
  };
}

const filters: { label: string; value: Filter }[] = [
  { label: "All projects", value: "all" },
  { label: "Casement", value: "casement" },
  { label: "Sliding", value: "sliding" },
  { label: "Doors", value: "doors" },
  { label: "Specialist", value: "specialist" },
  { label: "Interior", value: "interior" },
  { label: "Exterior", value: "exterior" },
];

const Inspiration = () => {
  const [active, setActive] = useState<Filter>("all");
  const [items, setItems] = useState<ViewProject[]>(() =>
    fallbackProjects.map((p) => ({ id: p.id, name: p.name, location: p.location, image: p.image, caption: p.caption, category: p.category }))
  );

  useEffect(() => {
    fetchProjects()
      .then((rows) => setItems(rows.map(normalize)))
      .catch(() => { /* keep fallback */ });
  }, []);

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((p) => p.category === active)),
    [active, items]
  );

  return (
    <Layout>
      <PageHeader
        eyebrow="Inspiration"
        title="Real projects, real homes."
        breadcrumbLabel="Inspiration"
        subtitle="Every FourlinQ install is custom-fabricated and project-specified. The homes shown here are by FourlinQ owners across Metro Manila, Cebu, and the resort coast."
      />

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
                    <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--canvas-soft)]">
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

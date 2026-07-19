import { useState, useMemo, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import NewsCard from "@/components/shared/NewsCard";
import { whatsNew as fallbackNews, type WhatsNewCategory, type WhatsNewEntry } from "@/data/whats-new";
import { fetchNews, type CmsNewsPost } from "@/lib/cms-api";
import { cn } from "@/lib/utils";

function fromCms(p: CmsNewsPost): WhatsNewEntry {
  return {
    id: p.slug,
    date: (p.published_at ?? "").slice(0, 10),
    category: p.category,
    title: p.title,
    excerpt: p.excerpt ?? "",
    image: p.cover_path ?? "",
    link: p.internal_link ?? p.external_link ?? undefined,
    dateVerified: Boolean(p.published_at),
  };
}

const ALL_FILTERS: { label: string; value: "all" | WhatsNewCategory }[] = [
  { label: "All updates", value: "all" },
  { label: "Product", value: "product" },
  { label: "Project", value: "project" },
  { label: "Event", value: "event" },
  { label: "Press", value: "press" },
];

const WhatsNew = () => {
  const [active, setActive] = useState<"all" | WhatsNewCategory>("all");
  const [items, setItems] = useState<WhatsNewEntry[]>(fallbackNews);

  useEffect(() => {
    fetchNews()
      .then((rows) => {
        if (rows.length > 0) setItems(rows.map(fromCms));
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  /** Only surface filter tabs that have at least one entry — empty filters
   *  make the filter look broken. */
  const filters = useMemo(
    () => ALL_FILTERS.filter((f) => f.value === "all" || items.some((e) => e.category === f.value)),
    [items]
  );

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
    if (active === "all") return sorted;
    return sorted.filter((e) => e.category === active);
  }, [active, items]);

  return (
    <Layout>
      <PageHeader
        eyebrow="What's New"
        title="From the workshop."
        breadcrumbLabel="What's New"
        subtitle="Published project, product, and event notes from FourlinQ. CMS dates are shown when supplied; fallback archive dates are explicitly marked unverified."
      />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          {/* Filter rail */}
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-[color:var(--rule-soft)] mb-12 lg:mb-16">
            {filters.map((f) => {
              const isActive = active === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActive(f.value)}
                  aria-pressed={isActive}
                  className={cn(
                    "pb-4 text-body-sm font-medium transition-colors duration-300 ease-marvin border-b-2 -mb-px min-h-[44px] flex items-end",
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
            <p className="text-body text-[color:var(--ink-muted)]">No updates in this category yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {filtered.map((entry) => (
                <li key={entry.id}>
                  <NewsCard entry={entry} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default WhatsNew;

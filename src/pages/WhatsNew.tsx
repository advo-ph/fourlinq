import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import { whatsNew, type WhatsNewCategory, type WhatsNewEntry } from "@/data/whats-new";
import { cn } from "@/lib/utils";

const filters: { label: string; value: "all" | WhatsNewCategory }[] = [
  { label: "All updates", value: "all" },
  { label: "Product", value: "product" },
  { label: "Project", value: "project" },
  { label: "Event", value: "event" },
  { label: "Press", value: "press" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();

const categoryLabel = (c: WhatsNewEntry["category"]) =>
  c.charAt(0).toUpperCase() + c.slice(1);

const WhatsNew = () => {
  const [active, setActive] = useState<"all" | WhatsNewCategory>("all");

  const filtered = useMemo(() => {
    const sorted = [...whatsNew].sort((a, b) => b.date.localeCompare(a.date));
    if (active === "all") return sorted;
    return sorted.filter((e) => e.category === active);
  }, [active]);

  return (
    <Layout>
      <PageHeader
        eyebrow="What's New"
        title="From the workshop."
        breadcrumbLabel="What's New"
        subtitle="New projects, new systems, and quiet updates from FourlinQ. Sorted by date — most recent first."
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
                  onClick={() => setActive(f.value)}
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
                  <Link to={entry.link || "#"} className="group block">
                    <div className="relative aspect-[5/4] overflow-hidden bg-[color:var(--canvas-soft)]">
                      <img
                        src={entry.image}
                        alt={entry.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="eyebrow !text-[color:var(--ink-primary)]">{categoryLabel(entry.category)}</span>
                        <span className="text-[color:var(--rule-strong)]">·</span>
                        <span className="eyebrow">{formatDate(entry.date)}</span>
                      </div>
                      <h3 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight leading-snug group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {entry.title}
                      </h3>
                      <p className="mt-3 text-body-sm text-[color:var(--ink-secondary)]">
                        {entry.excerpt}
                      </p>
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

export default WhatsNew;

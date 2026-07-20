import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import { FAQ, FAQ_CATEGORIES, type FAQCategory } from "@/data/faq";
import { Plus, Minus } from "lucide-react";

const FAQPage = () => {
  const [active, setActive] = useState<FAQCategory | "all">("all");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (active === "all") return FAQ;
    return FAQ.filter((f) => f.category === active);
  }, [active]);

  return (
    <Layout>
      <PageHeader
        eyebrow="Frequently asked"
        title="Answers, organized."
        breadcrumbLabel="FAQ"
        subtitle="The questions we hear most often, about our systems, the uPVC material, ordering, installation, warranty, and ongoing care. Filter by topic or scan the full list."
      />

      <Section tone="canvas" size="lg" className="!pt-0">
        <div className="grid lg:grid-cols-[18rem,1fr] gap-12 lg:gap-20 min-w-0">
          {/* Category rail: a horizontal scroll strip on mobile, a sidebar at lg.
              min-w-0 all the way down so the grid item can shrink below the
              intrinsic width of the nowrap topic list and let overflow-x scroll
              (a grid/flex item defaults to min-width:auto and won't). */}
          <aside className="min-w-0">
            <p className="eyebrow mb-5">Topics</p>
            <ul className="flex lg:flex-col gap-1 lg:gap-0 min-w-0 overflow-x-auto lg:overflow-visible no-scrollbar lg:border-y lg:border-[color:var(--rule-soft)]">
              <li className="lg:border-b lg:border-[color:var(--rule-soft)] shrink-0">
                <button
                  onClick={() => { setActive("all"); setOpen(null); }}
                  className={`whitespace-nowrap lg:w-full text-left px-4 lg:px-0 py-3 lg:py-3.5 text-body-sm font-medium transition-colors duration-300 ease-marvin ${
                    active === "all"
                      ? "text-[color:var(--ink-primary)] border-b lg:border-b-0 lg:border-l-2 border-[color:var(--accent)] lg:pl-3 lg:-ml-3"
                      : "text-[color:var(--ink-muted)] border-b lg:border-b-0 lg:border-l-2 border-transparent hover:text-[color:var(--ink-primary)] lg:hover:pl-3 lg:hover:-ml-3 lg:hover:border-[color:var(--rule-strong)]"
                  }`}
                >
                  All questions
                </button>
              </li>
              {FAQ_CATEGORIES.map((c) => (
                <li key={c.id} className="lg:border-b lg:border-[color:var(--rule-soft)] shrink-0">
                  <button
                    onClick={() => { setActive(c.id); setOpen(null); }}
                    className={`whitespace-nowrap lg:w-full text-left px-4 lg:px-0 py-3 lg:py-3.5 text-body-sm font-medium transition-colors duration-300 ease-marvin ${
                      active === c.id
                        ? "text-[color:var(--ink-primary)] border-b lg:border-b-0 lg:border-l-2 border-[color:var(--accent)] lg:pl-3 lg:-ml-3"
                        : "text-[color:var(--ink-muted)] border-b lg:border-b-0 lg:border-l-2 border-transparent hover:text-[color:var(--ink-primary)] lg:hover:pl-3 lg:hover:-ml-3 lg:hover:border-[color:var(--rule-strong)]"
                    }`}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Accordion list */}
          <div>
            <ul className="flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
              {filtered.map((entry, i) => {
                const isOpen = open === i;
                return (
                  <li key={i}>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full text-left py-6 lg:py-7 flex items-start justify-between gap-6 group min-h-[44px]"
                      aria-expanded={isOpen}
                    >
                      <span className="font-serif text-h6 lg:text-h5 text-[color:var(--ink-primary)] tracking-tight pr-4 leading-snug group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {entry.q}
                      </span>
                      <span className="shrink-0 mt-1 text-[color:var(--ink-muted)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                        {isOpen ? <Minus size={20} strokeWidth={1.5} /> : <Plus size={20} strokeWidth={1.5} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="pb-7 lg:pb-8 max-w-[40rem]">
                        <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.7]">
                          {entry.a}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {filtered.length === 0 && (
              <p className="text-body text-[color:var(--ink-muted)] py-12 text-center">
                No questions in this topic yet.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Still curious */}
      <Section tone="soft" size="md">
        <div className="grid lg:grid-cols-[1fr,1fr] gap-12 lg:gap-24 items-center">
          <div>
            <p className="eyebrow mb-5">Still curious?</p>
            <h2 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1]">
              Ask our team directly.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <EditorialButton to="/brand#contact" variant="primary" size="md">
              Contact us
            </EditorialButton>
            <EditorialButton to="/products" variant="ghost" size="md">
              Browse Systems →
            </EditorialButton>
          </div>
        </div>
      </Section>
    </Layout>
  );
};

export default FAQPage;

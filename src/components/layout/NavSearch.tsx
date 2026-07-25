import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, X } from "lucide-react";
import { products } from "@/data/products";
import { projects } from "@/data/projects";
import { DOCUMENT_FALLBACK } from "@/hooks/useDocument";
import { fetchMergedProjectImages } from "@/lib/merged-project-images";

/**
 * Site search flyout, patterned on marvin.com's header search: a full-width
 * panel under the header with an autofocused input, search-as-you-type
 * (debounced), results grouped into "Suggested" page links and
 * "Suggested products" image cards, and see-all links. Esc or outside click
 * closes. Everything is client-side over the site's own static data — the
 * catalog is small enough that an index would be ceremony.
 */

interface PageEntry {
  title: string;
  to: string;
  keyword: string;
}

const PAGE_INDEX: PageEntry[] = [
  { title: "Window Systems", to: "/products?filter=windows", keyword: "casement sliding awning special shapes window" },
  { title: "Door Systems", to: "/products?filter=doors", keyword: "slide fold large panel lift slide door 90 series" },
  { title: "Specialist Systems", to: "/products?filter=specialist", keyword: "arch curtain wall custom shapes specialist" },
  { title: "Aluminium profile system", to: "/aluminium", keyword: "aluminium thermal break alu slim material powder coat" },
  { title: "Why uPVC", to: "/why-upvc", keyword: "upvc material veka skyframe profile fire retardant insulation" },
  { title: "Finishes", to: "/finishes", keyword: "finish color colour wood grain walnut oak white black texture" },
  { title: "Our Projects", to: "/inspiration", keyword: "project gallery inspiration install home residence" },
  { title: "Design Tool", to: "/design-tool", keyword: "configurator design build preview quote size glass" },
  { title: "For Architects", to: "/for-architects", keyword: "architect specifier drawing bim revit cad spec" },
  { title: "What's New", to: "/whats-new", keyword: "news update event press product launch" },
  { title: "Care & Maintenance", to: "/care", keyword: "care cleaning maintenance warranty service" },
  { title: "Warranty", to: "/warranty", keyword: "warranty ten year limited coverage" },
  { title: "How to Choose", to: "/how-to-choose", keyword: "choose guide compare quiz which window" },
  { title: "Glossary", to: "/glossary", keyword: "glossary term meaning definition jargon" },
  { title: "FAQ", to: "/faq", keyword: "faq question answer price lead time" },
  { title: "Brand & Showrooms", to: "/brand", keyword: "brand showroom contact consultation ortigas alabang cebu about" },
];

const POPULAR = ["Sliding", "Casement", "Aluminium", "Finishes", "Warranty", "Curtain wall"];

const norm = (s: string) => s.toLowerCase();

interface NavSearchProps {
  open: boolean;
  onClose: () => void;
}

const NavSearch = ({ open, onClose }: NavSearchProps) => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Admin-set cover images: projectId → cover image path.
  // Fetched once per session via the shared merged-project-images cache.
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;
    fetchMergedProjectImages()
      .then((data) => {
        if (!live) return;
        if (data.projectCoverImages && Object.keys(data.projectCoverImages).length > 0) {
          setCoverImages(data.projectCoverImages);
        }
      })
      .catch(() => { /* keep p.image fallback */ });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setDebounced("");
      // Focus after the open transition has begun.
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  // marvin.com debounces search-as-you-type; ours is client-side so a short
  // debounce just keeps the result list from flickering per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  const result = useMemo(() => {
    const q = norm(debounced);
    if (!q) return null;
    const page = PAGE_INDEX.filter(
      (p) => norm(p.title).includes(q) || p.keyword.includes(q),
    ).slice(0, 6);
    const doc = DOCUMENT_FALLBACK.filter(
      (d) => norm(d.title).includes(q) || norm(d.description ?? "").includes(q),
    ).slice(0, 3);
    const product = products.filter(
      (p) =>
        norm(p.name).includes(q) ||
        norm(p.description ?? "").includes(q) ||
        norm(p.category).includes(q),
    ).slice(0, 3);
    const project = projects.filter(
      (p) => norm(p.name).includes(q) || norm(p.location).includes(q) || norm(p.caption ?? "").includes(q),
    ).slice(0, 3);
    return { page, doc, product, project };
  }, [debounced]);

  const isEmpty =
    result !== null &&
    result.page.length === 0 &&
    result.doc.length === 0 &&
    result.product.length === 0 &&
    result.project.length === 0;

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id="site-search-flyout"
      role="search"
      className="fixed left-0 right-0 top-[72px] z-50 bg-white text-[color:var(--ink-primary)] border-b border-[color:var(--rule-soft)]"
    >
      <div className="container-editorial py-8 lg:py-10 max-h-[calc(100vh-72px)] overflow-y-auto">
        {/* Input row */}
        <div className="flex items-center gap-4 border-b-2 border-[color:var(--ink-primary)] pb-4">
          <Search size={20} strokeWidth={1.5} className="text-[color:var(--ink-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fourlinq.ph"
            aria-label="Search fourlinq.ph"
            className="flex-1 bg-transparent text-[1.375rem] lg:text-h4 font-serif outline-none placeholder:text-[color:var(--ink-faint)] [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-2 -m-2 text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Before typing: popular searches */}
        {!result && (
          <div className="pt-6">
            <p className="eyebrow-s text-[color:var(--ink-muted)] mb-4">Popular searches</p>
            <div className="flex flex-wrap gap-2.5">
              {POPULAR.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQuery(p)}
                  className="px-4 py-2 text-body-sm border border-[color:var(--rule-strong)] text-[color:var(--ink-secondary)] hover:border-[color:var(--ink-primary)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {isEmpty && (
          <div className="pt-8 pb-2">
            <p className="text-body-lg text-[color:var(--ink-primary)]">
              We're sorry. No results were found for “{debounced}”.
            </p>
            <ul className="mt-4 text-body-sm text-[color:var(--ink-secondary)] space-y-1.5 list-disc pl-5">
              <li>Check the spelling</li>
              <li>Try a more general word: sliding, casement, aluminium</li>
              <li>
                Or ask us directly —{" "}
                <Link to="/brand#contact" onClick={onClose} className="underline hover:text-[color:var(--accent)]">
                  contact the team
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Results */}
        {result && !isEmpty && (
          <div className="pt-8 grid gap-10 lg:grid-cols-[2fr_3fr]">
            {/* Suggested pages + documents */}
            {(result.page.length > 0 || result.doc.length > 0) && (
              <div>
                <p className="eyebrow-s text-[color:var(--ink-muted)] mb-4">Suggested</p>
                <ul className="flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
                  {result.page.map((p) => (
                    <li key={p.to}>
                      <Link
                        to={p.to}
                        onClick={onClose}
                        className="flex items-center justify-between gap-4 py-3.5 text-body font-medium hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                      >
                        {p.title}
                        <ArrowUpRight size={15} strokeWidth={1.5} className="shrink-0 text-[color:var(--ink-muted)]" />
                      </Link>
                    </li>
                  ))}
                  {result.doc.map((d) => (
                    <li key={d.slug}>
                      <Link
                        to="/for-architects"
                        onClick={onClose}
                        className="flex items-center justify-between gap-4 py-3.5 text-body font-medium hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                      >
                        {d.title}
                        <span className="eyebrow-s text-[color:var(--ink-muted)] shrink-0">{d.doc_type}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested products + projects, with imagery */}
            <div className="space-y-8">
              {result.product.length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="eyebrow-s text-[color:var(--ink-muted)]">Suggested products</p>
                    <Link
                      to="/products"
                      onClick={onClose}
                      className="text-body-sm font-medium text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                    >
                      See all products →
                    </Link>
                  </div>
                  <ul className="grid grid-cols-3 gap-4">
                    {result.product.map((p) => (
                      <li key={p.id}>
                        <Link to={`/products?filter=${p.category}`} onClick={onClose} className="group block">
                          <div className="aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)]">
                            <img
                              src={p.image}
                              alt={p.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.04]"
                            />
                          </div>
                          <p className="mt-2.5 text-body-sm font-medium group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                            {p.name}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.project.length > 0 && (
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="eyebrow-s text-[color:var(--ink-muted)]">Projects</p>
                    <Link
                      to="/inspiration"
                      onClick={onClose}
                      className="text-body-sm font-medium text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                    >
                      See all projects →
                    </Link>
                  </div>
                  <ul className="grid grid-cols-3 gap-4">
                    {result.project.map((p) => (
                      <li key={p.id}>
                        <Link to={`/projects/${p.id}`} onClick={onClose} className="group block">
                          <div className="aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)]">
                            <img
                              src={coverImages[p.id] ?? p.image}
                              alt={p.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.04]"
                            />
                          </div>
                          <p className="mt-2.5 text-body-sm font-medium group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                            {p.name}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavSearch;

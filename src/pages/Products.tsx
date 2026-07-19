import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import QuoteModal from "@/components/shared/QuoteModal";
import { useProducts, Product } from "@/hooks/useProducts";
import SystemCategoryCard, { SystemCategory } from "@/components/shared/SystemCategoryCard";
import FinishSwatch from "@/components/shared/FinishSwatch";
import SystemCardMedia from "@/components/shared/SystemCardMedia";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { SYSTEM_TYPE, PROFILE_MATERIAL, findTypeByFilter } from "@/data/taxonomy";
import { trackProductView } from "@/hooks/useAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import EditorialButton from "@/components/primitives/Button";
import { useDialogFocus } from "@/hooks/useDialogFocus";

type ProductCategory = "windows" | "doors" | "specialist" | "systems";
type Filter = "all" | ProductCategory;

// Drill-down tabs, derived from the type axis so they can't drift from the cards.
const filters: { label: string; value: Filter }[] = [
  { label: "All Systems", value: "all" },
  ...SYSTEM_TYPE.map((t) => ({ label: t.label, value: t.filter as Filter })),
];

// The /products landing renders the two axes from src/data/taxonomy.ts as two
// LABELLED GROUPS — never one mixed row.
//
// The 2026-07-05 build put an "Aluminium Line" card fourth in a row beside
// Window/Door/Specialist, which reads as a fourth type. Imie rejected it, then
// restated why on 07-02: "Aluminium is like uPVC — they are both profile
// systems." Material is the other axis, so it gets its own heading.
const TYPE_CARD: SystemCategory[] = SYSTEM_TYPE.map((t) => ({
  key: t.type_code,
  eyebrow: "By type",
  name: t.label,
  description: t.description,
  items: t.item,
  image: t.image,
  to: t.to,
}));

const MATERIAL_CARD: SystemCategory[] = PROFILE_MATERIAL.map((m) => ({
  key: m.material_code,
  eyebrow: "By material",
  name: m.label,
  description: m.description,
  items: m.item,
  image: m.image,
  to: m.to,
}));

const ProductDrawer = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const dialogRef = useDialogFocus<HTMLElement>({ isOpen: true, onClose });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
        className="fixed inset-0 bg-[color:var(--ink-primary)]/30 backdrop-blur-sm z-[55]"
        onClick={onClose}
      />
      <motion.aside
        ref={dialogRef}
        data-product-drawer
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
        className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white z-[60] overflow-y-auto shadow-depth-8 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-drawer-title"
        aria-describedby="product-drawer-description"
        tabIndex={-1}
      >
        {/* Accent stripe */}
        <div className="h-[3px] bg-[color:var(--accent)] shrink-0" />

        {/* Header */}
        <div className="px-6 lg:px-10 pt-6 pb-5 flex items-start justify-between shrink-0 border-b border-[color:var(--rule-soft)]">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)] font-medium">
              {product.category}
            </p>
            <h2 id="product-drawer-title" className="font-serif text-h4 lg:text-h3 mt-2 leading-[1.1] text-[color:var(--ink-primary)] tracking-tight">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="-mr-2 -mt-1 p-2 text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 lg:px-10 py-8 flex-1">
          <div className="aspect-[4/3] bg-white mb-8 overflow-hidden">
            <SystemCardMedia
              productId={product.id}
              src={product.image}
              alt={product.name}
              imgClassName="w-full h-full object-contain"
              animClassName="w-full h-full object-contain"
              trigger="click"
            />
          </div>

          <p id="product-drawer-description" className="text-body text-[color:var(--ink-secondary)] leading-[1.7] mb-10">
            {product.description}
          </p>

          {/* Specifications */}
          <p className="eyebrow mb-4">Specifications</p>
          {product.specs.length > 0 ? (
            <ul className="flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)] mb-10">
              {product.specs.map((spec) => (
                <li key={spec} className="py-3 text-body-sm text-[color:var(--ink-primary)]">
                  {spec}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-10 text-body-sm text-[color:var(--ink-secondary)]">No product-specific specification list is published here. Request the exact proposed assembly and evidence.</p>
          )}

          {/* Finishes */}
          <p className="eyebrow mb-4">Listed finish entries · confirm</p>
          {product.finishes.some((f) => FRAME_FINISHES.find((v) => v.label === f.name)?.category === "wood-grain") && (
            <>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--ink-muted)] mb-3">Wood grain</p>
              <div className="flex gap-3 mb-6 flex-wrap">
                {product.finishes
                  .filter((finish) => FRAME_FINISHES.find((f) => f.label === finish.name)?.category === "wood-grain")
                  .map((finish) => {
                    const verified = FRAME_FINISHES.find((f) => f.label === finish.name);
                    return (
                      <div key={finish.name} className="flex flex-col items-center gap-1.5">
                        <FinishSwatch finishId={verified?.id} color={finish.color} finishType="wood-grain" size="sm" />
                        <span className="text-[10px] text-[color:var(--ink-muted)]">{finish.name}</span>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
          {product.finishes.some((f) => {
            const v = FRAME_FINISHES.find((vf) => vf.label === f.name);
            return !v || v.category === "solid";
          }) && (
            <>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--ink-muted)] mb-3">Solid</p>
              <div className="flex gap-3 mb-10 flex-wrap">
                {product.finishes
                  .filter((finish) => {
                    const v = FRAME_FINISHES.find((f) => f.label === finish.name);
                    return !v || v.category === "solid";
                  })
                  .map((finish) => {
                    const verified = FRAME_FINISHES.find((f) => f.label === finish.name);
                    return (
                      <div key={finish.name} className="flex flex-col items-center gap-1.5">
                        <FinishSwatch finishId={verified?.id} color={finish.color} finishType="solid" size="sm" />
                        <span className="text-[10px] text-[color:var(--ink-muted)]">{finish.name}</span>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
          {product.finishes.length === 0 && (
            <p className="mb-10 text-body-sm text-[color:var(--ink-secondary)]">No product-specific finish matrix is published here. Confirm material, profile, physical sample, compatibility, and availability.</p>
          )}

          {/* Glass */}
          <p className="eyebrow mb-4">Listed glass entries · confirm</p>
          {product.glassOptions.length > 0 ? (
            <div className="flex gap-2 flex-wrap mb-10">
              {product.glassOptions.map((glass) => (
                <span key={glass} className="px-3 py-1.5 text-[12px] border border-[color:var(--rule-soft)] text-[color:var(--ink-primary)]">
                  {glass}
                </span>
              ))}
            </div>
          ) : (
            <p className="mb-10 text-body-sm text-[color:var(--ink-secondary)]">No product-specific glass matrix is published here. Confirm glass type, thickness, safety requirement, coating, compatibility, and availability.</p>
          )}

          <EditorialButton onClick={() => setQuoteOpen(true)} variant="primary" size="md" fullWidth>
            Request a Quote
          </EditorialButton>
        </div>
      </motion.aside>

      <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} productName={product.name} productId={product.id} />
    </>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramFilter = (searchParams.get("filter") as Filter) || "all";
  const [activeFilter, setActiveFilterState] = useState<Filter>(paramFilter);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setActiveFilterState(paramFilter);
  }, [paramFilter]);

  const setActiveFilter = (f: Filter) => {
    setActiveFilterState(f);
    setSearchParams(f === "all" ? {} : { filter: f });
  };

  const { data: products = [], isLoading } = useProducts();

  // The landing shows the four category cards; a filter drills into that
  // category's systems.
  const isLanding = activeFilter === "all";

  const filtered = useMemo(() => {
    if (activeFilter === "all") return products;
    return products.filter((p) => p.category === activeFilter);
  }, [activeFilter, products]);

  const activeType = findTypeByFilter(activeFilter);
  const subtitle = isLanding
    ? "Browse two ways. By type — window, door, or specialist. By material — the uPVC or aluminium profile system it is fabricated from. The two are separate choices, not one list."
    : "Browse the current catalog names and operation summaries. Exact material, profile, glass, finish, hardware, dimensions, ratings, availability, and project compatibility require FourlinQ confirmation.";

  return (
    <Layout>
      <PageHeader
        eyebrow="The catalog"
        title={isLanding ? "Window, door, and specialist systems." : activeType?.label ?? "Systems"}
        breadcrumbLabel="Systems"
        subtitle={subtitle}
      />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          {isLanding ? (
            /* Landing — the two axes, as two labelled groups. Never one mixed row. */
            <>
              <div>
                <h2 className="font-serif font-normal tracking-tight text-h4 lg:text-h3 text-[color:var(--ink-primary)]">
                  Browse by type.
                </h2>
                <p className="mt-3 text-body text-[color:var(--ink-secondary)] max-w-[40rem] leading-[1.6]">
                  What the opening is — a window, a door, or a custom shape.
                </p>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
                  {TYPE_CARD.map((c) => (
                    <SystemCategoryCard key={c.key} category={c} />
                  ))}
                </div>
              </div>

              <div className="mt-20 lg:mt-28 pt-16 lg:pt-20 border-t border-[color:var(--rule-strong)]">
                <h2 className="font-serif font-normal tracking-tight text-h4 lg:text-h3 text-[color:var(--ink-primary)]">
                  Browse by material.
                </h2>
                <p className="mt-3 text-body text-[color:var(--ink-secondary)] max-w-[40rem] leading-[1.6]">
                  What it is fabricated from. Windows and doors are built in either
                  profile system — the material is a separate choice from the type.
                </p>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-14 lg:max-w-[52rem]">
                  {MATERIAL_CARD.map((c) => (
                    <SystemCategoryCard key={c.key} category={c} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Drill-down: back to the four families + sibling category tabs */}
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-[color:var(--rule-soft)] mb-12 lg:mb-16">
                <div className="flex items-end gap-8">
                  {filters
                    .filter((f) => f.value !== "all")
                    .map((f) => {
                      const active = activeFilter === f.value;
                      return (
                        <button
                          key={f.value}
                          onClick={() => setActiveFilter(f.value)}
                          aria-pressed={active}
                          className={`pb-4 text-body-sm font-medium transition-colors duration-300 ease-marvin border-b-2 -mb-px min-h-[44px] flex items-end ${
                            active
                              ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                              : "text-[color:var(--ink-muted)] border-transparent hover:text-[color:var(--ink-primary)]"
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                </div>
                <button
                  onClick={() => setActiveFilter("all")}
                  className="group inline-flex items-center gap-1.5 pb-4 text-body-sm font-medium text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                >
                  <span className="inline-block transition-transform duration-300 ease-marvin group-hover:-translate-x-1">←</span>
                  All systems
                </button>
              </div>

              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                      <div className="aspect-video bg-[color:var(--canvas-soft)]" />
                      <div className="mt-6 space-y-3">
                        <div className="h-2.5 bg-[color:var(--rule-soft)] w-16" />
                        <div className="h-5 bg-[color:var(--rule-soft)] w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 relative">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((product) => (
                  <motion.button
                    key={product.id}
                    data-product-card
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.68, 0, 0.33, 1] }}
                    onClick={() => { setSelectedProduct(product); trackProductView(product.name); }}
                    className="group block text-left"
                  >
                    <div className="aspect-video bg-[color:var(--canvas-soft)] overflow-hidden">
                      <SystemCardMedia
                        productId={product.id}
                        src={product.image}
                        alt={product.name}
                        imgClassName="w-full h-full object-cover transition-transform duration-700 ease-marvin [@media(hover:hover)]:group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-6">
                      <p className="eyebrow mb-3">{product.category}</p>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-serif text-h5 lg:text-h4 font-normal tracking-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                          {product.name}
                        </h3>
                        <ArrowUpRight
                          size={20}
                          strokeWidth={1.5}
                          className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-all duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
                        />
                      </div>
                      <p className="mt-3 text-body-sm text-[color:var(--ink-secondary)] max-w-[24rem]">
                        {product.shortDescription}
                      </p>
                    </div>
                  </motion.button>
                ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </Layout>
  );
};

export default Products;

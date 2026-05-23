import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import QuoteModal from "@/components/shared/QuoteModal";
import { useProducts, Product } from "@/hooks/useProducts";
import FinishSwatch from "@/components/shared/FinishSwatch";
import { FRAME_FINISHES } from "@/data/fourlinq-data";
import { trackProductView } from "@/hooks/useAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import EditorialButton from "@/components/primitives/Button";

type ProductCategory = "windows" | "doors" | "specialist" | "systems";
type Filter = "all" | ProductCategory;

const filters: { label: string; value: Filter }[] = [
  { label: "All Systems", value: "all" },
  { label: "Windows", value: "windows" },
  { label: "Doors", value: "doors" },
  { label: "Specialist", value: "specialist" },
];

const ProductDrawer = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
        className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white z-[60] overflow-y-auto shadow-depth-8 flex flex-col"
      >
        {/* Accent stripe */}
        <div className="h-[3px] bg-[color:var(--accent)] shrink-0" />

        {/* Header */}
        <div className="px-6 lg:px-10 pt-6 pb-5 flex items-start justify-between shrink-0 border-b border-[color:var(--rule-soft)]">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)] font-medium">
              {product.category}
            </p>
            <h2 className="font-serif text-h4 lg:text-h3 mt-2 leading-[1.1] text-[color:var(--ink-primary)] tracking-tight">
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
          <div className="aspect-[4/3] bg-[color:var(--canvas-soft)] mb-8 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain p-6" />
          </div>

          <p className="text-body text-[color:var(--ink-secondary)] leading-[1.7] mb-10">
            {product.description}
          </p>

          {/* Specifications */}
          <p className="eyebrow mb-4">Specifications</p>
          <ul className="flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)] mb-10">
            {product.specs.map((spec) => (
              <li key={spec} className="py-3 text-body-sm text-[color:var(--ink-primary)]">
                {spec}
              </li>
            ))}
          </ul>

          {/* Finishes */}
          <p className="eyebrow mb-4">Available Finishes</p>
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

          {/* Glass */}
          <p className="eyebrow mb-4">Glass Options</p>
          <div className="flex gap-2 flex-wrap mb-10">
            {product.glassOptions.map((glass) => (
              <span key={glass} className="px-3 py-1.5 text-[12px] border border-[color:var(--rule-soft)] text-[color:var(--ink-primary)]">
                {glass}
              </span>
            ))}
          </div>

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
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get("filter") as Filter) || "all";
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => {
    if (activeFilter === "all") return products;
    return products.filter((p) => p.category === activeFilter);
  }, [activeFilter, products]);

  return (
    <Layout>
      <PageHeader
        eyebrow="The catalog"
        title="Systems engineered for the Philippine climate."
        breadcrumbLabel="Systems"
        subtitle="Custom-made uPVC windows and doors — quiet, thermally efficient, corrosion-resistant. Each profile tested for the heat, humidity, salt air, and storms that test what a home is made of."
      />

      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          {/* Filter rail + help-me-choose entry point */}
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-[color:var(--rule-soft)] mb-12 lg:mb-16">
            <div className="flex items-end gap-8">
              {filters.map((f) => {
                const active = activeFilter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setActiveFilter(f.value)}
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
            <a
              href="/help-me-choose"
              className="group inline-flex items-center gap-1.5 pb-4 text-body-sm font-medium text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
            >
              Not sure which one? Help me choose
              <span className="inline-block transition-transform duration-300 ease-marvin group-hover:translate-x-1">→</span>
            </a>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="aspect-[4/5] bg-[color:var(--canvas-soft)]" />
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
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.68, 0, 0.33, 1] }}
                    onClick={() => { setSelectedProduct(product); trackProductView(product.name); }}
                    className="group block text-left"
                  >
                    <div className="aspect-[4/5] bg-[color:var(--canvas-soft)] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain p-6 transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
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
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </Layout>
  );
};

export default Products;

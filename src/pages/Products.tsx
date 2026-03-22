import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import QuoteModal from "@/components/shared/QuoteModal";
import { useProducts, Product } from "@/hooks/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CasementIcon, SlidingIcon, FixedIcon, BifoldIcon, AwningIcon,
  LiftAndSlideIcon, FrenchDoorIcon, SlidingDoorIcon, EntranceIcon,
} from "@/components/icons/WindowIcons";

type ProductCategory = "windows" | "doors" | "systems";
type Filter = "all" | ProductCategory;

const filters: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Windows", value: "windows" },
  { label: "Doors", value: "doors" },
  { label: "Systems", value: "systems" },
];

const productIconMap: Record<string, React.FC<{ className?: string; size?: number; strokeWidth?: number }>> = {
  "casement-70": CasementIcon,
  "sliding-85": SlidingIcon,
  "fixed-panel": FixedIcon,
  "french-door": FrenchDoorIcon,
  "sliding-door": SlidingDoorIcon,
  "bifold-system": BifoldIcon,
  "entrance-system": EntranceIcon,
  "curtain-wall": FixedIcon,
};

const ProductIconBadge = ({ productId }: { productId: string }) => {
  const Icon = productIconMap[productId];
  if (!Icon) return null;
  return (
    <div className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-surface/80 backdrop-blur-sm border border-border flex items-center justify-center">
      <Icon size={24} strokeWidth={1} className="text-primary" />
    </div>
  );
};

const ProductDrawer = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/30 z-50" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-surface z-50 shadow-2xl overflow-y-auto"
      >
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-primary p-2"><X size={20} /></button>
          <img src={product.image} alt={product.name} className="w-full aspect-[4/3] object-contain bg-white rounded-lg mb-6 p-4" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{product.category}</span>
          <h2 className="text-2xl font-semibold text-primary mt-1 mb-3">{product.name}</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/60 mb-3">Specifications</h3>
          <ul className="space-y-2 mb-6">
            {product.specs.map((spec) => (
              <li key={spec} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                {spec}
              </li>
            ))}
          </ul>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/60 mb-3">Available Finishes</h3>
          <div className="flex gap-3 mb-6 flex-wrap">
            {product.finishes.map((finish) => (
              <div key={finish.name} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border-2 border-border" style={{ backgroundColor: finish.color }} title={finish.name} />
                <span className="text-[10px] text-muted-foreground">{finish.name}</span>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/60 mb-3">Glass Options</h3>
          <div className="flex gap-2 flex-wrap mb-8">
            {product.glassOptions.map((glass) => (
              <span key={glass} className="px-3 py-1 text-xs bg-secondary rounded-full text-secondary-foreground">{glass}</span>
            ))}
          </div>
          <Button className="w-full font-medium" size="lg" onClick={() => setQuoteOpen(true)}>
            Request a Quote
          </Button>
        </div>
      </motion.div>
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
        title="All Systems"
        breadcrumbLabel="Systems"
        subtitle="Explore our complete range of uPVC windows, doors, and specialist systems engineered for the Philippine climate."
      />

      <div className="pb-20">
        <div className="page-container">
          <div className="flex gap-2 mb-10 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-5 space-y-2">
                    <div className="h-3 bg-muted rounded w-16" />
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {filtered.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedProduct(product)}
                    className="group bg-card rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain bg-white p-4 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <ProductIconBadge productId={product.id} />
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{product.category}</span>
                      <h3 className="font-medium text-primary mt-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{product.shortDescription}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </Layout>
  );
};

export default Products;

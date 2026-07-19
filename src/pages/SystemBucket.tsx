import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import QuoteModal from "@/components/shared/QuoteModal";

import UPVCAdvantageStrip from "@/components/shared/UPVCAdvantageStrip";
import EditorialButton from "@/components/primitives/Button";
import { useProducts, Product } from "@/hooks/useProducts";
import { trackProductView } from "@/hooks/useAnalytics";
import SystemCardMedia from "@/components/shared/SystemCardMedia";

/**
 * Shared layout for the 3 system buckets (Window / Door / Specialist).
 * Tita's brief §2.1.1 — each bucket gets a parallel editorial landing page
 * with eyebrow → 88px headline → ~200-word intro → product grid.
 *
 * Drives /products/windows, /products/doors, /products/specialist.
 */

export interface BucketCopy {
  eyebrow: string;
  /** 2-word system slogan, Marvin Collection pattern */
  slogan: string;
  title: string;
  /** ~200-word editorial intro */
  intro: string;
  /** Comma-separated list of named sub-systems, displayed below intro */
  subSystemList: string;
  /** Which products.ts category to filter by */
  filterCategory: "windows" | "doors" | "specialist";
  breadcrumbLabel: string;
}

const SystemBucket = ({ copy }: { copy: BucketCopy }) => {
  const { data: products = [] } = useProducts();
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.category === copy.filterCategory),
    [products, copy.filterCategory]
  );

  return (
    <Layout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        breadcrumbLabel={copy.breadcrumbLabel}
        subtitle={copy.slogan}
      />

      {/* Editorial intro section */}
      <section className="pb-section-mobile md:pb-section-tablet lg:pb-section-desktop">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12 mb-14 lg:mb-20">
            <div className="lg:col-span-7">
              <p className="font-serif text-h4 lg:text-h3 leading-[1.35] text-[color:var(--ink-primary)] tracking-tight">
                {copy.intro}
              </p>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="eyebrow mb-4">In this collection</p>
              <p className="text-body-sm leading-[1.7] text-[color:var(--ink-secondary)]">
                {copy.subSystemList}
              </p>
            </div>
          </div>

          {/* Product grid */}
          <div className="border-t border-[color:var(--rule-soft)] pt-12 lg:pt-16">
            <div className="flex items-end justify-between gap-x-8 gap-y-4 mb-12 lg:mb-16">
              <div>
                <p className="eyebrow mb-3">The systems</p>
                <h2 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight">
                  {filtered.length === 1 ? "1 system" : `${filtered.length} systems`} in this collection
                </h2>
              </div>
              <Link
                to="/help-me-choose"
                className="hidden sm:inline-flex items-center gap-1.5 pb-1 text-body-sm font-medium text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
              >
                Help me choose
                <ArrowUpRight size={16} strokeWidth={1.5} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <motion.button
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.68, 0, 0.33, 1] }}
                    onClick={() => { setSelected(product); trackProductView(product.name); }}
                    className="group block text-left"
                  >
                    <div className="aspect-video bg-[color:var(--canvas-soft)] overflow-hidden">
                      <SystemCardMedia
                        productId={product.id}
                        src={product.image}
                        alt={product.name}
                        imgClassName="w-full h-full object-cover transition-transform duration-700 ease-marvin [@media(hover:hover)]:group-hover:scale-[1.02]"
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
          </div>

          {/* uPVC Advantage Strip — PH-context-specific counter to K&M's
              European-boilerplate "8 Advantages" list. */}
          <div className="mt-24 lg:mt-32 pt-12 lg:pt-16 border-t border-[color:var(--rule-soft)]">
            <UPVCAdvantageStrip />
          </div>

          {/* Consultation CTA */}
          <div className="mt-24 lg:mt-32 py-16 lg:py-20 border-t border-[color:var(--rule-soft)]">
            <div className="max-w-2xl">
              <p className="eyebrow mb-4">A bespoke process</p>
              <h2 className="font-serif text-h2 lg:text-h1 tracking-tight text-[color:var(--ink-primary)] leading-[1.05] mb-6">
                Every project starts with a conversation.
              </h2>
              <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] mb-10">
                Bring your floor plan or project questions. Contact FourlinQ first to confirm the relevant sample, location access, meeting format, and appointment time.
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 items-center">
                <EditorialButton to="/brand#showrooms" variant="primary" size="lg">
                  View locations
                </EditorialButton>
                <Link to="/brand#contact" className="text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin underline-offset-4 hover:underline">
                  Request a Quote →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product drawer — minimal stub, reuses Products.tsx pattern */}
      <AnimatePresence>
        {selected && (
          <ProductPeek product={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </Layout>
  );
};

const ProductPeek = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const [quoteOpen, setQuoteOpen] = useState(false);
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.68, 0, 0.33, 1] }}
        className="fixed inset-0 bg-[color:var(--ink-primary)]/30 backdrop-blur-sm z-[55]"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
        className="fixed top-0 right-0 h-full w-full sm:w-[520px] bg-white z-[60] overflow-y-auto shadow-depth-8"
      >
        <div className="h-[3px] bg-[color:var(--accent)]" />
        <div className="px-6 lg:px-10 pt-6 pb-5 flex items-start justify-between border-b border-[color:var(--rule-soft)]">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)] font-medium">
              {product.category}
            </p>
            <h2 className="font-serif text-h4 lg:text-h3 mt-2 leading-[1.1] text-[color:var(--ink-primary)] tracking-tight">
              {product.name}
            </h2>
          </div>
          <button onClick={onClose} className="-mr-2 -mt-1 p-2 text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin" aria-label="Close">
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="px-6 lg:px-10 py-8">
          <div className="aspect-video bg-white mb-8 overflow-hidden">
            <SystemCardMedia
              productId={product.id}
              src={product.image}
              alt={product.name}
              imgClassName="w-full h-full object-contain"
              animClassName="w-full h-full object-contain"
              trigger="click"
            />
          </div>
          <p className="text-body text-[color:var(--ink-secondary)] leading-[1.7] mb-10">
            {product.description}
          </p>
          <p className="eyebrow mb-4">Specifications</p>
          <ul className="flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)] mb-10">
            {product.specs.map((spec) => (
              <li key={spec} className="py-3 text-body-sm text-[color:var(--ink-primary)]">{spec}</li>
            ))}
          </ul>
          <EditorialButton onClick={() => setQuoteOpen(true)} variant="primary" size="lg" fullWidth>
            Request a Consultation
          </EditorialButton>
        </div>
      </motion.aside>
      <QuoteModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} productName={product.name} />
    </>
  );
};

export default SystemBucket;

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import EditorialButton from "@/components/primitives/Button";
import { motion, AnimatePresence } from "framer-motion";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
}

const inputClass =
  "w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] " +
  "py-2.5 text-body-sm text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] " +
  "transition-colors duration-300 ease-marvin";

const labelClass =
  "block text-[11px] tracking-[0.12em] uppercase font-medium text-[color:var(--ink-muted)] mb-1.5";

const QuoteModal = ({ isOpen, onClose, productName, productId }: QuoteModalProps) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", quantity: "", dimensions: "", finish: "", timeline: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId, productName }),
      });
      const data = await res.json();
      setResult({ success: res.ok, message: data.message || data.error, refId: data.refId });
    } catch {
      setResult({ success: false, message: "Network error. Please try again or call 0925-848-8888." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", email: "", phone: "", quantity: "", dimensions: "", finish: "", timeline: "", notes: "" });
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
            className="fixed inset-0 bg-[color:var(--ink-primary)]/30 backdrop-blur-sm z-[55]"
            onClick={handleClose}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.68, 0, 0.33, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-[60] overflow-y-auto shadow-depth-8 flex flex-col"
          >
            <div className="h-[3px] bg-[color:var(--accent)] shrink-0" />
            <div className="px-6 lg:px-10 pt-6 pb-5 flex items-start justify-between shrink-0 border-b border-[color:var(--rule-soft)]">
              <div>
                <p className="text-[11px] tracking-[0.14em] uppercase text-[color:var(--ink-muted)] font-medium">
                  Request a quote
                </p>
                <h2 className="font-serif text-h4 mt-2 leading-[1.1] text-[color:var(--ink-primary)] tracking-tight">
                  Tell us about your project.
                </h2>
              </div>
              <button onClick={handleClose} className="-mr-2 -mt-1 p-2 text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin" aria-label="Close">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {result ? (
              <div className="px-6 lg:px-10 py-12 text-center flex-1 flex flex-col items-center justify-center">
                {result.success ? (
                  <>
                    <CheckCircle className="mb-5 text-[color:var(--accent)]" size={40} strokeWidth={1.25} />
                    <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">
                      Request submitted.
                    </h3>
                    <p className="text-body-sm text-[color:var(--ink-secondary)] mb-4 max-w-[24rem]">{result.message}</p>
                    {result.refId && (
                      <p className="eyebrow mb-8">
                        Reference <span className="font-mono normal-case tracking-normal text-[color:var(--ink-primary)] ml-1">{result.refId}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="mb-5 text-[color:var(--accent)]" size={40} strokeWidth={1.25} />
                    <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">
                      Something went wrong.
                    </h3>
                    <p className="text-body-sm text-[color:var(--ink-secondary)] mb-8 max-w-[24rem]">{result.message}</p>
                  </>
                )}
                <EditorialButton onClick={handleClose} variant="secondary" size="md">Close</EditorialButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 lg:px-10 py-8 space-y-6 flex-1">
                {productName && (
                  <p className="text-body-sm text-[color:var(--ink-secondary)] -mt-2">
                    For <span className="font-medium text-[color:var(--ink-primary)]">{productName}</span>
                  </p>
                )}
                <div>
                  <label className={labelClass}>Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your full name" />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@email.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+63 9XX XXX XXXX" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Quantity</label>
                    <input type="text" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputClass} placeholder="e.g. 5 panels" />
                  </div>
                  <div>
                    <label className={labelClass}>Dimensions</label>
                    <input type="text" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className={inputClass} placeholder="1200×1400mm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Preferred finish</label>
                    <input type="text" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })} className={inputClass} placeholder="e.g. Walnut" />
                  </div>
                  <div>
                    <label className={labelClass}>Timeline</label>
                    <input type="text" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={inputClass} placeholder="e.g. 2 months" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Additional notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Project details, special requirements…" />
                </div>
                <EditorialButton type="submit" variant="primary" size="md" disabled={submitting} fullWidth>
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin mr-2" /> Submitting…</>
                    : "Submit quote request"}
                </EditorialButton>
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;

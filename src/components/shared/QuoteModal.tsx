import { useState } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productId?: string;
}

const QuoteModal = ({ isOpen, onClose, productName, productId }: QuoteModalProps) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

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
      setResult({ success: false, message: "Network error. Please try again or call +63 2 8123 4567." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ name: "", email: "", phone: "", notes: "" });
    setResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-surface rounded-xl shadow-2xl border border-border w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary">Request a Quote</h2>
                <button onClick={handleClose} className="text-muted-foreground hover:text-primary p-1">
                  <X size={18} />
                </button>
              </div>

              {result ? (
                <div className="px-6 py-8 text-center">
                  <CheckCircle className={`mx-auto mb-4 ${result.success ? "text-green-600" : "text-red-500"}`} size={48} />
                  <p className="text-primary font-medium mb-2">{result.success ? "Request Submitted!" : "Something went wrong"}</p>
                  <p className="text-sm text-muted-foreground mb-1">{result.message}</p>
                  {result.refId && (
                    <p className="text-xs text-muted-foreground mt-2">Reference: <span className="font-mono font-medium text-primary">{result.refId}</span></p>
                  )}
                  <Button onClick={handleClose} className="mt-6">Close</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                  {productName && (
                    <p className="text-sm text-muted-foreground">
                      Requesting quote for <span className="font-medium text-primary">{productName}</span>
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-primary outline-none focus:border-primary"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-primary outline-none focus:border-primary"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-primary outline-none focus:border-primary"
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-primary outline-none focus:border-primary resize-none"
                      placeholder="Quantity, size requirements, project details..."
                    />
                  </div>
                  <Button type="submit" className="w-full font-medium" size="lg" disabled={submitting}>
                    {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Submitting...</> : "Submit Quote Request"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuoteModal;

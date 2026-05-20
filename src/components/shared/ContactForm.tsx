import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import EditorialButton from "@/components/primitives/Button";

const inputClass =
  "w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] " +
  "py-3 text-body text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] " +
  "transition-colors duration-300 ease-marvin";

const labelClass =
  "block text-[11px] tracking-[0.12em] uppercase font-medium text-[color:var(--ink-muted)] mb-2";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult({ success: res.ok, message: data.message || data.error });
      if (res.ok) setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setResult({ success: false, message: "Network error. Please try again or call 0925-848-8888." });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div className="border border-[color:var(--rule-soft)] p-10 lg:p-12 text-center">
        <CheckCircle className="mx-auto mb-5 text-[color:var(--accent)]" size={36} strokeWidth={1.25} />
        <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-3">
          Message sent.
        </h3>
        <p className="text-body-sm text-[color:var(--ink-secondary)] mb-8 max-w-[28rem] mx-auto">
          {result.message}
        </p>
        <EditorialButton onClick={() => setResult(null)} variant="secondary" size="sm">
          Send another message
        </EditorialButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <p className="eyebrow mb-4">Send a message</p>

      {result && !result.success && (
        <div className="flex items-center gap-2 text-body-sm text-[color:var(--accent)] border-l-2 border-[color:var(--accent)] pl-3">
          <AlertCircle size={16} strokeWidth={1.5} /> {result.message}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-7">
        <div>
          <label className={labelClass}>Name *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your name" />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@email.com" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-7">
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+63 9XX XXX XXXX" />
        </div>
        <div>
          <label className={labelClass}>Subject</label>
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="Product inquiry, consultation…" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Message *</label>
        <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className={`${inputClass} resize-none`} placeholder="Tell us about your project or ask a question…" />
      </div>

      <EditorialButton type="submit" variant="primary" size="md" disabled={submitting} fullWidth>
        {submitting
          ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending…</>
          : "Send message"}
      </EditorialButton>
    </form>
  );
};

export default ContactForm;

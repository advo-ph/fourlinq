import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      setResult({ success: false, message: "Network error. Please try again or call +63 2 8123 4567." });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
        <p className="text-primary font-medium mb-2">Message Sent!</p>
        <p className="text-sm text-muted-foreground mb-4">{result.message}</p>
        <Button variant="outline" onClick={() => setResult(null)}>Send Another Message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      <h3 className="text-lg font-semibold text-primary mb-2">Send Us a Message</h3>

      {result && !result.success && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle size={16} /> {result.message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-primary outline-none focus:border-primary"
            placeholder="Your name"
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
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-primary mb-1">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-primary outline-none focus:border-primary"
            placeholder="Product inquiry, consultation..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">Message *</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-primary outline-none focus:border-primary resize-none"
          placeholder="Tell us about your project or ask a question..."
        />
      </div>

      <Button type="submit" className="w-full font-medium" size="lg" disabled={submitting}>
        {submitting ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</> : "Send Message"}
      </Button>
    </form>
  );
};

export default ContactForm;

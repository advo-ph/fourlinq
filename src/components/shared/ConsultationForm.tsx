import { useState, useMemo } from "react";
import { Loader2, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import EditorialButton from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

/**
 * Multi-step consultation booking form — K&M-beat strategy from
 * docs/competitor-audit-kenneth-mock.md §8 Tier 2 #10.
 *
 * K&M ships a 4-field generic form (Name / Email / Subject / Message).
 * Ours qualifies the lead in 4 progressive steps:
 *   1. Project type   (New build / Renovation / Replacement / Architect-specifying)
 *   2. Timeline       (Now / 3-6 mo / 6-12 mo / Researching)
 *   3. Location       (province dropdown)
 *   4. Contact        (name, email, phone) + optional notes
 *
 * Each step has 4 chips except step 3 (dropdown) and step 4 (form). Visible
 * progress dots at top. Step content cross-fades; navigation is keyboard +
 * touch friendly. On submit, POSTs to /api/contact with a richer payload
 * than the previous Subject/Message form.
 */

type ProjectType = "new-build" | "renovation" | "replacement" | "architect";
type Timeline = "now" | "soon" | "later" | "researching";

const PROJECT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  { value: "new-build", label: "New construction", description: "Building a home from the ground up." },
  { value: "renovation", label: "Renovation", description: "Adding or expanding on an existing home." },
  { value: "replacement", label: "Replacement", description: "Replacing existing windows or doors." },
  { value: "architect", label: "Architect specifying", description: "I'm specifying on behalf of a client." },
];

const TIMELINES: { value: Timeline; label: string; description: string }[] = [
  { value: "now", label: "Within 3 months", description: "Ready to order soon." },
  { value: "soon", label: "3 – 6 months", description: "Planning phase." },
  { value: "later", label: "6 – 12 months", description: "Early design phase." },
  { value: "researching", label: "Just researching", description: "Exploring options." },
];

const PH_REGIONS = [
  "Metro Manila",
  "Cebu",
  "Cavite (Tagaytay)",
  "Batangas",
  "Rizal (Antipolo)",
  "Laguna",
  "Bulacan",
  "Pampanga",
  "Davao",
  "Iloilo",
  "Bacolod",
  "Other Philippines",
  "International",
];

const inputClass =
  "w-full bg-transparent border-b border-[color:var(--rule-soft)] focus:border-[color:var(--ink-primary)] " +
  "py-3 text-body text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] " +
  "transition-colors duration-300 ease-marvin";

const labelClass =
  "block text-[11px] tracking-[0.12em] uppercase font-medium text-[color:var(--ink-muted)] mb-2";

interface FormState {
  projectType?: ProjectType;
  timeline?: Timeline;
  region?: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const ConsultationForm = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!form.projectType;
      case 1: return !!form.timeline;
      case 2: return !!form.region;
      case 3: return form.name.length > 1 && /^\S+@\S+\.\S+$/.test(form.email);
      default: return false;
    }
  }, [step, form]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const subject = `Consultation: ${PROJECT_TYPES.find((p) => p.value === form.projectType)?.label} · ${form.region}`;
      const message = [
        `Project type: ${PROJECT_TYPES.find((p) => p.value === form.projectType)?.label}`,
        `Timeline: ${TIMELINES.find((t) => t.value === form.timeline)?.label}`,
        `Location: ${form.region}`,
        form.notes ? `\nNotes:\n${form.notes}` : null,
      ].filter(Boolean).join("\n");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject,
          message,
          // Extra structured payload — backend may persist these directly
          projectType: form.projectType,
          timeline: form.timeline,
          region: form.region,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setResult({ success: res.ok, message: data.message || (res.ok ? "We'll be in touch within one business day." : "Couldn't send. Please try again or call 0925-848-8888.") });
    } catch {
      setResult({ success: false, message: "Network error. Please try again or call 0925-848-8888." });
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.success) {
    return (
      <div className="border border-[color:var(--rule-soft)] p-10 lg:p-14 text-center">
        <CheckCircle className="mx-auto mb-5 text-[color:var(--accent)]" size={40} strokeWidth={1.25} />
        <h3 className="font-serif text-h3 text-[color:var(--ink-primary)] tracking-tight mb-4">
          Consultation request received.
        </h3>
        <p className="text-body text-[color:var(--ink-secondary)] mb-8 max-w-[32rem] mx-auto leading-[1.65]">
          {result.message} A FourlinQ engineer will reach out within one business day to schedule your showroom visit. Bring your floor plan, or just your questions.
        </p>
        <EditorialButton onClick={() => { setResult(null); setStep(0); setForm({ name: "", email: "", phone: "", notes: "" }); }} variant="secondary" size="sm">
          Start another request
        </EditorialButton>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn(
            "h-1 flex-1 transition-colors duration-300 ease-marvin",
            i <= step ? "bg-[color:var(--accent)]" : "bg-[color:var(--rule-soft)]"
          )} />
        ))}
        <span className="text-[11px] tracking-[0.1em] uppercase text-[color:var(--ink-muted)] font-medium ml-3 shrink-0">
          Step {step + 1} of 4
        </span>
      </div>

      {result && !result.success && (
        <div className="flex items-start gap-2 text-body-sm text-[color:var(--accent)] border-l-2 border-[color:var(--accent)] pl-3">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" /> {result.message}
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[260px]">
        {step === 0 && (
          <Step eyebrow="Tell us about your project" title="What kind of project?" subtitle="So we route you to the right FourlinQ specialist.">
            <ChipGrid
              options={PROJECT_TYPES}
              value={form.projectType}
              onChange={(v) => setForm((f) => ({ ...f, projectType: v as ProjectType }))}
            />
          </Step>
        )}
        {step === 1 && (
          <Step eyebrow="Project timeline" title="When are you planning to install?" subtitle="A rough window. We'll calibrate the consultation around it.">
            <ChipGrid
              options={TIMELINES}
              value={form.timeline}
              onChange={(v) => setForm((f) => ({ ...f, timeline: v as Timeline }))}
            />
          </Step>
        )}
        {step === 2 && (
          <Step eyebrow="Project location" title="Where is the project?" subtitle="So we know which showroom (Manila / Cebu) and which engineer is closest.">
            <div className="max-w-md">
              <label className={labelClass}>Region or province</label>
              <select
                value={form.region ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className={cn(inputClass, "appearance-none cursor-pointer")}
              >
                <option value="" disabled>Select a region</option>
                {PH_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </Step>
        )}
        {step === 3 && (
          <Step eyebrow="Your details" title="How do we reach you?" subtitle="We'll respond within one business day.">
            <div className="grid sm:grid-cols-2 gap-7 max-w-2xl">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" required value={form.name}
                       onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                       className={inputClass} placeholder="Your name" />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" required value={form.email}
                       onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                       className={inputClass} placeholder="you@email.com" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Phone (Optional)</label>
                <input type="tel" value={form.phone}
                       onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                       className={inputClass} placeholder="+63 9XX XXX XXXX" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Anything specific to share?</label>
                <textarea value={form.notes}
                          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                          rows={4} className={cn(inputClass, "resize-none")}
                          placeholder="Floor plan reference, expected window count, key dates…" />
              </div>
            </div>
          </Step>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[color:var(--rule-soft)]">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className={cn(
            "inline-flex items-center gap-1.5 py-3 text-body-sm font-medium",
            "transition-colors duration-300 ease-marvin",
            step === 0
              ? "text-[color:var(--ink-faint)] cursor-not-allowed"
              : "text-[color:var(--ink-secondary)] hover:text-[color:var(--ink-primary)]"
          )}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </button>

        {step < 3 ? (
          <EditorialButton
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            disabled={!canProceed}
            variant="primary"
            size="md"
          >
            Continue
            <ArrowRight size={16} strokeWidth={1.5} className="ml-1.5" />
          </EditorialButton>
        ) : (
          <EditorialButton
            onClick={submit}
            disabled={!canProceed || submitting}
            variant="primary"
            size="md"
          >
            {submitting
              ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending…</>
              : "Request consultation"}
          </EditorialButton>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────── */

const Step = ({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) => (
  <div>
    <p className="eyebrow mb-3">{eyebrow}</p>
    <h3 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1] mb-3">
      {title}
    </h3>
    <p className="text-body text-[color:var(--ink-secondary)] mb-8 max-w-xl leading-[1.6]">
      {subtitle}
    </p>
    {children}
  </div>
);

interface ChipOption {
  value: string;
  label: string;
  description: string;
}

const ChipGrid = ({ options, value, onChange }: { options: ChipOption[]; value?: string; onChange: (v: string) => void }) => (
  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <li key={opt.value}>
          <button
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "w-full text-left px-5 py-5 transition-all duration-300 ease-marvin border",
              active
                ? "border-[color:var(--ink-primary)] bg-[color:var(--canvas-soft)]"
                : "border-[color:var(--rule-soft)] hover:border-[color:var(--ink-primary)]"
            )}
          >
            <p className={cn(
              "font-serif text-h6 tracking-tight mb-1.5",
              active ? "text-[color:var(--ink-primary)]" : "text-[color:var(--ink-primary)]"
            )}>
              {opt.label}
            </p>
            <p className="text-body-sm text-[color:var(--ink-secondary)] leading-snug">
              {opt.description}
            </p>
          </button>
        </li>
      );
    })}
  </ul>
);

export default ConsultationForm;

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EditorialButton from "@/components/primitives/Button";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

/**
 * Help-me-choose flow — 3 questions that recommend 1-2 systems from the
 * brochure-verified catalog (Casement, Sliding, Awning, Special Shapes, Slide & Fold).
 *
 * Scoring approach: each answer adds points to system candidates; the top 1-2
 * scorers are surfaced as recommendations. Always reachable, no dead-ends.
 */

type SystemId = "casement" | "sliding" | "awning" | "special-shapes" | "slide-and-fold";

interface SystemSummary {
  id: SystemId;
  label: string;
  tagline: string;
  why: string;
  link: string;
}

const SYSTEMS: Record<SystemId, SystemSummary> = {
  casement: {
    id: "casement",
    label: "Casement",
    tagline: "Maximum ventilation. Easy cleaning.",
    why: "Hinged on one side and opens outward. Best when you want the whole window to swing fully open — bedrooms, living rooms, kitchens with countertops below.",
    link: "/products?filter=windows",
  },
  sliding: {
    id: "sliding",
    label: "Sliding",
    tagline: "Space-saving. Versatile.",
    why: "Slides horizontally along a track. Best where outward clearance is limited — balconies, walkways, narrow corridors, or above kitchen counters.",
    link: "/products?filter=windows",
  },
  awning: {
    id: "awning",
    label: "Awning",
    tagline: "Ventilation, even in rain.",
    why: "Hinged at the top and opens outward. Lets in air and light during heavy rain without water entering. Often used above fixed glass or as a high transom.",
    link: "/products?filter=windows",
  },
  "special-shapes": {
    id: "special-shapes",
    label: "Special Shapes",
    tagline: "Architectural impact.",
    why: "Custom geometry — arches, circles, trapezoids, triangles. Combine with other systems to create a feature wall of glass. Specify with architectural drawings.",
    link: "/products",
  },
  "slide-and-fold": {
    id: "slide-and-fold",
    label: "Slide & Fold",
    tagline: "Open the whole wall.",
    why: "Panels slide and fold to one side, creating a seamless indoor-outdoor opening. Best for living areas opening onto patios, garden rooms, lanais, or entertainment spaces.",
    link: "/products?filter=doors",
  },
};

interface Choice {
  label: string;
  scores: Partial<Record<SystemId, number>>;
}

interface Question {
  q: string;
  helper?: string;
  choices: Choice[];
}

const QUESTIONS: Question[] = [
  {
    q: "Where will it go?",
    helper: "Pick the option that best matches the room or wall.",
    choices: [
      { label: "Bedroom or living room — facing outside",                                scores: { casement: 3, awning: 1, sliding: 1 } },
      { label: "Kitchen, with a counter or sink below the window",                       scores: { sliding: 3, awning: 2, casement: 0 } },
      { label: "Balcony, walkway, or narrow exterior clearance",                         scores: { sliding: 3, awning: 1 } },
      { label: "Patio, lanai, or living room opening onto a garden",                     scores: { "slide-and-fold": 4, sliding: 2 } },
      { label: "High wall, gable, or above-door transom",                                scores: { awning: 3, "special-shapes": 3, casement: 1 } },
      { label: "Custom shape — arch, circle, trapezoid, triangle",                       scores: { "special-shapes": 5 } },
    ],
  },
  {
    q: "What matters most?",
    helper: "Pick the property you'd most prioritize.",
    choices: [
      { label: "Maximum airflow when open",                                              scores: { casement: 3, "slide-and-fold": 3, sliding: 1 } },
      { label: "Letting in air even during heavy rain",                                  scores: { awning: 4 } },
      { label: "Saving space — nothing protruding inward or outward",                    scores: { sliding: 4, "slide-and-fold": 1 } },
      { label: "Architectural drama or unusual geometry",                                scores: { "special-shapes": 4 } },
      { label: "Seamless indoor–outdoor connection",                                     scores: { "slide-and-fold": 5 } },
      { label: "Easy to clean from inside",                                              scores: { casement: 3, sliding: 2 } },
    ],
  },
  {
    q: "Roughly how wide is the opening?",
    helper: "Estimate is fine — we measure on site.",
    choices: [
      { label: "Under 1 m — small window",                                               scores: { casement: 2, awning: 2 } },
      { label: "1 to 2 m — standard window",                                             scores: { casement: 3, sliding: 3, awning: 1 } },
      { label: "2 to 3 m — wide window or single sliding door",                          scores: { sliding: 4, casement: 1 } },
      { label: "3 m or more — full wall opening, doors",                                 scores: { "slide-and-fold": 5, sliding: 2 } },
      { label: "Non-rectangular — needs custom shape",                                   scores: { "special-shapes": 5 } },
    ],
  },
];

const HowToChoose = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);

  const allAnswered = answers.every((a) => a !== null);
  const showingResult = step >= QUESTIONS.length;

  const recommendations: SystemSummary[] = useMemo(() => {
    if (!allAnswered) return [];
    const totals: Record<SystemId, number> = {
      casement: 0, sliding: 0, awning: 0, "special-shapes": 0, "slide-and-fold": 0,
    };
    answers.forEach((a, i) => {
      if (a === null) return;
      const scores = QUESTIONS[i].choices[a].scores;
      (Object.keys(scores) as SystemId[]).forEach((sys) => {
        totals[sys] += scores[sys] || 0;
      });
    });
    const sorted = (Object.keys(totals) as SystemId[]).sort((a, b) => totals[b] - totals[a]);
    // Recommend top scorer + any tied or near-tied (within 2 points)
    const top = totals[sorted[0]];
    const picks = sorted.filter((id) => totals[id] >= top - 2 && totals[id] > 0).slice(0, 2);
    return picks.map((id) => SYSTEMS[id]);
  }, [answers, allAnswered]);

  const handleChoice = (qi: number, ci: number) => {
    const next = [...answers];
    next[qi] = ci;
    setAnswers(next);
    if (qi < QUESTIONS.length - 1) {
      setStep(qi + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  const reset = () => {
    setAnswers([null, null, null]);
    setStep(0);
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="Help me choose"
        title="Three questions. One recommendation."
        breadcrumbLabel="Help me choose"
        subtitle="If you're not sure which window or door system fits your project, answer three quick questions. We'll point you at the one or two systems most likely to work — then you can dive into the catalog from there."
      />

      <Section tone="canvas" size="lg" className="!pt-0">
        {/* Progress rail */}
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          {QUESTIONS.map((_, i) => {
            const done = answers[i] !== null;
            const active = step === i;
            return (
              <div
                key={i}
                className={`h-[2px] flex-1 transition-colors duration-300 ease-marvin ${
                  done || active
                    ? "bg-[color:var(--accent)]"
                    : "bg-[color:var(--rule-soft)]"
                }`}
              />
            );
          })}
          <span className="text-[11px] tracking-[0.1em] uppercase text-[color:var(--ink-muted)] font-medium ml-3 shrink-0">
            {showingResult ? "Done" : `${step + 1} / ${QUESTIONS.length}`}
          </span>
        </div>

        {/* Question or result */}
        {!showingResult ? (
          <div className="max-w-[44rem]">
            <p className="eyebrow mb-5">Question {step + 1}</p>
            <h2 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1]">
              {QUESTIONS[step].q}
            </h2>
            {QUESTIONS[step].helper && (
              <p className="mt-5 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-relaxed">
                {QUESTIONS[step].helper}
              </p>
            )}

            <ul className="mt-10 lg:mt-14 flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
              {QUESTIONS[step].choices.map((c, ci) => {
                const selected = answers[step] === ci;
                return (
                  <li key={ci}>
                    <button
                      onClick={() => handleChoice(step, ci)}
                      className={`w-full text-left py-5 lg:py-6 flex items-center justify-between gap-4 group min-h-[44px] transition-colors duration-300 ease-marvin ${
                        selected
                          ? "text-[color:var(--accent)]"
                          : "text-[color:var(--ink-primary)] hover:text-[color:var(--accent)]"
                      }`}
                    >
                      <span className="text-body lg:text-body-lg leading-snug">{c.label}</span>
                      <ArrowRight
                        size={18}
                        strokeWidth={1.5}
                        className={`shrink-0 transition-all duration-300 ease-marvin ${
                          selected
                            ? "text-[color:var(--accent)] translate-x-1"
                            : "text-[color:var(--ink-muted)] group-hover:text-[color:var(--accent)] group-hover:translate-x-1"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {step > 0 && (
              <div className="mt-10">
                <button
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-2 text-body-sm font-medium text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin"
                >
                  <ArrowLeft size={14} strokeWidth={1.5} />
                  Back
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="max-w-[60rem]">
            <p className="eyebrow mb-5 inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-[color:var(--rule-strong)]">
              Recommendation
            </p>
            <h2 className="font-serif text-h3 lg:text-h2 text-[color:var(--ink-primary)] tracking-tight leading-[1.1] mb-8">
              {recommendations.length === 1
                ? `Start with ${recommendations[0].label}.`
                : `Start with ${recommendations[0].label} or ${recommendations[1].label}.`}
            </h2>
            <p className="text-body lg:text-body-lg text-[color:var(--ink-secondary)] max-w-[40rem] leading-relaxed mb-12">
              Based on what you described, here's what we'd point you at first. Click through to the catalog for full specs, or get in touch and we'll talk through the project.
            </p>

            <ul className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
              {recommendations.map((rec) => (
                <li key={rec.id} className="border border-[color:var(--rule-soft)] p-6 lg:p-8">
                  <p className="eyebrow mb-3">{rec.tagline}</p>
                  <h3 className="font-serif text-h4 text-[color:var(--ink-primary)] tracking-tight mb-4">
                    {rec.label}
                  </h3>
                  <p className="text-body text-[color:var(--ink-secondary)] leading-[1.65] mb-6">
                    {rec.why}
                  </p>
                  <Link
                    to={rec.link}
                    className="group inline-flex items-center gap-1.5 text-body-sm font-medium text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                  >
                    See in the catalog
                    <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-marvin" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-5">
              <EditorialButton to="/brand#contact" variant="primary" size="md">
                Talk to our team
              </EditorialButton>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 text-body-sm font-medium text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin min-h-[44px] px-2"
              >
                <RotateCcw size={14} strokeWidth={1.5} />
                Start over
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Direct paths if quiz isn't your style */}
      {!showingResult && (
        <Section tone="soft" size="md">
          <div className="grid lg:grid-cols-[1fr,1fr] gap-10 items-start">
            <div>
              <p className="eyebrow mb-3">Rather skip the quiz?</p>
              <h2 className="font-serif text-h4 lg:text-h3 text-[color:var(--ink-primary)] tracking-tight leading-[1.1]">
                Two faster paths.
              </h2>
            </div>
            <ul className="flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
              <li>
                <Link to="/products" className="group flex items-center justify-between gap-4 py-4 text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                  <span className="text-body-sm font-medium">Browse the full catalog</span>
                  <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-marvin" />
                </Link>
              </li>
              <li>
                <Link to="/design-tool" className="group flex items-center justify-between gap-4 py-4 text-[color:var(--ink-primary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                  <span className="text-body-sm font-medium">Configure your own with the Design Tool</span>
                  <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300 ease-marvin" />
                </Link>
              </li>
            </ul>
          </div>
        </Section>
      )}
    </Layout>
  );
};

export default HowToChoose;

import { Link } from "react-router-dom";
import { FRAME_FINISHES, BRANCHES } from "@/data/fourlinq-data";

/**
 * Authority strip — Tier 1 of the Kenneth & Mock punch list.
 *
 * K&M leads with a single floating "8,630 projects" stat. We counter with
 * a *trio of verifiable numbers* — every one is brochure-confirmed and
 * grep-able in src/data/fourlinq-data.ts. No fabrication.
 *
 * The "Made for the climate, not imported into it." line is a positioning
 * statement (not a number-claim) — it's our PH-context-specific moat that
 * K&M's European-partner-distributor model cannot honestly use.
 */

// All 4 BRANCHES count as customer-visitable locations (Manila Main +
// Ortigas + Alabang + Cebu — per fourlinq-data.ts).
const locationCount = BRANCHES.length;

const stats = [
  {
    value: FRAME_FINISHES.length,
    label: "Brochure-verified finishes",
  },
  {
    value: locationCount,
    label: "Showrooms across Metro Manila and Cebu",
  },
  {
    value: 10,
    label: "Year standard system warranty",
  },
];

const AuthorityStrip = () => (
  <div>
    <div className="grid lg:grid-cols-[5fr,6fr] gap-12 lg:gap-20 items-end">
      <div>
        <p className="eyebrow mb-5">Made for the climate</p>
        <h2 className="font-serif text-h2 lg:text-h1 leading-[1.05] tracking-tight text-[color:var(--ink-primary)]">
          European engineering, fabricated for tropical climate.
        </h2>
        <p className="mt-6 text-body lg:text-body-lg text-[color:var(--ink-secondary)] leading-[1.65] max-w-[34rem]">
          Multi-chamber uPVC profiles built to European fenestration standards, then custom-fabricated in our Manila workshop to your architect's drawings. Twelve finishes. Installed by our own team.
        </p>
        <Link
          to="/why-upvc"
          className="group inline-flex items-center gap-2 mt-8 text-body-sm font-medium text-[color:var(--ink-primary)] border-b-[1.5px] border-[color:var(--ink-primary)] pb-1 hover:text-[color:var(--accent)] hover:border-[color:var(--accent)] transition-colors duration-300 ease-marvin"
        >
          Why uPVC
          <span className="transition-transform duration-300 ease-marvin group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      <ul className="grid grid-cols-3 gap-6 lg:gap-10 border-t border-[color:var(--rule-soft)] pt-10">
        {stats.map((s) => (
          <li key={String(s.value) + s.label}>
            <p className="font-serif text-[48px] md:text-[64px] lg:text-[88px] leading-none tracking-tight text-[color:var(--ink-primary)]">
              {s.value}
            </p>
            <p className="mt-3 text-[11px] sm:text-body-sm uppercase tracking-[0.1em] text-[color:var(--ink-muted)] leading-snug">
              {s.label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default AuthorityStrip;

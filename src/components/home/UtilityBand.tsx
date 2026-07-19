import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/**
 * The three-card utility band — the one Marvin homepage module FourlinQ was
 * missing (Purplegradient audit: "Find a Dealer, Professional Resources, and
 * Photo Gallery trio", charcoal action-card surface, white text).
 *
 * Mapped to FourlinQ's own equivalents: Showrooms / For Architects /
 * Inspiration. Marvin's grammar, FourlinQ's skin — every line below is copy
 * that already exists on the destination page, condensed. Nothing invented.
 *
 * Hover is restrained per the audit ("do not add scale, glow, transform").
 */

interface UtilityCard {
  key: string;
  eyebrow: string;
  title: string;
  line: string;
  to: string;
}

const CARD: UtilityCard[] = [
  {
    key: "showrooms",
    eyebrow: "Visit",
    title: "Published locations",
    line: "Use the three published location records, then confirm access, appointment time, and relevant samples before visiting.",
    to: "/brand#showrooms",
  },
  {
    key: "architects",
    eyebrow: "For professionals",
    title: "For Architects",
    line: "Open the public catalog and finish library, or send a bounded request for technical files that FourlinQ must confirm.",
    to: "/for-architects",
  },
  {
    key: "inspiration",
    eyebrow: "Gallery",
    title: "Inspiration",
    line: "Browse the current project archive and its available photos, locations, captions, and project notes.",
    to: "/inspiration",
  },
];

const UtilityBand = () => (
  <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
    {CARD.map((c) => (
      <li key={c.key}>
        <Link
          to={c.to}
          // Charcoal action-card on the near-black band — Marvin's utility-card
          // contrast. NOTE: --charcoal-light is an HSL triple (0 0% 16%), not a
          // colour literal, so it can't be used bare in bg-[color:...].
          className="group flex h-full flex-col bg-[hsl(0_0%_19%)] p-8 lg:p-10 transition-colors duration-300 ease-marvin hover:bg-[color:var(--accent)]"
        >
          <p className="eyebrow !text-white/60 mb-4">{c.eyebrow}</p>
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif font-normal tracking-tight text-h5 lg:text-h4 text-white leading-[1.2]">
              {c.title}
            </h3>
            <ArrowUpRight
              size={20}
              strokeWidth={1.5}
              className="mt-1 shrink-0 text-white/50 transition-colors duration-300 ease-marvin group-hover:text-white"
            />
          </div>
          <p className="mt-4 text-body-sm text-white/70 leading-[1.6] transition-colors duration-300 ease-marvin group-hover:text-white/90">
            {c.line}
          </p>
        </Link>
      </li>
    ))}
  </ul>
);

export default UtilityBand;

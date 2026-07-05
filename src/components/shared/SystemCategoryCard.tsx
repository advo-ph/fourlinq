import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export interface SystemCategory {
  key: string;
  /** "System" for the uPVC families, "Material line" for aluminium. */
  eyebrow: string;
  name: string;
  description: string;
  items: string[];
  image: string;
  to: string;
}

/**
 * Marvin-style category card — the shared primitive behind the /products
 * landing and the homepage systems section.
 *
 * Grammar mirrors Marvin's `collection-card` (real project photo + eyebrow +
 * name + short desc + item list + text CTA), rebuilt in FourlinQ's own skin:
 * red hairline top-rule, serif name, restrained hover. Layout matches Imie's
 * 2026-07-02 diagram; design source is the purplegradient Marvin audit.
 */
const SystemCategoryCard = ({ category }: { category: SystemCategory }) => (
  <Link to={category.to} className="group block text-left">
    <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)] border-t-[3px] border-[color:var(--accent)]">
      <img
        src={category.image}
        alt={`${category.name} — FourlinQ project`}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 ease-marvin [@media(hover:hover)]:group-hover:scale-[1.035]"
      />
    </div>
    <div className="mt-5">
      <p className="eyebrow mb-2">{category.eyebrow}</p>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-serif text-h5 lg:text-h4 font-normal tracking-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
          {category.name}
        </h3>
        <ArrowUpRight
          size={20}
          strokeWidth={1.5}
          className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-all duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
        />
      </div>
      <p className="mt-2 text-body-sm text-[color:var(--ink-secondary)] max-w-[30ch]">
        {category.description}
      </p>
      <ul className="mt-4 border-t border-[color:var(--rule-soft)]">
        {category.items.map((it) => (
          <li
            key={it}
            className="text-body-sm text-[color:var(--ink-primary)] py-2.5 border-b border-[color:var(--rule-soft)]"
          >
            {it}
          </li>
        ))}
      </ul>
    </div>
  </Link>
);

export default SystemCategoryCard;

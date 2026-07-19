import { Link } from "react-router-dom";
import ScrollReveal from "@/components/primitives/ScrollReveal";
import type { WhatsNewEntry } from "@/data/whats-new";

interface NewsCardProps {
  entry: WhatsNewEntry;
  reveal?: boolean;
}

const categoryLabel = (category: WhatsNewEntry["category"]) =>
  category.charAt(0).toUpperCase() + category.slice(1);

const dateLabel = (entry: WhatsNewEntry) => {
  if (!entry.dateVerified) return "DATE UNVERIFIED";
  const date = new Date(entry.date);
  if (Number.isNaN(date.getTime())) return "DATE UNVERIFIED";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
};

const NewsCard = ({ entry, reveal = false }: NewsCardProps) => {
  const media = entry.image ? (
    <div className="relative aspect-[5/4] overflow-hidden bg-[color:var(--canvas-soft)]">
      <img
        src={entry.image}
        alt={entry.title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
      />
    </div>
  ) : null;

  const content = (
    <>
      {reveal && media ? <ScrollReveal>{media}</ScrollReveal> : media}
      <div className={media ? "mt-5" : undefined}>
        <div className="flex items-center gap-3 mb-3">
          <span className="eyebrow !text-[color:var(--ink-primary)]">{categoryLabel(entry.category)}</span>
          <span className="text-[color:var(--rule-strong)]" aria-hidden="true">·</span>
          <span className="eyebrow">{dateLabel(entry)}</span>
        </div>
        <h3 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight leading-snug group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
          {entry.title}
        </h3>
        <p className="mt-3 text-body-sm text-[color:var(--ink-secondary)]">
          {entry.excerpt}
        </p>
        {!entry.link && (
          <p className="mt-4 text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
            Archive note · no destination attached
          </p>
        )}
      </div>
    </>
  );

  if (!entry.link) return <article className="block">{content}</article>;

  if (/^https?:\/\//i.test(entry.link)) {
    return (
      <a href={entry.link} target="_blank" rel="noopener noreferrer" className="group block">
        {content}
      </a>
    );
  }

  return <Link to={entry.link} className="group block">{content}</Link>;
};

export default NewsCard;

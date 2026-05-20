import { Link } from "react-router-dom";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import { whatsNew, type WhatsNewEntry } from "@/data/whats-new";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
};

const categoryLabel = (c: WhatsNewEntry["category"]) => {
  switch (c) {
    case "project": return "Project";
    case "product": return "Product";
    case "event":   return "Event";
    case "press":   return "Press";
  }
};

const WhatsNew = () => (
  <div>
    <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
      <EyebrowHeading eyebrow="What's New" level={2}>
        From the workshop.
      </EyebrowHeading>
      <FeatureLink to="/whats-new">All updates</FeatureLink>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
      {whatsNew.map((entry) => (
        <li key={entry.id}>
          <Link to={entry.link || "#"} className="group block">
            <div className="relative aspect-[5/4] overflow-hidden bg-neutral-100">
              <img
                src={entry.image}
                alt={entry.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="eyebrow text-[color:var(--accent)]">{categoryLabel(entry.category)}</span>
                <span className="text-[color:var(--rule-strong)]">·</span>
                <span className="eyebrow text-[color:var(--ink-muted)]">{formatDate(entry.date)}</span>
              </div>
              <h3 className="font-serif text-h5 lg:text-h4 text-[color:var(--ink-primary)] tracking-tight leading-snug group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                {entry.title}
              </h3>
              <p className="mt-3 text-body-sm text-[color:var(--ink-secondary)]">
                {entry.excerpt}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default WhatsNew;

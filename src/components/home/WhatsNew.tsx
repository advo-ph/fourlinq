import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import FeatureLink from "@/components/primitives/FeatureLink";
import NewsCard from "@/components/shared/NewsCard";
import { whatsNew as allEntries } from "@/data/whats-new";

/**
 * Homepage WhatsNew shows only event + press categories — projects already
 * have their own InspirationStrip section directly above this one, and the
 * "product" entries (e.g. "Twelve finish options across every system") were
 * reading as misplaced when stacked next to project cards. Full feed lives
 * on the /whats-new page where the visitor expects to see everything mixed.
 */
const whatsNew = allEntries
  .filter((e) => e.category === "event" || e.category === "press")
  .slice(0, 3);

const WhatsNew = () => (
  <div>
    <div className="grid lg:grid-cols-[1fr,auto] items-end gap-8 mb-12 lg:mb-16">
      <EyebrowHeading eyebrow="Updates" level={2}>
        What's new?
      </EyebrowHeading>
      <FeatureLink to="/whats-new">All updates</FeatureLink>
    </div>

    <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
      {whatsNew.map((entry) => (
        <li key={entry.id}>
          <NewsCard entry={entry} reveal />
        </li>
      ))}
    </ul>
  </div>
);

export default WhatsNew;

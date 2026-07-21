import { Link } from "react-router-dom";
import FeatureLink from "@/components/primitives/FeatureLink";
import ScrollReveal from "@/components/primitives/ScrollReveal";
import { whatsNew as allEntries } from "@/data/whats-new";

/**
 * Homepage feature block. Per Prince (2026-07-22) this section no longer
 * shows the multi-card What's New feed — it spotlights a single post, the
 * showroom invite, in a Marvin-style split: wide image left, editorial
 * column right (top hairline, overline, serif headline, lede, arrow link).
 * The full feed still lives on the /whats-new page.
 */
const featured =
  allEntries.find((e) => e.id === "showroom-invite") ?? allEntries[0];

const WhatsNew = () => (
  <div className="grid items-start gap-y-10 lg:grid-cols-[1.4fr,1fr] lg:gap-x-16">
    {/* Left — the image, the hero of the block */}
    <ScrollReveal>
      <Link
        to={featured.link || "/whats-new"}
        className="group block relative aspect-[4/3] overflow-hidden bg-neutral-100"
      >
        <img
          src={featured.image}
          alt={featured.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-marvin group-hover:scale-[1.03]"
        />
      </Link>
    </ScrollReveal>

    {/* Right — editorial column, led by a top hairline rule */}
    <div className="border-t border-[color:var(--rule-strong)] pt-6 lg:pt-8 lg:pr-8">
      <p className="eyebrow mb-4 text-[color:var(--ink-muted)]">
        FourlinQ Showrooms
      </p>
      <h2 className="font-serif font-normal tracking-tight leading-[1.1] text-[2rem] lg:text-h3 text-[color:var(--ink-primary)]">
        {featured.title}
      </h2>
      <p className="mt-5 max-w-[34rem] text-body text-[color:var(--ink-secondary)]">
        {featured.excerpt}
      </p>
      <div className="mt-7">
        <FeatureLink to={featured.link || "/whats-new"}>Learn more</FeatureLink>
      </div>
    </div>
  </div>
);

export default WhatsNew;

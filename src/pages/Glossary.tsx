import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/shared/PageHeader";
import Section from "@/components/primitives/Section";
import EyebrowHeading from "@/components/primitives/EyebrowHeading";
import { GLOSSARY_GROUP, termByCategory } from "@/data/glossary";

/**
 * /glossary — the plain-English terminology reference.
 *
 * Answers Imie's most-repeated note ("terminology must be correct", meeting
 * 00:04:40; "check internet for the meaning of each design", 2026-05-28) and
 * is the public half of RM1. Content is confined to verifiable, general terms
 * and FourlinQ's already-published operations, materials, and glass — see
 * src/data/glossary.ts for the editorial boundary.
 */
const Glossary = () => (
  <Layout>
    <PageHeader
      eyebrow="Reference"
      title="The language of windows and doors."
      breadcrumbLabel="Glossary"
      subtitle="Windows and doors carry their own vocabulary — operation, sightline, glazing, mullion. Here is what the terms mean, in plain language, so you can read a quote and specify a project with confidence."
    />

    {GLOSSARY_GROUP.map((group, gi) => (
      <Section key={group.category} tone={gi % 2 === 0 ? "canvas" : "soft"} size="lg" className={gi === 0 ? "!pt-0" : undefined}>
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10">
          <div className="lg:col-span-4">
            <EyebrowHeading eyebrow={`0${gi + 1}`} level={2}>
              {group.label}.
            </EyebrowHeading>
            <p className="mt-6 text-body text-[color:var(--ink-secondary)] leading-[1.6] max-w-[32rem]">
              {group.blurb}
            </p>
          </div>

          <dl className="lg:col-span-8 flex flex-col divide-y divide-[color:var(--rule-soft)] border-y border-[color:var(--rule-soft)]">
            {termByCategory(group.category).map((t) => (
              <div key={t.term} className="grid sm:grid-cols-[12rem,1fr] gap-x-8 gap-y-2 py-6 lg:py-7">
                <dt>
                  <span className="font-serif text-h5 text-[color:var(--ink-primary)] tracking-tight">
                    {t.term}
                  </span>
                  {t.also_called ? (
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-muted)]">
                      also: {t.also_called}
                    </span>
                  ) : null}
                </dt>
                <dd className="text-body text-[color:var(--ink-secondary)] leading-[1.6] max-w-[40rem]">
                  {t.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    ))}

    <Section tone="dark" size="md" noAnimation>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">
        <h2 className="font-serif font-normal tracking-tight text-h3 text-white leading-[1.15]">
          Still deciding what you need? Talk it through with us.
        </h2>
        <p className="text-body-lg text-white/70 leading-[1.6]">
          Bring the words you know and the ones you don't. A FourlinQ engineer will
          translate your project into the right systems, materials, and glass.
        </p>
      </div>
    </Section>
  </Layout>
);

export default Glossary;

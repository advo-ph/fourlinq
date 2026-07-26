import AccentStripe from "@/components/primitives/AccentStripe";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

const PageHeader = ({ title, subtitle, eyebrow }: PageHeaderProps) => (
  <header className="pt-section-mobile md:pt-section-tablet lg:pt-section-desktop pb-12 lg:pb-16">
    <div className="container-editorial">
      {eyebrow && (
        <>
          {/* Marvin-signature 5px red accent stripe above the collection label. */}
          <AccentStripe width="sm" color="accent" className="mb-4" />
          <p className="eyebrow mb-5">
            {eyebrow}
          </p>
        </>
      )}
      <h1 className="font-serif font-normal tracking-tight text-[color:var(--ink-primary)] text-[3rem] sm:text-[3.5rem] lg:text-h1 xl:text-display leading-[1.04] max-w-[20ch]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-7 lg:mt-9 text-body-lg lg:text-lead text-[color:var(--ink-secondary)] max-w-[42rem] leading-[1.55]">
          {subtitle}
        </p>
      )}
    </div>
  </header>
);

export default PageHeader;

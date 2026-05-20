import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbLabel: string;
  eyebrow?: string;
}

const PageHeader = ({ title, subtitle, breadcrumbLabel, eyebrow }: PageHeaderProps) => (
  <header className="pt-section-mobile md:pt-section-tablet lg:pt-section-desktop pb-12 lg:pb-16">
    <div className="container-editorial">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-10 lg:mb-14">
        <ol className="flex items-center gap-2 text-[12px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)]">
          <li>
            <Link to="/" className="hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin">
              FourlinQ
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight size={12} strokeWidth={1.5} /></li>
          <li className="text-[color:var(--ink-primary)] font-medium">{breadcrumbLabel}</li>
        </ol>
      </nav>

      {eyebrow && (
        <p className="eyebrow mb-5 inline-flex items-center gap-3 before:content-[''] before:w-12 before:h-px before:bg-[color:var(--rule-strong)]">
          {eyebrow}
        </p>
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

import { Link } from "react-router-dom";
import { CONTACT } from "@/data/fourlinq-data";
import Logo from "@/components/shared/Logo";
import { ArrowUpRight } from "lucide-react";

interface FooterLink {
  label: string;
  to: string;
  external?: boolean;
}

const columns: Record<string, FooterLink[]> = {
  Systems: [
    { label: "All Systems", to: "/products" },
    { label: "Windows", to: "/products/windows" },
    { label: "Doors", to: "/products/doors" },
    { label: "Specialist", to: "/products/specialist" },
    { label: "Finishes", to: "/finishes" },
    { label: "Design Tool", to: "/design-tool" },
    { label: "Help me choose", to: "/help-me-choose" },
  ],
  Resources: [
    { label: "Why uPVC", to: "/why-upvc" },
    { label: "Warranty", to: "/warranty" },
    { label: "FAQ", to: "/faq" },
    { label: "Care guide", to: "/care" },
    { label: "Certifications", to: "/brand#certifications" },
  ],
  Visit: [
    { label: "Visit a Showroom", to: "/brand#showrooms" },
    { label: "Request a Quote", to: "/brand#contact" },
    { label: "Our Story", to: "/brand" },
  ],
  Legal: [
    { label: "Privacy", to: "/legal?page=privacy" },
    { label: "Terms", to: "/legal?page=terms" },
    { label: "Cookies", to: "/legal?page=cookies" },
  ],
};

const socials: FooterLink[] = [
  { label: "Instagram", to: "https://www.instagram.com/fourlinq/", external: true },
  { label: "Facebook", to: "https://www.facebook.com/FourlinQofficial/", external: true },
];

const EditorialFooter = () => {
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT.email}`;
  const tel = `tel:${CONTACT.mobileSales.replace(/-/g, "")}`;

  return (
    <footer className="bg-[color:var(--canvas-dark)] text-white">
      <div className="container-editorial py-16 md:py-20 lg:py-section-tablet">
        {/* Top — wordmark + standout contact line */}
        <div className="grid lg:grid-cols-[1fr,2fr] gap-12 lg:gap-20 pb-12 lg:pb-16 border-b border-white/10">
          <div>
            <Link to="/" className="inline-block">
              <Logo variant="light" className="h-12" />
            </Link>
            <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-white/50 font-medium">
              Custom-made in the Philippines
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <p className="font-serif text-h3 lg:text-h2 leading-[1.15] tracking-tight max-w-[28rem] lg:text-right">
              Custom-made for the Philippine climate.
            </p>
            <a
              href={gmail}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 mt-4 lg:mt-2 text-body-lg font-sans border-b border-white/40 pb-1 hover:border-white transition-colors duration-300 ease-marvin"
            >
              {CONTACT.email}
              <ArrowUpRight size={16} className="transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href={tel} className="text-body text-white/70 hover:text-white transition-colors duration-300 ease-marvin">
              {CONTACT.mobileSales}
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 py-12 lg:py-16">
          {Object.entries(columns).map(([category, links]) => (
            <nav key={category} aria-label={category}>
              <h4 className="eyebrow text-white/50 mb-6">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-body-sm text-white/85 hover:text-white transition-colors duration-300 ease-marvin"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-body-sm text-white/50">
            © {new Date().getFullYear()} FourlinQ Windows &amp; Doors. All rights reserved.
          </p>
          <div className="flex gap-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-white/60 hover:text-white transition-colors duration-300 ease-marvin"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EditorialFooter;

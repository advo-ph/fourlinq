import { Link } from "react-router-dom";
import { CONTACT, phoneHref } from "@/data/fourlinq-data";
import { SYSTEM_TYPE, PROFILE_MATERIAL } from "@/data/taxonomy";
import Logo from "@/components/shared/Logo";
import { ArrowUpRight } from "lucide-react";

interface FooterLink {
  label: string;
  to: string;
  external?: boolean;
}

// Systems column is generated from the shared taxonomy — both axes, same labels
// as the nav and /products. It previously listed only the three types, under
// different labels ("Windows" vs "Window Systems"), and omitted material
// entirely, which is one of the four surfaces that had drifted apart.
const columns: Record<string, FooterLink[]> = {
  Systems: [
    ...SYSTEM_TYPE.map((t) => ({ label: t.label, to: t.to })),
    ...PROFILE_MATERIAL.map((m) => ({ label: m.label, to: m.to })),
    { label: "Finishes", to: "/finishes" },
  ],
  Resources: [
    { label: "Why uPVC", to: "/why-upvc" },
    { label: "Warranty", to: "/warranty" },
    { label: "For Architects", to: "/for-architects" },
    { label: "Glossary", to: "/glossary" },
    { label: "FAQ", to: "/faq" },
    { label: "Care guide", to: "/care" },
  ],
  Visit: [
    { label: "Visit a Showroom", to: "/brand#showrooms" },
    { label: "Book a Consultation", to: "/brand#contact" },
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
  const tel = phoneHref(CONTACT.mobileSales);

  return (
    <footer className="bg-[color:var(--canvas-dark)] text-white">
      <div className="container-editorial py-10 md:py-14 lg:py-section-tablet">
        {/* Top — wordmark + standout contact line */}
        <div className="border-b border-white/10 pb-8 lg:pb-12">
          <div className="grid grid-cols-[minmax(7.75rem,auto),minmax(0,1fr)] items-stretch justify-between gap-x-5 gap-y-6 sm:gap-x-8 md:grid-cols-[auto,minmax(18rem,auto)] md:gap-x-14">
            <div className="flex min-h-[6.25rem] max-w-[10.5rem] flex-col justify-between md:min-h-[7rem] md:max-w-[24rem]">
              <Link to="/" className="inline-block">
                <Logo variant="light" className="h-11 sm:h-12 md:h-16" />
              </Link>
              <p className="font-sans text-body-sm font-medium uppercase leading-snug tracking-[0.12em] text-white/60 md:tracking-[0.16em]">
                Custom-made in the Philippines
              </p>
            </div>
            <div className="flex min-h-[6.25rem] min-w-0 flex-col justify-between justify-self-end text-right md:min-h-[7rem]">
              <div className="space-y-3">
                <p className="eyebrow text-white/35">Contact</p>
                <a
                  href={gmail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex max-w-full items-center justify-end gap-2 break-all border-b border-white/35 pb-1 font-sans text-[14px] font-medium text-white transition-colors duration-300 ease-marvin hover:border-white sm:text-body-sm"
                >
                  {CONTACT.email}
                  <ArrowUpRight size={14} className="shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
              <a href={tel} className="block text-body-sm text-white/60 hover:text-white transition-colors duration-300 ease-marvin">
                {CONTACT.mobileSales}
              </a>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 py-8 md:grid-cols-4 lg:gap-12 lg:py-12">
          {Object.entries(columns).map(([category, links]) => (
            <nav key={category} aria-label={category}>
              <h4 className="eyebrow mb-4 text-white/40">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-body-sm font-medium text-white/78 hover:text-white transition-colors duration-300 ease-marvin"
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
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
          <p className="text-[12px] text-white/45">
            © {new Date().getFullYear()} FourlinQ Windows &amp; Doors. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium text-white/55 hover:text-white transition-colors duration-300 ease-marvin"
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

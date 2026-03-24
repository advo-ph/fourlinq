import { Link } from "react-router-dom";
import { CONTACT } from "@/data/fourlinq-data";
import Logo from "@/components/shared/Logo";

const footerLinks = {
  Brand: [
    { label: "Our Story", to: "/brand" },
    { label: "Certifications", to: "/brand#certifications" },
    { label: "Visit a Showroom", to: "/brand#contact" },
  ],
  Products: [
    { label: "All Systems", to: "/products" },
    { label: "Windows", to: "/products?filter=windows" },
    { label: "Doors", to: "/products?filter=doors" },
  ],
  Support: [
    { label: "Design Tool", to: "/design-tool" },
    { label: "Why uPVC", to: "/why-upvc" },
    { label: "Book Consultation", to: "/brand#contact" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/legal?page=privacy" },
    { label: "Terms of Service", to: "/legal?page=terms" },
    { label: "Cookie Policy", to: "/legal?page=cookies" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-[#0d0d0d] text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <Logo variant="light" className="h-10" />
            </Link>
            <p className="text-xs text-white/40 leading-relaxed">
              {CONTACT.email}<br />
              {CONTACT.mobileSales}
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} FourlinQ Windows & Doors. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[
              { label: "Instagram", href: "https://instagram.com/fourlinq" },
              { label: "Facebook", href: "https://facebook.com/fourlinq" },
              { label: "LinkedIn", href: "https://linkedin.com/company/fourlinq" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

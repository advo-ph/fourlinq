import { Link } from "react-router-dom";

const footerLinks = {
  Brand: [
    { label: "Our Story", to: "/brand" },
    { label: "Certifications", to: "/brand#certifications" },
    { label: "Showroom", to: "/brand#contact" },
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
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-semibold tracking-tight text-primary-foreground">
                FOURLIN<span className="text-accent">Q</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">
                Windows & Doors
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              German-engineered uPVC systems for the Philippine climate.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/40 mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
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
          <p className="text-xs text-primary-foreground/40">
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
                className="text-xs text-primary-foreground/40 hover:text-primary-foreground transition-colors"
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

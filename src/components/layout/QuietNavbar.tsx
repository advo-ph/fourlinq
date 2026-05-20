import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/shared/Logo";
import EditorialButton from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  to: string;
}

const navLinks: NavLink[] = [
  { label: "Systems", to: "/products" },
  { label: "Inspiration", to: "/inspiration" },
  { label: "Why uPVC", to: "/why-upvc" },
  { label: "Design Tool", to: "/design-tool" },
  { label: "Brand", to: "/brand" },
];

const QuietNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 inset-x-0 z-50 bg-white",
          "h-16 lg:h-[72px]",
          "border-b border-[color:var(--rule-soft)]"
        )}
      >
        <div className="container-editorial h-full">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="shrink-0 flex items-center" aria-label="FourlinQ home">
              <Logo variant="dark" className="h-11 lg:h-12" />
            </Link>

            {/* Desktop nav — mixed-case, plain text, no all-caps */}
            <ul className="hidden lg:flex items-center gap-8 xl:gap-10">
              {navLinks.map((link) => {
                const active = location.pathname === link.to ||
                               (link.to !== "/" && location.pathname.startsWith(link.to));
                return (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={cn(
                        "whitespace-nowrap text-body-sm font-medium transition-colors duration-250 ease-out",
                        "border-b-[1.5px] pb-1",
                        active
                          ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                          : "text-[color:var(--ink-primary)] border-transparent hover:text-[color:var(--accent)]"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right side: single primary CTA */}
            <div className="hidden lg:block shrink-0">
              <EditorialButton to="/brand#contact" size="sm" variant="primary">
                Request a Quote
              </EditorialButton>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -mr-2 text-[color:var(--ink-primary)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-white pt-16 animate-fade-in">
          <div className="container-editorial py-v600">
            <ul className="flex flex-col">
              {navLinks.map((link) => {
                const active = location.pathname.startsWith(link.to);
                return (
                  <li key={link.label} className="border-b border-[color:var(--rule-soft)]">
                    <Link
                      to={link.to}
                      className={cn(
                        "block py-5 text-h4 font-serif",
                        active ? "text-[color:var(--accent)]" : "text-[color:var(--ink-primary)]"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-v700">
              <EditorialButton to="/brand#contact" size="lg" variant="primary" fullWidth>
                Request a Quote
              </EditorialButton>
            </div>
          </div>
        </div>
      )}

      {/* Page spacer to push content below fixed nav */}
      <div aria-hidden="true" className="h-16 lg:h-[72px]" />
    </>
  );
};

export default QuietNavbar;

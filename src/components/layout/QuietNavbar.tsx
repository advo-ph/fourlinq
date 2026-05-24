import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/shared/Logo";
import EditorialButton from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  to: string;
  /** Optional dropdown of sub-buckets, surfaced on hover (desktop) and as a nested list (mobile). */
  children?: { label: string; to: string; description?: string }[];
}

const navLinks: NavLink[] = [
  {
    label: "Systems",
    to: "/products",
    children: [
      { label: "Window Systems", to: "/products/windows", description: "Casement, Sliding, Awning, Special Shapes" },
      { label: "Door Systems", to: "/products/doors", description: "Slide & Fold, Large Panel, Lift & Slide, 90 Series" },
      { label: "Specialist Systems", to: "/products/specialist", description: "Arch, Curtain Wall, Custom Shapes" },
    ],
  },
  { label: "Our Projects", to: "/inspiration" },
  { label: "What's New", to: "/whats-new" },
  { label: "Why uPVC", to: "/why-upvc" },
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
          "h-[72px]",
          "border-b border-[color:var(--rule-soft)]"
        )}
      >
        <div className="container-editorial h-full">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="shrink-0 flex items-center" aria-label="FourlinQ home">
              <Logo variant="dark" className="h-11" />
            </Link>

            {/* Desktop nav — mixed-case, plain text, no all-caps. Items with children get an on-hover mega-panel. */}
            <ul className="hidden lg:flex items-center gap-8 xl:gap-10">
              {navLinks.map((link) => {
                const active = location.pathname === link.to ||
                               (link.to !== "/" && location.pathname.startsWith(link.to));
                return (
                  <li key={link.label} className="group/nav relative">
                    <Link
                      to={link.to}
                      className={cn(
                        "whitespace-nowrap text-body-sm font-medium transition-colors duration-300 ease-marvin",
                        "border-b-[1.5px] pb-1 inline-flex items-center gap-1",
                        active
                          ? "text-[color:var(--ink-primary)] border-[color:var(--accent)]"
                          : "text-[color:var(--ink-primary)] border-transparent hover:text-[color:var(--accent)]"
                      )}
                    >
                      {link.label}
                    </Link>

                    {link.children && (
                      <div
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 top-full w-[420px]",
                          "pt-3",
                          "opacity-0 invisible translate-y-1 pointer-events-none",
                          "group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto",
                          "transition-all duration-300 ease-marvin"
                        )}
                      >
                        <div className="bg-white border border-[color:var(--rule-soft)] shadow-depth-4 p-6">
                          <ul className="flex flex-col">
                            {link.children.map((c) => (
                              <li key={c.to}>
                                <Link
                                  to={c.to}
                                  className="block py-3 -mx-3 px-3 hover:bg-[color:var(--canvas-soft)] transition-colors duration-300 ease-marvin"
                                >
                                  <p className="text-body-sm font-medium text-[color:var(--ink-primary)]">
                                    {c.label}
                                  </p>
                                  {c.description && (
                                    <p className="text-[12px] mt-0.5 text-[color:var(--ink-muted)] leading-snug">
                                      {c.description}
                                    </p>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Right side: tertiary text link to showroom — Marvin pattern.
                Tita's brief §3 called out the red square CTA as too aggressive.
                Showroom-visit-as-funnel is shipped across product pages now. */}
            <div className="hidden lg:flex items-center shrink-0">
              <Link
                to="/brand#showrooms"
                className={cn(
                  "whitespace-nowrap text-body-sm font-medium text-[color:var(--ink-primary)]",
                  "transition-colors duration-300 ease-marvin hover:text-[color:var(--accent)]",
                  "inline-flex items-center gap-1.5 group/cta"
                )}
              >
                Visit a Showroom
                <span className="inline-block transition-transform duration-300 ease-marvin group-hover/cta:translate-x-0.5">
                  →
                </span>
              </Link>
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
        <div className="fixed inset-0 z-40 lg:hidden bg-white pt-[72px] animate-fade-in">
          <div className="container-editorial py-v600">
            <ul className="flex flex-col">
              {navLinks.map((link) => {
                const active = location.pathname === link.to ||
                               (link.to !== "/" && location.pathname.startsWith(link.to));
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
                    {link.children && (
                      <ul className="pb-4 pl-3 -mt-2">
                        {link.children.map((c) => (
                          <li key={c.to}>
                            <Link
                              to={c.to}
                              className="block py-2 text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-v700">
              <EditorialButton to="/brand#showrooms" size="lg" variant="primary" fullWidth>
                Visit a Showroom
              </EditorialButton>
            </div>
          </div>
        </div>
      )}

      {/* Page spacer to push content below fixed nav */}
      <div aria-hidden="true" className="h-[72px]" />
    </>
  );
};

export default QuietNavbar;

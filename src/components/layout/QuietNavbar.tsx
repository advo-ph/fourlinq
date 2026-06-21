import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/shared/Logo";
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
      { label: "Window Systems", to: "/products?filter=windows", description: "Casement, Sliding, Awning, Special Shapes" },
      { label: "Door Systems", to: "/products?filter=doors", description: "Slide & Fold, Large Panel, Lift & Slide, 90 Series" },
      { label: "Specialist Systems", to: "/products?filter=specialist", description: "Arch, Curtain Wall, Custom Shapes" },
      { label: "Aluminium Line", to: "/aluminium", description: "Thermal Break, Non-Thermal Break, Alu Slim" },
    ],
  },
  { label: "Our Projects", to: "/inspiration" },
  { label: "What's New", to: "/whats-new" },
  { label: "Why uPVC", to: "/why-upvc" },
  { label: "Brand", to: "/brand" },
];

const QuietNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        data-main-nav
        className={cn(
          "fixed top-0 inset-x-0 z-50",
          "h-[72px]",
          "transition-[background-color,backdrop-filter,color] duration-300 ease-marvin",
          transparent
            ? "bg-transparent text-white"
            : "bg-white/80 text-[color:var(--ink-primary)] backdrop-blur-md"
        )}
      >
        <div className="container-editorial h-full">
          <div className="flex items-center justify-between h-full">
            <Link to="/" className="shrink-0 flex items-center" aria-label="FourlinQ home">
              <Logo variant={transparent ? "light" : "dark"} className="h-11" />
            </Link>

            {/* Desktop nav — tiny rounded nav buttons with a seamless mega-panel. */}
            <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = location.pathname === link.to ||
                               (link.to !== "/" && location.pathname.startsWith(link.to));
                return (
                  <li key={link.label} className="group/nav relative">
                    <Link
                      to={link.to}
                      className={cn(
                        "whitespace-nowrap text-body-sm font-medium transition-[background-color,color] duration-300 ease-marvin",
                        "inline-flex min-h-8 items-center rounded-sm px-4",
                        active
                          ? transparent
                            ? "bg-white/15 text-white"
                            : "bg-[color:var(--canvas-soft)] text-[color:var(--ink-primary)]"
                          : transparent
                            ? "text-white hover:bg-white/15"
                            : "text-[color:var(--ink-primary)] hover:bg-[color:var(--canvas-soft)]"
                      )}
                    >
                      {link.label}
                    </Link>

                    {link.children && (
                      <div
                        className={cn(
                          "fixed left-0 right-0 top-[72px]",
                          "pt-3",
                          "opacity-0 invisible pointer-events-none",
                          "group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:pointer-events-auto",
                          "transition-[opacity,visibility] duration-300 ease-marvin"
                        )}
                      >
                        <div className="bg-white text-[color:var(--ink-primary)]">
                          <div className="container-editorial py-9">
                            <ul className="grid grid-cols-4 gap-4">
                              {link.children.map((c) => (
                                <li key={c.to}>
                                  <Link
                                    to={c.to}
                                    className="block rounded-sm px-4 py-5 text-center transition-colors duration-300 ease-marvin hover:bg-[color:var(--canvas-soft)]"
                                  >
                                    <p className="text-[17px] font-medium text-[color:var(--ink-primary)]">
                                      {c.label}
                                    </p>
                                    {c.description && (
                                      <p className="mx-auto mt-3 max-w-[14rem] text-body-sm text-[color:var(--ink-muted)] leading-snug">
                                        {c.description}
                                      </p>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Right side: primary conversion CTA — lead capture, not a drive-to-showroom ask.
                Showroom link stays in footer as secondary. */}
            <div className="hidden lg:flex items-center shrink-0">
              <Link
                to="/brand#contact"
                className={cn(
                  "whitespace-nowrap text-body-sm font-medium",
                  "transition-[background-color,color] duration-300 ease-marvin",
                  "inline-flex min-h-8 items-center rounded-sm px-4",
                  transparent
                    ? "text-white hover:bg-white/15"
                    : "text-[color:var(--ink-primary)] hover:bg-[color:var(--canvas-soft)]"
                )}
              >
                Book a Consultation
                <span className="inline-block pl-1">
                  →
                </span>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn("lg:hidden p-2 -mr-2", transparent ? "text-white" : "text-[color:var(--ink-primary)]")}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-white pt-[72px] animate-fade-in flex flex-col">
          {/* Top: primary CTA — red box, prominent, at top so it's the first thing
              the visitor sees when they open the menu. */}
          <div className="container-editorial pt-6 pb-2">
            <Link
              to="/brand#contact"
              className="block w-full rounded-sm text-center bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-white text-body font-medium tracking-normal py-3 transition-colors duration-300 ease-marvin"
            >
              Book a Consultation
            </Link>
          </div>

          {/* Nav list */}
          <nav className="container-editorial flex-1 pt-4">
            <ul className="flex flex-col">
              {navLinks.map((link) => {
                const active = location.pathname === link.to ||
                               (link.to !== "/" && location.pathname.startsWith(link.to));
                return (
                  <li key={link.label} className="border-b border-[color:var(--rule-soft)]">
                    <Link
                      to={link.to}
                      className={cn(
                        "block py-4 text-[1.5rem] font-sans tracking-normal font-medium",
                        active ? "text-[color:var(--accent)]" : "text-[color:var(--ink-primary)]"
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <ul className="pb-4 -mt-2 space-y-1">
                        {link.children.map((c) => (
                          <li key={c.to}>
                            <Link
                              to={c.to}
                              className="block py-1.5 text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
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
          </nav>

          {/* Footer detail — secondary showroom link + contact */}
          <div className="container-editorial pb-8 pt-6 border-t border-[color:var(--rule-soft)] mt-6">
            <Link
              to="/brand#showrooms"
              className="block text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin py-2"
            >
              Visit a Showroom →
            </Link>
            <p className="mt-3 text-[12px] tracking-normal text-[color:var(--ink-muted)]">
              Manila · Cebu
            </p>
          </div>
        </div>
      )}

      {/* Page spacer to push content below fixed nav */}
      <div aria-hidden="true" className="h-[72px]" />
    </>
  );
};

export default QuietNavbar;

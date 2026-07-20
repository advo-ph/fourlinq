import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { SYSTEM_TYPE, PROFILE_MATERIAL } from "@/data/taxonomy";
import { useDialogFocus } from "@/hooks/useDialogFocus";

interface NavChild {
  label: string;
  to: string;
  description?: string;
  image?: string;
}

interface NavGroup {
  title: string;
  child: NavChild[];
}

interface NavLink {
  label: string;
  to: string;
  /** Optional dropdown, surfaced on hover (desktop) and as a nested list (mobile). */
  group?: NavGroup[];
}

// The Systems menu is the site's real product navigator, so it carries both
// axes as SEPARATE GROUPS — not one flat row of four. It used to list
// "Aluminium Line" as a fourth peer beside the three types, which reads as a
// fourth type; aluminium is a material (Imie, 2026-07-02). Labels, images, and
// destinations come from src/data/taxonomy.ts — the same source /products uses,
// so the menu can't drift from the catalog.
const SYSTEM_GROUP: NavGroup[] = [
  {
    title: "By type",
    child: SYSTEM_TYPE.map((t) => ({
      label: t.label,
      to: t.to,
      description: t.item.join(", "),
      image: t.image,
    })),
  },
  {
    title: "By material",
    child: PROFILE_MATERIAL.map((m) => ({
      label: m.label,
      to: m.to,
      description: m.item.join(", "),
      image: m.image,
    })),
  },
];

const navLinks: NavLink[] = [
  { label: "Systems", to: "/products", group: SYSTEM_GROUP },
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
  const mobileDialogRef = useDialogFocus<HTMLDivElement>({
    isOpen: mobileOpen,
    onClose: () => setMobileOpen(false),
  });

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
                      aria-haspopup={link.group ? "menu" : undefined}
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

                    {link.group && (
                      // Full-width mega-panel. Opens on hover AND on keyboard
                      // focus-within, so it is reachable by Tab, not mouse-only
                      // (the old version was a hover trap for keyboard users).
                      // Hidden panels are visibility:hidden, so their links stay
                      // out of the tab order until the trigger opens the panel.
                      <div
                        className={cn(
                          "fixed left-0 right-0 top-[72px] pt-3",
                          "opacity-0 invisible pointer-events-none",
                          "group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:pointer-events-auto",
                          "group-focus-within/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:pointer-events-auto",
                          "transition-[opacity,visibility] duration-300 ease-marvin"
                        )}
                      >
                        <div className="bg-white text-[color:var(--ink-primary)] border-t border-[color:var(--rule-soft)] shadow-depth-6">
                          <div className="container-editorial py-10">
                            <div className="grid grid-cols-[1fr_340px] gap-x-14">
                              {/* The two browse axes, as image cards */}
                              <div className="flex flex-col gap-8">
                                {link.group.map((g) => (
                                  <div key={g.title}>
                                    <p className="eyebrow mb-5 pb-3 border-b border-[color:var(--rule-soft)]">
                                      {g.title}
                                    </p>
                                    <ul className={cn("grid gap-x-6 gap-y-2", g.child.length > 2 ? "grid-cols-3" : "grid-cols-2 max-w-[28rem]")}>
                                      {g.child.map((c) => (
                                        <li key={c.to}>
                                          <Link to={c.to} className="group/card block rounded-sm">
                                            <div className="aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)] rounded-sm">
                                              {c.image && (
                                                <img
                                                  src={c.image}
                                                  alt=""
                                                  loading="lazy"
                                                  decoding="async"
                                                  className="h-full w-full object-cover transition-transform duration-700 ease-marvin group-hover/card:scale-[1.04]"
                                                />
                                              )}
                                            </div>
                                            <p className="mt-3 text-body font-medium text-[color:var(--ink-primary)] group-hover/card:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
                                              {c.label}
                                            </p>
                                            {c.description && (
                                              <p className="mt-1 text-body-sm text-[color:var(--ink-muted)] leading-snug">
                                                {c.description}
                                              </p>
                                            )}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>

                              {/* Featured editorial card — Marvin's mega-menu has one
                                  on the right. Points at guided browse, which is the
                                  "help me get organized" path Imie asked for. */}
                              <Link to="/help-me-choose" className="group/feat relative flex flex-col justify-end overflow-hidden rounded-sm bg-[color:var(--canvas-dark)] text-white min-h-[15rem]">
                                <img
                                  src="/images/products/real/sliding-door.webp"
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 ease-marvin group-hover/feat:scale-[1.04]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                                <div className="relative p-7">
                                  <p className="eyebrow text-white/70 mb-3">Not sure where to start?</p>
                                  <p className="font-serif text-h5 leading-tight tracking-tight">Answer three questions.</p>
                                  <span className="mt-4 inline-flex items-center gap-1 text-body-sm font-medium">
                                    Help me choose
                                    <span className="transition-transform duration-300 ease-marvin group-hover/feat:translate-x-1">→</span>
                                  </span>
                                </div>
                              </Link>
                            </div>
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
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-dialog"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-navigation-dialog"
          ref={mobileDialogRef}
          className="fixed inset-0 z-40 lg:hidden bg-white pt-[72px] animate-fade-in flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          tabIndex={-1}
        >
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
                    {link.group && (
                      <div className="pb-4 -mt-2 space-y-4">
                        {link.group.map((g) => (
                          <div key={g.title}>
                            <p className="eyebrow mb-1.5">{g.title}</p>
                            <ul className="space-y-1">
                              {g.child.map((c) => (
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
                          </div>
                        ))}
                      </div>
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

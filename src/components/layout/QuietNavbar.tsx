import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, X, ArrowUpRight } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { SYSTEM_TYPE, PROFILE_MATERIAL } from "@/data/taxonomy";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import NavFrameTile from "@/components/layout/NavFrameTile";
import NavSearch from "@/components/layout/NavSearch";

/**
 * Header with Marvin-style mega-panels: every dropdown item carries imagery
 * (the Systems tiles replay the 53-frame opening animation on hover), panels
 * are state-driven with a close-grace timer so the pointer can travel from
 * the trigger into the panel without it vanishing, and a site search flyout
 * hangs off the magnifier at the right.
 */

interface NavCard {
  label: string;
  to: string;
  description?: string;
  /** Static preview image. */
  image?: string;
  /** Frame-sequence path — renders as a hover-animated NavFrameTile instead. */
  framePath?: string;
}

interface NavGroup {
  title?: string;
  card: NavCard[];
}

interface NavLink {
  label: string;
  to: string;
  group?: NavGroup[];
}

const FRAME_PATH: Record<string, string> = {
  window: "/images/systems/window/frame_{index}.jpg",
  door: "/images/systems/door/frame_{index}.jpg",
  specialist: "/images/systems/specialist/frame_{index}.jpg",
};

// Systems keeps both taxonomy axes: the three types as animated tiles, the
// two profile systems as a labelled side column (aluminium is a material,
// not a fourth type — Imie, 2026-07-02).
const SYSTEM_GROUP: NavGroup[] = [
  {
    card: SYSTEM_TYPE.map((t) => ({
      label: t.label,
      to: t.to,
      description: t.item.join(", "),
      framePath: FRAME_PATH[t.type_code],
    })),
  },
  {
    title: "By material",
    card: PROFILE_MATERIAL.map((m) => ({
      label: m.label,
      to: m.to,
      description: m.item.join(", "),
      image: m.image,
    })),
  },
];

// Every image below is a photo whose content matches its label — no
// stock-mismatch: the doors card is the verified corner sliding-door install.
const PROJECT_GROUP: NavGroup[] = [
  {
    card: [
      { label: "Windows", to: "/inspiration?filter=windows", image: "/images/wp-export/FQC-Project-17.jpg" },
      { label: "Doors", to: "/inspiration?filter=doors", image: "/images/products/real/sliding-door.webp" },
      { label: "Interior", to: "/inspiration?filter=interior", image: "/images/projects/real/sliding-doors-interior.webp" },
      { label: "Exterior", to: "/inspiration?filter=exterior", image: "/images/projects/real/residence-wood-grain-corner.webp" },
    ],
  },
];

const WHATS_NEW_GROUP: NavGroup[] = [
  {
    card: [
      { label: "Products", to: "/whats-new?filter=product", image: "/images/wp-export/Great-Profile-Colors.jpg" },
      { label: "Projects", to: "/whats-new?filter=project", image: "/images/projects-fb/DOuJGHUl.jpg" },
      { label: "Events", to: "/whats-new?filter=event", image: "/images/projects-fb/6ezPWg1k.jpg" },
    ],
  },
];

const navLinks: NavLink[] = [
  { label: "Systems", to: "/products", group: SYSTEM_GROUP },
  { label: "Our Projects", to: "/inspiration", group: PROJECT_GROUP },
  { label: "What's New", to: "/whats-new", group: WHATS_NEW_GROUP },
  { label: "Why uPVC", to: "/why-upvc" },
  { label: "Brand", to: "/brand" },
];

/** Static image card used inside the mega-panels. */
const NavImageCard = ({ card, onNavigate }: { card: NavCard; onNavigate: () => void }) => (
  <Link to={card.to} onClick={onNavigate} className="group block">
    <div className="relative aspect-video overflow-hidden bg-[color:var(--canvas-soft)]">
      <img
        src={card.image}
        alt={card.label}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 ease-marvin [@media(hover:hover)]:group-hover:scale-[1.05]"
      />
    </div>
    <div className="mt-4 flex items-start justify-between gap-3">
      <p className="text-[17px] font-medium text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
        {card.label}
      </p>
      <ArrowUpRight
        size={16}
        strokeWidth={1.5}
        className="text-[color:var(--ink-muted)] mt-1 shrink-0 transition-transform duration-300 ease-marvin group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--accent)]"
      />
    </div>
    {card.description && (
      <p className="mt-1.5 text-body-sm text-[color:var(--ink-muted)] leading-snug">{card.description}</p>
    )}
  </Link>
);

const QuietNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen && !openPanel && !searchOpen;
  const mobileDialogRef = useDialogFocus<HTMLDivElement>({
    isOpen: mobileOpen,
    onClose: () => setMobileOpen(false),
  });

  // A short grace period keeps the panel open while the pointer travels from
  // the trigger into the panel (the bug was: any un-hover instantly hid it).
  const holdPanel = (label: string) => {
    clearTimeout(closeTimer.current);
    setOpenPanel(label);
  };
  const releasePanel = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenPanel(null), 160);
  };

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenPanel(null);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPanel(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

            {/* Desktop nav. Each li spans the full 72px bar so there is no
                dead hover zone between the trigger and its panel. */}
            <ul className="hidden lg:flex items-center gap-1 xl:gap-2 h-full">
              {navLinks.map((link) => {
                const active = location.pathname === link.to ||
                               (link.to !== "/" && location.pathname.startsWith(link.to));
                const panelOpen = openPanel === link.label;
                return (
                  <li
                    key={link.label}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => link.group && holdPanel(link.label)}
                    onMouseLeave={() => link.group && releasePanel()}
                  >
                    <Link
                      to={link.to}
                      onFocus={() => link.group && holdPanel(link.label)}
                      className={cn(
                        "whitespace-nowrap text-body-sm font-medium transition-[background-color,color] duration-300 ease-marvin",
                        "inline-flex min-h-8 items-center rounded-sm px-4",
                        active || panelOpen
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
                      <div
                        onMouseEnter={() => holdPanel(link.label)}
                        onMouseLeave={releasePanel}
                        className={cn(
                          "fixed left-0 right-0 top-[72px]",
                          panelOpen
                            ? "opacity-100 visible pointer-events-auto"
                            : "opacity-0 invisible pointer-events-none",
                          "transition-[opacity,visibility] duration-300 ease-marvin"
                        )}
                      >
                        <div className="bg-white text-[color:var(--ink-primary)] border-b border-[color:var(--rule-soft)]">
                          <div className="container-editorial py-9 max-h-[calc(100vh-72px)] overflow-y-auto">
                            <div
                              className={cn(
                                "grid gap-x-12 gap-y-8",
                                link.group.length > 1 ? "grid-cols-[7fr_3fr]" : "grid-cols-1",
                              )}
                            >
                              {link.group.map((g, gi) => (
                                <div key={g.title ?? gi}>
                                  {g.title && (
                                    <p className="eyebrow mb-5 pb-3 border-b border-[color:var(--rule-soft)]">
                                      {g.title}
                                    </p>
                                  )}
                                  <ul
                                    className={cn(
                                      "grid gap-x-6 gap-y-8",
                                      g.title
                                        ? "grid-cols-1"
                                        : g.card.length === 4
                                          ? "grid-cols-4"
                                          : "grid-cols-3",
                                    )}
                                  >
                                    {g.card.map((c) => (
                                      <li key={c.to}>
                                        {c.framePath ? (
                                          <NavFrameTile
                                            label={c.label}
                                            description={c.description}
                                            to={c.to}
                                            framePath={c.framePath}
                                            active={panelOpen}
                                            onNavigate={() => setOpenPanel(null)}
                                          />
                                        ) : (
                                          <NavImageCard card={c} onNavigate={() => setOpenPanel(null)} />
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Right side: search + primary conversion CTA (red, Marvin-style). */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { setSearchOpen((s) => !s); setOpenPanel(null); }}
                aria-label="Search"
                aria-expanded={searchOpen}
                aria-controls="site-search-flyout"
                className={cn(
                  "p-2 rounded-sm transition-[background-color,color] duration-300 ease-marvin",
                  transparent
                    ? "text-white hover:bg-white/15"
                    : "text-[color:var(--ink-primary)] hover:bg-[color:var(--canvas-soft)]"
                )}
              >
                <Search size={19} strokeWidth={1.5} />
              </button>
              <Link
                to="/brand#contact"
                className={cn(
                  "whitespace-nowrap text-body-sm font-medium",
                  "inline-flex min-h-9 items-center rounded-sm px-5",
                  "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-hover)]",
                  "transition-colors duration-300 ease-marvin"
                )}
              >
                Book a Consultation
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

      {/* Search flyout (desktop + tablet) */}
      <NavSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          id="mobile-navigation-dialog"
          ref={mobileDialogRef}
          className="fixed inset-0 z-40 lg:hidden bg-white pt-[72px] animate-fade-in flex flex-col overflow-y-auto"
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
                        {link.group.map((g, gi) => (
                          <div key={g.title ?? gi}>
                            {g.title && <p className="eyebrow mb-1.5">{g.title}</p>}
                            <ul className="space-y-1">
                              {g.card.map((c) => (
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

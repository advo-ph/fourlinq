import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, X, ArrowUpRight, ArrowDownToLine } from "lucide-react";
import Logo from "@/components/shared/Logo";
import SystemCardMedia from "@/components/shared/SystemCardMedia";
import { cn } from "@/lib/utils";
import { MATERIAL_TILE } from "@/data/taxonomy";
import { products } from "@/data/products";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import NavSearch from "@/components/layout/NavSearch";

/**
 * Header with Marvin-style mega-panels: every dropdown item carries imagery,
 * panels are state-driven with a close-grace timer so the pointer can travel
 * from the trigger into the panel without it vanishing, and a site search
 * flyout hangs off the magnifier at the right. The Systems panel lists every
 * window & door product on a wide left column, then the material axis as a
 * 2x2 grid on the right, split by a vertical rule.
 */

interface NavCard {
  label: string;
  to: string;
  description?: string;
  /** Static preview image. */
  image?: string;
  /** Product slug — enables the frame-based "opening" hover animation. */
  id?: string;
}

interface NavGroup {
  title?: string;
  /** Tailwind aspect class for this group's image cards. Defaults to 16:9;
      each panel overrides it to sit close to its photos' native ratio so
      object-cover trims as little as possible. */
  aspect?: string;
  card: NavCard[];
}

interface NavLink {
  label: string;
  to: string;
  group?: NavGroup[];
}

// Systems keeps both taxonomy axes. Left column, in a 4-up grid: the four
// windows fill the top row, then every door beneath it. Special Shapes reads as
// the niche window, so it sits last among windows. Right column: the material
// axis as a 2x2 grid (aluminium is a material, not a fourth type — Imie,
// 2026-07-02). Product tiles deep-link to their drawer on /products via the
// ?product= param.
const WINDOW_PRODUCTS = products.filter((p) => p.category === "windows");
const SYSTEM_PRODUCTS: NavCard[] = [
  ...WINDOW_PRODUCTS.filter((p) => p.id !== "special-shapes"),
  ...WINDOW_PRODUCTS.filter((p) => p.id === "special-shapes"),
  ...products.filter((p) => p.category === "doors"),
].map((p) => ({
  label: p.name,
  to: `/products?filter=${p.category}&product=${p.id}`,
  image: p.image,
  id: p.id,
}));

const SYSTEM_GROUP: NavGroup[] = [
  { title: "Windows & Doors", card: SYSTEM_PRODUCTS },
  {
    title: "By material",
    card: MATERIAL_TILE.map((m) => ({ label: m.label, to: m.to, description: m.bestFor })),
  },
];

// Brochures live in the Systems panel, below the material axis. Each opens its
// PDF straight in a new tab — no page navigation. The replacement guide file is
// not in /public/docs yet; the button is wired so it works the moment it lands.
const SYSTEM_BROCHURES: { label: string; file: string }[] = [
  { label: "System Catalog", file: "/docs/fourlinq-system-catalog.pdf" },
  { label: "Replacement Guide", file: "/docs/fourlinq-replacement-guide.pdf" },
];

// Every image below is a photo whose content matches its label — no
// stock-mismatch: the doors card is the verified corner sliding-door install.
const PROJECT_GROUP: NavGroup[] = [
  {
    // Windows, Doors and Interior are all ~3:2; Exterior is 16:9. A 3:2 frame
    // keeps the first three near-pristine and trims only ~10% off Exterior's
    // sides — far gentler than the old 16:9 container, which chopped the top and
    // bottom off every one.
    aspect: "aspect-[3/2]",
    card: [
      { label: "Windows", to: "/inspiration?filter=windows", image: "/images/wp-export/FQC-Project-17.jpg" },
      { label: "Doors", to: "/inspiration?filter=doors", image: "/images/products/real/sliding-door.webp" },
      { label: "Interior", to: "/inspiration?filter=interior", image: "/images/projects/real/interior-living-panel-windows.webp" },
      { label: "Exterior", to: "/inspiration?filter=exterior", image: "/images/projects/real/exterior-curved-residence.webp" },
    ],
  },
];

const WHATS_NEW_GROUP: NavGroup[] = [
  {
    // Products & Events are native 16:9, Projects is 4:3. 16:10 nudges off 16:9
    // toward that outlier: the two wide cards lose ~10% width while Projects'
    // crop drops from ~25% to ~17% — a more even trim across the row.
    aspect: "aspect-[16/10]",
    card: [
      { label: "Products", to: "/whats-new?filter=product", image: "/images/nav-whatsnew/products.jpg" },
      { label: "Projects", to: "/whats-new?filter=project", image: "/images/nav-whatsnew/projects.jpg" },
      { label: "Events", to: "/whats-new?filter=event", image: "/images/nav-whatsnew/events.jpg" },
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

/** Static image card used inside the mega-panels. `aspect` lets each panel pick
    the frame ratio closest to its photos so object-cover trims minimally. */
const NavImageCard = ({
  card,
  aspect = "aspect-video",
  onNavigate,
}: {
  card: NavCard;
  aspect?: string;
  onNavigate: () => void;
}) => (
  <Link to={card.to} onClick={onNavigate} className="group block">
    <div className={cn("relative overflow-hidden bg-[color:var(--canvas-soft)]", aspect)}>
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

/**
 * Dense image+label tile used in the Systems panel's window & door grid. Once
 * `animated` is true, each product with a frame sequence plays its "opening"
 * animation on hover (reversing on leave) via SystemCardMedia; products without
 * a sequence, or before the panel has ever opened, stay a plain static image so
 * the 1.4 MB of frames isn't fetched on pages where the menu is never touched.
 */
const NavCompactCard = ({
  card,
  animated,
  onNavigate,
}: {
  card: NavCard;
  animated: boolean;
  onNavigate: () => void;
}) => {
  const imgClassName =
    "w-full h-full object-cover transition-transform duration-700 ease-marvin [@media(hover:hover)]:group-hover:scale-[1.05]";
  return (
    <Link to={card.to} onClick={onNavigate} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--canvas-soft)]">
        {animated && card.id ? (
          <SystemCardMedia
            productId={card.id}
            src={card.image ?? ""}
            alt={card.label}
            imgClassName={imgClassName}
          />
        ) : (
          <img
            src={card.image}
            alt={card.label}
            loading="lazy"
            decoding="async"
            className={imgClassName}
          />
        )}
      </div>
      <p className="mt-2 text-center text-[12px] font-medium leading-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
        {card.label}
      </p>
    </Link>
  );
};

/**
 * Outline button used in the Systems panel's "By material" grid: no image, just
 * the material name over a "best for" subtitle (the card's description). Sharp
 * corners to match the panel's editorial imagery, with a hover arrow and accent
 * rule that echo the image cards' affordance.
 */
const NavMaterialButton = ({ card, onNavigate }: { card: NavCard; onNavigate: () => void }) => (
  <Link
    to={card.to}
    onClick={onNavigate}
    className="group relative flex h-full flex-col justify-center border border-[color:var(--rule-strong)] px-4 py-3.5 transition-colors duration-300 ease-marvin hover:bg-[color:var(--canvas-soft)]"
  >
    {/* Left accent rule wipes in on hover — a quiet, sharp-edged focus cue. */}
    <span
      aria-hidden="true"
      className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-[color:var(--accent)] transition-transform duration-300 ease-marvin group-hover:scale-y-100"
    />
    <span className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium leading-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
        {card.label}
      </span>
      <ArrowUpRight
        size={14}
        strokeWidth={1.5}
        className="shrink-0 -translate-x-1 text-[color:var(--ink-muted)] opacity-0 transition-all duration-300 ease-marvin group-hover:translate-x-0 group-hover:text-[color:var(--accent)] group-hover:opacity-100"
      />
    </span>
    {card.description && (
      <span className="mt-1 text-[11px] leading-snug text-[color:var(--ink-muted)]">
        {card.description}
      </span>
    )}
  </Link>
);

/**
 * Full-width outline button used for the Systems panel's brochures. Mirrors
 * NavMaterialButton's sharp-edged, accent-wipe styling, but it's a plain anchor
 * that opens the PDF in a new tab (target="_blank") instead of routing — a
 * download arrow replaces the material button's diagonal.
 */
const NavBrochureButton = ({
  label,
  file,
  onNavigate,
}: {
  label: string;
  file: string;
  onNavigate: () => void;
}) => (
  <a
    href={file}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onNavigate}
    className="group relative flex items-center justify-between gap-2 border border-[color:var(--rule-strong)] px-4 py-3.5 transition-colors duration-300 ease-marvin hover:bg-[color:var(--canvas-soft)]"
  >
    <span
      aria-hidden="true"
      className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-[color:var(--accent)] transition-transform duration-300 ease-marvin group-hover:scale-y-100"
    />
    <span className="text-[13px] font-medium leading-tight text-[color:var(--ink-primary)] group-hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin">
      {label}
    </span>
    <ArrowDownToLine
      size={14}
      strokeWidth={1.5}
      className="shrink-0 text-[color:var(--ink-muted)] transition-colors duration-300 ease-marvin group-hover:text-[color:var(--accent)]"
    />
  </a>
);

const QuietNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // Latches true the first time the Systems panel opens, so the window & door
  // tiles only mount their hover-animation player (and fetch its frames) once
  // the menu is actually used — never on a page load that never touches it.
  const [systemsWarmed, setSystemsWarmed] = useState(false);
  // Force-hidden by full-bleed sections (e.g. the ScrollWindow benefit sequence)
  // that want the viewport to themselves — overrides the scroll-direction logic.
  const [forceHidden, setForceHidden] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen && !openPanel && !searchOpen;
  // Slide the bar away on scroll-down, bring it back on scroll-up — but never
  // while a panel, the mobile drawer, or search is open (the panel hangs off
  // the bar) or when parked near the top.
  const navHidden = forceHidden || (hidden && !openPanel && !mobileOpen && !searchOpen);
  const mobileDialogRef = useDialogFocus<HTMLDivElement>({
    isOpen: mobileOpen,
    onClose: () => setMobileOpen(false),
  });

  // A single red underline shared by every top-level desktop item. Hovering a
  // button grows it out from that button's center; moving to a sibling slides
  // and resizes it there; leaving the list shrinks it back into its center.
  // Driven imperatively (refs + style writes) so pointer moves never re-render
  // the nav; the span's className owns the tween timing.
  const navListRef = useRef<HTMLUListElement>(null);
  const hoverLineRef = useRef<HTMLSpanElement>(null);
  const hoverLineVisible = useRef(false);

  const moveHoverLine = (el: HTMLElement) => {
    const list = navListRef.current;
    const line = hoverLineRef.current;
    if (!list || !line) return;
    const listBox = list.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    if (!hoverLineVisible.current) {
      // Snap (transition suppressed) to a zero-width line at the button's
      // center so the tween below reads as "grow outward", not "fly in".
      line.style.transition = "none";
      line.style.left = `${box.left - listBox.left + box.width / 2}px`;
      line.style.width = "0px";
      void line.offsetWidth; // flush the snap before re-enabling the tween
      line.style.transition = "";
    }
    line.style.left = `${box.left - listBox.left}px`;
    line.style.width = `${box.width}px`;
    hoverLineVisible.current = true;
  };

  const retractHoverLine = () => {
    const line = hoverLineRef.current;
    if (!line || !hoverLineVisible.current) return;
    // Collapse in place: recentre on the line's current midpoint at width 0.
    // offsetLeft/offsetWidth read the live mid-tween values, so a fast exit
    // shrinks from wherever the line actually is, not its last target.
    line.style.left = `${line.offsetLeft + line.offsetWidth / 2}px`;
    line.style.width = "0px";
    hoverLineVisible.current = false;
  };

  // Warm the window & door hover animations the first time Systems opens.
  useEffect(() => {
    if (openPanel === "Systems") setSystemsWarmed(true);
  }, [openPanel]);

  // Close everything on route change, and reveal the bar for the new page.
  useEffect(() => {
    setMobileOpen(false);
    setOpenPanel(null);
    setSearchOpen(false);
    setHidden(false);
    setForceHidden(false);
    lastScrollY.current = window.scrollY;
  }, [location]);

  // Full-bleed sections can request the bar be hidden regardless of scroll.
  useEffect(() => {
    const onHide = (e: Event) => setForceHidden(!!(e as CustomEvent).detail);
    window.addEventListener("fq-hide-header", onHide as EventListener);
    return () => window.removeEventListener("fq-hide-header", onHide as EventListener);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPanel(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 12);

      // Direction with a small dead-zone so jitter and rubber-banding don't
      // flip the bar. Always show it in the top 72px.
      const delta = y - lastScrollY.current;
      if (y <= 72) {
        setHidden(false);
        lastScrollY.current = y;
      } else if (Math.abs(delta) > 6) {
        setHidden(delta > 0);
        lastScrollY.current = y;
      }
    };
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
          "h-[72px] will-change-transform",
          "transition-[background-color,backdrop-filter,color,transform] duration-300 ease-marvin",
          navHidden && "-translate-y-full",
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

            {/* Desktop nav */}
            <ul
              ref={navListRef}
              onMouseLeave={retractHoverLine}
              className="relative hidden lg:flex items-center gap-1 xl:gap-2 h-full"
            >
              {navLinks.map((link) => {
                const active = location.pathname === link.to ||
                               (link.to !== "/" && location.pathname.startsWith(link.to));
                const panelOpen = openPanel === link.label;
                return (
                  <li
                    key={link.label}
                    className="relative h-full flex items-center"
                  >
                    {link.group ? (
                      /* A panel trigger. Click toggles it open and closed —
                         hover only moves the underline cue, never the panel.
                         It never navigates — the panel is the destination. */
                      <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={panelOpen}
                        onClick={() => setOpenPanel(panelOpen ? null : link.label)}
                        onMouseEnter={(e) => moveHoverLine(e.currentTarget)}
                        className={cn(
                          "whitespace-nowrap text-body-sm font-medium transition-[background-color,color] duration-300 ease-marvin",
                          "inline-flex min-h-8 items-center rounded-sm px-4",
                          active || panelOpen
                            ? transparent
                              ? "bg-white/15 text-white"
                              : "bg-[color:var(--canvas-soft)] text-[color:var(--ink-primary)]"
                            : transparent
                              ? "text-white"
                              : "text-[color:var(--ink-primary)]"
                        )}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.to}
                        onMouseEnter={(e) => moveHoverLine(e.currentTarget)}
                        className={cn(
                          "whitespace-nowrap text-body-sm font-medium transition-[background-color,color] duration-300 ease-marvin",
                          "inline-flex min-h-8 items-center rounded-sm px-4",
                          active
                            ? transparent
                              ? "bg-white/15 text-white"
                              : "bg-[color:var(--canvas-soft)] text-[color:var(--ink-primary)]"
                            : transparent
                              ? "text-white"
                              : "text-[color:var(--ink-primary)]"
                        )}
                      >
                        {link.label}
                      </Link>
                    )}

                    {link.group && (
                      <div
                        // Click-only panel: no mouse handlers here. It stays
                        // open until the trigger is clicked again, the backdrop
                        // is clicked, Escape is pressed, or the route changes.
                        className={cn(
                          "fixed left-0 right-0 top-[72px]",
                          panelOpen
                            ? "opacity-100 visible pointer-events-auto"
                            : "opacity-0 invisible pointer-events-none",
                          "transition-[opacity,visibility] duration-300 ease-marvin"
                        )}
                      >
                        <div className="bg-white text-[color:var(--ink-primary)] border-b border-[color:var(--rule-soft)]">
                          <div className="container-editorial py-9 max-h-[calc(var(--fq-svh)-72px)] overflow-y-auto">
                            {link.label === "Systems" ? (
                              /* Systems: a 4-up product grid (windows on the top
                                 row, doors beneath) on the left, a vertical
                                 rule, and the 2x2 material grid on the right. */
                              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-y-10">
                                <div className="xl:pr-12">
                                  <p className="eyebrow mb-5 pb-3 border-b border-[color:var(--rule-soft)]">
                                    {link.group[0].title}
                                  </p>
                                  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-7">
                                    {link.group[0].card.map((c) => (
                                      <li key={c.label}>
                                        <NavCompactCard
                                          card={c}
                                          animated={systemsWarmed}
                                          onNavigate={() => setOpenPanel(null)}
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="xl:pl-10 xl:border-l border-[color:var(--rule-soft)]">
                                  <p className="eyebrow mb-5 pb-3 border-b border-[color:var(--rule-soft)]">
                                    {link.group[1].title}
                                  </p>
                                  <ul className="grid grid-cols-2 gap-3">
                                    {link.group[1].card.map((c) => (
                                      <li key={c.label}>
                                        <NavMaterialButton card={c} onNavigate={() => setOpenPanel(null)} />
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="eyebrow mt-10 mb-5 pb-3 border-b border-[color:var(--rule-soft)]">
                                    Brochures
                                  </p>
                                  <ul className="grid grid-cols-1 gap-3">
                                    {SYSTEM_BROCHURES.map((b) => (
                                      <li key={b.label}>
                                        <NavBrochureButton
                                          label={b.label}
                                          file={b.file}
                                          onNavigate={() => setOpenPanel(null)}
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ) : (
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
                                        <li key={c.label}>
                                          <NavImageCard card={c} aspect={g.aspect} onNavigate={() => setOpenPanel(null)} />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
              {/* The shared hover underline. Position/size are written by
                  moveHoverLine/retractHoverLine; this class only owns the
                  tween. bottom-[18px] parks it just under the 32px buttons
                  centered in the 72px bar. */}
              <span
                ref={hoverLineRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[18px] left-0 h-[2px] w-0 bg-[color:var(--accent)] transition-[left,width] duration-200 ease-marvin"
              />
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

      {/* Dim + blur the page behind an open mega-panel. Sits under the nav
          (z-40 vs the nav's z-50) so the bar and its crisp panel stay on top,
          while everything below the bar is frosted. Clicking it closes the
          panel. */}
      <div
        aria-hidden="true"
        onClick={() => setOpenPanel(null)}
        className={cn(
          "fixed inset-x-0 top-[72px] bottom-0 z-40 bg-black/60 backdrop-blur-md",
          "transition-opacity duration-300 ease-marvin",
          openPanel ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      />

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
                                <li key={c.label}>
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
                        {link.label === "Systems" && (
                          <div>
                            <p className="eyebrow mb-1.5">Brochures</p>
                            <ul className="space-y-1">
                              {SYSTEM_BROCHURES.map((b) => (
                                <li key={b.label}>
                                  <a
                                    href={b.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 py-1.5 text-body-sm text-[color:var(--ink-secondary)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin"
                                  >
                                    {b.label}
                                    <ArrowDownToLine size={14} strokeWidth={1.5} className="shrink-0 text-[color:var(--ink-muted)]" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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

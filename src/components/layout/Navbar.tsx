import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import Logo from "@/components/shared/Logo";
import {
  CasementIcon, SlidingIcon, FixedIcon, BifoldIcon, AwningIcon,
  LiftAndSlideIcon, FrenchDoorIcon, TiltAndTurnIcon, SlidingDoorIcon, EntranceIcon,
} from "@/components/icons/WindowIcons";
import { useProductTypes } from "@/hooks/useConfigurator";

const iconMap: Record<string, React.FC<{ className?: string; size?: number; strokeWidth?: number }>> = {
  casement: CasementIcon,
  awning: AwningIcon,
  sliding: SlidingIcon,
  fixed: FixedIcon,
  "tilt-turn": TiltAndTurnIcon,
  bifold: BifoldIcon,
  "lift-slide": LiftAndSlideIcon,
  "french-door": FrenchDoorIcon,
  "sliding-door": SlidingDoorIcon,
  entrance: EntranceIcon,
};

const utilityLinks = [
  { label: "Visit a Showroom", to: "/brand#contact" },
  { label: "Support", to: "/brand#contact" },
  { label: "Technical Specs", to: "/products" },
];

// Static fallbacks for when API is loading
const staticWindowTypes = [
  { name: "Casement", icon: CasementIcon, to: "/products?filter=windows" },
  { name: "Awning", icon: AwningIcon, to: "/products?filter=windows" },
  { name: "Sliding", icon: SlidingIcon, to: "/products?filter=windows" },
  { name: "Fixed", icon: FixedIcon, to: "/products?filter=windows" },
  { name: "Tilt & Turn", icon: TiltAndTurnIcon, to: "/products?filter=windows" },
];

const staticDoorTypes = [
  { name: "Sliding Door", icon: SlidingDoorIcon, to: "/products?filter=doors" },
  { name: "Bifold", icon: BifoldIcon, to: "/products?filter=doors" },
  { name: "Lift & Slide", icon: LiftAndSlideIcon, to: "/products?filter=doors" },
  { name: "French Door", icon: FrenchDoorIcon, to: "/products?filter=doors" },
  { name: "Entrance", icon: EntranceIcon, to: "/products?filter=doors" },
];

const windowCategories = {
  byType: ["Casement Windows", "Sliding Windows", "Awning Windows", "Fixed Panels", "Tilt & Turn"],
  byMaterial: ["uPVC Systems", "uPVC + Aluminium Clad", "Reinforced Profiles"],
};

const doorCategories = {
  byType: ["Sliding Doors", "French Doors", "Bifold Doors", "Lift & Slide", "Entrance Systems"],
  byMaterial: ["uPVC Systems", "uPVC + Aluminium Clad", "Reinforced Profiles"],
};

type MegaKey = "windows" | "doors" | null;

const navLinks = [
  { label: "Windows", to: "/products?filter=windows", megaKey: "windows" as MegaKey },
  { label: "Doors", to: "/products?filter=doors", megaKey: "doors" as MegaKey },
  { label: "Design Tool", to: "/design-tool", megaKey: null as MegaKey },
  { label: "Why uPVC", to: "/why-upvc", megaKey: null as MegaKey },
  { label: "Brand", to: "/brand", megaKey: null as MegaKey },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubPanel, setMobileSubPanel] = useState<MegaKey>(null);
  const [megaOpen, setMegaOpen] = useState<MegaKey>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const { data: dbTypes } = useProductTypes();
  const windowTypes = useMemo(() => {
    if (!dbTypes) return staticWindowTypes;
    const filtered = dbTypes
      .filter((t) => t.category === "windows")
      .map((t) => ({ name: t.name, icon: iconMap[t.iconKey] || FixedIcon, to: "/products?filter=windows" }));
    return filtered.length > 0 ? filtered : staticWindowTypes;
  }, [dbTypes]);
  const doorTypes = useMemo(() => {
    if (!dbTypes) return staticDoorTypes;
    const filtered = dbTypes
      .filter((t) => t.category === "doors")
      .map((t) => ({ name: t.name, icon: iconMap[t.iconKey] || FixedIcon, to: "/products?filter=doors" }));
    return filtered.length > 0 ? filtered : staticDoorTypes;
  }, [dbTypes]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Check if nav overlaps a dark section
      const navBottom = 32 + 80; // utility bar + nav height
      const el = document.elementFromPoint(window.innerWidth / 2, navBottom + 4);
      if (el) {
        const bg = getComputedStyle(el).backgroundColor;
        const match = bg.match(/\d+/g);
        if (match) {
          const [r, g, b] = match.map(Number);
          // Consider dark if luminance is below threshold
          const lum = (0.299 * r + 0.587 * g + 0.114 * b);
          setOverDark(lum < 60);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSubPanel(null);
    setMegaOpen(null);
  }, [location]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const openMega = (key: MegaKey) => { clearTimeout(megaTimeout.current); setMegaOpen(key); };
  const closeMega = () => { megaTimeout.current = setTimeout(() => setMegaOpen(null), 200); };

  const useLight = (!scrolled && isHome && !mobileOpen) || (scrolled && overDark && !mobileOpen);
  const navBg = mobileOpen
    ? "bg-white/98 backdrop-blur-xl shadow-sm"
    : useLight
      ? (scrolled ? "bg-black/40 backdrop-blur-xl" : "bg-transparent")
      : "bg-white/98 backdrop-blur-xl shadow-sm";
  const textColor = useLight
    ? "text-white [text-shadow:_0_1px_3px_rgba(0,0,0,0.4)]"
    : "text-foreground";
  const logoVariant = useLight ? "light" : "dark";
  const showUtility = true;

  const activeMegaTypes = megaOpen === "windows" ? windowTypes : doorTypes;
  const activeMegaCategories = megaOpen === "windows" ? windowCategories : doorCategories;
  const featuredImage = megaOpen === "windows"
    ? "/images/wp-export/Casement-Windows.jpg"
    : "/images/wp-export/Sliding-Door.jpg";
  const featuredTitle = megaOpen === "windows"
    ? "Manila Residence — Full Window Upgrade"
    : "Tagaytay Villa — Bifold Door Installation";

  const mobileSubTypes = mobileSubPanel === "windows" ? windowTypes : doorTypes;

  return (
    <>
      {/* Top gradient scrim for nav readability over images */}
      {isHome && !scrolled && (
        <div className="fixed top-0 left-0 right-0 z-40 h-28 pointer-events-none bg-gradient-to-b from-black/40 via-black/15 to-transparent" />
      )}

      {/* Utility Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-8 bg-[#171717]">
        <div className="page-container flex items-center justify-end h-full">
          <div className="flex items-center gap-4 sm:gap-6">
            {utilityLinks.map((link) => (
              <Link key={link.label} to={link.to} className="text-[11px] font-medium text-white/70 hover:text-white transition-colors tracking-[0.08em] uppercase">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="page-container flex items-center justify-between h-20">
          <Link to="/" className="shrink-0">
            <Logo variant={logoVariant} />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 whitespace-nowrap">
            {navLinks.map((link) =>
              link.megaKey ? (
                <div key={link.label} className="relative" onMouseEnter={() => openMega(link.megaKey)} onMouseLeave={closeMega}>
                  <Link to={link.to} className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-accent flex items-center gap-1 ${megaOpen === link.megaKey ? "text-accent" : textColor}`}>
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${megaOpen === link.megaKey ? "rotate-180" : ""}`} />
                  </Link>
                </div>
              ) : (
                <Link key={link.label} to={link.to} className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-accent ${location.pathname === link.to ? "text-accent" : textColor}`}>
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden lg:block shrink-0">
            <Link to="/brand#contact" className="inline-flex items-center px-5 py-2 bg-accent text-white text-xs font-medium uppercase tracking-[0.08em] hover:bg-red-700 transition-colors">
              Get a Quote
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden -mr-1 p-1 ${textColor}`} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mega Menu (desktop) */}
      {megaOpen && (
        <div className="fixed left-0 right-0 z-40 hidden lg:block" style={{ top: "calc(2rem + 5rem)" }} onMouseEnter={() => openMega(megaOpen)} onMouseLeave={closeMega}>
          <div className="bg-white border-b border-border shadow-lg">
            <div className="max-w-7xl mx-auto flex px-6">
              {/* Left sidebar */}
              <div className="w-64 shrink-0 bg-neutral-50 py-8 px-6 space-y-1">
                <Link to="/products" className="flex items-center justify-between py-3 px-3 rounded-md text-sm font-medium text-foreground hover:bg-border/50 transition-colors">
                  By Type <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
                <Link to="/products" className="flex items-center justify-between py-3 px-3 rounded-md text-sm font-medium text-foreground hover:bg-border/50 transition-colors">
                  By Material <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
                <div className="pt-4">
                  <Link
                    to={megaOpen === "windows" ? "/products?filter=windows" : "/products?filter=doors"}
                    className="block py-3 px-3 text-sm font-semibold text-foreground hover:text-accent transition-colors"
                  >
                    All {megaOpen === "windows" ? "Windows" : "Doors"}
                  </Link>
                </div>
              </div>

              {/* Right — icon grid */}
              <div className="flex-1 bg-white py-8 px-10">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  {activeMegaTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Link key={type.name} to={type.to} className="group flex items-center gap-4 py-2 hover:opacity-70 transition-opacity">
                        <Icon size={48} className="text-primary shrink-0" strokeWidth={0.9} />
                        <span className="text-[15px] font-medium text-foreground">{type.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full-Screen Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-surface flex flex-col pt-28">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
            {/* Main level */}
            {!mobileSubPanel && (
              <div className="flex flex-col px-6">
                {navLinks.map((link) =>
                  link.megaKey ? (
                    <button
                      key={link.label}
                      onClick={() => setMobileSubPanel(link.megaKey)}
                      className="flex items-center justify-between py-4 border-b border-border text-lg font-medium text-foreground"
                    >
                      {link.label}
                      <ChevronRight size={20} className="text-muted-foreground" />
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.to}
                      className={`py-4 border-b border-border text-lg font-medium transition-colors ${
                        location.pathname === link.to ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <Link
                  to="/brand#contact"
                  className="flex items-center justify-center mt-6 px-6 py-3 bg-accent text-white text-sm font-medium uppercase tracking-[0.08em] hover:bg-red-700 transition-colors"
                >
                  Get a Quote
                </Link>
              </div>
            )}

            {/* Sub-panel for Windows / Doors */}
            {mobileSubPanel && (
              <div className="flex flex-col px-6">
                <button
                  onClick={() => setMobileSubPanel(null)}
                  className="flex items-center gap-2 py-4 border-b border-border text-sm font-medium text-muted-foreground"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <h3 className="text-lg font-semibold text-primary mt-4 mb-2">
                  {mobileSubPanel === "windows" ? "Windows" : "Doors"}
                </h3>
                <div className="space-y-1">
                  {mobileSubTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Link
                        key={type.name}
                        to={type.to}
                        className="flex items-center gap-3 py-3 border-b border-border text-foreground hover:text-accent transition-colors"
                      >
                        <Icon size={20} strokeWidth={1.2} className="text-primary shrink-0" />
                        <span className="text-sm font-medium">{type.name}</span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  to={mobileSubPanel === "windows" ? "/products?filter=windows" : "/products?filter=doors"}
                  className="mt-4 text-sm font-medium text-accent hover:underline"
                >
                  View all {mobileSubPanel} →
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

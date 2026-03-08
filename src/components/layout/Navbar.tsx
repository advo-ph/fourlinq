import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { label: "For Professionals", to: "/brand#professionals" },
  { label: "Visit Showroom", to: "/brand#contact" },
  { label: "Support", to: "/brand#contact" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubPanel, setMobileSubPanel] = useState<MegaKey>(null);
  const [megaOpen, setMegaOpen] = useState<MegaKey>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const { data: dbTypes } = useProductTypes();
  const windowTypes = useMemo(() => {
    if (!dbTypes) return staticWindowTypes;
    return dbTypes
      .filter((t) => t.category === "windows")
      .map((t) => ({ name: t.name, icon: iconMap[t.iconKey] || FixedIcon, to: "/products?filter=windows" }));
  }, [dbTypes]);
  const doorTypes = useMemo(() => {
    if (!dbTypes) return staticDoorTypes;
    return dbTypes
      .filter((t) => t.category === "doors")
      .map((t) => ({ name: t.name, icon: iconMap[t.iconKey] || FixedIcon, to: "/products?filter=doors" }));
  }, [dbTypes]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
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

  const navBg = scrolled || !isHome ? "bg-surface/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-transparent";
  const textColor = scrolled || !isHome ? "text-foreground" : "text-primary";
  const showUtility = scrolled || !isHome;

  const activeMegaTypes = megaOpen === "windows" ? windowTypes : doorTypes;
  const activeMegaCategories = megaOpen === "windows" ? windowCategories : doorCategories;
  const featuredImage = megaOpen === "windows"
    ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80"
    : "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80";
  const featuredTitle = megaOpen === "windows"
    ? "Manila Residence — Full Window Upgrade"
    : "Tagaytay Villa — Bifold Door Installation";

  const mobileSubTypes = mobileSubPanel === "windows" ? windowTypes : doorTypes;

  return (
    <>
      {/* Utility Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showUtility ? "h-8 bg-primary" : "h-8 bg-primary/90"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-6">
            {utilityLinks.map((link) => (
              <Link key={link.label} to={link.to} className="text-[11px] font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors tracking-wide uppercase">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-primary-foreground/60">
            <span>📞 +63 2 8123 4567</span>
            <span>✉ info@fourlinq.ph</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20 px-6">
          <Link to="/" className="flex flex-col leading-tight">
            <span className={`text-xl font-semibold tracking-tight ${textColor}`}>
              FOURLIN<span className="text-accent">Q</span>
            </span>
            <span className={`text-[10px] uppercase tracking-[0.2em] ${scrolled || !isHome ? "text-muted-foreground" : "text-primary/60"}`}>
              Windows & Doors
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.megaKey ? (
                <div key={link.label} className="relative" onMouseEnter={() => openMega(link.megaKey)} onMouseLeave={closeMega}>
                  <Link to={link.to} className={`text-sm font-medium transition-colors hover:text-accent flex items-center gap-1 ${megaOpen === link.megaKey ? "text-accent" : textColor}`}>
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${megaOpen === link.megaKey ? "rotate-180" : ""}`} />
                  </Link>
                </div>
              ) : (
                <Link key={link.label} to={link.to} className={`text-sm font-medium transition-colors hover:text-accent ${location.pathname === link.to ? "text-accent" : textColor}`}>
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:block">
            <Button asChild size="sm" className="font-medium"><Link to="/brand#contact">Book Consultation</Link></Button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 ${textColor}`} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mega Menu (desktop) */}
      {megaOpen && (
        <div className="fixed left-0 right-0 z-40 hidden md:block" style={{ top: "calc(2rem + 5rem)" }} onMouseEnter={() => openMega(megaOpen)} onMouseLeave={closeMega}>
          <div className="bg-surface border-b border-border shadow-xl">
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
              <div className="col-span-3 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">By Type</h4>
                  <ul className="space-y-2">
                    {activeMegaCategories.byType.map((cat) => (
                      <li key={cat}><Link to="/products" className="text-sm text-foreground hover:text-accent transition-colors">{cat}</Link></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">By Material</h4>
                  <ul className="space-y-2">
                    {activeMegaCategories.byMaterial.map((cat) => (
                      <li key={cat}><Link to="/products" className="text-sm text-foreground hover:text-accent transition-colors">{cat}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col-span-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  {megaOpen === "windows" ? "Window Types" : "Door Types"}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {activeMegaTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Link key={type.name} to={type.to} className="group flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <Icon size={52} className="text-primary group-hover:text-accent transition-colors" strokeWidth={0.9} />
                        <span className="text-xs font-medium text-foreground group-hover:text-accent transition-colors">{type.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              <div className="col-span-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Featured</h4>
                <div className="rounded-lg overflow-hidden relative group">
                  <img src={featuredImage} alt="Featured project" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-4">
                    <h5 className="text-sm font-semibold text-primary-foreground">{featuredTitle}</h5>
                    <Link to="/brand" className="text-xs text-primary-foreground/80 hover:text-primary-foreground mt-1 underline underline-offset-2">Read More →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full-Screen Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-surface flex flex-col pt-24 overflow-y-auto">
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
                <div className="pt-6 space-y-3">
                  {utilityLinks.map((link) => (
                    <Link key={link.label} to={link.to} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Button asChild className="mt-6 font-medium">
                  <Link to="/brand#contact">Book Consultation</Link>
                </Button>
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
      )}
    </>
  );
};

export default Navbar;

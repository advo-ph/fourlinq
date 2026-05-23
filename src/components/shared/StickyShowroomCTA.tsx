import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Bottom-left sticky "Visit a Showroom" pill — appears on scroll past
 * the hero. K&M has no equivalent (audit Tier 2 §11). Sized small and
 * quiet — Marvin/Vitrocsa restraint — so it doesn't fight the chat
 * bubble in the bottom-right corner.
 */
const StickyShowroomCTA = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      to="/brand#showrooms"
      className={cn(
        "fixed bottom-6 left-6 z-[55] inline-flex items-center gap-2",
        "bg-[color:var(--ink-primary)] text-white",
        "px-5 py-3.5 text-body-sm font-medium",
        "shadow-depth-4 hover:bg-[color:var(--accent)]",
        "transition-all duration-300 ease-marvin",
        show
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
        // Hide on narrow mobile to avoid covering content
        "hidden sm:inline-flex"
      )}
      aria-label="Visit a FourlinQ showroom"
    >
      Visit a Showroom
      <span aria-hidden="true">→</span>
    </Link>
  );
};

export default StickyShowroomCTA;

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";
import { trackChatOpen } from "@/hooks/useAnalytics";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lift, setLift] = useState(false);
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  // Delayed reveal — only show bubble after user has scrolled at least once
  // and ~4s after that, so it doesn't compete with the hero at first load.
  useEffect(() => {
    let timeout: number | null = null;
    let scrolled = false;
    const onScroll = () => {
      if (scrolled) return;
      if (window.scrollY > 120) {
        scrolled = true;
        timeout = window.setTimeout(() => setVisible(true), 4000);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    setLift(false);
    let cancelled = false;
    let obs: IntersectionObserver | null = null;

    const tryAttach = (attemptsLeft: number) => {
      if (cancelled) return;
      const footer = document.querySelector("footer");
      if (footer) {
        obs = new IntersectionObserver(
          ([entry]) => setLift(entry.isIntersecting),
          { threshold: 0, rootMargin: "0px 0px 100px 0px" }
        );
        obs.observe(footer);
        return;
      }
      if (attemptsLeft > 0) setTimeout(() => tryAttach(attemptsLeft - 1), 100);
    };
    tryAttach(10);

    return () => {
      cancelled = true;
      obs?.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div
        className="fixed bottom-6 right-6 z-[61] transition-transform duration-500 ease-marvin will-change-transform"
        style={{
          transform: lift && !isOpen ? "translateY(-100px)" : "translateY(0)",
          opacity: visible || isOpen ? 1 : 0,
          pointerEvents: visible || isOpen ? "auto" : "none",
          transitionProperty: "transform, opacity",
        }}
      >
        <button
          onClick={() => { if (!isOpen) trackChatOpen(); setIsOpen(!isOpen); }}
          className="w-12 h-12 rounded-full bg-[color:var(--ink-primary)] text-white shadow-depth-6 hover:scale-105 active:scale-95 transition-all duration-300 ease-marvin flex items-center justify-center group"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={20} />}

          {!isOpen && (
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[color:var(--ink-primary)] text-white text-xs font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-marvin pointer-events-none">
              Chat with LinQ
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default ChatBubble;

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";
import { trackChatOpen } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cookieVisible, setCookieVisible] = useState(false);

  useEffect(() => {
    const onCookieVisibility = (event: Event) => {
      const detail = (event as CustomEvent<{ visible?: boolean }>).detail;
      setCookieVisible(detail?.visible === true);
    };

    window.addEventListener("fourlinq:cookie-visibility", onCookieVisibility);
    return () => window.removeEventListener("fourlinq:cookie-visibility", onCookieVisibility);
  }, []);

  return (
    <>
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div
        data-chat-bubble
        className={cn(
          "fixed right-6 z-[61] transition-[bottom] duration-300 ease-marvin",
          cookieVisible ? "bottom-[13rem] sm:bottom-[11.5rem] md:bottom-[10rem] lg:bottom-6" : "bottom-6",
        )}
      >
        <button
          onClick={() => { if (!isOpen) trackChatOpen(); setIsOpen(!isOpen); }}
          className="relative flex h-12 w-12 items-center justify-center rounded-sm border border-white/80 bg-white text-[color:var(--ink-primary)] shadow-depth-6 transition-[background-color,color,border-color] duration-300 ease-marvin hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-white group"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[color:var(--accent)] ring-2 ring-white transition-colors duration-300 ease-marvin group-hover:bg-white group-hover:ring-[color:var(--accent)]" />
          {isOpen ? <X size={20} strokeWidth={1.75} /> : <MessageCircle size={20} strokeWidth={1.75} />}

          {!isOpen && (
            <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[color:var(--ink-primary)] text-white text-xs font-medium rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-marvin pointer-events-none">
              Chat with LinQ
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default ChatBubble;

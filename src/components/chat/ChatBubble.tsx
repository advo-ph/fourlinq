import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";
import { trackChatOpen } from "@/hooks/useAnalytics";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="fixed bottom-6 right-6 z-[61]">
        <button
          onClick={() => { if (!isOpen) trackChatOpen(); setIsOpen(!isOpen); }}
          className="w-14 h-14 rounded-full bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-white ring-2 ring-white shadow-depth-6 hover:scale-105 active:scale-95 transition-all duration-300 ease-marvin flex items-center justify-center group"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}

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

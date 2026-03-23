import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating bubble — always visible, toggles between open/close icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[61] w-14 h-14 rounded-full bg-red-600/40 backdrop-blur-xl border border-white/20 text-white shadow-[0_8px_32px_rgba(220,38,38,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-red-600/50 hover:shadow-[0_12px_40px_rgba(220,38,38,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping [animation-duration:3s]" />
          </>
        )}

        {/* Tooltip — only when closed */}
        {!isOpen && (
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-red-600/40 backdrop-blur-xl border border-white/20 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_4px_16px_rgba(220,38,38,0.25)]">
            Chat with LinQ
            <span className="absolute top-full right-5 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-red-600/40" />
          </span>
        )}
      </button>
    </>
  );
};

export default ChatBubble;

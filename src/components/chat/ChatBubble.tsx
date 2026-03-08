import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatPanel from "./ChatPanel";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />

          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping [animation-duration:3s]" />

          {/* Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Chat with LinQ
            <span className="absolute top-full right-5 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary" />
          </span>
        </button>
      )}
    </>
  );
};

export default ChatBubble;

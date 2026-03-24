import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { streamChat, resetChat } from "@/lib/gemini-chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FollowUp {
  label: string;
  message: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  "What windows do you offer?",
  "Is uPVC good for typhoons?",
  "How much do your windows cost?",
  "Tell me about your finishes",
];

// ── Contextual follow-ups based on response content ──

function getFollowUps(text: string, allMessages: Message[]): FollowUp[] {
  const t = text.toLowerCase();
  const followUps: FollowUp[] = [];
  const messageCount = allMessages.filter((m) => m.role === "user").length;

  // Product-related
  if (t.includes("casement") || t.includes("sliding") || t.includes("awning") || t.includes("slide & fold") || t.includes("special shape")) {
    followUps.push({ label: "Try the Design Tool", message: "How do I use the Design Tool?" });
    if (!t.includes("finish")) followUps.push({ label: "What finishes are available?", message: "What finishes are available?" });
    followUps.push({ label: "Request a quote", message: "How can I request a quote?" });
  }

  // Finishes
  if (t.includes("finish") || t.includes("laminate") || t.includes("wood grain") || t.includes("oak") || t.includes("walnut")) {
    if (!followUps.some((f) => f.label.includes("Design Tool")))
      followUps.push({ label: "Try the Design Tool", message: "How do I use the Design Tool?" });
    followUps.push({ label: "Which finishes for aluminum?", message: "Which finishes are available for aluminum frames?" });
  }

  // Pricing / quotes
  if (t.includes("price") || t.includes("cost") || t.includes("quote") || t.includes("budget")) {
    followUps.push({ label: "Visit a showroom", message: "Where are your showrooms?" });
    followUps.push({ label: "What's the warranty?", message: "What warranty do you offer?" });
  }

  // Warranty
  if (t.includes("warranty") || t.includes("10-year") || t.includes("10 year")) {
    followUps.push({ label: "What does the warranty cover?", message: "What exactly does the 10-year warranty cover?" });
    followUps.push({ label: "Contact sales", message: "How can I contact your sales team?" });
  }

  // Location / branches
  if (t.includes("branch") || t.includes("showroom") || t.includes("office") || t.includes("cebu") || t.includes("alabang") || t.includes("ortigas")) {
    followUps.push({ label: "Get directions", message: "Give me the full address of your nearest branch" });
    followUps.push({ label: "Call sales", message: "What's your sales phone number?" });
  }

  // uPVC benefits
  if (t.includes("fire retardant") || t.includes("corrosion") || t.includes("thermal") || t.includes("sound insulation") || t.includes("weather")) {
    followUps.push({ label: "uPVC vs aluminum?", message: "What's the difference between your uPVC and aluminum options?" });
    followUps.push({ label: "See all 7 advantages", message: "What are all 7 FourlinQ advantages?" });
  }

  // Design Tool
  if (t.includes("design tool") || t.includes("configurator") || t.includes("customize")) {
    followUps.push({ label: "What products can I configure?", message: "What window and door types can I configure?" });
    followUps.push({ label: "What glass options?", message: "What glass types are available?" });
  }

  // Contact info given
  if (t.includes("0925-848-8888") || t.includes("sales@fourlinq")) {
    followUps.push({ label: "Where are you located?", message: "Where are your branches located?" });
    followUps.push({ label: "What are your products?", message: "What window and door types do you offer?" });
  }

  // Generic fallback for early conversation
  if (followUps.length === 0 && messageCount <= 2) {
    followUps.push({ label: "What products do you offer?", message: "What window and door types do you offer?" });
    followUps.push({ label: "Why choose uPVC?", message: "Why should I choose uPVC windows?" });
    followUps.push({ label: "Where are your branches?", message: "Where are your branches located?" });
  }

  // Dedupe and limit to 3
  const seen = new Set<string>();
  return followUps
    .filter((f) => {
      if (seen.has(f.label)) return false;
      seen.add(f.label);
      return true;
    })
    .slice(0, 3);
}

// ── Component ──

const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetChat();
    setMessages([]);
    onClose();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      let accumulatedText = "";
      for await (const chunk of streamChat(text.trim())) {
        accumulatedText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulatedText,
          };
          return updated;
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again or contact us at 0925-848-8888.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(220,38,38,0.15),0_0_0_1px_rgba(255,255,255,0.12)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 bg-black/80 backdrop-blur-2xl border border-white/15">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <span className="text-red-500 font-bold text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>Q</span>
          <div>
            <p className="text-white font-semibold text-sm">LinQ</p>
            <p className="text-white/40 text-[11px]">FourlinQ Assistant</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-white/50 hover:text-white transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="py-6 px-1">
            <p className="text-white font-medium text-sm mb-1">Hi, I'm LinQ</p>
            <p className="text-white/50 text-xs leading-relaxed mb-5">
              Your FourlinQ product specialist. Ask me anything about our windows, doors, or uPVC systems.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 text-xs bg-white/8 border border-white/10 rounded-full text-white/70 hover:bg-white/15 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;
          const followUps = isLastAssistant && !isStreaming ? getFollowUps(msg.content, messages) : undefined;

          return (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              followUps={followUps}
              onFollowUp={sendMessage}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-4 shrink-0 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-full pl-5 pr-2 py-2 shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our products..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {isStreaming ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;

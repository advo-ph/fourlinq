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
  "What systems do you offer?",
  "Is uPVC good for typhoons?",
  "How do I request a quote?",
  "Tell me about your finishes",
];

function getFollowUps(text: string, allMessages: Message[]): FollowUp[] {
  const t = text.toLowerCase();
  const followUps: FollowUp[] = [];
  const messageCount = allMessages.filter((m) => m.role === "user").length;

  if (t.includes("casement") || t.includes("sliding") || t.includes("awning") || t.includes("slide & fold") || t.includes("special shape")) {
    followUps.push({ label: "Try the Design Tool", message: "How do I use the Design Tool?" });
    if (!t.includes("finish")) followUps.push({ label: "What finishes are available?", message: "What finishes are available?" });
    followUps.push({ label: "Request a quote", message: "How can I request a quote?" });
  }
  if (t.includes("finish") || t.includes("laminate") || t.includes("wood grain") || t.includes("oak") || t.includes("walnut")) {
    if (!followUps.some((f) => f.label.includes("Design Tool")))
      followUps.push({ label: "Try the Design Tool", message: "How do I use the Design Tool?" });
    followUps.push({ label: "Which finishes for aluminum?", message: "Which finishes are available for aluminum frames?" });
  }
  if (t.includes("price") || t.includes("cost") || t.includes("quote") || t.includes("budget")) {
    followUps.push({ label: "Visit a showroom", message: "Where are your showrooms?" });
    followUps.push({ label: "What's the warranty?", message: "What warranty do you offer?" });
  }
  if (t.includes("warranty") || t.includes("10-year") || t.includes("10 year")) {
    followUps.push({ label: "What does the warranty cover?", message: "What exactly does the 10-year warranty cover?" });
    followUps.push({ label: "Contact sales", message: "How can I contact your sales team?" });
  }
  if (t.includes("branch") || t.includes("showroom") || t.includes("office") || t.includes("cebu") || t.includes("alabang") || t.includes("ortigas")) {
    followUps.push({ label: "Get directions", message: "Give me the full address of your nearest branch" });
    followUps.push({ label: "Call sales", message: "What's your sales phone number?" });
  }
  if (t.includes("fire retardant") || t.includes("corrosion") || t.includes("thermal") || t.includes("sound insulation") || t.includes("weather")) {
    followUps.push({ label: "uPVC vs aluminum?", message: "What's the difference between your uPVC and aluminum options?" });
    followUps.push({ label: "See all 7 advantages", message: "What are all 7 FourlinQ advantages?" });
  }
  if (t.includes("design tool") || t.includes("configurator") || t.includes("customize")) {
    followUps.push({ label: "What products can I configure?", message: "What window and door types can I configure?" });
    followUps.push({ label: "What glass options?", message: "What glass types are available?" });
  }
  if (t.includes("0925-848-8888") || t.includes("sales@fourlinq")) {
    followUps.push({ label: "Where are you located?", message: "Where are your branches located?" });
    followUps.push({ label: "What are your products?", message: "What window and door types do you offer?" });
  }
  if (followUps.length === 0 && messageCount <= 2) {
    followUps.push({ label: "What products do you offer?", message: "What window and door types do you offer?" });
    followUps.push({ label: "Why choose uPVC?", message: "Why should I choose uPVC windows?" });
    followUps.push({ label: "Where are your branches?", message: "Where are your branches located?" });
  }

  const seen = new Set<string>();
  return followUps.filter((f) => {
    if (seen.has(f.label)) return false;
    seen.add(f.label);
    return true;
  }).slice(0, 3);
}

const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

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
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      let accumulatedText = "";
      for await (const chunk of streamChat(text.trim())) {
        accumulatedText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulatedText };
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
    <div className="fixed bottom-24 right-6 z-[60] w-[400px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-140px)] flex flex-col overflow-hidden bg-white shadow-depth-8 border border-[color:var(--rule-soft)] animate-in slide-in-from-bottom-4 fade-in duration-300 ease-marvin rounded-sm">
      {/* Accent stripe */}
      <div className="h-[3px] bg-[color:var(--accent)] shrink-0" />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-[color:var(--rule-soft)] bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[color:var(--ink-primary)] text-white flex items-center justify-center font-serif text-[15px] leading-none">
            L
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-[color:var(--ink-primary)]">LinQ</p>
            <p className="text-[10px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)] mt-0.5">FourlinQ Assistant</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin p-1 -mr-1"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[color:var(--canvas-soft)]">
        {messages.length === 0 && (
          <div className="px-1 pt-2">
            <p className="text-[14px] font-semibold text-[color:var(--ink-primary)] mb-1">
              Hi, I'm LinQ
            </p>
            <p className="text-[12.5px] text-[color:var(--ink-secondary)] leading-relaxed mb-4">
              Your FourlinQ product specialist. Ask anything about our windows, doors, or uPVC systems.
            </p>
            <p className="text-[10px] tracking-[0.1em] uppercase text-[color:var(--ink-muted)] font-medium mb-2">
              Try asking
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[12px] px-3 py-1.5 bg-white border border-[color:var(--rule-soft)] text-[color:var(--ink-secondary)] hover:border-[color:var(--ink-primary)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin rounded-full"
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
      <form onSubmit={handleSubmit} className="px-3 py-3 shrink-0 border-t border-[color:var(--rule-soft)] bg-white">
        <div className="flex items-center gap-2 bg-[color:var(--canvas-soft)] border border-[color:var(--rule-soft)] focus-within:border-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin pl-3.5 pr-1.5 py-1 rounded-full">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our systems..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-[13px] text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] disabled:opacity-50 py-1.5"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-full bg-[color:var(--accent)] text-white flex items-center justify-center hover:bg-[color:var(--accent-hover)] transition-colors duration-300 ease-marvin disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            aria-label="Send"
          >
            {isStreaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;

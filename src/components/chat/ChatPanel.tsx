import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
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

const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Add placeholder for assistant response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionToken,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let accumulatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.sessionToken) {
                setSessionToken(data.sessionToken);
              }
              if (data.chunk) {
                accumulatedText += data.chunk;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: accumulatedText,
                  };
                  return updated;
                });
              }
            } catch {
              // skip malformed JSON lines
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again or contact us at +63 2 8123 4567.",
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
    <div className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="bg-primary px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-bold text-sm">
            Q
          </div>
          <div>
            <p className="text-primary-foreground font-semibold text-sm">LinQ</p>
            <p className="text-primary-foreground/60 text-[11px]">FourlinQ Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold text-xl">Q</span>
            </div>
            <p className="text-sm font-medium text-primary mb-1">Hi! I'm LinQ 👋</p>
            <p className="text-xs text-muted-foreground mb-4">
              Your FourlinQ product specialist. Ask me anything about our windows, doors, or uPVC systems.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 text-xs bg-primary/5 border border-primary/15 rounded-full text-primary hover:bg-primary/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our products..."
            disabled={isStreaming}
            className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-primary outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;

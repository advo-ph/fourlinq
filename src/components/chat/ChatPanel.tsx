import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, ImagePlus } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { streamChat, resetChat } from "@/lib/gemini-chat";
import { useDialogFocus } from "@/hooks/useDialogFocus";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string;
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB cap (base64 inflates ~33%)

interface FollowUp {
  label: string;
  message: string;
  href?: string;
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
    followUps.push({ label: "Open the Design Tool →", message: "", href: "/design-tool" });
    if (!t.includes("finish")) followUps.push({ label: "What finishes are available?", message: "What finishes are available?" });
    followUps.push({ label: "Request a quote", message: "How can I request a quote?" });
  }
  if (t.includes("finish") || t.includes("laminate") || t.includes("wood grain") || t.includes("oak") || t.includes("walnut")) {
    if (!followUps.some((f) => f.label.includes("Design Tool")))
      followUps.push({ label: "Open the Design Tool →", message: "", href: "/design-tool" });
    followUps.push({ label: "Which finishes for aluminium?", message: "Which finishes are available for aluminium frames?" });
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
    followUps.push({ label: "uPVC vs aluminium?", message: "What's the difference between your uPVC and aluminium options?" });
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

const STORAGE_KEY = "flq.chat.messages.v1";

function loadPersistedMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Message[];
  } catch { /* ignore */ }
  return [];
}

const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(loadPersistedMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    // Persist chat history across page navigations (survives the unmount/remount
    // cycle when users browse to another route with the panel closed).
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* quota */ }
  }, [messages]);
  const handleClose = () => {
    // Closing the panel no longer wipes history — user can scroll back when
    // they reopen. Use the explicit "Reset" button to clear.
    setPendingImage(null);
    setImageError(null);
    onClose();
  };
  const dialogRef = useDialogFocus<HTMLDivElement>({ isOpen, onClose: handleClose, initialFocusRef: inputRef });

  const handleReset = () => {
    resetChat();
    setMessages([]);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setPendingImage(null);
    setImageError(null);
  };

  const handleFilePick = (file: File | null) => {
    setImageError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Please pick an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be under 4 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPendingImage(reader.result);
    };
    reader.onerror = () => setImageError("Could not read image.");
    reader.readAsDataURL(file);
  };

  const sendMessage = async (text: string, imageOverride?: string | null) => {
    const image = imageOverride !== undefined ? imageOverride : pendingImage;
    const trimmed = text.trim();
    // Allow image-only sends with a default prompt so the model has something to answer.
    const effective = trimmed || (image ? "What window system and finish would you recommend for this?" : "");
    if (!effective || isStreaming) return;

    const userMessage: Message = { role: "user", content: effective, imageDataUrl: image ?? undefined };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingImage(null);
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      let accumulatedText = "";
      for await (const chunk of streamChat(effective, image ?? undefined)) {
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

  const canSend = (input.trim().length > 0 || pendingImage !== null) && !isStreaming;

  if (!isOpen) return null;

  return (
    <div
      id="linq-dialog"
      ref={dialogRef}
      /* max-w mirrors the right-6 (24px) anchor on BOTH sides — on phones the
         panel sits centered with equal 24px margins instead of hugging the left
         edge (client comment: width should match the right-side margin). */
      className="fixed bottom-24 right-6 z-[60] w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(var(--fq-svh)-140px)] flex flex-col overflow-hidden bg-white shadow-depth-8 border border-[color:var(--rule-soft)] animate-in slide-in-from-bottom-4 fade-in duration-300 ease-marvin rounded-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="linq-dialog-title"
      tabIndex={-1}
    >
      {/* Accent stripe */}
      <div className="h-[3px] bg-[color:var(--accent)] shrink-0" />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-[color:var(--rule-soft)] bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[color:var(--ink-primary)] text-white flex items-center justify-center font-serif text-[15px] leading-none">
            L
          </div>
          <div className="leading-tight">
            <p id="linq-dialog-title" className="text-[13px] font-semibold text-[color:var(--ink-primary)]">LinQ</p>
            <p className="text-[10px] tracking-[0.08em] uppercase text-[color:var(--ink-muted)] mt-0.5">FourlinQ Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="text-[10px] uppercase tracking-wider text-[color:var(--ink-muted)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin px-2 py-1"
              aria-label="Reset chat"
              title="Start a new conversation"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin p-1 -mr-1"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[color:var(--canvas-soft)]" role="log" aria-live="polite" aria-label="Conversation with LinQ">
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
                  className="text-[12px] px-3 py-1.5 bg-white border border-[color:var(--rule-strong)] text-[color:var(--ink-primary)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin rounded-full"
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
              imageDataUrl={msg.imageDataUrl}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
              followUps={followUps}
              onFollowUp={(m) => sendMessage(m)}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-3 py-3 shrink-0 border-t border-[color:var(--rule-soft)] bg-white">
        {pendingImage && (
          <div className="mb-2 flex items-center gap-2">
            <div className="relative">
              <img
                src={pendingImage}
                alt="Preview"
                className="h-14 w-14 rounded-md object-cover border border-[color:var(--rule-soft)]"
              />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                aria-label="Remove image"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[color:var(--ink-primary)] text-white flex items-center justify-center shadow"
              >
                <X size={11} />
              </button>
            </div>
            <p className="text-[11px] text-[color:var(--ink-muted)] leading-tight">
              Photo attached. LinQ will suggest a window type + finish.
            </p>
          </div>
        )}
        {imageError && (
          <p className="mb-2 text-[11px] text-red-600">{imageError}</p>
        )}
        <div className="flex items-center gap-2 bg-[color:var(--canvas-soft)] border border-[color:var(--rule-soft)] focus-within:border-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin pl-1.5 pr-1.5 py-1 rounded-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => { handleFilePick(e.target.files?.[0] ?? null); e.target.value = ""; }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || pendingImage !== null}
            className="w-8 h-8 rounded-full text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)] flex items-center justify-center transition-colors duration-300 ease-marvin disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            aria-label="Attach photo"
            title="Attach a photo of your wall or room"
          >
            <ImagePlus size={16} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={pendingImage ? "Add a note (optional)…" : "Ask about our systems…"}
            aria-label="Message LinQ"
            disabled={isStreaming}
            className="flex-1 bg-transparent text-[13px] text-[color:var(--ink-primary)] outline-none placeholder:text-[color:var(--ink-faint)] disabled:opacity-50 py-1.5"
          />
          <button
            type="submit"
            disabled={!canSend}
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

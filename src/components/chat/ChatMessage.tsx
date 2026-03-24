import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Phone, Mail, MapPin, Globe, ArrowRight } from "lucide-react";

interface ActionItem {
  type: "phone" | "email" | "address" | "website";
  label: string;
  value: string;
  href: string;
}

interface FollowUp {
  label: string;
  message: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  followUps?: FollowUp[];
  onFollowUp?: (message: string) => void;
}

// ── Action extraction (regex from response text) ──

const PHONE_RE = /(?:(?:\+63|0)\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}|\(\d{2,3}\)\s?\d{3,4}[-\s]?\d{4})/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const ADDRESS_RE = /#?\d+[A-Za-z]?\s+[\w\s.,]+(?:St\.|Street|Ave\.|Avenue|Rd\.|Road|Blvd|Drive|Highway)[^.]*(?:,\s*[\w\s]+(?:City|Metro Manila|Cebu|Manila|Pasig|Muntinlupa|Mandaue))?/gi;

function extractActions(text: string): ActionItem[] {
  const actions: ActionItem[] = [];
  const seen = new Set<string>();

  // Phones
  const phones = text.match(PHONE_RE) || [];
  for (const p of phones) {
    const clean = p.replace(/[\s-]/g, "");
    if (seen.has(clean)) continue;
    seen.add(clean);
    actions.push({
      type: "phone",
      label: p.trim(),
      value: clean,
      href: `tel:${clean}`,
    });
  }

  // Emails
  const emails = text.match(EMAIL_RE) || [];
  for (const e of emails) {
    if (seen.has(e)) continue;
    seen.add(e);
    actions.push({
      type: "email",
      label: e,
      value: e,
      href: `mailto:${e}`,
    });
  }

  // Addresses (limit 2)
  const addrs = text.match(ADDRESS_RE) || [];
  for (const a of addrs.slice(0, 2)) {
    const trimmed = a.trim();
    if (seen.has(trimmed) || trimmed.length < 15) continue;
    seen.add(trimmed);
    actions.push({
      type: "address",
      label: trimmed.length > 60 ? trimmed.slice(0, 57) + "..." : trimmed,
      value: trimmed,
      href: `https://maps.google.com/?q=${encodeURIComponent(trimmed)}`,
    });
  }

  return actions.slice(0, 6);
}

const ACTION_ICONS = {
  phone: Phone,
  email: Mail,
  address: MapPin,
  website: Globe,
};

const ACTION_LABELS = {
  phone: "Call",
  email: "Email",
  address: "Directions",
  website: "Visit",
};

const ACTION_COLORS = {
  phone: "hover:bg-green-500/20 hover:border-green-500/30",
  email: "hover:bg-orange-500/20 hover:border-orange-500/30",
  address: "hover:bg-blue-500/20 hover:border-blue-500/30",
  website: "hover:bg-purple-500/20 hover:border-purple-500/30",
};

// ── Component ──

const ChatMessage = memo(({ role, content, isStreaming, followUps, onFollowUp }: ChatMessageProps) => {
  const isUser = role === "user";
  const actions = useMemo(() => (isUser ? [] : extractActions(content)), [content, isUser]);
  const showActions = !isStreaming && actions.length > 0;
  const showFollowUps = !isStreaming && followUps && followUps.length > 0;

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-red-600 text-white rounded-br-md"
            : "bg-white/10 text-white/90 border border-white/10 rounded-bl-md"
        }`}
      >
        {content ? (
          <div className="chat-markdown">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                a: ({ href, children }) => (
                  <a href={href} className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className="bg-primary/10 rounded px-1 py-0.5 text-xs">{children}</code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-current/40 ml-0.5 animate-pulse" />
            )}
          </div>
        ) : (
          isStreaming && (
            <span className="inline-flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </span>
          )
        )}

        {/* Action Cards */}
        {showActions && (
          <div className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-col gap-1.5">
            {actions.map((a, i) => {
              const Icon = ACTION_ICONS[a.type];
              return (
                <a
                  key={i}
                  href={a.href}
                  target={a.type === "address" ? "_blank" : undefined}
                  rel={a.type === "address" ? "noopener noreferrer" : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 transition-all ${ACTION_COLORS[a.type]}`}
                >
                  <Icon size={14} className="shrink-0 opacity-60" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider opacity-40 block leading-none mb-0.5">
                      {ACTION_LABELS[a.type]}
                    </span>
                    <span className="text-xs truncate block">{a.label}</span>
                  </div>
                  <ArrowRight size={12} className="shrink-0 opacity-30" />
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Follow-up Buttons */}
      {showFollowUps && (
        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
          {followUps!.map((f, i) => (
            <button
              key={i}
              onClick={() => onFollowUp?.(f.message)}
              className="px-3 py-1.5 text-[11px] bg-white/5 border border-white/10 rounded-full text-white/60 hover:bg-red-600/20 hover:border-red-500/30 hover:text-white transition-all"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;

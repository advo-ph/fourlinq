import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Phone, Mail, MapPin, ArrowUpRight, ExternalLink } from "lucide-react";

interface ActionItem {
  type: "phone" | "email" | "address" | "page";
  label: string;
  value: string;
  href: string;
  /** Page actions get a friendly title. */
  pageTitle?: string;
}

// Known internal routes — used both for label-friendliness and to allow link
// extraction even when the model writes "the Design Tool" without the path.
const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/products": "Products",
  "/window-systems": "Window Systems",
  "/door-systems": "Door Systems",
  "/specialist-systems": "Specialist Systems",
  "/why-upvc": "Why uPVC",
  "/finishes": "Finishes",
  "/how-to-choose": "How to Choose",
  "/faq": "FAQ",
  "/for-architects": "For Architects",
  "/whats-new": "What's New",
  "/brand": "Brand",
  "/inspiration": "Inspiration",
  "/care": "Care & Maintenance",
  "/warranty": "Warranty",
  "/design-tool": "Design Tool",
};

// Match either bare paths (/finishes, /projects/foo) or markdown links to them
const INTERNAL_PATH_RE = /(?:^|[\s(])(\/(?:design-tool|finishes|products|whats-new|inspiration|projects\/[a-z0-9-]+|window-systems|door-systems|specialist-systems|why-upvc|how-to-choose|faq|for-architects|brand|care|warranty)(?![a-zA-Z0-9_/-]))/g;

interface FollowUp {
  label: string;
  message: string;
  href?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string;
  isStreaming?: boolean;
  followUps?: FollowUp[];
  onFollowUp?: (message: string) => void;
}

const PHONE_RE = /(?:(?:\+63|0)\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}|\(\d{2,3}\)\s?\d{3,4}[-\s]?\d{4})/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const ADDRESS_RE = /#?\d+[A-Za-z]?\s+[\w\s.,]+(?:St\.|Street|Ave\.|Avenue|Rd\.|Road|Blvd|Drive|Highway)[^.]*(?:,\s*[\w\s]+(?:City|Metro Manila|Cebu|Manila|Pasig|Muntinlupa|Mandaue))?/gi;

function extractActions(text: string): ActionItem[] {
  const actions: ActionItem[] = [];
  const seen = new Set<string>();

  for (const p of text.match(PHONE_RE) || []) {
    const clean = p.replace(/[\s-]/g, "");
    if (seen.has(clean)) continue;
    seen.add(clean);
    actions.push({ type: "phone", label: p.trim(), value: clean, href: `tel:${clean}` });
  }
  for (const e of text.match(EMAIL_RE) || []) {
    if (seen.has(e)) continue;
    seen.add(e);
    actions.push({ type: "email", label: e, value: e, href: `mailto:${e}` });
  }
  for (const a of (text.match(ADDRESS_RE) || []).slice(0, 2)) {
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
  // Internal pages — turn any `/path` reference into a "Visit page" chip.
  for (const match of text.matchAll(INTERNAL_PATH_RE)) {
    const path = match[1];
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const title = PAGE_TITLES[path] ?? path.replace(/^\//, "").split("/")[0]
      .split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    actions.push({
      type: "page",
      label: title,
      value: path,
      href: path,
      pageTitle: title,
    });
  }

  return actions.slice(0, 5);
}

const ACTION_ICONS = { phone: Phone, email: Mail, address: MapPin, page: ExternalLink };
const ACTION_LABELS = { phone: "Call", email: "Email", address: "Directions", page: "Visit page" };

const ChatMessage = memo(({ role, content, imageDataUrl, isStreaming, followUps, onFollowUp }: ChatMessageProps) => {
  const isUser = role === "user";
  const actions = useMemo(() => (isUser ? [] : extractActions(content)), [content, isUser]);
  const showActions = !isStreaming && actions.length > 0;
  const showFollowUps = !isStreaming && followUps && followUps.length > 0;

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
          isUser
            ? "bg-[color:var(--accent)] text-white rounded-br-sm"
            : "bg-white text-[color:var(--ink-primary)] border border-[color:var(--rule-soft)] rounded-bl-sm shadow-depth-2"
        }`}
      >
        {imageDataUrl && (
          <img
            src={imageDataUrl}
            alt="Uploaded by user"
            className="mb-2 max-h-40 rounded-lg object-cover"
          />
        )}
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
                  <a href={href} className={`underline underline-offset-2 hover:opacity-80 ${isUser ? "" : "hover:text-[color:var(--accent)]"}`} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                code: ({ children }) => (
                  <code className={`px-1 py-0.5 text-[12px] rounded ${isUser ? "bg-white/15" : "bg-black/5"}`}>{children}</code>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-3.5 bg-current/40 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
        ) : (
          isStreaming && (
            <span className="inline-flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--ink-muted)] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--ink-muted)] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--ink-muted)] animate-bounce [animation-delay:300ms]" />
            </span>
          )
        )}

        {/* Action chips */}
        {showActions && (
          <div className="mt-3 pt-3 border-t border-[color:var(--rule-soft)] flex flex-col gap-1.5">
            {actions.map((a, i) => {
              const Icon = ACTION_ICONS[a.type];
              const chipBody = (
                <>
                  <Icon size={13} className="shrink-0 text-[color:var(--ink-muted)]" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--ink-muted)] block leading-none mb-0.5">
                      {ACTION_LABELS[a.type]}
                    </span>
                    <span className="text-[12px] truncate block text-[color:var(--ink-primary)]">{a.label}</span>
                  </div>
                  <ArrowUpRight size={12} className="shrink-0 text-[color:var(--ink-muted)] group-hover:text-[color:var(--ink-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ease-marvin" />
                </>
              );
              const chipCls = "group flex items-center gap-2.5 px-2.5 py-2 border border-[color:var(--rule-soft)] bg-[color:var(--canvas-soft)] hover:border-[color:var(--ink-primary)] transition-colors duration-300 ease-marvin rounded-lg";
              if (a.type === "page") {
                return (
                  <Link key={i} to={a.href} className={chipCls}>
                    {chipBody}
                  </Link>
                );
              }
              return (
                <a
                  key={i}
                  href={a.href}
                  target={a.type === "address" ? "_blank" : undefined}
                  rel={a.type === "address" ? "noopener noreferrer" : undefined}
                  className={chipCls}
                >
                  {chipBody}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Follow-up Buttons */}
      {showFollowUps && (
        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
          {followUps!.map((f, i) => {
            const cls = "px-3 py-1.5 text-[11px] bg-white border border-[color:var(--rule-strong)] text-[color:var(--ink-primary)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors duration-300 ease-marvin rounded-full";
            if (f.href) {
              return (
                <Link key={i} to={f.href} className={cls}>
                  {f.label}
                </Link>
              );
            }
            return (
              <button key={i} onClick={() => onFollowUp?.(f.message)} className={cls}>
                {f.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;

import { useState, useEffect, useCallback, useRef } from "react";
import { Phone, Mail, Calendar, Tag, RefreshCw, MessageSquare, Send, X, Loader2, ChevronRight } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Link } from "react-router-dom";

// ─── Types ───────────────────────────────────────

interface Inquiry {
  id: number;
  type: string;
  ref_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  product_id: string | null;
  product_name: string | null;
  config: Record<string, unknown> | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface CountRow { type: string; status: string; count: number }
interface ChatMsg { role: "user" | "model"; parts: [{ text: string }] }

// ─── Constants ───────────────────────────────────

const statusColors: Record<string, string> = {
  new: "bg-accent/10 text-accent",
  contacted: "bg-yellow-500/10 text-yellow-700",
  quoted: "bg-purple-500/10 text-purple-700",
  won: "bg-green-500/10 text-green-700",
  lost: "bg-foreground/5 text-muted-foreground",
};

const typeLabels: Record<string, string> = {
  contact: "Contact",
  quote: "Quote",
  configuration: "Config",
};

// ─── Admin Chat ──────────────────────────────────

const AdminChat = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: ChatMsg[] = [...messages, { role: "user", parts: [{ text: userMsg }] }];
    setMessages([...newMessages, { role: "model", parts: [{ text: "" }] }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/admin/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulated += data.chunk;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "model", parts: [{ text: accumulated }] };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "model", parts: [{ text: "Failed to connect. Check the server." }] };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-surface rounded-xl border border-border shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-accent" />
          <span className="text-sm font-medium text-white">LinQ Admin</span>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white"><X size={16} /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Ask about leads, stats, clients, or products.</p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-4">
              {["How many leads today?", "Show stale leads", "Top requested products", "Company branches"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-[10px] px-2.5 py-1 bg-muted rounded-full text-muted-foreground hover:text-primary hover:bg-border transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] text-sm leading-relaxed rounded-lg px-3 py-2 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text || (streaming && i === messages.length - 1 ? "..." : "")}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about leads, stats..."
            className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none border border-border focus:border-primary"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-accent text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main Admin Page ─────────────────────────────

const Admin = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState<CountRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("type", filter);
      params.set("limit", "100");
      const res = await fetch(`/api/admin/inquiries?${params}`);
      const data = await res.json();
      setInquiries(data.inquiries || []);
      setCounts(data.counts || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  const totalNew = counts.filter((c) => c.status === "new").reduce((s, c) => s + c.count, 0);
  const totalQuotes = counts.filter((c) => c.type === "quote").reduce((s, c) => s + c.count, 0);
  const totalContacts = counts.filter((c) => c.type === "contact").reduce((s, c) => s + c.count, 0);
  const totalConfigs = counts.filter((c) => c.type === "configuration").reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-[#0a0a0a] h-16 flex items-center px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/"><Logo variant="light" className="h-8" /></Link>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-sm font-medium text-white/70">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="flex items-center gap-1.5 text-[11px] text-white/50 hover:text-white uppercase tracking-wider transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
            <Link to="/" className="text-[11px] text-white/50 hover:text-white uppercase tracking-wider transition-colors">
              View Site
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "New Leads", value: totalNew, accent: true },
            { label: "Quote Requests", value: totalQuotes },
            { label: "Contact Messages", value: totalContacts },
            { label: "Saved Configs", value: totalConfigs },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-3xl font-semibold ${stat.accent ? "text-accent" : "text-foreground"}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { label: "All", value: "all" },
            { label: "Contacts", value: "contact" },
            { label: "Quotes", value: "quote" },
            { label: "Configs", value: "configuration" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground text-sm">Loading...</div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-sm mb-2">No inquiries yet</p>
                <p className="text-xs text-muted-foreground/60">Leads from the contact form, quote requests, and design tool will appear here.</p>
              </div>
            ) : (
              inquiries.map((inq) => (
                <button
                  key={inq.id}
                  onClick={() => setSelected(inq)}
                  className={`w-full text-left bg-card rounded-lg border p-4 hover:shadow-sm transition-all ${
                    selected?.id === inq.id ? "border-primary shadow-sm" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[inq.status] || "bg-muted text-muted-foreground"}`}>
                          {inq.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{inq.ref_id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{typeLabels[inq.type] || inq.type}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{inq.name || "(anonymous)"}</p>
                      <p className="text-xs text-muted-foreground truncate">{inq.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(inq.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                      </p>
                      <ChevronRight size={14} className="text-muted-foreground/40" />
                    </div>
                  </div>
                  {inq.message && <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{inq.message}</p>}
                  {inq.product_name && <p className="text-xs text-muted-foreground mt-1">Product: <span className="font-medium text-foreground">{inq.product_name}</span></p>}
                </button>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="bg-card rounded-lg border border-border sticky top-24">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{selected.ref_id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{selected.name || "(anonymous)"}</h3>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Contact */}
                  <div className="space-y-2">
                    {selected.email && (
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors">
                        <Mail size={14} /> {selected.email}
                      </a>
                    )}
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors">
                        <Phone size={14} /> {selected.phone}
                      </a>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar size={14} /> {new Date(selected.created_at).toLocaleString("en-PH")}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag size={14} /> {typeLabels[selected.type] || selected.type}
                    </div>
                  </div>

                  {/* Product */}
                  {selected.product_name && (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Product</p>
                      <p className="text-sm font-medium text-foreground">{selected.product_name}</p>
                    </div>
                  )}

                  {/* Config */}
                  {selected.config && (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Configuration</p>
                      <div className="text-xs space-y-1">
                        {Object.entries(selected.config).map(([k, v]) =>
                          v ? (
                            <div key={k} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{k}</span>
                              <span className="font-medium text-foreground">{String(v)}</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message / Notes */}
                  {(selected.message || selected.notes) && (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        {selected.message ? "Message" : "Notes"}
                      </p>
                      <p className="text-xs text-foreground whitespace-pre-wrap">{selected.message || selected.notes}</p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["new", "contacted", "quoted", "won", "lost"].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected.id, s)}
                          className={`text-[10px] font-medium px-3 py-1.5 rounded-full transition-colors ${
                            selected.status === s
                              ? statusColors[s]
                              : "bg-muted text-muted-foreground hover:bg-border"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground text-sm">Select an inquiry to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center z-40"
      >
        {chatOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Chat Panel */}
      <AdminChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Admin;

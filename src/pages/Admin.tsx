import { useState, useEffect, useCallback } from "react";
import { Phone, Mail, User, Calendar, Tag, ChevronDown, RefreshCw, Settings2 } from "lucide-react";

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

interface CountRow {
  type: string;
  status: string;
  count: number;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const typeLabels: Record<string, string> = {
  contact: "Contact",
  quote: "Quote Request",
  configuration: "Design Tool Config",
};

const Admin = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [counts, setCounts] = useState<CountRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);

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
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const totalNew = counts.filter((c) => c.status === "new").reduce((s, c) => s + c.count, 0);
  const totalAll = counts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">FourlinQ Admin</h1>
            <p className="text-xs text-neutral-500">{totalNew} new leads · {totalAll} total</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
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
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filter === f.value
                  ? "bg-neutral-900 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-2">
            {loading ? (
              <div className="text-center py-20 text-neutral-400 text-sm">Loading...</div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-20 text-neutral-400 text-sm">No inquiries yet</div>
            ) : (
              inquiries.map((inq) => (
                <button
                  key={inq.id}
                  onClick={() => setSelected(inq)}
                  className={`w-full text-left bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow ${
                    selected?.id === inq.id ? "border-neutral-900 shadow-sm" : "border-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[inq.status] || "bg-neutral-100 text-neutral-600"}`}>
                          {inq.status}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">{inq.ref_id}</span>
                      </div>
                      <p className="text-sm font-medium text-neutral-900 truncate">{inq.name || "(anonymous)"}</p>
                      <p className="text-xs text-neutral-500 truncate">{inq.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-400">{typeLabels[inq.type] || inq.type}</p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {new Date(inq.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {inq.message && <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{inq.message}</p>}
                  {inq.product_name && <p className="text-xs text-neutral-500 mt-1">Product: <span className="font-medium">{inq.product_name}</span></p>}
                </button>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="bg-white rounded-lg border border-neutral-200 p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-neutral-400">{selected.ref_id}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>

                <h3 className="font-semibold text-neutral-900 mb-3">{selected.name || "(anonymous)"}</h3>

                <div className="space-y-2 mb-4">
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-xs text-neutral-600 hover:text-blue-600">
                      <Mail size={14} /> {selected.email}
                    </a>
                  )}
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-xs text-neutral-600 hover:text-blue-600">
                      <Phone size={14} /> {selected.phone}
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Calendar size={14} /> {new Date(selected.created_at).toLocaleString("en-PH")}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Tag size={14} /> {typeLabels[selected.type] || selected.type}
                  </div>
                </div>

                {selected.product_name && (
                  <div className="bg-neutral-50 rounded-md p-3 mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Product</p>
                    <p className="text-sm font-medium text-neutral-900">{selected.product_name}</p>
                  </div>
                )}

                {selected.config && (
                  <div className="bg-neutral-50 rounded-md p-3 mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Configuration</p>
                    <div className="text-xs text-neutral-700 space-y-1">
                      {Object.entries(selected.config).map(([k, v]) =>
                        v ? <div key={k} className="flex justify-between"><span className="text-neutral-500 capitalize">{k}</span><span className="font-medium">{String(v)}</span></div> : null
                      )}
                    </div>
                  </div>
                )}

                {(selected.message || selected.notes) && (
                  <div className="bg-neutral-50 rounded-md p-3 mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{selected.message ? "Message" : "Notes"}</p>
                    <p className="text-xs text-neutral-700 whitespace-pre-wrap">{selected.message || selected.notes}</p>
                  </div>
                )}

                {/* Status Actions */}
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {["new", "contacted", "quoted", "won", "lost"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                        selected.status === s
                          ? statusColors[s]
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
                Select an inquiry to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

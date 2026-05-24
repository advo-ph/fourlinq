/**
 * Admin-only Users + Audit Log panel. Lives under the /admin "Settings" tab.
 * Talks to /api/admin/users (CRUD + audit-log readback).
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, X, ShieldCheck, History } from "lucide-react";

interface UserRow {
  profile_id: number;
  auth_user_id: number;
  email: string;
  user_active: boolean;
  profile_active: boolean;
  last_login_at: string | null;
  last_seen_at: string | null;
  first_name: string;
  last_name: string;
  role: string;
  role_label: string;
  created_at: string;
}
interface RoleRow { role_id: number; name: string; label: string }
interface AuditRow {
  cms_audit_log_id: number;
  actor_email: string | null;
  action: string;
  entity_kind: string;
  entity_id: string | null;
  summary: string | null;
  ip_address: string | null;
  created_at: string;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/users${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

const inputCls = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none";

export default function UsersPanel() {
  const [sub, setSub] = useState<"users" | "audit">("users");
  return (
    <div>
      <div className="flex gap-2 mb-6">
        {[
          { id: "users", label: "Team", icon: <ShieldCheck size={13} /> },
          { id: "audit", label: "Audit log", icon: <History size={13} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id as typeof sub)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs uppercase tracking-wider transition-colors ${
              sub === t.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {sub === "users" ? <UserList /> : <AuditList />}
    </div>
  );
}

function UserList() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<UserRow> & { password?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([api<{ items: UserRow[] }>("/users"), api<{ items: RoleRow[] }>("/roles")]);
      setUsers(u.items); setRoles(r.items);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.profile_id) {
        await api(`/users/${editing.profile_id}`, { method: "PUT", body: JSON.stringify({
          first_name: editing.first_name, last_name: editing.last_name,
          role: editing.role, is_active: editing.profile_active,
          ...(editing.password ? { password: editing.password } : {}),
        }) });
      } else {
        await api("/users", { method: "POST", body: JSON.stringify({
          email: editing.email, password: editing.password,
          first_name: editing.first_name, last_name: editing.last_name,
          role: editing.role,
        }) });
      }
      setEditing(null);
      await load();
    } catch (e) {
      alert(`Save failed: ${String(e)}`);
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!editing?.profile_id) return;
    if (!confirm("Deactivate this user? They keep their audit-log history.")) return;
    await api(`/users/${editing.profile_id}`, { method: "DELETE" });
    setEditing(null);
    await load();
  }

  if (loading) return <div className="py-16 text-center"><Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{users.length} team members</p>
        <button
          onClick={() => setEditing({ role: "editor", profile_active: true })}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} /> Invite teammate
        </button>
      </div>

      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.profile_id} onClick={() => setEditing({ ...u })}
              className="flex items-center gap-4 p-3 bg-card border border-border rounded-md hover:border-primary/30 cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium uppercase">
              {u.first_name[0]}{u.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{u.first_name} {u.last_name}</p>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded">{u.role_label}</span>
                {!u.profile_active && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-destructive/10 text-destructive rounded">inactive</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{u.email} · last seen {u.last_seen_at ? new Date(u.last_seen_at).toLocaleDateString() : "never"}</p>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card border border-border rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-sm font-medium">{editing.profile_id ? `Edit — ${editing.email}` : "Invite teammate"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">First name *</span>
                  <input className={inputCls} value={editing.first_name ?? ""} onChange={(e) => setEditing({ ...editing, first_name: e.target.value })} />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Last name *</span>
                  <input className={inputCls} value={editing.last_name ?? ""} onChange={(e) => setEditing({ ...editing, last_name: e.target.value })} />
                </label>
              </div>
              {!editing.profile_id && (
                <label className="block">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Email *</span>
                  <input type="email" className={inputCls} value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                </label>
              )}
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">{editing.profile_id ? "New password (leave blank to keep)" : "Password *"}</span>
                <input type="text" className={inputCls} value={editing.password ?? ""} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder={editing.profile_id ? "Leave blank to keep current" : "Min 8 chars"} />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Role *</span>
                <select className={inputCls} value={editing.role ?? "editor"} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                  {roles.map((r) => <option key={r.role_id} value={r.name}>{r.label} ({r.name})</option>)}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  <strong>admin</strong> — everything · <strong>editor</strong> — all content · <strong>media</strong> — uploads only
                </p>
              </label>
              {editing.profile_id && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.profile_active !== false} onChange={(e) => setEditing({ ...editing, profile_active: e.target.checked })} />
                  Account active
                </label>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 p-5 pt-0">
              <div>
                {editing.profile_id && (
                  <button onClick={remove} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} /> Deactivate
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(null)} className="text-xs px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">Cancel</button>
                <button onClick={save} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditList() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api<{ items: AuditRow[] }>("/audit-log").then((d) => setRows(d.items)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-16 text-center"><Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" /></div>;
  if (rows.length === 0) return <p className="text-sm text-muted-foreground py-12 text-center">No actions logged yet. Edit something in Content to populate this.</p>;

  return (
    <ul className="space-y-1 text-xs">
      {rows.map((r) => (
        <li key={r.cms_audit_log_id} className="flex items-center gap-3 px-3 py-2 bg-card border border-border/60 rounded-md">
          <span className="text-muted-foreground tabular-nums w-32">{new Date(r.created_at).toLocaleString()}</span>
          <span className="font-medium w-40 truncate">{r.actor_email ?? "—"}</span>
          <span className="uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-muted rounded">{r.action}</span>
          <span className="text-muted-foreground w-20 truncate">{r.entity_kind}{r.entity_id ? ` #${r.entity_id}` : ""}</span>
          <span className="flex-1 truncate text-foreground/80">{r.summary ?? ""}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Generic entity list + edit modal. Driven entirely by EntityDescriptor.
 * Consumers don't have to write per-entity React — they pass the descriptor
 * (which the backend exposes via /_entities) and this component generates
 * the list view and the form.
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, X, ExternalLink, Inbox } from "lucide-react";
import type { CmsRagApi, EntityDescriptor, EntityFieldDescriptor } from "./api.js";
import { MarkdownEditor } from "./MarkdownEditor.js";
import { MediaPicker } from "./MediaPicker.js";
import { FilePicker } from "./FilePicker.js";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function viewOnSiteHref(entityKind: string, row: Record<string, unknown>): string | null {
  const slug = row.slug ?? row.route;
  if (!slug) return null;
  const s = String(slug);
  if (entityKind === "pages") return s; // route is already absolute (/...)
  // map kind → public route prefix (consumer can override later)
  const prefixMap: Record<string, string> = {
    projects: "/projects",
    news: "/whats-new",
    products: "/products",
  };
  const prefix = prefixMap[entityKind];
  if (!prefix) return null;
  return `${prefix}/${s}`;
}

interface Props {
  api: CmsRagApi;
  entity: EntityDescriptor;
  /** Optional renderer for one row in the list (defaults to title + slug). */
  renderRow?: (row: Record<string, unknown>) => React.ReactNode;
}

const inputCls = "w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none";

function defaultFor(field: EntityFieldDescriptor): unknown {
  if (field.default !== undefined) return field.default;
  switch (field.type) {
    case "boolean": return false;
    case "number": return null;
    case "string_array": return [];
    case "json": return null;
    default: return "";
  }
}

function emptyRow(entity: EntityDescriptor): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const f of entity.fields) row[f.column] = defaultFor(f);
  return row;
}

export function EntityPanel({ api, entity, renderRow }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api.list<Record<string, unknown>>(entity.kind);
      setItems(rows);
    } finally { setLoading(false); }
  }, [api, entity.kind]);
  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const id = editing[entity.pk];
      if (id) {
        await api.update(entity.kind, id as number, editing);
      } else {
        await api.create(entity.kind, editing);
      }
      setEditing(null);
      await load();
    } catch (e) {
      alert(`Save failed: ${String(e)}`);
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!editing) return;
    const id = editing[entity.pk];
    if (!id) return;
    if (!confirm(`Delete this ${entity.label.toLowerCase()}? (soft-delete; recoverable from DB)`)) return;
    await api.remove(entity.kind, id as number);
    setEditing(null);
    await load();
  }

  if (loading) {
    return <div className="py-16 text-center"><Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{items.length} {entity.labelPlural.toLowerCase()}</p>
        <button
          onClick={() => setEditing(emptyRow(entity))}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} /> New {entity.label.toLowerCase()}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border rounded-lg">
          <Inbox size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium mb-1">No {entity.labelPlural.toLowerCase()} yet</p>
          <p className="text-xs text-muted-foreground mb-5">Click "New {entity.label.toLowerCase()}" above to create your first one.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((row, i) => {
            const href = viewOnSiteHref(entity.kind, row);
            return (
              <li
                key={String(row[entity.pk] ?? i)}
                className="flex items-center gap-4 p-3 bg-card border border-border rounded-md hover:border-primary/30"
              >
                <div className="flex-1 flex items-center gap-4 cursor-pointer min-w-0" onClick={() => setEditing({ ...row })}>
                  {renderRow ? renderRow(row) : <DefaultRow row={row} entity={entity} />}
                </div>
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary px-2 py-1 rounded transition-colors"
                    title="View on site"
                  >
                    <ExternalLink size={12} />
                    view
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <EditorModal
          title={editing[entity.pk] ? `Edit ${entity.label} — ${String(editing.title ?? editing.name ?? editing[entity.slugColumn ?? "slug"] ?? "")}` : `New ${entity.label.toLowerCase()}`}
          onClose={() => setEditing(null)}
        >
          <div className="grid grid-cols-2 gap-4">
            {entity.fields.map((f) => (
              <FieldEditor
                key={f.column}
                api={api}
                field={f}
                value={editing[f.column]}
                onChange={(v) => {
                  const next = { ...editing, [f.column]: v };
                  // Auto-fill slug from title/name when slug is empty and the user types a title.
                  // Only on create (no PK yet) and only if there's a slug-shaped field on this entity.
                  const isNew = !editing[entity.pk];
                  if (isNew && (f.column === "title" || f.column === "name")) {
                    const slugCol = entity.slugColumn ?? "slug";
                    const current = (editing[slugCol] as string) ?? "";
                    if (!current || current === slugify(String(editing[f.column] ?? ""))) {
                      next[slugCol] = slugify(String(v));
                    }
                  }
                  setEditing(next);
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-border">
            <div>
              {editing[entity.pk] ? (
                <button onClick={remove} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md text-destructive hover:bg-destructive/10">
                  <Trash2 size={14} /> Delete
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(null)} className="text-xs px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
              </button>
            </div>
          </div>
        </EditorModal>
      )}
    </div>
  );
}

function DefaultRow({ row, entity }: { row: Record<string, unknown>; entity: EntityDescriptor }) {
  const cover = (row.cover_path ?? row.thumbnail_url ?? row.hero_image_path ?? row.file_path) as string | undefined;
  const title = String(row.title ?? row.name ?? row.route ?? row[entity.slugColumn ?? "slug"] ?? "(untitled)");
  const sub = String(row.slug ?? row.location ?? row.category ?? row.route ?? "");
  const isPublished = row.is_published !== false;
  return (
    <>
      {cover && <img src={cover} alt="" className="h-12 w-16 object-cover rounded border border-border/40" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{title}</p>
          {!isPublished && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded">draft</span>}
        </div>
        {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
      </div>
    </>
  );
}

function FieldEditor({ api, field, value, onChange }: { api: CmsRagApi; field: EntityFieldDescriptor; value: unknown; onChange: (v: unknown) => void }) {
  const label = field.label ?? field.column;
  const wide = ["textarea", "markdown", "image", "file", "string_array"].includes(field.type) ? "col-span-2" : "";

  if (field.type === "boolean") {
    return (
      <label className={`col-span-2 flex items-center gap-2 text-sm`}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
    );
  }

  return (
    <label className={`block ${wide}`}>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">
        {label}{field.required ? " *" : ""}
      </span>
      {field.type === "text" && (
        <input className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.type === "textarea" && (
        <textarea rows={4} className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.type === "markdown" && (
        <MarkdownEditor value={(value as string) ?? ""} onChange={onChange} />
      )}
      {field.type === "number" && (
        <input
          type="number"
          className={inputCls}
          value={value === null || value === undefined ? "" : (value as number)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      )}
      {field.type === "select" && (
        <select className={inputCls} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">— select —</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
      {field.type === "string_array" && (
        <textarea
          rows={3}
          className={inputCls}
          placeholder="one per line, or comma-separated"
          value={Array.isArray(value) ? (value as string[]).join("\n") : ((value as string) ?? "")}
          onChange={(e) => onChange(e.target.value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean))}
        />
      )}
      {field.type === "image" && (
        <MediaPicker api={api} value={(value as string) ?? ""} onChange={onChange as (s: string) => void} />
      )}
      {field.type === "file" && (
        <FilePicker api={api} value={(value as string) ?? ""} onChange={onChange as (s: string) => void} />
      )}
      {field.type === "json" && (
        <textarea
          rows={4}
          className={inputCls + " font-mono"}
          value={value ? JSON.stringify(value, null, 2) : ""}
          onChange={(e) => {
            try { onChange(JSON.parse(e.target.value)); } catch { onChange(e.target.value); }
          }}
        />
      )}
    </label>
  );
}

function EditorModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="text-sm font-medium">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Media library — batch upload, grid view, inline alt-text editing.
 * Drop one or many images on the grid; each becomes a cms_media_asset row.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Upload, X, Save, Trash2 } from "lucide-react";
import type { CmsRagApi } from "./api.js";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ACCEPTED_IMAGE_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.gif,.avif";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const UPLOAD_HELP_TEXT = "JPEG, PNG, WebP, GIF, AVIF · up to 8 MB each · uploads run sequentially";

interface MediaRow {
  cms_media_asset_id: number;
  file_path: string;
  alt_text: string | null;
  tags: string[] | null;
  source: string | null;
  is_published: boolean;
  created_at: string;
}

export function MediaLibrary({ api }: { api: CmsRagApi }) {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [uploading, setUploading] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api.list<MediaRow>("media");
      setItems(rows);
    } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const onFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    const errors: string[] = [];
    const valid = arr.filter((f) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
        errors.push(`${f.name}: unsupported format. Use JPEG, PNG, WebP, GIF, or AVIF.`);
        return false;
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        errors.push(`${f.name}: ${(f.size / 1024 / 1024).toFixed(1)} MB exceeds the 8 MB limit.`);
        return false;
      }
      return true;
    });

    setUploadErrors(errors);
    if (valid.length === 0) return;

    setUploading(valid.length);
    try {
      // Upload sequentially to be polite to the server / DB.
      for (const f of valid) {
        try {
          await api.upload(f);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          errors.push(`${f.name}: ${message}`);
          setUploadErrors([...errors]);
        }
        setUploading((n) => n - 1);
      }
      await load();
    } finally {
      setUploading(0);
    }
  }, [api, load]);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (const item of e.clipboardData.items) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        onFiles(files);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFiles]);

  async function saveEditing() {
    if (!editing) return;
    await api.update("media", editing.cms_media_asset_id, {
      alt_text: editing.alt_text,
      tags: editing.tags ?? [],
      is_published: editing.is_published,
    });
    setEditing(null);
    await load();
  }

  async function removeEditing() {
    if (!editing) return;
    if (!confirm("Delete this image from the library? (soft-delete; the file stays on disk)")) return;
    await api.remove("media", editing.cms_media_asset_id);
    setEditing(null);
    await load();
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
        }}
        className={`mb-5 rounded-lg border-2 border-dashed px-5 py-4 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <div className="flex items-center gap-3">
          <Upload size={18} className="text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Drop images here, paste from clipboard, or click to browse</p>
            <p className="text-xs text-muted-foreground">{UPLOAD_HELP_TEXT}</p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Browse files
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) onFiles(e.target.files); }}
        />
        {uploading > 0 && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" /> Uploading {uploading} file{uploading !== 1 ? "s" : ""}…
          </p>
        )}
        {uploadErrors.length > 0 && (
          <div className="mt-3 space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            {uploadErrors.map((error) => (
              <p key={error} className="text-xs text-destructive">{error}</p>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={20} className="animate-spin mx-auto text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Library is empty. Drop a photo above to get started.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {items.map((m) => (
            <button
              key={m.cms_media_asset_id}
              onClick={() => setEditing(m)}
              className="group block text-left"
            >
              <div className={`aspect-square overflow-hidden rounded-md border bg-muted ${
                m.is_published ? "border-border/40" : "border-destructive/40 opacity-60"
              }`}>
                <img src={m.file_path} alt={m.alt_text ?? ""} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="mt-1.5 text-[11px] truncate text-muted-foreground">
                {m.alt_text || <span className="italic text-muted-foreground/60">no alt text</span>}
              </p>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card border border-border rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-sm font-medium">Edit media</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <img src={editing.file_path} alt="" className="max-h-64 mx-auto rounded-md border border-border/40" />
              <p className="text-[11px] text-muted-foreground break-all font-mono">{editing.file_path}</p>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Alt text (describe the photo for accessibility + search)</span>
                <input
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                  value={editing.alt_text ?? ""}
                  onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
                  placeholder="e.g. White uPVC casement window in Cebu home"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Tags (comma-separated)</span>
                <input
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                  value={(editing.tags ?? []).join(", ")}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
                Visible in picker
              </label>
            </div>
            <div className="flex items-center justify-between gap-2 p-5 pt-0">
              <button onClick={removeEditing} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md text-destructive hover:bg-destructive/10">
                <Trash2 size={14} /> Delete
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(null)} className="text-xs px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">Cancel</button>
                <button onClick={saveEditing} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save size={14} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

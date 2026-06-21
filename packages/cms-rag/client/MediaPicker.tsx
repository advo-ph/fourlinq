/**
 * Image picker: drop-zone uploader + URL input. Returns the public file_path
 * via onChange. Consumers store the path string in their row, not a media id.
 */
import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { CmsRagApi } from "./api.js";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ACCEPTED_IMAGE_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.gif,.avif";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface MediaPickerProps {
  api: CmsRagApi;
  value?: string | null;
  onChange: (filePath: string) => void;
  label?: string;
}

export function MediaPicker({ api, value, onChange, label }: MediaPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (file: File) => {
    setError(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Unsupported format. Use JPEG, PNG, WebP, GIF, or AVIF.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 8 MB limit.`);
      return;
    }
    setUploading(true);
    try {
      const result = await api.upload(file);
      onChange(result.file_path);
    } catch (e) {
      setError(String(e));
    } finally {
      setUploading(false);
    }
  }, [api, onChange]);

  return (
    <div>
      {label && <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block">{label}</span>}
      <div className="flex items-stretch gap-2">
        <div
          className="flex-1 flex items-center gap-3 border border-dashed border-border rounded-md p-2 hover:border-primary/40 transition-colors"
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onDrop(f);
          }}
        >
          {value ? (
            <>
              <img src={value} alt="" className="h-12 w-16 object-cover rounded border border-border/40" />
              <span className="text-xs text-muted-foreground truncate flex-1">{value}</span>
              <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
            </>
          ) : (
            <>
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drop JPEG, PNG, WebP, GIF, or AVIF under 8 MB, or</span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs underline text-primary hover:text-primary/80"
              >
                browse
              </button>
            </>
          )}
        </div>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/path/to/image.jpg"
          className="w-44 bg-background border border-border rounded-md px-2 py-1 text-xs font-mono outline-none focus:border-primary"
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_EXTENSIONS}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onDrop(f);
        }}
      />
      {uploading && <p className="text-[11px] text-muted-foreground mt-1">Uploading…</p>}
      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

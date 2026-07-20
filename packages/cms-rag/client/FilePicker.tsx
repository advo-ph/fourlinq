/**
 * Document picker: drop-zone uploader + URL input for non-image files
 * (PDF, CAD, BIM). Same contract as MediaPicker — returns the public
 * file_path via onChange — but posts to the consumer's docs upload mount
 * and previews as a filename, not an image. Validates by extension, not
 * mimetype: browsers report DWG/RFA as application/octet-stream.
 */
import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import type { CmsRagApi } from "./api.js";

const ACCEPTED_FILE_PATTERN = /\.(pdf|dwg|rfa|zip|doc|docx)$/i;
const ACCEPTED_FILE_EXTENSIONS = ".pdf,.dwg,.rfa,.zip,.doc,.docx";
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export interface FilePickerProps {
  api: CmsRagApi;
  value?: string | null;
  onChange: (filePath: string) => void;
  label?: string;
}

export function FilePicker({ api, value, onChange, label }: FilePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (file: File) => {
    setError(null);
    if (!ACCEPTED_FILE_PATTERN.test(file.name)) {
      setError("Unsupported format. Upload a PDF, DWG, RFA, ZIP, or DOC.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 50 MB limit.`);
      return;
    }
    setUploading(true);
    try {
      const result = await api.upload(file, undefined, "docs");
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
              <FileText size={20} className="text-muted-foreground shrink-0" />
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline truncate flex-1"
              >
                {value}
              </a>
              <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
            </>
          ) : (
            <>
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Drop a PDF, DWG, RFA, ZIP, or DOC under 50 MB, or</span>
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
          placeholder="/path/to/document.pdf"
          className="w-44 bg-background border border-border rounded-md px-2 py-1 text-xs font-mono outline-none focus:border-primary"
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_FILE_EXTENSIONS}
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

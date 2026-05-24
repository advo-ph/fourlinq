/**
 * Split-pane markdown editor: textarea on the left, live preview on the right.
 * Uses react-markdown (a peer dep — consumers install it).
 */
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 8, className }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  return (
    <div className={`border border-border rounded-md overflow-hidden ${className ?? ""}`}>
      <div className="flex items-center gap-1 bg-muted/40 border-b border-border px-2 py-1">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`text-[11px] uppercase tracking-wider px-2 py-1 rounded ${
            tab === "write" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`text-[11px] uppercase tracking-wider px-2 py-1 rounded ${
            tab === "preview" ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Preview
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground/70">markdown · **bold** · _italic_ · # heading · [link](url)</span>
      </div>
      {tab === "write" ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-background px-3 py-2 text-sm font-mono outline-none resize-y"
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none px-3 py-2 min-h-[8rem]">
          {value.trim() ? <ReactMarkdown>{value}</ReactMarkdown> : <p className="text-muted-foreground italic">Nothing to preview yet.</p>}
        </div>
      )}
    </div>
  );
}

/**
 * ProjectImagesPanel — Admin UI for managing /inspiration project images.
 *
 * Provides four override operations:
 *   1. Hide / unhide images (hidden override)
 *   2. Replace images with an uploaded file (replaced override)
 *   3. Set best image for a category (best_for_category override)
 *   4. Drag-reorder project and image order (project_order / category_order / image_order)
 *
 * Data sources:
 *   GET /api/admin/project-images/baseline  — project list with AI scores (cached 5 min)
 *   GET /api/admin/project-images/overrides — all active override rows with stale flags
 *
 * Mutations all POST/DELETE to /api/admin/project-images/overrides and
 * invalidate the overrides query on success.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  Upload,
  GripVertical,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Image,
  Maximize2,
  Flag,
  Check,
  Trash2,
  RotateCcw,
  Sliders,
  ArrowUpDown,
  Ratio as RatioIcon,
  Bookmark,
  RefreshCw,
} from "lucide-react";
import { toThumbPath } from "@/lib/project-thumbs";
import { versionedImage } from "@/lib/image-version";
import { nearestRatioLabel } from "@/lib/image-ratio";
import { projects as staticProjects } from "@/data/projects";

// ── Project id → display name map ─────────────────────────────────────────────
const PROJECT_NAMES: Record<string, string> = Object.fromEntries(
  staticProjects.map((p) => [p.id, p.name])
);

/** Returns the real project display name for a known id, falling back to the
 *  prettified-slug format for any id not present in the static catalog. */
function projectDisplayName(id: string): string {
  return PROJECT_NAMES[id] ?? id.replace(/-/g, " ");
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Category = "windows" | "doors" | "interior" | "exterior";

const CATEGORIES: Category[] = ["windows", "doors", "interior", "exterior"];

const CATEGORY_LABELS: Record<Category, string> = {
  windows: "Windows",
  doors: "Doors",
  interior: "Interior",
  exterior: "Exterior",
};

interface ScoreMap {
  windows: number;
  doors: number;
  interior: number;
  exterior: number;
}

interface BaselineImage {
  path: string;
  scores: ScoreMap | null;
  effectiveScores: ScoreMap | null;
  reasoning: string;
}

interface BaselineProject {
  id: string;
  images: BaselineImage[];
  quality: { heroImage: string; heroScore: number; enhanced: boolean } | null;
  categoryImages: Partial<Record<Category, string>>;
  derivedTags: Category[];
  flagged: boolean;
  checked: boolean;
  hidden: boolean;
  deleted: boolean;
  ratio: string;
}

interface BaselineResponse {
  projects: BaselineProject[];
  projectOrder: string[];
  projectCategoryOrder: Record<Category, string[]>;
}

interface OverrideRow {
  project_image_override_id: number;
  project_id: string;
  image_path: string;
  override_type: string;
  category: Category | null;
  value_text: string | null;
  value_int: number | null;
  stale: boolean;
  created_at: string;
}

interface OverridesResponse {
  overrides: OverrideRow[];
  total: number;
}

interface AddOverrideBody {
  project_id: string;
  image_path: string;
  override_type: string;
  category?: string | null;
  value_text?: string | null;
  value_int?: number | null;
  /** Client-only flag. When true the mutation's onSuccess skips invalidateQueries
   *  so the caller can batch-invalidate once after all POSTs complete. */
  _skipInvalidate?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return "bg-green-500/15 text-green-700";
  if (score >= 50) return "bg-yellow-500/15 text-yellow-700";
  return "bg-muted text-muted-foreground";
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium ${scoreColor(score)}`}>
      {label} {score}
    </span>
  );
}

// ── Lightbox overlay (click anywhere or press Escape to close) ─────────────────

interface LightboxData {
  src: string;
  filename: string;
  scores: ScoreMap | null;
  reasoning: string;
}

function Lightbox({ data, onClose }: { data: LightboxData; onClose: () => void }) {
  // Escape closes; body scroll locked while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Enlarged view of ${data.filename}. Click anywhere or press Escape to close.`}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4 sm:p-8 cursor-zoom-out"
      onClick={onClose}
    >
      <img
        src={data.src}
        alt={data.filename}
        className="max-h-[78vh] max-w-full object-contain rounded-md shadow-2xl"
      />
      {/* Caption strip — filename + scores + reasoning */}
      <div className="max-w-3xl w-full bg-card/95 border border-border rounded-lg px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <code className="text-xs text-muted-foreground font-mono">{data.filename}</code>
          {data.scores &&
            CATEGORIES.map((cat) => (
              <ScorePill key={cat} label={CATEGORY_LABELS[cat]} score={data.scores![cat] ?? 0} />
            ))}
        </div>
        {data.reasoning && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 text-center line-clamp-3">
            {data.reasoning}
          </p>
        )}
      </div>
      <p className="text-[11px] uppercase tracking-wider text-white/50">
        Click anywhere or press Esc to close
      </p>
    </div>
  );
}

// ── Inline uploader (wired directly to /api/admin/cms/media/upload) ────────────

function InlineUploader({
  onSuccess,
  onCancel,
}: {
  onSuccess: (url: string) => void;
  onCancel: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported format. Use JPEG, PNG, WebP, GIF, or AVIF.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("File exceeds 8 MB limit.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/cms/media/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Upload failed: ${res.status}`);
      }
      const data = await res.json() as { file_path: string };
      onSuccess(data.file_path);
    } catch (e) {
      setError(String(e));
    } finally {
      setUploading(false);
    }
  }, [onSuccess]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        className="flex items-center gap-2 border border-dashed border-border rounded-md px-3 py-2 text-xs text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) upload(f);
        }}
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        <span>{uploading ? "Uploading…" : "Drop or click to upload replacement"}</span>
      </div>
      <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted">
        Cancel
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif,.avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      {error && <p className="w-full text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

// ── Sortable row for DnD lists ─────────────────────────────────────────────────

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (isDragging: boolean) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-stretch gap-2 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground p-1 shrink-0 touch-none flex items-center rounded hover:bg-muted/60 transition-colors"
        type="button"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">{children(isDragging)}</div>
    </div>
  );
}

// ── Project order row (click body to open project; drag stays on grip only) ────

function ProjectOrderRow({
  pid,
  index,
  heroPath,
  isCurrentProject,
  flagged,
  checked,
  hidden,
  deleted,
  onOpen,
}: {
  pid: string;
  index: number;
  heroPath: string | undefined;
  isCurrentProject: boolean;
  flagged: boolean;
  checked: boolean;
  hidden: boolean;
  deleted: boolean;
  onOpen: (id: string) => void;
}) {
  const displayName = projectDisplayName(pid);
  const inner = (
    <>
      <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">{index + 1}</span>
      {heroPath && <img src={versionedImage(toThumbPath(heroPath))} alt="" className="h-10 w-14 object-cover rounded shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = versionedImage(heroPath); }} />}
      <span className={`text-xs truncate ${isCurrentProject ? "font-medium text-foreground" : "text-muted-foreground"}`}>
        {displayName}
      </span>
      {flagged && <Flag size={10} className="text-orange-500 shrink-0" />}
      {checked && <Check size={10} className="text-green-600 shrink-0" />}
      {hidden && <span title="Hidden"><EyeOff size={10} className="text-muted-foreground/60 shrink-0" /></span>}
      {deleted && <span title="Deleted"><Trash2 size={10} className="text-destructive/60 shrink-0" /></span>}
      {isCurrentProject && <span className="text-[9px] bg-primary/20 text-primary px-1 py-0.5 rounded shrink-0">this</span>}
    </>
  );

  // The currently open project needs no navigation — keep its highlighted, inert row.
  if (isCurrentProject) {
    return (
      <div className="flex items-center gap-2 py-1 rounded px-1 bg-primary/5 border border-primary/20">
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(pid)}
      aria-label={`Open ${displayName}`}
      className="group/row w-full flex items-center gap-2 py-1 rounded px-1 text-left cursor-pointer hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
    >
      {inner}
      <ChevronRight
        size={13}
        className="ml-auto shrink-0 text-transparent group-hover/row:text-muted-foreground group-focus-visible/row:text-muted-foreground transition-colors"
        aria-hidden="true"
      />
    </button>
  );
}

// ── Project List View (grid of projects with override badges) ──────────────────

type ViewMode = "active" | "hidden" | "deleted";

function ProjectListView({
  baselineData,
  overrides,
  onSelectProject,
}: {
  baselineData: BaselineResponse;
  overrides: OverrideRow[];
  onSelectProject: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("active");

  const overrideCountPerProject = new Map<string, number>();
  for (const row of overrides) {
    overrideCountPerProject.set(row.project_id, (overrideCountPerProject.get(row.project_id) ?? 0) + 1);
  }

  // Order by baseline projectOrder
  const allOrderedProjects = [...baselineData.projects].sort((a, b) => {
    const ai = baselineData.projectOrder.indexOf(a.id);
    const bi = baselineData.projectOrder.indexOf(b.id);
    return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi);
  });

  // Filter by view mode
  const orderedProjects = allOrderedProjects.filter((proj) => {
    if (viewMode === "active") return !proj.deleted && !proj.hidden;
    if (viewMode === "hidden") return proj.hidden && !proj.deleted;
    if (viewMode === "deleted") return proj.deleted;
    return true;
  });

  const staleCount = overrides.filter((r) => r.stale).length;
  const activeCount = allOrderedProjects.filter((p) => !p.deleted && !p.hidden).length;
  const hiddenCount = allOrderedProjects.filter((p) => p.hidden && !p.deleted).length;
  const deletedCount = allOrderedProjects.filter((p) => p.deleted).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{baselineData.projects.length} projects</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {overrides.length} active override{overrides.length !== 1 ? "s" : ""}
            {staleCount > 0 && (
              <span className="ml-2 text-yellow-700 font-medium">{staleCount} stale</span>
            )}
          </p>
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex gap-1 mb-4">
        {(["active", "hidden", "deleted"] as const).map((mode) => {
          const count = mode === "active" ? activeCount : mode === "hidden" ? hiddenCount : deletedCount;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {orderedProjects.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No {viewMode} projects.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orderedProjects.map((proj) => {
            const heroPath = computeCoverPathForProject(proj, overrides);
            const overCount = overrideCountPerProject.get(proj.id) ?? 0;
            const hasStale = overrides.some((r) => r.project_id === proj.id && r.stale);

            return (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="group text-left bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {heroPath ? (
                    <img
                      src={versionedImage(toThumbPath(heroPath))}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = versionedImage(heroPath); }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={24} className="text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Flagged badge */}
                  {proj.flagged && (
                    <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                      <Flag size={9} /> Flagged
                    </span>
                  )}
                  {/* Override count badge */}
                  {overCount > 0 && (
                    <div className={`absolute top-1.5 right-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm ${
                      hasStale ? "bg-yellow-500 text-white" : "bg-primary text-primary-foreground"
                    }`}>
                      {overCount}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="px-3.5 py-2.5">
                  <p className="text-sm font-medium text-foreground truncate">{projectDisplayName(proj.id)}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{proj.id}</p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {proj.derivedTags.map((tag) => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Image Row (single image with AI scores + controls) ─────────────────────────

function ImageRow({
  image,
  isHidden,
  replacedUrl,
  bestForCategories,
  flagged,
  isCover,
  onHide,
  onUnhide,
  onReplaced,
  onFlag,
  onUnflag,
  onSaveScores,
  onOpenLightbox,
}: {
  image: BaselineImage;
  isHidden: boolean;
  replacedUrl: string | null;
  bestForCategories: Category[];
  flagged: boolean;
  /** True when this image is currently first in the project's image order (auto-derived cover). */
  isCover: boolean;
  onHide: () => void;
  onUnhide: () => void;
  onReplaced: (url: string) => void;
  onFlag: () => void;
  onUnflag: () => void;
  onSaveScores: (scores: Record<Category, number>) => Promise<void>;
  onOpenLightbox: () => void;
}) {
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showScoreEditor, setShowScoreEditor] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const [editScores, setEditScores] = useState<Record<Category, number>>(
    () =>
      CATEGORIES.reduce(
        (acc, cat) => ({ ...acc, [cat]: image.effectiveScores?.[cat] ?? 0 }),
        {} as Record<Category, number>
      )
  );

  const displaySrc = replacedUrl ?? image.path;
  const filename = image.path.split("/").pop() ?? image.path;

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors ${isHidden ? "border-border/40 opacity-60 bg-muted/20" : "border-border bg-card"}`}>
      <div className="flex flex-col md:flex-row">
        {/* Large clickable image — opens lightbox. Uses blurred letterbox fill
            so portrait/landscape images never crop: the foreground uses
            object-contain (uncropped), the background is a blurred+scaled copy
            of the same image that fills any letterbox gaps. */}
        <button
          type="button"
          onClick={onOpenLightbox}
          aria-label={`View ${filename} larger`}
          className="relative shrink-0 group/img cursor-zoom-in md:w-80 lg:w-96 bg-muted overflow-hidden"
        >
          {/* Blurred fill layer — covers letterbox areas with a scaled copy */}
          <img
            src={versionedImage(toThumbPath(displaySrc))}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-md brightness-75 pointer-events-none"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = versionedImage(displaySrc); }}
          />
          {/* Foreground layer — uncropped, always fully visible */}
          <img
            src={versionedImage(toThumbPath(displaySrc))}
            alt=""
            className="relative w-full aspect-[4/3] md:aspect-auto md:h-60 object-contain"
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setNaturalRatio(img.naturalWidth / img.naturalHeight);
              }
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = versionedImage(displaySrc); }}
          />
          {/* Hover zoom affordance */}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity">
            <span className="flex items-center gap-1.5 text-white text-xs font-medium bg-black/50 rounded-full px-3 py-1.5">
              <Maximize2 size={13} /> View larger
            </span>
          </span>
          {isHidden && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/45 pointer-events-none">
              <EyeOff size={24} className="text-white" />
            </span>
          )}
        </button>

        {/* Main content */}
        <div className="flex-1 min-w-0 p-4 flex flex-col">
          {/* Path + badges */}
          <div className="flex items-start gap-1.5 flex-wrap mb-2">
            <code className="text-[11px] text-muted-foreground font-mono truncate max-w-[240px]">
              {filename}
            </code>
            {/* B1: aspect ratio indicator */}
            {naturalRatio !== null && (
              <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">
                {nearestRatioLabel(naturalRatio)}
              </span>
            )}
            {isHidden && (
              <span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded font-medium">Hidden</span>
            )}
            {replacedUrl && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-700 rounded font-medium">
                Replaced
              </span>
            )}
            {bestForCategories.map((cat) => (
              <span key={cat} className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 text-yellow-700 rounded font-medium">
                Best: {CATEGORY_LABELS[cat]}
              </span>
            ))}
            {isCover && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded font-medium flex items-center gap-0.5" title="This image is automatically used as the project cover (first in order)">
                <Bookmark size={9} className="fill-primary" /> Cover
              </span>
            )}
          </div>

          {/* AI Scores */}
          {image.scores ? (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {CATEGORIES.map((cat) => (
                <ScorePill key={cat} label={CATEGORY_LABELS[cat]} score={image.effectiveScores?.[cat] ?? image.scores![cat] ?? 0} />
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground mb-3">No AI scores</p>
          )}

          {/* Reasoning — always visible, clamped, expandable */}
          {image.reasoning && (
            <div className="mb-3">
              <p className={`text-xs text-muted-foreground leading-relaxed ${reasoningExpanded ? "" : "line-clamp-3"}`}>
                {image.reasoning}
              </p>
              <button
                onClick={() => setReasoningExpanded(!reasoningExpanded)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                {reasoningExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {reasoningExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-2 border-t border-border/40">
            {/* Hide / Unhide */}
            {isHidden ? (
              <button
                onClick={onUnhide}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-muted hover:bg-border text-foreground transition-colors"
              >
                <Eye size={13} /> Unhide
              </button>
            ) : (
              <button
                onClick={onHide}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-muted hover:bg-border text-muted-foreground transition-colors"
              >
                <EyeOff size={13} /> Hide
              </button>
            )}

            {/* Replace */}
            {!isHidden && (
              <button
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-muted hover:bg-border text-muted-foreground transition-colors"
              >
                <Upload size={13} /> Replace
              </button>
            )}

            {/* B2: Per-image Flag */}
            <button
              onClick={flagged ? onUnflag : onFlag}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors ${
                flagged
                  ? "bg-orange-500/15 text-orange-700 hover:bg-orange-500/25"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              <Flag size={13} /> {flagged ? "Flagged" : "Flag"}
            </button>

            {/* B3: Modify values (replaces Set best) */}
            {!isHidden && (
              <button
                onClick={() => setShowScoreEditor(!showScoreEditor)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-muted hover:bg-border text-muted-foreground transition-colors"
              >
                <Sliders size={13} /> Modify values
              </button>
            )}
          </div>

          {/* Uploader */}
          {showUploader && (
            <div className="mt-2 border-t border-border/40 pt-2">
              <InlineUploader
                onSuccess={(url) => {
                  setShowUploader(false);
                  onReplaced(url);
                }}
                onCancel={() => setShowUploader(false)}
              />
            </div>
          )}

          {/* B3: Score editor popup */}
          {showScoreEditor && (
            <div className="mt-2 border-t border-border/40 pt-2">
              <p className="text-[11px] text-muted-foreground mb-2 font-medium">
                Override category scores for this image (0–100). Category "best" re-derives automatically.
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{CATEGORY_LABELS[cat]}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editScores[cat]}
                      onChange={(e) =>
                        setEditScores((prev) => ({ ...prev, [cat]: parseInt(e.target.value, 10) || 0 }))
                      }
                      className="border border-border rounded px-2 py-1 text-xs bg-background text-foreground w-full outline-none focus:border-primary"
                    />
                    {image.scores?.[cat] !== editScores[cat] && (
                      <span className="text-[10px] text-muted-foreground">
                        base: {image.scores?.[cat] ?? 0}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await onSaveScores(editScores);
                    setShowScoreEditor(false);
                  }}
                  className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  Save scores
                </button>
                <button
                  onClick={() => setShowScoreEditor(false)}
                  className="text-xs px-2.5 py-1.5 rounded bg-muted text-muted-foreground hover:bg-border transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── computeImageOrder: apply image_order overrides to produce correct initial path order ──

function computeImageOrder(
  baseImages: BaselineImage[],
  projectOverrides: OverrideRow[],
): string[] {
  const orderOverrides = projectOverrides
    .filter((r) => r.override_type === "image_order")
    .sort((a, b) => (a.value_int ?? 0) - (b.value_int ?? 0));

  if (orderOverrides.length === 0) return baseImages.map((im) => im.path);

  // Build ordered set: overridden paths in their value_int positions,
  // unordered paths appended in original order at the end.
  const overriddenPaths = new Set(orderOverrides.map((r) => r.image_path));
  const unordered = baseImages.map((im) => im.path).filter((p) => !overriddenPaths.has(p));
  return [
    ...orderOverrides.map((r) => r.image_path).filter((p) => baseImages.some((im) => im.path === p)),
    ...unordered,
  ];
}

// ── computeCoverPathForProject: derive the cover (first non-hidden image) for
//    ANY project using the same logic as the server-side buildMergedResponse.
//    Used for list-grid thumbnails and right-panel order row thumbnails where we
//    only have baseline + overrides — not the computed coverPath from
//    ProjectDetailView (which is only available for the currently-open project).
function computeCoverPathForProject(
  proj: BaselineProject,
  allOverrides: OverrideRow[],
): string | undefined {
  const projectOverrides = allOverrides.filter((r) => r.project_id === proj.id);
  const orderedPaths = computeImageOrder(proj.images, projectOverrides);
  const hiddenSet = new Set(
    projectOverrides.filter((r) => r.override_type === "hidden").map((r) => r.image_path)
  );
  const replacedMap = new Map(
    projectOverrides.filter((r) => r.override_type === "replaced").map((r) => [r.image_path, r.value_text ?? ""])
  );
  for (const imgPath of orderedPaths) {
    if (!hiddenSet.has(imgPath)) {
      return replacedMap.get(imgPath) ?? imgPath;
    }
  }
  return undefined;
}

// ── Project Detail View ─────────────────────────────────────────────────────────

function ProjectDetailView({
  project,
  baselineData,
  overrides,
  onBack,
  onSelectProject,
  onAddOverride,
  onDeleteOverride,
  queryClient,
  onShowToast,
}: {
  project: BaselineProject;
  baselineData: BaselineResponse;
  overrides: OverrideRow[];
  onBack: () => void;
  onSelectProject: (id: string) => void;
  onAddOverride: (body: AddOverrideBody) => Promise<void>;
  onDeleteOverride: (id: number) => Promise<void>;
  queryClient: ReturnType<typeof useQueryClient>;
  onShowToast: (msg: string, kind?: "success" | "error") => void;
}) {
  const [orderTab, setOrderTab] = useState<"all" | Category>("all");
  const [lightbox, setLightbox] = useState<LightboxData | null>(null);

  // Compute per-image override state early — needed for computeImageOrder
  const projectOverrides = overrides.filter((r) => r.project_id === project.id);

  const [imageOrderIds, setImageOrderIds] = useState<string[]>(() =>
    computeImageOrder(project.images, projectOverrides)
  );

  // The detail view stays mounted when switching projects via the order lists,
  // so the per-project image order must resync. Done during render (not in an
  // effect) so the switch commits in a single pass — an effect-based resync
  // briefly renders an empty images section, and the resulting document
  // shrink/grow cycle makes Chrome's scroll anchoring fight the scroll-to-top.
  // Order tab + project order lists are project-independent and persist.
  const [prevProjectId, setPrevProjectId] = useState(project.id);
  if (prevProjectId !== project.id) {
    setPrevProjectId(project.id);
    setImageOrderIds(computeImageOrder(
      project.images,
      overrides.filter((r) => r.project_id === project.id),
    ));
  }
  const hiddenSet = new Set(projectOverrides.filter((r) => r.override_type === "hidden").map((r) => r.image_path));
  const replacedMap = new Map(projectOverrides.filter((r) => r.override_type === "replaced").map((r) => [r.image_path, r.value_text ?? ""]));
  const bestForCatMap = new Map<string, Category[]>();
  for (const r of projectOverrides.filter((r) => r.override_type === "best_for_category" && r.category)) {
    const existing = bestForCatMap.get(r.image_path) ?? [];
    bestForCatMap.set(r.image_path, [...existing, r.category as Category]);
  }
  const imageFlaggedSet = new Set(
    projectOverrides
      .filter((r) => r.override_type === "image_flagged" && r.image_path !== "__project__")
      .map((r) => r.image_path)
  );

  // Derive the cover image: the first non-hidden image in the current image order.
  // This mirrors the server-side derivation in buildMergedResponse so admin always
  // sees the same cover the public site will display.
  const coverPath = (() => {
    for (const imgPath of imageOrderIds) {
      if (!hiddenSet.has(imgPath)) {
        return replacedMap.get(imgPath) ?? imgPath;
      }
    }
    return null;
  })();

  const staleOverrides = projectOverrides.filter((r) => r.stale);

  // Project order lists
  const allProjectOrder = [...baselineData.projectOrder];
  const categoryProjectOrder = (cat: Category) => [...(baselineData.projectCategoryOrder[cat] ?? [])];

  const [allOrderIds, setAllOrderIds] = useState<string[]>(allProjectOrder);
  const [catOrderIds, setCatOrderIds] = useState<Record<string, string[]>>({
    windows: categoryProjectOrder("windows"),
    doors: categoryProjectOrder("doors"),
    interior: categoryProjectOrder("interior"),
    exterior: categoryProjectOrder("exterior"),
  });

  // FIX 1/4: Drag guard — prevents resync effects from clobbering an in-progress drag
  // or overlapping drag-end saves.
  const isDraggingRef = useRef(false);
  // FIX 4: Tracks whether a drag-end save batch is currently in flight so a second
  // drag that completes before the first save finishes is rejected gracefully.
  const isSavingRef = useRef(false);

  // FIX 4: Resync allOrderIds / catOrderIds whenever baselineData changes (e.g. after
  // a save mutation causes TanStack to refetch). Skip if a drag is in progress so
  // the live drag state is not interrupted.
  useEffect(() => {
    if (isDraggingRef.current) return;
    setAllOrderIds([...baselineData.projectOrder]);
    setCatOrderIds({
      windows: [...(baselineData.projectCategoryOrder.windows ?? [])],
      doors: [...(baselineData.projectCategoryOrder.doors ?? [])],
      interior: [...(baselineData.projectCategoryOrder.interior ?? [])],
      exterior: [...(baselineData.projectCategoryOrder.exterior ?? [])],
    });
  }, [baselineData]);

  // FIX 4: Resync imageOrderIds when the overrides data changes for the current
  // project (currently only resyncs on project navigation). Skip if dragging.
  useEffect(() => {
    if (isDraggingRef.current) return;
    setImageOrderIds(computeImageOrder(
      project.images,
      overrides.filter((r) => r.project_id === project.id),
    ));
  }, [overrides, project.id, project.images]);

  // distance: 8 keeps plain clicks (e.g. opening the lightbox) from ever starting a drag
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // FIX 4: Set drag flag on start so resync effects don't clobber an in-progress drag.
  function handleDragStart() {
    isDraggingRef.current = true;
  }

  // DnD handlers
  async function handleProjectOrderEnd(event: DragEndEvent, ids: string[], setIds: (ids: string[]) => void, overrideType: "project_order" | "category_order", category?: Category) {
    const { active, over } = event;
    // No-op drag (dropped in place or missed target) — release guard immediately.
    if (!over || active.id === over.id) {
      isDraggingRef.current = false;
      return;
    }

    // FIX 4: Block overlapping saves — a previous save batch is still in flight.
    if (isSavingRef.current) {
      isDraggingRef.current = false;
      onShowToast("Previous order save still in progress — please wait and try again.");
      return;
    }

    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    const newIds = arrayMove(ids, oldIdx, newIdx);
    setIds(newIds);

    // FIX 2: Keep the drag guard true through the entire save so resync effects
    // don't clobber the optimistic order while POSTs are in flight.
    isSavingRef.current = true;
    let saveError = false;
    try {
      // FIX 2: Skip per-row invalidation; batch-invalidate ONCE below.
      await Promise.all(
        newIds.map((pid, pos) =>
          onAddOverride({
            project_id: pid,
            image_path: "__project__",
            override_type: overrideType,
            category: category ?? null,
            value_int: pos,
            _skipInvalidate: true,
          })
        )
      );
      // FIX 2: Single invalidation after all POSTs succeed. project_order also
      // affects the baseline order so invalidate both.
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "baseline"] });
      // FIX 3: Success toast.
      onShowToast("Project order saved", "success");
    } catch {
      saveError = true;
      onShowToast("Order may be partially saved — please re-drag to fix.");
    } finally {
      // FIX 1: Release the guard only after all POSTs have completed (or failed).
      isSavingRef.current = false;
      isDraggingRef.current = false;
      if (saveError) {
        // Revert optimistic state so the UI reflects actual DB state after refetch.
        queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "baseline"] });
      }
    }
  }

  async function handleImageOrderEnd(event: DragEndEvent) {
    const { active, over } = event;
    // No-op drag — release guard immediately.
    if (!over || active.id === over.id) {
      isDraggingRef.current = false;
      return;
    }

    // FIX 4: Block overlapping saves.
    if (isSavingRef.current) {
      isDraggingRef.current = false;
      onShowToast("Previous order save still in progress — please wait and try again.");
      return;
    }

    const oldIdx = imageOrderIds.indexOf(String(active.id));
    const newIdx = imageOrderIds.indexOf(String(over.id));
    const newIds = arrayMove(imageOrderIds, oldIdx, newIdx);
    setImageOrderIds(newIds);

    // FIX 1: Keep the drag guard true through the entire save.
    isSavingRef.current = true;
    let saveError = false;
    try {
      // FIX 2: Skip per-row invalidation; batch-invalidate ONCE below.
      await Promise.all(
        newIds.map((imgPath, pos) =>
          onAddOverride({
            project_id: project.id,
            image_path: imgPath,
            override_type: "image_order",
            value_int: pos,
            _skipInvalidate: true,
          })
        )
      );
      // FIX 2: Single invalidation after all POSTs succeed.
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
      // FIX 3: Success toast.
      onShowToast("Image order saved", "success");
    } catch {
      saveError = true;
      onShowToast("Order may be partially saved — please re-drag to fix.");
    } finally {
      // FIX 1: Release only after all POSTs complete.
      isSavingRef.current = false;
      isDraggingRef.current = false;
      if (saveError) {
        queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
      }
    }
  }

  // Project-level action helpers
  async function handleAddProjectOverride(type: string, valueText: string | null = null) {
    await onAddOverride({
      project_id: project.id,
      image_path: "__project__",
      override_type: type,
      value_text: valueText,
    });
  }

  async function handleDeleteProjectOverride(type: string) {
    const row = projectOverrides.find(
      (r) => r.override_type === type && r.image_path === "__project__"
    );
    if (row) await onDeleteOverride(row.project_image_override_id);
  }

  return (
    <div className="flex gap-0 items-start min-h-screen">
      {/* ── Left column: back nav + header + images ── */}
      <div className="flex-1 min-w-0 pr-4 xl:pr-6">

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> All Projects
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {coverPath && (
          <button
            type="button"
            onClick={() => {
              // coverPath is already the effective display path (replaced URL applied).
              // Find the underlying base image for scores/reasoning metadata.
              const baseImagePath = imageOrderIds.find((p) => !hiddenSet.has(p)) ?? coverPath;
              const coverImage = project.images.find((im) => im.path === baseImagePath);
              setLightbox({
                src: coverPath,
                filename: (baseImagePath).split("/").pop() ?? baseImagePath,
                scores: coverImage?.scores ?? null,
                reasoning: coverImage?.reasoning ?? "",
              });
            }}
            aria-label="View cover image larger"
            className="shrink-0 cursor-zoom-in rounded overflow-hidden border border-border/40 hover:border-primary/40 transition-colors"
          >
            <img
              src={versionedImage(toThumbPath(coverPath))}
              alt=""
              className="h-20 w-28 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = versionedImage(coverPath);
              }}
            />
          </button>
        )}
        <div>
          <h2 className="text-base font-semibold">{projectDisplayName(project.id)}</h2>
          <p className="text-xs text-muted-foreground font-mono">{project.id}</p>
          <p className="text-xs text-muted-foreground">
            {project.images.length} images · {projectOverrides.length} override{projectOverrides.length !== 1 ? "s" : ""}
            {project.derivedTags.length > 0 && (
              <> · {project.derivedTags.map((t) => CATEGORY_LABELS[t]).join(", ")}</>
            )}
          </p>

          {/* Project-level action bar (Feature A) */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {/* Check toggle */}
            <button
              type="button"
              onClick={() =>
                project.checked
                  ? handleDeleteProjectOverride("project_checked")
                  : handleAddProjectOverride("project_checked")
              }
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
                project.checked
                  ? "bg-green-500/15 text-green-600 hover:bg-green-500/25"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              <Check size={13} /> {project.checked ? "Marked as Checked" : "Check"}
            </button>

            {/* Flag toggle */}
            <button
              type="button"
              onClick={() =>
                project.flagged
                  ? handleDeleteProjectOverride("project_flagged")
                  : handleAddProjectOverride("project_flagged")
              }
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
                project.flagged
                  ? "bg-orange-500/15 text-orange-700 hover:bg-orange-500/25"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              <Flag size={13} /> {project.flagged ? "Flagged" : "Flag"}
            </button>

            {/* Refresh Cover — forces a fresh re-derivation + display sync */}
            <button
              type="button"
              onClick={async () => {
                try {
                  // Invalidate both queries so local state re-derives cover.
                  queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "baseline"] });
                  queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
                  // Also bypass server-side cache so we get the latest DB state.
                  const res = await fetch(`/api/project-images/merged?_r=1`, { cache: "no-cache" });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const data = await res.json() as { projectCoverImages?: Record<string, string> };
                  const coverFile = data.projectCoverImages?.[project.id];
                  const coverFilename = coverFile ? coverFile.split("/").pop() ?? coverFile : null;
                  onShowToast(
                    coverFilename ? `Cover: ${coverFilename}` : "Cover refreshed (no override set)",
                    "success"
                  );
                } catch {
                  onShowToast("Refresh Cover failed — check network", "error");
                }
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-border transition-colors"
              title="Force re-derive cover from current image order and show a toast naming the cover file"
            >
              <RefreshCw size={13} /> Refresh Cover
            </button>

            {/* Ratio toggle — shows current ratio; click to switch to the other value */}
            <button
              type="button"
              onClick={() =>
                handleAddProjectOverride(
                  "project_ratio",
                  project.ratio === "4:3" ? "16:9" : "4:3"
                )
              }
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-border transition-colors"
              title={`Current: ${project.ratio}. Click to switch to ${project.ratio === "4:3" ? "16:9" : "4:3"}`}
            >
              <RatioIcon size={13} /> Ratio: {project.ratio}
            </button>

            {/* Hide toggle */}
            <button
              type="button"
              onClick={() =>
                project.hidden
                  ? handleDeleteProjectOverride("project_hidden")
                  : handleAddProjectOverride("project_hidden")
              }
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
                project.hidden
                  ? "bg-muted border border-border text-foreground"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              {project.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
              {project.hidden ? "Unhide" : "Hide project"}
            </button>

            {/* Delete / Restore */}
            {project.deleted ? (
              <button
                type="button"
                onClick={() => handleDeleteProjectOverride("project_deleted")}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-green-500/10 text-green-700 hover:bg-green-500/20 transition-colors"
              >
                <RotateCcw size={13} /> Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (
                    !window.confirm(
                      `Soft-delete "${project.id.replace(/-/g, " ")}"? It will disappear from the public site and admin default view. You can restore it from the Deleted tab.`
                    )
                  )
                    return;
                  handleAddProjectOverride("project_deleted");
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-auto"
              >
                <Trash2 size={13} /> Delete project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section A + B + C + D — Images with AI context and controls */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Images ({project.images.length})
        </h3>

        {/* G — Within-project image order */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/40">
          <p className="text-[11px] text-muted-foreground mb-2 font-medium">Drag to reorder images within this project</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleImageOrderEnd}>
            <SortableContext items={imageOrderIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {imageOrderIds.map((imgPath) => {
                  const image = project.images.find((im) => im.path === imgPath);
                  if (!image) return null;
                  return (
                    <SortableRow key={imgPath} id={imgPath}>
                      {() => (
                        <ImageRow
                          image={image}
                          isHidden={hiddenSet.has(image.path)}
                          replacedUrl={replacedMap.get(image.path) ?? null}
                          bestForCategories={bestForCatMap.get(image.path) ?? []}
                          flagged={imageFlaggedSet.has(image.path)}
                          isCover={imageOrderIds.indexOf(image.path) === imageOrderIds.findIndex((p) => !hiddenSet.has(p))}
                          onHide={async () => {
                            await onAddOverride({ project_id: project.id, image_path: image.path, override_type: "hidden" });
                          }}
                          onUnhide={async () => {
                            const row = projectOverrides.find((r) => r.override_type === "hidden" && r.image_path === image.path);
                            if (row) await onDeleteOverride(row.project_image_override_id);
                          }}
                          onReplaced={async (url) => {
                            await onAddOverride({ project_id: project.id, image_path: image.path, override_type: "replaced", value_text: url });
                          }}
                          onFlag={async () => {
                            await onAddOverride({ project_id: project.id, image_path: image.path, override_type: "image_flagged" });
                          }}
                          onUnflag={async () => {
                            const row = projectOverrides.find((r) => r.override_type === "image_flagged" && r.image_path === image.path);
                            if (row) await onDeleteOverride(row.project_image_override_id);
                          }}
                          onSaveScores={async (scores) => {
                            await Promise.all(
                              CATEGORIES.map((cat) =>
                                onAddOverride({
                                  project_id: project.id,
                                  image_path: image.path,
                                  override_type: "score_override",
                                  category: cat,
                                  value_int: scores[cat],
                                })
                              )
                            );
                          }}
                          onOpenLightbox={() => {
                            const src = replacedMap.get(image.path) ?? image.path;
                            setLightbox({
                              src,
                              filename: image.path.split("/").pop() ?? image.path,
                              scores: image.scores,
                              reasoning: image.reasoning,
                            });
                          }}
                        />
                      )}
                    </SortableRow>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </section>

      {/* Section H — Stale overrides */}
      {staleOverrides.length > 0 && (
        <section className="mb-8">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-yellow-700 shrink-0" />
              <h3 className="text-sm font-medium text-yellow-700">
                {staleOverrides.length} stale override{staleOverrides.length !== 1 ? "s" : ""} detected
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              These overrides reference image paths no longer in the baseline. They are harmless but can be cleaned up.
            </p>
            <div className="space-y-2">
              {staleOverrides.map((row) => (
                <div key={row.project_image_override_id} className="flex items-center justify-between gap-3 bg-background rounded p-2 border border-border/40">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-foreground">{row.override_type}</p>
                    <code className="text-[10px] text-muted-foreground font-mono truncate block">{row.image_path}</code>
                  </div>
                  <button
                    onClick={() => onDeleteOverride(row.project_image_override_id)}
                    className="shrink-0 flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox overlay */}
      {lightbox && <Lightbox data={lightbox} onClose={() => setLightbox(null)} />}

      {/* ── End left column ── */}
      </div>

      {/* ── Right column: sticky "Project Order in Gallery" panel ── */}
      <div className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] border-l border-border pl-4 xl:pl-6">
        {/* Panel header */}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 shrink-0">
          Project Order in Gallery
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3 shrink-0 leading-relaxed">
          Drag to reorder. Click any project to open it.
          Reorder = cover changes.
        </p>

        {/* Order tab selector */}
        <div className="flex gap-1 mb-3 flex-wrap shrink-0">
          {(["all", ...CATEGORIES] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setOrderTab(tab)}
              className={`text-[11px] px-2 py-1 rounded transition-colors ${
                orderTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All" : CATEGORY_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Scrollable drag list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {orderTab === "all" ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={(e) => handleProjectOrderEnd(e, allOrderIds, setAllOrderIds, "project_order")}>
              <SortableContext items={allOrderIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-1 p-1">
                  {allOrderIds.map((pid, idx) => {
                    const p = baselineData.projects.find((x) => x.id === pid);
                    const heroPath = p ? computeCoverPathForProject(p, overrides) : undefined;
                    return (
                      <SortableRow key={pid} id={pid}>
                        {() => (
                          <ProjectOrderRow
                            pid={pid}
                            index={idx}
                            heroPath={heroPath}
                            isCurrentProject={pid === project.id}
                            flagged={p?.flagged ?? false}
                            checked={p?.checked ?? false}
                            hidden={p?.hidden ?? false}
                            deleted={p?.deleted ?? false}
                            onOpen={onSelectProject}
                          />
                        )}
                      </SortableRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={(e) => {
                const cat = orderTab as Category;
                handleProjectOrderEnd(e, catOrderIds[cat], (ids) => setCatOrderIds((prev) => ({ ...prev, [cat]: ids })), "category_order", cat);
              }}
            >
              <SortableContext items={catOrderIds[orderTab]} strategy={verticalListSortingStrategy}>
                <div className="space-y-1 p-1">
                  {catOrderIds[orderTab].map((pid, idx) => {
                    const p = baselineData.projects.find((x) => x.id === pid);
                    const catImg = p?.categoryImages[orderTab as Category];
                    // Use category-specific best image if available; otherwise fall
                    // back to the derived cover (same source the public site uses).
                    const heroPath = catImg ?? (p ? computeCoverPathForProject(p, overrides) : undefined);
                    return (
                      <SortableRow key={pid} id={pid}>
                        {() => (
                          <ProjectOrderRow
                            pid={pid}
                            index={idx}
                            heroPath={heroPath}
                            isCurrentProject={pid === project.id}
                            flagged={p?.flagged ?? false}
                            checked={p?.checked ?? false}
                            hidden={p?.hidden ?? false}
                            deleted={p?.deleted ?? false}
                            onOpen={onSelectProject}
                          />
                        )}
                      </SortableRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export default function ProjectImagesPanel() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastKind, setToastKind] = useState<"success" | "error">("error");
  const panelRef = useRef<HTMLDivElement>(null);

  // Whenever a project detail view opens (from the list grid or from another
  // project's order lists), bring the top of the panel into view. scroll-mt on
  // the root offsets the sticky admin nav; reduced-motion users get an instant jump.
  useEffect(() => {
    if (!selectedProjectId) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [selectedProjectId]);

  const [applyingExterior, setApplyingExterior] = useState(false);

  function showToast(msg: string, kind: "success" | "error" = "error") {
    setToastMsg(msg);
    setToastKind(kind);
    setTimeout(() => setToastMsg(null), 4000);
  }

  async function handleApplyExteriorFirst() {
    if (
      !window.confirm(
        "Apply best-exterior-first image order to all projects that haven't been manually reordered? " +
        "This cannot be undone automatically — you can manually reorder afterward."
      )
    )
      return;
    setApplyingExterior(true);
    try {
      const res = await fetch("/api/admin/project-images/apply-exterior-first", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json() as { applied?: number; skipped?: number; message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
      showToast(`Done: ${data.message}`);
    } catch (e) {
      showToast(`Error: ${String(e)}`);
    } finally {
      setApplyingExterior(false);
    }
  }

  // ── Data queries ──────────────────────────────────────────────────────────────

  const baselineQuery = useQuery<BaselineResponse>({
    queryKey: ["admin", "project-images", "baseline"],
    queryFn: () =>
      fetch("/api/admin/project-images/baseline", { credentials: "include" })
        .then((r) => {
          if (!r.ok) throw new Error(`Baseline fetch failed: ${r.status}`);
          return r.json() as Promise<BaselineResponse>;
        }),
    staleTime: 5 * 60 * 1000,
  });

  const overridesQuery = useQuery<OverridesResponse>({
    queryKey: ["admin", "project-images", "overrides"],
    queryFn: () =>
      fetch("/api/admin/project-images/overrides", { credentials: "include" })
        .then((r) => {
          if (!r.ok) throw new Error(`Overrides fetch failed: ${r.status}`);
          return r.json() as Promise<OverridesResponse>;
        }),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────

  // Project-level override types that affect the baseline response
  // (flagged/hidden/deleted/ratio come from the /baseline endpoint, not /overrides).
  // Mutations for these types must also invalidate the baseline query so the
  // UI reflects the new state immediately rather than waiting 5 minutes.
  const PROJECT_LEVEL_TYPES = new Set([
    "project_flagged", "project_checked", "project_hidden", "project_deleted", "project_ratio",
  ]);

  const addOverrideMutation = useMutation({
    mutationFn: (body: AddOverrideBody) => {
      // Strip client-only fields before sending to the server.
      const { _skipInvalidate: _omit, ...serverBody } = body;
      return fetch("/api/admin/project-images/overrides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverBody),
      }).then((r) => {
        if (!r.ok) return r.json().then((d: { error?: string }) => Promise.reject(new Error(d.error ?? `Save failed: ${r.status}`)));
        return r.json();
      });
    },
    onSuccess: (_data, body) => {
      // Skip per-row invalidation when the caller will batch-invalidate at the end
      // (e.g. drag-reorder saves all positions then invalidates once).
      if (body._skipInvalidate) return;
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
      // Project-level overrides (flag/hide/delete/ratio) are reflected in the baseline
      // endpoint — invalidate it too so the UI updates immediately.
      if (PROJECT_LEVEL_TYPES.has(body.override_type)) {
        queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "baseline"] });
      }
    },
    onError: (err) => {
      showToast(`Error: ${String(err)}`);
    },
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/project-images/overrides/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((r) => {
        if (!r.ok) return r.json().then((d: { error?: string }) => Promise.reject(new Error(d.error ?? `Delete failed: ${r.status}`)));
        return r.json();
      }),
    onSuccess: () => {
      // Always invalidate both — we don't know here whether the deleted row was
      // a project-level type (flag/hide/delete/ratio). The baseline refresh is
      // cheap (private, 5 min browser TTL, re-served from file) so this is safe.
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "baseline"] });
    },
    onError: (err) => {
      showToast(`Error: ${String(err)}`);
    },
  });

  const addOverride = useCallback(async (body: AddOverrideBody) => {
    await addOverrideMutation.mutateAsync(body);
  }, [addOverrideMutation]);

  const deleteOverride = useCallback(async (id: number) => {
    await deleteOverrideMutation.mutateAsync(id);
  }, [deleteOverrideMutation]);

  // ── Loading / error states ─────────────────────────────────────────────────────

  const isLoading = baselineQuery.isLoading || overridesQuery.isLoading;
  const isError = baselineQuery.isError || overridesQuery.isError;

  if (isLoading) {
    return (
      <div className="space-y-3 py-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertTriangle size={20} className="mx-auto mb-2 text-destructive" />
        <p className="text-sm font-medium text-destructive mb-1">Failed to load project image data</p>
        <p className="text-xs text-muted-foreground">
          {baselineQuery.error instanceof Error ? baselineQuery.error.message : ""}
          {overridesQuery.error instanceof Error ? overridesQuery.error.message : ""}
        </p>
        <button
          onClick={() => {
            baselineQuery.refetch();
            overridesQuery.refetch();
          }}
          className="mt-3 text-xs px-3 py-1.5 bg-muted rounded hover:bg-border transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const baselineData = baselineQuery.data!;
  const overrides = overridesQuery.data?.overrides ?? [];
  const selectedProject = selectedProjectId
    ? baselineData.projects.find((p) => p.id === selectedProjectId) ?? null
    : null;

  return (
    <div ref={panelRef} className="relative scroll-mt-20">
      {/* Toast notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 ${
          toastKind === "success"
            ? "bg-green-700 text-white"
            : "bg-foreground text-background"
        }`}>
          {toastKind === "success" ? <Check size={13} /> : <AlertTriangle size={13} />}
          {toastMsg}
        </div>
      )}

      {/* Panel header */}
      {!selectedProject && (
        <div className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-medium text-foreground mb-1">Project Images</p>
              <p>
                Manage the AI-selected images that appear in the /inspiration gallery. Hide, replace, or
                reorder images without touching the codebase. Changes take effect within 30 seconds.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyExteriorFirst}
              disabled={applyingExterior}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-muted border border-border text-muted-foreground hover:bg-border transition-colors disabled:opacity-50 shrink-0"
            >
              {applyingExterior ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpDown size={13} />}
              Apply exterior-first order
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {selectedProject ? (
        <ProjectDetailView
          project={selectedProject}
          baselineData={baselineData}
          overrides={overrides}
          onBack={() => setSelectedProjectId(null)}
          onSelectProject={setSelectedProjectId}
          onAddOverride={addOverride}
          onDeleteOverride={deleteOverride}
          queryClient={queryClient}
          onShowToast={showToast}
        />
      ) : (
        <ProjectListView
          baselineData={baselineData}
          overrides={overrides}
          onSelectProject={setSelectedProjectId}
        />
      )}
    </div>
  );
}

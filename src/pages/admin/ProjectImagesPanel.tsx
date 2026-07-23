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
  Star,
  GripVertical,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Image,
  Maximize2,
} from "lucide-react";
import { toThumbPath } from "@/lib/project-thumbs";

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
  reasoning: string;
}

interface BaselineProject {
  id: string;
  images: BaselineImage[];
  quality: { heroImage: string; heroScore: number; enhanced: boolean } | null;
  categoryImages: Partial<Record<Category, string>>;
  derivedTags: Category[];
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
  onOpen,
}: {
  pid: string;
  index: number;
  heroPath: string | undefined;
  isCurrentProject: boolean;
  onOpen: (id: string) => void;
}) {
  const name = pid.replace(/-/g, " ");
  const inner = (
    <>
      <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0">{index + 1}</span>
      {heroPath && <img src={toThumbPath(heroPath)} alt="" className="h-10 w-14 object-cover rounded shrink-0" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroPath; }} />}
      <span className={`text-xs capitalize truncate ${isCurrentProject ? "font-medium text-foreground" : "text-muted-foreground"}`}>
        {name}
      </span>
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
      aria-label={`Open ${name}`}
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

function ProjectListView({
  baselineData,
  overrides,
  onSelectProject,
}: {
  baselineData: BaselineResponse;
  overrides: OverrideRow[];
  onSelectProject: (id: string) => void;
}) {
  const overrideCountPerProject = new Map<string, number>();
  for (const row of overrides) {
    overrideCountPerProject.set(row.project_id, (overrideCountPerProject.get(row.project_id) ?? 0) + 1);
  }

  // Order by baseline projectOrder
  const orderedProjects = [...baselineData.projects].sort((a, b) => {
    const ai = baselineData.projectOrder.indexOf(a.id);
    const bi = baselineData.projectOrder.indexOf(b.id);
    return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi);
  });

  const staleCount = overrides.filter((r) => r.stale).length;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderedProjects.map((proj) => {
          const heroPath = proj.quality?.heroImage ?? proj.images[0]?.path;
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
                    src={toThumbPath(heroPath)}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroPath; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} className="text-muted-foreground/30" />
                  </div>
                )}
                {/* Override badge */}
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
                <p className="text-sm font-medium text-foreground truncate capitalize">{proj.id.replace(/-/g, " ")}</p>
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
    </div>
  );
}

// ── Image Row (single image with AI scores + controls) ─────────────────────────

function ImageRow({
  projectId,
  image,
  isHidden,
  replacedUrl,
  bestForCategories,
  onHide,
  onUnhide,
  onReplaced,
  onSetBestFor,
  onOpenLightbox,
}: {
  projectId: string;
  image: BaselineImage;
  isHidden: boolean;
  replacedUrl: string | null;
  bestForCategories: Category[];
  onHide: () => void;
  onUnhide: () => void;
  onReplaced: (url: string) => void;
  onSetBestFor: (category: Category) => void;
  onOpenLightbox: () => void;
}) {
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [bestCat, setBestCat] = useState<Category>("windows");

  const displaySrc = replacedUrl ?? image.path;
  const filename = image.path.split("/").pop() ?? image.path;

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors ${isHidden ? "border-border/40 opacity-60 bg-muted/20" : "border-border bg-card"}`}>
      <div className="flex flex-col md:flex-row">
        {/* Large clickable image — opens lightbox */}
        <button
          type="button"
          onClick={onOpenLightbox}
          aria-label={`View ${filename} larger`}
          className="relative shrink-0 group/img cursor-zoom-in md:w-80 lg:w-96 bg-muted"
        >
          <img
            src={toThumbPath(displaySrc)}
            alt=""
            className="w-full aspect-[4/3] md:aspect-auto md:h-60 object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = displaySrc; }}
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
          </div>

          {/* AI Scores */}
          {image.scores ? (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {CATEGORIES.map((cat) => (
                <ScorePill key={cat} label={CATEGORY_LABELS[cat]} score={image.scores![cat] ?? 0} />
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

            {/* Set best for category */}
            {!isHidden && (
              <div className="flex items-center gap-1">
                <select
                  value={bestCat}
                  onChange={(e) => setBestCat(e.target.value as Category)}
                  className="text-xs bg-background border border-border rounded px-1.5 py-1.5 text-foreground outline-none focus:border-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
                <button
                  onClick={() => onSetBestFor(bestCat)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-muted hover:bg-border text-muted-foreground transition-colors"
                >
                  <Star size={13} /> Set best
                </button>
              </div>
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
        </div>
      </div>
    </div>
  );
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
}: {
  project: BaselineProject;
  baselineData: BaselineResponse;
  overrides: OverrideRow[];
  onBack: () => void;
  onSelectProject: (id: string) => void;
  onAddOverride: (body: AddOverrideBody) => Promise<void>;
  onDeleteOverride: (id: number) => Promise<void>;
}) {
  const [orderTab, setOrderTab] = useState<"all" | Category>("all");
  const [imageOrderIds, setImageOrderIds] = useState<string[]>(() => project.images.map((im) => im.path));
  const [lightbox, setLightbox] = useState<LightboxData | null>(null);

  // The detail view stays mounted when switching projects via the order lists,
  // so the per-project image order must resync. Done during render (not in an
  // effect) so the switch commits in a single pass — an effect-based resync
  // briefly renders an empty images section, and the resulting document
  // shrink/grow cycle makes Chrome's scroll anchoring fight the scroll-to-top.
  // Order tab + project order lists are project-independent and persist.
  const [prevProjectId, setPrevProjectId] = useState(project.id);
  if (prevProjectId !== project.id) {
    setPrevProjectId(project.id);
    setImageOrderIds(project.images.map((im) => im.path));
  }

  // Compute per-image override state
  const projectOverrides = overrides.filter((r) => r.project_id === project.id);
  const hiddenSet = new Set(projectOverrides.filter((r) => r.override_type === "hidden").map((r) => r.image_path));
  const replacedMap = new Map(projectOverrides.filter((r) => r.override_type === "replaced").map((r) => [r.image_path, r.value_text ?? ""]));
  const bestForCatMap = new Map<string, Category[]>();
  for (const r of projectOverrides.filter((r) => r.override_type === "best_for_category" && r.category)) {
    const existing = bestForCatMap.get(r.image_path) ?? [];
    bestForCatMap.set(r.image_path, [...existing, r.category as Category]);
  }

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

  // distance: 8 keeps plain clicks (e.g. opening the lightbox) from ever starting a drag
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // DnD handlers
  async function handleProjectOrderEnd(event: DragEndEvent, ids: string[], setIds: (ids: string[]) => void, overrideType: "project_order" | "category_order", category?: Category) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    const newIds = arrayMove(ids, oldIdx, newIdx);
    setIds(newIds);
    // Save position overrides for all items
    await Promise.all(
      newIds.map((pid, pos) =>
        onAddOverride({
          project_id: pid,
          image_path: "__project__",
          override_type: overrideType,
          category: category ?? null,
          value_int: pos,
        })
      )
    );
  }

  async function handleImageOrderEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = imageOrderIds.indexOf(String(active.id));
    const newIdx = imageOrderIds.indexOf(String(over.id));
    const newIds = arrayMove(imageOrderIds, oldIdx, newIdx);
    setImageOrderIds(newIds);
    await Promise.all(
      newIds.map((imgPath, pos) =>
        onAddOverride({
          project_id: project.id,
          image_path: imgPath,
          override_type: "image_order",
          value_int: pos,
        })
      )
    );
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> All Projects
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {(project.quality?.heroImage ?? project.images[0]?.path) && (
          <button
            type="button"
            onClick={() => {
              const heroPath = project.quality?.heroImage ?? project.images[0]?.path;
              if (!heroPath) return;
              const heroImage = project.images.find((im) => im.path === heroPath);
              setLightbox({
                src: heroPath,
                filename: heroPath.split("/").pop() ?? heroPath,
                scores: heroImage?.scores ?? null,
                reasoning: heroImage?.reasoning ?? "",
              });
            }}
            aria-label="View hero image larger"
            className="shrink-0 cursor-zoom-in rounded overflow-hidden border border-border/40 hover:border-primary/40 transition-colors"
          >
            <img
              src={toThumbPath(project.quality?.heroImage ?? project.images[0]?.path ?? "")}
              alt=""
              className="h-20 w-28 object-cover"
              onError={(e) => {
                const full = project.quality?.heroImage ?? project.images[0]?.path;
                if (full) (e.currentTarget as HTMLImageElement).src = full;
              }}
            />
          </button>
        )}
        <div>
          <h2 className="text-base font-semibold capitalize">{project.id.replace(/-/g, " ")}</h2>
          <p className="text-xs text-muted-foreground">
            {project.images.length} images · {projectOverrides.length} override{projectOverrides.length !== 1 ? "s" : ""}
            {project.derivedTags.length > 0 && (
              <> · {project.derivedTags.map((t) => CATEGORY_LABELS[t]).join(", ")}</>
            )}
          </p>
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageOrderEnd}>
            <SortableContext items={imageOrderIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {imageOrderIds.map((imgPath) => {
                  const image = project.images.find((im) => im.path === imgPath);
                  if (!image) return null;
                  return (
                    <SortableRow key={imgPath} id={imgPath}>
                      {() => (
                        <ImageRow
                          projectId={project.id}
                          image={image}
                          isHidden={hiddenSet.has(image.path)}
                          replacedUrl={replacedMap.get(image.path) ?? null}
                          bestForCategories={bestForCatMap.get(image.path) ?? []}
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
                          onSetBestFor={async (cat) => {
                            await onAddOverride({ project_id: project.id, image_path: image.path, override_type: "best_for_category", category: cat });
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

      {/* Section E + F — Project order drag */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Project Order in Gallery
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Drag the handle to reorder where this project appears relative to all others in each view.
          Click any other project to open it.
        </p>

        {/* Order tab selector */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {(["all", ...CATEGORIES] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setOrderTab(tab)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                orderTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All projects" : CATEGORY_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Section E — All-projects order */}
        {orderTab === "all" && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleProjectOrderEnd(e, allOrderIds, setAllOrderIds, "project_order")}>
            <SortableContext items={allOrderIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-1 max-h-80 overflow-y-auto rounded border border-border p-2">
                {allOrderIds.map((pid, idx) => {
                  const p = baselineData.projects.find((x) => x.id === pid);
                  const heroPath = p?.quality?.heroImage ?? p?.images[0]?.path;
                  return (
                    <SortableRow key={pid} id={pid}>
                      {() => (
                        <ProjectOrderRow
                          pid={pid}
                          index={idx}
                          heroPath={heroPath}
                          isCurrentProject={pid === project.id}
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

        {/* Section F — Per-category order */}
        {orderTab !== "all" && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => {
              const cat = orderTab as Category;
              handleProjectOrderEnd(e, catOrderIds[cat], (ids) => setCatOrderIds((prev) => ({ ...prev, [cat]: ids })), "category_order", cat);
            }}
          >
            <SortableContext items={catOrderIds[orderTab]} strategy={verticalListSortingStrategy}>
              <div className="space-y-1 max-h-80 overflow-y-auto rounded border border-border p-2">
                {catOrderIds[orderTab].map((pid, idx) => {
                  const p = baselineData.projects.find((x) => x.id === pid);
                  const catImg = p?.categoryImages[orderTab as Category];
                  const heroPath = catImg ?? p?.quality?.heroImage ?? p?.images[0]?.path;
                  return (
                    <SortableRow key={pid} id={pid}>
                      {() => (
                        <ProjectOrderRow
                          pid={pid}
                          index={idx}
                          heroPath={heroPath}
                          isCurrentProject={pid === project.id}
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
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export default function ProjectImagesPanel() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Whenever a project detail view opens (from the list grid or from another
  // project's order lists), bring the top of the panel into view. scroll-mt on
  // the root offsets the sticky admin nav; reduced-motion users get an instant jump.
  useEffect(() => {
    if (!selectedProjectId) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [selectedProjectId]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
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

  const addOverrideMutation = useMutation({
    mutationFn: (body: AddOverrideBody) =>
      fetch("/api/admin/project-images/overrides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) return r.json().then((d: { error?: string }) => Promise.reject(new Error(d.error ?? `Save failed: ${r.status}`)));
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin", "project-images", "overrides"] });
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <AlertTriangle size={13} />
          {toastMsg}
        </div>
      )}

      {/* Panel header */}
      {!selectedProject && (
        <div className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1">Project Images</p>
          <p>
            Manage the AI-selected images that appear in the /inspiration gallery. Hide, replace, or
            reorder images without touching the codebase. Changes take effect within 30 seconds.
          </p>
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

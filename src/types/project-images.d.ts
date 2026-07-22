import type { InspirationTag } from "@/data/projects";

/**
 * Shape of the response from GET /api/project-images/merged.
 * The server merges DB overrides onto the file-based AI baseline and returns this.
 *
 * /inspiration uses this for live ordering and image selection.
 * Admin UI uses hiddenImages, replacedImages, and overrideCount.
 */
export interface MergedProjectImagesResponse {
  /** projectId → best image path for each category the project qualifies for. */
  projectCategoryImages: Record<string, Partial<Record<InspirationTag, string>>>;

  /** projectId → categories the project belongs to (derived from AI scores + overrides). */
  projectDerivedTags: Record<string, InspirationTag[]>;

  /** "All projects" order — best hero photo first; overridden positions win. */
  projectOrder: string[];

  /** Per-category order — each project's best image FOR THAT category first; overridden positions win. */
  projectCategoryOrder: Record<InspirationTag, string[]>;

  /** projectId → [imagePaths] that are hidden via override. Admin display only; /inspiration ignores. */
  hiddenImages: Record<string, string[]>;

  /** projectId → { origPath: newURL } for replaced images. Admin display only; /inspiration ignores. */
  replacedImages: Record<string, Record<string, string>>;

  /** Total number of active override rows (used for admin badge). */
  overrideCount: number;
}

/**
 * Asset map for the /finishes interactive preview.
 *
 * One "scene" = a single base photograph + 11 variants (one per finish),
 * OR an SVG-driven preview (previewMode: "svg") that recolours live via
 * WindowPreview — no inpainted assets required.
 *
 * Photo scene runbook (hasAssets path):
 *  1. Generate the 11 finish variants per public/images/finishes/README.md
 *  2. Drop them into public/images/finishes/{scene-id}/{finish-id}.jpg
 *  3. Add an entry below with hasAssets: true
 *
 * SVG scene path (recommended when assets are missing):
 *  Set previewMode: "svg" and productType to a WindowPreview product id
 *  (e.g. "entrance"). Swatch clicks recolour the SVG door immediately.
 */

import type { FrameFinish } from "@/data/fourlinq-data";

export type FinishScenePreviewMode = "photo" | "svg";

export interface FinishScene {
  id: string;
  label: string;
  description: string;
  /** Path template. The finish ID is interpolated as `{finishId}`. */
  variantPathTemplate: string;
  /** Aspect ratio for the hero crop. */
  aspect: string;
  /** Whether the scene's variants actually exist on disk. Set true only
   *  when assets have been generated and committed. */
  hasAssets: boolean;
  /** Fallback used when hasAssets is false: the base scene without finish swap. */
  fallbackSrc: string;
  /**
   * How the scene is rendered on /finishes.
   * - "photo" (default): image variants / fallback photo
   * - "svg": live WindowPreview recolour — preferred when hasAssets is false
   */
  previewMode?: FinishScenePreviewMode;
  /** Product type id for WindowPreview when previewMode is "svg". */
  productType?: string;
}

export const FINISH_SCENES: FinishScene[] = [
  {
    id: "living-room",
    label: "Living room",
    description: "Modern Filipino living room with full-height casement windows.",
    variantPathTemplate: "/images/finishes/living-room/{finishId}.jpg",
    aspect: "aspect-[4/5] lg:aspect-[5/6]",
    hasAssets: false,
    fallbackSrc: "/images/wp-export/FQC-Project-17.jpg",
    previewMode: "photo",
  },
  {
    id: "door",
    label: "Casement door",
    description:
      "Casement door finish preview. Click any swatch — the door frame and solid lower panel recolour live.",
    // SVG path: no photo variants. Template kept for API symmetry.
    variantPathTemplate: "/images/finishes/door/{finishId}.jpg",
    aspect: "aspect-[3/4]",
    hasAssets: false,
    fallbackSrc: "",
    previewMode: "svg",
    productType: "entrance",
  },
];

/** Resolve the actual image path for a scene + finish combo. */
export function getFinishVariantSrc(scene: FinishScene, finish: FrameFinish): string {
  if (scene.previewMode === "svg") return "";
  if (!scene.hasAssets) return scene.fallbackSrc;
  return scene.variantPathTemplate.replace("{finishId}", finish.id);
}

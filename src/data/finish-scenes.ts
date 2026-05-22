/**
 * Asset map for the /finishes interactive preview.
 *
 * One "scene" = a single base photograph + 11 variants (one per finish).
 * Variants are AI-generated via inpainting the frame area of the base
 * scene. See public/images/finishes/README.md for the generation runbook.
 *
 * Adding a new scene:
 *  1. Generate the 11 finish variants per the runbook
 *  2. Drop them into public/images/finishes/{scene-id}/{finish-id}.jpg
 *  3. Add an entry below
 */

import type { FrameFinish } from "@/data/fourlinq-data";

export interface FinishScene {
  id: string;
  label: string;
  description: string;
  /** Path template — the finish ID is interpolated as `{finishId}`. */
  variantPathTemplate: string;
  /** Aspect ratio for the hero crop. */
  aspect: string;
  /** Whether the scene's variants actually exist on disk. Set true only
   *  when assets have been generated and committed. */
  hasAssets: boolean;
  /** Fallback used when hasAssets is false — the base scene without finish swap. */
  fallbackSrc: string;
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
  },
];

/** Resolve the actual image path for a scene + finish combo. */
export function getFinishVariantSrc(scene: FinishScene, finish: FrameFinish): string {
  if (!scene.hasAssets) return scene.fallbackSrc;
  return scene.variantPathTemplate.replace("{finishId}", finish.id);
}

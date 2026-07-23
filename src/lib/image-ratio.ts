/**
 * image-ratio.ts — Nearest common aspect ratio detection.
 *
 * Given a numeric ratio (width / height), returns the closest
 * named ratio with orientation label.
 *
 * Usage:
 *   import { nearestRatioLabel } from "@/lib/image-ratio";
 *   nearestRatioLabel(1.78)  // → "16:9 landscape"
 *   nearestRatioLabel(0.5)   // → "9:16 portrait"
 *   nearestRatioLabel(1.0)   // → "1:1 square"
 */

interface RatioEntry {
  label: string;
  value: number;
}

// Landscape common ratios (width > height)
const LANDSCAPE_RATIOS: RatioEntry[] = [
  { label: "21:9", value: 21 / 9 },   // ~2.333
  { label: "16:9", value: 16 / 9 },   // ~1.778
  { label: "3:2",  value: 3 / 2 },    // 1.500
  { label: "4:3",  value: 4 / 3 },    // ~1.333
  { label: "5:4",  value: 5 / 4 },    // 1.250
  { label: "1:1",  value: 1 / 1 },    // 1.000
];

// Portrait ratios (height > width) — inverses of landscape
const PORTRAIT_RATIOS: RatioEntry[] = [
  { label: "9:21", value: 9 / 21 },
  { label: "9:16", value: 9 / 16 },
  { label: "2:3",  value: 2 / 3 },
  { label: "3:4",  value: 3 / 4 },
  { label: "4:5",  value: 4 / 5 },
  { label: "1:1",  value: 1 / 1 },
];

/**
 * Returns a human-readable ratio + orientation label for the given numeric ratio.
 *
 * @param ratio - width divided by height (e.g. 1920/1080 → 1.778)
 * @returns e.g. "16:9 landscape", "9:16 portrait", "1:1 square"
 */
export function nearestRatioLabel(ratio: number): string {
  if (!isFinite(ratio) || ratio <= 0) return "unknown";

  // Use absolute ratio for distance comparison; pick from appropriate list
  const SQUARE_THRESHOLD = 0.05; // within 5% of 1:1 → call it square

  if (Math.abs(ratio - 1) < SQUARE_THRESHOLD) {
    return "1:1 square";
  }

  const isLandscape = ratio > 1;
  const candidates = isLandscape ? LANDSCAPE_RATIOS : PORTRAIT_RATIOS;

  // Find nearest by absolute difference in ratio value
  let best = candidates[0];
  let bestDist = Math.abs(ratio - best.value);
  for (const entry of candidates) {
    const dist = Math.abs(ratio - entry.value);
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }

  if (best.label === "1:1") return "1:1 square";
  const orientation = isLandscape ? "landscape" : "portrait";
  return `${best.label} ${orientation}`;
}

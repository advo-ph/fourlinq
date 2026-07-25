/**
 * image-version.ts
 *
 * Appends a short content-hash query parameter (?v=<hash>) to projects-fb image
 * URLs so that browsers immediately fetch freshened copies after an image is
 * replaced in-place during a deploy, bypassing any stale cached copy.
 *
 * The hash comes from src/generated/image-versions.json, which is regenerated
 * automatically by scripts/generate-project-thumbs.mjs before every build
 * (and committed so it is also accurate in the local dev server without any
 * extra manual step).
 *
 * DESIGN DECISIONS
 * - The server-side /api/project-images/merged endpoint continues to return RAW
 *   image paths (no ?v= appended). This keeps database/CMS paths canonical and
 *   means no server code changes are needed. Versioning is applied at render
 *   time by the frontend.
 * - /uploads/ paths and any path not in the manifest pass through unchanged.
 *   Upload/custom override URLs are not versioned (the server already gives them
 *   unique filenames).
 * - Both the original path (/images/projects-fb/foo.jpg) and its thumb path
 *   (/images/projects-fb/thumbs/foo.webp) map to the SAME hash (derived from the
 *   original's bytes). This ensures the original and its thumb share one version
 *   token, so a browser that cached both stale copies refetches both on next load.
 */

import imageVersions from "@/generated/image-versions.json";

// Strip the "_note" meta key; it is not a valid image path.
const VERSION_MAP = imageVersions as Record<string, string>;

/**
 * Returns the image path with a ?v=<hash> appended when the manifest contains
 * an entry for that path. Returns the original path unchanged for:
 *   - /uploads/ paths (server-assigned unique names, no versioning needed)
 *   - any path not covered by the manifest (external URLs, data URIs, etc.)
 *   - paths that are already versioned (contain "?v=")
 *   - empty or non-string inputs
 *
 * @example
 *   versionedImage("/images/projects-fb/foo.jpg")
 *   // → "/images/projects-fb/foo.jpg?v=13d57a1b"
 *
 *   versionedImage("/images/projects-fb/thumbs/foo.webp")
 *   // → "/images/projects-fb/thumbs/foo.webp?v=13d57a1b"
 *
 *   versionedImage("/uploads/custom.jpg")
 *   // → "/uploads/custom.jpg"  (unchanged)
 */
export function versionedImage(path: string): string {
  if (!path || typeof path !== "string") return path;
  // Already has a query string — do not double-version.
  if (path.includes("?")) return path;
  // Only version paths that appear in the manifest.
  const hash = VERSION_MAP[path];
  if (!hash) return path;
  return `${path}?v=${hash}`;
}

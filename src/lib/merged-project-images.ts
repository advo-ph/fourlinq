/**
 * merged-project-images.ts
 *
 * Shared fetch + cache for /api/project-images/merged so that Inspiration.tsx
 * and InspirationStrip.tsx (and any future caller) share one in-flight request
 * and one cached result rather than each making independent fetches.
 *
 * Features:
 * - In-flight deduplication: concurrent callers share a single Promise.
 * - Result cache with ~60 s TTL.
 * - Failed fetch clears the cache entry so the next call retries immediately.
 * - Accepts an AbortSignal so each caller can clean up independently; once the
 *   shared request is in flight, individual aborts are ignored (the promise is
 *   shared — aborting one caller would affect others).  Callers that need strict
 *   abort semantics should add their own live/cancelled flag as they already do.
 */

import type { MergedProjectImagesResponse } from "@/types/project-images";

const CACHE_TTL_MS = 60_000; // 60 s

let cachedResult: MergedProjectImagesResponse | null = null;
let cachedAt = 0;
let inFlight: Promise<MergedProjectImagesResponse> | null = null;

/**
 * Fetch /api/project-images/merged with module-level in-flight deduplication
 * and a 60 s result cache.  The `signal` parameter is accepted for API
 * compatibility but individual callers should guard stale setState with their
 * own `live` / `cancelled` flag rather than relying on abort propagation.
 */
export async function fetchMergedProjectImages(
  _signal?: AbortSignal
): Promise<MergedProjectImagesResponse> {
  const now = Date.now();

  // Return cached result while still fresh.
  if (cachedResult && now - cachedAt < CACHE_TTL_MS) {
    return cachedResult;
  }

  // Deduplicate concurrent in-flight requests.
  if (inFlight) {
    return inFlight;
  }

  inFlight = fetch("/api/project-images/merged")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<MergedProjectImagesResponse>;
    })
    .then((data) => {
      cachedResult = data;
      cachedAt = Date.now();
      inFlight = null;
      return data;
    })
    .catch((err) => {
      // Clear so the next caller retries rather than waiting on a dead promise.
      inFlight = null;
      cachedResult = null;
      throw err;
    });

  return inFlight;
}

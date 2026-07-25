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

/**
 * Fetch /api/project-images/merged bypassing all caches — both the module-level
 * 60 s cache above AND any HTTP cache the browser may hold for the endpoint.
 *
 * Used by Inspiration.tsx on initial page-load so it always gets the current DB
 * state rather than a possibly-stale baked baseline or a browser-cached response
 * that predates the latest admin hide/override actions.
 *
 * ?_r=1 is the server flag that forces loadBaseline() to reload from disk,
 * defeating the server's own in-memory TTL. cache:'no-cache' tells the browser to
 * revalidate with the server even if it has a fresh HTTP-cached copy.
 *
 * The result is written into the shared module cache so any subsequent call from
 * InspirationStrip (or another component) within the same 60 s window benefits
 * from the already-fresh response without an extra round-trip.
 */
export async function fetchMergedProjectImagesFresh(): Promise<MergedProjectImagesResponse> {
  const data = await fetch("/api/project-images/merged?_r=1", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<MergedProjectImagesResponse>;
    });

  // Populate shared cache so sibling callers don't re-fetch.
  cachedResult = data;
  cachedAt = Date.now();
  inFlight = null;

  return data;
}

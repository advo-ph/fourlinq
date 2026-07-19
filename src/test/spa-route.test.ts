import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { spaStatusForPath } from "../../server/spa-route";

// The allowlist in server/spa-route.ts is hand-maintained, so it drifts the
// moment a route lands in App.tsx without a matching entry — and the symptom
// is silent: the page still renders, it just serves an honest-looking 404.
// /glossary shipped exactly that way. This derives the expectation from the
// router itself so the drift fails here instead of in production.
const appSource = readFileSync(resolve(process.cwd(), "src/App.tsx"), "utf8");
const staticRoute = [...appSource.matchAll(/path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p.startsWith("/") && !p.includes(":") && p !== "*");

describe("production SPA status", () => {
  it.each([
    "/",
    "/products",
    "/products/windows",
    "/legal",
    "/admin",
    "/projects/san-lorenzo-makati-aluminium",
  ])("serves a known client route with 200: %s", (path) => {
    expect(spaStatusForPath(path)).toBe(200);
  });

  it.each([
    "/__audit-not-found__",
    "/products/unknown/deep",
    "/not-a-route",
  ])("serves the NotFound shell with 404: %s", (path) => {
    expect(spaStatusForPath(path)).toBe(404);
  });

  it("normalizes a trailing slash", () => {
    expect(spaStatusForPath("/faq/")).toBe(200);
  });

  it("covers every static route declared in App.tsx", () => {
    expect(staticRoute.length).toBeGreaterThan(10); // the regex actually matched
    const missing = staticRoute.filter((p) => spaStatusForPath(p) !== 200);
    expect(missing, `routes in App.tsx missing from SPA_ROUTE: ${missing.join(", ")}`).toEqual([]);
  });
});

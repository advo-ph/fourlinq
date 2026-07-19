import { describe, expect, it } from "vitest";
import { spaStatusForPath } from "../../server/spa-route";

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
});

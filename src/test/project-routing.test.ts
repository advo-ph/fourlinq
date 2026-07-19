import { describe, expect, it } from "vitest";
import { canonicalProjectSlug, mergeProject, projectFromCms, type CmsProject } from "@/lib/cms-api";
import { projects as fallbackProject } from "@/data/projects";

/**
 * Regression cover for the /projects/:slug outage found live on 2026-07-18.
 *
 * Production shipped one project the CMS and the code spelled differently:
 * the CMS row was `san-lorenzo-makati-aluminum`, the published URL and the
 * verified fallback used `san-lorenzo-makati-aluminium`. Because the page
 * REPLACED the fallback list with the CMS response, the British slug stopped
 * resolving; because it redirected before the request settled, the American
 * one never resolved either. The project was unreachable from both spellings.
 */

const cmsRow = (over: Partial<CmsProject> = {}): CmsProject => ({
  cms_project_id: "1",
  slug: "san-lorenzo-makati-aluminum",
  title: "San Lorenzo, Makati",
  location: "San Lorenzo, Makati",
  category: "exterior",
  cover_path: "/images/projects-fb/x.jpg",
  gallery_paths: [],
  caption: null,
  description: null,
  architect: null,
  project_year: null,
  systems_used: [],
  quote_text: null,
  quote_attribution: null,
  ...over,
} as CmsProject);

describe("project slug canonicalization", () => {
  it("maps the American CMS spelling onto the published British slug", () => {
    expect(canonicalProjectSlug("san-lorenzo-makati-aluminum")).toBe("san-lorenzo-makati-aluminium");
  });

  it("leaves an already-canonical slug untouched", () => {
    expect(canonicalProjectSlug("san-lorenzo-makati-aluminium")).toBe("san-lorenzo-makati-aluminium");
    expect(canonicalProjectSlug("las-pinas-residence")).toBe("las-pinas-residence");
  });
});

describe("merging CMS rows over the verified fallback", () => {
  it("resolves the project from BOTH spellings after a merge", () => {
    const merged = mergeProject(fallbackProject, [cmsRow()]);
    const ids = merged.map((p) => p.id);
    // exactly one entry, under the canonical id — not two rival spellings
    expect(ids.filter((id) => id.startsWith("san-lorenzo-makati-alumin"))).toEqual([
      "san-lorenzo-makati-aluminium",
    ]);
    for (const slug of ["san-lorenzo-makati-aluminium", "san-lorenzo-makati-aluminum"]) {
      expect(merged.find((p) => p.id === canonicalProjectSlug(slug))).toBeDefined();
    }
  });

  it("keeps a fallback project the CMS response omits entirely", () => {
    // This is the regression: a replace would drop every project not returned.
    const merged = mergeProject(fallbackProject, [cmsRow({ slug: "las-pinas-residence" })]);
    expect(merged.length).toBe(fallbackProject.length);
    expect(merged.find((p) => p.id === "cebu-s-residences")).toBeDefined();
  });

  it("does not let blank CMS fields erase verified fallback data", () => {
    const verified = fallbackProject.find((p) => p.id === "san-lorenzo-makati-aluminium");
    expect(verified).toBeDefined();
    const merged = mergeProject(fallbackProject, [cmsRow({ location: "", title: "   " })]);
    const project = merged.find((p) => p.id === "san-lorenzo-makati-aluminium");
    expect(project?.location).toBe(verified?.location);
    expect(project?.name).toBe(verified?.name);
  });

  it("drops a CMS-only row too incomplete to render", () => {
    const merged = mergeProject(fallbackProject, [
      cmsRow({ slug: "ghost-project", cover_path: null, location: null }),
    ]);
    expect(merged.find((p) => p.id === "ghost-project")).toBeUndefined();
  });

  it("still accepts a complete CMS-only row", () => {
    const merged = mergeProject(fallbackProject, [
      cmsRow({ slug: "brand-new-project", cover_path: "/images/x.jpg", location: "Cebu" }),
    ]);
    expect(merged.find((p) => p.id === "brand-new-project")).toBeDefined();
  });
});

describe("gallery states", () => {
  it.each([0, 1, 2, 3, 5])("preserves a %i-photo gallery from the CMS", (count) => {
    const gallery = Array.from({ length: count }, (_, i) => `/images/g${i}.jpg`);
    const project = projectFromCms(cmsRow({ gallery_paths: gallery }));
    expect(project.gallery ?? []).toHaveLength(count);
  });

  it("falls back to the verified gallery when the CMS sends none", () => {
    const verified = fallbackProject.find((p) => (p.gallery?.length ?? 0) > 0);
    expect(verified).toBeDefined();
    const project = projectFromCms(cmsRow({ slug: verified!.id, gallery_paths: [] }), verified);
    expect(project.gallery).toEqual(verified!.gallery);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectPhotoSwitcher, { type ProjectPhoto } from "@/components/shared/ProjectPhotoSwitcher";
import { canonicalProjectSlug, mergeProject, type CmsProject } from "@/lib/cms-api";
import type { Project } from "@/data/projects";

const fallbackProject: Project = {
  id: "san-lorenzo-makati-aluminium",
  name: "San Lorenzo, Makati",
  location: "San Lorenzo, Makati",
  image: "/fallback.jpg",
  gallery: ["/detail.jpg"],
  category: "doors",
  caption: "Verified fallback caption",
};

function cmsProject(override: Partial<CmsProject> = {}): CmsProject {
  return {
    cms_project_id: 1,
    slug: "san-lorenzo-makati-aluminum",
    title: "San Lorenzo, Makati",
    location: null,
    category: null,
    caption: null,
    description: null,
    cover_path: null,
    gallery_paths: [],
    architect: null,
    quote_text: null,
    quote_attribution: null,
    project_year: null,
    systems_used: [],
    published_at: "2026-07-18T00:00:00.000Z",
    ...override,
  };
}

describe("project slug and CMS merge", () => {
  it("canonicalizes the American spelling to the published British slug", () => {
    expect(canonicalProjectSlug("san-lorenzo-makati-aluminum")).toBe(
      "san-lorenzo-makati-aluminium",
    );
    expect(canonicalProjectSlug("bogus-project")).toBe("bogus-project");
  });

  it("merges partial CMS data without deleting verified fallback content", () => {
    const project = mergeProject([fallbackProject], [cmsProject({ description: "CMS detail" })]);

    expect(project).toHaveLength(1);
    expect(project[0]).toMatchObject({
      id: "san-lorenzo-makati-aluminium",
      image: "/fallback.jpg",
      gallery: ["/detail.jpg"],
      caption: "Verified fallback caption",
      description: "CMS detail",
    });
  });

  it("keeps fallback-only entries when the CMS response is empty", () => {
    expect(mergeProject([fallbackProject], [])).toEqual([fallbackProject]);
  });

  it("keeps incomplete CMS-only drafts out of the public project archive", () => {
    const incomplete = cmsProject({
      cms_project_id: 2,
      slug: "cms-only-draft",
      title: "CMS-only draft",
      location: "Makati",
      cover_path: null,
    });

    expect(mergeProject([], [incomplete])).toEqual([]);
  });

  it("publishes a complete CMS-only project card", () => {
    const complete = cmsProject({
      cms_project_id: 3,
      slug: "cms-only-complete",
      title: "CMS-only complete",
      location: "Makati",
      cover_path: "/cms-cover.jpg",
    });

    expect(mergeProject([], [complete])).toEqual([
      expect.objectContaining({
        id: "cms-only-complete",
        name: "CMS-only complete",
        location: "Makati",
        image: "/cms-cover.jpg",
      }),
    ]);
  });
});

describe("project photo state", () => {
  for (const count of [1, 2, 3, 5]) {
    it(`renders a truthful ${count}-photo state`, () => {
      const photo: ProjectPhoto[] = Array.from({ length: count }, (_, index) => ({
        src: `/photo-${index + 1}.jpg`,
        alt: `Project photo ${index + 1}`,
        caption: "San Lorenzo, Makati",
      }));
      const { container, unmount } = render(<ProjectPhotoSwitcher photos={photo} />);

      expect(screen.getByRole("group", { name: "Project gallery" })).toBeInTheDocument();
      expect(screen.queryAllByRole("button")).toHaveLength(count > 1 ? count : 0);
      expect(container.querySelectorAll("img")).toHaveLength(count + (count > 1 ? count : 0));
      unmount();
    });
  }
});

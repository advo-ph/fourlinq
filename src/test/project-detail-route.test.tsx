import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Behavioural cover for the /projects/:slug outage found live on 2026-07-18.
 *
 * The live CMS returned `san-lorenzo-makati-aluminum` while the published URL
 * and the verified fallback used `san-lorenzo-makati-aluminium`. Both spellings
 * redirected to /inspiration, so the project was unreachable:
 *
 *   - the British slug broke because the CMS response REPLACED the fallback;
 *   - the American slug broke because the page redirected on the first render,
 *     before the CMS request had settled.
 *
 * These assert the page's routing outcome, not the merge helper's return value.
 *
 * NOTE 2026-07-25: ProjectHeroGallery renders two <h1> elements in the DOM
 * simultaneously (one for the desktop layout, one for mobile) using the
 * dual-panel responsive pattern. Tests use getAllByRole to accommodate this.
 */

const cmsRow = {
  cms_project_id: "1",
  slug: "san-lorenzo-makati-aluminum", // the American spelling, as production stores it
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
};

// Resolve the CMS on a later tick so the "redirect before it settles" race is real.
const fetchProjects = vi.fn();
vi.mock("@/lib/cms-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms-api")>("@/lib/cms-api");
  return { ...actual, fetchProjects: () => fetchProjects() };
});

const { default: ProjectDetail } = await import("@/pages/ProjectDetail");

function renderAt(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/projects/${slug}`]}>
      <Routes>
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/inspiration" element={<div>INSPIRATION GALLERY</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  fetchProjects.mockReset();
  fetchProjects.mockImplementation(
    () => new Promise((resolve) => setTimeout(() => resolve([cmsRow]), 10)),
  );
});
afterEach(cleanup);

describe("/projects/:slug reachability", () => {
  it("resolves the published British slug even though the CMS stores the American one", async () => {
    renderAt("san-lorenzo-makati-aluminium");
    // ProjectHeroGallery renders two h1s (desktop + mobile panels), use getAllByRole.
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0));
    expect(screen.queryByText("INSPIRATION GALLERY")).not.toBeInTheDocument();
  });

  it("resolves the American slug without redirecting before the CMS settles", async () => {
    renderAt("san-lorenzo-makati-aluminum");
    // The pre-settle frame must NOT already be the gallery.
    expect(screen.queryByText("INSPIRATION GALLERY")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0));
    expect(screen.queryByText("INSPIRATION GALLERY")).not.toBeInTheDocument();
  });

  it("keeps a fallback project the CMS response omits", async () => {
    renderAt("cebu-s-residences"); // present in the fallback, absent from the mocked CMS
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0));
    expect(screen.queryByText("INSPIRATION GALLERY")).not.toBeInTheDocument();
  });

  it("still redirects a genuinely unknown slug, but only once settled", async () => {
    renderAt("no-such-project-anywhere");
    await waitFor(() => expect(screen.getByText("INSPIRATION GALLERY")).toBeInTheDocument());
  });

  it("survives a failed CMS request by keeping the verified fallback", async () => {
    fetchProjects.mockImplementation(() => Promise.reject(new Error("network")));
    renderAt("san-lorenzo-makati-aluminium");
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0));
    expect(screen.queryByText("INSPIRATION GALLERY")).not.toBeInTheDocument();
  });
});

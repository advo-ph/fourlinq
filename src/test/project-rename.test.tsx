import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Behavioural cover for the admin rename feature (project_name override).
 *
 * Renaming a project writes a `project_name` override row rather than touching
 * the slug, directory, or image paths. The public page must therefore prefer
 * projectNames[id] from the merged API over the static/CMS name, and fall back
 * to the static name for every project that has never been renamed.
 *
 * NOTE: ProjectHeroGallery renders two <h1> elements (desktop + mobile panels),
 * so these assert against getAllByRole, matching project-detail-route.test.tsx.
 */

// Mutable across tests: vi.mock is hoisted above the module factory, so the
// per-test payload has to be reachable through a hoisted container.
const state = vi.hoisted(() => ({ projectNames: {} as Record<string, string> }));

const mergedPayload = () => ({
  projectCategoryImages: {},
  projectDerivedTags: {},
  projectOrder: [],
  projectCategoryOrder: { windows: [], doors: [], interior: [], exterior: [] },
  hiddenImages: {},
  replacedImages: {},
  overrideCount: 0,
  projectRatios: {},
  projectNames: state.projectNames,
  hiddenProjects: [],
  deletedProjects: [],
  projectCoverImages: {},
  projectGalleryImages: {},
});

vi.mock("@/lib/merged-project-images", () => ({
  fetchMergedProjectImagesFresh: vi.fn(() => Promise.resolve(mergedPayload())),
  fetchMergedProjectImages: vi.fn(() => Promise.resolve(mergedPayload())),
}));

// Keep the CMS out of these tests — the static fallback supplies the baseline
// name, which is exactly what a rename has to win against.
vi.mock("@/lib/cms-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cms-api")>("@/lib/cms-api");
  return { ...actual, fetchProjects: () => Promise.reject(new Error("no cms in test")) };
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
  state.projectNames = {};
});
afterEach(cleanup);

describe("project rename override on /projects/:slug", () => {
  // Fixture note: this project's catalog name is derived from its area
  // ("Amara, Cebu"), so these cases also prove the derived default and the
  // admin override coexist — the override wins, and clearing it lands back on
  // the derived name rather than a stale hand-written one.
  it("renders the derived catalog name when the project has never been renamed", async () => {
    renderAt("cebu-c-residence-amara");
    await waitFor(() =>
      expect(
        screen.getAllByRole("heading", { level: 1 }).some((h) => h.textContent === "Amara, Cebu"),
      ).toBe(true),
    );
  });

  it("renders the admin-set name instead of the static one", async () => {
    state.projectNames = { "cebu-c-residence-amara": "Renamed In Admin" };
    renderAt("cebu-c-residence-amara");
    await waitFor(() =>
      expect(
        screen.getAllByRole("heading", { level: 1 }).some((h) => h.textContent === "Renamed In Admin"),
      ).toBe(true),
    );
    expect(
      screen.queryAllByRole("heading", { level: 1 }).some((h) => h.textContent === "Amara, Cebu"),
    ).toBe(false);
  });

  it("leaves other projects on their static names", async () => {
    // A rename is keyed by project id — it must not leak onto siblings.
    state.projectNames = { "some-other-project": "Should Not Appear" };
    renderAt("cebu-c-residence-amara");
    await waitFor(() =>
      expect(
        screen.getAllByRole("heading", { level: 1 }).some((h) => h.textContent === "Amara, Cebu"),
      ).toBe(true),
    );
    expect(screen.queryByText("Should Not Appear")).not.toBeInTheDocument();
  });

  it("still resolves the project by its unchanged slug after a rename", async () => {
    // The whole point of the override: the URL keeps working.
    state.projectNames = { "cebu-c-residence-amara": "Renamed In Admin" };
    renderAt("cebu-c-residence-amara");
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0));
    expect(screen.queryByText("INSPIRATION GALLERY")).not.toBeInTheDocument();
  });
});

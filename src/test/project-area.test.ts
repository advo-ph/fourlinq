import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import {
  groupProjectByArea,
  hasConfirmedArea,
  populatedRegionFilter,
  projectLocationLabel,
  REGION_CODE,
  UNKNOWN_REGION_CODE,
  UNKNOWN_REGION_LABEL,
  type ProjectArea,
} from "@/data/project-area";

/**
 * Tripwire: count of catalog projects with any defendable structured area.
 * Bump only when a newly confirmed client address is added — never to
 * paper over a quiet backfill of guessed places.
 */
const CONFIRMED_AREA_COUNT = 38;

describe("projectLocationLabel", () => {
  it.each([
    {
      name: "village + city uses em dash",
      area: { village: "Amara", city: "Cebu" } satisfies ProjectArea,
      location: "Liloan",
      expected: "Amara — Cebu",
    },
    {
      name: "San Lorenzo — Makati",
      area: { village: "San Lorenzo", city: "Makati", region_code: "metro_manila" as const },
      location: "Makati",
      expected: "San Lorenzo — Makati",
    },
    {
      name: "village only",
      area: { village: "Ayala Alabang" } satisfies ProjectArea,
      location: "Muntinlupa",
      expected: "Ayala Alabang",
    },
    {
      name: "city + province without village",
      area: { city: "Lipa", province: "Batangas" } satisfies ProjectArea,
      location: "Batangas",
      expected: "Lipa, Batangas",
    },
    {
      name: "city only",
      area: { city: "Cebu City", region_code: "cebu" as const },
      location: "Cebu City",
      expected: "Cebu City",
    },
    {
      name: "empty area falls back to verified location",
      area: {} satisfies ProjectArea,
      location: "Philippines",
      expected: "Philippines",
    },
    {
      name: "undefined area falls back to verified location",
      area: undefined,
      location: "Las Piñas",
      expected: "Las Piñas",
    },
  ])("$name", ({ area, location, expected }) => {
    expect(projectLocationLabel(area, location)).toBe(expected);
  });

  it("uses the Unicode em dash (U+2014), not a hyphen or en dash", () => {
    const label = projectLocationLabel({ village: "Amara", city: "Cebu" }, "Liloan");
    expect(label).toBe("Amara — Cebu");
    expect(label).toContain("\u2014");
    expect(label).not.toContain("-");
    expect(label).not.toContain("\u2013");
  });
});

describe("no invented project area data", () => {
  it(`locks confirmed-area count at ${CONFIRMED_AREA_COUNT}`, () => {
    const confirmed = projects.filter((p) => hasConfirmedArea(p.area));
    expect(confirmed).toHaveLength(CONFIRMED_AREA_COUNT);
  });

  it("every project with region_code also has a non-empty verified location", () => {
    for (const p of projects) {
      if (p.area?.region_code) {
        expect(p.location?.trim().length, p.id).toBeGreaterThan(0);
        expect(p.location).not.toBe("Philippines");
      }
    }
  });

  it("never assigns a region_code to Philippines-only projects", () => {
    for (const p of projects.filter((p) => p.location === "Philippines")) {
      expect(p.area?.region_code, p.id).toBeUndefined();
      expect(hasConfirmedArea(p.area), p.id).toBe(false);
    }
  });

  it("does not invent village Amara on the Liloan project without client confirmation", () => {
    const amara = projects.find((p) => p.id === "cebu-c-residence-amara");
    expect(amara).toBeDefined();
    expect(amara!.area?.village).toBeUndefined();
  });
});

describe("area grouping axis", () => {
  it("only includes regions that have at least one project", () => {
    const group = groupProjectByArea(projects);
    for (const g of group) {
      expect(g.project.length).toBeGreaterThan(0);
    }
  });

  it("does not render empty client-named regions as populated", () => {
    const group = groupProjectByArea(projects);
    const populated = new Set(group.map((g) => g.region_code));
    // Client-named regions with zero projects in this catalog must stay absent.
    for (const code of Object.keys(REGION_CODE) as (keyof typeof REGION_CODE)[]) {
      const hasAny = projects.some((p) => p.area?.region_code === code);
      if (!hasAny) {
        expect(populated.has(code), `${code} must not appear empty`).toBe(false);
      }
    }
  });

  it("puts projects without region_code in the unknown bucket, never a guessed region", () => {
    const group = groupProjectByArea(projects);
    const unknown = group.find((g) => g.region_code === UNKNOWN_REGION_CODE);
    expect(unknown?.label).toBe(UNKNOWN_REGION_LABEL);
    const unknownIds = new Set((unknown?.project ?? []).map((p) => p.id));
    for (const p of projects) {
      if (!p.area?.region_code) {
        expect(unknownIds.has(p.id), p.id).toBe(true);
      } else {
        expect(unknownIds.has(p.id), p.id).toBe(false);
      }
    }
  });

  it("populatedRegionFilter matches only non-empty groups", () => {
    const filter = populatedRegionFilter(projects);
    const group = groupProjectByArea(projects);
    expect(filter.map((f) => f.code)).toEqual(group.map((g) => g.region_code));
    expect(filter.every((f) => f.label.length > 0)).toBe(true);
  });

  it("includes Metro Manila and Cebu when catalog has those region_codes", () => {
    const filter = populatedRegionFilter(projects);
    const code = filter.map((f) => f.code);
    expect(code).toContain("metro_manila");
    expect(code).toContain("cebu");
    expect(code).toContain(UNKNOWN_REGION_CODE);
  });
});

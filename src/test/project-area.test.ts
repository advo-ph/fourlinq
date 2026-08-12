import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";
import {
  groupProjectByArea,
  hasConfirmedArea,
  populatedRegionFilter,
  projectAreaName,
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
 *
 * Deliberately unchanged by the 2026-08-12 village pass: that added village
 * and region_code parts to rows that already carried an area. No project
 * gained an area it did not have, so this number must not move for it.
 */
const CONFIRMED_AREA_COUNT = 38;

describe("projectLocationLabel", () => {
  it.each([
    {
      name: "village + region pairs with the region, not the municipality",
      area: { village: "Amara", city: "Liloan", region_code: "cebu" as const },
      location: "Liloan",
      expected: "Amara, Cebu",
    },
    {
      name: "village + city when no region is confirmed",
      area: { village: "Amara", city: "Cebu" } satisfies ProjectArea,
      location: "Liloan",
      expected: "Amara, Cebu",
    },
    {
      name: "Metro Manila villages pair with the city, not the region",
      area: { village: "San Lorenzo", city: "Makati", region_code: "metro_manila" as const },
      location: "Makati",
      expected: "San Lorenzo, Makati",
    },
    {
      name: "village + province",
      area: { village: "Nuvali", province: "Laguna" } satisfies ProjectArea,
      location: "Nuvali",
      expected: "Nuvali, Laguna",
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
      name: "province only",
      area: { province: "Bataan" } satisfies ProjectArea,
      location: "Bataan",
      expected: "Bataan",
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

  /**
   * The separator was an em dash until the client asked for a comma on
   * 2026-08-12 ("Amara, Cebu"). Docs written before that date still quote the
   * em dash convention, so this guards against it being "restored" by someone
   * reading those instead of this.
   */
  it("joins with a comma, never an em dash or en dash", () => {
    const area: ProjectArea[] = [
      { village: "Amara", city: "Liloan", region_code: "cebu" },
      { village: "San Lorenzo", city: "Makati", region_code: "metro_manila" },
      { village: "Nuvali", province: "Laguna" },
      { city: "Lipa", province: "Batangas" },
    ];
    for (const a of area) {
      const label = projectLocationLabel(a, "unused");
      expect(label).toContain(", ");
      expect(label).not.toContain("\u2014");
      expect(label).not.toContain("\u2013");
    }
    expect(
      projectLocationLabel({ village: "Amara", city: "Liloan", region_code: "cebu" }, "Liloan"),
    ).toBe("Amara, Cebu");
  });

  it("renders no em dash anywhere in the live catalog", () => {
    for (const p of projects) {
      expect(p.name, p.id).not.toContain("\u2014");
    }
  });
});

describe("projectAreaName", () => {
  it("uses the area label when a place is confirmed", () => {
    expect(projectAreaName({ village: "Amara", region_code: "cebu" }, "Private Residence")).toBe(
      "Amara, Cebu",
    );
  });

  it.each([
    { name: "undefined area", area: undefined },
    { name: "empty area", area: {} satisfies ProjectArea },
    // region_code alone yields no label parts - it must not leak "Cebu" as a name.
    { name: "region_code with no place parts", area: { region_code: "cebu" as const } },
    // The regression case: a confirmed city is NOT enough to rename a project.
    // Deriving here would have turned "Cebu M. Residence" into "Cebu".
    { name: "city and region but no village", area: { city: "Cebu", region_code: "cebu" as const } },
    { name: "province but no village", area: { province: "Bataan" } satisfies ProjectArea },
  ])("falls back to the catalog name for $name", ({ area }) => {
    expect(projectAreaName(area, "Private Residence")).toBe("Private Residence");
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

  /**
   * Replaces the pre-2026-08-12 test that asserted Amara was NOT set. The
   * client released the subdivision names carried in project slugs on that
   * date and gave "amara - cebu" as the worked example, so Amara is now
   * confirmed. The guard is inverted rather than deleted: the exact set of
   * villages is locked, so a twelfth one cannot be added quietly.
   */
  const CONFIRMED_VILLAGE: Readonly<Record<string, string>> = {
    "san-lorenzo-makati-aluminium": "San Lorenzo",
    "nuvali-laguna-residence": "Nuvali",
    "nuvali-laguna-residence-b": "Nuvali",
    "nuvali-laguna-residence-c": "Nuvali",
    "cebu-sch-residence-monterrazas": "Monterrazas",
    "cebu-ta-residence-monterrazas": "Monterrazas",
    "cebu-residence-monterrazas": "Monterrazas",
    "cebu-s-residence-maria-luisa": "Maria Luisa",
    "cebu-es-residence-maria-luisa": "Maria Luisa",
    "cebu-p-residence-kishanta": "Kishanta",
    "cebu-aa-residence-vista-grande": "Vista Grande",
    "cebu-residence-vista-grande-talisay": "Vista Grande",
    "cebu-m-residence-molave": "Molave",
    "cebu-c-residence-amara": "Amara",
  };

  it("locks the exact set of client-confirmed villages", () => {
    const actual = Object.fromEntries(
      projects.filter((p) => p.area?.village).map((p) => [p.id, p.area!.village!]),
    );
    expect(actual).toEqual(CONFIRMED_VILLAGE);
  });

  it("confirms Amara on the Liloan project and renders it as the client asked", () => {
    const amara = projects.find((p) => p.id === "cebu-c-residence-amara");
    expect(amara).toBeDefined();
    expect(amara!.area?.village).toBe("Amara");
    expect(amara!.name).toBe("Amara, Cebu");
  });

  /**
   * Privacy guard. These slug fragments read as client surnames or initials,
   * not places, so they were deliberately not promoted to villages. "pardo" is
   * a Cebu City barangay — real, but not a subdivision, and "Pardo, Cebu"
   * would be less precise than "Cebu City".
   */
  it.each([
    "cebu-f-residence-fortunado",
    "cebu-maratas-residence",
    "cebu-cmsprs",
    "cebu-n-residence-pardo",
    "cebu-n-residence-pardo-b",
  ])("does not promote the non-place slug fragment in %s", (id) => {
    const project = projects.find((p) => p.id === id);
    expect(project, id).toBeDefined();
    expect(project!.area?.village, id).toBeUndefined();
  });

  /**
   * The point of the rename: once a village is known, the project is named for
   * the place, not the client's initials ("Liloan C. Residence" -> "Amara,
   * Cebu"). Without a village there is nothing to put in front, so the
   * residence name stays — see the next test.
   */
  it("names every village project for its place, never client initials", () => {
    const village = projects.filter((p) => p.area?.village);
    expect(village.length).toBeGreaterThan(0);
    for (const p of village) {
      expect(p.name, p.id).toBe(projectLocationLabel(p.area, p.location));
      expect(p.name, p.id).not.toMatch(/\b[A-Z]{1,3}\.\s/);
    }
  });

  /**
   * Regression guard. The first cut of the derivation replaced the name with
   * the area label whenever *any* area part was confirmed, which flattened 24
   * projects to a bare place — "Cebu M. Residence" became "Cebu", and four
   * unrelated houses all ended up called "Cebu". A project with no village
   * must keep the residence name that says which house it is.
   */
  it("keeps the residence name when there is no village", () => {
    const noVillage = projects.filter((p) => !p.area?.village);
    expect(noVillage.length).toBeGreaterThan(0);
    for (const p of noVillage) {
      // Never a bare place: every one of these names identifies a residence.
      expect(p.name, p.id).toMatch(/Residence/);
    }
    // The specific projects that regressed.
    const named = (id: string) => projects.find((p) => p.id === id)?.name;
    expect(named("cebu-maratas-residence")).toBe("Cebu M. Residence");
    expect(named("cebu-cmsprs")).toBe("Cebu Residence");
    expect(named("cebu-t-residence-cebu-city")).toBe("Cebu T. Residence");
    expect(named("las-pinas-residence")).toBe("Las Piñas Residence");
    expect(named("bataan-s-residence")).toBe("Bataan S. Residence");
  });

  /**
   * Duplicate names are expected and correct — three projects really are in
   * Monterrazas, and "Private Residence" already repeats 23 times because that
   * is the client's own anonymising convention. Ids are the identifier; the
   * name is a location. Do not "fix" this by adding II/III suffixes, which
   * would assert an ordering the catalog does not have.
   */
  it("keeps ids unique (names are deliberately not)", () => {
    const id = projects.map((p) => p.id);
    expect(new Set(id).size).toBe(id.length);
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

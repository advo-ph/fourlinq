/**
 * Structured project area + label derivation for /inspiration.
 *
 * Labels follow the client convention: village then location, joined by a
 * comma ("Amara, Cebu"). The separator was an em dash until 2026-08-12, when
 * the client asked for a comma instead — it reads cleaner on the cards, and it
 * makes the village and no-village forms ("Lipa, Batangas") one convention
 * rather than two. `SEPARATOR` is the single owner of that choice.
 *
 * Region codes drive the area axis. Every part of ProjectArea is optional —
 * omit what the client has not confirmed.
 *
 * Place names are client-confirmed only. The village names now present were
 * authorized by the client on 2026-08-12, which released the subdivision names
 * already encoded in project slugs; see the DEFENDABLE_AREA note in
 * `projects.ts` for what was promoted and what was deliberately withheld.
 */

/** Client-named regions plus room to extend (she said "etc."). One-line add. */
export const REGION_CODE = {
  metro_manila: "Metro Manila",
  cebu: "Cebu",
  davao: "Davao",
  zamboanga: "Zamboanga",
  butuan: "Butuan",
  cagayan_de_oro: "Cagayan de Oro",
  tacloban: "Tacloban",
  ilocos: "Ilocos",
} as const;

export type RegionCode = keyof typeof REGION_CODE;

/** Grouping key for projects with no confirmed region_code. */
export const UNKNOWN_REGION_CODE = "unknown" as const;

export const UNKNOWN_REGION_LABEL = "Area to be confirmed";

/** Where the install is. Every part optional — omit what is not confirmed. */
export interface ProjectArea {
  village?: string;
  city?: string;
  province?: string;
  region_code?: RegionCode;
}

/** The one place the label separator is decided. Comma since 2026-08-12. */
const SEPARATOR = ", ";

const join = (a: string, b: string): string => `${a}${SEPARATOR}${b}`;

/**
 * Single owner of the card/detail location label.
 *
 * A village is paired with the widest place the client names it by: the city
 * for Metro Manila ("San Lorenzo, Makati"), the region everywhere else
 * ("Amara, Cebu" — not "Amara, Liloan"). That asymmetry is the client's, and
 * it is why region_code is consulted before city.
 *
 * - village + metro_manila + city → "San Lorenzo, Makati"
 * - village + region_code        → "Amara, Cebu"
 * - village + city               → "Amara, Liloan"      (no region confirmed)
 * - village + province           → "Nuvali, Laguna"
 * - village only                 → "Ayala Alabang"
 * - no village                   → "Lipa, Batangas" / "Cebu City" / "Bataan"
 * - nothing confirmed            → verified location string, unchanged
 */
export function projectLocationLabel(
  area: ProjectArea | undefined,
  location: string,
): string {
  if (!area) return location;

  const village = area.village?.trim();
  const city = area.city?.trim();
  const province = area.province?.trim();
  const region = area.region_code ? REGION_CODE[area.region_code] : undefined;

  if (village) {
    if (area.region_code === "metro_manila" && city) return join(village, city);
    if (region) return join(village, region);
    if (city) return join(village, city);
    if (province) return join(village, province);
    return village;
  }

  if (city && province) return join(city, province);
  if (city) return city;
  if (province) return province;
  return location;
}

/**
 * Display name for a project: the area label when anything is confirmed,
 * otherwise the catalog's own name (which is "Private Residence" for every
 * project with no confirmed place).
 *
 * Passing "" as the location suppresses the fall-through in
 * projectLocationLabel, so "no usable area parts" comes back as "" and the
 * fallback takes over. That keeps one derivation instead of two.
 */
export function projectAreaName(
  area: ProjectArea | undefined,
  fallbackName: string,
): string {
  return projectLocationLabel(area, "") || fallbackName;
}

export interface AreaGroup<T> {
  region_code: RegionCode | typeof UNKNOWN_REGION_CODE;
  label: string;
  project: T[];
}

function regionLabel(code: RegionCode | typeof UNKNOWN_REGION_CODE): string {
  if (code === UNKNOWN_REGION_CODE) return UNKNOWN_REGION_LABEL;
  return REGION_CODE[code] ?? code;
}

/**
 * Group projects by region_code. Only regions that actually have ≥1 project
 * appear. Empty client-named regions are omitted. Unknown (no region_code)
 * lands in a single "Area to be confirmed" bucket when present.
 */
export function groupProjectByArea<T extends { area?: ProjectArea }>(
  project: readonly T[],
): AreaGroup<T>[] {
  const bucket = new Map<string, T[]>();

  for (const p of project) {
    const code = p.area?.region_code ?? UNKNOWN_REGION_CODE;
    const list = bucket.get(code);
    if (list) list.push(p);
    else bucket.set(code, [p]);
  }

  // Named regions first, in REGION_CODE declaration order; unknown last.
  const ordered: AreaGroup<T>[] = [];
  for (const code of Object.keys(REGION_CODE) as RegionCode[]) {
    const list = bucket.get(code);
    if (list && list.length > 0) {
      ordered.push({ region_code: code, label: regionLabel(code), project: list });
    }
  }
  const unknown = bucket.get(UNKNOWN_REGION_CODE);
  if (unknown && unknown.length > 0) {
    ordered.push({
      region_code: UNKNOWN_REGION_CODE,
      label: UNKNOWN_REGION_LABEL,
      project: unknown,
    });
  }
  return ordered;
}

/** Region filter options that actually have projects (plus optional "all"). */
export function populatedRegionFilter(
  project: readonly { area?: ProjectArea }[],
): { code: RegionCode | typeof UNKNOWN_REGION_CODE; label: string }[] {
  return groupProjectByArea(project).map((g) => ({
    code: g.region_code,
    label: g.label,
  }));
}

/** True when any structured area part is present. */
export function hasConfirmedArea(area: ProjectArea | undefined): boolean {
  if (!area) return false;
  return Boolean(
    area.village?.trim() ||
      area.city?.trim() ||
      area.province?.trim() ||
      area.region_code,
  );
}

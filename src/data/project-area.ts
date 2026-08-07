/**
 * Structured project area + label derivation for /inspiration.
 *
 * Labels follow the client convention (village then city with an em dash).
 * Region codes drive the area axis. Every part of ProjectArea is optional —
 * omit what the client has not confirmed. Never invent a place name here.
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

/**
 * Single owner of the card/detail location label.
 *
 * - village + city → "Amara — Cebu" (em dash U+2014)
 * - village only → village
 * - no village → "city, province" when those parts exist
 * - nothing confirmed → existing verified location string, unchanged
 */
export function projectLocationLabel(
  area: ProjectArea | undefined,
  location: string,
): string {
  if (!area) return location;

  const village = area.village?.trim();
  const city = area.city?.trim();
  const province = area.province?.trim();

  if (village && city) return `${village} — ${city}`;
  if (village) return village;
  if (city && province) return `${city}, ${province}`;
  if (city) return city;
  if (province) return province;
  return location;
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

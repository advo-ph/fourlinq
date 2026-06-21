import { useQuery } from "@tanstack/react-query";

/**
 * Shared aluminium-line data source.
 *
 * Used by both /aluminium (the deep-dive page) and /products (the material
 * toggle), so the two surfaces never drift. Data comes from the
 * cms_aluminium_system table via /api/cms/aluminium; the static fallback
 * below keeps both pages rendering if the API is unreachable and mirrors
 * exactly what the migration seeds. Tita edits these from /admin > Content
 * > Aluminium.
 */

export interface AluminiumSystem {
  cms_aluminium_system_id?: number;
  slug: string;
  name: string;
  summary: string | null;
  best_for: string | null;
  hero_image_url?: string | null;
  spec_sheet_url?: string | null;
}

// Static fallback — same content the migration seeds into the table.
export const ALUMINIUM_FALLBACK: AluminiumSystem[] = [
  {
    slug: "thermal-break",
    name: "Thermal Break",
    summary:
      "Aluminium profile with a non-conductive polyamide strip between the inner and outer halves of the frame. Cuts heat transfer from outside in (and condensation in air-conditioned interiors). The default choice for high-end residential and any space that's cooled year-round.",
    best_for: "Air-conditioned interiors, west-facing facades, climate-controlled commercial.",
  },
  {
    slug: "non-thermal-break",
    name: "Non-Thermal Break",
    summary:
      "Solid aluminium profile without the thermal isolator. Slimmer sightlines, lower cost, simpler fabrication. Standard for projects where conducted heat is not the primary concern.",
    best_for: "Naturally ventilated spaces, covered lanais, secondary structures.",
  },
  {
    slug: "alu-slim",
    name: "Alu Slim",
    summary:
      "Minimum-sightline aluminium system engineered for maximum glass area. The frame nearly disappears against the glazing. For projects where the architecture is the view and the window should not be.",
    best_for: "Floor-to-ceiling glazing, panoramic openings, contemporary residential.",
  },
];

async function fetchAluminium(): Promise<AluminiumSystem[]> {
  const res = await fetch("/api/cms/aluminium");
  if (!res.ok) throw new Error(`/api/cms/aluminium ${res.status}`);
  const payload = (await res.json()) as { items: AluminiumSystem[] };
  if (!payload.items?.length) throw new Error("empty aluminium list");
  return payload.items;
}

/** Aluminium systems with API → static fallback. Never returns empty. */
export function useAluminium() {
  const query = useQuery({
    queryKey: ["aluminium"],
    queryFn: fetchAluminium,
    placeholderData: ALUMINIUM_FALLBACK,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const systems =
    query.error || !query.data?.length ? ALUMINIUM_FALLBACK : query.data;

  return { systems, isLoading: query.isLoading };
}

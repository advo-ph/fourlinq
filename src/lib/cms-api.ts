/**
 * Thin client for /api/cms/* endpoints. Returns shapes that match the
 * legacy hardcoded data types so existing components keep working with
 * small mapping layers.
 */

import type { Project } from "@/data/projects";

const API_BASE = import.meta.env.VITE_API_URL || "";

export interface CmsProject {
  cms_project_id: string | number;
  slug: string;
  title: string;
  location: string | null;
  category: string | null;
  caption: string | null;
  description: string | null;
  cover_path: string | null;
  gallery_paths: string[];
  architect: string | null;
  quote_text: string | null;
  quote_attribution: string | null;
  project_year: number | null;
  systems_used: string[];
  is_featured?: boolean;
  published_at: string;
}

export interface CmsNewsPost {
  cms_news_post_id: string | number;
  slug: string;
  title: string;
  excerpt: string | null;
  body?: string | null;
  category: "project" | "product" | "event" | "press";
  cover_path: string | null;
  external_link: string | null;
  internal_link: string | null;
  published_at: string;
}

export const PROJECT_SLUG_ALIAS: Readonly<Record<string, string>> = Object.freeze({
  "san-lorenzo-makati-aluminum": "san-lorenzo-makati-aluminium",
});

export function canonicalProjectSlug(slug: string): string {
  return PROJECT_SLUG_ALIAS[slug] ?? slug;
}

function textValue(value: string | null | undefined, fallback = ""): string {
  const normalizedValue = value?.trim();
  return normalizedValue || fallback;
}

export function projectFromCms(row: CmsProject, fallback?: Project): Project {
  const projectId = canonicalProjectSlug(row.slug);
  const gallery = (row.gallery_paths ?? []).filter(Boolean);
  const system = (row.systems_used ?? []).filter(Boolean);
  const quoteText = textValue(row.quote_text);

  return {
    id: projectId,
    // A confirmed VILLAGE outranks cms_project.title, and only that. Those are
    // the projects whose name the catalog derives from structured ProjectArea
    // ("Amara, Cebu"); the title column has no area awareness and still holds
    // the pre-2026-08-12 rows migrate-cms-data.ts seeded — i.e. exactly the
    // client-initial names ("Liloan C. Residence") the convention retires. Let
    // the title win there and the rename silently undoes itself in production.
    // Everything else keeps its editorial name, so the CMS stays in charge of
    // it — gating on `area` alone would freeze the 24 projects that have a city
    // but no village and are not area-named at all.
    // The `project_name` override row still beats both; callers apply it after
    // this merge.
    name:
      fallback?.area?.village && fallback.name
        ? fallback.name
        : textValue(row.title, fallback?.name ?? projectId),
    location: textValue(row.location, fallback?.location),
    // CMS has no area fields yet (catalog lane owns migrations). Keep verified
    // fallback structure so /inspiration labels and grouping still work.
    area: fallback?.area,
    image: textValue(row.cover_path, fallback?.image),
    gallery: gallery.length > 0 ? gallery : fallback?.gallery,
    category: (textValue(row.category, fallback?.category) || undefined) as Project["category"],
    caption: textValue(row.caption, fallback?.caption) || undefined,
    description: textValue(row.description, fallback?.description) || undefined,
    architect: textValue(row.architect, fallback?.architect) || undefined,
    year: row.project_year ?? fallback?.year,
    systemsUsed: system.length > 0 ? system : fallback?.systemsUsed,
    quote: quoteText
      ? {
          text: quoteText,
          attribution: textValue(row.quote_attribution, fallback?.quote?.attribution),
        }
      : fallback?.quote,
  };
}

export function mergeProject(
  fallbackProject: readonly Project[],
  cmsProject: readonly CmsProject[],
): Project[] {
  const projectMap = new Map<string, Project>();

  for (const fallback of fallbackProject) {
    const projectId = canonicalProjectSlug(fallback.id);
    projectMap.set(projectId, { ...fallback, id: projectId });
  }

  for (const row of cmsProject) {
    const projectId = canonicalProjectSlug(row.slug);
    const fallback = projectMap.get(projectId);
    const project = projectFromCms(row, fallback);
    if (!fallback && (!project.image || !project.location)) continue;
    projectMap.set(projectId, project);
  }

  return [...projectMap.values()];
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchProjects(): Promise<CmsProject[]> {
  const data = await get<{ items: CmsProject[] }>("/api/cms/projects");
  return data.items;
}

export async function fetchProject(slug: string): Promise<CmsProject | null> {
  try {
    const data = await get<{ item: CmsProject }>(`/api/cms/projects/${slug}`);
    return data.item;
  } catch {
    return null;
  }
}

export async function fetchNews(): Promise<CmsNewsPost[]> {
  const data = await get<{ items: CmsNewsPost[] }>("/api/cms/news");
  return data.items;
}

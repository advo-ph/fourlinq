/**
 * Thin client for /api/cms/* endpoints. Returns shapes that match the
 * legacy hardcoded data types so existing components keep working with
 * small mapping layers.
 */

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

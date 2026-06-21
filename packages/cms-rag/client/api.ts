/**
 * Tiny client for the cms-rag generic routes. Consumers pass their `basePath`
 * (e.g. "/api/admin/cms"). Auth assumed to be handled by `credentials: include`
 * cookies.
 */

export interface EntityFieldDescriptor {
  column: string;
  label?: string;
  type:
    | "text" | "textarea" | "markdown" | "number" | "boolean"
    | "select" | "image" | "string_array" | "json";
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  public?: boolean;
  default?: unknown;
}

export interface EntityDescriptor {
  kind: string;
  label: string;
  labelPlural: string;
  pk: string;
  slugColumn?: string;
  fields: EntityFieldDescriptor[];
}

export class CmsRagApi {
  constructor(private basePath: string) {}

  async json<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.basePath}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      ...init,
    });
    if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} → ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  async listEntities(): Promise<EntityDescriptor[]> {
    const data = await this.json<{ entities: EntityDescriptor[] }>("/_entities");
    return data.entities;
  }

  async list<T = Record<string, unknown>>(kind: string): Promise<T[]> {
    const data = await this.json<{ items: T[] }>(`/${kind}`);
    return data.items;
  }

  async create<T = Record<string, unknown>>(kind: string, body: Record<string, unknown>): Promise<T> {
    return this.json<T>(`/${kind}`, { method: "POST", body: JSON.stringify(body) });
  }

  async update(kind: string, id: number | string, body: Record<string, unknown>): Promise<void> {
    await this.json(`/${kind}/${id}`, { method: "PUT", body: JSON.stringify(body) });
  }

  async remove(kind: string, id: number | string): Promise<void> {
    await this.json(`/${kind}/${id}`, { method: "DELETE" });
  }

  async upload(file: File, altText?: string): Promise<{ cms_media_asset_id: number; file_path: string }> {
    const form = new FormData();
    form.append("file", file);
    if (altText) form.append("alt_text", altText);
    const res = await fetch(`${this.basePath}/media/upload`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    if (!res.ok) {
      let message = `Upload failed: ${res.status}`;
      const text = await res.text().catch(() => "");
      try {
        const data = JSON.parse(text) as { error?: string };
        if (data.error) message = data.error;
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }
    return res.json();
  }
}

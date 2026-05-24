/**
 * Provider-agnostic embedding interface.
 * Bring your own provider; Gemini is included as the reference impl.
 */

export type Embedder = (text: string) => Promise<number[]>;

export interface GeminiEmbedConfig {
  apiKey: string;
  /** Gemini model id. Defaults to "gemini-embedding-001". */
  model?: string;
  /** Output dimensionality (Matryoshka truncation). Must match your pgvector column. */
  dimensions?: number;
}

export function createGeminiEmbedder(config: GeminiEmbedConfig): Embedder {
  const model = config.model ?? "gemini-embedding-001";
  const dimensions = config.dimensions ?? 768;
  return async function embed(text: string): Promise<number[]> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text }] },
          outputDimensionality: dimensions,
        }),
      },
    );
    if (!res.ok) throw new Error(`Embed ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { embedding: { values: number[] } };
    return data.embedding.values;
  };
}

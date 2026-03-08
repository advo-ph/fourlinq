import pool from "../db.js";
import { embedText } from "./gemini.js";

/**
 * Retrieve the top-K most relevant knowledge chunks for the given query.
 * Uses pgvector cosine similarity search.
 */
export async function retrieveContext(
  query: string,
  topK: number = 5
): Promise<Array<{ title: string; content: string; tags: string[]; similarity: number }>> {
  try {
    // Try embedding-based search first
    const queryEmbedding = await embedText(query);
    const embeddingStr = `[${queryEmbedding.join(",")}]`;
    const { rows } = await pool.query(
      `SELECT
         kc.title,
         kc.content,
         kc.tags,
         1 - (kc.embedding <=> $1::vector) AS similarity
       FROM knowledge_chunk kc
       JOIN knowledge_base kb ON kc.knowledge_base_id = kb.knowledge_base_id
       WHERE kc.is_active = true AND kb.is_active = true AND kc.embedding IS NOT NULL
       ORDER BY kc.embedding <=> $1::vector
       LIMIT $2`,
      [embeddingStr, topK]
    );
    if (rows.length > 0) return rows;
  } catch (err) {
    console.warn("Embedding search failed, falling back to keyword search:", (err as Error).message);
  }

  // Fallback: keyword-based search using ILIKE
  const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const conditions = keywords.map((_, i) => `(LOWER(kc.title || ' ' || kc.content || ' ' || COALESCE(array_to_string(kc.tags, ' '), '')) LIKE $${i + 1})`);
  const params = keywords.map((k) => `%${k}%`);

  if (conditions.length === 0) {
    // Return top chunks by default
    const { rows } = await pool.query(
      `SELECT kc.title, kc.content, kc.tags, 0.5 AS similarity
       FROM knowledge_chunk kc
       JOIN knowledge_base kb ON kc.knowledge_base_id = kb.knowledge_base_id
       WHERE kc.is_active = true AND kb.is_active = true
       ORDER BY kc.knowledge_chunk_id
       LIMIT $1`,
      [topK]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `SELECT kc.title, kc.content, kc.tags, 0.7 AS similarity
     FROM knowledge_chunk kc
     JOIN knowledge_base kb ON kc.knowledge_base_id = kb.knowledge_base_id
     WHERE kc.is_active = true AND kb.is_active = true
       AND (${conditions.join(" OR ")})
     LIMIT $${keywords.length + 1}`,
    [...params, topK]
  );
  return rows;
}

/**
 * Build the system prompt with injected RAG context for LinQ.
 */
export function buildSystemPrompt(
  context: Array<{ title: string; content: string }>
): string {
  const contextBlock = context
    .map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`)
    .join("\n\n");

  return `You are LinQ, the AI assistant for FourlinQ Windows & Doors — a premium uPVC fenestration company in the Philippines.

PERSONALITY:
- Professional yet warm and approachable — like a knowledgeable showroom consultant
- Proud of FourlinQ products without being pushy
- Use Filipino-English (Taglish) sparingly when it feels natural, but default to English
- Be concise — keep responses under 150 words unless the user asks for details
- Use bullet points and line breaks for readability

KNOWLEDGE:
You have access to the following verified information. Always base your answers on this context. If you don't have information to answer a question, say so honestly and offer to connect them with a human specialist.

${contextBlock}

RULES:
1. Never make up product specifications, prices, or features not in your knowledge
2. For pricing questions, provide the ranges from your knowledge and always recommend a free consultation for exact quotes
3. If asked about competitors, focus on FourlinQ strengths rather than criticizing competitors
4. Proactively suggest the Design Tool (/design-tool) when users discuss configurations
5. Suggest booking a consultation when the conversation reaches a buying stage
6. Contact info: +63 2 8123 4567, info@fourlinq.ph
7. Always format responses in clean markdown`;
}

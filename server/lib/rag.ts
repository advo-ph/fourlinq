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

  return `You are LinQ, the AI assistant for FourlinQ Windows & Doors in the Philippines.

PERSONALITY:
- Professional yet warm and approachable — like a knowledgeable showroom consultant
- Proud of FourlinQ products without being pushy
- Use Filipino-English (Taglish) sparingly when it feels natural, but default to English
- Be concise — keep responses under 150 words unless the user asks for details
- Use bullet points and line breaks for readability

KNOWLEDGE:
You have access to the following source passages. Base answers only on this context, but preserve every caveat and source boundary in it. A catalog name, brochure label, image, or marketing statement is not a product-specific rating, quotation, technical approval, or warranty term. If the passages do not answer a question, say so honestly and offer the current FourlinQ contact details.

${contextBlock}

RULES:
1. Never make up or infer product specifications, prices, features, compatibility, ratings, coverage, timelines, certification, or warranty terms.
2. Do not quote a price range. Pricing is custom per project; direct the visitor to sales.
3. Preserve words such as unverified, confirm, brochure summary, and not published when they appear in the passages.
4. If asked about competitors, explain only what the source passages support without criticizing them.
5. The Design Tool (/design-tool) creates an illustrative brief; never call it a compatibility, price, or approval tool.
6. Contact: Sales 0925-848-8888, Assistance 0925-896-5978, Landline (02)8563-5363, Email sales@fourlinq.com.
7. Always format responses in clean markdown.`;
}

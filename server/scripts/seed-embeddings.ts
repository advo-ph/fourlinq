/**
 * Seed embeddings for all knowledge chunks using Gemini.
 * Run: npx tsx server/scripts/seed-embeddings.ts
 */
import dotenv from "dotenv";
dotenv.config();

import pool from "../db.js";
import { embedText } from "../lib/gemini.js";

async function seedEmbeddings() {
  console.log("🔄 Fetching knowledge chunks without embeddings...");

  const { rows: chunks } = await pool.query(
    `SELECT knowledge_chunk_id, title, content
     FROM knowledge_chunk
     WHERE embedding IS NULL AND is_active = true`
  );

  console.log(`📝 Found ${chunks.length} chunks to embed`);

  let success = 0;
  for (const chunk of chunks) {
    try {
      const textToEmbed = `${chunk.title}\n\n${chunk.content}`;
      const embedding = await embedText(textToEmbed);

      const embeddingStr = `[${embedding.join(",")}]`;
      await pool.query(
        `UPDATE knowledge_chunk SET embedding = $1::vector WHERE knowledge_chunk_id = $2`,
        [embeddingStr, chunk.knowledge_chunk_id]
      );

      success++;
      console.log(`  ✓ [${success}/${chunks.length}] ${chunk.title}`);

      // Rate limit: 100ms between requests
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`  ✗ Failed: ${chunk.title}`, err);
    }
  }

  console.log(`\n✅ Embedded ${success}/${chunks.length} chunks`);
  await pool.end();
}

seedEmbeddings().catch(console.error);

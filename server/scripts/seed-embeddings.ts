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
  let i = 0;
  for (const chunk of chunks) {
    i++;
    const textToEmbed = `${chunk.title}\n\n${chunk.content}`;
    let attempt = 0;
    let lastErr: unknown = null;
    while (attempt < 5) {
      try {
        const embedding = await embedText(textToEmbed);
        const embeddingStr = `[${embedding.join(",")}]`;
        await pool.query(
          `UPDATE knowledge_chunk SET embedding = $1::vector WHERE knowledge_chunk_id = $2`,
          [embeddingStr, chunk.knowledge_chunk_id]
        );
        success++;
        console.log(`  ✓ [${i}/${chunks.length}] ${chunk.title}`);
        lastErr = null;
        break;
      } catch (err: any) {
        lastErr = err;
        const msg = String(err?.message ?? err);
        // Backoff on 429 / 503 / network
        const transient = /429|503|rate|quota|timeout|fetch failed/i.test(msg);
        if (!transient) break;
        const delay = Math.min(2000 * Math.pow(2, attempt), 30000);
        console.warn(`  ↻ retry ${attempt + 1} in ${delay}ms: ${msg.slice(0, 80)}`);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }
    if (lastErr) console.error(`  ✗ [${i}/${chunks.length}] ${chunk.title}: ${String(lastErr).slice(0, 120)}`);
    await new Promise((r) => setTimeout(r, 250)); // base throttle
  }

  console.log(`\n✅ Embedded ${success}/${chunks.length} chunks`);
  await pool.end();
}

seedEmbeddings().catch(console.error);

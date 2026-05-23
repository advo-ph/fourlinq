#!/usr/bin/env node
/**
 * Batch image generation via Gemini API.
 *
 * Reads a manifest of {prompt, output} jobs and generates each one,
 * writing the result directly to disk. Designed for the texture + photo
 * pipelines documented in docs/AI_PHOTO_RUNBOOK.md.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-images.mjs [manifest-path]
 *
 * Default manifest: scripts/image-prompts.json
 *
 * Setup:
 *   1. Get a free API key at https://aistudio.google.com/apikey
 *   2. Add to .env.local or export in shell:
 *        export GEMINI_API_KEY=your-key-here
 *   3. Run: node scripts/generate-images.mjs
 *
 * Output:
 *   - PNG bytes written to {output} path (relative to repo root)
 *   - Console log per job with status + file size
 *   - Skips jobs where {output} already exists (re-run is idempotent)
 *
 * Cost (approx, as of 2026):
 *   - Gemini 2.5 Flash Image: ~$0.039 per generated image
 *   - 11 finish textures ≈ $0.43 total
 *   - 48 product variants ≈ $1.87 total
 *
 * Model selection:
 *   - Defaults to gemini-2.5-flash-image-preview (Nano Banana)
 *   - Override with GEMINI_MODEL env var if needed
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image-preview";
const MANIFEST_PATH = process.argv[2] || resolve(__dirname, "image-prompts.json");

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not set.");
  console.error("   Get a free key at https://aistudio.google.com/apikey");
  console.error("   Then: export GEMINI_API_KEY=your-key-here");
  process.exit(1);
}

if (!existsSync(MANIFEST_PATH)) {
  console.error(`❌ Manifest not found at ${MANIFEST_PATH}`);
  process.exit(1);
}

const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));

if (!Array.isArray(manifest)) {
  console.error("❌ Manifest must be a JSON array of {id, prompt, output} objects.");
  process.exit(1);
}

console.log(`🎨 Gemini image batch — ${manifest.length} jobs`);
console.log(`   Model:    ${MODEL}`);
console.log(`   Manifest: ${MANIFEST_PATH}`);
console.log("");

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

for (const job of manifest) {
  const { id, prompt, output, skip } = job;
  if (skip) {
    console.log(`⊘ skip   ${id}`);
    skipCount++;
    continue;
  }
  if (!prompt || !output) {
    console.error(`❌ skip   ${id} — missing prompt or output path`);
    errorCount++;
    continue;
  }

  const absOutput = resolve(REPO_ROOT, output);

  // Idempotent — skip if file already exists. Delete the file to re-generate.
  if (existsSync(absOutput)) {
    console.log(`⊘ exists ${id} (${output}) — delete to re-generate`);
    skipCount++;
    continue;
  }

  process.stdout.write(`→ gen    ${id} ... `);
  try {
    const start = Date.now();
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`\n❌ HTTP ${res.status}: ${errText.slice(0, 200)}`);
      errorCount++;
      continue;
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart) {
      console.error(`\n❌ no image in response — first text part: ${parts.find((p) => p.text)?.text?.slice(0, 200) ?? "(none)"}`);
      errorCount++;
      continue;
    }

    const buf = Buffer.from(imagePart.inlineData.data, "base64");
    await mkdir(dirname(absOutput), { recursive: true });
    await writeFile(absOutput, buf);

    const dur = ((Date.now() - start) / 1000).toFixed(1);
    const kb = (buf.length / 1024).toFixed(0);
    console.log(`✓ ${kb} KB in ${dur}s → ${output}`);
    successCount++;

    // Light throttle — Gemini API rate limit is generous but be polite
    await new Promise((r) => setTimeout(r, 800));
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    errorCount++;
  }
}

console.log("");
console.log(`📊 ${successCount} generated · ${skipCount} skipped · ${errorCount} errors`);

if (errorCount > 0) process.exit(1);

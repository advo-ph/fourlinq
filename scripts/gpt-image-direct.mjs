#!/usr/bin/env node
/**
 * Direct image edit via /v1/images/edits — NO reasoning model, NO critique rounds.
 * The source photo is passed as the base image; the model edits it in place,
 * which preserves composition/elements far more strictly than generation.
 * Usage: node scripts/gpt-image-direct.mjs <src-image> <out.png> "<prompt>" [size] [quality]
 */
import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

const [src, out, prompt, size = "1536x1024", quality = "high"] = process.argv.slice(2);
if (!src || !out || !prompt) {
  console.error("usage: gpt-image-direct.mjs <src> <out.png> <prompt> [size] [quality]");
  process.exit(1);
}
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error("OPENAI_API_KEY not set"); process.exit(1); }

const form = new FormData();
form.append("model", "gpt-image-2");
form.append("image", new Blob([await readFile(src)], { type: "image/jpeg" }), basename(src));
form.append("prompt", prompt);
form.append("size", size);
form.append("quality", quality);
form.append("output_format", "png");

const res = await fetch("https://api.openai.com/v1/images/edits", {
  method: "POST",
  headers: { Authorization: `Bearer ${API_KEY}` },
  body: form,
});
const body = await res.json();
if (!res.ok) { console.error(`${res.status} ${body.error?.message}`); process.exit(1); }
await writeFile(out, Buffer.from(body.data[0].b64_json, "base64"));
console.log(`saved ${out}`);

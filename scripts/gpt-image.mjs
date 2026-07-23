#!/usr/bin/env node
/**
 * Reasoning-first image generation via OpenAI Responses API.
 *
 * Unlike the plain Images API, this routes the prompt through a GPT-5.x
 * reasoning model FIRST (default: gpt-5.6-sol at high effort), which thinks
 * through composition/lighting/text/constraints, then invokes the
 * image_generation tool (default: gpt-image-2) — the same mechanism ChatGPT
 * uses. Optional self-critique rounds let the model inspect its own output
 * and regenerate corrections in the same conversation.
 *
 * Usage:
 *   node scripts/gpt-image.mjs "prompt text" [options]
 *
 * Options:
 *   --ref <path>          Reference image (repeatable). Enables high input fidelity.
 *   --out <path>          Output file/prefix (default: scripts/gpt-image-out/<slug>.png)
 *   --size <s>            1024x1024 | 1536x1024 | 1024x1536 | auto (default: auto)
 *   --quality <q>         low | medium | high | auto (default: high)
 *   --model <m>           Reasoning model (default: gpt-5.6-sol)
 *   --effort <e>          Reasoning effort: low | medium | high (default: high)
 *   --image-model <m>     Image tool model (default: gpt-image-2)
 *   --rounds <n>          Self-critique rounds after initial gen (default: 1)
 *
 * Setup:
 *   OPENAI_API_KEY in .env (repo root) or exported in shell.
 *
 * Output:
 *   PNG per generation round: <out>.png, <out>-r2.png, ...
 *   Reasoning summaries + model commentary logged to console.
 */

import "dotenv/config";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const API_BASE = "https://api.openai.com/v1";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY not set. Add it to .env or export it.");
  process.exit(1);
}

// ---------- CLI parsing ----------

const args = process.argv.slice(2);
const opts = {
  prompt: null,
  refs: [],
  out: null,
  size: "auto",
  quality: "high",
  model: "gpt-5.6-sol",
  effort: "high",
  imageModel: "gpt-image-2",
  rounds: 1,
};

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--ref") opts.refs.push(args[++i]);
  else if (a === "--out") opts.out = args[++i];
  else if (a === "--size") opts.size = args[++i];
  else if (a === "--quality") opts.quality = args[++i];
  else if (a === "--model") opts.model = args[++i];
  else if (a === "--effort") opts.effort = args[++i];
  else if (a === "--image-model") opts.imageModel = args[++i];
  else if (a === "--rounds") opts.rounds = parseInt(args[++i], 10);
  else if (!a.startsWith("--") && !opts.prompt) opts.prompt = a;
  else {
    console.error(`❌ Unknown argument: ${a}`);
    process.exit(1);
  }
}

if (!opts.prompt) {
  console.error('❌ No prompt. Usage: node scripts/gpt-image.mjs "prompt" [options]');
  process.exit(1);
}

const slug = opts.prompt
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 48);
const outBase = opts.out
  ? resolve(REPO_ROOT, opts.out).replace(/\.png$/i, "")
  : resolve(__dirname, "gpt-image-out", slug);

// ---------- API helpers ----------

async function api(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status} ${body.error?.message ?? JSON.stringify(body)}`);
  }
  return body;
}

/** Create a background response and poll until it leaves queued/in_progress. */
async function createAndPoll(payload) {
  let resp = await api("/responses", {
    method: "POST",
    body: JSON.stringify({ ...payload, background: true, store: true }),
  });
  const started = Date.now();
  while (resp.status === "queued" || resp.status === "in_progress") {
    await new Promise((r) => setTimeout(r, 5000));
    resp = await api(`/responses/${resp.id}`);
    process.stdout.write(
      `\r   … ${resp.status} (${Math.round((Date.now() - started) / 1000)}s)   `
    );
  }
  process.stdout.write("\n");
  if (resp.status !== "completed") {
    const detail = resp.error?.message ?? resp.incomplete_details?.reason ?? resp.status;
    throw new Error(`Response ${resp.id} ended as ${resp.status}: ${detail}`);
  }
  return resp;
}

function logOutput(resp) {
  for (const item of resp.output ?? []) {
    if (item.type === "reasoning") {
      for (const s of item.summary ?? []) {
        if (s.text) console.log(`   🧠 ${s.text.replace(/\n+/g, " ").slice(0, 500)}`);
      }
    } else if (item.type === "message") {
      for (const c of item.content ?? []) {
        if (c.type === "output_text" && c.text) console.log(`   💬 ${c.text.trim()}`);
      }
    } else if (item.type === "image_generation_call" && item.revised_prompt) {
      console.log(`   ✏️  revised prompt: ${item.revised_prompt.slice(0, 300)}`);
    }
  }
}

async function saveImages(resp, round) {
  const calls = (resp.output ?? []).filter(
    (o) => o.type === "image_generation_call" && o.result
  );
  const saved = [];
  for (let i = 0; i < calls.length; i++) {
    const suffix = round > 1 ? `-r${round}` : "";
    const multi = calls.length > 1 ? `-${i + 1}` : "";
    const file = `${outBase}${suffix}${multi}.png`;
    await mkdir(dirname(file), { recursive: true });
    const bytes = Buffer.from(calls[i].result, "base64");
    await writeFile(file, bytes);
    console.log(`   ✅ ${file.replace(REPO_ROOT + "/", "")} (${(bytes.length / 1024).toFixed(0)} KB)`);
    saved.push(file);
  }
  return saved;
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function refToDataUrl(path) {
  const abs = resolve(REPO_ROOT, path);
  if (!existsSync(abs)) {
    console.error(`❌ Reference image not found: ${path}`);
    process.exit(1);
  }
  const mime = MIME[extname(abs).toLowerCase()];
  if (!mime) {
    console.error(`❌ Unsupported reference format: ${path} (use png/jpg/webp)`);
    process.exit(1);
  }
  const b64 = (await readFile(abs)).toString("base64");
  return `data:${mime};base64,${b64}`;
}

// ---------- Main ----------

const tool = {
  type: "image_generation",
  model: opts.imageModel,
  size: opts.size,
  quality: opts.quality,
  output_format: "png",
  ...(opts.refs.length > 0 ? { input_fidelity: "high" } : {}),
};

const content = [
  {
    type: "input_text",
    text:
      `Generate an image for this brief. Think carefully about composition, lighting, ` +
      `geometry, counts, and any text accuracy BEFORE generating.\n\nBrief: ${opts.prompt}`,
  },
];
for (const ref of opts.refs) {
  content.push({ type: "input_image", image_url: await refToDataUrl(ref) });
}

console.log(`🎨 ${opts.model} (effort: ${opts.effort}) → ${opts.imageModel} (${opts.quality}, ${opts.size})`);
if (opts.refs.length) console.log(`   refs: ${opts.refs.join(", ")} (input_fidelity: high)`);

console.log(`\n▶ Round 1: generate`);
let resp = await createAndPoll({
  model: opts.model,
  reasoning: { effort: opts.effort, summary: "auto" },
  tools: [tool],
  input: [{ role: "user", content }],
});
logOutput(resp);
let saved = await saveImages(resp, 1);
if (saved.length === 0) {
  console.error("❌ Model produced no image. See commentary above.");
  process.exit(1);
}

for (let round = 2; round <= opts.rounds + 1; round++) {
  console.log(`\n▶ Round ${round}: self-critique`);
  const critique = await createAndPoll({
    model: opts.model,
    reasoning: { effort: opts.effort, summary: "auto" },
    tools: [tool],
    previous_response_id: resp.id,
    input:
      `Inspect the image you just generated against the original brief. Check geometry, ` +
      `perspective, counts, lighting consistency, text spelling, and style fidelity` +
      (opts.refs.length ? `, and faithfulness to the reference image(s)` : "") +
      `. If you find flaws, regenerate a corrected image. If it is already faithful, ` +
      `reply "APPROVED" with a one-line justification and do NOT regenerate.`,
  });
  logOutput(critique);
  const newSaves = await saveImages(critique, round);
  resp = critique;
  if (newSaves.length === 0) {
    console.log("   ✔ Approved — no regeneration needed.");
    break;
  }
  saved = newSaves;
}

console.log(`\n🏁 Final: ${saved[saved.length - 1].replace(REPO_ROOT + "/", "")}`);

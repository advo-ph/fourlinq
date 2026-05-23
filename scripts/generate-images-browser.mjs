#!/usr/bin/env node
/**
 * Browser-driven batch image generation via gemini.google.com.
 *
 * No API key. Uses Playwright with a persistent Chromium profile so you
 * log in to your Google account ONCE on first run, then every subsequent
 * run reuses the session.
 *
 * Reads scripts/image-prompts.json (same manifest format as the API
 * sibling script generate-images.mjs) and drives the Gemini web UI to
 * generate each image, extracts the resulting blob URL via in-page fetch,
 * decodes the base64, writes to the manifest's output path.
 *
 * Usage:
 *   node scripts/generate-images-browser.mjs [manifest-path]
 *
 * First-run setup:
 *   1. npx playwright install chromium    (one-time, ~150 MB)
 *   2. node scripts/generate-images-browser.mjs
 *      → Browser opens. Log in to Google. Hit ENTER in the terminal.
 *      → Session saved to .gemini-browser-state/ (gitignored).
 *      → Subsequent runs skip the login step.
 *
 * Output:
 *   - PNG bytes written to {output} path (relative to repo root)
 *   - Console log per job with status + file size
 *   - Skips jobs where {output} already exists (idempotent)
 *   - If selectors break, prints which selector failed for easy fix
 *
 * Why not the API?
 *   See generate-images.mjs — it's a one-line GEMINI_API_KEY swap and
 *   the script is way more reliable. Use that one if you can. This
 *   browser path exists for when you can't / don't want an API key.
 *
 * Fragility warning:
 *   Google iterates gemini.google.com weekly. Selectors below WILL
 *   eventually break. The script prints which one failed so a 10-sec
 *   DOM inspection in DevTools gets you the new selector.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const PROFILE_DIR = resolve(REPO_ROOT, ".gemini-browser-state");
const MANIFEST_PATH = process.argv[2] || resolve(__dirname, "image-prompts.json");

// Selectors — update these when Google ships a redesign.
const SELECTORS = {
  promptInput: 'rich-textarea div[contenteditable="true"], textarea[aria-label*="prompt" i]',
  sendButton: 'button[aria-label*="Send" i]:not([disabled]), button[aria-label*="send" i]:not([disabled])',
  // The "newest" image in the conversation — Gemini renders generated
  // images as <img> elements inside the response stream
  generatedImage: 'model-response img[src^="blob:"], div[data-test-id*="response"] img[src^="blob:"], message-content img[src^="blob:"]',
  newChatButton: 'button[aria-label*="New chat" i], a[aria-label*="New chat" i]',
  // A signal that generation is done — the loading spinner disappears
  loadingIndicator: 'mat-progress-spinner, [class*="loading"], [class*="generating"]',
};

const PROMPT_TIMEOUT_MS = 90_000;  // generous — image gen can take 30-60s
const IMAGE_WAIT_MS = 60_000;
const POLL_INTERVAL_MS = 1_500;

// ----- Setup -----

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("❌ Playwright not installed.");
  console.error("   Install with:  npm install -D playwright && npx playwright install chromium");
  process.exit(1);
}

if (!existsSync(MANIFEST_PATH)) {
  console.error(`❌ Manifest not found at ${MANIFEST_PATH}`);
  process.exit(1);
}

const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8"));

if (!Array.isArray(manifest)) {
  console.error("❌ Manifest must be a JSON array of {id, prompt, output} jobs.");
  process.exit(1);
}

console.log(`🎨 Gemini browser batch — ${manifest.length} jobs`);
console.log(`   Manifest:  ${MANIFEST_PATH}`);
console.log(`   Profile:   ${PROFILE_DIR}`);
console.log("");

// ----- Launch browser with persistent profile -----

const isFirstRun = !existsSync(PROFILE_DIR);

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1400, height: 900 },
  args: ["--disable-blink-features=AutomationControlled"],
});

const page = context.pages()[0] || await context.newPage();
await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });

if (isFirstRun) {
  console.log("🔑 First run — log in to your Google account in the browser window.");
  console.log("   When you can see the Gemini chat UI, come back here and press ENTER.");
  const rl = createInterface({ input: stdin, output: stdout });
  await rl.question("   Press ENTER when logged in ▸ ");
  rl.close();
  console.log("");
}

// ----- Helpers -----

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findFirst(selectorList) {
  const selectors = selectorList.split(",").map((s) => s.trim());
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el) return { el, sel };
    } catch { /* ignore */ }
  }
  return null;
}

async function startNewChat() {
  const newBtn = await findFirst(SELECTORS.newChatButton);
  if (newBtn) {
    try { await newBtn.el.click(); await sleep(800); } catch { /* ignore */ }
  } else {
    // Fallback: hard reload to clear the chat
    await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });
    await sleep(1500);
  }
}

async function submitPrompt(promptText) {
  const input = await findFirst(SELECTORS.promptInput);
  if (!input) throw new Error(`prompt input not found (selectors: ${SELECTORS.promptInput})`);

  // Focus + clear + type. Gemini's contenteditable doesn't always accept .fill(),
  // so use a robust fallback that clears then keyboard-types.
  await input.el.click();
  await sleep(200);
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Meta+A").catch(() => {});  // macOS
  await page.keyboard.press("Delete");
  await page.keyboard.insertText(promptText);
  await sleep(400);

  const send = await findFirst(SELECTORS.sendButton);
  if (!send) throw new Error(`send button not found (selectors: ${SELECTORS.sendButton})`);
  await send.el.click();
}

async function waitForGeneratedImage() {
  const deadline = Date.now() + IMAGE_WAIT_MS;
  while (Date.now() < deadline) {
    const img = await findFirst(SELECTORS.generatedImage);
    if (img) return img.el;
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`no generated image appeared within ${IMAGE_WAIT_MS / 1000}s (selectors: ${SELECTORS.generatedImage})`);
}

async function extractImageBytes(imgHandle) {
  // Use in-page fetch to grab the blob, return as base64.
  const dataUrl = await page.evaluate(async (img) => {
    if (!img?.src) return null;
    const res = await fetch(img.src);
    const blob = await res.blob();
    return await new Promise((r) => {
      const reader = new FileReader();
      reader.onloadend = () => r(reader.result);
      reader.readAsDataURL(blob);
    });
  }, imgHandle);

  if (!dataUrl) throw new Error("in-page fetch returned empty result");
  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64, "base64");
}

// ----- Run -----

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

for (const job of manifest) {
  const { id, prompt, output, skip } = job;
  if (skip) { console.log(`⊘ skip   ${id}`); skipCount++; continue; }
  if (!prompt || !output) { console.error(`❌ skip ${id} — missing prompt or output`); errorCount++; continue; }

  const absOutput = resolve(REPO_ROOT, output);
  if (existsSync(absOutput)) {
    console.log(`⊘ exists ${id} (${output}) — delete to re-generate`);
    skipCount++;
    continue;
  }

  process.stdout.write(`→ gen    ${id} ... `);
  const start = Date.now();

  try {
    await Promise.race([
      (async () => {
        await startNewChat();
        await submitPrompt(prompt);
        const imgHandle = await waitForGeneratedImage();
        await sleep(800);  // let any post-render settle
        const buf = await extractImageBytes(imgHandle);
        await mkdir(dirname(absOutput), { recursive: true });
        await writeFile(absOutput, buf);
        const dur = ((Date.now() - start) / 1000).toFixed(1);
        const kb = (buf.length / 1024).toFixed(0);
        console.log(`✓ ${kb} KB in ${dur}s → ${output}`);
        successCount++;
      })(),
      sleep(PROMPT_TIMEOUT_MS).then(() => { throw new Error("job timed out"); }),
    ]);
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    errorCount++;
  }

  // Polite throttle so we don't look like a bot
  await sleep(2000);
}

console.log("");
console.log(`📊 ${successCount} generated · ${skipCount} skipped · ${errorCount} errors`);

console.log("");
console.log("Closing browser in 10s... (Ctrl+C to keep open)");
await sleep(10_000);
await context.close();

if (errorCount > 0) process.exit(1);

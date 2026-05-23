#!/usr/bin/env node
/**
 * Opens Chromium with the saved Gemini session and leaves it open so you
 * can work manually — type prompts, right-click images, save full-res PNGs.
 *
 * The browser stays open until you close the window OR Ctrl+C in terminal.
 *
 * Usage:
 *   node scripts/open-gemini.mjs
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILE_DIR = resolve(__dirname, "..", ".gemini-browser-state");

const { chromium } = await import("playwright");

const context = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1400, height: 900 },
  args: ["--disable-blink-features=AutomationControlled"],
});

const page = context.pages()[0] || await context.newPage();
await page.goto("https://gemini.google.com/app", { waitUntil: "domcontentloaded" });

console.log("✓ Gemini open with Pro session.");
console.log("  Right-click any generated image > Save Image As... for full-res PNGs.");
console.log("  Close the browser window OR Ctrl+C to exit.");

// Wait for the user to close the browser
await new Promise((resolve) => {
  context.on("close", resolve);
});

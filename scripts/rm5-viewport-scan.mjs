#!/usr/bin/env node
/**
 * RM5 — public viewport containment scan (Tier 2, live browser).
 *
 * Loads every public route at every RM5 breakpoint and asserts
 * documentElement.scrollWidth <= innerWidth + 1 (no horizontal document scroll).
 *
 * Grounds: the 2026-07-10 capture found FAQ 919px at 390/768 and the Design
 * Tool 404px at 390. This is the reproducible harness for that finding.
 *
 * Usage: start the app, then `node scripts/rm5-viewport-scan.mjs [baseURL]`.
 * Exit 0 = contained everywhere; exit 1 = one or more overflow rows (printed).
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:8080";
const ROUTES = [
  "/", "/products", "/products?filter=doors", "/why-upvc", "/aluminium",
  "/inspiration", "/for-architects", "/design-tool", "/brand", "/faq",
  "/finishes", "/warranty", "/care", "/whats-new", "/help-me-choose", "/legal",
];
const WIDTHS = [375, 390, 560, 768, 992, 1199, 1440];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const overflow = [];
for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(300);
    const m = await page
      .evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
      .catch(() => ({ sw: 0, iw: 1 }));
    if (m.sw > m.iw + 1) overflow.push(`${route} @${w}: scrollWidth=${m.sw} > ${m.iw}`);
  }
  await page.close();
}
await browser.close();

if (overflow.length) {
  console.error("RM5 FAIL — horizontal overflow:\n" + overflow.map((r) => "  " + r).join("\n"));
  process.exit(1);
}
console.log(`RM5 PASS — ${ROUTES.length} routes × ${WIDTHS.length} widths, no horizontal overflow.`);

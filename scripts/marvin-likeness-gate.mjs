#!/usr/bin/env node
/**
 * Marvin structural-likeness gate (Tier 1, live browser).
 *
 * Answers "are we still built like Marvin?" with a number, and fails when the
 * answer drifts. Marvin's structure is the reference FourlinQ chose; nothing
 * in the repo currently enforces it, so it can rot silently — the only test
 * that ever asserted a Marvin contract lives on an unmerged branch.
 *
 * WHAT IT MEASURES — structure only:
 *   type scale · container + reading width · header height · section rhythm
 *   · grid gutter · signature easing curve · transition durations · shadow
 *   restraint (Marvin's premium feel comes from LOW elevation)
 *
 * WHAT IT REFUSES TO MEASURE — brand identity:
 *   colour and font family are excluded on purpose. docs/roadmap-rejected.md
 *   rejects cloning Marvin's skin, so a score that rose when FourlinQ adopted
 *   Marvin's amber or Nationale would be rewarding the exact thing the project
 *   ruled against. Structure is borrowed; identity is not.
 *
 * HOW IT GATES — a ratchet, not a maximiser:
 *   The target is NOT 100%. FourlinQ deliberately differs in places. The gate
 *   fails only when the score drops below the committed baseline, so it blocks
 *   drift without ever pushing the site toward being a clone.
 *
 * Values are read from the COMPUTED styles of the running app, not from
 * theme.config.ts — a token file can agree with Marvin while the rendered page
 * does not.
 *
 * Usage: start the app, then `node scripts/marvin-likeness-gate.mjs [baseURL]`
 *        `--update-baseline` rewrites the committed baseline (review the diff).
 * Exit 0 = at or above baseline · 1 = drifted below · 2 = infra.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.argv.find((a) => a.startsWith("http")) ?? "http://127.0.0.1:8080";
const UPDATE = process.argv.includes("--update-baseline");
const REF = JSON.parse(readFileSync(new URL("./marvin-reference.json", import.meta.url), "utf8"));
const BASELINE_PATH = new URL("./marvin-likeness-baseline.json", import.meta.url);

const near = (a, b, tolerance) => Math.abs(a - b) <= tolerance;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

/** Collect computed structural facts from a rendered page. */
function probe() {
  const px = (v) => parseFloat(v) || 0;
  const nav = document.querySelector("nav");
  const container = document.querySelector(".container-editorial");

  // Every distinct rendered font-size on the page.
  const fontSize = [
    ...new Set(
      [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,button,a,span")]
        .map((el) => Math.round(px(getComputedStyle(el).fontSize)))
        .filter((n) => n > 0),
    ),
  ].sort((a, b) => a - b);

  // Vertical rhythm: the largest section padding actually rendered.
  const sectionPadding = [
    ...new Set(
      [...document.querySelectorAll("section")]
        .map((el) => Math.round(px(getComputedStyle(el).paddingTop)))
        .filter((n) => n > 0),
    ),
  ].sort((a, b) => b - a);

  // Motion: easing + durations actually applied to transitions.
  // NB: a CSS transition list is comma-separated, but cubic-bezier(a,b,c,d)
  // contains commas too — splitting naively truncates it to "cubic-bezier(0.68".
  const splitTop = (value) => {
    const part = [];
    let depth = 0;
    let current = "";
    for (const ch of value) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) { part.push(current); current = ""; continue; }
      current += ch;
    }
    if (current.trim()) part.push(current);
    return part.map((p) => p.trim());
  };

  const easing = {};
  const duration = new Set();
  for (const el of [...document.querySelectorAll("a,button,img,div")].slice(0, 400)) {
    const s = getComputedStyle(el);
    if (s.transitionDuration && s.transitionDuration !== "0s") {
      for (const d of splitTop(s.transitionDuration)) {
        const ms = Math.round(parseFloat(d) * 1000);
        if (ms > 0) duration.add(ms);
      }
      for (const fn of splitTop(s.transitionTimingFunction)) {
        easing[fn] = (easing[fn] ?? 0) + 1;
      }
    }
  }

  // Elevation restraint: the deepest blur radius in use.
  let maxBlur = 0;
  for (const el of [...document.querySelectorAll("div,aside,button")].slice(0, 400)) {
    const sh = getComputedStyle(el).boxShadow;
    if (!sh || sh === "none") continue;
    for (const m of sh.matchAll(/(-?[\d.]+)px/g)) {
      // px groups run: offsetX offsetY blur spread — sample generously, take max
      const v = parseFloat(m[1]);
      if (v > maxBlur && v < 200) maxBlur = v;
    }
  }

  return {
    fontSize,
    sectionPadding,
    containerMax: container ? Math.round(container.getBoundingClientRect().width) : 0,
    headerHeight: nav ? Math.round(nav.getBoundingClientRect().height) : 0,
    durations: [...duration].sort((a, b) => a - b),
    dominantEase: Object.entries(easing).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none",
    maxShadowBlur: Math.round(maxBlur),
  };
}

const browser = await chromium.launch({ headless: true }).catch((e) => {
  console.error(`INFRA — could not launch browser: ${e.message}`);
  process.exit(2);
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const nav = await page
  .goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 30000 })
  .then(() => null)
  .catch((e) => e.message.split("\n")[0]);
if (nav) { console.error(`INFRA — ${BASE}: ${nav}`); await browser.close(); process.exit(2); }
await page.waitForTimeout(1200);
if (!(await page.evaluate(() => !!document.querySelector("#main-content")))) {
  console.error("INFRA — app shell (#main-content) never rendered");
  await browser.close();
  process.exit(2);
}
const m = await page.evaluate(probe);
await browser.close();

// ── Axes ────────────────────────────────────────────────────────────────────
const axis = [];

// 1. Type scale — what share of rendered sizes sit on Marvin's steps (±1px)?
const onScale = m.fontSize.filter((s) => REF.typeScale.some((t) => near(s, t, 1)));
axis.push({
  name: "type scale",
  score: m.fontSize.length ? onScale.length / m.fontSize.length : 0,
  detail: `${onScale.length}/${m.fontSize.length} rendered sizes on Marvin's steps`,
});

// 2. Container width
axis.push({
  name: "container width",
  score: near(m.containerMax, REF.layout.containerMaxPx, 40) ? 1 : 0,
  detail: `${m.containerMax}px vs ${REF.layout.containerMaxPx}px`,
});

// 3. Header height
axis.push({
  name: "header height",
  score: near(m.headerHeight, REF.layout.headerHeightDesktopPx, 8) ? 1 : 0,
  detail: `${m.headerHeight}px vs ${REF.layout.headerHeightDesktopPx}px`,
});

// 4. Section rhythm — is the dominant section padding in Marvin's territory?
const topPad = m.sectionPadding[0] ?? 0;
axis.push({
  name: "section rhythm",
  score: near(topPad, REF.rhythm.sectionPaddingDesktopPx, 40) ? 1 : 0,
  detail: `largest section padding ${topPad}px vs ${REF.rhythm.sectionPaddingDesktopPx}px`,
});

// 5. Signature easing curve — the single most identifying structural token.
const easeNorm = (s) => s.replace(/\s+/g, "").replace(/0\./g, ".");
const easeMatch = easeNorm(m.dominantEase) === easeNorm(REF.motion.signatureEase);
axis.push({
  name: "signature easing",
  score: easeMatch ? 1 : 0,
  detail: easeMatch ? m.dominantEase : `${m.dominantEase} vs ${REF.motion.signatureEase}`,
});

// 6. Durations on Marvin's ladder (±50ms)
const onLadder = m.durations.filter((d) => REF.motion.durationsMs.some((r) => near(d, r, 50)));
axis.push({
  name: "motion durations",
  score: m.durations.length ? onLadder.length / m.durations.length : 0,
  detail: `${onLadder.length}/${m.durations.length} durations on the 100–500ms ladder`,
});

// 7. Elevation restraint — going deeper than Marvin loses the premium feel.
axis.push({
  name: "elevation restraint",
  score: m.maxShadowBlur <= REF.elevation.maxCommonBlurPx + 6 ? 1 : 0,
  detail: `deepest blur ${m.maxShadowBlur}px vs Marvin's ${REF.elevation.maxCommonBlurPx}px`,
});

const total = axis.reduce((s, a) => s + a.score, 0) / axis.length;

// ── Report ──────────────────────────────────────────────────────────────────
console.log("\nMarvin structural likeness — brand identity deliberately excluded\n");
for (const a of axis) {
  const mark = a.score === 1 ? "✓" : a.score >= 0.8 ? "~" : "✗";
  console.log(`  ${mark} ${a.name.padEnd(20)} ${pct(a.score).padStart(6)}  ${a.detail}`);
}
console.log(`\n  STRUCTURAL LIKENESS: ${pct(total)}`);
console.log("  (colour and font family are not scored — see scripts/marvin-reference.json)\n");

if (UPDATE) {
  const next = { score: Number(total.toFixed(4)), axis: Object.fromEntries(axis.map((a) => [a.name, Number(a.score.toFixed(4))])), updated: "manual" };
  writeFileSync(BASELINE_PATH, JSON.stringify(next, null, 2) + "\n");
  console.log(`Baseline written: ${pct(total)}. Review the diff before committing.\n`);
  process.exit(0);
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
} catch {
  console.error("No committed baseline. Run with --update-baseline once, review, and commit it.");
  process.exit(1);
}

// Ratchet: fail on regression only. Being BELOW 100% is fine and expected.
const TOLERANCE = 0.001;
const regressed = axis.filter((a) => (baseline.axis?.[a.name] ?? 0) - a.score > TOLERANCE);
if (total + TOLERANCE < baseline.score || regressed.length) {
  console.error(`FAIL — structural likeness regressed against the committed baseline (${pct(baseline.score)}).`);
  for (const a of regressed) {
    console.error(`  ${a.name}: ${pct(baseline.axis[a.name])} → ${pct(a.score)}  (${a.detail})`);
  }
  console.error("\nIf this change is intentional, re-run with --update-baseline and explain it in the commit.\n");
  process.exit(1);
}
console.log(`PASS — at or above the committed baseline (${pct(baseline.score)}).\n`);

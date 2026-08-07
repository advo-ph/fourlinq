#!/usr/bin/env node
/**
 * Marvin section audit — per-page parity measurement against marvin.com.
 *
 * Measures, for every public FourlinQ route, the dimensions the section-by-
 * section review needs, from the COMPUTED page:
 *
 *   COLOR (literal match to Marvin)  Marvin's neutral system (ink/canvas/
 *     hairline) vs its brand accent (#FFC600) and type. FourlinQ shares the
 *     neutrals by design and deliberately differs on accent (#C8102E red) and
 *     type (Fraunces/Manrope vs TabacG1/Nationale). We report the literal
 *     distance on each so "does the color match" gets a real number, and we
 *     flag which gaps are brand identity (deciding to close them is a real call).
 *   A11Y  images missing alt, controls without a name, heading has an h1,
 *     body-text contrast vs WCAG AA, horizontal overflow.
 *   CONTENT / STYLE  image count, section count, visible word count, whether
 *     the page actually moves (transition/animation), type-scale adherence.
 *
 * Run against any base URL, so the same probe measures the live (old) site and
 * the redesign (local) build for a before/after lift.
 *
 * Usage: node scripts/marvin-section-audit.mjs <baseURL> [outfile.json]
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://127.0.0.1:8080";
const OUT = process.argv[3] || null;

// Frozen Marvin reference (from docs/references/design-systems/marvin.md,
// extracted from 156 production CSS bundles). Neutrals + brand + type.
const MARVIN = {
  ink: [0x24, 0x24, 0x24],       // #242424 ink-display
  canvas: [0xff, 0xff, 0xff],    // #FFFFFF
  hairline: [0xdf, 0xdf, 0xdf],  // #DFDFDF
  accent: [0xff, 0xc6, 0x00],    // #FFC600 brand amber
  serif: "tabac",                // TabacG1
  sans: "nationale",             // Nationale
  typeScale: [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 88],
};

const ROUTE = [
  "/", "/products", "/aluminium", "/design-tool", "/why-upvc", "/inspiration",
  "/for-architects", "/brand", "/faq", "/finishes", "/warranty", "/care",
  "/whats-new", "/help-me-choose", "/glossary", "/legal",
];

const parseRgb = (s) => {
  const m = s.match(/(\d+),\s*(\d+),\s*(\d+)/);
  return m ? [+m[1], +m[2], +m[3]] : null;
};
const dist = (a, b) => (a && b ? Math.round(Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))) : 999);
// relative luminance + WCAG contrast ratio
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); };

function probe() {
  const px = (v) => parseFloat(v) || 0;
  const cs = getComputedStyle;

  // Collect every color actually painted, weighted by area, plus font families.
  const colorCount = {};
  const familyCount = {};
  let bodyText = null, bodyBg = null;
  const sizes = new Set();

  const nodes = [...document.querySelectorAll("*")].slice(0, 4000);
  for (const el of nodes) {
    const s = cs(el);
    const r = el.getBoundingClientRect();
    const area = Math.max(0, r.width) * Math.max(0, r.height);
    if (area < 4) continue;
    for (const prop of ["color", "backgroundColor", "borderTopColor", "borderBottomColor"]) {
      const v = s[prop];
      if (!v || v === "rgba(0, 0, 0, 0)" || v.includes("0)")) continue;
      colorCount[v] = (colorCount[v] || 0) + (prop === "backgroundColor" ? area : area * 0.15);
    }
    const fam = s.fontFamily.split(",")[0].replace(/["']/g, "").trim().toLowerCase();
    if (fam) familyCount[fam] = (familyCount[fam] || 0) + area;
    const fs = Math.round(px(s.fontSize));
    if (fs > 0 && el.textContent && el.textContent.trim()) sizes.add(fs);
  }
  // Body-copy contrast: sample the largest paragraph that is DARK text on a
  // light section (real body copy). Skip white hero text set over a photo,
  // which is not "body text on canvas" and otherwise reads as a false 1:1.
  const luma = (rgb) => { const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/); if (!m) return 1; const [r, g, b] = [+m[1], +m[2], +m[3]].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const bodyP = [...document.querySelectorAll("p")]
    .filter((el) => luma(cs(el).color) < 0.4) // dark text only
    .sort((a, b) => (b.getBoundingClientRect().width * b.getBoundingClientRect().height) - (a.getBoundingClientRect().width * a.getBoundingClientRect().height))[0];
  if (bodyP) { bodyText = cs(bodyP).color; bodyBg = cs(document.body).backgroundColor; }

  const topColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([c]) => c);
  const topFamilies = Object.entries(familyCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([f]) => f);

  // a11y
  const noAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length;
  const name = (el) => (el.getAttribute("aria-label") || el.textContent || "").trim() || [...el.querySelectorAll("img,svg")].map((x) => x.getAttribute("aria-label") || x.getAttribute("alt") || "").join("").trim();
  const unnamed = [...document.querySelectorAll("button,a[href]")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !name(el); }).length;
  const h1 = document.querySelectorAll("h1").length;
  const overflow = document.documentElement.scrollWidth > innerWidth + 1;

  // content / motion
  const imgs = document.images.length;
  const sections = document.querySelectorAll("section").length;
  const words = (document.body.innerText.match(/[A-Za-z][A-Za-z'-]+/g) || []).length;
  let moving = 0;
  for (const el of nodes.slice(0, 800)) { const s = cs(el); if ((s.transitionDuration && s.transitionDuration !== "0s") || (s.animationName && s.animationName !== "none")) moving++; }

  return { topColors, topFamilies, bodyText, bodyBg, sizes: [...sizes].sort((a, b) => a - b), noAlt, unnamed, h1, overflow, imgs, sections, words, moving };
}

const browser = await chromium.launch({ headless: true }).catch((e) => { console.error("INFRA launch:", e.message); process.exit(2); });
const result = [];

for (const route of ROUTE) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem("fourlinq_cookie_consent", "accepted"); } catch { /* noop */ } });
  const page = await ctx.newPage();
  const nav = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 40000 }).then(() => null).catch((e) => e.message.split("\n")[0]);
  if (nav) { result.push({ route, error: nav }); await ctx.close(); continue; }
  await page.waitForTimeout(1200);
  for (let y = 0; y < 6000; y += 1000) { await page.evaluate((v) => scrollTo(0, v), y).catch(() => {}); await page.waitForTimeout(120); }
  await page.evaluate(() => scrollTo(0, 0)).catch(() => {});
  const m = await page.evaluate(probe).catch(() => null);
  await ctx.close();
  if (!m) { result.push({ route, error: "probe failed" }); continue; }

  // ── literal color match to Marvin ──
  const colors = m.topColors.map(parseRgb).filter(Boolean);
  const nearest = (target) => Math.min(...colors.map((c) => dist(c, target)), 999);
  const inkMatch = nearest(MARVIN.ink) <= 24;
  const canvasMatch = nearest(MARVIN.canvas) <= 12;
  const hairlineMatch = nearest(MARVIN.hairline) <= 30;
  const amberPresent = nearest(MARVIN.accent) <= 60;         // is Marvin's amber actually on the page?
  const accentDistance = nearest(MARVIN.accent);             // how far the nearest strong color is from amber
  const fams = m.topFamilies.join(" ");
  const serifMatch = fams.includes(MARVIN.serif);
  const sansMatch = fams.includes(MARVIN.sans);
  // neutral system score (0-3) + brand match (0-2). Literal Marvin match.
  const neutralScore = (inkMatch ? 1 : 0) + (canvasMatch ? 1 : 0) + (hairlineMatch ? 1 : 0);
  const brandScore = (amberPresent ? 1 : 0) + (serifMatch || sansMatch ? 1 : 0);
  const colorMatchPct = Math.round(((neutralScore + brandScore) / 5) * 100);

  // ── a11y ──
  const bodyText = parseRgb(m.bodyText || ""), bodyBg = parseRgb(m.bodyBg || "");
  const bodyContrast = bodyText && bodyBg ? +contrast(bodyText, bodyBg).toFixed(2) : null;
  const a11y = {
    noAlt: m.noAlt, unnamed: m.unnamed, hasH1: m.h1 >= 1, overflow: m.overflow,
    bodyContrast, contrastAA: bodyContrast ? bodyContrast >= 4.5 : null,
    pass: m.noAlt === 0 && m.unnamed === 0 && m.h1 >= 1 && !m.overflow && (bodyContrast === null || bodyContrast >= 4.5),
  };

  // ── content/style ──
  const onScale = m.sizes.filter((s) => MARVIN.typeScale.some((t) => Math.abs(s - t) <= 1)).length;
  const content = {
    imgs: m.imgs, sections: m.sections, words: m.words, moving: m.moving,
    typeScalePct: m.sizes.length ? Math.round((onScale / m.sizes.length) * 100) : 0,
    hasMotion: m.moving > 3,
  };

  result.push({
    route,
    color: { colorMatchPct, inkMatch, canvasMatch, hairlineMatch, amberPresent, accentDistance, serifMatch, sansMatch, families: m.topFamilies.slice(0, 3) },
    a11y, content,
  });
}

await browser.close();

const out = { base: BASE, routes: result };
if (OUT) { writeFileSync(OUT, JSON.stringify(out, null, 2)); console.log(`wrote ${OUT}`); }

// terse console table
console.log(`\nMarvin section audit — ${BASE}\n`);
console.log("route".padEnd(20), "colorMatch", "amber", "a11y", "contrast", "imgs", "words", "motion");
for (const r of result) {
  if (r.error) { console.log(r.route.padEnd(20), "ERROR:", r.error); continue; }
  console.log(
    r.route.padEnd(20),
    `${r.color.colorMatchPct}%`.padStart(9),
    (r.color.amberPresent ? "yes" : "no").padStart(6),
    (r.a11y.pass ? "pass" : "FAIL").padStart(5),
    `${r.a11y.bodyContrast ?? "?"}`.padStart(9),
    `${r.content.imgs}`.padStart(5),
    `${r.content.words}`.padStart(6),
    (r.content.hasMotion ? "yes" : "no").padStart(7),
  );
}

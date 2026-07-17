#!/usr/bin/env node
/**
 * RM17 — accessibility and fixed-layer QA scan (Tier 1, live browser).
 *
 * Loads every public route at mobile + desktop and asserts the RM17
 * pass-criteria that a headless browser can decide mechanically:
 *
 *   1. no <img> is missing its alt attribute (decorative images must still
 *      carry an explicit alt="" — a missing attribute is the failure);
 *   2. no button or link with an href has an empty accessible name;
 *   3. no fixed/sticky overlay (chat bubble, cookie banner, nav) sits on top of
 *      an interactive control — checked by hit-testing the control's centre;
 *   4. when the cookie banner is showing, the chat bubble has shifted so the two
 *      fixed layers do not collide.
 *
 * Grounds: the 2026-07-10 capture found catalog animation layers producing
 * empty-alt counts and the fixed chat/banner obscuring product, FAQ, and
 * configurator controls. This is the reproducible harness for those findings.
 *
 * Usage: start the app, then `node scripts/rm17-a11y-scan.mjs [baseURL]`.
 * Exit 0 = clean; exit 1 = one or more a11y findings; exit 2 = infra (server
 * unreachable / app shell never rendered — never counted as an a11y finding).
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] || "http://localhost:8080";
const ROUTE = [
  "/", "/products", "/aluminium", "/design-tool", "/why-upvc", "/inspiration",
  "/for-architects", "/brand", "/faq", "/finishes", "/warranty", "/care",
  "/whats-new", "/help-me-choose", "/legal",
];
const VIEWPORT = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
];

// Static scan (alt / accessible name / overlay hit-test) runs on every route
// with consent pre-seeded so the banner does not interfere.
function scanPage() {
  const finding = { noAlt: [], emptyControl: [], covered: [] };

  document.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("alt")) finding.noAlt.push((img.getAttribute("src") || "").slice(-48));
  });

  const nameOf = (el) => {
    const direct = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "")
      .replace(/\s+/g, " ").trim();
    if (direct) return direct;
    return [...el.querySelectorAll("img,svg")]
      .map((x) => x.getAttribute("aria-label") || x.getAttribute("alt") || "")
      .join("").trim();
  };
  document.querySelectorAll("button").forEach((el) => {
    if (!nameOf(el)) finding.emptyControl.push(`button.${el.className.toString().slice(0, 28)}`);
  });
  document.querySelectorAll("a[href]").forEach((el) => {
    if (!nameOf(el)) finding.emptyControl.push(`a[${el.getAttribute("href")}]`);
  });

  // Fixed/sticky overlays with a real z-index that could sit over content.
  const overlay = [];
  document.querySelectorAll("*").forEach((el) => {
    const s = getComputedStyle(el);
    if ((s.position === "fixed" || s.position === "sticky") && parseInt(s.zIndex || "0", 10) >= 20) {
      const r = el.getBoundingClientRect();
      if (r.width > 10 && r.height > 10) overlay.push(el);
    }
  });
  const control = [...document.querySelectorAll("button,a[href],input,select,[role=button]")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0;
  });
  overlay.forEach((o) => {
    const orc = o.getBoundingClientRect();
    control.forEach((c) => {
      if (o === c || o.contains(c) || c.contains(o)) return;
      const r = c.getBoundingClientRect();
      const ix = Math.max(0, Math.min(orc.right, r.right) - Math.max(orc.left, r.left));
      const iy = Math.max(0, Math.min(orc.bottom, r.bottom) - Math.max(orc.top, r.top));
      const area = ix * iy;
      if (area <= 0 || r.width * r.height <= 0 || area / (r.width * r.height) <= 0.25) return;
      // The overlay only *obscures* the control if it wins the hit-test at centre.
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (top && (o === top || o.contains(top))) {
        finding.covered.push(`${o.tagName}(z${getComputedStyle(o).zIndex}) covers ${c.tagName} "${(c.textContent || c.getAttribute("aria-label") || "").trim().slice(0, 22)}"`);
      }
    });
  });
  finding.covered = [...new Set(finding.covered)];
  return finding;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const fail = [];

for (const vp of VIEWPORT) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  // Pre-seed accepted consent so the static scan is not disturbed by the banner.
  await ctx.addInitScript(() => {
    try { localStorage.setItem("fourlinq_cookie_consent", "accepted"); } catch { /* fail closed */ }
  });
  const page = await ctx.newPage();
  for (const route of ROUTE) {
    const nav = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30000 })
      .then(() => null)
      .catch((e) => e.message.split("\n")[0]);
    if (nav) { console.error(`INFRA — ${vp.name} ${route}: ${nav}`); process.exit(2); }
    await page.waitForTimeout(900);
    // The app shell must have rendered — if #main-content is absent the dev
    // server served an error overlay, not our page. Treat as infra, not a11y,
    // so a flaky server can never masquerade as an accessibility finding.
    const rendered = await page.evaluate(() => !!document.querySelector("#main-content")).catch(() => false);
    if (!rendered) { console.error(`INFRA — ${vp.name} ${route}: app shell (#main-content) never rendered`); process.exit(2); }
    const f = await page.evaluate(scanPage).catch(() => null);
    if (!f) { fail.push(`${vp.name} ${route}: page did not evaluate`); continue; }
    f.noAlt.forEach((s) => fail.push(`${vp.name} ${route}: <img> missing alt (${s})`));
    f.emptyControl.forEach((s) => fail.push(`${vp.name} ${route}: control has no accessible name (${s})`));
    f.covered.forEach((s) => fail.push(`${vp.name} ${route}: ${s}`));
  }
  await ctx.close();
}

// Dynamic check: fresh visitor → cookie banner appears → chat bubble must not
// collide with it (the "chat never covers the active control" criterion).
for (const vp of VIEWPORT) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/design-tool", { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2200); // banner reveals at 1.5s
  const collide = await page.evaluate(() => {
    const banner = document.querySelector("[data-cookie-banner]");
    const chat = document.querySelector("[data-chat-bubble]");
    if (!banner || !chat) return { shown: !!banner, collide: false };
    const b = banner.getBoundingClientRect(), c = chat.getBoundingClientRect();
    const collide = !(b.right < c.left || c.right < b.left || b.bottom < c.top || c.bottom < b.top);
    return { shown: true, collide };
  }).catch(() => ({ shown: false, collide: false }));
  if (!collide.shown) fail.push(`${vp.name}: cookie banner did not reveal for a fresh visitor`);
  else if (collide.collide) fail.push(`${vp.name}: chat bubble collides with the cookie banner`);
  await ctx.close();
}

await browser.close();

if (fail.length) {
  console.error("RM17 FAIL — accessibility / fixed-layer findings:\n" + fail.map((r) => "  " + r).join("\n"));
  process.exit(1);
}
console.log(`RM17 PASS — ${ROUTE.length} routes × ${VIEWPORT.length} viewports: alt, control names, fixed-layer hit-tests, and banner/chat coordination all clean.`);

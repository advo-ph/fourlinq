import { chromium } from "playwright";

export const BASE_URL = process.env.QA_BASE_URL ?? "http://127.0.0.1:8080";

// One row per rendered public state needed by the deterministic CP-4 browser gate.
// URL aliases are checked separately because their acceptance criterion is the
// redirect/canonical URL, not a distinct rendered page.
export const PUBLIC_ROUTE = [
  { name: "home", path: "/", heading: "Built to Last" },
  { name: "products", path: "/products", heading: "Window, door, and specialist systems" },
  { name: "products-windows", path: "/products?filter=windows", heading: "Window Systems", pressed: "Window Systems" },
  { name: "products-doors", path: "/products?filter=doors", heading: "Door Systems", pressed: "Door Systems" },
  { name: "products-specialist", path: "/products?filter=specialist", heading: "Specialist Systems", pressed: "Specialist Systems" },
  { name: "aluminium", path: "/aluminium", heading: "Aluminium, when uPVC" },
  { name: "design-tool", path: "/design-tool", heading: "Build your window" },
  { name: "why-upvc", path: "/why-upvc", heading: "Why uPVC" },
  { name: "inspiration", path: "/inspiration", heading: "Real projects" },
  { name: "whats-new", path: "/whats-new", heading: "From the workshop" },
  { name: "for-architects", path: "/for-architects", heading: "The spec that never changes" },
  { name: "warranty", path: "/warranty", heading: "Backed for ten years" },
  { name: "care", path: "/care", heading: "Built to outlast you" },
  { name: "faq", path: "/faq", heading: "Answers, organized" },
  { name: "help-me-choose", path: "/help-me-choose", heading: "Three questions" },
  { name: "finishes", path: "/finishes", heading: "Twelve finishes" },
  { name: "brand", path: "/brand", heading: "Built for a lifetime" },
  { name: "glossary", path: "/glossary", heading: "The language of windows and doors" },
  { name: "legal", path: "/legal", heading: "Privacy Policy" },
  { name: "project", path: "/projects/san-lorenzo-makati-aluminium", heading: "San Lorenzo" },
  { name: "not-found", path: "/qa-intentional-not-found", heading: "This page is somewhere else" },
];

export const ALIAS_ROUTE = [
  { name: "products-windows-alias", path: "/products/windows", canonical: "/products?filter=windows" },
  { name: "products-doors-alias", path: "/products/doors", canonical: "/products?filter=doors" },
  { name: "products-specialist-alias", path: "/products/specialist", canonical: "/products?filter=specialist" },
];

export const RM5_VIEWPORT = [
  { name: "phone-375", width: 375, height: 667 },
  { name: "phone-560", width: 560, height: 720 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-992", width: 992, height: 768 },
  { name: "tablet-1100", width: 1100, height: 800 },
  { name: "tablet-1199", width: 1199, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

export const RM17_VIEWPORT = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
];

export class QaInfraError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = "QaInfraError";
  }
}

export function pageUrl(routePath) {
  return new URL(routePath, BASE_URL).toString();
}

export async function launchQaBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch (cause) {
    throw new QaInfraError(`bundled Chromium did not launch: ${cause instanceof Error ? cause.message : String(cause)}`, cause);
  }
}

export async function consentContext(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  await context.addInitScript(() => {
    try { localStorage.setItem("fourlinq_cookie_consent", "accepted"); } catch { /* fail closed */ }
  });
  return context;
}

export async function visitPublicRoute(page, route, settleMs = 700) {
  let response;
  try {
    response = await page.goto(pageUrl(route.path), { waitUntil: "domcontentloaded", timeout: 30_000 });
  } catch (cause) {
    throw new QaInfraError(`${route.name}: navigation failed: ${cause instanceof Error ? cause.message.split("\n")[0] : String(cause)}`, cause);
  }

  if (!response) {
    const expected = new URL(pageUrl(route.path));
    const current = new URL(page.url());
    const sameDocument = current.origin === expected.origin && current.pathname === expected.pathname && current.search === expected.search;
    if (!sameDocument) throw new QaInfraError(`${route.name}: navigation returned no HTTP response`);
  }
  if (response && response.status() >= 500) throw new QaInfraError(`${route.name}: server returned HTTP ${response.status()}`);

  try {
    await page.waitForSelector("#main-content", { state: "visible", timeout: 12_000 });
    await page.waitForFunction(() => {
      const main = document.querySelector("#main-content");
      return Boolean(main && main.getBoundingClientRect().height > 1 && (main.textContent ?? "").trim().length > 8);
    }, undefined, { timeout: 12_000 });
    await page.waitForTimeout(settleMs);
  } catch (cause) {
    throw new QaInfraError(`${route.name}: app shell stayed blank or incomplete`, cause);
  }

  return response;
}

export async function routeFinding(page, route) {
  const state = await page.evaluate(() => ({
    heading: document.querySelector("#main-content h1")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    pressed: Array.from(document.querySelectorAll("button[aria-pressed='true']"))
      .map((button) => button.textContent?.replace(/\s+/g, " ").trim() ?? ""),
  }));
  const finding = [];
  if (!state.heading) finding.push(`${route.name}: missing public h1`);
  if (route.heading && !state.heading.toLowerCase().includes(route.heading.toLowerCase())) {
    finding.push(`${route.name}: h1 "${state.heading}" does not include "${route.heading}"`);
  }
  if (route.pressed && !state.pressed.some((label) => label === route.pressed)) {
    finding.push(`${route.name}: active filter "${route.pressed}" is not exposed with aria-pressed=true`);
  }
  return finding;
}

export async function checkAlias(page, route) {
  await visitPublicRoute(page, { ...route, heading: undefined });
  const current = new URL(page.url());
  const actual = `${current.pathname}${current.search}`;
  return actual === route.canonical ? null : `${route.name}: expected ${route.canonical}, got ${actual}`;
}

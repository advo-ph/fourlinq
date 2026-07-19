#!/usr/bin/env node
/**
 * CP-5 — exact 33-row Marvin/FourlinQ local closure scan.
 *
 * This does not declare FourlinQ a visual clone. It proves every row in the
 * approved comparison matrix still resolves to its intended FourlinQ outcome,
 * including intentional local adaptations and source-bounded states.
 *
 * Exit 0: all 33 rows pass on mobile and desktop.
 * Exit 1: route/state regression.
 * Exit 2: browser/server/app-shell failure.
 */
import {
  RM17_VIEWPORT,
  checkAlias,
  consentContext,
  launchQaBrowser,
  routeFinding,
  visitPublicRoute,
} from "./qa-contract.mjs";

const PARITY_ROUTE = [
  { name: "shared-chrome", path: "/", heading: "Built to Last", chrome: true },
  { name: "home", path: "/", heading: "Built to Last" },
  { name: "product-hub", path: "/products", heading: "Window, door, and specialist systems" },
  { name: "product-window", path: "/products?filter=windows", heading: "Window Systems", pressed: "Window Systems" },
  { name: "product-door", path: "/products?filter=doors", heading: "Door Systems", pressed: "Door Systems" },
  { name: "product-specialist", path: "/products?filter=specialist", heading: "Specialist Systems", pressed: "Specialist Systems" },
  { name: "product-alias-window", path: "/products/windows", canonical: "/products?filter=windows", heading: "Window Systems" },
  { name: "product-alias-door", path: "/products/doors", canonical: "/products?filter=doors", heading: "Door Systems" },
  { name: "product-alias-specialist", path: "/products/specialist", canonical: "/products?filter=specialist", heading: "Specialist Systems" },
  { name: "news-index", path: "/whats-new", heading: "From the workshop" },
  { name: "warranty", path: "/warranty", heading: "10-year limited warranty" },
  { name: "project-index", path: "/inspiration", heading: "Published project archive" },
  { name: "project-detail-gallery-4", path: "/projects/las-pinas-residence", heading: "Las Piñas", photoCount: 5 },
  { name: "project-detail-gallery-2", path: "/projects/bulacan-n-residence", heading: "N. Residence", photoCount: 3 },
  { name: "project-detail-gallery-1", path: "/projects/cebu-s-residences", heading: "Cebu", photoCount: 2 },
  { name: "project-detail-gallery-0", path: "/projects/cebu-r-residences", heading: "Cebu", photoCount: 1 },
  { name: "project-san-lorenzo-aluminium", path: "/projects/san-lorenzo-makati-aluminium", canonical: "/projects/san-lorenzo-makati-aluminium", heading: "San Lorenzo", photoCount: 5 },
  { name: "project-san-lorenzo-aluminum", path: "/projects/san-lorenzo-makati-aluminum", canonical: "/projects/san-lorenzo-makati-aluminium", heading: "San Lorenzo", photoCount: 5 },
  { name: "architect-resource", path: "/for-architects", heading: "Start a technical request" },
  { name: "design-tool", path: "/design-tool", heading: "Sketch a window", designTool: true },
  { name: "material-upvc", path: "/why-upvc", heading: "Why uPVC" },
  { name: "material-aluminium", path: "/aluminium", heading: "Explore FourlinQ's aluminium system names" },
  { name: "brand", path: "/brand", heading: "Custom systems. Clear source boundaries" },
  { name: "brand-contact-anchor", path: "/brand#contact", heading: "Custom systems. Clear source boundaries", anchor: "contact" },
  { name: "brand-showroom-anchor", path: "/brand#showrooms", heading: "Custom systems. Clear source boundaries", anchor: "showrooms" },
  { name: "faq", path: "/faq", heading: "Answers, organized" },
  { name: "care", path: "/care", heading: "system-specific care" },
  { name: "chooser", path: "/help-me-choose", heading: "Three questions" },
  { name: "finish", path: "/finishes", heading: "Twelve finishes" },
  { name: "legal-privacy", path: "/legal?page=privacy", heading: "Privacy Policy", current: "Privacy" },
  { name: "legal-terms", path: "/legal?page=terms", heading: "Terms of Service", current: "Website terms" },
  { name: "legal-cookies", path: "/legal?page=cookies", heading: "Cookie Policy", current: "Cookies" },
  { name: "not-found", path: "/__audit-not-found__", heading: "This page is somewhere else" },
];
const expectedRowCount = Number(process.env.QA_PARITY_EXPECTED_ROWS ?? 33);

async function customFinding(page, route) {
  const finding = [];

  if (route.canonical) {
    const aliasFinding = await checkAlias(page, route);
    if (aliasFinding) finding.push(aliasFinding);
  }

  if (route.chrome) {
    const chrome = await page.evaluate(() => ({
      nav: Boolean(document.querySelector("[data-main-nav]")),
      footer: Boolean(document.querySelector("footer")),
      chat: Boolean(document.querySelector("[data-chat-bubble]")),
      skip: Boolean(document.querySelector("a[href='#main-content']")),
    }));
    Object.entries(chrome).forEach(([key, value]) => { if (!value) finding.push(`${route.name}: missing shared ${key}`); });
  }

  if (route.photoCount) {
    const photoCount = await page.evaluate(() => {
      const button = document.querySelectorAll("ul[aria-label='Choose a project photo'] button").length;
      return button > 0 ? button : document.querySelectorAll("[aria-roledescription='carousel'] img:not([aria-hidden='true'])").length;
    });
    if (photoCount !== route.photoCount) finding.push(`${route.name}: expected ${route.photoCount} project photos, found ${photoCount}`);
  }

  if (route.anchor) {
    const anchor = await page.evaluate((id) => {
      const target = document.getElementById(id);
      if (!target) return { present: false, top: 0 };
      return { present: true, top: target.getBoundingClientRect().top };
    }, route.anchor);
    if (!anchor.present) finding.push(`${route.name}: #${route.anchor} target is missing`);
    else if (anchor.top < 60 || anchor.top > 180) finding.push(`${route.name}: #${route.anchor} did not settle below the fixed navigation (top=${Math.round(anchor.top)})`);
  }

  if (route.current) {
    const current = await page.locator("nav[aria-label='Legal notices'] [aria-current='page']").textContent().catch(() => "");
    if (current?.trim() !== route.current) finding.push(`${route.name}: expected current legal notice "${route.current}", got "${current?.trim() ?? ""}"`);
  }

  if (route.designTool) {
    const stepHeading = await page.getByRole("heading", { name: "Choose a product family" }).count();
    const category = await page.getByRole("group", { name: "Product category" }).count();
    const option = await page.getByRole("button", { name: "Casement", exact: true }).count();
    if (stepHeading < 1 || category < 1 || option < 1) finding.push(`${route.name}: product-family and opening-type controls did not render`);
  }

  return finding;
}

let browser;
const finding = [];

try {
  if (PARITY_ROUTE.length !== expectedRowCount) {
    finding.push(`closure contract drifted to ${PARITY_ROUTE.length} rows; expected ${expectedRowCount}`);
  } else {
    browser = await launchQaBrowser();
    for (const viewport of RM17_VIEWPORT) {
      const context = await consentContext(browser, viewport);
      try {
        const page = await context.newPage();
        for (const route of PARITY_ROUTE) {
          await visitPublicRoute(page, route, 450);
          finding.push(...(await routeFinding(page, route)).map((entry) => `${viewport.name}: ${entry}`));
          finding.push(...(await customFinding(page, route)).map((entry) => `${viewport.name}: ${entry}`));
        }
      } finally {
        await context.close();
      }
    }
  }
} catch (cause) {
  console.error(`PARITY INFRA — ${cause instanceof Error ? cause.message : String(cause)}`);
  process.exitCode = 2;
} finally {
  await browser?.close().catch(() => {});
}

if (process.exitCode !== 2) {
  if (finding.length > 0) {
    console.error("PARITY FAIL — 33-row closure finding:");
    finding.forEach((entry) => console.error(`- ${entry}`));
    process.exitCode = 1;
  } else {
    console.log(`PARITY PASS — ${PARITY_ROUTE.length} approved rows × ${RM17_VIEWPORT.length} viewports resolved to their intended local outcomes.`);
  }
}

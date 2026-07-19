#!/usr/bin/env node
/**
 * RM5 — public viewport containment scan.
 *
 * Exit 0: every public state is contained and aliases canonicalize.
 * Exit 1: app regression.
 * Exit 2: QA infrastructure, server, or app-shell failure.
 */
import {
  ALIAS_ROUTE,
  PUBLIC_ROUTE,
  QaInfraError,
  RM5_VIEWPORT,
  checkAlias,
  consentContext,
  launchQaBrowser,
  routeFinding,
  visitPublicRoute,
} from "./qa-contract.mjs";

let browser;
const finding = [];

try {
  browser = await launchQaBrowser();

  for (const viewport of RM5_VIEWPORT) {
    const context = await consentContext(browser, viewport);
    try {
      const page = await context.newPage();
      for (const route of PUBLIC_ROUTE) {
        await visitPublicRoute(page, route, 200);
        finding.push(...(await routeFinding(page, route)).map((entry) => `${viewport.name}: ${entry}`));
        const metric = await page.evaluate(() => ({
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        const widest = Math.max(metric.documentWidth, metric.bodyWidth);
        if (widest > metric.innerWidth + 1) {
          finding.push(`${viewport.name} ${route.name}: horizontal overflow ${widest}px > ${metric.innerWidth}px`);
        }
      }
    } finally {
      await context.close();
    }
  }

  const context = await consentContext(browser, RM5_VIEWPORT[0]);
  try {
    const page = await context.newPage();
    for (const route of ALIAS_ROUTE) {
      const aliasFinding = await checkAlias(page, route);
      if (aliasFinding) finding.push(aliasFinding);
    }
  } finally {
    await context.close();
  }
} catch (cause) {
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(`RM5 INFRA — ${message}`);
  process.exitCode = 2;
} finally {
  await browser?.close().catch(() => {});
}

if (process.exitCode !== 2) {
  if (finding.length > 0) {
    console.error("RM5 FAIL — viewport or route-state finding:");
    finding.forEach((entry) => console.error(`- ${entry}`));
    process.exitCode = 1;
  } else {
    console.log(`RM5 PASS — ${PUBLIC_ROUTE.length} public states × ${RM5_VIEWPORT.length} widths plus ${ALIAS_ROUTE.length} canonical aliases.`);
  }
}

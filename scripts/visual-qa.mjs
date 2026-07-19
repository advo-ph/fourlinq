#!/usr/bin/env node
/**
 * CP-4 visual regression evidence.
 *
 * Exit 0: every public state rendered, stayed contained, and produced evidence.
 * Exit 1: visible app regression.
 * Exit 2: browser/server/app-shell/output failure.
 */
import fs from "node:fs/promises";
import path from "node:path";
import {
  BASE_URL,
  PUBLIC_ROUTE,
  RM5_VIEWPORT,
  consentContext,
  launchQaBrowser,
  routeFinding,
  visitPublicRoute,
} from "./qa-contract.mjs";

const outputRoot = process.env.QA_OUTPUT_DIR ?? ".visual-qa";
const outputDir = path.join(outputRoot, `run-${new Date().toISOString().replace(/[:.]/g, "-")}`);

function overlap(first, second) {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

function boxLabel(box) {
  return `${box.name} [${Math.round(box.left)},${Math.round(box.top)} ${Math.round(box.width)}x${Math.round(box.height)}]`;
}

async function visibleFinding(page, route, viewport, stage) {
  const state = await page.evaluate(() => {
    const selector = [
      ["chat", "[data-chat-bubble]"],
      ["cookie", "[data-cookie-banner]"],
      ["instagram", "footer a[href*='instagram']"],
      ["facebook", "footer a[href*='facebook']"],
      ["hero-heading", "main h1"],
      ["nav", "[data-main-nav]"],
    ];
    const box = selector.flatMap(([name, query]) => {
      const node = Array.from(document.querySelectorAll(query));
      return node.map((entry, index) => {
        const rect = entry.getBoundingClientRect();
        const style = window.getComputedStyle(entry);
        return {
          name: node.length > 1 ? `${name}-${index + 1}` : name,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity || "1") > 0.01,
        };
      }).filter((entry) => entry.visible);
    });
    const brokenImage = Array.from(document.querySelectorAll("img")).filter((image) => {
      const rect = image.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
      return visible && image.complete && image.naturalWidth === 0;
    }).map((image) => image.getAttribute("src") ?? "unknown");
    return {
      box,
      brokenImage,
      required: {
        nav: Boolean(document.querySelector("[data-main-nav]")),
        heading: Boolean(document.querySelector("#main-content h1")),
        footer: Boolean(document.querySelector("footer")),
        chat: Boolean(document.querySelector("[data-chat-bubble]")),
        instagram: Boolean(document.querySelector("footer a[href*='instagram']")),
        facebook: Boolean(document.querySelector("footer a[href*='facebook']")),
      },
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      innerWidth: window.innerWidth,
    };
  });

  const finding = [];
  if (state.documentWidth > state.innerWidth + 1) {
    finding.push(`${route.name}/${viewport.name}/${stage}: horizontal overflow ${state.documentWidth}px > ${state.innerWidth}px`);
  }
  state.brokenImage.forEach((source) => finding.push(`${route.name}/${viewport.name}/${stage}: visible image failed (${source})`));
  if (stage === "top") {
    Object.entries(state.required).forEach(([name, present]) => {
      if (!present) finding.push(`${route.name}/${viewport.name}/${stage}: required ${name} hook is missing`);
    });
  }

  const boxByName = Object.fromEntries(state.box.map((box) => [box.name, box]));
  for (const [firstName, secondName] of [["chat", "cookie"], ["chat", "instagram"], ["chat", "facebook"], ["nav", "hero-heading"]]) {
    const first = boxByName[firstName];
    const second = boxByName[secondName];
    if (first && second && overlap(first, second)) {
      finding.push(`${route.name}/${viewport.name}/${stage}: ${boxLabel(first)} overlaps ${boxLabel(second)}`);
    }
  }
  if (!boxByName.nav) finding.push(`${route.name}/${viewport.name}/${stage}: main navigation is not visible`);
  if (stage === "top" && !boxByName["hero-heading"]) finding.push(`${route.name}/${viewport.name}/${stage}: h1 is not visible in the initial viewport`);
  return finding;
}

let browser;
const finding = [];
const artifact = [];

try {
  await fs.mkdir(outputDir, { recursive: true });
  browser = await launchQaBrowser();

  for (const viewport of RM5_VIEWPORT) {
    const context = await consentContext(browser, viewport);
    try {
      const page = await context.newPage();
      for (const route of PUBLIC_ROUTE) {
        await visitPublicRoute(page, route, 1_000);
        finding.push(...(await routeFinding(page, route)).map((entry) => `${viewport.name}: ${entry}`));
        finding.push(...await visibleFinding(page, route, viewport, "top"));
        const topArtifact = `${route.name}-${viewport.name}-top.png`;
        await page.screenshot({ path: path.join(outputDir, topArtifact) });
        artifact.push(topArtifact);

        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(500);
        finding.push(...await visibleFinding(page, route, viewport, "bottom"));
        const bottomArtifact = `${route.name}-${viewport.name}-bottom.png`;
        await page.screenshot({ path: path.join(outputDir, bottomArtifact) });
        artifact.push(bottomArtifact);
      }
    } finally {
      await context.close();
    }
  }

  const expectedCount = PUBLIC_ROUTE.length * RM5_VIEWPORT.length * 2;
  if (artifact.length !== expectedCount) {
    throw new Error(`visual evidence incomplete: expected ${expectedCount} screenshots, wrote ${artifact.length}`);
  }
  await fs.writeFile(path.join(outputDir, "report.json"), `${JSON.stringify({
    base_url: BASE_URL,
    generated_at: new Date().toISOString(),
    browser: browser.version(),
    expected_count: expectedCount,
    completed_count: artifact.length,
    route_count: PUBLIC_ROUTE.length,
    viewport_count: RM5_VIEWPORT.length,
    finding,
    artifact,
  }, null, 2)}\n`, "utf8");
} catch (cause) {
  console.error(`VISUAL QA INFRA — ${cause instanceof Error ? cause.message : String(cause)}`);
  process.exitCode = 2;
} finally {
  await browser?.close().catch(() => {});
}

if (process.exitCode !== 2) {
  if (finding.length > 0) {
    console.error("VISUAL QA FAIL:");
    finding.forEach((entry) => console.error(`- ${entry}`));
    process.exitCode = 1;
  } else {
    console.log(`VISUAL QA PASS — ${PUBLIC_ROUTE.length} public states × ${RM5_VIEWPORT.length} viewports. Evidence: ${outputDir}`);
  }
}

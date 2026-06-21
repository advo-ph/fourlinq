import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:8080";
const outputDir = process.env.QA_OUTPUT_DIR ?? ".visual-qa";

const viewports = [
  { name: "phone-375", width: 375, height: 667 },
  { name: "phone-560", width: 560, height: 720 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-992", width: 992, height: 768 },
  { name: "tablet-1100", width: 1100, height: 800 },
  { name: "tablet-1199", width: 1199, height: 900 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const routes = [
  { name: "home", path: "/" },
  { name: "products-specialist", path: "/products?filter=specialist" },
  { name: "brand", path: "/brand" },
  { name: "whats-new", path: "/whats-new" },
];

function overlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function formatBox(box) {
  return `${box.name} [${Math.round(box.left)},${Math.round(box.top)} ${Math.round(box.width)}x${Math.round(box.height)}]`;
}

async function collectBoxes(page) {
  return page.evaluate(() => {
    const selectors = [
      ["chat", "[data-chat-bubble]"],
      ["cookie", "[data-cookie-banner]"],
      ["instagram", "footer a[href*='instagram']"],
      ["facebook", "footer a[href*='facebook']"],
      ["hero-heading", "main h1"],
      ["nav", "[data-main-nav]"],
    ];

    return selectors.flatMap(([name, selector]) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      return nodes.map((node, index) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Number(style.opacity || "1") > 0.01;
        return {
          name: nodes.length > 1 ? `${name}-${index + 1}` : name,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          visible,
        };
      }).filter((box) => box.visible);
    });
  });
}

async function checkPage(page, route, viewport, stage, failures) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  if (scrollWidth > viewport.width + 1) {
    failures.push(`${route.name}/${viewport.name}/${stage}: horizontal overflow ${scrollWidth}px > ${viewport.width}px`);
  }

  const boxes = await collectBoxes(page);
  const byName = Object.fromEntries(boxes.map((box) => [box.name, box]));
  const pairs = [
    ["chat", "cookie"],
    ["chat", "instagram"],
    ["chat", "facebook"],
    ["nav", "hero-heading"],
  ];

  for (const [aName, bName] of pairs) {
    const a = byName[aName];
    const b = byName[bName];
    if (a && b && overlap(a, b)) {
      failures.push(`${route.name}/${viewport.name}/${stage}: ${formatBox(a)} overlaps ${formatBox(b)}`);
    }
  }
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const failures = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await context.newPage();
      await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2200);

      await checkPage(page, route, viewport, "top", failures);
      await page.screenshot({
        path: path.join(outputDir, `${route.name}-${viewport.name}-top.png`),
        fullPage: false,
      });

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(300);
      await checkPage(page, route, viewport, "bottom", failures);
      await page.screenshot({
        path: path.join(outputDir, `${route.name}-${viewport.name}-bottom.png`),
        fullPage: false,
      });

      await page.close();
    }
    await context.close();
  }

  await browser.close();

  if (failures.length) {
    console.error("Visual QA failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`Visual QA passed. Screenshots written to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

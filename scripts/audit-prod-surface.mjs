import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const base_url = process.env.AUDIT_BASE_URL ?? "https://fourlinq.ph";
const output_dir = process.env.AUDIT_OUTPUT_DIR ?? ".prod-surface-audit";

const viewport = [
  { viewport_code: "mobile", width: 390, height: 844 },
  { viewport_code: "tablet", width: 768, height: 1024 },
  { viewport_code: "desktop", width: 1440, height: 900 },
];

const route = [
  { route_code: "home", route_path: "/" },
  { route_code: "product", route_path: "/products" },
  { route_code: "product-window", route_path: "/products?filter=windows" },
  { route_code: "product-door", route_path: "/products?filter=doors" },
  { route_code: "product-specialist", route_path: "/products?filter=specialist" },
  { route_code: "aluminium", route_path: "/aluminium" },
  { route_code: "design-tool", route_path: "/design-tool" },
  { route_code: "why-upvc", route_path: "/why-upvc" },
  { route_code: "inspiration", route_path: "/inspiration" },
  { route_code: "whats-new", route_path: "/whats-new" },
  { route_code: "for-architect", route_path: "/for-architects" },
  { route_code: "warranty", route_path: "/warranty" },
  { route_code: "care", route_path: "/care" },
  { route_code: "faq", route_path: "/faq" },
  { route_code: "choose", route_path: "/help-me-choose" },
  { route_code: "finish", route_path: "/finishes" },
  { route_code: "brand", route_path: "/brand" },
  { route_code: "legal", route_path: "/legal" },
  { route_code: "admin", route_path: "/admin" },
];

const scroll_fraction = [0, 0.25, 0.5, 0.75, 1];

async function ensure_output() {
  await fs.mkdir(output_dir, { recursive: true });
}

async function scroll_through(page) {
  await page.evaluate(async () => {
    const max_y = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y <= max_y; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, max_y);
    await new Promise((resolve) => setTimeout(resolve, 250));
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
}

async function collect_surface(page) {
  return page.evaluate(() => {
    const text_of = (node) => (node.textContent ?? "").replace(/\s+/g, " ").trim();
    const rect_of = (node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y + window.scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };
    const is_visible = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" &&
        style.visibility !== "hidden" && Number(style.opacity || "1") > 0.01;
    };
    const label_of = (node) =>
      node.getAttribute("aria-label") || node.getAttribute("title") || text_of(node);

    const heading = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))
      .filter(is_visible)
      .map((node) => ({
        level: Number(node.tagName.slice(1)),
        text: text_of(node),
        ...rect_of(node),
      }));

    const section = Array.from(document.querySelectorAll("main > *, main section, [role='region']"))
      .filter(is_visible)
      .map((node, index) => {
        const first_heading = node.querySelector("h1,h2,h3,h4,h5,h6");
        return {
          section_code: `section_${String(index + 1).padStart(3, "0")}`,
          tag: node.tagName.toLowerCase(),
          label: node.getAttribute("aria-label") || text_of(first_heading ?? node).slice(0, 160),
          class_name: node.className?.toString().slice(0, 240) ?? "",
          ...rect_of(node),
        };
      });

    const image = Array.from(document.images).map((node) => ({
      source: node.currentSrc || node.src,
      alt: node.alt,
      loading: node.loading,
      natural_width: node.naturalWidth,
      natural_height: node.naturalHeight,
      is_complete: node.complete,
      is_visible: is_visible(node),
      ...rect_of(node),
    }));

    const video = Array.from(document.querySelectorAll("video")).map((node) => ({
      source: node.currentSrc || node.src,
      poster: node.poster,
      is_autoplay: node.autoplay,
      is_muted: node.muted,
      is_loop: node.loop,
      ready_state: node.readyState,
      duration_second: Number.isFinite(node.duration) ? node.duration : null,
      ...rect_of(node),
    }));

    const canvas = Array.from(document.querySelectorAll("canvas")).map((node) => ({
      width: node.width,
      height: node.height,
      ...rect_of(node),
    }));

    const link = Array.from(document.querySelectorAll("a[href]"))
      .filter(is_visible)
      .map((node) => ({
        label: label_of(node),
        href: node.href,
        ...rect_of(node),
      }));

    const button = Array.from(document.querySelectorAll("button,[role='button'],summary"))
      .filter(is_visible)
      .map((node) => ({
        label: label_of(node),
        tag: node.tagName.toLowerCase(),
        is_disabled: node.disabled === true || node.getAttribute("aria-disabled") === "true",
        ...rect_of(node),
      }));

    const motion = Array.from(document.querySelectorAll("body *"))
      .filter((node) => {
        const style = getComputedStyle(node);
        return is_visible(node) && (
          style.animationName !== "none" ||
          style.transitionDuration.split(",").some((value) => parseFloat(value) > 0) ||
          style.transform !== "none" ||
          style.position === "sticky"
        );
      })
      .slice(0, 500)
      .map((node) => {
        const style = getComputedStyle(node);
        return {
          tag: node.tagName.toLowerCase(),
          label: label_of(node).slice(0, 120),
          class_name: node.className?.toString().slice(0, 200) ?? "",
          animation_name: style.animationName,
          animation_duration: style.animationDuration,
          transition_property: style.transitionProperty,
          transition_duration: style.transitionDuration,
          transition_timing: style.transitionTimingFunction,
          transform: style.transform,
          position: style.position,
          ...rect_of(node),
        };
      });

    const animation = document.getAnimations().map((item) => ({
      play_state: item.playState,
      current_time: item.currentTime,
      start_time: item.startTime,
      effect_timing: item.effect?.getTiming?.() ?? null,
    }));

    const nav = Array.from(document.querySelectorAll("nav"))
      .filter(is_visible)
      .map((node) => ({ label: label_of(node).slice(0, 500), ...rect_of(node) }));

    const footer = Array.from(document.querySelectorAll("footer"))
      .filter(is_visible)
      .map((node) => ({ label: text_of(node).slice(0, 1000), ...rect_of(node) }));

    return {
      title: document.title,
      url: location.href,
      scroll_height: document.documentElement.scrollHeight,
      scroll_width: document.documentElement.scrollWidth,
      viewport_width: innerWidth,
      viewport_height: innerHeight,
      heading,
      section,
      image,
      video,
      canvas,
      link,
      button,
      motion,
      animation,
      nav,
      footer,
      missing_alt_count: image.filter((item) => !item.alt.trim()).length,
      broken_image_count: image.filter((item) => item.is_complete && item.natural_width === 0).length,
      empty_button_count: button.filter((item) => !item.label.trim()).length,
      empty_link_count: link.filter((item) => !item.label.trim()).length,
      is_horizontal_overflow: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
}

async function collect_scroll_state(page, fraction) {
  return page.evaluate(async (target_fraction) => {
    const max_y = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const target_y = Math.round(max_y * target_fraction);
    window.scrollTo(0, target_y);
    await new Promise((resolve) => setTimeout(resolve, 450));
    const candidate = Array.from(document.querySelectorAll("main h1,main h2,main h3,main section,main video,main canvas,[class*='sticky']"));
    const visible = candidate.filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.bottom > 0 && rect.top < innerHeight && rect.width > 0 && rect.height > 0 &&
        style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || "1") > 0.01;
    }).map((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        tag: node.tagName.toLowerCase(),
        label: (node.getAttribute("aria-label") || node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 160),
        class_name: node.className?.toString().slice(0, 200) ?? "",
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        opacity: style.opacity,
        transform: style.transform,
        position: style.position,
      };
    });
    return { fraction: target_fraction, scroll_y: scrollY, visible };
  }, fraction);
}

async function capture_route(browser, route_item, viewport_item) {
  const context = await browser.newContext({
    viewport: { width: viewport_item.width, height: viewport_item.height },
    reducedMotion: "no-preference",
  });
  const blocked_request = [];
  await context.route("**/*", async (route_handle) => {
    const request_url = route_handle.request().url();
    if (request_url.includes("/api/analytics") || request_url.includes("google-analytics.com") || request_url.includes("googletagmanager.com")) {
      blocked_request.push({
        method: route_handle.request().method(),
        url: request_url,
        reason: "read-only audit",
      });
      await route_handle.abort();
      return;
    }
    await route_handle.continue();
  });

  const page = await context.newPage();
  const console_error = [];
  const page_error = [];
  const request_failure = [];
  page.on("console", (message) => {
    if (message.type() === "error") console_error.push(message.text());
  });
  page.on("pageerror", (error) => page_error.push(error.message));
  page.on("requestfailed", (request) => {
    const request_url = request.url();
    const is_blocked = request_url.includes("/api/analytics") || request_url.includes("google-analytics.com") || request_url.includes("googletagmanager.com");
    if (!is_blocked) {
      request_failure.push({
        url: request_url,
        reason: request.failure()?.errorText ?? "unknown",
      });
    }
  });

  const target_url = new URL(route_item.route_path, base_url).toString();
  const response = await page.goto(target_url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(1_600);
  await scroll_through(page);

  const surface = await collect_surface(page);
  const scroll_state = [];
  for (const fraction of scroll_fraction) {
    scroll_state.push(await collect_scroll_state(page, fraction));
    if (route_item.route_code === "home") {
      await page.screenshot({
        path: path.join(output_dir, `${route_item.route_code}-${viewport_item.viewport_code}-scroll-${String(Math.round(fraction * 100)).padStart(3, "0")}.png`),
        fullPage: false,
      });
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);

  const screenshot_path = path.join(output_dir, `${route_item.route_code}-${viewport_item.viewport_code}-full.png`);
  await page.screenshot({ path: screenshot_path, fullPage: true });

  const result = {
    route_code: route_item.route_code,
    route_path: route_item.route_path,
    viewport_code: viewport_item.viewport_code,
    width: viewport_item.width,
    height: viewport_item.height,
    status: response?.status() ?? null,
    screenshot_path,
    console_error: blocked_request.length > 0
      ? console_error.filter((message) => message !== "Failed to load resource: net::ERR_FAILED")
      : console_error,
    page_error,
    request_failure,
    blocked_request,
    surface,
    scroll_state,
  };

  await page.close();
  await context.close();
  return result;
}

async function capture_interaction(browser) {
  const interaction = [];

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route("**/api/analytics", (route_handle) => route_handle.abort());
    const page = await context.newPage();
    await page.goto(new URL("/", base_url).toString(), { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1_200);
    const system_link = page.getByRole("link", { name: "Systems", exact: true }).first();
    await system_link.hover();
    await page.waitForTimeout(450);
    const screenshot_path = path.join(output_dir, "interaction-desktop-system-menu.png");
    await page.screenshot({ path: screenshot_path, fullPage: false });
    interaction.push({ interaction_code: "desktop-system-menu", screenshot_path });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route("**/api/analytics", (route_handle) => route_handle.abort());
    const page = await context.newPage();
    await page.goto(new URL("/", base_url).toString(), { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1_200);
    await page.getByRole("button", { name: "Toggle menu" }).click();
    await page.waitForTimeout(350);
    const screenshot_path = path.join(output_dir, "interaction-mobile-menu.png");
    await page.screenshot({ path: screenshot_path, fullPage: false });
    interaction.push({ interaction_code: "mobile-menu", screenshot_path });
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route("**/api/analytics", (route_handle) => route_handle.abort());
    const page = await context.newPage();
    await page.goto(new URL("/products?filter=windows", base_url).toString(), { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1_500);
    const product_button = page.locator("main button").filter({ has: page.locator("h3") }).first();
    if (await product_button.count()) {
      await product_button.click();
      await page.waitForTimeout(450);
      const screenshot_path = path.join(output_dir, "interaction-product-drawer.png");
      await page.screenshot({ path: screenshot_path, fullPage: false });
      interaction.push({ interaction_code: "product-drawer", screenshot_path });
    }
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route("**/api/analytics", (route_handle) => route_handle.abort());
    const page = await context.newPage();
    await page.goto(new URL("/faq", base_url).toString(), { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1_000);
    const disclosure = page.locator("button").filter({ hasText: /.+/ }).nth(1);
    if (await disclosure.count()) {
      await disclosure.click();
      await page.waitForTimeout(300);
      const screenshot_path = path.join(output_dir, "interaction-faq-disclosure.png");
      await page.screenshot({ path: screenshot_path, fullPage: false });
      interaction.push({ interaction_code: "faq-disclosure", screenshot_path });
    }
    await context.close();
  }

  return interaction;
}

async function main() {
  await ensure_output();
  const browser = await chromium.launch({ headless: true });
  const result = [];

  for (const viewport_item of viewport) {
    for (const route_item of route) {
      process.stdout.write(`capture ${route_item.route_code}/${viewport_item.viewport_code}\n`);
      result.push(await capture_route(browser, route_item, viewport_item));
    }
  }

  const interaction = await capture_interaction(browser);
  await browser.close();

  const report = {
    generated_at: new Date().toISOString(),
    base_url,
    route,
    viewport,
    interaction,
    result,
  };

  const report_path = path.join(output_dir, "prod-surface-report.json");
  await fs.writeFile(report_path, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`report ${report_path}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

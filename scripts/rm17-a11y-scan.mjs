#!/usr/bin/env node
/**
 * RM17 — accessibility, focus-state, and fixed-layer browser gate.
 *
 * Exit 0: deterministic checks pass.
 * Exit 1: app accessibility regression.
 * Exit 2: browser/server/app-shell failure.
 */
import {
  PUBLIC_ROUTE,
  RM17_VIEWPORT,
  consentContext,
  launchQaBrowser,
  routeFinding,
  visitPublicRoute,
} from "./qa-contract.mjs";

function scanPage() {
  const finding = { noAlt: [], emptyControl: [], dialogName: [], duplicateId: [], covered: [], missingRequired: [] };

  const required = {
    nav: document.querySelector("[data-main-nav]"),
    heading: document.querySelector("#main-content h1"),
    footer: document.querySelector("footer"),
    chat: document.querySelector("[data-chat-bubble]"),
  };
  Object.entries(required).forEach(([name, element]) => { if (!element) finding.missingRequired.push(name); });

  document.querySelectorAll("img").forEach((image) => {
    if (!image.hasAttribute("alt")) finding.noAlt.push((image.getAttribute("src") || "").slice(-64));
  });

  const accessibleName = (element) => {
    const labelledBy = (element.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent || "").join(" ");
    const label = "labels" in element && element.labels
      ? Array.from(element.labels).map((entry) => entry.textContent || "").join(" ")
      : "";
    return (element.getAttribute("aria-label") || labelledBy || label || element.getAttribute("title") || element.textContent || "")
      .replace(/\s+/g, " ").trim();
  };

  document.querySelectorAll("button,a[href],input:not([type='hidden']),select,textarea,[role='button']").forEach((element) => {
    if (!accessibleName(element)) {
      finding.emptyControl.push(`${element.tagName.toLowerCase()}${element.getAttribute("href") ? `[${element.getAttribute("href")}]` : ""}`);
    }
  });

  document.querySelectorAll("[role='dialog']").forEach((dialog) => {
    if (!accessibleName(dialog)) finding.dialogName.push(dialog.outerHTML.slice(0, 100));
  });

  const idCount = new Map();
  document.querySelectorAll("[id]").forEach((element) => idCount.set(element.id, (idCount.get(element.id) || 0) + 1));
  idCount.forEach((count, id) => { if (count > 1) finding.duplicateId.push(`${id} × ${count}`); });

  const overlay = [];
  document.querySelectorAll("*").forEach((element) => {
    const style = getComputedStyle(element);
    if ((style.position === "fixed" || style.position === "sticky") && Number.parseInt(style.zIndex || "0", 10) >= 20) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) overlay.push(element);
    }
  });
  const control = Array.from(document.querySelectorAll("button,a[href],input,select,textarea,[role='button']")).filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0 && rect.left < innerWidth && rect.right > 0;
  });
  overlay.forEach((layer) => {
    const layerRect = layer.getBoundingClientRect();
    control.forEach((element) => {
      if (layer === element || layer.contains(element) || element.contains(layer)) return;
      const rect = element.getBoundingClientRect();
      const intersectionX = Math.max(0, Math.min(layerRect.right, rect.right) - Math.max(layerRect.left, rect.left));
      const intersectionY = Math.max(0, Math.min(layerRect.bottom, rect.bottom) - Math.max(layerRect.top, rect.top));
      if (intersectionX * intersectionY / (rect.width * rect.height) <= 0.25) return;
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (top && (top === layer || layer.contains(top))) {
        finding.covered.push(`${layer.tagName}(z${getComputedStyle(layer).zIndex}) covers ${element.tagName} "${accessibleName(element).slice(0, 28)}"`);
      }
    });
  });
  finding.covered = Array.from(new Set(finding.covered));
  return finding;
}

async function focusFinding(page, selector, label) {
  // Custom dialogs set their initial focus on the next animation frame so the
  // newly mounted controls have measurable boxes. Wait for that explicit
  // contract instead of racing the render immediately after `visible`.
  await page.waitForFunction((dialogSelector) => {
    const dialog = document.querySelector(dialogSelector);
    return dialog instanceof HTMLElement && dialog.contains(document.activeElement);
  }, selector, { timeout: 1_200 }).catch(() => {});
  const state = await page.locator(selector).evaluate((dialog) => {
    const active = document.activeElement;
    const focusable = Array.from(dialog.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]):not([type='hidden']),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])"))
      .filter((entry) => {
        const style = getComputedStyle(entry);
        const rect = entry.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
    return { inside: active instanceof Node && dialog.contains(active), count: focusable.length };
  });
  if (!state.inside) return `${label}: initial focus is outside the dialog`;

  for (let index = 0; index < state.count + 1; index += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.locator(selector).evaluate((dialog) => dialog.contains(document.activeElement));
    if (!inside) return `${label}: Tab escaped the dialog after ${index + 1} step(s)`;
  }
  return null;
}

async function staticScan(browser, finding) {
  for (const viewport of RM17_VIEWPORT) {
    const context = await consentContext(browser, viewport);
    try {
      const page = await context.newPage();
      for (const route of PUBLIC_ROUTE) {
        await visitPublicRoute(page, route, 900);
        finding.push(...(await routeFinding(page, route)).map((entry) => `${viewport.name}: ${entry}`));
        const scan = await page.evaluate(scanPage);
        scan.noAlt.forEach((entry) => finding.push(`${viewport.name} ${route.name}: <img> missing alt (${entry})`));
        scan.emptyControl.forEach((entry) => finding.push(`${viewport.name} ${route.name}: unnamed control (${entry})`));
        scan.dialogName.forEach((entry) => finding.push(`${viewport.name} ${route.name}: unnamed dialog (${entry})`));
        scan.duplicateId.forEach((entry) => finding.push(`${viewport.name} ${route.name}: duplicate id (${entry})`));
        scan.covered.forEach((entry) => finding.push(`${viewport.name} ${route.name}: ${entry}`));
        scan.missingRequired.forEach((entry) => finding.push(`${viewport.name} ${route.name}: required ${entry} hook is missing`));
      }
    } finally {
      await context.close();
    }
  }
}

async function cookieLayerScan(browser, finding) {
  for (const viewport of RM17_VIEWPORT) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    try {
      const page = await context.newPage();
      await visitPublicRoute(page, { name: "cookie-state", path: "/design-tool" });
      const cookie = page.locator("[data-cookie-banner]");
      const cookieVisible = await cookie.waitFor({ state: "visible", timeout: 4_000 }).then(() => true).catch(() => false);
      if (!cookieVisible) {
        finding.push(`${viewport.name}: fresh cookie consent did not appear`);
      } else {
        await page.waitForTimeout(500);
        const state = await page.evaluate(() => {
          const banner = document.querySelector("[data-cookie-banner]");
          const chat = document.querySelector("[data-chat-bubble]");
          if (!banner || !chat) return { present: false, collide: false };
          const bannerRect = banner.getBoundingClientRect();
          const chatRect = chat.getBoundingClientRect();
          return {
            present: true,
            collide: !(bannerRect.right < chatRect.left || chatRect.right < bannerRect.left || bannerRect.bottom < chatRect.top || chatRect.bottom < bannerRect.top),
          };
        });
        if (!state.present) finding.push(`${viewport.name}: fresh cookie/chat layer did not render`);
        else if (state.collide) finding.push(`${viewport.name}: chat bubble collides with cookie consent`);
      }

      // NOTE: the embedded Design Tool isolation checks that belong here ship
      // with the Design Tool embed work, which is held back for the content
      // review. Restore them alongside src/lib/embed.ts.
    } finally {
      await context.close();
    }
  }
}

async function dialogStateScan(browser, finding) {
  const mobile = RM17_VIEWPORT[0];
  const context = await consentContext(browser, mobile);
  try {
    const page = await context.newPage();
    await visitPublicRoute(page, { name: "dialog-state", path: "/products?filter=windows" }, 1_200);
    try {
      const chatButton = page.getByRole("button", { name: "Open chat" });
      if (await chatButton.count() !== 1) {
        finding.push("chat dialog: required trigger is missing");
        return;
      }
      await chatButton.click();
      await page.locator("#linq-dialog").waitFor({ state: "visible" });
      const chatFinding = await focusFinding(page, "#linq-dialog", "chat dialog");
      if (chatFinding) finding.push(chatFinding);
      await page.keyboard.press("Escape");
      await page.locator("#linq-dialog").waitFor({ state: "detached" });
      await page.waitForTimeout(80);
      if (!(await chatButton.evaluate((button) => document.activeElement === button))) finding.push("chat dialog: focus did not return to its trigger");

      const menuButton = page.getByRole("button", { name: "Toggle menu" });
      if (await menuButton.count() !== 1) {
        finding.push("mobile navigation dialog: required trigger is missing");
        return;
      }
      await menuButton.click();
      await page.locator("#mobile-navigation-dialog").waitFor({ state: "visible" });
      const menuFinding = await focusFinding(page, "#mobile-navigation-dialog", "mobile navigation dialog");
      if (menuFinding) finding.push(menuFinding);
      await page.keyboard.press("Escape");
      await page.locator("#mobile-navigation-dialog").waitFor({ state: "detached" });
      await page.waitForTimeout(80);
      if (!(await menuButton.evaluate((button) => document.activeElement === button))) finding.push("mobile navigation dialog: focus did not return to its trigger");

      const productCard = page.locator("[data-product-card]").first();
      const productVisible = await productCard.waitFor({ state: "visible", timeout: 12_000 }).then(() => true).catch(() => false);
      if (!productVisible) {
        finding.push("product drawer: required product card is missing");
        return;
      }
      await productCard.click();
      await page.locator("[data-product-drawer]").waitFor({ state: "visible" });
      const productFinding = await focusFinding(page, "[data-product-drawer]", "product drawer");
      if (productFinding) finding.push(productFinding);

      const quoteButton = page.locator("[data-product-drawer]").getByRole("button", { name: "Request a Quote" });
      if (await quoteButton.count() !== 1) {
        finding.push("quote dialog: required trigger is missing");
        return;
      }
      await quoteButton.click();
      await page.locator("[data-quote-dialog]").waitFor({ state: "visible" });
      const quoteFinding = await focusFinding(page, "[data-quote-dialog]", "quote dialog");
      if (quoteFinding) finding.push(quoteFinding);
      await page.keyboard.press("Escape");
      await page.locator("[data-quote-dialog]").waitFor({ state: "detached" });
      if (!(await page.locator("[data-product-drawer]").isVisible())) finding.push("quote dialog: Escape also closed its parent product drawer");
      await page.waitForTimeout(450);
      if (!(await quoteButton.evaluate((button) => document.activeElement === button))) finding.push("quote dialog: focus did not return inside the product drawer");

      await page.keyboard.press("Escape");
      await page.locator("[data-product-drawer]").waitFor({ state: "detached" });
      await page.waitForTimeout(80);
      if (!(await productCard.evaluate((button) => document.activeElement === button))) finding.push("product drawer: focus did not return to the selected product card");
    } catch (cause) {
      finding.push(`dialog interaction state: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  } finally {
    await context.close();
  }
}

let browser;
const finding = [];

try {
  browser = await launchQaBrowser();
  await staticScan(browser, finding);
  await cookieLayerScan(browser, finding);
  await dialogStateScan(browser, finding);
} catch (cause) {
  console.error(`RM17 INFRA — ${cause instanceof Error ? cause.message : String(cause)}`);
  process.exitCode = 2;
} finally {
  await browser?.close().catch(() => {});
}

if (process.exitCode !== 2) {
  if (finding.length > 0) {
    console.error("RM17 FAIL — accessibility, focus, or fixed-layer finding:");
    finding.forEach((entry) => console.error(`- ${entry}`));
    process.exitCode = 1;
  } else {
    console.log(`RM17 PASS — ${PUBLIC_ROUTE.length} routes × ${RM17_VIEWPORT.length} viewports plus cookie, chat, menu, product-drawer, and quote-dialog states.`);
  }
}

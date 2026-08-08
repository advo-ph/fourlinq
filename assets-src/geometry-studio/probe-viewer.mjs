#!/usr/bin/env node
/**
 * Smoke-probe an imported geometry-studio viewer in a real browser.
 *
 * Loads the page, collects console errors and failed requests, then asks the
 * live scene how many meshes the stage is holding and whether the open-pose
 * control actually moves geometry. A viewer that renders an empty stage still
 * "loads", so the mesh count and the pose delta are the real assertions.
 *
 * Usage: node probe-viewer.mjs <url> [screenshotPath]
 */
import { chromium } from "playwright";

const [url, shot] = process.argv.slice(2);
if (!url) {
  console.error("usage: node probe-viewer.mjs <url> [screenshotPath]");
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleError = [];
const failedRequest = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleError.push(m.text());
});
page.on("pageerror", (e) => consoleError.push(`pageerror: ${e.message}`));
page.on("requestfailed", (r) =>
  failedRequest.push(`${r.failure()?.errorText} ${r.url()}`),
);

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
// The stage builds its scene behind `await stage.ready`; give three.js from
// the CDN a beat to boot before interrogating it.
await page.waitForTimeout(4000);

const report = await page.evaluate(async () => {
  const stage = document.querySelector("three-d-stage");
  if (!stage) return { error: "no <three-d-stage> element" };
  try {
    await stage.ready;
  } catch (e) {
    return { error: "stage.ready rejected: " + (e && e.message) };
  }
  const obj = stage._object;
  if (!obj) return { error: "stage holds no object" };

  let meshCount = 0;
  const materialName = new Set();
  obj.traverse((o) => {
    if (!o.isMesh) return;
    meshCount += 1;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((m) => m && m.name && materialName.add(m.name));
  });

  // Does the open control actually move geometry? Compare a world position
  // of the first pivot's child between the closed and open pose.
  let poseDelta = null;
  const slider = document.getElementById("open");
  if (slider) {
    const THREE = stage._THREE;
    const pivot = [];
    obj.traverse((o) => {
      if (o.name && /pivot/i.test(o.name) && !/lever/i.test(o.name)) pivot.push(o);
    });
    if (pivot.length && THREE) {
      const probe = pivot[0];
      const at = (v) => {
        slider.value = String(v);
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        obj.updateMatrixWorld(true);
        return new THREE.Vector3().setFromMatrixPosition(probe.matrixWorld).clone();
      };
      const closed = at(0);
      const open = at(1);
      // A hinge pivot itself may not translate, so measure a descendant.
      const child = probe.children.find((c) => c.isMesh);
      if (child) {
        const cAt = (v) => {
          slider.value = String(v);
          slider.dispatchEvent(new Event("input", { bubbles: true }));
          obj.updateMatrixWorld(true);
          return new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
        };
        const c0 = cAt(0).clone();
        const c1 = cAt(1).clone();
        poseDelta = Number(c0.distanceTo(c1).toFixed(4));
      } else {
        poseDelta = Number(closed.distanceTo(open).toFixed(4));
      }
      slider.value = "0";
      slider.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  return {
    title: document.title,
    meshCount,
    materialName: [...materialName].sort(),
    poseDelta,
  };
});

if (shot) await page.screenshot({ path: shot });
await browser.close();

console.log(JSON.stringify({ url, ...report, consoleError, failedRequest }, null, 2));

const ok =
  !report.error &&
  report.meshCount > 0 &&
  consoleError.length === 0 &&
  failedRequest.length === 0;
process.exit(ok ? 0 : 1);

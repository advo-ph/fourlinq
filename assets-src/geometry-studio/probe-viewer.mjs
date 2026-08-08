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

  // Does the open control actually move geometry?
  //
  // Name-matching a pivot does not generalise: a casement hinges on
  // `sash_pivot`, a glider translates `panel_operable_carrier`, a bifold folds
  // a chain of panels, and a door's pivot child is a hinge leaf sitting almost
  // on the swing axis (which reads as ~0 travel even at a full 90° swing).
  //
  // So measure the model instead of guessing at it: snapshot every mesh's
  // world position closed and open, and report the LARGEST displacement any
  // mesh undergoes. That is motion-type agnostic and cannot be fooled by
  // naming. `movedMesh_count` separates "one part twitched" from "a leaf swung".
  let poseDelta = null;
  let movedMeshCount = null;
  const slider = document.getElementById("open");
  const THREE = stage._THREE;
  if (slider && THREE) {
    const snapshot = (v) => {
      slider.value = String(v);
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      obj.updateMatrixWorld(true);
      const point = [];
      obj.traverse((o) => {
        if (o.isMesh) point.push(new THREE.Vector3().setFromMatrixPosition(o.matrixWorld));
      });
      return point;
    };
    const closed = snapshot(0);
    const open = snapshot(1);
    if (closed.length && closed.length === open.length) {
      let max = 0;
      let moved = 0;
      for (let i = 0; i < closed.length; i++) {
        const d = closed[i].distanceTo(open[i]);
        if (d > max) max = d;
        if (d > 0.001) moved += 1;      // 1 mm — below that is float noise
      }
      poseDelta = Number(max.toFixed(4));
      movedMeshCount = moved;
    }
    slider.value = "0";
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return {
    title: document.title,
    meshCount,
    materialName: [...materialName].sort(),
    poseDelta,
    movedMeshCount,
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

/**
 * Bakes a system's opening animation into the 28-frame WebP set that the nav
 * and system cards scrub on hover (see src/data/systemAnimations.ts).
 *
 * The ten sets that already exist were extracted from product video. Four
 * systems the client named have no video and so have dead tiles: louvre,
 * automated-window, sliding-casement-door, automated-door. We own GLBs for all four, with the
 * mechanism already authored as a baked clip, so the frames can be rendered
 * rather than filmed — deterministic, re-runnable, and no provenance question.
 *
 *   node scripts/bake-system-anim.mjs                    # all four
 *   node scripts/bake-system-anim.mjs --only louvre
 *   node scripts/bake-system-anim.mjs --dry              # contact sheet only
 *
 * This does NOT screenshot the live viewer. /design-tool has a gradient
 * backdrop, an orbit camera and its own lighting; frames taken from it would
 * sit next to the filmed tiles looking like a different product line. Instead
 * it stands up a throwaway three.js scene matched to the filmed look: pure
 * white ground, locked-off camera, flat frontal light, jet-black frame.
 *
 * Review the contact sheet in .qa-film/ before committing 112 new binaries.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const arg = process.argv.slice(2);
const flag = (n, d) => {
  const i = arg.indexOf(`--${n}`);
  return i >= 0 && arg[i + 1] && !arg[i + 1].startsWith("--") ? arg[i + 1] : d;
};
const has = (n) => arg.includes(`--${n}`);

/**
 * Product card id → the GLB that depicts it.
 *
 * They are the same string more often than not, but not always, and the four
 * exceptions are all places where guessing would ship the wrong product:
 *
 *   casement          → casement-2lite   the card and the filmed tile are both a
 *                                        TWIN-leaf casement; `casement.glb` is a
 *                                        single sash
 *   lift-and-slide    → lift-slide       naming drift between spec and registry
 *   large-panel-doors → multislide       contested, see docs/prompt/video/
 *   90-series         → ninety-series    contested, see docs/prompt/video/
 *
 * Keyed by PRODUCT id because that is what `getSystemAnimation` looks up and
 * what the frame directory is named — not by GLB id.
 */
const MODEL_FOR = {
  casement: "casement-2lite",
  sliding: "sliding",
  awning: "awning",
  louvre: "louvre",
  "automated-window": "automated-window",
  "sliding-door": "sliding-door",
  "slide-and-fold": "slide-and-fold",
  "casement-door": "casement-door",
  "french-door": "french-door",
  "large-panel-doors": "multislide",
  "lift-and-slide": "lift-slide",
  "90-series": "ninety-series",
  "sliding-casement-door": "sliding-casement-door",
  "automated-door": "automated-door",
};

const TARGET = Object.keys(MODEL_FOR);

/** Matches the filmed sets exactly — 28 frames at 640x360, closed to open. */
const FRAME_COUNT = 28;
const WIDTH = 640;
const HEIGHT = 360;

/**
 * Clip time of the fully-open pose. Every baked GLB authors the same clip —
 * 0 closed, open at 2 s, back to closed at 4 s — so sampling 0..2 s gives the
 * one-way sweep the player wants. Mirrors SystemConfig.openTime.
 */
const OPEN_TIME = 2;

/**
 * The camera sits on the INTERIOR side (+Z), matching the 3D viewer.
 *
 * This was -1 at first, on the reasoning that every filmed tile shows leaves
 * swinging toward the viewer and that reads best on a 200 px tile. It is the
 * wrong trade, for two reasons that only showed up once the hardware moved.
 *
 * The decisive one: docs/3D_ASSET_BRIEF.md defines +Z as the interior, "the
 * side the viewer's camera sits on". An exterior camera puts these tiles on the
 * opposite side of every product from the design tool they sit beside.
 *
 * The practical one: handles, cam locks, thumbturns and lever furniture are all
 * mounted on the interior face, because that is where you stand to work them.
 * Shot from outside they are occluded by their own opaque stile — the slider's
 * cam lock rendered as literally nothing, and no amount of resizing or
 * recolouring it would have helped.
 *
 * The cost is that outward-opening leaves now swing away from the camera rather
 * than toward it. That is simply what an outward-opening window looks like from
 * inside, which is where the customer is standing.
 */
const CAMERA_Z_SIGN = 1;

/** Jet Black, the FINISH.swatchHex the filmed tiles wear (fourlinq-data.ts). */
const FRAME_HEX = "#1A1A1A";

/* Product fills roughly two thirds of the tile with generous white margin,
   measured off the filmed frames. Fitted against the union of the bounding box
   over the whole sweep, not the closed pose -- a bifold is far wider open than
   shut, and fitting the closed pose walks the leaves out of frame. */
const FIT_X = 0.7;
const FIT_Y = 0.78;

/**
 * Glass opacity, per system.
 *
 * The filmed tiles blow the glazing out to near-white, and 0.2 reproduces that:
 * in every one of those systems the pane is read by the sash around it, so the
 * glass itself is free to disappear.
 *
 * The louvre is the exception and needs its own value. Its blades ARE bare
 * glass with no sash, so at 0.2 they vanish into the white background and the
 * tile renders an empty frame. It is the only system here that pays a
 * visible-greyness cost to stay legible, so it is the only one that gets the
 * higher value — raising it globally would leave three tiles noticeably greyer
 * than the filmed ones they sit beside in the menu.
 */
const GLASS_OPACITY = { louvre: 0.42 };
const GLASS_OPACITY_DEFAULT = 0.2;

/* ── The harness page ──
   Kept as a string rather than a file in public/ so the bake leaves nothing
   behind in the served app. */
const harnessHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; background: #fff; }
      canvas { display: block; }
    </style>
    <script type="importmap">
      { "imports": { "three": "/three/build/three.module.js", "three/addons/": "/three/examples/jsm/" } }
    </script>
  </head>
  <body>
    <script type="module">
      import * as THREE from "three";
      import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

      const W = ${WIDTH}, H = ${HEIGHT};
      const FRAME_HEX = "${FRAME_HEX}";
      const FRAME_MATERIAL = new Set(["frame1", "frame2", "frame3"]);

      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(2);
      renderer.setClearColor(0xffffff, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.body.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      const camera = new THREE.PerspectiveCamera(20, W / H, 0.1, 200);

      /* Flat and frontal. The filmed frames have almost no modelling on the
         frame faces and no visible key-light direction, so a bright hemisphere
         does the lifting and the directional exists mainly to cast the faint
         contact shadow. */
      scene.add(new THREE.HemisphereLight(0xffffff, 0xf2f2f2, 2.6));
      const key = new THREE.DirectionalLight(0xffffff, 1.15);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.35);
      scene.add(fill);

      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShadowMaterial({ opacity: 0.12 }),
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      window.__bake = async (id, frameCount, openTime, zSign, fitX, fitY, glassOpacity) => {
        const gltf = await new GLTFLoader().loadAsync("/models/" + id + ".glb");
        const root = gltf.scene;
        scene.add(root);

        root.traverse((o) => {
          if (!o.isMesh) return;
          o.castShadow = true;
          /* Every mesh receives as well as casts, not just the ground plane.
             A closed louvre is the case that needs it: its blades are coplanar
             at t=0, so nothing separates one from the next and the resting tile
             renders as one blank pane. Letting each blade catch the shadow of
             the blade above draws the seam -- which is the same thing that makes
             a louvre legible in a real product photograph. */
          o.receiveShadow = true;
          const mat = Array.isArray(o.material) ? o.material[0] : o.material;
          if (!mat) return;
          if (FRAME_MATERIAL.has(mat.name)) {
            /* Same three materials and the same numbers the viewer's finish
               picker applies -- anything else is a second source of truth for
               what a black frame looks like. */
            mat.color = new THREE.Color(FRAME_HEX);
            mat.roughness = 0.65;
            mat.metalness = 0;
          } else if (mat.name === "glass") {
            /* Blown-out near-white, matching the filmed tiles: no environment
               map, no reflections, nothing visible behind the pane. */
            mat.color = new THREE.Color(0xeef1f3);
            mat.transparent = true;
            mat.opacity = glassOpacity;
            mat.roughness = 0.06;
            mat.metalness = 0;
            mat.envMapIntensity = 0;
          }
          mat.needsUpdate = true;
        });

        const mixer = new THREE.AnimationMixer(root);
        const clip = gltf.animations[0];
        if (!clip) throw new Error(id + " has no animation clip");
        mixer.clipAction(clip).play();

        const time = Array.from({ length: frameCount }, (_, i) =>
          (i / (frameCount - 1)) * openTime,
        );

        /* Union of the bounding box across the whole sweep, so the framing is
           chosen once and the camera never moves -- the locked-off shot the
           filmed tiles use. */
        const union = new THREE.Box3();
        for (const t of time) {
          mixer.setTime(t);
          root.updateMatrixWorld(true);
          union.union(new THREE.Box3().setFromObject(root));
        }

        const size = union.getSize(new THREE.Vector3());
        const center = union.getCenter(new THREE.Vector3());
        const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
        const distY = size.y / 2 / fitY / Math.tan(halfFov);
        const distX = size.x / 2 / fitX / camera.aspect / Math.tan(halfFov);
        const dist = Math.max(distX, distY) + size.z / 2;

        camera.position.set(center.x, center.y, center.z + zSign * dist);
        camera.lookAt(center);
        camera.updateProjectionMatrix();

        const span = Math.max(size.x, size.z) * 3;
        shadowPlane.position.set(center.x, union.min.y - 0.004, center.z);
        shadowPlane.scale.set(span, span, 1);

        key.position.set(center.x - size.x * 0.4, union.max.y + size.y, center.z + zSign * dist * 0.6);
        key.target.position.copy(center);
        key.target.updateMatrixWorld();
        const s = key.shadow.camera;
        s.left = -span / 2; s.right = span / 2; s.top = span / 2; s.bottom = -span / 2;
        s.near = 0.1; s.far = dist * 4;
        s.updateProjectionMatrix();
        fill.position.set(center.x + size.x, center.y, center.z + zSign * dist);

        const out = [];
        for (const t of time) {
          mixer.setTime(t);
          root.updateMatrixWorld(true);
          renderer.render(scene, camera);
          out.push(renderer.domElement.toDataURL("image/png").split(",")[1]);
        }
        scene.remove(root);
        return out;
      };
      window.__ready = true;
    </script>
  </body>
</html>`;

/* ── Static server ──
   three is served as its whole tree so GLTFLoader's own relative imports
   resolve; the importmap only has to name the entry points. */
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".glb": "model/gltf-binary",
};

const serve = () =>
  new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = req.url.split("?")[0];
      if (url === "/") {
        res.writeHead(200, { "content-type": "text/html" });
        return res.end(harnessHtml);
      }
      const file = url.startsWith("/three/")
        ? path.join(ROOT, "node_modules/three", url.slice("/three/".length))
        : url.startsWith("/models/")
          ? path.join(ROOT, "public/models/system", url.slice("/models/".length))
          : null;
      // Anything outside those two trees is a bug in the harness, not a request
      // to satisfy -- serving it would turn this into an open file proxy.
      if (!file || !file.startsWith(ROOT)) {
        res.writeHead(404);
        return res.end();
      }
      res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
      createReadStream(file).on("error", () => {
        res.writeHead(404);
        res.end();
      }).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });

const main = async () => {
  const only = flag("only", null);
  const target = only ? [only] : TARGET;
  const dry = has("dry");
  const outFilm = path.join(ROOT, ".qa-film");
  await mkdir(outFilm, { recursive: true });

  const { server, port } = await serve();
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader"] });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  const fail = [];
  page.on("pageerror", (e) => fail.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, { timeout: 30000 });

  for (const id of target) {
    const frame = await page.evaluate(
      ([i, n, t, z, fx, fy, go]) => window.__bake(i, n, t, z, fx, fy, go),
      [
        MODEL_FOR[id] ?? id,
        FRAME_COUNT,
        OPEN_TIME,
        CAMERA_Z_SIGN,
        FIT_X,
        FIT_Y,
        GLASS_OPACITY[id] ?? GLASS_OPACITY_DEFAULT,
      ],
    );

    const webp = await Promise.all(
      frame.map((b64) =>
        sharp(Buffer.from(b64, "base64"))
          .resize({ width: WIDTH, height: HEIGHT, fit: "inside" })
          .flatten({ background: "#ffffff" })
          .webp({ quality: 80, effort: 6 })
          .toBuffer(),
      ),
    );

    if (!dry) {
      const dir = path.join(ROOT, "public/systems/anim", id);
      await mkdir(dir, { recursive: true });
      await Promise.all(
        webp.map((buf, i) => writeFile(path.join(dir, `${String(i + 1).padStart(2, "0")}.webp`), buf)),
      );
    }

    // Six evenly spaced frames, so the middle of the sweep can be looked at --
    // the endpoints are exactly where a bad mechanism looks fine.
    const pick = [0, 5, 11, 16, 22, 27].map((i) => frame[i]);
    const tileW = 300;
    const tile = await Promise.all(
      pick.map((b64) => sharp(Buffer.from(b64, "base64")).resize({ width: tileW }).flatten({ background: "#ffffff" }).toBuffer()),
    );
    const meta = await sharp(tile[0]).metadata();
    const sheet = await sharp({
      create: { width: tileW * tile.length, height: meta.height, channels: 3, background: "#ffffff" },
    })
      .composite(tile.map((input, i) => ({ input, left: i * tileW, top: 0 })))
      .png()
      .toBuffer();
    await writeFile(path.join(outFilm, `bake-${id}.png`), sheet);

    const kb = Math.round(webp.reduce((a, b) => a + b.length, 0) / 1024);
    console.log(`  ${id.padEnd(20)} ${webp.length} frames  ${kb} kB  → .qa-film/bake-${id}.png`);
  }

  await browser.close();
  server.close();
  if (fail.length) {
    console.error("\npage errors:\n" + fail.join("\n"));
    process.exit(1);
  }
  console.log(
    dry
      ? `\ndry run — contact sheets only, nothing written to public/systems/anim/`
      : `\n${target.length} system baked. Review .qa-film/bake-*.png, then add the ids to src/data/systemAnimations.ts`,
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

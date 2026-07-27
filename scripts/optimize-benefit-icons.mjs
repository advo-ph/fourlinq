/**
 * Normalize the six "Why uPVC" isometric benefit diagrams.
 *
 * The renders arrive as ~1MB 1254x1254 PNGs, each with a different amount of
 * dead white around the drawing. Left alone, the six tiles read at six
 * different optical sizes and the page carries ~6MB of image weight.
 *
 * This trims each render to its ink, fits it inside a common 4:3 box at a
 * fixed margin so all six sit at the same weight in the grid, and writes WebP.
 *
 * Sources live outside public/ on purpose: anything under public/ is copied
 * verbatim into dist and rsynced to the VPS, so the 1MB PNGs would ship
 * alongside the 35KB WebP that actually gets requested.
 *
 * Usage: node scripts/optimize-benefit-icons.mjs
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.join(__dirname, "..", "assets-src", "benefit-icon");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "benefit-icon");

/**
 * Square, because the drawings are: once trimmed to their ink they run 0.87 to
 * 1.09 wide-over-tall. Baking them onto a 4:3 canvas padded the sides with
 * white the drawing could never use, and object-contain then fit to height —
 * so every tile rendered its drawing ~25% smaller than the box allowed, worst
 * on mobile where the tile is a full column wide.
 */
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;
/** Fraction of the canvas the drawing is allowed to occupy. The rest is margin. */
const INSET = 0.9;
/** Renders sit on a near-white studio wash, not pure white — trim needs slack. */
const TRIM_THRESHOLD = 12;

/**
 * Per-icon optical correction, applied on top of INSET. Trimming to the ink
 * makes the *bounding box* consistent, not the drawing inside it: an icon
 * whose annotation reaches far from the profile (the cycle ring, the rain)
 * gets scaled down to fit, so its window ends up smaller than its neighbours'.
 * These multipliers even out the profile, not the box. 1 = no correction.
 */
const scale = {
  "fire-retardant": 1,
  "thermal-efficiency": 1,
  "corrosion-resistant": 1,
  // The cycle ring encircles the profile, costing it ~10% against the others.
  "long-lasting-performance": 1.08,
  "weather-resistance": 1,
  "sound-insulation": 1,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const name of Object.keys(scale)) {
  const source = path.join(SOURCE_DIR, `${name}.png`);
  if (!fs.existsSync(source)) {
    console.error(`missing source: ${source}`);
    process.exitCode = 1;
    continue;
  }

  const trimmed = await sharp(source).trim({ threshold: TRIM_THRESHOLD }).toBuffer();

  // fit:"contain" pads to exactly these dimensions, so the leftover margin is
  // knowable up front and every icon lands on the same canvas to the pixel.
  const innerWidth = Math.round(CANVAS_WIDTH * INSET * scale[name]);
  const innerHeight = Math.round(CANVAS_HEIGHT * INSET * scale[name]);
  if (innerWidth > CANVAS_WIDTH || innerHeight > CANVAS_HEIGHT) {
    throw new Error(`scale[${name}]=${scale[name]} overflows the canvas — lower it or raise the canvas`);
  }

  const marginX = CANVAS_WIDTH - innerWidth;
  const marginY = CANVAS_HEIGHT - innerHeight;

  const output = path.join(OUTPUT_DIR, `${name}.webp`);
  await sharp(trimmed)
    .resize({
      width: innerWidth,
      height: innerHeight,
      fit: "contain",
      background: { r: 255, g: 255, b: 255 },
    })
    .extend({
      top: Math.floor(marginY / 2),
      bottom: Math.ceil(marginY / 2),
      left: Math.floor(marginX / 2),
      right: Math.ceil(marginX / 2),
      background: { r: 255, g: 255, b: 255 },
    })
    .webp({ quality: 90, effort: 6 })
    .toFile(output);

  const before = fs.statSync(source).size;
  const after = fs.statSync(output).size;
  console.log(
    `${name.padEnd(28)} ${(before / 1024).toFixed(0).padStart(5)}KB -> ${(after / 1024).toFixed(0).padStart(4)}KB webp`,
  );
}

// Generate favicon SVG from the exact Playfair Display "Q" glyph
import https from "https";
import fs from "fs";
import opentype from "opentype.js";

const FONT_URL =
  "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vUDQ.ttf";

const outDir = "public";

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve, reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
  });
}

async function main() {
  console.log("Downloading Playfair Display…");
  const buf = await download(FONT_URL);
  const font = opentype.parse(buf.buffer);

  // Render "Q" at size that fits a 64x64 viewBox
  const glyph = font.charToGlyph("Q");
  const fontSize = 56;
  const path = glyph.getPath(8, 52, fontSize);
  const svgPath = path.toSVG();

  // Get bounding box to center it
  const bb = path.getBoundingBox();
  const w = bb.x2 - bb.x1;
  const h = bb.y2 - bb.y1;
  const pad = 2;
  const vx = Math.floor(bb.x1 - pad);
  const vy = Math.floor(bb.y1 - pad);
  const vw = Math.ceil(w + pad * 2);
  const vh = Math.ceil(h + pad * 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" fill="#DC2626">
${svgPath}
</svg>`;

  fs.writeFileSync(`${outDir}/favicon.svg`, svg);
  console.log(`Wrote favicon.svg (viewBox: ${vx} ${vy} ${vw} ${vh})`);
}

main().catch(console.error);

// Cross-match FB 2048px downloads against flagged AI-enhanced site images
// (and PDF original crops as triangulation anchors) via 256-bit dHash.
// Usage: node match-fb-originals.mjs <fbDir> <outJson>
import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const FB_DIR = process.argv[2] || '/tmp/fb-originals';
const OUT = process.argv[3] || '/tmp/fourlinq-audit/fb-match.json';
const SITE = '/Users/princewagan/fourlinq/public/images/projects-fb';
const CANDS = JSON.parse(
  await readFile('/tmp/fourlinq-audit/all-flagged.json', 'utf8')
);
const PDF_DIRS = [
  '/Users/princewagan/Downloads/fourlinq-extract/task1',
  '/Users/princewagan/Downloads/fourlinq-extract/task2',
];

const HASH_W = 17;
const HASH_H = 16;
async function dhash(file) {
  const { data } = await sharp(file)
    .grayscale()
    .resize(HASH_W, HASH_H, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bits = [];
  for (let y = 0; y < HASH_H; y++)
    for (let x = 0; x < HASH_W - 1; x++)
      bits.push(data[y * HASH_W + x] < data[y * HASH_W + x + 1] ? 1 : 0);
  return bits;
}
const hamming = (a, b) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);
const isImg = (f) => /\.(jpe?g|png|webp)$/i.test(f);

async function pool(dir, files) {
  const out = [];
  for (const f of files) {
    try {
      out.push({ f, h: await dhash(path.join(dir, f)) });
    } catch (e) {
      console.error('skip', f, e.message);
    }
  }
  return out;
}

const fbFiles = (await readdir(FB_DIR)).filter(isImg);
const fb = await pool(FB_DIR, fbFiles);
const cands = await pool(SITE, CANDS);
const pdf = [];
for (const d of PDF_DIRS) {
  const fs = (await readdir(d)).filter((f) => isImg(f) && f.includes('_M_'));
  const pool0 = await pool(d, fs);
  for (const p of pool0) pdf.push({ ...p, f: path.join(path.basename(d), p.f) });
}

const top = (h, list, n = 3) =>
  list
    .map((o) => ({ f: o.f, d: hamming(h, o.h) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n);

const result = { candidates: {}, pdfToFb: {}, pdfToCand: {} };
for (const c of cands) result.candidates[c.f] = { fbTop: top(c.h, fb), pdfTop: top(c.h, pdf) };
for (const p of pdf) result.pdfToFb[p.f] = top(p.h, fb);
await writeFile(OUT, JSON.stringify(result, null, 1));
console.log('fb photos:', fb.length, '| candidates:', cands.length, '| pdf M-crops:', pdf.length);
console.log('WROTE', OUT);

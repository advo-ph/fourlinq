// Match regenerated images (opaque filenames) to flagged originals via dHash.
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const FLAGGED_DIR = '/Users/princewagan/Downloads/fourlinq-flagged-project-images';
const NEWGEN_DIR = '/Users/princewagan/Downloads/new gen';

const HASH_W = 17; // 16x16 dhash = 256 bits
const HASH_H = 16;

async function dhash(file) {
  const { data } = await sharp(file)
    .grayscale()
    .resize(HASH_W, HASH_H, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bits = [];
  for (let y = 0; y < HASH_H; y++) {
    for (let x = 0; x < HASH_W - 1; x++) {
      bits.push(data[y * HASH_W + x] < data[y * HASH_W + x + 1] ? 1 : 0);
    }
  }
  return bits;
}

const hamming = (a, b) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);

const isImg = (f) => /\.(jpe?g|png|webp)$/i.test(f);

const flaggedFiles = (await readdir(FLAGGED_DIR)).filter(isImg);
const newFiles = (await readdir(NEWGEN_DIR)).filter(isImg);

const flagged = await Promise.all(
  flaggedFiles.map(async (f) => ({ f, h: await dhash(path.join(FLAGGED_DIR, f)) }))
);
const fresh = await Promise.all(
  newFiles.map(async (f) => ({ f, h: await dhash(path.join(NEWGEN_DIR, f)) }))
);

for (const n of fresh) {
  const scored = flagged
    .map((o) => ({ f: o.f, d: hamming(n.h, o.h) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
  console.log(
    `${n.f}  ->  ${scored.map((s) => `${s.f} (${s.d})`).join('  |  ')}`
  );
}

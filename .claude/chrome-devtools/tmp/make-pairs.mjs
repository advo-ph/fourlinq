// Side-by-side composites for visual verification of uncertain matches.
import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const FLAGGED = '/Users/princewagan/Downloads/fourlinq-flagged-project-images';
const NEWGEN = '/Users/princewagan/Downloads/new gen';
const OUT = '/Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/pairs';
await mkdir(OUT, { recursive: true });

const pairs = [
  ['811954a8-9941-44f3-a844-972c19cb836c.jpeg', 'fourlinq-turnover-3-2.jpg', 'p01'],
  ['logoremover_1784841816593.png', 'fourlinq-turnover-3-2.jpg', 'p02'],
  ['IMG_2099.png', 'binan-residence-2.jpg', 'p03'],
  ['IMG_2124.png', 'gjR_DEfu.jpg', 'p04'],
  ['IMG_2130 (1).png', 'mw3WVp7m.jpg', 'p05'],
  ['logoremover_1784840244916.png', 'cebu-t-residence-cebu-city.jpg', 'p06'],
  ['logoremover_1784840357778.png', 'bataan-s-residence.jpg', 'p07'],
  ['logoremover_1784841642686.png', 'fourlinq-turnover-3-3.jpg', 'p08'],
  ['logoremover_1784841742131.png', 'binan-residence.jpg', 'p09'],
  ['logoremover_1784841780019.png', 'cabanatuan-t-residence-2.jpg', 'p10'],
];

const H = 320;
for (const [newer, orig, tag] of pairs) {
  const a = await sharp(path.join(NEWGEN, newer)).resize({ height: H }).toBuffer();
  const b = await sharp(path.join(FLAGGED, orig)).resize({ height: H }).toBuffer();
  const am = await sharp(a).metadata();
  const bm = await sharp(b).metadata();
  await sharp({
    create: {
      width: am.width + bm.width + 12,
      height: H,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .composite([
      { input: a, left: 0, top: 0 },
      { input: b, left: am.width + 12, top: 0 },
    ])
    .jpeg({ quality: 80 })
    .toFile(path.join(OUT, `${tag}.jpg`));
  console.log(`${tag}: NEW ${newer}  vs  ORIG ${orig}`);
}

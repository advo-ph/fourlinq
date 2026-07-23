// Replace flagged originals in public/images/projects-fb/ with regenerated versions.
import sharp from 'sharp';
import path from 'node:path';
import { stat } from 'node:fs/promises';

const NEWGEN = '/Users/princewagan/Downloads/new gen';
const TARGET = '/Users/princewagan/fourlinq/public/images/projects-fb';

const MAP = [
  ['IMG_2099.png', 'binan-residence-2.jpg'],
  ['IMG_2130 (1).png', '-pFxhSkE.jpg'],
  ['logoremover_1784840244916.png', 'cebu-t-residence-cebu-city.jpg'],
  ['logoremover_1784840297509.png', 'ZoZWYiwi.jpg'],
  ['logoremover_1784840329079.png', 'Bf8HH614.jpg'],
  ['logoremover_1784840357778.png', 'S2T-OFy4.jpg'],
  ['logoremover_1784840389494.png', 'portfolio-residence-13.jpg'],
  ['logoremover_1784840553124.png', 'UdQMQaA-.jpg'],
  ['logoremover_1784840640513.png', 'fourlinq-turnover-3.jpg'],
  ['logoremover_1784840662581.png', 'sarangani-s-residence.jpg'],
  ['logoremover_1784840723879.png', 'cabanatuan-t-residence-3.jpg'],
  ['logoremover_1784840769690.png', 'cabanatuan-t-residence-4.jpg'],
  ['logoremover_1784840801863.png', 'BOyTwrQH.jpg'],
  ['logoremover_1784841642686.png', 'fourlinq-turnover-3-3.jpg'],
  ['logoremover_1784841682296.png', 'sarangani-s-residence-2.jpg'],
  ['logoremover_1784841742131.png', 'binan-residence.jpg'],
  ['logoremover_1784841780019.png', 'cabanatuan-t-residence-2.jpg'],
  ['logoremover_1784841816593.png', 'fourlinq-turnover-3-2.jpg'],
];

for (const [src, dst] of MAP) {
  const target = path.join(TARGET, dst);
  await stat(target); // throws if the original is missing — safety check
  const before = (await stat(target)).size;
  const oldMeta = await sharp(target).metadata();
  await sharp(path.join(NEWGEN, src))
    .rotate() // respect EXIF orientation if present
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(target);
  const after = (await stat(target)).size;
  const newMeta = await sharp(target).metadata();
  console.log(
    `${dst}: ${oldMeta.width}x${oldMeta.height} ${(before / 1024).toFixed(0)}KB -> ${newMeta.width}x${newMeta.height} ${(after / 1024).toFixed(0)}KB  (from ${src})`
  );
}
console.log('\nReplaced:', MAP.length);

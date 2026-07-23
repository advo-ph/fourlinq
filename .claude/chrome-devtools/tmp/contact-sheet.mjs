// Labeled contact sheet of unmatched flagged originals.
import sharp from 'sharp';
import path from 'node:path';

const FLAGGED = '/Users/princewagan/Downloads/fourlinq-flagged-project-images';
const OUT = '/Users/princewagan/fourlinq/.claude/chrome-devtools/tmp/pairs';

const files = [
  '-pFxhSkE.jpg', 'K6n763QM.jpg', 'P7DLic-T.jpg', 'P8m34kD5.jpg',
  'S2T-OFy4.jpg', 'bataan-s-residence.jpg', 'cebu-as-residence-consolacion-2.jpg',
  'cebu-d-residence-mandaue-2.jpg', 'cebu-d-residence-mandaue.jpg',
  'cebu-ds-residence-talisay.jpg', 'cebu-es-residence-maria-luisa-2.jpg',
  'cebu-es-residence-maria-luisa-3.jpg', 'cebu-m-residence-2-2.jpg',
  'cebu-m-residence-2-3.jpg', 'cebu-m-residence-molave.jpg',
  'cebu-n-residence-pardo-b-2.jpg', 'cebu-n-residence-pardo-b.jpg',
  'cebu-p-residence-kishanta-2.jpg', 'cebu-r-residences-2.jpg',
  'cebu-r-residences.jpg', 'cebu-residence-vista-grande-talisay.jpg',
  'cebu-s-residence-maria-luisa-2.jpg', 'cebu-sch-residence-monterrazas-2.jpg',
  'cebu-ta-residence-monterrazas-2.jpg', 'cebu-ta-residence-monterrazas-3.jpg',
  'fourlinq-turnover-2.jpg', 'fourlinq-turnover-3-4.jpg', 'gjR_DEfu.jpg',
  'mw3WVp7m.jpg', 'pndqSKzg.jpg', 'portfolio-residence-02.jpg',
  'portfolio-residence-07.jpg', 'vhoJDNZw.jpg',
];

const CW = 280, CH = 200, COLS = 5;
const rows = Math.ceil(files.length / COLS);
const comps = [];
for (let i = 0; i < files.length; i++) {
  const col = i % COLS, row = Math.floor(i / COLS);
  const img = await sharp(path.join(FLAGGED, files[i]))
    .resize(CW, CH - 24, { fit: 'cover' })
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${CW}" height="24"><rect width="${CW}" height="24" fill="black"/><text x="4" y="17" font-family="Helvetica" font-size="13" fill="yellow">#${i + 1} ${files[i].replace('.jpg', '')}</text></svg>`
  );
  comps.push({ input: img, left: col * CW, top: row * CH });
  comps.push({ input: label, left: col * CW, top: row * CH + (CH - 24) });
}
await sharp({
  create: { width: COLS * CW, height: rows * CH, channels: 3, background: '#333' },
})
  .composite(comps)
  .jpeg({ quality: 78 })
  .toFile(path.join(OUT, 'sheet-unmatched.jpg'));
console.log('rows:', rows, 'files:', files.length);

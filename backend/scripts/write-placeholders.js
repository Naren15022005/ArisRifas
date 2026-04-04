const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  '1775097967002-4fzefx.jpg',
  '1775075181402-nutfgs.jpg',
  '1774908600807-gtuxuy.jpg',
];

// 1x1 transparent PNG base64
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const buf = Buffer.from(pngBase64, 'base64');

for (const name of files) {
  const outPath = path.join(outDir, name);
  try {
    fs.writeFileSync(outPath, buf);
    console.log('Wrote', outPath);
  } catch (err) {
    console.error('Failed to write', outPath, err && err.stack ? err.stack : err);
  }
}
console.log('Done');

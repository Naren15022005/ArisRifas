const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  '1775097967002-4fzefx.jpg',
  '1775075181402-nutfgs.jpg',
  '1774908600807-gtuxuy.jpg',
];

const placeholderUrl = (w = 800, h = 600, text = 'Imagen+no+disponible') => `https://via.placeholder.com/${w}x${h}.jpg?text=${encodeURIComponent(text)}`;

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => { });
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
}

(async () => {
  for (const name of files) {
    const outPath = path.join(outDir, name);
    try {
      await download(placeholderUrl(), outPath);
      console.log('Downloaded', name);
    } catch (err) {
      console.error('Failed to download', name, err.message);
    }
  }
  console.log('Done');
})();

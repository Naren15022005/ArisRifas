const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const outDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  '1775097967002-4fzefx.jpg',
  '1775075181402-nutfgs.jpg',
  '1774908600807-gtuxuy.jpg',
];

async function makePlaceholder(name) {
  const width = 800;
  const height = 600;
  const bgColor = 0x111111FF; // dark
  const text = 'Imagen no disponible';
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const image = new Jimp(width, height, bgColor);
  const textWidth = Jimp.measureText(font, text);
  const textHeight = Jimp.measureTextHeight(font, text, width);
  image.print(
    font,
    (width - textWidth) / 2,
    (height - textHeight) / 2,
    {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    textWidth,
    textHeight
  );
  const outPath = path.join(outDir, name);
  await image.quality(80).writeAsync(outPath);
  console.log('Written', outPath);
}

(async () => {
  for (const f of files) {
    try {
      await makePlaceholder(f);
    } catch (err) {
      console.error('Failed to write', f, err);
    }
  }
  console.log('Done');
})();

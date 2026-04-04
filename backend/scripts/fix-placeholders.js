#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const rows = [
  { old: '1775097967002-4fzefx.jpg', next: '1775097967002-4fzefx.svg' },
  { old: '1775075181402-nutfgs.jpg', next: '1775075181402-nutfgs.svg' },
  { old: '1774908600807-gtuxuy.jpg', next: '1774908600807-gtuxuy.svg' },
];

function makeSvg(text, w = 800, h = 600, bg = '#111111', fg = '#ffffff') {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  <rect width="100%" height="100%" fill="${bg}" />\n  <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="${fg}" dominant-baseline="middle" text-anchor="middle">${escapeXml(text)}</text>\n</svg>`;
}

function escapeXml(s){
  return String(s).replace(/[&<>\"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
  });
}

(async () => {
  try {
    for (const r of rows) {
      const out = path.join(uploadsDir, r.next);
      const svg = makeSvg('Imagen no disponible');
      fs.writeFileSync(out, svg, 'utf8');
      console.log('Wrote', out);
    }

    // Update DB rows that reference the .jpg names to the .svg names
    for (const r of rows) {
      const res = await prisma.$executeRawUnsafe(`UPDATE raffle SET imageUrl = '${r.next}' WHERE imageUrl = '/uploads/${r.old}' OR imageUrl = '${r.old}'`);
      console.log(`DB update attempted for ${r.old} -> ${r.next}, result: ${res}`);
    }

    console.log('Done. Restart backend if needed.');
  } catch (err) {
    console.error('Error:', err && err.stack ? err.stack : err);
  } finally {
    await prisma.$disconnect();
  }
})();

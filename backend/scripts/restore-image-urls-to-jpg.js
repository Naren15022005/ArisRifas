const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const updates = [
      { cur: '/uploads/1775097967002-4fzefx.svg', next: '/uploads/1775097967002-4fzefx.jpg' },
      { cur: '/uploads/1775075181402-nutfgs.svg', next: '/uploads/1775075181402-nutfgs.jpg' },
      { cur: '/uploads/1774908600807-gtuxuy.svg', next: '/uploads/1774908600807-gtuxuy.jpg' },
    ];
    for (const u of updates) {
      const sql = `UPDATE \`Raffle\` SET imageUrl = '${u.next}' WHERE imageUrl = '${u.cur}' OR imageUrl = '${u.cur.replace('/uploads/','')}'`;
      console.log('Running:', sql);
      const res = await prisma.$executeRawUnsafe(sql);
      console.log('Result:', res);
    }
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const updates = [
      { old: '/uploads/1775097967002-4fzefx.jpg', next: '/uploads/1775097967002-4fzefx.svg' },
      { old: '/uploads/1775075181402-nutfgs.jpg', next: '/uploads/1775075181402-nutfgs.svg' },
      { old: '/uploads/1774908600807-gtuxuy.jpg', next: '/uploads/1774908600807-gtuxuy.svg' },
    ];

    for (const u of updates) {
      const sql = `UPDATE \`Raffle\` SET imageUrl = '${u.next}' WHERE imageUrl = '${u.old}' OR imageUrl = '${u.old.replace('/uploads/','')}'`;
      console.log('Running:', sql);
      const res = await prisma.$executeRawUnsafe(sql);
      console.log('Result:', res);
    }

    console.log('Done updating imageUrl fields.');
  } catch (err) {
    console.error('Error updating image urls:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Using DATABASE_URL from .env (masked):', !!process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
    const res = await prisma.$queryRawUnsafe("SHOW TABLES;");
    console.log('Tables:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error listing tables:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();

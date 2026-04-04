const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const email = process.argv[2] || 'andresserpa2002';

(async () => {
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true, password: true, createdAt: true } });
    console.log('User:');
    console.log(JSON.stringify(user, null, 2));
  } catch (err) {
    console.error('Error dumping user:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();

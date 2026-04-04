const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node set-user-password.js <email> <newPassword>');
  process.exit(2);
}

(async () => {
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await prisma.user.update({ where: { email }, data: { password: hashed } });
    console.log(`Updated password for ${user.email} (id=${user.id})`);
  } catch (err) {
    console.error('Error setting password:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();

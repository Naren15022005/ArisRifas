const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({ where: { password: { startsWith: "'" } }, select: { id: true, email: true, password: true } });
    if (!users.length) {
      console.log('No users with quoted passwords found.');
      return;
    }
    for (const u of users) {
      const oldPw = u.password;
      let newPw = oldPw;
      if (typeof newPw === 'string' && newPw.startsWith("'") && newPw.endsWith("'")) {
        newPw = newPw.slice(1, -1);
      }
      if (newPw !== oldPw) {
        await prisma.user.update({ where: { id: u.id }, data: { password: newPw } });
        console.log(`Fixed user ${u.email} (id=${u.id})`);
      } else {
        console.log(`User ${u.email} (id=${u.id}) had leading quote but not trailing; skipped.`);
      }
    }
  } catch (err) {
    console.error('Error fixing passwords:', err && err.stack ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();

#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  const email = process.argv[2] || 'admin@local';
  const password = process.argv[3] || 'Admin12345!';

  if (!email || !password) {
    console.error('Usage: node scripts/reset-admin.js <email> <password>');
    process.exit(2);
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { email, password: hashed } });
      console.log(`Updated existing ADMIN (id=${existing.id}) with email=${email}`);
    } else {
      const user = await prisma.user.create({ data: { email, name: 'Admin', password: hashed, role: 'ADMIN' } });
      console.log(`Created ADMIN user id=${user.id} email=${user.email}`);
    }
    console.log('Admin credential set. Use these to login via /admin/login');
  } catch (err) {
    console.error('Failed to set admin:', err && err.stack ? err.stack : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

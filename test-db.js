const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'dev.db');
console.log('DB path:', dbPath);

try {
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma = new PrismaClient({ adapter });
  prisma.sanPham.findMany()
    .then(r => { console.log('SUCCESS - SanPham rows:', r.length); return prisma.$disconnect(); })
    .catch(e => { console.error('Query error:', e.message); process.exit(1); });
} catch(e) {
  console.error('Init error:', e.message);
  process.exit(1);
}

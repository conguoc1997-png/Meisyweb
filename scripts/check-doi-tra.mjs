import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const total = await p.doiTra.count();
const byMonth = await p.doiTra.groupBy({
  by: ['createdAt'],
  _count: true,
});
const all = await p.doiTra.findMany({ orderBy: { createdAt: 'asc' }, select: { createdAt: true, tenKhach: true } });
console.log('Total records:', total);
console.log('All records by date:');
all.forEach(r => console.log(r.createdAt.toISOString().slice(0,10), r.tenKhach));
await p.$disconnect();

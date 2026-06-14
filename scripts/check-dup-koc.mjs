import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const kocs = await p.kOC.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, ten: true, createdAt: true } });
const seen = new Map();
const dups = [];
for (const k of kocs) {
  const key = k.ten.toLowerCase().trim();
  if (seen.has(key)) dups.push({ ten: k.ten, id: k.id });
  else seen.set(key, k.id);
}
console.log(`Tổng KOC: ${kocs.length}`);
console.log(`KOC trùng cần xóa: ${dups.length}`);
dups.forEach(d => console.log(' -', d.ten));
await p.$disconnect();

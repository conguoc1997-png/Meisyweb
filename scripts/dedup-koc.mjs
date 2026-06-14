import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envContent = readFileSync(resolve('C:/Users/PC/fashion-manager/.env.local'), 'utf8');
const devUrl = envContent.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
const p = new PrismaClient({ datasources: { db: { url: devUrl } } });

const kocs = await p.kOC.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, ten: true, createdAt: true } });
console.log(`Tổng KOC: ${kocs.length}`);

const seen = new Map();
const toDelete = [];

for (const k of kocs) {
  const key = k.ten.toLowerCase().trim();
  if (seen.has(key)) {
    toDelete.push(k.id);
    console.log(`  Trùng: "${k.ten}"`);
  } else {
    seen.set(key, k.id);
  }
}

if (toDelete.length === 0) {
  console.log('Không có KOC trùng.');
} else {
  await p.kOC.deleteMany({ where: { id: { in: toDelete } } });
  console.log(`\n✅ Đã xóa ${toDelete.length} KOC trùng`);
  console.log(`✅ Còn lại: ${kocs.length - toDelete.length} KOC`);
}

await p.$disconnect();

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
const env = readFileSync(resolve('C:/Users/PC/fashion-manager/.env.local'), 'utf8');
const url = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
const p = new PrismaClient({ datasources: { db: { url } } });

try { const r = await p.sanPham.count(); console.log('SanPham (dev):', r); } catch(e) { console.log('SanPham ERROR:', e.message.slice(0,80)); }
try { const r = await p.nhapXuatKho.count(); console.log('NhapXuatKho (dev):', r); } catch(e) { console.log('NhapXuatKho ERROR:', e.message.slice(0,80)); }

await p.$disconnect();

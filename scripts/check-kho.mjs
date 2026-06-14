import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// Xem phiếu nhập còn lại
const phieus = await p.phieuNhapKho.findMany({ include: { chiTiet: true } });
console.log('=== PhieuNhapKho ===');
phieus.forEach(p2 => console.log(p2.soPhieu, p2.ngay.toISOString().slice(0,10), p2.tongTien, 'chiTiet:', p2.chiTiet.length));

// Xem vatTu còn lại
const vts = await p.vatTu.findMany({ select: { ma: true, ten: true, createdAt: true } });
console.log('\n=== VatTu ===');
vts.forEach(v => console.log(v.ma, v.ten, v.createdAt.toISOString().slice(0,10)));

await p.$disconnect();

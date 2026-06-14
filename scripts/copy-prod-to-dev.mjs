import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

// Đọc PROD URL từ .env
const envContent = readFileSync('.env', 'utf8');
const prodUrl = envContent.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];

// DEV URL
const devUrl = 'postgresql://postgres.cuqxkrlelggfeufxhhsk:Meisy%40dev2026@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

const prod = new PrismaClient({ datasources: { db: { url: prodUrl } } });
const dev  = new PrismaClient({ datasources: { db: { url: devUrl  } } });

console.log('🔄 Copy data Production → Dev...\n');

async function copy(label, getData, delDev, saveDev) {
  const rows = await getData();
  if (!rows.length) { console.log(`  ${label}: 0 (bỏ qua)`); return 0; }
  await delDev();
  await saveDev(rows);
  console.log(`  ✅ ${label}: ${rows.length} records`);
  return rows.length;
}

await copy('VatTu',       () => prod.vatTu.findMany(),       () => dev.vatTu.deleteMany(),       r => dev.vatTu.createMany({ data: r, skipDuplicates: true }));
await copy('NhaCungCap',  () => prod.nhaCungCap.findMany(),  () => dev.nhaCungCap.deleteMany(),  r => dev.nhaCungCap.createMany({ data: r, skipDuplicates: true }));
await copy('QuyDoiDonVi', () => prod.quyDoiDonVi.findMany(), () => dev.quyDoiDonVi.deleteMany(), r => dev.quyDoiDonVi.createMany({ data: r, skipDuplicates: true }));
await copy('NhanVien',    () => prod.nhanVien.findMany(),    () => dev.nhanVien.deleteMany(),    r => dev.nhanVien.createMany({ data: r, skipDuplicates: true }));
await copy('ChamCong',    () => prod.chamCong.findMany(),    () => dev.chamCong.deleteMany(),    r => dev.chamCong.createMany({ data: r, skipDuplicates: true }));
await copy('DoiTra',      () => prod.doiTra.findMany(),      () => dev.doiTra.deleteMany(),      r => dev.doiTra.createMany({ data: r, skipDuplicates: true }));
await copy('Feedback',    () => prod.feedback.findMany(),    () => dev.feedback.deleteMany(),    r => dev.feedback.createMany({ data: r, skipDuplicates: true }));
await copy('BuTien',      () => prod.buTien.findMany(),      () => dev.buTien.deleteMany(),      r => dev.buTien.createMany({ data: r, skipDuplicates: true }));
await copy('UngTien',     () => prod.ungTien.findMany(),     () => dev.ungTien.deleteMany(),     r => dev.ungTien.createMany({ data: r, skipDuplicates: true }));
await copy('LoCat',       () => prod.loCat.findMany(),       () => dev.loCat.deleteMany(),       r => dev.loCat.createMany({ data: r, skipDuplicates: true }));
await copy('VaiTon',      () => prod.vaiTon.findMany(),      () => dev.vaiTon.deleteMany(),      r => dev.vaiTon.createMany({ data: r, skipDuplicates: true }));
await copy('KOC',         () => prod.kOC.findMany(),         () => dev.kOC.deleteMany(),         r => dev.kOC.createMany({ data: r, skipDuplicates: true }));
await copy('KOCBooking',  () => prod.kOCBooking.findMany(),  () => dev.kOCBooking.deleteMany(),  r => dev.kOCBooking.createMany({ data: r, skipDuplicates: true }));
await copy('CongNo',      () => prod.congNo.findMany(),      () => dev.congNo.deleteMany(),      r => dev.congNo.createMany({ data: r, skipDuplicates: true }));
await copy('DonHoanTra',  () => prod.donHoanTra.findMany(),  () => dev.donHoanTra.deleteMany(),  r => dev.donHoanTra.createMany({ data: r, skipDuplicates: true }));

// PhieuNhapKho (nested)
const phieus = await prod.phieuNhapKho.findMany({ include: { chiTiet: true } });
await dev.chiTietNhapKho.deleteMany();
await dev.phieuNhapKho.deleteMany();
for (const { chiTiet, ...phieu } of phieus) {
  await dev.phieuNhapKho.create({
    data: { ...phieu, chiTiet: { create: chiTiet.map(({ phieuId, ...ct }) => ct) } }
  });
}
console.log(`  ✅ PhieuNhapKho: ${phieus.length} records`);

console.log('\n🎉 Xong! DB Dev đã có đầy đủ data từ Production.');
await prod.$disconnect();
await dev.$disconnect();

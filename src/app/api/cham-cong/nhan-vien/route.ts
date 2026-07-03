export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Auto-migrate: chạy 1 lần per cold-start
let migrated = false;
async function autoMigrate() {
  if (migrated) return;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "soChNhatHopDong" INTEGER NOT NULL DEFAULT 0`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "caLamViecId" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "luongGio" DOUBLE PRECISION`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "tongGio" DOUBLE PRECISION`
    );
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CaLamViec" (
        "id"        TEXT NOT NULL,
        "ten"       TEXT NOT NULL,
        "gioVao"    TEXT NOT NULL DEFAULT '07:30',
        "gioRa"     TEXT NOT NULL DEFAULT '17:30',
        "nghiTrua"  INTEGER NOT NULL DEFAULT 90,
        "ghiChu"    TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id")
      )
    `);
  } catch { /* ignore — column already exists */ }
  migrated = true;
}

// GET /api/cham-cong/nhan-vien?h=1 → include luongCBHistory (cho bảng lương)
// GET /api/cham-cong/nhan-vien     → không include history (cho chấm công, nhanh hơn)
export async function GET(req: NextRequest) {
  await autoMigrate();
  const withHistory = new URL(req.url).searchParams.get("h") === "1";

  const list = await prisma.nhanVien.findMany({
    orderBy: { ten: "asc" },
    ...(withHistory ? { include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } } } : {}),
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { maNV, ten, chucVu, phongBan, luongCB, loaiLuong } = data;
  if (!maNV || !ten) return NextResponse.json({ error: "Thiếu mã NV hoặc tên" }, { status: 400 });

  const existing = await prisma.nhanVien.findUnique({ where: { maNV } });
  if (existing) return NextResponse.json({ error: "Mã NV đã tồn tại" }, { status: 400 });

  const { ngaySinh, thangApDung, soChNhatHopDong } = data;
  const nv = await prisma.nhanVien.create({
    data: {
      maNV, ten,
      chucVu:          chucVu          || null,
      phongBan:        phongBan        || null,
      loaiLuong:       loaiLuong       || "co_ban",
      luongCB:         luongCB         ? Number(luongCB) : null,
      soChNhatHopDong: soChNhatHopDong !== undefined ? Number(soChNhatHopDong) : 0,
      ngaySinh:        ngaySinh        ? new Date(ngaySinh) : null,
    },
  });

  if (luongCB && thangApDung) {
    await prisma.luongCBHistory.create({
      data: { nhanVienId: nv.id, thangApDung, luongCB: Number(luongCB) || 0 },
    });
  }

  return NextResponse.json(nv);
}

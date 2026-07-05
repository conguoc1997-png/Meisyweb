export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Auto-migrate: tách riêng từng câu SQL để 1 câu lỗi không ảnh hưởng câu khác
let migrated = false;
async function run(sql: string) {
  try { await prisma.$executeRawUnsafe(sql); } catch { /* ignore */ }
}
async function autoMigrate() {
  if (migrated) return;
  await run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "soChNhatHopDong" INTEGER NOT NULL DEFAULT 0`);
  await run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "caLamViecId" TEXT`);
  await run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "luongGio" DOUBLE PRECISION`);
  await run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`);
  await run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`);
  await run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "tongGio" DOUBLE PRECISION`);
  await run(`
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
  migrated = true;
}

// GET /api/cham-cong/nhan-vien?h=1 → include luongCBHistory (cho bảng lương)
// GET /api/cham-cong/nhan-vien     → không include history (cho chấm công, nhanh hơn)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const maNV = url.searchParams.get("maNV");

    // Fast-path: tìm 1 NV theo mã (không cần autoMigrate)
    if (maNV) {
      const nv = await prisma.nhanVien.findUnique({
        where: { maNV: maNV.toUpperCase().trim() },
        select: { id: true, ten: true, maNV: true, phongBan: true, loaiLuong: true, active: true },
      });
      if (!nv || !nv.active) return NextResponse.json(null);
      return NextResponse.json(nv);
    }

    await autoMigrate();
    const withHistory = url.searchParams.get("h") === "1";
    const list = await prisma.nhanVien.findMany({
      where: { active: true },
      orderBy: { ten: "asc" },
      ...(withHistory ? { include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } } } : {}),
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/cham-cong/nhan-vien error:", e);
    return NextResponse.json({ error: String(e), list: [] }, { status: 500 });
  }
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

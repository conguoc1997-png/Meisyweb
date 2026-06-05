import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cham-cong?thang=2026-06
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const thang = searchParams.get("thang"); // YYYY-MM

  const nhanViens = await prisma.nhanVien.findMany({
    where: { active: true },
    orderBy: { ten: "asc" },
  });

  let chamCongs: object[] = [];
  if (thang) {
    const [y, m] = thang.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 1);
    chamCongs = await prisma.chamCong.findMany({
      where: { ngay: { gte: start, lt: end } },
    });
  }

  return NextResponse.json({ nhanViens, chamCongs });
}

// POST /api/cham-cong — upsert 1 ô
export async function POST(req: NextRequest) {
  const { nhanVienId, ngay, trangThai, ghiChu } = await req.json();
  if (!nhanVienId || !ngay) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const date = new Date(ngay);
  date.setUTCHours(0, 0, 0, 0);

  if (!trangThai) {
    // Xoá record (ô trống)
    await prisma.chamCong.deleteMany({ where: { nhanVienId, ngay: date } });
    return NextResponse.json({ ok: true });
  }

  const record = await prisma.chamCong.upsert({
    where: { nhanVienId_ngay: { nhanVienId, ngay: date } },
    update: { trangThai, ghiChu: ghiChu ?? null },
    create: { nhanVienId, ngay: date, trangThai, ghiChu: ghiChu ?? null },
  });
  return NextResponse.json(record);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cham-cong?thang=2026-06
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get("thang"); // YYYY-MM

    const nhanViens = await prisma.nhanVien.findMany({
      where: { active: true },
      orderBy: { ten: "asc" },
      include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } },
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
  } catch (e) {
    console.error("GET /api/cham-cong error:", e);
    return NextResponse.json({ error: String(e), nhanViens: [], chamCongs: [] }, { status: 500 });
  }
}

// POST /api/cham-cong — upsert 1 ô (trangThai hoặc tangCa)
export async function POST(req: NextRequest) {
  const { nhanVienId, ngay, trangThai, tangCa, ghiChu } = await req.json();
  if (!nhanVienId || !ngay) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const date = new Date(ngay);
  date.setUTCHours(0, 0, 0, 0);

  // Nếu xoá trangThai VÀ tangCa null → xoá record hoàn toàn
  if (!trangThai && (tangCa === null || tangCa === undefined)) {
    // Chỉ xoá nếu không còn tangCa
    const existing = await prisma.chamCong.findUnique({ where: { nhanVienId_ngay: { nhanVienId, ngay: date } } });
    if (!existing || (!existing.tangCa && existing.tangCa !== 0)) {
      await prisma.chamCong.deleteMany({ where: { nhanVienId, ngay: date } });
      return NextResponse.json({ ok: true });
    }
    // Còn tangCa → chỉ xoá trangThai
    const record = await prisma.chamCong.update({
      where: { nhanVienId_ngay: { nhanVienId, ngay: date } },
      data: { trangThai: "" },
    });
    return NextResponse.json(record);
  }

  const updateData: Record<string, unknown> = { ghiChu: ghiChu ?? null };
  if (trangThai !== undefined) updateData.trangThai = trangThai || "";
  if (tangCa !== undefined) updateData.tangCa = tangCa !== null ? Number(tangCa) : null;

  const record = await prisma.chamCong.upsert({
    where: { nhanVienId_ngay: { nhanVienId, ngay: date } },
    update: updateData,
    create: {
      nhanVienId, ngay: date,
      trangThai: trangThai || "",
      tangCa: tangCa !== null && tangCa !== undefined ? Number(tangCa) : null,
      ghiChu: ghiChu ?? null,
    },
  });
  return NextResponse.json(record);
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cham-cong?thang=2026-06 — chỉ trả ChamCong (NV fetch riêng)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get("thang");

    let chamCongs: object[] = [];
    if (thang) {
      const [y, m] = thang.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end   = new Date(y, m, 1);
      chamCongs = await prisma.chamCong.findMany({
        where: { ngay: { gte: start, lt: end } },
      });
    }

    return NextResponse.json({ chamCongs });
  } catch (e) {
    console.error("GET /api/cham-cong error:", e);
    return NextResponse.json({ error: String(e), chamCongs: [] }, { status: 500 });
  }
}

// POST /api/cham-cong — upsert 1 ô (trangThai hoặc tangCa)
export async function POST(req: NextRequest) {
  try {
    const { nhanVienId, ngay, trangThai, tangCa, ghiChu } = await req.json();
    if (!nhanVienId || !ngay) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const date = new Date(ngay);
    date.setUTCHours(0, 0, 0, 0);

    // Xóa tăng ca: tangCa gửi null tường minh → update về null
    if (tangCa === null && trangThai === undefined) {
      const existing = await prisma.chamCong.findUnique({ where: { nhanVienId_ngay: { nhanVienId, ngay: date } } });
      if (!existing) return NextResponse.json({ ok: true });
      // Nếu record chỉ có tangCa (không có trangThai) → xóa luôn record
      if (!existing.trangThai) {
        await prisma.chamCong.deleteMany({ where: { nhanVienId, ngay: date } });
        return NextResponse.json({ ok: true });
      }
      // Còn trangThai → chỉ clear tangCa
      const record = await prisma.chamCong.update({
        where: { nhanVienId_ngay: { nhanVienId, ngay: date } },
        data: { tangCa: null },
      });
      return NextResponse.json(record);
    }

    // Xóa cả ô (trangThai null/empty, không có tangCa)
    if (!trangThai && tangCa === undefined) {
      await prisma.chamCong.deleteMany({ where: { nhanVienId, ngay: date } });
      return NextResponse.json({ ok: true });
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
  } catch (e) {
    console.error("POST /api/cham-cong error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/so-thu-chi/in?ho=meisy&thang=2026-06
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get("thang") || "";
    const ho    = searchParams.get("ho")    || "";

    const [phieus, taiKhoan] = await Promise.all([
      prisma.phieuThuChi.findMany({
        where: {
          thang,
          ho,
          trangThai: { in: ["da_duyet", "da_chi"] },
        },
        orderBy: { ngay: "asc" },
      }),
      prisma.taiKhoanQuy.findUnique({ where: { ho } }),
    ]);

    return NextResponse.json({ phieus, taiKhoan });
  } catch (e) {
    return NextResponse.json({ error: String(e), phieus: [], taiKhoan: null }, { status: 500 });
  }
}

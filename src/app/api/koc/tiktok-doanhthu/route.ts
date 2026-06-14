export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/koc/tiktok-doanhthu?thang=2026-05
export async function GET(req: NextRequest) {
  const thang = req.nextUrl.searchParams.get("thang") || undefined;

  const [spData, kocData] = await Promise.all([
    prisma.tiktokDoanhThuSP.findMany({
      where: thang ? { thang } : undefined,
      include: { sanPham: { select: { id: true, ten: true, sku: true } } },
      orderBy: { doanhThu: "desc" },
    }),
    prisma.tiktokDoanhThuKOC.findMany({
      where: thang ? { thang } : undefined,
      include: { koc: { select: { id: true, ten: true, platform: true } } },
      orderBy: { doanhThu: "desc" },
      select: { id: true, kocId: true, thang: true, creatorName: true, tiktokProductId: true, doanhThu: true, donHang: true, hoanTien: true, hoaHong: true, soMon: true, koc: { select: { id: true, ten: true, platform: true } } },
    }),
  ]);

  return NextResponse.json({ spData, kocData });
}

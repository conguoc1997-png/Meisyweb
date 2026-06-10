export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/san-xuat/lo-cat/stats?thang=YYYY-MM
// Trả về tổng soSanPham từ LoCat, group by loaiHang, trong tháng được chọn
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const thang = searchParams.get("thang"); // YYYY-MM

  if (!thang) return NextResponse.json({ error: "Thiếu ?thang=YYYY-MM" }, { status: 400 });

  const [y, m] = thang.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end   = new Date(y, m, 1);

  const records = await prisma.loCat.findMany({
    where: {
      ngay: { gte: start, lt: end },
    },
    select: {
      loaiHang:    true,
      soSanPham:   true,
      hangThucTe:  true,
    },
  });

  // Group by loaiHang, lấy hangThucTe nếu có, không thì soSanPham
  const stats: Record<string, number> = {
    dai_thuong: 0,
    dai_kieu:   0,
    short:      0,
  };

  for (const r of records) {
    const loai = r.loaiHang || "dai_thuong";
    const sl   = r.hangThucTe ?? r.soSanPham ?? 0;
    if (loai in stats) {
      stats[loai] += sl;
    } else {
      stats["dai_thuong"] += sl; // fallback
    }
  }

  return NextResponse.json({ thang, stats, total: Object.values(stats).reduce((a, b) => a + b, 0) });
}

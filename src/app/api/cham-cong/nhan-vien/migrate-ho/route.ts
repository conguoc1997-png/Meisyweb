import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API chạy 1 lần: gán hoKinhDoanh cho nhân viên hiện tại
// MAY → nguyen_cong_uoc, còn lại → meisy
export async function POST() {
  // Gán MAY → Nguyễn Công Ước
  const mayResult = await prisma.nhanVien.updateMany({
    where: { phongBan: { in: ["MAY", "May", "may"] } },
    data:  { hoKinhDoanh: "nguyen_cong_uoc" },
  });

  // Gán tất cả còn lại (chưa có giá trị nguyen_cong_uoc) → meisy
  const meisyResult = await prisma.nhanVien.updateMany({
    where: { hoKinhDoanh: { not: "nguyen_cong_uoc" } },
    data:  { hoKinhDoanh: "meisy" },
  });

  return NextResponse.json({
    ok: true,
    nguyen_cong_uoc: mayResult.count,
    meisy: meisyResult.count,
  });
}

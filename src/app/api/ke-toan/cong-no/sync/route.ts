export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/ke-toan/cong-no/sync
// Tạo CongNo từ PhieuNhapKho theo tên NCC (đồng bộ dữ liệu cũ)
export async function POST(req: NextRequest) {
  try {
    const { nhaCCId, nhaCCTen } = await req.json();
    if (!nhaCCId || !nhaCCTen) {
      return NextResponse.json({ error: "Thiếu nhaCCId hoặc nhaCCTen" }, { status: 400 });
    }

    // Tìm tất cả phiếu nhập kho có tenNhaCC trùng tên (không phân biệt hoa thường)
    const phieus = await prisma.phieuNhapKho.findMany({
      where: {
        tenNhaCC: { equals: nhaCCTen, mode: "insensitive" },
      },
      orderBy: { ngay: "asc" },
    });

    if (phieus.length === 0) {
      return NextResponse.json({ created: 0, message: "Không tìm thấy phiếu nhập kho phù hợp" });
    }

    // Lấy CongNo đã có theo nhaCCId (tránh duplicate theo soChungTu)
    const existing = await prisma.congNo.findMany({
      where: { nhaCC: nhaCCId },
      select: { soChungTu: true },
    });
    const existingSoCT = new Set(existing.map(e => e.soChungTu).filter(Boolean));

    // Tạo CongNo cho các phiếu chưa có
    let created = 0;
    for (const p of phieus) {
      if (existingSoCT.has(p.soPhieu)) continue;
      await prisma.congNo.create({
        data: {
          nhaCC:     nhaCCId,
          ngay:      p.ngay,
          soChungTu: p.soPhieu,
          dienGiai:  `Nhập kho NPL - ${p.soPhieu}${p.soHoaDon ? ` / HĐ ${p.soHoaDon}` : ""}`,
          loai:      "mua_hang",
          soTien:    p.tongTien,
          nguoiTao:  p.nguoiTao || null,
        },
      });
      created++;
    }

    return NextResponse.json({ created, total: phieus.length });
  } catch (e: unknown) {
    console.error("[cong-no sync]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

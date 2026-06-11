export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ke-toan/cong-no/sync?ten=xxx — debug: xem phiếu nhập kho theo tên
export async function GET(req: NextRequest) {
  const ten = req.nextUrl.searchParams.get("ten") || "";
  const sample = await prisma.phieuNhapKho.findMany({
    take: 20,
    orderBy: { ngay: "desc" },
    select: { soPhieu: true, nhaCC: true, tenNhaCC: true, tongTien: true },
  });
  const matched = sample.filter(p =>
    p.tenNhaCC?.toLowerCase().includes(ten.toLowerCase()) ||
    p.nhaCC?.toLowerCase().includes(ten.toLowerCase())
  );
  return NextResponse.json({ ten, matched, sample });
}

// POST /api/ke-toan/cong-no/sync
// Tạo CongNo từ PhieuNhapKho theo tên NCC (đồng bộ dữ liệu cũ)
export async function POST(req: NextRequest) {
  try {
    const { nhaCCId, nhaCCTen } = await req.json();
    if (!nhaCCId || !nhaCCTen) {
      return NextResponse.json({ error: "Thiếu nhaCCId hoặc nhaCCTen" }, { status: 400 });
    }

    // Tìm theo tenNhaCC (case-insensitive) HOẶC nhaCC chứa tên
    const phieus = await prisma.phieuNhapKho.findMany({
      where: {
        OR: [
          { tenNhaCC: { equals: nhaCCTen, mode: "insensitive" } },
          { tenNhaCC: { contains: nhaCCTen, mode: "insensitive" } },
          { nhaCC: { equals: nhaCCTen, mode: "insensitive" } },
          { nhaCC: { contains: nhaCCTen, mode: "insensitive" } },
        ],
      },
      orderBy: { ngay: "asc" },
    });

    if (phieus.length === 0) {
      // Trả về sample để debug
      const sample = await prisma.phieuNhapKho.findMany({
        take: 5, orderBy: { ngay: "desc" },
        select: { nhaCC: true, tenNhaCC: true },
      });
      return NextResponse.json({ created: 0, message: "Không tìm thấy phiếu nhập kho phù hợp", debug: { searchedFor: nhaCCTen, sample } });
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [sanPhams, doiTras, bookings] = await Promise.all([
      prisma.sanPham.findMany(),
      prisma.doiTra.findMany(),
      prisma.kOCBooking.findMany({ include: { koc: true } }),
    ]);

    const tongSanPham = sanPhams.length;
    const tongTonKho = sanPhams.reduce((s, sp) => s + sp.tonKho, 0);
    const spSapHet = sanPhams.filter((sp) => sp.tonKho <= 5).length;

    const choXuLy = doiTras.filter((d) => d.trangThai === "cho_xu_ly").length;
    const dangXuLy = doiTras.filter((d) => d.trangThai === "dang_xu_ly").length;

    const tongChiPhiKOC = bookings.reduce((s, b) => s + b.chiPhi, 0);
    const tongDoanhThuKOC = bookings.reduce((s, b) => s + b.doanhThu, 0);
    const bookingDangChay = bookings.filter((b) => b.trangThai === "dang_chay").length;

    // Recent activity
    const recentDoiTra = await prisma.doiTra.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      kho: { tongSanPham, tongTonKho, spSapHet },
      doiTra: { total: doiTras.length, choXuLy, dangXuLy },
      koc: { tongChiPhiKOC, tongDoanhThuKOC, bookingDangChay, tongBooking: bookings.length },
      recentDoiTra,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Dashboard error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

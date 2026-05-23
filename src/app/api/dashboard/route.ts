export const dynamic = "force-dynamic";
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
    const tongTonKho = sanPhams.reduce((s: number, sp: typeof sanPhams[0]) => s + sp.tonKho, 0);
    const spSapHet = sanPhams.filter((sp: typeof sanPhams[0]) => sp.tonKho <= 5).length;

    const choXuLy = doiTras.filter((d: typeof doiTras[0]) => d.trangThai === "cho_xu_ly").length;
    const dangXuLy = doiTras.filter((d: typeof doiTras[0]) => d.trangThai === "dang_xu_ly").length;

    const tongChiPhiKOC = bookings.reduce((s: number, b: typeof bookings[0]) => s + b.chiPhi, 0);
    const tongDoanhThuKOC = bookings.reduce((s: number, b: typeof bookings[0]) => s + b.doanhThu, 0);
    const bookingDangChay = bookings.filter((b: typeof bookings[0]) => b.trangThai === "dang_chay").length;

    // Recent activity
    const recentDoiTra = await prisma.doiTra.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // ── Tổng kết theo tháng (6 tháng gần nhất) ──
    const now = new Date();
    const thangList = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { label: `T${d.getMonth() + 1}/${d.getFullYear()}`, year: d.getFullYear(), month: d.getMonth() + 1 };
    });

    const thangData = thangList.map(t => {
      const start = new Date(t.year, t.month - 1, 1);
      const end   = new Date(t.year, t.month, 1);

      const mBookings = bookings.filter(b => {
        const d = new Date(b.ngayBat);
        return d >= start && d < end;
      });
      const mDoiTra = doiTras.filter(d => {
        const cd = new Date(d.createdAt);
        return cd >= start && cd < end;
      });

      const chiPhi   = mBookings.reduce((s, b) => s + b.chiPhi, 0);
      const doanhThu = mBookings.reduce((s, b) => s + b.doanhThu, 0);

      return {
        label:     t.label,
        soBooking: mBookings.length,
        chiPhi,
        doanhThu,
        loiNhuan:  doanhThu - chiPhi,
        soDoiTra:  mDoiTra.length,
      };
    });

    return NextResponse.json({
      kho: { tongSanPham, tongTonKho, spSapHet },
      doiTra: { total: doiTras.length, choXuLy, dangXuLy },
      koc: { tongChiPhiKOC, tongDoanhThuKOC, bookingDangChay, tongBooking: bookings.length },
      recentDoiTra,
      thangData,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Dashboard error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

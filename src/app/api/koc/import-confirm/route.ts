import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImportRow = {
  bookingId: string;
  luotXem: number;
  donHang: number;
  doanhThu: number;
};

export async function POST(req: NextRequest) {
  try {
    const { rows }: { rows: ImportRow[] } = await req.json();
    if (!rows?.length) return NextResponse.json({ error: "Không có dữ liệu" }, { status: 400 });

    const results = await Promise.all(
      rows.map(r =>
        prisma.kOCBooking.update({
          where: { id: r.bookingId },
          data: {
            luotXem:  r.luotXem,
            donHang:  r.donHang,
            doanhThu: r.doanhThu,
            trangThai: "ket_thuc",
          },
        })
      )
    );

    return NextResponse.json({ updated: results.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

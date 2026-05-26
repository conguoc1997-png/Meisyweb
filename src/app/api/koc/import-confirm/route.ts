export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ImportRow = {
  bookingId: string;
  luotXem: number;
  donHang: number;
  doanhThu: number;
  kocId?: string | null;
  sdt?: string | null;
  diaChi?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const { rows }: { rows: ImportRow[] } = await req.json();
    if (!rows?.length) return NextResponse.json({ error: "Không có dữ liệu" }, { status: 400 });

    // Chạy tuần tự tránh pool timeout (Supabase connection_limit=1)
    let updated = 0;
    for (const r of rows) {
      const booking = await prisma.kOCBooking.update({
        where: { id: r.bookingId },
        data: {
          luotXem:   r.luotXem,
          donHang:   r.donHang,
          doanhThu:  r.doanhThu,
          trangThai: "ket_thuc",
        },
      });

      const kocId = r.kocId ?? booking.kocId;
      if (kocId && (r.sdt || r.diaChi)) {
        await prisma.kOC.update({
          where: { id: kocId },
          data: {
            ...(r.sdt    ? { sdt:    r.sdt    } : {}),
            ...(r.diaChi ? { diaChi: r.diaChi } : {}),
          },
        });
      }
      updated++;
    }

    return NextResponse.json({ updated });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

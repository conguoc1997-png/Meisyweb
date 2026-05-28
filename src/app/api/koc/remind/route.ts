export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Trả về các booking có ngayLenVideo trong vòng 2 ngày tới (chưa lên video)
export async function GET() {
  try {
    const now   = new Date();
    const in2d  = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const upcoming = await prisma.kOCBooking.findMany({
      where: {
        ngayLenVideo: { gte: now, lte: in2d },
      },
      include: { koc: true, sanPham: true },
      orderBy: { ngayLenVideo: "asc" },
    });

    return NextResponse.json(upcoming);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

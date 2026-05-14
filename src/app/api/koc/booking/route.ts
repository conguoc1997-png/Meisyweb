export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bookings = await prisma.kOCBooking.findMany({
      include: { koc: true, sanPham: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const chiPhiCast = Number(body.chiPhiCast) || 0;
    const chiPhiSP   = Number(body.chiPhiSP)   || 0;
    const chiPhi     = chiPhiCast + chiPhiSP;

    const booking = await prisma.kOCBooking.create({
      data: {
        kocId:      body.kocId,
        sanPhamId:  body.sanPhamId  || null,
        soLuongGui: Number(body.soLuongGui) || 0,
        chiPhiCast,
        chiPhiSP,
        chiPhi,
        ngayBat:   new Date(body.ngayBat),
        ngayKet:   body.ngayKet ? new Date(body.ngayKet) : null,
        trangThai: body.trangThai || "dang_chay",
        ghiChu:    body.ghiChu || null,
      },
      include: { koc: true, sanPham: true },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

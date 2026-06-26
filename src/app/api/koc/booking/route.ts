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
    // Fallback: cột ngayRaHang chưa tồn tại trong DB
    try {
      const bookings = await prisma.$queryRaw`
        SELECT b.*, b."ngayBat"::text, b."ngayKet"::text,
               b."ngayLenVideo"::text,
               NULL::timestamp as "ngayRaHang",
               row_to_json(k.*) as koc,
               row_to_json(s.*) as "sanPham"
        FROM "KOCBooking" b
        JOIN "KOC" k ON k.id = b."kocId"
        LEFT JOIN "SanPham" s ON s.id = b."sanPhamId"
        ORDER BY b."createdAt" DESC
      `;
      return NextResponse.json(bookings);
    } catch (e2: unknown) {
      return NextResponse.json({ error: e2 instanceof Error ? e2.message : "Lỗi server" }, { status: 500 });
    }
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
        kocId:        body.kocId,
        sanPhamId:    body.sanPhamId  || null,
        soLuongGui:   Number(body.soLuongGui) || 0,
        chiPhiCast,
        chiPhiSP,
        chiPhi,
        ngayBat:      new Date(body.ngayBat),
        ngayKet:      body.ngayKet      ? new Date(body.ngayKet)      : null,
        ngayRaHang:   body.ngayRaHang   ? new Date(body.ngayRaHang)   : null,
        ngayLenVideo: body.ngayLenVideo ? new Date(body.ngayLenVideo) : null,
        trangThai:    body.trangThai || "dang_chay",
        ghiChu:       body.ghiChu || null,
      },
      include: { koc: true, sanPham: true },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

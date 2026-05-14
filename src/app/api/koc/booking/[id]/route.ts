export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const booking = await prisma.kOCBooking.update({
      where: { id },
      data: {
        doanhThu: body.doanhThu !== undefined ? Number(body.doanhThu) : undefined,
        donHang: body.donHang !== undefined ? Number(body.donHang) : undefined,
        luotXem: body.luotXem !== undefined ? Number(body.luotXem) : undefined,
        trangThai: body.trangThai,
        ghiChu: body.ghiChu,
      },
      include: { koc: true },
    });
    return NextResponse.json(booking);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

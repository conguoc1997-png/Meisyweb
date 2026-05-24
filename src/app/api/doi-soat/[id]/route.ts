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
    const don = await prisma.donHoanTra.update({
      where: { id },
      data: {
        ...(body.daDoiSoat  !== undefined && { daDoiSoat:  Boolean(body.daDoiSoat)  }),
        ...(body.trangThai  !== undefined && { trangThai:  body.trangThai  }),
        ...(body.ghiChu     !== undefined && { ghiChu:     body.ghiChu || null }),
        ...(body.ngayNhan   !== undefined && { ngayTaoDon: body.ngayNhan ? new Date(body.ngayNhan) : null }),
      },
    });
    return NextResponse.json(don);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.donHoanTra.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

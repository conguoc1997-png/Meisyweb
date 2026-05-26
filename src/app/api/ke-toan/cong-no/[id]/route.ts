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
    const record = await prisma.congNo.update({
      where: { id },
      data: {
        ...(body.ngay       !== undefined && { ngay: new Date(body.ngay) }),
        ...(body.soChungTu  !== undefined && { soChungTu: body.soChungTu || null }),
        ...(body.dienGiai   !== undefined && { dienGiai: body.dienGiai }),
        ...(body.loai       !== undefined && { loai: body.loai }),
        ...(body.soTien     !== undefined && { soTien: Number(body.soTien) }),
        ...(body.ghiChu     !== undefined && { ghiChu: body.ghiChu || null }),
      },
    });
    return NextResponse.json(record);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.congNo.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

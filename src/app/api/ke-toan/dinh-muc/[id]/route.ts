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
    const item = await prisma.dinhMucNPL.update({
      where: { id },
      data: {
        ...(body.hangCat  !== undefined && { hangCat: body.hangCat }),
        ...(body.vatTuId  !== undefined && { vatTuId: body.vatTuId }),
        ...(body.soLuong  !== undefined && { soLuong: body.soLuong }),
        ...(body.haoHui   !== undefined && { haoHui: body.haoHui ?? 0 }),
        ...(body.ghiChu   !== undefined && { ghiChu: body.ghiChu || null }),
      },
      include: { vatTu: true },
    });
    return NextResponse.json(item);
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
    await prisma.dinhMucNPL.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

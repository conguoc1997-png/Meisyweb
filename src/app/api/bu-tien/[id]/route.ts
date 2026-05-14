import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const record = await prisma.buTien.update({
      where: { id },
      data: {
        ...(body.tenKhach  !== undefined && { tenKhach:  body.tenKhach }),
        ...(body.sdtKhach  !== undefined && { sdtKhach:  body.sdtKhach  || null }),
        ...(body.loiBu     !== undefined && { loiBu:     body.loiBu }),
        ...(body.soTien    !== undefined && { soTien:    Number(body.soTien) }),
        ...(body.trangThai !== undefined && { trangThai: body.trangThai }),
        ...(body.ghiChu    !== undefined && { ghiChu:    body.ghiChu    || null }),
        ...(body.nguoiXuLy !== undefined && { nguoiXuLy: body.nguoiXuLy || null }),
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
    await prisma.buTien.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

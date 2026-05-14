import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const sp = await prisma.sanPham.update({
      where: { id },
      data: {
        ten: body.ten,
        sku: body.sku,
        mauSac: body.mauSac || null,
        size: body.size || null,
        giaNhap: Number(body.giaNhap) || 0,
        giaBan: Number(body.giaBan) || 0,
        nguon: body.nguon || null,
      },
    });
    return NextResponse.json(sp);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.sanPham.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

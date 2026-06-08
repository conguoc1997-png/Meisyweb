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
    const item = await prisma.vatTu.update({
      where: { id },
      data: {
        ...(body.ma      !== undefined && { ma: body.ma }),
        ...(body.ten     !== undefined && { ten: body.ten }),
        ...(body.loai    !== undefined && { loai: body.loai }),
        ...(body.nhom    !== undefined && { nhom: body.nhom || null }),
        ...(body.donVi   !== undefined && { donVi: body.donVi }),
        ...(body.ghiChu  !== undefined && { ghiChu: body.ghiChu || null }),
        ...(body.active  !== undefined && { active: body.active }),
      },
      include: { tonKho: true },
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
    await prisma.$transaction(async (tx) => {
      // Xoá các bản ghi liên quan trước
      await tx.tonKhoVatTu.deleteMany({ where: { vatTuId: id } });
      await tx.dinhMucNPL.deleteMany({ where: { vatTuId: id } });
      await tx.chiTietNhapKho.deleteMany({ where: { vatTuId: id } });
      await tx.phieuXuatChiTiet.deleteMany({ where: { vatTuId: id } });
      await tx.vatTu.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

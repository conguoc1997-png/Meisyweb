export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const phieu = await prisma.phieuXuatKho.findUnique({
    where: { id },
    include: { chiTiet: { include: { vatTu: true } } },
  });
  if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(phieu);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const phieu = await prisma.phieuXuatKho.findUnique({
      where: { id },
      include: { chiTiet: true },
    });
    if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // Hoàn ngược tồn kho
      for (const r of phieu.chiTiet) {
        const ton = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: r.vatTuId } });
        if (ton) {
          const newSL = ton.soLuong + r.soLuong;
          await tx.tonKhoVatTu.update({
            where: { vatTuId: r.vatTuId },
            data: { soLuong: newSL, giaTriTon: newSL * ton.giaTrungBinh },
          });
        }
      }
      await tx.phieuXuatKho.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

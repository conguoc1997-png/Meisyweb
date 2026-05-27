export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const phieu = await prisma.phieuNhapKho.findUnique({
    where: { id },
    include: { chiTiet: { include: { vatTu: true } } },
  });
  if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(phieu);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    // Only allow updating header fields (trangThai, ghiChu, soHoaDon, ngayHoaDon)
    const phieu = await prisma.phieuNhapKho.update({
      where: { id },
      data: {
        ...(body.trangThai   !== undefined && { trangThai: body.trangThai }),
        ...(body.ghiChu      !== undefined && { ghiChu: body.ghiChu || null }),
        ...(body.soHoaDon    !== undefined && { soHoaDon: body.soHoaDon || null }),
        ...(body.ngayHoaDon  !== undefined && { ngayHoaDon: body.ngayHoaDon ? new Date(body.ngayHoaDon) : null }),
      },
      include: { chiTiet: { include: { vatTu: true } } },
    });
    return NextResponse.json(phieu);
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
    // Cascade deletes chiTiet; also reverse TonKho and delete CongNo entry
    const phieu = await prisma.phieuNhapKho.findUnique({
      where: { id },
      include: { chiTiet: true },
    });
    if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // Reverse tồn kho
      for (const row of phieu.chiTiet) {
        const ton = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: row.vatTuId } });
        if (ton) {
          const newSoLuong = Math.max(0, ton.soLuong - row.soLuong);
          await tx.tonKhoVatTu.update({
            where: { vatTuId: row.vatTuId },
            data: {
              soLuong: newSoLuong,
              giaTriTon: newSoLuong * ton.giaTrungBinh,
            },
          });
        }
      }
      // Delete CongNo auto-created for this phieu
      await tx.congNo.deleteMany({ where: { soChungTu: phieu.soPhieu, loai: "mua_hang" } });
      // Delete phieu (cascade chiTiet)
      await tx.phieuNhapKho.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

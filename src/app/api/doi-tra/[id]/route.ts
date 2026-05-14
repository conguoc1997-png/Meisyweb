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
    const record = await prisma.doiTra.update({
      where: { id },
      data: {
        ...(body.sdtHienTai !== undefined && { sdtHienTai: body.sdtHienTai }),
        ...(body.tenKhach    !== undefined && { tenKhach: body.tenKhach }),
        ...(body.diaChi      !== undefined && { diaChi: body.diaChi }),
        ...(body.skuHienTai  !== undefined && { skuHienTai: body.skuHienTai }),
        ...(body.skuDoiSang  !== undefined && { skuDoiSang: body.skuDoiSang }),
        ...(body.giaTriHang  !== undefined && { giaTriHang: Number(body.giaTriHang) }),
        ...(body.loaiVanDe   !== undefined && { loaiVanDe: body.loaiVanDe }),
        ...(body.ghiChu      !== undefined && { ghiChu: body.ghiChu }),
        ...(body.phiShip     !== undefined && { phiShip: Number(body.phiShip) }),
        ...(body.soChieuShip !== undefined && { soChieuShip: Number(body.soChieuShip) }),
        ...(body.maVanDon    !== undefined && { maVanDon: body.maVanDon || null }),
        ...(body.nguoiXuLy   !== undefined && { nguoiXuLy: body.nguoiXuLy }),
      },
    });
    return NextResponse.json(record);
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
    await prisma.doiTra.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: cập nhật record (ghi nhận hàng ra thực tế hoặc sửa thông tin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await prisma.fakeKho.update({
      where: { id },
      data: {
        ...(body.sku          !== undefined && { sku:          body.sku }),
        ...(body.tenSanPham   !== undefined && { tenSanPham:   body.tenSanPham || null }),
        ...(body.size         !== undefined && { size:         body.size || null }),
        ...(body.ngayNhap     !== undefined && { ngayNhap:     new Date(body.ngayNhap) }),
        ...(body.soLuongNhap  !== undefined && { soLuongNhap:  Number(body.soLuongNhap) }),
        ...(body.ngayRaHang   !== undefined && { ngayRaHang:   body.ngayRaHang ? new Date(body.ngayRaHang) : null }),
        ...(body.soLuongRa    !== undefined && { soLuongRa:    Number(body.soLuongRa) }),
        ...(body.ghiChu       !== undefined && { ghiChu:       body.ghiChu || null }),
      },
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

// DELETE: xóa record
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.fakeKho.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

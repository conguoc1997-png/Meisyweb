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
    const booking = await prisma.kOCBooking.update({
      where: { id },
      data: {
        // Cập nhật kết quả
        ...(body.doanhThu  !== undefined && { doanhThu:  Number(body.doanhThu)  }),
        ...(body.donHang   !== undefined && { donHang:   Number(body.donHang)   }),
        ...(body.luotXem   !== undefined && { luotXem:   Number(body.luotXem)   }),
        ...(body.trangThai !== undefined && { trangThai: body.trangThai }),
        ...(body.ghiChu    !== undefined && { ghiChu:    body.ghiChu    }),
        // Sửa thông tin booking
        ...(body.kocId      !== undefined && { kocId:      body.kocId      }),
        ...(body.sanPhamId  !== undefined && { sanPhamId:  body.sanPhamId  || null }),
        ...(body.soLuongGui !== undefined && { soLuongGui: Number(body.soLuongGui) }),
        ...(body.ngayBat    !== undefined && { ngayBat:    new Date(body.ngayBat) }),
        ...(body.ngayKet    !== undefined && { ngayKet:    body.ngayKet ? new Date(body.ngayKet) : null }),
        // Sửa chi phí
        ...(body.chiPhiCast !== undefined && {
          chiPhiCast: Number(body.chiPhiCast),
          chiPhi: Number(body.chiPhiCast) + Number(body.chiPhiSP ?? 0),
        }),
        ...(body.chiPhiSP   !== undefined && {
          chiPhiSP: Number(body.chiPhiSP),
          chiPhi: Number(body.chiPhiCast ?? 0) + Number(body.chiPhiSP),
        }),
      },
      include: { koc: true, sanPham: true },
    });
    return NextResponse.json(booking);
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
    await prisma.kOCBooking.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

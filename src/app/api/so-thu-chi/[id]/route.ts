import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/so-thu-chi/[id] — cập nhật trạng thái hoặc nội dung
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const updateData: Record<string, unknown> = {};

    if (data.trangThai !== undefined) updateData.trangThai = data.trangThai;
    if (data.ghiChuDuyet !== undefined) updateData.ghiChuDuyet = data.ghiChuDuyet || null;
    if (data.nguoiDuyet !== undefined) updateData.nguoiDuyet = data.nguoiDuyet || null;
    if (data.ngayDuyet !== undefined) updateData.ngayDuyet = data.ngayDuyet ? new Date(data.ngayDuyet) : null;

    // Khi cập nhật nội dung phiếu
    if (data.soTien !== undefined) updateData.soTien = Number(data.soTien);
    if (data.danhMuc !== undefined) updateData.danhMuc = data.danhMuc;
    if (data.dienGiai !== undefined) updateData.dienGiai = data.dienGiai;
    if (data.nguoiDeXuat !== undefined) updateData.nguoiDeXuat = data.nguoiDeXuat || null;
    if (data.loai !== undefined) updateData.loai = data.loai;
    if (data.ngay !== undefined) updateData.ngay = data.ngay ? new Date(data.ngay) : undefined;

    const phieu = await prisma.phieuThuChi.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(phieu);
  } catch (e) {
    console.error("PATCH /api/so-thu-chi/[id] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/so-thu-chi/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.phieuThuChi.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/so-thu-chi/[id] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

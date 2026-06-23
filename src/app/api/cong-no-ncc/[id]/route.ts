export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: trả nợ hoặc cập nhật
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { id } = await params;

    // Nếu có soTienTra → tạo PhieuThuChi và cập nhật công nợ
    if (body.soTienTra) {
      const soTienTra = parseFloat(body.soTienTra);
      const record = await prisma.congNoNCC.findUnique({ where: { id } });
      if (!record) return NextResponse.json({ error: "Không tìm thấy công nợ" }, { status: 404 });

      const newDaTra = record.daTra + soTienTra;
      const newConLai = Math.max(0, record.chiPhiThucNhap - newDaTra);
      const newTrangThai = newConLai <= 0 ? "da_thanh_toan" : "thanh_toan_1_phan";

      const thang = new Date().toISOString().slice(0, 7);

      // Tạo PhieuThuChi loại chi (cho_duyet)
      const phieu = await prisma.phieuThuChi.create({
        data: {
          ho: record.ho,
          loai: "chi",
          soTien: soTienTra,
          danhMuc: "nguyen_lieu",
          dienGiai: `Trả nợ NCC: ${record.tenNCC}${record.soHoaDon ? ` (HĐ: ${record.soHoaDon})` : ""}`,
          nguoiDeXuat: body.nguoiTao || null,
          trangThai: "cho_duyet",
          ngay: new Date(),
          thang,
        },
      });

      // Cập nhật công nợ
      const updated = await prisma.congNoNCC.update({
        where: { id },
        data: {
          daTra: newDaTra,
          conLai: newConLai,
          trangThai: newTrangThai,
          phieuThuChiId: phieu.id,
        },
      });

      return NextResponse.json({ congNo: updated, phieuThuChi: phieu });
    }

    // Cập nhật thông thường
    const updated = await prisma.congNoNCC.update({
      where: { id },
      data: {
        ...(body.tenNCC && { tenNCC: body.tenNCC }),
        ...(body.soHoaDon !== undefined && { soHoaDon: body.soHoaDon }),
        ...(body.soTienHoaDon !== undefined && { soTienHoaDon: parseFloat(body.soTienHoaDon) }),
        ...(body.chiPhiThucNhap !== undefined && {
          chiPhiThucNhap: parseFloat(body.chiPhiThucNhap),
          conLai: parseFloat(body.chiPhiThucNhap) - (body.daTra ?? 0),
        }),
        ...(body.ghiChu !== undefined && { ghiChu: body.ghiChu }),
      },
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.congNoNCC.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

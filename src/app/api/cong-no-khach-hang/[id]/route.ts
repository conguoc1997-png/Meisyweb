export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: ghi nhận khách thanh toán
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { id } = await params;

    if (body.soTienThu) {
      const soTienThu = parseFloat(body.soTienThu);
      const record = await prisma.congNoKhachHang.findUnique({ where: { id } });
      if (!record) return NextResponse.json({ error: "Không tìm thấy công nợ" }, { status: 404 });

      const newDaTra = record.daTra + soTienThu;
      const newConLai = Math.max(0, record.soTien - newDaTra);
      const newTrangThai = newConLai <= 0 ? "da_thanh_toan" : "thanh_toan_1_phan";

      const thang = new Date().toISOString().slice(0, 7);

      // Tạo PhieuThuChi loại thu (da_duyet — thu không cần duyệt)
      const phieu = await prisma.phieuThuChi.create({
        data: {
          ho: record.ho,
          loai: "thu",
          soTien: soTienThu,
          danhMuc: "khac",
          dienGiai: `KH ${record.tenKhachHang} thanh toán`,
          nguoiDeXuat: body.nguoiTao || null,
          trangThai: "da_duyet",
          ngay: new Date(),
          thang,
        },
      });

      // Cập nhật công nợ
      const updated = await prisma.congNoKhachHang.update({
        where: { id },
        data: {
          daTra: newDaTra,
          conLai: newConLai,
          trangThai: newTrangThai,
          phieuThuChiId: phieu.id,
        },
      });

      // Cập nhật DoanhThu nếu có
      if (record.doanhThuId && newConLai <= 0) {
        await prisma.doanhThu.update({
          where: { id: record.doanhThuId },
          data: { trangThai: "da_thu" },
        });
      }

      return NextResponse.json({ congNo: updated, phieuThuChi: phieu });
    }

    const updated = await prisma.congNoKhachHang.update({
      where: { id },
      data: {
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
    await prisma.congNoKhachHang.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

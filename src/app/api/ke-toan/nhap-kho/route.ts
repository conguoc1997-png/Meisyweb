export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RowInput = {
  vatTuId: string;
  soLuongMua: number; // số lượng theo đơn vị mua (cây, kg, m)
  donViMua: string;   // "m" | "cay" | "kg"
  quyDoi: number;     // hệ số: tổng m = soLuongMua × quyDoi
  donGia: number;     // giá / donViMua
  ghiChu?: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nhaCC = searchParams.get("nhaCC");
  const trangThai = searchParams.get("trangThai");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const phieus = await prisma.phieuNhapKho.findMany({
    where: {
      ...(nhaCC && { nhaCC }),
      ...(trangThai && { trangThai }),
      ...(from || to ? {
        ngay: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to + "T23:59:59") }),
        }
      } : {}),
    },
    include: { chiTiet: { include: { vatTu: true } } },
    orderBy: { ngay: "desc" },
  });
  return NextResponse.json(phieus);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: RowInput[] = body.chiTiet;

    // Tổng tiền = sum(soLuongMua × donGia)
    const tongTien = rows.reduce((s, r) => s + r.soLuongMua * r.donGia, 0);

    const phieu = await prisma.$transaction(async (tx) => {
      // 1. Tạo phiếu nhập + chi tiết
      const p = await tx.phieuNhapKho.create({
        data: {
          soPhieu: body.soPhieu,
          ngay: new Date(body.ngay),
          nhaCC: body.nhaCC,
          tenNhaCC: body.tenNhaCC || null,
          soHoaDon: body.soHoaDon || null,
          ngayHoaDon: body.ngayHoaDon ? new Date(body.ngayHoaDon) : null,
          tongTien,
          trangThai: body.trangThai || "chua_thanh_toan",
          ghiChu: body.ghiChu || null,
          nguoiTao: body.nguoiTao || null,
          chiTiet: {
            create: rows.map(r => ({
              vatTuId: r.vatTuId,
              soLuongMua: r.soLuongMua,
              donViMua: r.donViMua || "m",
              quyDoi: r.quyDoi || 1,
              soLuong: r.soLuongMua * (r.quyDoi || 1), // tổng mét
              donGia: r.donGia,
              thanhTien: r.soLuongMua * r.donGia,
              ghiChu: r.ghiChu || null,
            })),
          },
        },
        include: { chiTiet: { include: { vatTu: true } } },
      });

      // 2. Cập nhật tồn kho bình quân gia quyền
      for (const r of rows) {
        const soLuong = r.soLuongMua * (r.quyDoi || 1); // tổng đơn vị cơ bản (m)
        const thanhTien = r.soLuongMua * r.donGia;
        // giá/đơn vị cơ bản
        const giaCoBan = soLuong > 0 ? thanhTien / soLuong : r.donGia;

        const existing = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: r.vatTuId } });
        if (existing) {
          const newSoLuong = existing.soLuong + soLuong;
          const newGiaTB = newSoLuong > 0
            ? (existing.giaTriTon + thanhTien) / newSoLuong
            : giaCoBan;
          await tx.tonKhoVatTu.update({
            where: { vatTuId: r.vatTuId },
            data: { soLuong: newSoLuong, giaTrungBinh: newGiaTB, giaTriTon: newSoLuong * newGiaTB },
          });
        } else {
          await tx.tonKhoVatTu.create({
            data: {
              vatTuId: r.vatTuId,
              soLuong,
              giaTrungBinh: giaCoBan,
              giaTriTon: thanhTien,
            },
          });
        }
      }

      // 3. Bút toán công nợ
      await tx.congNo.create({
        data: {
          nhaCC: body.nhaCC,
          ngay: new Date(body.ngay),
          soChungTu: body.soPhieu,
          dienGiai: `Nhập kho NPL - ${body.soPhieu}${body.soHoaDon ? ` / HĐ ${body.soHoaDon}` : ""}`,
          loai: "mua_hang",
          soTien: tongTien,
          nguoiTao: body.nguoiTao || null,
        },
      });

      return p;
    });

    return NextResponse.json(phieu, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

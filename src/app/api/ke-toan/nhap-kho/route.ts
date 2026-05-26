export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    include: {
      chiTiet: { include: { vatTu: true } },
    },
    orderBy: { ngay: "desc" },
  });
  return NextResponse.json(phieus);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body: { soPhieu, ngay, nhaCC, tenNhaCC?, soHoaDon?, ngayHoaDon?, ghiChu?, nguoiTao?, chiTiet: [{vatTuId, soLuong, donGia, ghiChu?}] }

    const tongTien = (body.chiTiet as { soLuong: number; donGia: number }[])
      .reduce((s, r) => s + r.soLuong * r.donGia, 0);

    const phieu = await prisma.$transaction(async (tx) => {
      // 1. Tạo phiếu nhập
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
            create: (body.chiTiet as { vatTuId: string; soLuong: number; donGia: number; ghiChu?: string }[]).map(r => ({
              vatTuId: r.vatTuId,
              soLuong: r.soLuong,
              donGia: r.donGia,
              thanhTien: r.soLuong * r.donGia,
              ghiChu: r.ghiChu || null,
            })),
          },
        },
        include: { chiTiet: { include: { vatTu: true } } },
      });

      // 2. Cập nhật tồn kho (bình quân gia quyền)
      for (const row of body.chiTiet as { vatTuId: string; soLuong: number; donGia: number }[]) {
        const existing = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: row.vatTuId } });
        if (existing) {
          const newSoLuong = existing.soLuong + row.soLuong;
          const newGiaTB = newSoLuong > 0
            ? (existing.soLuong * existing.giaTrungBinh + row.soLuong * row.donGia) / newSoLuong
            : row.donGia;
          await tx.tonKhoVatTu.update({
            where: { vatTuId: row.vatTuId },
            data: {
              soLuong: newSoLuong,
              giaTrungBinh: newGiaTB,
              giaTriTon: newSoLuong * newGiaTB,
            },
          });
        } else {
          await tx.tonKhoVatTu.create({
            data: {
              vatTuId: row.vatTuId,
              soLuong: row.soLuong,
              giaTrungBinh: row.donGia,
              giaTriTon: row.soLuong * row.donGia,
            },
          });
        }
      }

      // 3. Tạo bút toán công nợ
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

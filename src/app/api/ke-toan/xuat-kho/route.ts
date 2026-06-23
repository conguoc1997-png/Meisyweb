export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loCatId = searchParams.get("loCatId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const phieus = await prisma.phieuXuatKho.findMany({
      where: {
        ...(loCatId && { loCatId }),
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
  } catch (e: unknown) {
    console.error("[xuat-kho GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body: { soPhieu, loCatId?, hangCat?, soSanPham, ngay, ho?, lyDo?, tenKhachHang?,
    //         ghiChu?, nguoiTao?,
    //         chiTiet: [{vatTuId, soLuong, donGia, giaBan?, ghiChu?}] }

    type RowIn = { vatTuId: string; soLuong: number; donGia: number; giaBan?: number; ghiChu?: string };
    const chiTiet = body.chiTiet as RowIn[];
    const vatTuIds = [...new Set(chiTiet.map(r => r.vatTuId))];

    // Pre-fetch tồn kho và quyDoi TRƯỚC transaction
    const tonRows = await prisma.tonKhoVatTu.findMany({ where: { vatTuId: { in: vatTuIds } } });
    const nhapRows = await prisma.chiTietNhapKho.findMany({
      where: { vatTuId: { in: vatTuIds } },
      orderBy: { id: "desc" },
      distinct: ["vatTuId"],
      select: { vatTuId: true, quyDoi: true },
    });

    const tonMap    = new Map(tonRows.map(t => [t.vatTuId, t]));
    const quyDoiMap = new Map(nhapRows.map(n => [n.vatTuId, n.quyDoi ?? 1]));

    // Tính tổng doanh thu và giá vốn
    const tongDoanhThu = chiTiet.reduce((s, r) => s + r.soLuong * (r.giaBan || 0), 0);
    const tongGiaVon   = chiTiet.reduce((s, r) => s + r.soLuong * r.donGia, 0);
    const ho = body.ho || "meisy";
    const tenKhachHang = body.tenKhachHang?.trim() || null;

    const phieu = await prisma.$transaction(async (tx) => {
      // 1. Tạo phiếu xuất
      const p = await tx.phieuXuatKho.create({
        data: {
          soPhieu:      body.soPhieu,
          loCatId:      body.loCatId || null,
          hangCat:      body.hangCat || null,
          soSanPham:    body.soSanPham || 0,
          ngay:         new Date(body.ngay),
          ho,
          lyDo:         body.lyDo || "san_xuat",
          tenKhachHang,
          giaBanTong:   tongDoanhThu > 0 ? tongDoanhThu : null,
          ghiChu:       body.ghiChu || null,
          nguoiTao:     body.nguoiTao || null,
          chiTiet: {
            create: chiTiet.map(r => ({
              vatTuId:    r.vatTuId,
              soLuong:    r.soLuong,
              donGia:     r.donGia,
              thanhTien:  r.soLuong * r.donGia,
              giaBan:     r.giaBan || 0,
              doanhThuCt: r.soLuong * (r.giaBan || 0),
              ghiChu:     r.ghiChu || null,
            })),
          },
        },
        include: { chiTiet: { include: { vatTu: true } } },
      });

      // 2. Trừ tồn kho
      for (const r of chiTiet) {
        const ton    = tonMap.get(r.vatTuId);
        const quyDoi = quyDoiMap.get(r.vatTuId) ?? 1;
        if (ton) {
          const newSL = Math.max(0, ton.soLuong - r.soLuong / quyDoi);
          await tx.tonKhoVatTu.update({
            where: { vatTuId: r.vatTuId },
            data: { soLuong: newSL, giaTriTon: newSL * ton.giaTrungBinh },
          });
        }
      }

      // 3. Tạo DoanhThu nếu có giaBan > 0
      let doanhThu = null;
      if (tongDoanhThu > 0) {
        const thang = (body.ngay as string).slice(0, 7);
        doanhThu = await tx.doanhThu.create({
          data: {
            ho,
            ngay:           new Date(body.ngay),
            thang,
            phieuXuatId:    p.id,
            tenKhachHang,
            soTien:         tongDoanhThu,
            giaVon:         tongGiaVon,
            loiNhuan:       tongDoanhThu - tongGiaVon,
            trangThai:      tenKhachHang ? "chua_thu" : "da_thu",
            nguoiTao:       body.nguoiTao || null,
          },
        });

        // 4. Tạo CongNoKhachHang nếu có tên KH (chưa thanh toán)
        if (tenKhachHang) {
          const thang = (body.ngay as string).slice(0, 7);
          await tx.congNoKhachHang.create({
            data: {
              ho,
              ngay:           new Date(body.ngay),
              thang,
              tenKhachHang,
              doanhThuId:     doanhThu.id,
              soTien:         tongDoanhThu,
              daTra:          0,
              conLai:         tongDoanhThu,
              trangThai:      "con_no",
              nguoiTao:       body.nguoiTao || null,
            },
          });
        }
      }

      return { phieu: p, doanhThu };
    }, { timeout: 20000 });

    return NextResponse.json(phieu.phieu, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

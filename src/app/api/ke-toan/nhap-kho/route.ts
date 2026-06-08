export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RowInput = {
  vatTuId: string;
  soLuongMua: number;   // số lượng theo đơn vị mua (cây, kg, m)
  donViMua: string;     // "m" | "cay" | "kg"
  quyDoi: number;       // hệ số: tổng m = soLuongMua × quyDoi
  donViQuyDoi?: string; // đơn vị sau quy đổi (m, chiếc...) — từ form nhập
  soLuong?: number;     // tổng quy đổi (tuỳ chọn, chỉ lưu tham chiếu)
  donGia: number;       // giá / donViMua (chưa VAT)
  vat?: number;         // thuế VAT % (0 | 5 | 8 | 10 ...)
  ghiChu?: string;
};

export async function GET(req: NextRequest) {
  try {
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
  } catch (e: unknown) {
    console.error("[nhap-kho GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: RowInput[] = body.chiTiet;

    // Tổng tiền = sum(soLuongMua × donGia × (1 + vat/100))
    const tongTien = rows.reduce((s, r) => s + r.soLuongMua * r.donGia * (1 + (r.vat || 0) / 100), 0);

    // Phase 1: tạo phiếu + tồn kho (transaction ngắn, không có CongNo)
    const phieu = await prisma.$transaction(async (tx) => {
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
              vatTuId:     r.vatTuId,
              soLuongMua:  r.soLuongMua,
              donViMua:    r.donViMua || "m",
              quyDoi:      r.quyDoi || 1,
              donViQuyDoi: r.donViQuyDoi || "",
              soLuong:     r.soLuong ?? r.soLuongMua * (r.quyDoi || 1),
              donGia:      r.donGia,
              vat:         r.vat || 0,
              thanhTien:   r.soLuongMua * r.donGia * (1 + (r.vat || 0) / 100),
              ghiChu:      r.ghiChu || null,
            })),
          },
        },
        include: { chiTiet: { include: { vatTu: true } } },
      });

      // Cập nhật tồn kho bình quân gia quyền
      // tonKho.soLuong = soLuongMua (đơn vị mua — nhất quán với donGia)
      // giaTrungBinh   = bình quân của donGia qua các lần nhập
      // giaTriTon      = soLuong × giaTrungBinh = tổng giá trị tồn kho
      for (const r of rows) {
        const slMua  = r.soLuongMua;
        // Giá vốn = donGia × (1 + VAT%) → giá trị tồn khớp với thành tiền thực tế
        const giaVon = r.donGia * (1 + (r.vat || 0) / 100);
        const existing = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: r.vatTuId } });
        if (existing) {
          const newSL = existing.soLuong + slMua;
          const newGT = existing.giaTriTon + slMua * giaVon;
          await tx.tonKhoVatTu.update({
            where: { vatTuId: r.vatTuId },
            data: { soLuong: newSL, giaTrungBinh: newSL > 0 ? newGT / newSL : giaVon, giaTriTon: newGT },
          });
        } else {
          await tx.tonKhoVatTu.create({
            data: { vatTuId: r.vatTuId, soLuong: slMua, giaTrungBinh: giaVon, giaTriTon: slMua * giaVon },
          });
        }
      }
      return p;
    }, { maxWait: 10000, timeout: 30000 });

    // Phase 2: CongNo ngoài transaction (best-effort)
    try {
      await prisma.congNo.create({
        data: {
          nhaCC:     body.nhaCC,
          ngay:      new Date(body.ngay),
          soChungTu: body.soPhieu,
          dienGiai:  `Nhập kho NPL - ${body.soPhieu}${body.soHoaDon ? ` / HĐ ${body.soHoaDon}` : ""}`,
          loai:      "mua_hang",
          soTien:    tongTien,
          nguoiTao:  body.nguoiTao || null,
        },
      });
    } catch (e) {
      console.warn("[nhap-kho POST] CongNo create failed (non-fatal):", e);
    }

    return NextResponse.json(phieu, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

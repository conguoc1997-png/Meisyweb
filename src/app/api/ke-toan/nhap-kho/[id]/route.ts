export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const phieu = await prisma.phieuNhapKho.findUnique({
    where: { id },
    include: { chiTiet: { include: { vatTu: true } } },
  });
  if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(phieu);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    // ── Nếu có chiTiet → sửa toàn bộ phiếu (header + chi tiết + tồn kho) ──
    if (Array.isArray(body.chiTiet)) {
      type RowInput = {
        vatTuId: string;
        soLuongMua: number;
        donViMua: string;
        quyDoi: number;
        donViQuyDoi?: string; // đơn vị sau quy đổi (m, chiếc...)
        soLuong: number;
        donGia: number;
        vat?: number;   // thuế VAT % (0 | 5 | 8 | 10 ...)
        ghiChu?: string;
      };
      const rows: RowInput[] = body.chiTiet;
      // tongTien bao gồm cả VAT
      const tongTien = rows.reduce((s, r) => s + r.soLuongMua * r.donGia * (1 + (r.vat || 0) / 100), 0);

      // ── Phase 1: transaction tồn kho (không có CongNo để tránh timeout) ──
      let soPhieuCu = "";
      await prisma.$transaction(async (tx) => {
        const old = await tx.phieuNhapKho.findUnique({
          where: { id },
          include: { chiTiet: true },
        });
        if (!old) throw new Error("Không tìm thấy phiếu");
        soPhieuCu = old.soPhieu;

        // Đảo tồn kho cũ (trừ soLuongMua ra khỏi tonKho, dùng giá đã có VAT)
        for (const row of old.chiTiet) {
          const ton = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: row.vatTuId } });
          if (ton) {
            const slMuaCu = row.soLuongMua;
            const giaVonCu = row.donGia * (1 + (row.vat || 0) / 100);
            const newSL = Math.max(0, ton.soLuong - slMuaCu);
            const newGT = Math.max(0, ton.giaTriTon - slMuaCu * giaVonCu);
            const newGia = newSL > 0 ? newGT / newSL : ton.giaTrungBinh;
            await tx.tonKhoVatTu.update({
              where: { vatTuId: row.vatTuId },
              data: { soLuong: newSL, giaTrungBinh: newGia, giaTriTon: newGT },
            });
          }
        }

        // Xoá chi tiết cũ
        await tx.chiTietNhapKho.deleteMany({ where: { phieuId: id } });

        // Cập nhật header
        await tx.phieuNhapKho.update({
          where: { id },
          data: {
            soPhieu:    body.soPhieu    || undefined,
            ngay:       body.ngay       ? new Date(body.ngay) : undefined,
            nhaCC:      body.nhaCC      ?? undefined,
            tenNhaCC:   body.tenNhaCC   ?? undefined,
            soHoaDon:   body.soHoaDon   || null,
            ngayHoaDon: body.ngayHoaDon ? new Date(body.ngayHoaDon) : null,
            trangThai:  body.trangThai  ?? undefined,
            ghiChu:     body.ghiChu     || null,
            nguoiTao:   body.nguoiTao   || null,
            tongTien,
          },
        });

        // Tạo chi tiết mới + cập nhật tồn kho (dùng soLuongMua nhất quán với donGia)
        for (const row of rows) {
          await tx.chiTietNhapKho.create({
            data: {
              phieuId:     id,
              vatTuId:     row.vatTuId,
              soLuongMua:  row.soLuongMua,
              donViMua:    row.donViMua,
              quyDoi:      row.quyDoi,
              donViQuyDoi: row.donViQuyDoi || "",
              soLuong:     row.soLuong,
              donGia:      row.donGia,
              vat:         row.vat || 0,
              thanhTien:   row.soLuongMua * row.donGia * (1 + (row.vat || 0) / 100),
              ghiChu:      row.ghiChu || null,
            },
          });
          const slMua  = row.soLuongMua;
          const giaVon = row.donGia * (1 + (row.vat || 0) / 100);
          const existing = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: row.vatTuId } });
          if (existing) {
            const newSL = existing.soLuong + slMua;
            const newGT = existing.giaTriTon + slMua * giaVon;
            await tx.tonKhoVatTu.update({
              where: { vatTuId: row.vatTuId },
              data: { soLuong: newSL, giaTrungBinh: newSL > 0 ? newGT / newSL : giaVon, giaTriTon: newGT },
            });
          } else {
            await tx.tonKhoVatTu.create({
              data: { vatTuId: row.vatTuId, soLuong: slMua, giaTrungBinh: giaVon, giaTriTon: slMua * giaVon },
            });
          }
        }
      }, { maxWait: 10000, timeout: 30000 });

      // ── Phase 2: CongNo ngoài transaction (best-effort, không rollback phiếu nếu lỗi) ──
      try {
        const nccInfo = await prisma.nhaCungCap.findFirst({ where: { OR: [{ id: body.nhaCC }, { ma: body.nhaCC }] } });
        const soPhieuMoi = body.soPhieu || soPhieuCu;
        await prisma.congNo.deleteMany({ where: { soChungTu: soPhieuCu, loai: "mua_hang" } });
        await prisma.congNo.create({
          data: {
            nhaCC:     body.nhaCC,
            ngay:      body.ngay ? new Date(body.ngay) : new Date(),
            soChungTu: soPhieuMoi,
            dienGiai:  `Nhập hàng ${nccInfo?.ten || body.nhaCC}`,
            loai:      "mua_hang",
            soTien:    tongTien,
          },
        });
      } catch (congNoErr) {
        console.warn("[nhap-kho PATCH] CongNo update failed (non-fatal):", congNoErr);
      }

      const phieu = await prisma.phieuNhapKho.findUnique({
        where: { id },
        include: { chiTiet: { include: { vatTu: true } } },
      });
      return NextResponse.json(phieu);
    }

    // ── Chỉ sửa header (trangThai, ghiChu, soHoaDon…) ──
    const phieu = await prisma.phieuNhapKho.update({
      where: { id },
      data: {
        ...(body.trangThai  !== undefined && { trangThai: body.trangThai }),
        ...(body.ghiChu     !== undefined && { ghiChu: body.ghiChu || null }),
        ...(body.soHoaDon   !== undefined && { soHoaDon: body.soHoaDon || null }),
        ...(body.ngayHoaDon !== undefined && { ngayHoaDon: body.ngayHoaDon ? new Date(body.ngayHoaDon) : null }),
      },
      include: { chiTiet: { include: { vatTu: true } } },
    });
    return NextResponse.json(phieu);
  } catch (e: unknown) {
    console.error("[nhap-kho PATCH]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const phieu = await prisma.phieuNhapKho.findUnique({
      where: { id },
      include: { chiTiet: true },
    });
    if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      for (const row of phieu.chiTiet) {
        const ton = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: row.vatTuId } });
        if (ton) {
          const slMuaCu  = row.soLuongMua;
          const giaVonCu = row.donGia * (1 + (row.vat || 0) / 100);
          const newSL    = Math.max(0, ton.soLuong - slMuaCu);
          const newGT    = Math.max(0, ton.giaTriTon - slMuaCu * giaVonCu);
          const newGia   = newSL > 0 ? newGT / newSL : ton.giaTrungBinh;
          await tx.tonKhoVatTu.update({
            where: { vatTuId: row.vatTuId },
            data: { soLuong: newSL, giaTrungBinh: newGia, giaTriTon: newGT },
          });
        }
      }
      await tx.congNo.deleteMany({ where: { soChungTu: phieu.soPhieu, loai: "mua_hang" } });
      await tx.phieuNhapKho.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[nhap-kho DELETE]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

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
        soLuong: number;
        donGia: number;
        ghiChu?: string;
      };
      const rows: RowInput[] = body.chiTiet;
      const tongTien = rows.reduce((s, r) => s + r.soLuongMua * r.donGia, 0);

      const phieu = await prisma.$transaction(async (tx) => {
        // 1. Lấy chi tiết cũ để đảo tồn kho
        const old = await tx.phieuNhapKho.findUnique({
          where: { id },
          include: { chiTiet: true },
        });
        if (!old) throw new Error("Không tìm thấy phiếu");

        // 2. Đảo tồn kho cũ (reverse)
        for (const row of old.chiTiet) {
          const ton = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: row.vatTuId } });
          if (ton) {
            const newSL = Math.max(0, ton.soLuong - row.soLuong);
            // tính lại giá bình quân khi bỏ dòng cũ
            const oldGiaTriTon = ton.soLuong * ton.giaTrungBinh;
            const removedGiaTri = row.soLuong * row.donGia;
            const newGiaTri = Math.max(0, oldGiaTriTon - removedGiaTri);
            const newGia = newSL > 0 ? newGiaTri / newSL : ton.giaTrungBinh;
            await tx.tonKhoVatTu.update({
              where: { vatTuId: row.vatTuId },
              data: { soLuong: newSL, giaTrungBinh: newGia, giaTriTon: newSL * newGia },
            });
          }
        }

        // 3. Xoá chi tiết cũ
        await tx.chiTietNhapKho.deleteMany({ where: { phieuId: id } });

        // 4. Cập nhật header
        await tx.phieuNhapKho.update({
          where: { id },
          data: {
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

        // 5. Nhập chi tiết mới + cập nhật tồn kho (bình quân gia quyền)
        for (const row of rows) {
          await tx.chiTietNhapKho.create({
            data: {
              phieuId:    id,
              vatTuId:    row.vatTuId,
              soLuongMua: row.soLuongMua,
              donViMua:   row.donViMua,
              quyDoi:     row.quyDoi,
              soLuong:    row.soLuong,
              donGia:     row.donGia,
              thanhTien:  row.soLuongMua * row.donGia,
              ghiChu:     row.ghiChu || null,
            },
          });

          const existing = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: row.vatTuId } });
          if (existing) {
            const newSL = existing.soLuong + row.soLuong;
            const newGT = existing.giaTriTon + row.soLuong * row.donGia;
            const newGia = newSL > 0 ? newGT / newSL : row.donGia;
            await tx.tonKhoVatTu.update({
              where: { vatTuId: row.vatTuId },
              data: { soLuong: newSL, giaTrungBinh: newGia, giaTriTon: newGT },
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

        // 6. Cập nhật CongNo
        await tx.congNo.deleteMany({ where: { soChungTu: old.soPhieu, loai: "mua_hang" } });
        const nccInfo = await tx.nhaCungCap.findFirst({ where: { OR: [{ id: body.nhaCC }, { ma: body.nhaCC }] } });
        await tx.congNo.create({
          data: {
            nhaCC:     body.nhaCC,
            ngay:      body.ngay ? new Date(body.ngay) : new Date(),
            soChungTu: old.soPhieu,
            dienGiai:  `Nhập hàng ${nccInfo?.ten || body.nhaCC}`,
            loai:      "mua_hang",
            soTien:    tongTien,
          },
        });

        return tx.phieuNhapKho.findUnique({
          where: { id },
          include: { chiTiet: { include: { vatTu: true } } },
        });
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
          const newSoLuong = Math.max(0, ton.soLuong - row.soLuong);
          await tx.tonKhoVatTu.update({
            where: { vatTuId: row.vatTuId },
            data: { soLuong: newSoLuong, giaTriTon: newSoLuong * ton.giaTrungBinh },
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

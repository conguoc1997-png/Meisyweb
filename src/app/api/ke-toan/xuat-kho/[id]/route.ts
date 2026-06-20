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

    // ── Sửa phiếu ──
    if (body.action === "edit") {
      const phieu = await prisma.phieuXuatKho.findUnique({
        where: { id },
        include: { chiTiet: { select: { vatTuId: true } } },
      });
      if (!phieu) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
      if ((phieu as { trangThai?: string }).trangThai === "da_huy")
        return NextResponse.json({ error: "Không thể sửa phiếu đã hủy" }, { status: 400 });

      const oldVatTuIds = [...new Set(phieu.chiTiet.map((c: { vatTuId: string }) => c.vatTuId))];

      type ChiTietInput = { vatTuId: string; soLuong: number; donGia: number; ghiChu?: string };
      const chiTiet: ChiTietInput[] = body.chiTiet ?? [];
      const newVatTuIds = [...new Set(chiTiet.map((c: ChiTietInput) => c.vatTuId))];
      const allVatTuIds = [...new Set([...oldVatTuIds, ...newVatTuIds])];

      // 1. Cập nhật thông tin phiếu
      await prisma.phieuXuatKho.update({
        where: { id },
        data: {
          ngay:       body.ngay ? new Date(body.ngay) : undefined,
          hangCat:    body.hangCat ?? undefined,
          soSanPham:  body.soSanPham != null ? body.soSanPham : undefined,
          lyDo:       body.lyDo ?? undefined,
          ghiChu:     body.ghiChu ?? null,
        },
      });

      // 2. Xóa chiTiet cũ, tạo mới
      await prisma.phieuXuatChiTiet.deleteMany({ where: { phieuXuatId: id } });
      await prisma.phieuXuatChiTiet.createMany({
        data: chiTiet.map((c: ChiTietInput) => ({
          phieuXuatId: id,
          vatTuId:     c.vatTuId,
          soLuong:     c.soLuong,
          donGia:      c.donGia,
          thanhTien:   c.soLuong * c.donGia,
          ghiChu:      c.ghiChu || null,
        })),
      });

      // 3. Recalc tồn kho cho tất cả vatTu liên quan
      if (allVatTuIds.length > 0) await recalcVatTuIds(allVatTuIds);

      return NextResponse.json({ ok: true, message: "Đã cập nhật phiếu xuất" });
    }

    // Hủy phiếu: đánh dấu da_huy + hoàn tồn kho
    if (body.trangThai === "da_huy") {
      const phieu = await prisma.phieuXuatKho.findUnique({
        where: { id },
        include: { chiTiet: true },
      });
      if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
      if ((phieu as { trangThai?: string }).trangThai === "da_huy")
        return NextResponse.json({ error: "Phiếu đã hủy trước đó" }, { status: 400 });

      const vatTuIds = [...new Set(phieu.chiTiet.map(c => c.vatTuId))];

      // Đánh dấu hủy
      await prisma.phieuXuatKho.update({
        where: { id },
        data: {
          trangThai: "da_huy",
          lyHuy: body.lyHuy || "Hủy phiếu",
          ngayHuy: new Date(),
          nguoiHuy: body.nguoiHuy || null,
        } as Record<string, unknown>,
      });

      // Recalc lại tồn kho (hoàn ngược xuất)
      if (vatTuIds.length > 0) await recalcVatTuIds(vatTuIds);

      return NextResponse.json({ ok: true, message: "Đã hủy phiếu và hoàn tồn kho" });
    }

    return NextResponse.json({ error: "Không hỗ trợ thao tác này" }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const phieu = await prisma.phieuXuatKho.findUnique({
    where: { id },
    include: { chiTiet: { include: { vatTu: true } } },
  });
  if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(phieu);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const phieu = await prisma.phieuXuatKho.findUnique({
      where: { id },
      include: { chiTiet: { select: { vatTuId: true } } },
    });
    if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

    const vatTuIds = [...new Set(phieu.chiTiet.map(c => c.vatTuId))];

    // 1. Xóa phiếu (cascade chiTiet) — không dùng interactive transaction
    await prisma.phieuXuatKho.delete({ where: { id } });

    // 2. Reset xuatHoaDonDa nếu phiếu gắn với lô cắt
    if (phieu.loCatId) {
      await prisma.loCat.update({
        where: { id: phieu.loCatId },
        data:  { xuatHoaDonDa: false },
      }).catch(() => {});
    }

    // 3. Recalc tồn kho đúng: nhap(đvMua) − xuat(đvCơBản)/quyDoi
    if (vatTuIds.length > 0) {
      await recalcVatTuIds(vatTuIds);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

async function recalcVatTuIds(vatTuIds: string[]) {
  // Chạy 3 query song song để giảm thời gian
  const [quyDoiInfos, nhapInfos, xuatInfos] = await Promise.all([
    // quyDoi mới nhất per vatTuId
    prisma.chiTietNhapKho.findMany({
      where:    { vatTuId: { in: vatTuIds } },
      select:   { vatTuId: true, quyDoi: true },
      orderBy:  { phieu: { ngay: "desc" } },
      distinct: ["vatTuId"],
    }),
    // Tổng nhập
    prisma.chiTietNhapKho.findMany({
      where:  { vatTuId: { in: vatTuIds } },
      select: { vatTuId: true, soLuongMua: true, donGia: true, vat: true },
    }),
    // Tổng xuất (bỏ phiếu đã hủy)
    prisma.phieuXuatChiTiet.findMany({
      where:  {
        vatTuId: { in: vatTuIds },
        phieu: { trangThai: { not: "da_huy" } } as Record<string, unknown>,
      },
      select: { vatTuId: true, soLuong: true },
    }),
  ]);
  const quyDoiMap = new Map(quyDoiInfos.map(r => [r.vatTuId, r.quyDoi ?? 1]));

  type TonInfo = { soLuongNhap: number; giaTriNhap: number; soLuongXuatBase: number };
  const map = new Map<string, TonInfo>();
  for (const r of nhapInfos) {
    const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuatBase: 0 };
    cur.soLuongNhap += r.soLuongMua;
    cur.giaTriNhap  += r.soLuongMua * r.donGia * (1 + (r.vat || 0) / 100);
    map.set(r.vatTuId, cur);
  }
  for (const r of xuatInfos) {
    const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuatBase: 0 };
    cur.soLuongXuatBase += r.soLuong;
    map.set(r.vatTuId, cur);
  }

  await Promise.all([...map.entries()].map(([vatTuId, d]) => {
    const quyDoi       = quyDoiMap.get(vatTuId) ?? 1;
    const soLuong      = Math.max(0, d.soLuongNhap - d.soLuongXuatBase / quyDoi);
    const giaTrungBinh = d.soLuongNhap > 0 ? d.giaTriNhap / d.soLuongNhap : 0;
    const giaTriTon    = soLuong * giaTrungBinh;
    return prisma.tonKhoVatTu.upsert({
      where:  { vatTuId },
      update: { soLuong, giaTrungBinh, giaTriTon },
      create: { vatTuId, soLuong, giaTrungBinh, giaTriTon },
    });
  }));
}

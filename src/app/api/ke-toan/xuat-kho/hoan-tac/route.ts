export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ke-toan/xuat-kho/hoan-tac
 * body: { loCatId: string }
 *
 * Hoàn tác xuất hóa đơn:
 *   1. Xóa PhieuXuatKho (cascade xóa luôn PhieuXuatChiTiet)
 *   2. Tính lại TonKhoVatTu từ đầu
 *   3. Set LoCat.xuatHoaDonDa = false
 */
export async function POST(req: NextRequest) {
  try {
    const { loCatId } = await req.json();
    if (!loCatId) return NextResponse.json({ error: "Thiếu loCatId" }, { status: 400 });

    // 1. Tìm phiếu xuất của lô này
    const phieu = await prisma.phieuXuatKho.findFirst({
      where: { loCatId },
      include: { chiTiet: { select: { vatTuId: true } } },
    });

    const vatTuIds = phieu ? [...new Set(phieu.chiTiet.map(c => c.vatTuId))] : [];

    // 2. Xóa phiếu xuất (cascade xóa chiTiet)
    if (phieu) {
      await prisma.phieuXuatKho.delete({ where: { id: phieu.id } });
    }

    // 3. Set xuatHoaDonDa = false
    await prisma.loCat.update({
      where: { id: loCatId },
      data:  { xuatHoaDonDa: false },
    });

    // 4. Tính lại TonKhoVatTu cho các vatTu đã bị ảnh hưởng
    if (vatTuIds.length > 0) {
      await recalcVatTuIds(vatTuIds);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[xuat-kho/hoan-tac POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

async function recalcVatTuIds(vatTuIds: string[]) {
  const nhapInfos = await prisma.chiTietNhapKho.findMany({
    where:  { vatTuId: { in: vatTuIds } },
    select: { vatTuId: true, soLuongMua: true, donGia: true, vat: true, quyDoi: true },
  });
  const xuatInfos = await prisma.phieuXuatChiTiet.findMany({
    where:  { vatTuId: { in: vatTuIds } },
    select: { vatTuId: true, soLuong: true },
  });

  const quyDoiMap = new Map<string, number>();
  for (const r of nhapInfos) {
    if (!quyDoiMap.has(r.vatTuId)) quyDoiMap.set(r.vatTuId, r.quyDoi ?? 1);
  }

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

  for (const [vatTuId, d] of map.entries()) {
    const quyDoi       = quyDoiMap.get(vatTuId) ?? 1;
    const soLuong      = Math.max(0, d.soLuongNhap - d.soLuongXuatBase / quyDoi);
    const giaTrungBinh = d.soLuongNhap > 0 ? d.giaTriNhap / d.soLuongNhap : 0;
    await prisma.tonKhoVatTu.upsert({
      where:  { vatTuId },
      update: { soLuong, giaTrungBinh, giaTriTon: soLuong * giaTrungBinh },
      create: { vatTuId, soLuong, giaTrungBinh, giaTriTon: soLuong * giaTrungBinh },
    });
  }
}

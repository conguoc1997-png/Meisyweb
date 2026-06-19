export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ke-toan/ton-kho/recalc
 *
 * Tính lại toàn bộ TonKhoVatTu từ đầu dựa trên lịch sử:
 *   soLuong_ton    = Σ(chiTietNhap.soLuongMua) − Σ(chiTietXuat.soLuong)
 *   giaTriNhap     = Σ(chiTietNhap.soLuongMua × chiTietNhap.donGia)
 *   giaTrungBinh   = giaTriNhap / soLuong_nhap  (bình quân gia quyền toàn bộ)
 *   giaTriTon      = soLuong_ton × giaTrungBinh
 */
export async function POST() {
  try {
    // 1. quyDoi mới nhất per vatTuId — PHẢI lấy từ nhập mới nhất theo ngày
    const quyDoiInfos = await prisma.chiTietNhapKho.findMany({
      select:   { vatTuId: true, quyDoi: true },
      orderBy:  { phieu: { ngay: "desc" } },
      distinct: ["vatTuId"],
    });
    const quyDoiMap = new Map(quyDoiInfos.map(r => [r.vatTuId, r.quyDoi ?? 1]));

    // 2. Nhập kho: soLuongMua theo ĐV MUA, quyDoi = số đv cơ bản / 1 đv mua
    const allNhap = await prisma.chiTietNhapKho.findMany({
      select: { vatTuId: true, soLuongMua: true, donGia: true, vat: true },
    });

    // 3. Xuất kho: soLuong theo ĐV CƠ BẢN (chiếc, m, bộ...)
    //    Lọc bỏ orphaned records (phieuXuatKho đã xóa nhưng chiTiet còn lại do cascade fail)
    const allXuat = await prisma.phieuXuatChiTiet.findMany({
      where:  { phieu: { soPhieu: { not: "" } } },
      select: { vatTuId: true, soLuong: true },
    });

    type TonInfo = { soLuongNhap: number; giaTriNhap: number; soLuongXuatBase: number };
    const map = new Map<string, TonInfo>();

    for (const r of allNhap) {
      const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuatBase: 0 };
      cur.soLuongNhap += r.soLuongMua;
      cur.giaTriNhap  += r.soLuongMua * r.donGia * (1 + (r.vat || 0) / 100);
      map.set(r.vatTuId, cur);
    }
    for (const r of allXuat) {
      const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuatBase: 0 };
      cur.soLuongXuatBase += r.soLuong;
      map.set(r.vatTuId, cur);
    }

    // 4. Upsert TonKhoVatTu song song
    // ton (đv mua) = nhap (đv mua) − xuat_base / quyDoi
    const entries = [...map.entries()];
    await Promise.all(entries.map(([vatTuId, d]) => {
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

    return NextResponse.json({ ok: true, updated: entries.length });
  } catch (e: unknown) {
    console.error("[ton-kho recalc]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

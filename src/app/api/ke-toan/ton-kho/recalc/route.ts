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
    // 1. Tổng hợp toàn bộ nhập kho theo vatTuId
    const nhapRows = await prisma.chiTietNhapKho.groupBy({
      by: ["vatTuId"],
      _sum: { soLuongMua: true },
    });

    // Cần giaTriNhap = Σ(soLuongMua × donGia × (1 + vat/100)) — groupBy không làm được, query thủ công
    const allNhap = await prisma.chiTietNhapKho.findMany({
      select: { vatTuId: true, soLuongMua: true, donGia: true, vat: true },
    });

    // 2. Tổng hợp toàn bộ xuất kho theo vatTuId
    const xuatRows = await prisma.phieuXuatChiTiet.groupBy({
      by: ["vatTuId"],
      _sum: { soLuong: true },
    });

    // --- Build maps ---
    type TonMap = {
      soLuongNhap: number;
      giaTriNhap:  number;
      soLuongXuat: number;
    };
    const map = new Map<string, TonMap>();

    for (const r of allNhap) {
      const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuat: 0 };
      cur.soLuongNhap += r.soLuongMua;
      // Giá trị nhập = giá × (1 + VAT%) để khớp với thành tiền thực tế
      cur.giaTriNhap  += r.soLuongMua * r.donGia * (1 + (r.vat || 0) / 100);
      map.set(r.vatTuId, cur);
    }

    for (const r of xuatRows) {
      const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuat: 0 };
      cur.soLuongXuat += r._sum.soLuong ?? 0;
      map.set(r.vatTuId, cur);
    }

    // Ensure nhapRows vatTuIds are seeded (even if no xuất)
    for (const r of nhapRows) {
      if (!map.has(r.vatTuId)) {
        map.set(r.vatTuId, { soLuongNhap: r._sum.soLuongMua ?? 0, giaTriNhap: 0, soLuongXuat: 0 });
      }
    }

    // 3. Upsert TonKhoVatTu cho mỗi vatTuId
    let updated = 0;
    for (const [vatTuId, d] of map.entries()) {
      const soLuong       = Math.max(0, d.soLuongNhap - d.soLuongXuat);
      const giaTrungBinh  = d.soLuongNhap > 0 ? d.giaTriNhap / d.soLuongNhap : 0;
      const giaTriTon     = soLuong * giaTrungBinh;

      await prisma.tonKhoVatTu.upsert({
        where:  { vatTuId },
        update: { soLuong, giaTrungBinh, giaTriTon },
        create: { vatTuId, soLuong, giaTrungBinh, giaTriTon },
      });
      updated++;
    }

    return NextResponse.json({ ok: true, updated });
  } catch (e: unknown) {
    console.error("[ton-kho recalc]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

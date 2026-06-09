export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ke-toan/xuat-kho/tu-dinh-muc
 *
 * Tự động tạo phiếu xuất kho dựa trên định mức NPL của lô cắt.
 * Logic:
 *   1. Lấy lô cắt → hangCat (SKU), soSanPham (hangThucTe ưu tiên)
 *   2. Lấy định mức: per-SKU + CHUNG, merge theo cột (loai+nhom)
 *   3. Tính soLuong = dm.soLuong × (1 + haoHui/100) × soSanPham
 *   4. Tạo PhieuXuatKho + trừ TonKhoVatTu trong transaction
 *
 * body: { loCatId: string }
 * Idempotent: nếu phiếu đã tồn tại → trả về phiếu cũ, không tạo mới.
 */
export async function POST(req: NextRequest) {
  try {
    const { loCatId } = await req.json();
    if (!loCatId) return NextResponse.json({ error: "Thiếu loCatId" }, { status: 400 });

    // 1. Lấy lô cắt
    const lo = await prisma.loCat.findUnique({ where: { id: loCatId } });
    if (!lo) return NextResponse.json({ error: "Không tìm thấy lô cắt" }, { status: 404 });

    const sku = lo.hangCat;
    const soSP = lo.hangThucTe ?? lo.soSanPham ?? 0;
    if (soSP <= 0) {
      return NextResponse.json({ error: "Lô cắt chưa có số lượng sản phẩm" }, { status: 400 });
    }

    // 2. Idempotent check — phiếu đã tồn tại?
    const existing = await prisma.phieuXuatKho.findFirst({ where: { loCatId } });
    if (existing) {
      return NextResponse.json({ ok: true, phieu: existing, skipped: true });
    }

    // 3. Lấy định mức
    const allDMs = await prisma.dinhMucNPL.findMany({
      where: { hangCat: { in: [sku, "__CHUNG__"] } },
      include: { vatTu: true },
    });
    const chungItems = allDMs.filter(d => d.hangCat === "__CHUNG__");
    const skuItems   = allDMs.filter(d => d.hangCat === sku);

    // 4. Merge theo cột (loai + nhom)
    //    Per-SKU override toàn bộ CHUNG trong cùng cột
    const colKey = (loai: string, nhom: string | null) => `${loai}|${nhom ?? ""}`;

    const chungByCol = new Map<string, typeof chungItems>();
    for (const dm of chungItems) {
      const k = colKey(dm.vatTu.loai, dm.vatTu.nhom);
      if (!chungByCol.has(k)) chungByCol.set(k, []);
      chungByCol.get(k)!.push(dm);
    }
    const skuByCol = new Map<string, typeof skuItems>();
    for (const dm of skuItems) {
      const k = colKey(dm.vatTu.loai, dm.vatTu.nhom);
      if (!skuByCol.has(k)) skuByCol.set(k, []);
      skuByCol.get(k)!.push(dm);
    }

    const usedItems: typeof allDMs = [];
    // Các cột trong CHUNG — dùng SKU override nếu có
    for (const [k, items] of chungByCol.entries()) {
      usedItems.push(...(skuByCol.get(k) ?? items));
    }
    // Các cột chỉ có trong SKU (không có CHUNG)
    for (const [k, items] of skuByCol.entries()) {
      if (!chungByCol.has(k)) usedItems.push(...items);
    }

    // 5. Deduplicate vatTuId (trong cùng cột có thể có nhiều vatTu — giữ tất cả)
    const vatTuList: { vatTuId: string; soLuong: number }[] = usedItems.map(dm => ({
      vatTuId: dm.vatTuId,
      soLuong: dm.soLuong * (1 + (dm.haoHui ?? 0) / 100) * soSP,
    }));

    if (vatTuList.length === 0) {
      return NextResponse.json({ error: "Chưa có định mức cho SKU này" }, { status: 400 });
    }

    // 6. Lấy giá vốn bình quân
    const vatTuIds = [...new Set(vatTuList.map(v => v.vatTuId))];
    const tonKhos  = await prisma.tonKhoVatTu.findMany({
      where: { vatTuId: { in: vatTuIds } },
    });
    const tonMap = new Map(tonKhos.map(t => [t.vatTuId, t]));

    // 7. Tạo phiếu + trừ tồn kho trong transaction
    const soPhieu = `PX-${sku}-${Date.now()}`;
    const ngay    = new Date();

    const phieu = await prisma.$transaction(async (tx) => {
      const p = await tx.phieuXuatKho.create({
        data: {
          soPhieu,
          loCatId,
          hangCat: sku,
          soSanPham: soSP,
          ngay,
          lyDo: "san_xuat",
          ghiChu: `Tự động từ định mức — lô ${sku}`,
          chiTiet: {
            create: vatTuList.map(v => {
              const ton = tonMap.get(v.vatTuId);
              const donGia = ton?.giaTrungBinh ?? 0;
              return {
                vatTuId:   v.vatTuId,
                soLuong:   v.soLuong,
                donGia,
                thanhTien: v.soLuong * donGia,
              };
            }),
          },
        },
        include: { chiTiet: { include: { vatTu: true } } },
      });

      // Trừ tồn kho
      for (const v of vatTuList) {
        const ton = tonMap.get(v.vatTuId);
        if (ton) {
          const newSL = Math.max(0, ton.soLuong - v.soLuong);
          await tx.tonKhoVatTu.update({
            where: { vatTuId: v.vatTuId },
            data: { soLuong: newSL, giaTriTon: newSL * ton.giaTrungBinh },
          });
        }
      }

      return p;
    });

    return NextResponse.json({ ok: true, phieu }, { status: 201 });
  } catch (e: unknown) {
    console.error("[xuat-kho/tu-dinh-muc POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

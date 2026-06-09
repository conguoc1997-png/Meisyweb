export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ke-toan/xuat-kho/tu-dinh-muc
 *
 * Tạo phiếu xuất kho từ định mức NPL của lô cắt.
 * Không dùng interactive transaction (không tương thích Supabase PgBouncer).
 * Thay bằng sequential operations — idempotent qua loCatId check.
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

    // 2. Idempotent check
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

    // 4. Merge theo cột (loai + nhom): SKU override CHUNG
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
    for (const [k, items] of chungByCol.entries()) {
      usedItems.push(...(skuByCol.get(k) ?? items));
    }
    for (const [k, items] of skuByCol.entries()) {
      if (!chungByCol.has(k)) usedItems.push(...items);
    }

    if (usedItems.length === 0) {
      return NextResponse.json({ error: "Chưa có định mức cho SKU này" }, { status: 400 });
    }

    // 5. Tính soLuong cần xuất
    const vatTuList: { vatTuId: string; soLuong: number }[] = usedItems.map(dm => ({
      vatTuId: dm.vatTuId,
      soLuong: dm.soLuong * (1 + (dm.haoHui ?? 0) / 100) * soSP,
    }));

    // 6. Lấy giá vốn bình quân
    const vatTuIds = [...new Set(vatTuList.map(v => v.vatTuId))];
    const tonKhos  = await prisma.tonKhoVatTu.findMany({ where: { vatTuId: { in: vatTuIds } } });
    const tonMap   = new Map(tonKhos.map(t => [t.vatTuId, t]));

    // 7. Tạo phiếu xuất (không dùng interactive tx — sequential)
    const soPhieu = `PX-${sku}-${Date.now()}`;

    const phieu = await prisma.phieuXuatKho.create({
      data: {
        soPhieu,
        loCatId,
        hangCat: sku,
        soSanPham: soSP,
        ngay: new Date(),
        lyDo: "san_xuat",
        ghiChu: `Tự động từ định mức — lô ${sku}`,
        chiTiet: {
          create: vatTuList.map(v => {
            const ton    = tonMap.get(v.vatTuId);
            const donGia = ton?.giaTrungBinh ?? 0;
            return { vatTuId: v.vatTuId, soLuong: v.soLuong, donGia, thanhTien: v.soLuong * donGia };
          }),
        },
      },
      include: { chiTiet: true },
    });

    // 8. Trừ tồn kho — sequential updates (không cần transaction)
    for (const v of vatTuList) {
      const ton = tonMap.get(v.vatTuId);
      if (!ton) continue;
      const newSL = Math.max(0, ton.soLuong - v.soLuong);
      await prisma.tonKhoVatTu.update({
        where:  { vatTuId: v.vatTuId },
        data:   { soLuong: newSL, giaTriTon: newSL * ton.giaTrungBinh },
      });
    }

    return NextResponse.json({ ok: true, phieu }, { status: 201 });
  } catch (e: unknown) {
    console.error("[xuat-kho/tu-dinh-muc POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

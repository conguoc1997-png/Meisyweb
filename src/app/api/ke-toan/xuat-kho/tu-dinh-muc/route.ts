export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ke-toan/xuat-kho/tu-dinh-muc
 *
 * TonKhoVatTu.soLuong lưu theo ĐƠN VỊ MUA (gói, cuộn...).
 * DinhMucNPL.soLuong lưu theo đơn vị cơ bản (chiếc, m...).
 * → Cần quyDoi từ nhập kho để convert trước khi trừ tồn.
 *
 * soLuongXuat (đv mua) = dm.soLuong × (1+haoHui%) × soSP / quyDoi
 */
export async function POST(req: NextRequest) {
  try {
    const { loCatId } = await req.json();
    if (!loCatId) return NextResponse.json({ error: "Thiếu loCatId" }, { status: 400 });

    // 1. Lấy lô cắt
    const lo = await prisma.loCat.findUnique({ where: { id: loCatId } });
    if (!lo) return NextResponse.json({ error: "Không tìm thấy lô cắt" }, { status: 404 });

    const sku  = lo.hangCat;
    const soSP = lo.hangThucTe ?? lo.soSanPham ?? 0;
    if (soSP <= 0) {
      return NextResponse.json({ error: "Lô cắt chưa có số lượng sản phẩm" }, { status: 400 });
    }

    // 2. Idempotent check
    const existing = await prisma.phieuXuatKho.findFirst({ where: { loCatId } });
    if (existing) return NextResponse.json({ ok: true, phieu: existing, skipped: true });

    // 3. Lấy định mức
    const allDMs = await prisma.dinhMucNPL.findMany({
      where: { hangCat: { in: [sku, "__CHUNG__"] } },
      include: { vatTu: true },
    });
    const chungItems = allDMs.filter(d => d.hangCat === "__CHUNG__");
    const skuItems   = allDMs.filter(d => d.hangCat === sku);

    // 4. Merge theo cột (loai+nhom): SKU override CHUNG
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

    // 5. Lấy quyDoi (đvị mua → đvị cơ bản) cho từng vatTu từ lịch sử nhập kho
    const vatTuIds = [...new Set(usedItems.map(d => d.vatTuId))];
    const [tonKhos, nhapInfos] = await Promise.all([
      prisma.tonKhoVatTu.findMany({ where: { vatTuId: { in: vatTuIds } } }),
      prisma.chiTietNhapKho.findMany({
        where:    { vatTuId: { in: vatTuIds } },
        select:   { vatTuId: true, quyDoi: true },
        orderBy:  { phieu: { ngay: "desc" } },
        distinct: ["vatTuId"],
      }),
    ]);
    const tonMap    = new Map(tonKhos.map(t => [t.vatTuId, t]));
    const quyDoiMap = new Map(nhapInfos.map(n => [n.vatTuId, n.quyDoi ?? 1]));

    // 6. Tính soLuong xuất theo ĐƠN VỊ MUA (để khớp với TonKhoVatTu.soLuong)
    //    soLuongXuat_dvMua = dm.soLuong × (1+haoHui%) × soSP / quyDoi
    const vatTuList: { vatTuId: string; soLuongBase: number; soLuongDvMua: number }[] =
      usedItems.map(dm => {
        const quyDoi      = quyDoiMap.get(dm.vatTuId) ?? 1;
        const soLuongBase = dm.soLuong * (1 + (dm.haoHui ?? 0) / 100) * soSP;
        return { vatTuId: dm.vatTuId, soLuongBase, soLuongDvMua: soLuongBase / quyDoi };
      });

    // 7. Tạo phiếu xuất (soLuong lưu theo đv mua — nhất quán với nhập kho)
    const soPhieu = `PX-${sku}-${Date.now()}`;
    const phieu = await prisma.phieuXuatKho.create({
      data: {
        soPhieu,
        loCatId,
        hangCat:   sku,
        soSanPham: soSP,
        ngay:      new Date(),
        lyDo:      "san_xuat",
        ghiChu:    `Tự động từ định mức — lô ${sku}`,
        chiTiet: {
          create: vatTuList.map(v => {
            const ton    = tonMap.get(v.vatTuId);
            const donGia = ton?.giaTrungBinh ?? 0;
            return {
              vatTuId:   v.vatTuId,
              soLuong:   v.soLuongDvMua,   // đv mua
              donGia,
              thanhTien: v.soLuongDvMua * donGia,
            };
          }),
        },
      },
      include: { chiTiet: true },
    });

    // 8. Trừ TonKhoVatTu (cũng theo đv mua)
    for (const v of vatTuList) {
      const ton = tonMap.get(v.vatTuId);
      if (!ton) continue;
      const newSL = Math.max(0, ton.soLuong - v.soLuongDvMua);
      await prisma.tonKhoVatTu.update({
        where: { vatTuId: v.vatTuId },
        data:  { soLuong: newSL, giaTriTon: newSL * ton.giaTrungBinh },
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

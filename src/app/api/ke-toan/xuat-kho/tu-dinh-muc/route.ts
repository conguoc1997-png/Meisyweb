export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ke-toan/xuat-kho/tu-dinh-muc
 *
 * Tạo phiếu xuất kho từ định mức NPL.
 * PhieuXuatChiTiet.soLuong lưu theo ĐƠN VỊ CƠ BẢN (chiếc, m, bộ...).
 * TonKhoVatTu được tính lại bởi recalc (nhập - xuất/quyDoi).
 *
 * Điều kiện: định mức phải có VẢI mới được xuất.
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

    // 2. Idempotent check — nếu phiếu đã tồn tại, đảm bảo xuatHoaDonDa=true
    const existing = await prisma.phieuXuatKho.findFirst({ where: { loCatId } });
    if (existing) {
      // Đảm bảo loCat được đánh dấu (phòng trường hợp PATCH riêng bị lỗi trước đó)
      await prisma.loCat.update({
        where: { id: loCatId },
        data:  { xuatHoaDonDa: true },
      }).catch(() => {});
      return NextResponse.json({ ok: true, phieu: existing, skipped: true });
    }

    // 3. Lấy định mức
    const allDMs = await prisma.dinhMucNPL.findMany({
      where: { hangCat: { in: [sku, "__CHUNG__"] } },
      include: { vatTu: true },
    });
    const chungItems = allDMs.filter(d => d.hangCat === "__CHUNG__");
    const skuItems   = allDMs.filter(d => d.hangCat === sku);

    // 4. Merge theo cột (loai+nhom): SKU override CHUNG
    // Một số cột là "tick phát sinh" (shared:false trong trang Định mức NPL) — ví dụ
    // Giặt Màu, Giặt VS: dòng CHUNG chỉ dùng để gợi ý VatTu nguồn cho UI, KHÔNG được
    // áp dụng mặc định cho mọi SKU. Chỉ SKU nào tự tick (có dòng riêng hangCat=SKU)
    // mới được tính. Phải đồng bộ với COLUMNS trong src/app/ke-toan/dinh-muc/page.tsx.
    const colKey = (loai: string, nhom: string | null) => `${loai}|${nhom ?? ""}`;
    const NO_CHUNG_FALLBACK = new Set([
      colKey("hoan_thien", "giat_mau"),
      colKey("hoan_thien", "giat_vi_sinh"),
    ]);

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
      const skuOverride = skuByCol.get(k);
      if (skuOverride) {
        usedItems.push(...skuOverride);
      } else if (!NO_CHUNG_FALLBACK.has(k)) {
        usedItems.push(...items);
      }
      // NO_CHUNG_FALLBACK + chưa tick riêng cho SKU này → bỏ qua, không xuất
    }
    for (const [k, items] of skuByCol.entries()) {
      if (!chungByCol.has(k)) usedItems.push(...items);
    }

    if (usedItems.length === 0) {
      return NextResponse.json({ error: "Chưa có định mức cho SKU này" }, { status: 400 });
    }

    // 5. Kiểm tra vải — bắt buộc phải có trước khi xuất
    const hasVai = usedItems.some(dm => dm.vatTu.loai === "vai");
    if (!hasVai) {
      return NextResponse.json({
        error: "Chưa có định mức VẢI cho SKU này. Vui lòng thêm vải vào định mức trước khi xuất.",
      }, { status: 400 });
    }

    // 6. Tính soLuong theo ĐƠN VỊ CƠ BẢN (chiếc, m, bộ...) — không chia quyDoi
    const vatTuIds  = [...new Set(usedItems.map(d => d.vatTuId))];

    // Lấy quyDoi mới nhất để quy đổi giá: donGia_base = giaTrungBinh(dvMua) / quyDoi
    const [tonKhos, quyDoiForPrice] = await Promise.all([
      prisma.tonKhoVatTu.findMany({ where: { vatTuId: { in: vatTuIds } } }),
      prisma.chiTietNhapKho.findMany({
        where:    { vatTuId: { in: vatTuIds } },
        select:   { vatTuId: true, quyDoi: true },
        orderBy:  { phieu: { ngay: "desc" } },
        distinct: ["vatTuId"],
      }),
    ]);
    const tonMap    = new Map(tonKhos.map(t => [t.vatTuId, t]));
    const quyDoiPriceMap = new Map(quyDoiForPrice.map(r => [r.vatTuId, r.quyDoi ?? 1]));

    const vatTuList = usedItems.map(dm => ({
      vatTuId:  dm.vatTuId,
      soLuong:  dm.soLuong * (1 + (dm.haoHui ?? 0) / 100) * soSP, // đv cơ bản
    }));

    // 7. Tạo phiếu xuất (soLuong lưu theo đv cơ bản)
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
            const quyDoi = quyDoiPriceMap.get(v.vatTuId) ?? 1;
            // giaTrungBinh lưu theo đv MUA → quy đổi về đv CƠ BẢN để nhân với soLuong(đv cơ bản)
            // donGia_base = giaTrungBinh(dvMua) / quyDoi(dvBase per dvMua)
            const donGia = ton ? (ton.giaTrungBinh / quyDoi) : 0;
            return { vatTuId: v.vatTuId, soLuong: v.soLuong, donGia, thanhTien: v.soLuong * donGia };
          }),
        },
      },
      include: { chiTiet: true },
    });

    // 8. Đánh dấu lô cắt đã xuất hóa đơn (atomic với tạo phiếu)
    await prisma.loCat.update({
      where: { id: loCatId },
      data:  { xuatHoaDonDa: true },
    }).catch(() => {}); // non-fatal nếu field không tồn tại

    // 9. Tính lại TonKhoVatTu từ đầu (nhập - xuất/quyDoi)
    await recalcVatTuIds(vatTuIds);

    return NextResponse.json({ ok: true, phieu }, { status: 201 });
  } catch (e: unknown) {
    console.error("[xuat-kho/tu-dinh-muc POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

/**
 * Tính lại TonKhoVatTu cho danh sách vatTuIds.
 * nhập lưu theo đv mua (soLuongMua), xuất lưu theo đv cơ bản (soLuong).
 * Công thức: ton_mua = Σ nhap.soLuongMua − Σ (xuat.soLuong / quyDoi)
 */
async function recalcVatTuIds(vatTuIds: string[]) {
  // quyDoi mới nhất per vatTuId (lấy từ nhập mới nhất theo ngày)
  const quyDoiInfos = await prisma.chiTietNhapKho.findMany({
    where:    { vatTuId: { in: vatTuIds } },
    select:   { vatTuId: true, quyDoi: true },
    orderBy:  { phieu: { ngay: "desc" } },
    distinct: ["vatTuId"],
  });
  const quyDoiMap = new Map(quyDoiInfos.map(r => [r.vatTuId, r.quyDoi ?? 1]));

  const nhapInfos = await prisma.chiTietNhapKho.findMany({
    where:    { vatTuId: { in: vatTuIds } },
    select:   { vatTuId: true, soLuongMua: true, donGia: true, vat: true },
  });
  // Lọc bỏ orphaned records (phiếu cha đã xóa nhưng chiTiet còn lại do cascade fail)
  const xuatInfos = await prisma.phieuXuatChiTiet.findMany({
    where:  { vatTuId: { in: vatTuIds }, phieu: { soPhieu: { not: "" } } },
    select: { vatTuId: true, soLuong: true },
  });

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

  // Sequential upserts — tránh connection pool timeout (Supabase limit=1)
  for (const [vatTuId, d] of map.entries()) {
    const quyDoi       = quyDoiMap.get(vatTuId) ?? 1;
    const soLuong      = Math.max(0, d.soLuongNhap - d.soLuongXuatBase / quyDoi);
    const giaTrungBinh = d.soLuongNhap > 0 ? d.giaTriNhap / d.soLuongNhap : 0;
    const giaTriTon    = soLuong * giaTrungBinh;
    await prisma.tonKhoVatTu.upsert({
      where:  { vatTuId },
      update: { soLuong, giaTrungBinh, giaTriTon },
      create: { vatTuId, soLuong, giaTrungBinh, giaTriTon },
    });
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SuggestRow = {
  type: "vai" | "phu_lieu";
  vatTuId: string | null;
  vatTu: { id: string; ma: string; ten: string; loai: string; donVi: string; donViMua?: string; quyDoi?: number; nhom: string | null; tonKho: { soLuong: number; giaTrungBinh: number; giaTriTon: number } | null } | null;
  maVai?: string;
  soLuong: number;
  donGia: number;
  ghiChu: string;
  source: "lo_cat" | "dinh_muc";
};

export async function GET(req: NextRequest) {
  const loCatId   = req.nextUrl.searchParams.get("loCatId");
  const hangCatQS = req.nextUrl.searchParams.get("hangCat");
  const soSPQS    = req.nextUrl.searchParams.get("soSanPham");

  // ── Chế độ 2: chỉ hangCat + soSanPham (không cần lô cắt) ──────────────
  if (!loCatId && hangCatQS && soSPQS) {
    const soSanPham = parseFloat(soSPQS) || 0;
    const CHUNG_KEY = "__CHUNG__";

    const [dinhMucsProduct, dinhMucsChung, quyDoiRows] = await Promise.all([
      prisma.dinhMucNPL.findMany({
        where: { hangCat: hangCatQS },
        include: { vatTu: { include: { tonKho: true } } },
      }),
      prisma.dinhMucNPL.findMany({
        where: { hangCat: CHUNG_KEY },
        include: { vatTu: { include: { tonKho: true } } },
      }),
      prisma.chiTietNhapKho.findMany({
        select: { vatTuId: true, quyDoi: true },
        orderBy: { phieu: { ngay: "desc" } },
        distinct: ["vatTuId"],
      }),
    ]);
    const quyDoiMap = new Map(quyDoiRows.map(r => [r.vatTuId, r.quyDoi ?? 1]));

    // non-shared tickOnly cols: CHUNG row chỉ là "nguồn VatTu", không phải định mức thật
    const NON_SHARED_TICK_NHOMS = new Set(["giat_mau", "giat_vi_sinh"]);
    // Merge: product-specific takes priority; CHUNG fills gaps (phu_lieu only, not vai)
    const productVatTuIds = new Set(dinhMucsProduct.map(d => d.vatTuId));
    const merged = [
      ...dinhMucsProduct,
      ...dinhMucsChung.filter(d =>
        d.vatTu.loai !== "vai" &&
        !productVatTuIds.has(d.vatTuId) &&
        !NON_SHARED_TICK_NHOMS.has(d.vatTu.nhom ?? "")
      ),
    ];

    const rows: SuggestRow[] = merged.map(dm => {
      const haoHui = (dm as { haoHui?: number }).haoHui ?? 0;
      const heSoHao = 1 + haoHui / 100;
      const dmDonVi = (dm as { donViMua?: string }).donViMua ?? dm.vatTu.donVi;
      const haoNote = haoHui > 0 ? ` +${haoHui}% hao` : "";
      const soLuongBase = Math.round(dm.soLuong * soSanPham * heSoHao * 10000) / 10000;
      // giaTrungBinh lưu theo đvMua (kg), soLuong theo đvCơBản (m) → chia quyDoi
      const quyDoi = quyDoiMap.get(dm.vatTuId) ?? 1;
      const giaMua = dm.vatTu.tonKho?.giaTrungBinh ?? 0;
      const donGia = quyDoi > 1 ? Math.round(giaMua / quyDoi * 100) / 100 : giaMua;
      return {
        type: dm.vatTu.loai === "vai" ? "vai" : "phu_lieu",
        vatTuId: dm.vatTu.id,
        vatTu: dm.vatTu,
        soLuong: soLuongBase,
        donGia,
        ghiChu: `Định mức ${dm.soLuong}${dmDonVi}/sp × ${soSanPham}sp${haoNote}${dm.hangCat === CHUNG_KEY ? " (chung)" : ""}`,
        source: "dinh_muc",
      };
    });

    return NextResponse.json({
      lo: null,
      hangCat: hangCatQS,
      soSanPham,
      rows,
    });
  }

  // ── Chế độ 1: theo lô cắt ─────────────────────────────────────────────
  if (!loCatId) return NextResponse.json({ error: "Missing loCatId or (hangCat + soSanPham)" }, { status: 400 });

  const CHUNG_KEY = "__CHUNG__";
  const [lo, allDinhMucs, vatTus, quyDoiRows2] = await Promise.all([
    prisma.loCat.findUnique({ where: { id: loCatId } }),
    prisma.dinhMucNPL.findMany({ include: { vatTu: { include: { tonKho: true } } } }),
    prisma.vatTu.findMany({ include: { tonKho: true } }),
    prisma.chiTietNhapKho.findMany({
      select: { vatTuId: true, quyDoi: true },
      orderBy: { phieu: { ngay: "desc" } },
      distinct: ["vatTuId"],
    }),
  ]);
  const quyDoiMap2 = new Map(quyDoiRows2.map(r => [r.vatTuId, r.quyDoi ?? 1]));

  if (!lo) return NextResponse.json({ error: "Không tìm thấy lô" }, { status: 404 });

  const soSanPham = lo.hangThucTe ?? lo.soSanPham ?? 0;
  const rows: SuggestRow[] = [];

  // ── 1. Hàng VẢI: lấy từ số liệu thực tế của lô cắt ──────────────────
  const soMet = lo.soM ?? 0;
  if (soMet > 0) {
    const maVaiLower = (lo.maVai || "").toLowerCase().trim();
    const vatTuVai = maVaiLower
      ? vatTus.find(v =>
          v.loai === "vai" && (
            v.ma.toLowerCase() === maVaiLower ||
            v.ten.toLowerCase() === maVaiLower ||
            v.ma.toLowerCase().includes(maVaiLower) ||
            maVaiLower.includes(v.ma.toLowerCase()) ||
            v.ten.toLowerCase().includes(maVaiLower) ||
            maVaiLower.includes(v.ten.toLowerCase())
          )
        ) ?? null
      : null;

    const vaiQuyDoi = vatTuVai ? (quyDoiMap2.get(vatTuVai.id) ?? 1) : 1;
    const vaiGiaMua = vatTuVai?.tonKho?.giaTrungBinh ?? 0;
    const vaiDonGia = vaiQuyDoi > 1 ? Math.round(vaiGiaMua / vaiQuyDoi * 100) / 100 : vaiGiaMua;
    rows.push({
      type: "vai",
      vatTuId: vatTuVai?.id ?? null,
      vatTu: vatTuVai,
      maVai: lo.maVai ?? undefined,
      soLuong: soMet,
      donGia: vaiDonGia,
      ghiChu: `Vải lô: ${lo.maVai || "chưa ghi"}${lo.soCay > 1 ? ` (${lo.soCay} cây)` : ""}`,
      source: "lo_cat",
    });
  }

  // ── 2. PHỤ LIỆU: tính từ định mức × số SP (product-specific + CHUNG fallback) ──
  if (lo.hangCat && soSanPham > 0) {
    const dmProduct = allDinhMucs.filter(d => d.hangCat === lo.hangCat && d.vatTu.loai !== "vai");
    const dmChung   = allDinhMucs.filter(d => d.hangCat === CHUNG_KEY  && d.vatTu.loai !== "vai");

    // Product-specific takes priority; CHUNG fills gaps (exclude non-shared tickOnly sources)
    const NON_SHARED_TICK_NHOMS2 = new Set(["giat_mau", "giat_vi_sinh"]);
    const productVatTuIds = new Set(dmProduct.map(d => d.vatTuId));
    const dmMerged = [
      ...dmProduct,
      ...dmChung.filter(d =>
        !productVatTuIds.has(d.vatTuId) &&
        !NON_SHARED_TICK_NHOMS2.has(d.vatTu.nhom ?? "")
      ),
    ];

    for (const dm of dmMerged) {
      const haoHui = (dm as { haoHui?: number }).haoHui ?? 0;
      const heSoHao = 1 + haoHui / 100;
      const dmDonVi = (dm as { donViMua?: string }).donViMua ?? dm.vatTu.donVi;
      const haoNote = haoHui > 0 ? ` +${haoHui}% hao` : "";
      const soLuongBase = Math.round(dm.soLuong * soSanPham * heSoHao * 10000) / 10000;
      const quyDoi2 = quyDoiMap2.get(dm.vatTuId) ?? 1;
      const giaMua2 = dm.vatTu.tonKho?.giaTrungBinh ?? 0;
      const donGia2 = quyDoi2 > 1 ? Math.round(giaMua2 / quyDoi2 * 100) / 100 : giaMua2;
      rows.push({
        type: "phu_lieu",
        vatTuId: dm.vatTu.id,
        vatTu: dm.vatTu,
        soLuong: soLuongBase,
        donGia: donGia2,
        ghiChu: `Định mức ${dm.soLuong}${dmDonVi}/sp × ${soSanPham}sp${haoNote}${dm.hangCat === CHUNG_KEY ? " (chung)" : ""}`,
        source: "dinh_muc",
      });
    }
  }

  return NextResponse.json({
    lo: {
      id: lo.id, hangCat: lo.hangCat, maVai: lo.maVai,
      soM: lo.soM, soCay: lo.soCay,
      soSanPham: lo.soSanPham, hangThucTe: lo.hangThucTe,
      ngay: lo.ngay,
    },
    soSanPham,
    rows,
  });
}

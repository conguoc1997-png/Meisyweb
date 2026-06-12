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

    const [dinhMucsProduct, dinhMucsChung] = await Promise.all([
      prisma.dinhMucNPL.findMany({
        where: { hangCat: hangCatQS },
        include: { vatTu: { include: { tonKho: true } } },
      }),
      prisma.dinhMucNPL.findMany({
        where: { hangCat: CHUNG_KEY },
        include: { vatTu: { include: { tonKho: true } } },
      }),
    ]);

    // Merge: product-specific takes priority; CHUNG fills gaps (phu_lieu only, not vai)
    const productVatTuIds = new Set(dinhMucsProduct.map(d => d.vatTuId));
    const merged = [
      ...dinhMucsProduct,
      ...dinhMucsChung.filter(d => d.vatTu.loai !== "vai" && !productVatTuIds.has(d.vatTuId)),
    ];

    const rows: SuggestRow[] = merged.map(dm => {
      const haoHui = (dm as { haoHui?: number }).haoHui ?? 0;
      const heSoHao = 1 + haoHui / 100;
      const dmDonVi = (dm as { donViMua?: string }).donViMua ?? dm.vatTu.donVi;
      const haoNote = haoHui > 0 ? ` +${haoHui}% hao` : "";
      // Luôn lưu soLuong theo đơn vị cơ bản (donVi) để recalcVatTuIds tính đúng:
      // tồn(đvMua) = soLuongNhap(đvMua) - soLuongXuatBase(đvCơBản) / quyDoi
      const soLuongBase = Math.round(dm.soLuong * soSanPham * heSoHao * 10000) / 10000;
      return {
        type: dm.vatTu.loai === "vai" ? "vai" : "phu_lieu",
        vatTuId: dm.vatTu.id,
        vatTu: dm.vatTu,
        soLuong: soLuongBase,
        donGia: dm.vatTu.tonKho?.giaTrungBinh ?? 0,
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
  const [lo, allDinhMucs, vatTus] = await Promise.all([
    prisma.loCat.findUnique({ where: { id: loCatId } }),
    prisma.dinhMucNPL.findMany({ include: { vatTu: { include: { tonKho: true } } } }),
    prisma.vatTu.findMany({ include: { tonKho: true } }),
  ]);

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

    rows.push({
      type: "vai",
      vatTuId: vatTuVai?.id ?? null,
      vatTu: vatTuVai,
      maVai: lo.maVai ?? undefined,
      soLuong: soMet,
      donGia: vatTuVai?.tonKho?.giaTrungBinh ?? 0,
      ghiChu: `Vải lô: ${lo.maVai || "chưa ghi"}${lo.soCay > 1 ? ` (${lo.soCay} cây)` : ""}`,
      source: "lo_cat",
    });
  }

  // ── 2. PHỤ LIỆU: tính từ định mức × số SP (product-specific + CHUNG fallback) ──
  if (lo.hangCat && soSanPham > 0) {
    const dmProduct = allDinhMucs.filter(d => d.hangCat === lo.hangCat && d.vatTu.loai !== "vai");
    const dmChung   = allDinhMucs.filter(d => d.hangCat === CHUNG_KEY  && d.vatTu.loai !== "vai");

    // Product-specific takes priority; CHUNG fills gaps
    const productVatTuIds = new Set(dmProduct.map(d => d.vatTuId));
    const dmMerged = [
      ...dmProduct,
      ...dmChung.filter(d => !productVatTuIds.has(d.vatTuId)),
    ];

    for (const dm of dmMerged) {
      const haoHui = (dm as { haoHui?: number }).haoHui ?? 0;
      const heSoHao = 1 + haoHui / 100;
      const dmDonVi = (dm as { donViMua?: string }).donViMua ?? dm.vatTu.donVi;
      const haoNote = haoHui > 0 ? ` +${haoHui}% hao` : "";
      // Lưu soLuong theo đơn vị cơ bản để recalcVatTuIds tính đúng tồn kho
      const soLuongBase = Math.round(dm.soLuong * soSanPham * heSoHao * 10000) / 10000;
      rows.push({
        type: "phu_lieu",
        vatTuId: dm.vatTu.id,
        vatTu: dm.vatTu,
        soLuong: soLuongBase,
        donGia: dm.vatTu.tonKho?.giaTrungBinh ?? 0,
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

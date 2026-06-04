export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const loCatId = req.nextUrl.searchParams.get("loCatId");
  if (!loCatId) return NextResponse.json({ error: "Missing loCatId" }, { status: 400 });

  const [lo, dinhMucs, vatTus] = await Promise.all([
    prisma.loCat.findUnique({ where: { id: loCatId } }),
    prisma.dinhMucNPL.findMany({ include: { vatTu: { include: { tonKho: true } } } }),
    prisma.vatTu.findMany({ include: { tonKho: true } }),
  ]);

  if (!lo) return NextResponse.json({ error: "Không tìm thấy lô" }, { status: 404 });

  const soSanPham = lo.hangThucTe ?? lo.soSanPham ?? 0;
  const rows: {
    type: "vai" | "phu_lieu";
    vatTuId: string | null;
    vatTu: (typeof vatTus)[0] | null;
    maVai?: string;
    soLuong: number;
    donGia: number;
    ghiChu: string;
    source: "lo_cat" | "dinh_muc";
  }[] = [];

  // ── 1. Hàng VẢI: lấy từ số liệu thực tế của lô cắt ──────────────────
  const soMet = lo.soM ?? 0;
  if (soMet > 0) {
    // Tìm VatTu khớp với maVai (match mềm: theo ma hoặc ten)
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

  // ── 2. PHỤ LIỆU: tính từ định mức × số SP ────────────────────────────
  if (lo.hangCat && soSanPham > 0) {
    const dmHang = dinhMucs.filter(d => d.hangCat === lo.hangCat);
    for (const dm of dmHang) {
      const soLuong = Math.round(dm.soLuong * soSanPham / 100 * 100) / 100;
      rows.push({
        type: "phu_lieu",
        vatTuId: dm.vatTu.id,
        vatTu: dm.vatTu,
        soLuong,
        donGia: dm.vatTu.tonKho?.giaTrungBinh ?? 0,
        ghiChu: `Định mức ${dm.soLuong}/${100}sp × ${soSanPham}sp`,
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

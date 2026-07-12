export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── In-memory cache: 60 giây, tránh gọi DB liên tục khi user reload ──
let _cache: { data: object; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60s

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loai    = searchParams.get("loai");
    const nhom    = searchParams.get("nhom");
    const noCache = searchParams.get("_t") !== null; // ?_t=... → bỏ qua cache

    // ── Trả cache nếu còn hạn và không có filter động ──
    if (!noCache && !loai && !nhom && _cache && Date.now() - _cache.ts < CACHE_TTL) {
      return NextResponse.json(_cache.data);
    }

    // ── 1 query duy nhất — VatTu đã có donViMua + quyDoi sẵn ──
    // Bỏ 2 query cũ: chiTietNhapKho (join PhieuNhapKho, distinct) + quyDoiDonVi
    const items = await prisma.tonKhoVatTu.findMany({
      where: {
        vatTu: {
          active: true,
          ...(loai && { loai }),
          ...(nhom && { nhom }),
        },
      },
      include: {
        vatTu: {
          select: {
            id: true, ma: true, ten: true, loai: true,
            nhom: true, donVi: true, donViMua: true,
            quyDoi: true, ghiChu: true,
          },
        },
      },
      orderBy: [
        { vatTu: { loai: "asc" } },
        { vatTu: { nhom: "asc" } },
        { vatTu: { ten: "asc" } },
      ],
    });

    const result = items.map(t => {
      const donViMua    = t.vatTu.donViMua || t.vatTu.donVi;
      const quyDoi      = t.vatTu.quyDoi   ?? 1;
      // donViQuyDoi = đơn vị tồn kho cơ bản (donVi trên VatTu)
      // Fallback: vải → "m", còn lại dùng donVi
      const donViQuyDoi = t.vatTu.donVi
        || (t.vatTu.loai === "vai" ? "m" : "cai");

      return {
        id:            t.id,
        vatTuId:       t.vatTuId,
        soLuong:       t.soLuong,
        giaTrungBinh:  t.giaTrungBinh,
        giaTriTon:     t.giaTriTon,
        updatedAt:     t.updatedAt,
        donViMua,
        quyDoi,
        donViQuyDoi,
        soLuongQD:     t.soLuong * quyDoi,
        vatTu:         t.vatTu,
      };
    });

    // Lưu cache chỉ khi không có filter
    if (!loai && !nhom) {
      _cache = { data: result, ts: Date.now() };
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("[ton-kho GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

// Invalidate cache khi có thay đổi (gọi từ nhập-kho, xuất-kho, recalc)
export function invalidateCache() {
  _cache = null;
}

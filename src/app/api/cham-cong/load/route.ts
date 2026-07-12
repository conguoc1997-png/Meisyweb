export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cham-cong/load?thang=2026-07&h=1
 * Trả về NV + ChamCong tháng + PhuCap tháng trong 1 request duy nhất
 * h=1 → include luongCBHistory (cho tab bảng lương)
 */
export async function GET(req: NextRequest) {
  try {
    const url   = new URL(req.url);
    const thang = url.searchParams.get("thang");
    const withHistory = url.searchParams.get("h") === "1";
    const skipNV = url.searchParams.get("nv") === "0"; // ?nv=0 → bỏ qua query NV (đổi tháng nhanh)

    // Ngày đầu tháng để lọc NV nghỉ việc
    const monthStart = thang ? `${thang}-01` : null;

    // CC + PhuCap luôn chạy; NV chỉ chạy khi skipNV=false
    const ccPromise = thang ? (async () => {
      const [y, m] = thang.split("-").map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1));
      const end   = new Date(Date.UTC(y, m, 1));
      return prisma.$queryRawUnsafe<object[]>(
        `SELECT "id","nhanVienId","ngay","trangThai","tangCa","ghiChu","gioVao","gioRa","tongGio"
         FROM "ChamCong" WHERE "ngay" >= $1 AND "ngay" < $2`,
        start, end
      ).catch((e) => { console.error("CC query error:", e); return []; });
    })() : Promise.resolve([]);

    const pcPromise = thang
      ? prisma.phuCapThang.findMany({ where: { thang } }).catch(() => [])
      : Promise.resolve([]);

    if (skipNV) {
      // Chế độ nhanh: chỉ CC + PhuCap
      const [ccRows, phuCapRows] = await Promise.all([ccPromise, pcPromise]);
      const phuCapMap: Record<string, { phuCapCC: number; phuCapAn: number; phuCapDB: number }> = {};
      for (const r of phuCapRows) {
        phuCapMap[r.nhanVienId] = { phuCapCC: r.phuCapCC, phuCapAn: r.phuCapAn, phuCapDB: r.phuCapDB };
      }
      return NextResponse.json({ chamCongs: ccRows, phuCaps: phuCapMap });
    }

    // Chế độ đầy đủ: NV + CC + PhuCap + LichDiLam song song
    const [y2, m2] = thang ? thang.split("-").map(Number) : [0, 0];
    const lichStart = thang ? new Date(Date.UTC(y2, m2 - 1, 1)) : null;
    const lichEnd   = thang ? new Date(Date.UTC(y2, m2, 1))     : null;

    const [nvPrisma, nvExtraRaw, ccRows, phuCapRows, lichRows] = await Promise.all([
      prisma.nhanVien.findMany({
        orderBy: { ten: "asc" },
        ...(withHistory ? { include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } } } : {}),
      }),
      prisma.$queryRawUnsafe<{ id: string; ngayNghiViec: string | null; caLamViecId: string | null }[]>(
        `SELECT "id","ngayNghiViec","caLamViecId" FROM "NhanVien"`
      ).catch(() => null),
      ccPromise,
      pcPromise,
      // Lịch làm việc (gioVao/gioRa thực tế từng ngày) — dùng cho hover card
      lichStart && lichEnd
        ? prisma.$queryRawUnsafe<{ nhanVienId: string; ngay: Date; gioVao: string | null; gioRa: string | null; ca: string | null }[]>(
            `SELECT "nhanVienId","ngay","gioVao","gioRa","ca" FROM "LichDiLam"
             WHERE "ngay" >= $1 AND "ngay" < $2 AND "loai" = 'dang_ky' AND "trangThai" IN ('da_duyet','di_lam')`,
            lichStart, lichEnd
          ).catch(() => [] as { nhanVienId: string; ngay: Date; gioVao: string | null; gioRa: string | null; ca: string | null }[])
        : Promise.resolve([] as { nhanVienId: string; ngay: Date; gioVao: string | null; gioRa: string | null; ca: string | null }[]),
    ]);

    const nvExtra = nvExtraRaw ?? [];
    const nghiColExists = nvExtraRaw !== null;
    const nghiMap = Object.fromEntries(nvExtra.map(r => [r.id, r.ngayNghiViec ?? null]));

    // Map lịch: "nvId_YYYY-MM-DD" → { gioVao, gioRa, ca }
    const lichMap: Record<string, { gioVao: string | null; gioRa: string | null; ca: string | null }> = {};
    for (const r of lichRows) {
      const ngayStr = (r.ngay instanceof Date ? r.ngay : new Date(r.ngay)).toISOString().slice(0, 10);
      lichMap[`${r.nhanVienId}_${ngayStr}`] = { gioVao: r.gioVao, gioRa: r.gioRa, ca: r.ca };
    }

    const nhanViens = nvPrisma
      .map(nv => ({ ...nv, ngayNghiViec: nghiMap[nv.id] ?? null }))
      .filter(nv => {
        if (nv.active) return true;
        if (!nghiColExists) return false;
        if (!monthStart) return false;
        return nv.ngayNghiViec != null && nv.ngayNghiViec >= monthStart;
      });

    const phuCapMap: Record<string, { phuCapCC: number; phuCapAn: number; phuCapDB: number }> = {};
    for (const r of phuCapRows) {
      phuCapMap[r.nhanVienId] = { phuCapCC: r.phuCapCC, phuCapAn: r.phuCapAn, phuCapDB: r.phuCapDB };
    }

    return NextResponse.json({ nhanViens, chamCongs: ccRows, phuCaps: phuCapMap, lichMap });
  } catch (e) {
    console.error("GET /api/cham-cong/load error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

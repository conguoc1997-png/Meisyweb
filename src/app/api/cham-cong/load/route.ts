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

    // Chế độ đầy đủ: NV + CC + PhuCap song song
    const [nvPrisma, nvExtraRaw, ccRows, phuCapRows] = await Promise.all([
      prisma.nhanVien.findMany({
        orderBy: { ten: "asc" },
        ...(withHistory ? { include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } } } : {}),
      }),
      prisma.$queryRawUnsafe<{ id: string; ngayNghiViec: string | null }[]>(
        `SELECT "id","ngayNghiViec" FROM "NhanVien"`
      ).catch(() => null),
      ccPromise,
      pcPromise,
    ]);

    const nvExtra = nvExtraRaw ?? [];
    const nghiColExists = nvExtraRaw !== null;
    const nghiMap = Object.fromEntries(nvExtra.map(r => [r.id, r.ngayNghiViec ?? null]));
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

    return NextResponse.json({ nhanViens, chamCongs: ccRows, phuCaps: phuCapMap });
  } catch (e) {
    console.error("GET /api/cham-cong/load error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

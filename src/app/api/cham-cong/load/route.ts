export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Chỉ thêm các cột KHÔNG có trong Prisma schema — chạy 1 lần per cold-start
let migrated = false;
async function ensureColumns() {
  if (migrated) return;
  await Promise.all([
    prisma.$executeRawUnsafe(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "tongGio" DOUBLE PRECISION`).catch(() => {}),
  ]);
  migrated = true;
}

/**
 * GET /api/cham-cong/load?thang=2026-07&h=1
 * Trả về NV + ChamCong tháng + PhuCap tháng trong 1 request duy nhất
 * h=1 → include luongCBHistory (cho tab bảng lương)
 */
export async function GET(req: NextRequest) {
  try {
    await ensureColumns();
    const url   = new URL(req.url);
    const thang = url.searchParams.get("thang");
    const withHistory = url.searchParams.get("h") === "1";

    // Chạy song song: NV + CC + PhuCap
    const [nhanViens, ccRows, phuCapRows] = await Promise.all([
      // 1. Nhân viên
      prisma.nhanVien.findMany({
        where: { active: true },
        orderBy: { ten: "asc" },
        ...(withHistory ? { include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } } } : {}),
      }),

      // 2. Chấm công tháng — dùng raw SQL để lấy cả gioVao/gioRa
      thang ? (async () => {
        const [y, m] = thang.split("-").map(Number);
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end   = new Date(Date.UTC(y, m, 1));
        return prisma.$queryRawUnsafe<object[]>(
          `SELECT "id","nhanVienId","ngay","trangThai","tangCa","ghiChu","gioVao","gioRa","tongGio"
           FROM "ChamCong" WHERE "ngay" >= $1 AND "ngay" < $2`,
          start, end
        ).catch((e) => { console.error("CC query error:", e); return []; });
      })() : Promise.resolve([]),

      // 3. Phụ cấp tháng
      thang
        ? prisma.phuCapThang.findMany({ where: { thang } }).catch(() => [])
        : Promise.resolve([]),
    ]);

    // Chuyển phuCap thành map { [nvId]: {...} }
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

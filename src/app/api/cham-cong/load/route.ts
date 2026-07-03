export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let migrated = false;
async function run(sql: string) {
  try { await prisma.$executeRawUnsafe(sql); } catch { /* ignore */ }
}
async function autoMigrate() {
  if (migrated) return;
  await Promise.all([
    run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "soChNhatHopDong" INTEGER NOT NULL DEFAULT 0`),
    run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "caLamViecId" TEXT`),
    run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "luongGio" DOUBLE PRECISION`),
    run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`),
    run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`),
    run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "tongGio" DOUBLE PRECISION`),
    run(`CREATE TABLE IF NOT EXISTS "PhuCapThang" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "nhanVienId" TEXT NOT NULL,
      "thang" TEXT NOT NULL,
      "phuCapCC" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "phuCapAn" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "phuCapDB" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PhuCapThang_nhanVienId_thang_key" UNIQUE ("nhanVienId","thang")
    )`),
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
    await autoMigrate();
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

      // 2. Chấm công tháng
      thang ? (async () => {
        const [y, m] = thang.split("-").map(Number);
        return prisma.chamCong.findMany({
          where: { ngay: { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) } },
        });
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

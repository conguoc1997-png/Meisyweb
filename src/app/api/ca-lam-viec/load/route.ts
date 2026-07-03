export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let migrated = false;
async function run(sql: string) {
  try { await prisma.$executeRawUnsafe(sql); } catch { /* ignore */ }
}
async function autoMigrate() {
  if (migrated) return;
  await Promise.all([
    run(`CREATE TABLE IF NOT EXISTS "CaLamViec" (
      "id" TEXT NOT NULL, "ten" TEXT NOT NULL,
      "gioVao" TEXT NOT NULL DEFAULT '07:30', "gioRa" TEXT NOT NULL DEFAULT '17:30',
      "nghiTrua" INTEGER NOT NULL DEFAULT 90, "ghiChu" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("id")
    )`),
    run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "caLamViecId" TEXT`),
    run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "luongGio" DOUBLE PRECISION`),
  ]);
  migrated = true;
}

// GET /api/ca-lam-viec/load — trả CaLamViec + NhanVien trong 1 request
export async function GET() {
  try {
    await autoMigrate();
    const [caList, nvList] = await Promise.all([
      prisma.$queryRawUnsafe<object[]>(`SELECT * FROM "CaLamViec" ORDER BY "ten" ASC`),
      prisma.nhanVien.findMany({
        where: { active: true },
        select: { id: true, ten: true, maNV: true, phongBan: true, caLamViecId: true },
        orderBy: { ten: "asc" },
      }).catch(() => []),
    ]);
    return NextResponse.json({ caList, nvList });
  } catch (e) {
    console.error("GET /api/ca-lam-viec/load error:", e);
    return NextResponse.json({ error: String(e), caList: [], nvList: [] }, { status: 500 });
  }
}

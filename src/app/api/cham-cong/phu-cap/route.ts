export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Auto-migrate
let migrated = false;
async function autoMigrate() {
  if (migrated) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PhuCapThang" (
        "id"         TEXT NOT NULL PRIMARY KEY,
        "nhanVienId" TEXT NOT NULL,
        "thang"      TEXT NOT NULL,
        "phuCapCC"   DOUBLE PRECISION NOT NULL DEFAULT 0,
        "phuCapAn"   DOUBLE PRECISION NOT NULL DEFAULT 0,
        "phuCapDB"   DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PhuCapThang_nhanVienId_fkey"
          FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE CASCADE,
        CONSTRAINT "PhuCapThang_nhanVienId_thang_key"
          UNIQUE ("nhanVienId", "thang")
      )
    `);
  } catch { /* table already exists */ }
  migrated = true;
}

// GET /api/cham-cong/phu-cap?thang=2026-01
// Trả về { [nhanVienId]: { phuCapCC, phuCapAn, phuCapDB } }
export async function GET(req: NextRequest) {
  await autoMigrate();
  const thang = new URL(req.url).searchParams.get("thang");
  if (!thang) return NextResponse.json({});

  try {
    const rows = await prisma.phuCapThang.findMany({ where: { thang } });
    const map: Record<string, { phuCapCC: number; phuCapAn: number; phuCapDB: number }> = {};
    rows.forEach(r => { map[r.nhanVienId] = { phuCapCC: r.phuCapCC, phuCapAn: r.phuCapAn, phuCapDB: r.phuCapDB }; });
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({});
  }
}

// POST /api/cham-cong/phu-cap
// Body: { nhanVienId, thang, phuCapCC, phuCapAn, phuCapDB }
export async function POST(req: NextRequest) {
  await autoMigrate();
  const { nhanVienId, thang, phuCapCC, phuCapAn, phuCapDB } = await req.json();
  if (!nhanVienId || !thang) return NextResponse.json({ error: "Thiếu nhanVienId hoặc thang" }, { status: 400 });

  try {
    const record = await prisma.phuCapThang.upsert({
      where: { nhanVienId_thang: { nhanVienId, thang } },
      update: {
        phuCapCC: Number(phuCapCC) || 0,
        phuCapAn: Number(phuCapAn) || 0,
        phuCapDB: Number(phuCapDB) || 0,
      },
      create: {
        id: `${nhanVienId}_${thang}`,
        nhanVienId, thang,
        phuCapCC: Number(phuCapCC) || 0,
        phuCapAn: Number(phuCapAn) || 0,
        phuCapDB: Number(phuCapDB) || 0,
      },
    });
    return NextResponse.json(record);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi" }, { status: 500 });
  }
}

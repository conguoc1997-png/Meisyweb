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
  // Thêm cột heSoTC nếu chưa có
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "PhuCapThang" ADD COLUMN IF NOT EXISTS "heSoTC" DOUBLE PRECISION`);
  } catch { /* ignore */ }
  migrated = true;
}

// GET /api/cham-cong/phu-cap?thang=2026-01
// Trả về { [nhanVienId]: { phuCapCC, phuCapAn, phuCapDB } }
export async function GET(req: NextRequest) {
  await autoMigrate();
  const thang = new URL(req.url).searchParams.get("thang");
  if (!thang) return NextResponse.json({});

  try {
    const rows = await prisma.$queryRawUnsafe<Array<{nhanVienId:string;phuCapCC:number;phuCapAn:number;phuCapDB:number;heSoTC:number|null}>>(
      `SELECT "nhanVienId","phuCapCC","phuCapAn","phuCapDB","heSoTC" FROM "PhuCapThang" WHERE "thang"=$1`, thang
    );
    const map: Record<string, { phuCapCC: number; phuCapAn: number; phuCapDB: number; heSoTC: number | null }> = {};
    rows.forEach(r => { map[r.nhanVienId] = { phuCapCC: r.phuCapCC, phuCapAn: r.phuCapAn, phuCapDB: r.phuCapDB, heSoTC: r.heSoTC }; });
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({});
  }
}

// POST /api/cham-cong/phu-cap
// Body: { nhanVienId, thang, phuCapCC, phuCapAn, phuCapDB }
export async function POST(req: NextRequest) {
  await autoMigrate();
  const { nhanVienId, thang, phuCapCC, phuCapAn, phuCapDB, heSoTC } = await req.json();
  if (!nhanVienId || !thang) return NextResponse.json({ error: "Thiếu nhanVienId hoặc thang" }, { status: 400 });

  try {
    // Dùng raw SQL để tránh Prisma client chưa có cột heSoTC
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PhuCapThang" ("id","nhanVienId","thang","phuCapCC","phuCapAn","phuCapDB","heSoTC","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
       ON CONFLICT ("nhanVienId","thang") DO UPDATE SET
         "phuCapCC"=$4, "phuCapAn"=$5, "phuCapDB"=$6, "heSoTC"=$7, "updatedAt"=NOW()`,
      `${nhanVienId}_${thang}`, nhanVienId, thang,
      Number(phuCapCC) || 0, Number(phuCapAn) || 0, Number(phuCapDB) || 0,
      heSoTC !== undefined && heSoTC !== null ? Number(heSoTC) : null
    );
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi" }, { status: 500 });
  }
}

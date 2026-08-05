export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* Tự tạo bảng VaiLog nếu chưa có */
async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "VaiLog" (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "vaiTonId"  TEXT NOT NULL,
      "maVai"     TEXT NOT NULL,
      "mauSac"    TEXT,
      "xuong"     TEXT,
      "donVi"     TEXT NOT NULL DEFAULT 'm',
      "loai"      TEXT NOT NULL,        -- 'nhap' | 'xuat' | 'dieu_chinh'
      "soMet"     FLOAT NOT NULL,       -- > 0 nhập, < 0 xuất
      "soMetTruoc" FLOAT,
      "soMetSau"   FLOAT,
      "nguon"     TEXT,                 -- 'them_moi' | 'cong_vao' | 'cat' | 'hoan_tac' | 'dieu_chinh' | 'xuat_kho'
      "ghiChu"    TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "VaiLog_vaiTonId_idx" ON "VaiLog"("vaiTonId")`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "VaiLog_createdAt_idx" ON "VaiLog"("createdAt" DESC)`
  );
}

/**
 * GET /api/san-xuat/vai-log?vaiTonId=xxx  → lịch sử 1 mã
 * GET /api/san-xuat/vai-log               → 200 gần nhất (tất cả)
 */
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const url       = new URL(req.url);
    const vaiTonId  = url.searchParams.get("vaiTonId");
    const limit     = parseInt(url.searchParams.get("limit") ?? "200");

    const rows = vaiTonId
      ? await prisma.$queryRawUnsafe<object[]>(
          `SELECT * FROM "VaiLog" WHERE "vaiTonId"=$1 ORDER BY "createdAt" DESC LIMIT $2`,
          vaiTonId, limit
        )
      : await prisma.$queryRawUnsafe<object[]>(
          `SELECT * FROM "VaiLog" ORDER BY "createdAt" DESC LIMIT $1`, limit
        );

    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/**
 * POST /api/san-xuat/vai-log
 * Body: { vaiTonId, maVai, mauSac, xuong, donVi, loai, soMet, soMetTruoc, soMetSau, nguon, ghiChu }
 */
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const b = await req.json();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "VaiLog"("vaiTonId","maVai","mauSac","xuong","donVi","loai","soMet","soMetTruoc","soMetSau","nguon","ghiChu")
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      b.vaiTonId, b.maVai, b.mauSac ?? null, b.xuong ?? null, b.donVi ?? "m",
      b.loai, b.soMet, b.soMetTruoc ?? null, b.soMetSau ?? null,
      b.nguon ?? null, b.ghiChu ?? null
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tạo bảng settings nếu chưa có
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  tableReady = true;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_AppSettings" (
      "key"   TEXT NOT NULL PRIMARY KEY,
      "value" TEXT NOT NULL DEFAULT ''
    )
  `).catch(() => {});
}

// GET /api/cham-cong/lock?thang=2026-07
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const thang = req.nextUrl.searchParams.get("thang") ?? "";
    const key   = `cc_locked_${thang}`;
    const rows  = await prisma.$queryRawUnsafe<{ value: string }[]>(
      `SELECT value FROM "_AppSettings" WHERE key = $1`, key
    );
    const locked = rows[0]?.value === "1";
    return NextResponse.json({ locked });
  } catch {
    return NextResponse.json({ locked: false });
  }
}

// PUT /api/cham-cong/lock  body: { thang, locked: bool }
export async function PUT(req: NextRequest) {
  try {
    await ensureTable();
    const { thang, locked } = await req.json();
    if (!thang) return NextResponse.json({ error: "Thiếu thang" }, { status: 400 });
    const key = `cc_locked_${thang}`;
    const val = locked ? "1" : "0";
    await prisma.$executeRawUnsafe(
      `INSERT INTO "_AppSettings" (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      key, val
    );
    return NextResponse.json({ ok: true, locked });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

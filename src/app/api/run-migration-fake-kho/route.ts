export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];

  async function run(label: string, sql: string) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push(`✅ ${label}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists") || msg.includes("duplicate column")) {
        results.push(`⏭ ${label} (already exists)`);
      } else {
        results.push(`❌ ${label}: ${msg}`);
      }
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push("✅ DB connection OK");
  } catch (e: unknown) {
    results.push(`❌ DB connection FAILED: ${e instanceof Error ? e.message : String(e)}`);
    return NextResponse.json({ ok: false, results });
  }

  await run("FakeKho: add size", `ALTER TABLE "FakeKho" ADD COLUMN IF NOT EXISTS "size" TEXT`);

  await run("CREATE TABLE FakeKho", `
    CREATE TABLE IF NOT EXISTS "FakeKho" (
      "id"            TEXT NOT NULL,
      "sku"           TEXT NOT NULL,
      "tenSanPham"    TEXT,
      "sanPhamId"     TEXT,
      "ngayNhap"      TIMESTAMP(3) NOT NULL,
      "soLuongNhap"   INTEGER NOT NULL DEFAULT 0,
      "ngayRaHang"    TIMESTAMP(3),
      "soLuongRa"     INTEGER NOT NULL DEFAULT 0,
      "ghiChu"        TEXT,
      "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "FakeKho_pkey" PRIMARY KEY ("id")
    )
  `);

  // Verify
  try {
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'FakeKho' AND column_name IN ('id','sku','soLuongNhap','soLuongRa')
      ORDER BY column_name
    `;
    results.push(`✅ Verify: FakeKho có ${cols.length}/4 cột chính`);
  } catch (e: unknown) {
    results.push(`⚠ Verify failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  const ok = results.every(r => !r.startsWith("❌"));
  return NextResponse.json({ ok, results });
}

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

  // ── VaiTon: thêm cột NCC ──
  await run("VaiTon: add tenNCC",         `ALTER TABLE "VaiTon" ADD COLUMN IF NOT EXISTS "tenNCC" TEXT`);
  await run("VaiTon: add soHoaDon",       `ALTER TABLE "VaiTon" ADD COLUMN IF NOT EXISTS "soHoaDon" TEXT`);
  await run("VaiTon: add chiPhiThucNhap", `ALTER TABLE "VaiTon" ADD COLUMN IF NOT EXISTS "chiPhiThucNhap" DOUBLE PRECISION`);
  await run("VaiTon: add soTienHoaDon",   `ALTER TABLE "VaiTon" ADD COLUMN IF NOT EXISTS "soTienHoaDon" DOUBLE PRECISION`);
  await run("VaiTon: add vatPct",         `ALTER TABLE "VaiTon" ADD COLUMN IF NOT EXISTS "vatPct" DOUBLE PRECISION`);
  await run("VaiTon: add tinhNoTheo",     `ALTER TABLE "VaiTon" ADD COLUMN IF NOT EXISTS "tinhNoTheo" TEXT NOT NULL DEFAULT 'thuc_te'`);
  await run("VaiTon: add congNoNccId",    `ALTER TABLE "VaiTon" ADD COLUMN IF NOT EXISTS "congNoNccId" TEXT`);

  // ── NhaCungCap: tạo bảng ──
  await run("CREATE TABLE NhaCungCap", `
    CREATE TABLE IF NOT EXISTS "NhaCungCap" (
      "id"        TEXT NOT NULL,
      "ma"        TEXT NOT NULL,
      "ten"       TEXT NOT NULL,
      "sdt"       TEXT,
      "diaChi"    TEXT,
      "email"     TEXT,
      "ghiChu"    TEXT,
      "active"    BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "NhaCungCap_pkey" PRIMARY KEY ("id")
    )
  `);
  await run("NhaCungCap: unique ma", `CREATE UNIQUE INDEX IF NOT EXISTS "NhaCungCap_ma_key" ON "NhaCungCap"("ma")`);

  return NextResponse.json({ ok: true, results });
}

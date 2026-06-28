export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];
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
    results.push("✅ Tạo bảng PhuCapThang OK");
  } catch (e: unknown) {
    results.push(`❌ ${e instanceof Error ? e.message : String(e)}`);
  }
  // Verify
  try {
    const cols = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_name = 'PhuCapThang'
    `;
    results.push(cols.length > 0 ? "✅ Verify: bảng PhuCapThang tồn tại" : "❌ Verify: không tìm thấy");
  } catch { results.push("⚠ Verify failed"); }
  return NextResponse.json({ ok: results.every(r => !r.startsWith("❌")), results });
}

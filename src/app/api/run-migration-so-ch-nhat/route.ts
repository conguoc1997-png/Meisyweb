export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "soChNhatHopDong" INTEGER NOT NULL DEFAULT 0`
    );
    results.push("✅ NhanVien: add soChNhatHopDong OK");
  } catch (e: unknown) {
    results.push(`❌ ${e instanceof Error ? e.message : String(e)}`);
  }
  // Verify
  try {
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'NhanVien' AND column_name = 'soChNhatHopDong'
    `;
    results.push(cols.length > 0 ? "✅ Verify: cột soChNhatHopDong đã có" : "❌ Verify: KHÔNG tìm thấy cột soChNhatHopDong");
  } catch { results.push("⚠ Verify failed"); }
  return NextResponse.json({ ok: results.every(r => !r.startsWith("❌")), results });
}

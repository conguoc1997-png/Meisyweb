export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "FakeKho" ADD COLUMN IF NOT EXISTS "size" TEXT`);
    results.push("✅ FakeKho: add size OK");
  } catch (e: unknown) {
    results.push(`❌ ${e instanceof Error ? e.message : String(e)}`);
  }
  // Verify
  try {
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'FakeKho' AND column_name = 'size'
    `;
    results.push(cols.length > 0 ? "✅ Verify: cột size đã có" : "❌ Verify: KHÔNG tìm thấy cột size");
  } catch { results.push("⚠ Verify failed"); }
  return NextResponse.json({ ok: results.every(r => !r.startsWith("❌")), results });
}

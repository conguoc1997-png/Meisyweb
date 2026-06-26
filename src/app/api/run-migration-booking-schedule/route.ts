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

  await run(
    "KOCBooking: add ngayRaHang",
    `ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "ngayRaHang" TIMESTAMP(3)`
  );

  // Verify
  try {
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'KOCBooking' AND column_name = 'ngayRaHang'
    `;
    results.push(`✅ Verify: KOCBooking.ngayRaHang = ${cols.length > 0 ? "OK" : "MISSING"}`);
  } catch (e: unknown) {
    results.push(`⚠ Verify failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  const ok = results.every(r => !r.startsWith("❌"));
  return NextResponse.json({ ok, results });
}

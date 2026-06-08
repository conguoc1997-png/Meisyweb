export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "DinhMucNPL" ADD COLUMN IF NOT EXISTS "haoHui" FLOAT NOT NULL DEFAULT 0`
    );
    return NextResponse.json({ ok: true, message: "Column haoHui added (or already exists)" });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

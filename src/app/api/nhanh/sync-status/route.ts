export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse> {
  const row = await prisma.appSettings.findUnique({ where: { key: "nhanh_last_sync" } });
  return NextResponse.json({ lastSync: row?.value ?? null });
}

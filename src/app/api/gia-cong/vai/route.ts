export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const KEY = "gia_cong_vai";

export async function GET() {
  const row = await prisma.appSettings.findUnique({ where: { key: KEY } });
  const data: { ma: string; giaMet: number }[] = row ? JSON.parse(row.value) : [];
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  await prisma.appSettings.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(data) },
    create: { key: KEY, value: JSON.stringify(data) },
  });
  return NextResponse.json({ ok: true });
}

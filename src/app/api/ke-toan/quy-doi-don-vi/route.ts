export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.quyDoiDonVi.findMany({ orderBy: { tuDonVi: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await prisma.quyDoiDonVi.create({
      data: {
        tuDonVi: body.tuDonVi,
        veDonVi: body.veDonVi,
        heSo: body.heSo,
        ghiChu: body.ghiChu || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
